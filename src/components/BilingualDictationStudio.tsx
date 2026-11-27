"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BookOpen,
  Headphones,
  Volume2,
  Play,
  Square,
  Plus,
  Check,
  Eye,
  EyeOff,
  Lightbulb,
  Flame,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import {
  BilingualStory,
  BilingualStoryLine,
  DictationEvaluationResult,
  evaluateDictationInput,
  getStoriesByLanguage,
} from "@/lib/bilingual-stories";
import { HoverableSentence } from "@/components/HoverWordTooltip";
import { speakText } from "@/lib/speech";
import {
  playCelebrationFanfare,
  playErrorTone,
  playSuccessChime,
  playTileClick,
} from "@/lib/sound-effects";

interface BilingualDictationStudioProps {
  userId: string;
  languageCode: LanguageCode;
  allCards: VocabCard[];
  onSaveVocabCard: (card: VocabCard) => void;
}

type StudioMode = "reader" | "dictation";

function buildMaskedHint(sentence: string): string {
  const isCjk =
    /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(sentence) &&
    sentence.trim().split(/\s+/).length <= 2;

  if (isCjk) {
    const chars = Array.from(sentence);
    return chars
      .map((ch, idx) => {
        if (/[.,!?;:。！？，、\s]/.test(ch)) return ch;
        return idx % 3 === 0 ? ch : "□";
      })
      .join("");
  }

  return sentence
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word;
      const first = word[0];
      const punctuationMatch = word.match(/[.,!?;:]+$/);
      const trailingPunct = punctuationMatch ? punctuationMatch[0] : "";
      const coreLength = Math.max(1, word.length - 1 - trailingPunct.length);
      return `${first}${"•".repeat(Math.min(coreLength, 5))}${trailingPunct}`;
    })
    .join(" ");
}

export default function BilingualDictationStudio({
  userId,
  languageCode,
  allCards,
  onSaveVocabCard,
}: BilingualDictationStudioProps) {
  const stories = useMemo(
    () => getStoriesByLanguage(languageCode),
    [languageCode]
  );

  const [mode, setMode] = useState<StudioMode>("reader");
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    stories[0]?.id ?? ""
  );

  // Reader states
  const [showPhonetics, setShowPhonetics] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeAudioLineIdx, setActiveAudioLineIdx] = useState<number | null>(
    null
  );
  const [sessionSavedTerms, setSessionSavedTerms] = useState<Set<string>>(
    () => new Set()
  );

  // Dictation states
  const [dictationIndex, setDictationIndex] = useState<number>(0);
  const [dictationInput, setDictationInput] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [evaluation, setEvaluation] =
    useState<DictationEvaluationResult | null>(null);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [lineScores, setLineScores] = useState<Record<number, number>>({});
  const [isDictationFinished, setIsDictationFinished] =
    useState<boolean>(false);
  const [shakeFeedback, setShakeFeedback] = useState<boolean>(false);

  const playAllSessionRef = useRef<number>(0);
  const dictationTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeStory: BilingualStory | undefined = useMemo(() => {
    return (
      stories.find((s) => s.id === selectedStoryId) ?? stories[0] ?? undefined
    );
  }, [stories, selectedStoryId]);

  const stopFullStoryPlayback = useCallback(() => {
    playAllSessionRef.current += 1;
    setIsPlayingAll(false);
    setActiveAudioLineIdx(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const resetDictationSession = useCallback(() => {
    setDictationIndex(0);
    setDictationInput("");
    setShowHint(false);
    setEvaluation(null);
    setCombo(0);
    setMaxCombo(0);
    setLineScores({});
    setIsDictationFinished(false);
    setShakeFeedback(false);
  }, []);

  // Reset when language changes
  useEffect(() => {
    stopFullStoryPlayback();
    setSelectedStoryId(stories[0]?.id ?? "");
    resetDictationSession();
  }, [languageCode, stories, stopFullStoryPlayback, resetDictationSession]);

  // Cleanup speechSynthesis on unmount
  useEffect(() => {
    return () => {
      playAllSessionRef.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isTermSaved = useCallback(
    (term: string): boolean => {
      const normalized = term.trim().toLowerCase();
      if (sessionSavedTerms.has(`${languageCode}__${normalized}`)) return true;
      return allCards.some(
        (c) =>
          c.languageCode === languageCode &&
          c.term.trim().toLowerCase() === normalized
      );
    },
    [allCards, languageCode, sessionSavedTerms]
  );

  const handleSaveHighlightWord = useCallback(
    (line: BilingualStoryLine, story: BilingualStory) => {
      const normalized = line.highlightTerm.trim().toLowerCase();
      if (isTermSaved(line.highlightTerm)) return;

      const nowIso = new Date().toISOString();
      const newCard: VocabCard = {
        id: `story_${story.id}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        userId,
        languageCode,
        topicId: "custom_saved",
        dayNumber: 1,
        orderIndex: 1,
        term: line.highlightTerm,
        phonetic: line.highlightPhonetic || "",
        partOfSpeech: "Từ thực chiến",
        meaningVi: line.highlightMeaningVi,
        naturalContextVi: `Trích từ bài "${story.titleVi}": ${line.vi}`,
        exampleTarget: line.target,
        examplePhonetic: line.phonetic,
        exampleVi: line.vi,
        tags: ["bilingual-story", story.id],
        level: story.level,
        isCompletedInTopic: false,
        state: "new",
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: nowIso,
        createdAt: nowIso,
      };

      onSaveVocabCard(newCard);
      setSessionSavedTerms((prev) => {
        const next = new Set(prev);
        next.add(`${languageCode}__${normalized}`);
        return next;
      });
      playSuccessChime();
    },
    [isTermSaved, languageCode, onSaveVocabCard, userId]
  );

  const handleSpeakLine = useCallback(
    (text: string, rate: number, lineIdx?: number) => {
      stopFullStoryPlayback();
      if (typeof lineIdx === "number") {
        setActiveAudioLineIdx(lineIdx);
      }
      speakText(text, languageCode, rate);
    },
    [languageCode, stopFullStoryPlayback]
  );

  const handleTogglePlayAll = useCallback(() => {
    if (!activeStory) return;

    if (isPlayingAll) {
      stopFullStoryPlayback();
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    stopFullStoryPlayback();
    const sessionId = playAllSessionRef.current + 1;
    playAllSessionRef.current = sessionId;
    setIsPlayingAll(true);

    const speechLang = LANGUAGES[languageCode]?.speechLang || "en-US";

    const speakStep = (idx: number) => {
      if (playAllSessionRef.current !== sessionId) return;
      if (idx >= activeStory.lines.length) {
        setIsPlayingAll(false);
        setActiveAudioLineIdx(null);
        return;
      }

      setActiveAudioLineIdx(idx);
      const line = activeStory.lines[idx];
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(line.target);
      utterance.lang = speechLang;
      utterance.rate = 0.94;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = speechLang.toLowerCase().slice(0, 2);
      const exactVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().replace("_", "-") === speechLang.toLowerCase()
        ) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (exactVoice) {
        utterance.voice = exactVoice;
      }

      utterance.onend = () => {
        if (playAllSessionRef.current !== sessionId) return;
        window.setTimeout(() => {
          speakStep(idx + 1);
        }, 420);
      };

      utterance.onerror = () => {
        if (playAllSessionRef.current !== sessionId) return;
        setIsPlayingAll(false);
        setActiveAudioLineIdx(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakStep(0);
  }, [activeStory, isPlayingAll, languageCode, stopFullStoryPlayback]);

  const handleSelectStory = (storyId: string) => {
    if (storyId === selectedStoryId) return;
    playTileClick();
    stopFullStoryPlayback();
    setSelectedStoryId(storyId);
    resetDictationSession();
  };

  const handleSwitchMode = (nextMode: StudioMode) => {
    if (nextMode === mode) return;
    playTileClick();
    stopFullStoryPlayback();
    setMode(nextMode);
  };

  // Dictation handlers
  const currentDictationLine = activeStory?.lines[dictationIndex];

  const handleCheckDictation = () => {
    if (!currentDictationLine || !dictationInput.trim()) return;
    const result = evaluateDictationInput(
      dictationInput,
      currentDictationLine.target
    );
    setEvaluation(result);

    setLineScores((prev) => ({
      ...prev,
      [dictationIndex]: Math.max(
        prev[dictationIndex] ?? 0,
        result.accuracyPercent
      ),
    }));

    if (result.isPassed) {
      playSuccessChime();
      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((best) => Math.max(best, next));
        return next;
      });
    } else {
      playErrorTone();
      setCombo(0);
      setShakeFeedback(true);
      window.setTimeout(() => setShakeFeedback(false), 380);
    }
  };

  const handleRetryCurrentLine = () => {
    playTileClick();
    setEvaluation(null);
    setDictationInput("");
    window.setTimeout(() => {
      dictationTextareaRef.current?.focus();
    }, 40);
  };

  const handleNextDictationLine = () => {
    if (!activeStory) return;
    playTileClick();
    if (dictationIndex + 1 >= activeStory.lines.length) {
      setIsDictationFinished(true);
      playCelebrationFanfare();
      return;
    }

    const nextIdx = dictationIndex + 1;
    setDictationIndex(nextIdx);
    setDictationInput("");
    setShowHint(false);
    setEvaluation(null);

    const nextLine = activeStory.lines[nextIdx];
    if (nextLine) {
      speakText(nextLine.target, languageCode, 0.94);
    }
    window.setTimeout(() => {
      dictationTextareaRef.current?.focus();
    }, 60);
  };

  const averageAccuracy = useMemo(() => {
    const values = Object.values(lineScores);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [lineScores]);

  if (!activeStory) {
    return (
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-8 text-center">
        <p className="text-sm text-[#57534E]">
          Chưa có bài đọc song ngữ cho ngôn ngữ này.
        </p>
      </div>
    );
  }

  const langMeta = LANGUAGES[languageCode];

  return (
    <div className="space-y-6">
      {/* Studio Header & Mode Switcher */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6B655E]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2EFE9] px-2.5 py-1 text-[#181715]">
                <Sparkles className="h-3.5 w-3.5 text-[#1F5E3B]" />
                Thực chiến {langMeta?.nameVi ?? languageCode}
              </span>
              <span className="rounded-full border border-[#E5E0D8] bg-[#FAF8F5] px-2.5 py-1">
                {activeStory.level}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {activeStory.durationLabel}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-[#181715] sm:text-2xl">
              {activeStory.titleVi}
            </h2>
            <p className="mt-0.5 text-sm font-medium text-[#57534E]">
              {activeStory.titleTarget} · {activeStory.categoryVi}
            </p>
          </div>

          {/* Two Sleek Mode Tabs */}
          <div className="inline-flex w-full sm:w-auto rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-1 self-start lg:self-center">
            <button
              type="button"
              onClick={() => handleSwitchMode("reader")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                mode === "reader"
                  ? "bg-[#181715] text-white shadow-xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Đọc Song Ngữ</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("dictation")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                mode === "dictation"
                  ? "bg-[#1F5E3B] text-white shadow-xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <Headphones className="h-4 w-4 shrink-0" />
              <span>Nghe Chép Chính Tả</span>
            </button>
          </div>
        </div>

        {/* Story Picker (when language has multiple stories) */}
        {stories.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E5E0D8] pt-4">
            <span className="text-xs font-medium text-[#6B655E]">
              Chọn bài thực chiến:
            </span>
            {stories.map((story) => {
              const isSelected = story.id === activeStory.id;
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleSelectStory(story.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? "border-[#1F5E3B] bg-[#1F5E3B]/10 text-[#1F5E3B]"
                      : "border-[#E5E0D8] bg-[#FAF8F5] text-[#57534E] hover:border-[#C9C2B6] hover:text-[#181715]"
                  }`}
                >
                  {story.titleVi}{" "}
                  <span className="ml-1 opacity-75">({story.level})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODE 1: BILINGUAL READER                                            */}
      {/* =================================================================== */}
      {mode === "reader" && (
        <div className="space-y-4">
          {/* Reader Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlayAll}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                  isPlayingAll ? "btn-tactile-ink" : "btn-tactile-green"
                }`}
              >
                {isPlayingAll ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-current" />
                    Dừng đọc
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Nghe toàn bài
                  </>
                )}
              </button>

              <span className="hidden text-xs text-[#6B655E] sm:inline">
                Di chuột hoặc chạm vào bất kỳ từ nào để tra nghĩa &amp; nghe phát âm
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTileClick();
                  setShowPhonetics((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  showPhonetics
                    ? "border-[#9E2A2B]/30 bg-[#9E2A2B]/8 text-[#9E2A2B]"
                    : "border-[#E5E0D8] bg-[#FFFFFF] text-[#6B655E]"
                }`}
              >
                {showPhonetics ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                Phiên âm
              </button>

              <button
                type="button"
                onClick={() => {
                  playTileClick();
                  setShowTranslation((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  showTranslation
                    ? "border-[#1F5E3B]/30 bg-[#1F5E3B]/10 text-[#1F5E3B]"
                    : "border-[#E5E0D8] bg-[#FFFFFF] text-[#6B655E]"
                }`}
              >
                {showTranslation ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                Dịch nghĩa
              </button>
            </div>
          </div>

          {/* Story Lines */}
          <div className="space-y-3">
            {activeStory.lines.map((line, idx) => {
              const isActiveLine = activeAudioLineIdx === idx;
              const alreadySaved = isTermSaved(line.highlightTerm);

              return (
                <article
                  key={`${activeStory.id}-line-${idx}`}
                  className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                    isActiveLine
                      ? "border-[#1F5E3B] bg-[#1F5E3B]/[0.03]"
                      : "border-[#E5E0D8] bg-[#FFFFFF]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {line.speaker && (
                        <span className="rounded-md bg-[#F2EFE9] px-2.5 py-0.5 text-xs font-semibold text-[#181715]">
                          {line.speaker}
                        </span>
                      )}
                      <span className="font-mono text-xs text-[#6B655E]">
                        Câu {idx + 1}/{activeStory.lines.length}
                      </span>
                    </div>

                    {/* Per-line Audio Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakLine(line.target, 0.96, idx)}
                        className="btn-tactile-soft inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                        title="Nghe tốc độ chuẩn"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-[#1F5E3B]" />
                        1.0x
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSpeakLine(line.target, 0.7, idx)}
                        className="btn-tactile-soft inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#57534E]"
                        title="Nghe chậm 0.7x để rõ từng âm"
                      >
                        0.7x
                      </button>
                    </div>
                  </div>

                  {/* Interactive Hoverable Target Sentence */}
                  <div className="mt-3">
                    <HoverableSentence
                      sentence={line.target}
                      languageCode={languageCode}
                      allCards={allCards}
                      className="text-base font-semibold leading-relaxed text-[#181715] sm:text-lg"
                    />
                  </div>

                  {/* Optional Phonetics */}
                  {showPhonetics && line.phonetic && (
                    <p className="mt-1.5 font-mono text-xs leading-relaxed text-[#9E2A2B] sm:text-[13px]">
                      {line.phonetic}
                    </p>
                  )}

                  {/* Optional Vietnamese Translation */}
                  {showTranslation && (
                    <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                      {line.vi}
                    </p>
                  )}

                  {/* Featured Vocabulary + 1-Tap Save */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E0D8]/80 pt-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-[#FAF8F5] border border-[#E5E0D8] px-2 py-0.5 font-semibold text-[#181715]">
                        {line.highlightTerm}
                      </span>
                      <span className="text-[#57534E]">
                        — {line.highlightMeaningVi}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={alreadySaved}
                      onClick={() => handleSaveHighlightWord(line, activeStory)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        alreadySaved
                          ? "border border-[#1F5E3B]/25 bg-[#1F5E3B]/10 text-[#1F5E3B] cursor-default"
                          : "border border-[#E5E0D8] bg-[#FAF8F5] text-[#181715] hover:border-[#1F5E3B] hover:bg-[#1F5E3B]/8 hover:text-[#1F5E3B]"
                      }`}
                    >
                      {alreadySaved ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Đã lưu &ldquo;{line.highlightTerm}&rdquo;
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Lưu từ &ldquo;{line.highlightTerm}&rdquo;
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* CTA to jump straight into Dictation */}
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E5E0D8] bg-[#F2EFE9]/70 p-4 sm:flex-row sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#181715]">
                Đọc hiểu hết bài rồi? Thử thách đôi tai ngay!
              </p>
              <p className="text-xs text-[#57534E]">
                Chuyển sang chế độ Nghe Chép Chính Tả để luyện phản xạ nghe từng câu không nhìn chữ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSwitchMode("dictation")}
              className="btn-tactile-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
            >
              <Headphones className="h-4 w-4" />
              Luyện Nghe Chép ngay
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 2: DAILY DICTATION (BLIND LISTENING)                           */}
      {/* =================================================================== */}
      {mode === "dictation" && (
        <div className="space-y-4">
          {/* Progress & Combo Bar */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#181715]">
                  Câu {Math.min(dictationIndex + 1, activeStory.lines.length)}/
                  {activeStory.lines.length}
                </span>
                {combo > 0 && (
                  <span className="animate-pop inline-flex items-center gap-1 rounded-full bg-[#B45309]/12 px-2.5 py-0.5 text-xs font-bold text-[#B45309]">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    Combo x{combo}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  playTileClick();
                  resetDictationSession();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B655E] hover:text-[#181715]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Làm lại từ đầu
              </button>
            </div>

            {/* Progress Track */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F2EFE9]">
              <div
                className="h-full rounded-full bg-[#1F5E3B] transition-all duration-300"
                style={{
                  width: `${
                    isDictationFinished
                      ? 100
                      : Math.round(
                          ((dictationIndex + (evaluation?.isPassed ? 1 : 0)) /
                            activeStory.lines.length) *
                            100
                        )
                  }%`,
                }}
              />
            </div>
          </div>

          {isDictationFinished ? (
            /* Completion Celebration Card */
            <div className="animate-pop rounded-2xl border border-[#1F5E3B]/30 bg-[#FFFFFF] p-6 text-center sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F5E3B]/10 text-[#1F5E3B]">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#181715]">
                Hoàn thành bài Nghe Chép Chính Tả!
              </h3>
              <p className="mt-1 text-sm text-[#57534E]">
                Bạn đã hoàn tất trọn vẹn {activeStory.lines.length} câu trong bài{" "}
                <span className="font-semibold text-[#181715]">
                  &ldquo;{activeStory.titleVi}&rdquo;
                </span>
                .
              </p>

              <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-3">
                  <p className="text-xs text-[#6B655E]">Độ chính xác TB</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#1F5E3B]">
                    {averageAccuracy}%
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-3">
                  <p className="text-xs text-[#6B655E]">Combo cao nhất</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#B45309]">
                    x{maxCombo}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playTileClick();
                    resetDictationSession();
                  }}
                  className="btn-tactile-green inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  <RotateCcw className="h-4 w-4" />
                  Luyện chép lại
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("reader")}
                  className="btn-tactile-soft inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  <BookOpen className="h-4 w-4" />
                  Xem lại bài Đọc Song Ngữ
                </button>
              </div>
            </div>
          ) : (
            currentDictationLine && (
              /* Active Blind Dictation Card */
              <div
                className={`rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 ${
                  shakeFeedback ? "animate-shake" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {currentDictationLine.speaker && (
                      <span className="rounded-md bg-[#F2EFE9] px-2.5 py-1 text-xs font-semibold text-[#181715]">
                        {currentDictationLine.speaker}
                      </span>
                    )}
                    <span className="text-xs text-[#6B655E]">
                      Bấm nghe và gõ lại chính xác câu bạn nghe được
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playTileClick();
                      setShowHint((prev) => !prev);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      showHint
                        ? "border-[#B45309]/35 bg-[#B45309]/10 text-[#B45309]"
                        : "border-[#E5E0D8] bg-[#FAF8F5] text-[#57534E] hover:text-[#181715]"
                    }`}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showHint ? "Ẩn gợi ý" : "Gợi ý nhẹ"}
                  </button>
                </div>

                {/* Big Audio Trigger Controls */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeakLine(currentDictationLine.target, 0.95)
                    }
                    className="btn-tactile-green inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                  >
                    <Volume2 className="h-4 w-4" />
                    Nghe câu (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeakLine(currentDictationLine.target, 0.7)
                    }
                    className="btn-tactile-soft inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#181715]"
                  >
                    <Headphones className="h-4 w-4 text-[#B45309]" />
                    Nghe chậm (0.7x)
                  </button>
                </div>

                {/* Soft Hint Drawer */}
                {showHint && (
                  <div className="mt-4 rounded-xl border border-[#B45309]/25 bg-[#B45309]/[0.06] p-3.5 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#B45309]">
                      Gợi ý nghĩa &amp; khung chữ
                    </p>
                    <p className="mt-1 text-[#181715]">
                      {currentDictationLine.vi}
                    </p>
                    <p className="mt-1.5 font-mono text-xs text-[#57534E]">
                      {buildMaskedHint(currentDictationLine.target)}
                    </p>
                  </div>
                )}

                {/* Learner Input Box */}
                <div className="mt-5">
                  <label
                    htmlFor="dictation-input"
                    className="block text-xs font-semibold text-[#57534E]"
                  >
                    Bản chép của bạn ({langMeta?.nativeName ?? languageCode})
                  </label>
                  <textarea
                    id="dictation-input"
                    ref={dictationTextareaRef}
                    rows={3}
                    value={dictationInput}
                    onChange={(e) => {
                      setDictationInput(e.target.value);
                      if (evaluation) setEvaluation(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!evaluation) {
                          handleCheckDictation();
                        } else if (evaluation.isPassed) {
                          handleNextDictationLine();
                        }
                      }
                    }}
                    placeholder="Gõ chính xác những gì bạn vừa nghe (nhấn Enter để kiểm tra)..."
                    className="mt-2 w-full resize-none rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-3.5 text-base text-[#181715] placeholder:text-[#6B655E]/70 focus:border-[#1F5E3B] focus:bg-[#FFFFFF] focus:outline-none"
                  />
                </div>

                {/* Check Button (before evaluation) */}
                {!evaluation && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#6B655E]">
                      Mẹo: Đạt từ 80% trở lên sẽ được tính điểm qua câu.
                    </span>
                    <button
                      type="button"
                      disabled={!dictationInput.trim()}
                      onClick={handleCheckDictation}
                      className="btn-tactile-ink inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-45"
                    >
                      Kiểm tra chính tả
                    </button>
                  </div>
                )}

                {/* Word-by-Word Diff Feedback */}
                {evaluation && (
                  <div
                    className={`animate-pop mt-5 rounded-2xl border p-4 sm:p-5 ${
                      evaluation.isPassed
                        ? "border-[#1F5E3B]/30 bg-[#1F5E3B]/[0.04]"
                        : "border-[#9E2A2B]/30 bg-[#9E2A2B]/[0.04]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {evaluation.isPassed ? (
                          <CheckCircle2 className="h-5 w-5 text-[#1F5E3B]" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-[#9E2A2B]" />
                        )}
                        <span
                          className={`text-sm font-bold ${
                            evaluation.isPassed
                              ? "text-[#1F5E3B]"
                              : "text-[#9E2A2B]"
                          }`}
                        >
                          {evaluation.accuracyPercent === 100
                            ? "Chính xác tuyệt đối 100%!"
                            : evaluation.isPassed
                            ? `Đạt chuẩn (${evaluation.accuracyPercent}%) — Rất tốt!`
                            : `Đạt ${evaluation.accuracyPercent}% — Nghe lại các từ màu đỏ nhé`}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-bold text-[#181715]">
                        {evaluation.accuracyPercent}%
                      </span>
                    </div>

                    {/* Green / Red Word Diff Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {evaluation.wordDiffs.map((diff, idx) => (
                        <span
                          key={idx}
                          className={`rounded-lg border px-2 py-0.5 text-sm font-semibold ${
                            diff.matched
                              ? "border-[#1F5E3B]/30 bg-[#1F5E3B]/12 text-[#1F5E3B]"
                              : "border-[#9E2A2B]/30 bg-[#9E2A2B]/10 text-[#9E2A2B]"
                          }`}
                        >
                          {diff.word}
                        </span>
                      ))}
                    </div>

                    {/* Full Answer Reveal with HoverableSentence & Save Vocab */}
                    <div className="mt-4 border-t border-[#E5E0D8] pt-3.5">
                      <p className="text-xs font-semibold text-[#6B655E]">
                        Đáp án chuẩn (chạm từ để tra nghĩa):
                      </p>
                      <div className="mt-1">
                        <HoverableSentence
                          sentence={currentDictationLine.target}
                          languageCode={languageCode}
                          allCards={allCards}
                          className="text-base font-semibold text-[#181715]"
                        />
                      </div>
                      {currentDictationLine.phonetic && (
                        <p className="mt-1 font-mono text-xs text-[#9E2A2B]">
                          {currentDictationLine.phonetic}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-[#57534E]">
                        {currentDictationLine.vi}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          disabled={isTermSaved(
                            currentDictationLine.highlightTerm
                          )}
                          onClick={() =>
                            handleSaveHighlightWord(
                              currentDictationLine,
                              activeStory
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            isTermSaved(currentDictationLine.highlightTerm)
                              ? "border border-[#1F5E3B]/25 bg-[#1F5E3B]/10 text-[#1F5E3B]"
                              : "border border-[#E5E0D8] bg-[#FFFFFF] text-[#181715] hover:border-[#1F5E3B] hover:text-[#1F5E3B]"
                          }`}
                        >
                          {isTermSaved(currentDictationLine.highlightTerm) ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Đã lưu &ldquo;{currentDictationLine.highlightTerm}
                              &rdquo;
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Lưu từ &ldquo;{currentDictationLine.highlightTerm}
                              &rdquo;
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleRetryCurrentLine}
                            className="btn-tactile-soft inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Chép lại
                          </button>
                          <button
                            type="button"
                            onClick={handleNextDictationLine}
                            className="btn-tactile-green inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
                          >
                            {dictationIndex + 1 >= activeStory.lines.length
                              ? "Hoàn thành bài nghe"
                              : "Câu tiếp theo"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
