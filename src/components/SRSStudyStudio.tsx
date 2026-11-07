"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Turtle,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  FolderKanban,
  CalendarDays,
  Lock,
  Unlock,
  Puzzle,
  ArrowRight,
  RotateCcw,
  X,
  Mic,
  BookOpenCheck,
  ListChecks,
  Keyboard,
  MousePointerClick,
  RefreshCw,
  Lightbulb,
  Delete,
} from "lucide-react";
import {
  LanguageCode,
  TopicId,
  TopicProgress,
  VocabCard,
} from "@/types/language";
import { LANGUAGES, TOPICS } from "@/lib/seed-data";
import { calculateNextReview } from "@/lib/srs";
import {
  generateMaskedWord,
  verifyStep4WordInput,
  verifyStep5SentenceTranslation,
} from "@/lib/learning-utils";
import {
  getWordCollocationsAndTip,
  buildVietnameseWordBank,
  buildTargetLanguageWordBank,
  buildStep4CharacterBank,
  buildDailyContextStory,
  startPronunciationCheck,
} from "@/lib/study-enhancements";
import {
  playTileClick,
  playSuccessChime,
  playErrorTone,
  playCelebrationFanfare,
  isSoundEffectsMuted,
  setSoundEffectsMuted,
} from "@/lib/sound-effects";
import { speakText } from "@/lib/speech";
import PracticeArenaModal from "@/components/PracticeArenaModal";
import { HoverableSentence } from "@/components/HoverWordTooltip";

interface SRSStudyStudioProps {
  languageCode: LanguageCode;
  activeTopicId: TopicId;
  topicProgress: TopicProgress;
  cards: VocabCard[];
  learnedCount?: number;
  totalCount?: number;
  isAdmin?: boolean;
  showPhonetics: boolean;
  chineseScript: "simplified" | "traditional";
  onSelectTopic: (topicId: TopicId) => void;
  onSelectDay: (dayNumber: number) => void;
  onPassGateTestForDay: (dayNumber: number) => void;
  onCompleteFullDay: (dayNumber: number) => void;
  onPersistCardIndex: (topicId: TopicId, newIndex: number) => void;
  onTogglePhonetics: () => void;
  onToggleChineseScript: () => void;
  onCompleteCardInTopic: (
    updatedCard: VocabCard,
    nextDayCardIndex: number,
    newUnlockedDay: number,
    isTopicNowCompleted: boolean
  ) => void;
  onResetTopicProgress: (topicId: TopicId) => void;
  onOpenQuickAdd: () => void;
}

type LearningStep = 1 | 2 | 3 | 4 | 5;

export default function SRSStudyStudio({
  languageCode,
  activeTopicId,
  topicProgress,
  cards,
  learnedCount = 0,
  totalCount = 0,
  isAdmin = false,
  showPhonetics,
  chineseScript,
  onSelectTopic,
  onSelectDay,
  onPassGateTestForDay,
  onCompleteFullDay,
  onPersistCardIndex,
  onTogglePhonetics,
  onToggleChineseScript,
  onCompleteCardInTopic,
  onResetTopicProgress,
  onOpenQuickAdd,
}: SRSStudyStudioProps) {
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isDayGridModalOpen, setIsDayGridModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isWordListDrawerOpen, setIsWordListDrawerOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  useEffect(() => {
    setSoundMuted(isSoundEffectsMuted());
  }, []);

  const handleToggleSoundMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundEffectsMuted(next);
  };

  // 5-Step Fixed Learning Flow State Machine
  const [currentStep, setCurrentStep] = useState<LearningStep>(1);
  const [hasListenedInStep2, setHasListenedInStep2] = useState(false);

  // Step 2: Optional Speech Recognition Pronunciation Check
  const [isRecordingPronunciation, setIsRecordingPronunciation] =
    useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<null | {
    transcript: string;
    isMatch: boolean;
    confidencePercent: number;
    errorMsg?: string;
  }>(null);

  // Step 4: 3-round progressive cloze typing (e.g. He_lo -> He__o -> _el__)
  const [step4Round, setStep4Round] = useState<1 | 2 | 3>(1);
  const [step4Input, setStep4Input] = useState("");
  const [step4Error, setStep4Error] = useState<string | null>(null);

  // Step 5: Sentence translation (Word Bank mode vs Keyboard mode + Reverse Foreign Sentence Builder)
  const [step5Mode, setStep5Mode] = useState<"wordbank" | "keyboard">(
    "wordbank"
  );
  const [selectedWordBankIndices, setSelectedWordBankIndices] = useState<
    number[]
  >([]);
  const [step5InputVi, setStep5InputVi] = useState("");
  const [step5Result, setStep5Result] = useState<null | {
    isCorrect: boolean;
    message: string;
  }>(null);

  // Optional Reverse Target Sentence Challenge in Step 5
  const [showReverseChallenge, setShowReverseChallenge] = useState(false);
  const [selectedReverseIndices, setSelectedReverseIndices] = useState<
    number[]
  >([]);
  const [reverseCheckPassed, setReverseCheckPassed] = useState<boolean | null>(
    null
  );

  const langMeta = LANGUAGES[languageCode];
  const activeTopicMeta =
    TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  const langCards = useMemo(
    () => cards.filter((c) => c.languageCode === languageCode),
    [cards, languageCode]
  );

  const topicCards = useMemo(
    () =>
      langCards
        .filter((c) => c.topicId === activeTopicId)
        .sort((a, b) => {
          if ((a.dayNumber || 1) !== (b.dayNumber || 1)) {
            return (a.dayNumber || 1) - (b.dayNumber || 1);
          }
          return (a.orderIndex || 99) - (b.orderIndex || 99);
        }),
    [langCards, activeTopicId]
  );

  const activeDay = topicProgress.activeDay || 1;
  const unlockedDay = topicProgress.unlockedDay || 1;

  const currentDayCards = useMemo(
    () => topicCards.filter((c) => (c.dayNumber || 1) === activeDay),
    [topicCards, activeDay]
  );

  const prevDayCards = useMemo(
    () =>
      activeDay > 1
        ? topicCards.filter((c) => (c.dayNumber || 1) === activeDay - 1)
        : [],
    [topicCards, activeDay]
  );

  const requiresGatekeepingTest =
    !isAdmin &&
    activeDay >= 2 &&
    prevDayCards.length > 0 &&
    !topicProgress.gateTestPassedDays.includes(activeDay);

  const safeIndex =
    currentDayCards.length > 0
      ? Math.min(
          Math.max(0, topicProgress.currentCardIndex),
          currentDayCards.length - 1
        )
      : 0;

  const activeCard =
    currentDayCards.length > 0 ? currentDayCards[safeIndex] : null;

  useEffect(() => {
    setCurrentStep(1);
    setHasListenedInStep2(false);
    setIsRecordingPronunciation(false);
    setPronunciationFeedback(null);
    setStep4Round(1);
    setStep4Input("");
    setStep4Error(null);
    setSelectedWordBankIndices([]);
    setStep5InputVi("");
    setStep5Result(null);
    setShowReverseChallenge(false);
    setSelectedReverseIndices([]);
    setReverseCheckPassed(null);
  }, [activeCard?.id, activeDay, activeTopicId, languageCode]);

  const displayTerm = useMemo(() => {
    if (!activeCard) return "";
    if (
      (languageCode === "zh-CN" || languageCode === "zh-TW") &&
      chineseScript === "traditional" &&
      activeCard.traditionalTerm
    ) {
      return activeCard.traditionalTerm;
    }
    return activeCard.term;
  }, [activeCard, languageCode, chineseScript]);

  // Rich content enhancements for the active word
  const wordEnhancement = useMemo(() => {
    if (!activeCard) return null;
    return getWordCollocationsAndTip(activeCard);
  }, [activeCard]);

  // Word bank for Step 5 (Vietnamese translation tiles)
  const vietnameseWordBankTiles = useMemo(() => {
    if (!activeCard) return [];
    return buildVietnameseWordBank(activeCard.exampleVi, currentDayCards);
  }, [activeCard, currentDayCards]);

  // Reverse Word Bank for Step 5 (Foreign sentence tiles)
  const targetLangWordBankTiles = useMemo(() => {
    if (!activeCard) return [];
    return buildTargetLanguageWordBank(activeCard.exampleTarget);
  }, [activeCard]);

  // Step 4 Character / Syllable Tile Picker Bank
  const step4CharacterTiles = useMemo(() => {
    if (!activeCard) return [];
    return buildStep4CharacterBank(displayTerm, currentDayCards, step4Round);
  }, [activeCard, displayTerm, currentDayCards, step4Round]);

  // Daily 10-word story / dialogue
  const dailyStoryLines = useMemo(
    () => buildDailyContextStory(currentDayCards),
    [currentDayCards]
  );

  // Sync Word Bank selection into step5InputVi when in wordbank mode
  useEffect(() => {
    if (step5Mode === "wordbank") {
      const assembled = selectedWordBankIndices
        .map((idx) => vietnameseWordBankTiles[idx])
        .filter(Boolean)
        .join(" ");
      setStep5InputVi(assembled);
    }
  }, [selectedWordBankIndices, step5Mode, vietnameseWordBankTiles]);

  // Keyboard shortcuts: Space to replay audio, Enter to advance Steps 1-3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCard) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }
      if (
        isTopicModalOpen ||
        isDayGridModalOpen ||
        isPracticeModalOpen ||
        isWordListDrawerOpen ||
        isStoryModalOpen
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (currentStep === 5) {
          speakText(activeCard.exampleTarget, languageCode, 0.92);
        } else {
          speakText(activeCard.term, languageCode, 0.94);
          if (currentStep === 2) {
            setHasListenedInStep2(true);
          }
        }
      } else if (e.code === "Enter") {
        if (currentStep === 1) {
          e.preventDefault();
          setCurrentStep(2);
          speakText(activeCard.term, languageCode, 0.92);
          setHasListenedInStep2(true);
        } else if (currentStep === 2 && hasListenedInStep2) {
          e.preventDefault();
          setCurrentStep(3);
        } else if (currentStep === 3) {
          e.preventDefault();
          setCurrentStep(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeCard,
    currentStep,
    hasListenedInStep2,
    languageCode,
    isTopicModalOpen,
    isDayGridModalOpen,
    isPracticeModalOpen,
    isWordListDrawerOpen,
    isStoryModalOpen,
  ]);

  const daysBreakdown = useMemo(() => {
    const list: Array<{
      day: number;
      total: number;
      completed: number;
      isUnlocked: boolean;
      isDone: boolean;
      gatePassed: boolean;
    }> = [];

    for (let d = 1; d <= 10; d++) {
      const dCards = topicCards.filter((c) => (c.dayNumber || 1) === d);
      const doneCount = dCards.filter((c) => c.isCompletedInTopic).length;
      const isDone = dCards.length > 0 && doneCount >= dCards.length;
      const isUnlocked = Boolean(isAdmin) || d <= unlockedDay;
      const gatePassed =
        Boolean(isAdmin) ||
        d === 1 ||
        topicProgress.gateTestPassedDays.includes(d);
      list.push({
        day: d,
        total: dCards.length,
        completed: doneCount,
        isUnlocked,
        isDone,
        gatePassed,
      });
    }
    return list;
  }, [topicCards, unlockedDay, topicProgress.gateTestPassedDays, isAdmin]);

  const currentDayStat = daysBreakdown[activeDay - 1] || {
    day: activeDay,
    total: currentDayCards.length,
    completed: 0,
    isUnlocked: true,
    isDone: false,
    gatePassed: true,
  };

  const topicStatsMap = useMemo(() => {
    const map = {} as Record<
      TopicId,
      { total: number; completed: number; isCompleted: boolean }
    >;
    TOPICS.forEach((t) => {
      const tCards = langCards.filter((c) => c.topicId === t.id);
      const comp = tCards.filter((c) => c.isCompletedInTopic).length;
      map[t.id] = {
        total: tCards.length,
        completed: comp,
        isCompleted: tCards.length > 0 && comp >= tCards.length,
      };
    });
    return map;
  }, [langCards]);

  const maskedWordPreview = useMemo(() => {
    if (!activeCard) return "";
    return generateMaskedWord(displayTerm, step4Round);
  }, [activeCard, displayTerm, step4Round]);

  const handlePronunciationTest = () => {
    if (!activeCard || isRecordingPronunciation) return;
    setIsRecordingPronunciation(true);
    setPronunciationFeedback(null);

    startPronunciationCheck(
      activeCard.term,
      languageCode,
      (transcript, isMatch) => {
        setIsRecordingPronunciation(false);
        setHasListenedInStep2(true);
        setPronunciationFeedback({
          transcript,
          isMatch,
          confidencePercent: isMatch ? 96 : 62,
        });
      },
      (errMsg) => {
        setIsRecordingPronunciation(false);
        setPronunciationFeedback({
          transcript: "",
          isMatch: false,
          confidencePercent: 0,
          errorMsg: errMsg,
        });
      }
    );
  };

  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;

    const isMatch = verifyStep4WordInput(
      step4Input,
      activeCard.term,
      activeCard.traditionalTerm
    );

    if (!isMatch) {
      playErrorTone();
      setStep4Error(
        `Chưa chính xác. Hãy nhìn gợi ý khuyết "${maskedWordPreview}" và gõ (hoặc chạm ký tự) lại đầy đủ từ "${displayTerm}" nhé!`
      );
      return;
    }

    playSuccessChime();
    setStep4Error(null);
    setStep4Input("");
    speakText(activeCard.term, languageCode, 0.94);

    if (step4Round < 3) {
      setStep4Round((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      setCurrentStep(5);
    }
  };

  const evaluateStep5Translation = (textToVerify: string) => {
    if (!activeCard || !textToVerify.trim()) return;

    const check = verifyStep5SentenceTranslation(
      textToVerify,
      activeCard.exampleVi,
      activeCard.acceptedTranslationsVi
    );

    if (check.isCorrect) {
      playSuccessChime();
      setStep5Result({
        isCorrect: true,
        message: `✓ Dịch chuẩn xác! Nghĩa mẫu: "${activeCard.exampleVi}"`,
      });
      speakText(activeCard.exampleTarget, languageCode, 0.94);
    } else {
      playErrorTone();
      setStep5Result({
        isCorrect: false,
        message: `Gợi ý nghĩa chuẩn: "${activeCard.exampleVi}". Bạn có thể chạm ghép lại hoặc bấm Hoàn thành sau khi đã nắm rõ nghĩa câu nhé!`,
      });
    }
  };

  const handleStep5Submit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateStep5Translation(step5InputVi);
  };

  const handleVerifyReverseChallenge = () => {
    if (!activeCard) return;
    const assembled = selectedReverseIndices
      .map((i) => targetLangWordBankTiles[i])
      .join(" ")
      .toLowerCase()
      .replace(/[.,!?;:"“”()]/g, "")
      .trim();
    const expected = activeCard.exampleTarget
      .toLowerCase()
      .replace(/[.,!?;:"“”()]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .join(" ")
      .trim();
    const isOk = assembled === expected;
    setReverseCheckPassed(isOk);
    if (isOk) {
      playSuccessChime();
      speakText(activeCard.exampleTarget, languageCode, 0.94);
    } else {
      playErrorTone();
    }
  };

  const handleFinishWord5Steps = () => {
    if (!activeCard) return;
    playCelebrationFanfare();
    const srsResult = calculateNextReview(activeCard, "good");
    const updatedCard: VocabCard = {
      ...activeCard,
      ...srsResult,
      isCompletedInTopic: true,
    };

    const simulatedDayCards = currentDayCards.map((c) =>
      c.id === updatedCard.id ? updatedCard : c
    );
    const isDayNowCompleted =
      simulatedDayCards.length > 0 &&
      simulatedDayCards.every((c) => c.isCompletedInTopic);

    const newUnlockedDay = isDayNowCompleted
      ? Math.max(unlockedDay, Math.min(10, activeDay + 1))
      : unlockedDay;

    let nextIdx = safeIndex;
    if (!isDayNowCompleted) {
      const nextAfter = simulatedDayCards.findIndex(
        (c, i) => i > safeIndex && !c.isCompletedInTopic
      );
      if (nextAfter >= 0) {
        nextIdx = nextAfter;
      } else {
        const firstUncomp = simulatedDayCards.findIndex(
          (c) => !c.isCompletedInTopic
        );
        nextIdx = firstUncomp >= 0 ? firstUncomp : safeIndex;
      }
    }

    const simulatedAllTopicCards = topicCards.map((c) =>
      c.id === updatedCard.id ? updatedCard : c
    );
    const isTopicNowCompleted =
      simulatedAllTopicCards.length > 0 &&
      simulatedAllTopicCards.every((c) => c.isCompletedInTopic);

    onCompleteCardInTopic(
      updatedCard,
      nextIdx,
      newUnlockedDay,
      isTopicNowCompleted
    );
  };

  const isChinese = languageCode === "zh-CN" || languageCode === "zh-TW";
  // Anti-spoiler mask during Step 4 & Step 5 tests
  const isSpoilerHidden = currentStep === 4 || currentStep === 5;

  return (
    <div className="space-y-4">
      {/* SINGLE UNIFIED CONTROL & STATUS BAR (Saves ~65px vertical height) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/95 border border-[#E5E0D8] rounded-2xl px-3 py-2.5 shadow-[0_2px_10px_rgba(24,23,21,0.025)]">
        {/* Left Cluster: Connected Topic › Day Breadcrumb Capsule + Practice Arena + 10-Word Story */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] p-1 gap-1">
            {/* Topic Selector */}
            <button
              type="button"
              onClick={() => setIsTopicModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181715] text-white text-xs font-semibold hover:bg-[#2E2C28] transition-all"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#1F5E3B]" />
              <span>{activeTopicMeta.titleVi}</span>
            </button>

            <span className="text-[#8A847C] text-xs px-0.5 select-none">›</span>

            {/* Day Selector */}
            <button
              type="button"
              onClick={() => setIsDayGridModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDayStat.isDone
                  ? "bg-[#1F5E3B]/12 text-[#1F5E3B]"
                  : "bg-white hover:bg-[#F2EFE9] text-[#181715] shadow-2xs"
              }`}
            >
              {currentDayStat.isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5 text-[#9E2A2B]" />
              )}
              <span>
                Ngày {activeDay}/10 ({currentDayStat.completed}/
                {currentDayStat.total})
              </span>
            </button>
          </div>

          {/* Practice Arena Trigger */}
          <button
            type="button"
            onClick={() => setIsPracticeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F5E3B]/10 text-[#1F5E3B] hover:bg-[#1F5E3B] hover:text-white text-xs font-semibold transition-all"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Bài Tập ({currentDayCards.length} từ)</span>
          </button>

          {/* Daily 10-Word Context Story Trigger */}
          <button
            type="button"
            onClick={() => setIsStoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9E2A2B]/10 text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white text-xs font-semibold transition-all"
            title="Đọc hội thoại ngắn kết nối toàn bộ 10 từ vựng của Ngày học này"
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Hội thoại 10 từ</span>
          </button>
        </div>

        {/* Right Cluster: Overall Progress Badge + 10-Word Drawer + Phonetics + Admin + Add Word */}
        <div className="flex flex-wrap items-center gap-1.5">
          {totalCount > 0 && (
            <span
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-[11px] text-[#57534E]"
              title="Tổng số từ đã thuộc trong ngôn ngữ hiện tại"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
              <span>
                Đã thuộc:{" "}
                <strong className="font-mono text-[#181715]">
                  {learnedCount}/{totalCount}
                </strong>
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsWordListDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-semibold text-[#181715] transition-colors"
            title="Xem danh sách 10 từ của ngày hiện tại"
          >
            <ListChecks className="w-3.5 h-3.5 text-[#1F5E3B]" />
            <span>
              DS 10 từ ({currentDayStat.completed}/{currentDayStat.total})
            </span>
          </button>

          <button
            type="button"
            onClick={onTogglePhonetics}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-medium text-[#57534E] hover:text-[#181715] transition-colors"
          >
            {showPhonetics ? (
              <Eye className="w-3.5 h-3.5 text-[#1F5E3B]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {langMeta.phoneticLabel}: {showPhonetics ? "Bật" : "Ẩn"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleSoundMute}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-medium text-[#57534E] hover:text-[#181715] transition-colors"
            title={
              soundMuted
                ? "Bật âm thanh hiệu ứng khi trả lời đúng/sai"
                : "Tắt âm thanh hiệu ứng"
            }
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#9E2A2B]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
            )}
            <span className="hidden md:inline">
              Âm: {soundMuted ? "Tắt" : "Bật"}
            </span>
          </button>

          {isChinese && (
            <button
              type="button"
              onClick={onToggleChineseScript}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] text-xs font-medium text-[#9E2A2B] bg-[#9E2A2B]/5"
            >
              {chineseScript === "simplified" ? "Giản (简)" : "Phồn (繁)"}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => onCompleteFullDay(activeDay)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#B45309]/10 border border-[#B45309]/30 text-[#B45309] text-xs font-semibold hover:bg-[#B45309]/20 transition-colors"
              title="Quyền Quản trị viên: Đánh dấu hoàn thành nhanh Ngày hiện tại"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Admin: Xong Ngày {activeDay}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#181715]/20 bg-white hover:bg-[#181715] text-[#181715] hover:text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm từ</span>
          </button>
        </div>
      </div>

      {/* MANDATORY GATEKEEPING TEST FOR DAY N+1 */}
      {requiresGatekeepingTest && (
        <PracticeArenaModal
          isOpen={true}
          isGatekeepingTest={true}
          targetDayNumber={activeDay}
          languageCode={languageCode}
          cardsToTest={prevDayCards}
          onCloseOrBackToPrevDay={() => onSelectDay(activeDay - 1)}
          onPassGateTest={(passedDay) => onPassGateTestForDay(passedDay)}
          onCompleteDayPractice={(doneDay) => onPassGateTestForDay(doneDay)}
        />
      )}

      {/* ON-DEMAND PRACTICE ARENA MODAL */}
      <PracticeArenaModal
        isOpen={isPracticeModalOpen}
        isGatekeepingTest={false}
        targetDayNumber={activeDay}
        languageCode={languageCode}
        cardsToTest={currentDayCards.length > 0 ? currentDayCards : topicCards}
        onCloseOrBackToPrevDay={() => setIsPracticeModalOpen(false)}
        onPassGateTest={() => setIsPracticeModalOpen(false)}
        onCompleteDayPractice={(doneDay) => {
          onCompleteFullDay(doneDay);
          setIsPracticeModalOpen(false);
        }}
      />

      {/* DAY COMPLETED CELEBRATION BANNER */}
      {currentDayStat.isDone && activeCard ? (
        <div className="max-w-4xl mx-auto bg-[#1F5E3B]/8 border border-[#1F5E3B]/30 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5E3B] uppercase tracking-wider">
                ✓ Đã hoàn thành Ngày {activeDay} ({currentDayStat.completed}/
                {currentDayStat.total} từ)
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#181715]">
                Tuyệt vời! Bạn đã nắm trọn 10 từ của Ngày {activeDay}
              </h3>
              <p className="text-xs text-[#57534E]">
                Bạn có thể đọc Hội thoại ứng dụng 10 từ, ôn tập lại hoặc bước sang Ngày{" "}
                {Math.min(10, activeDay + 1)}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsStoryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#9E2A2B] hover:bg-[#F2EFE9]"
            >
              📖 Đọc Hội thoại 10 từ
            </button>
            <button
              type="button"
              onClick={() => setIsPracticeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715] hover:bg-[#F2EFE9]"
            >
              Làm Bài tập Ngày {activeDay}
            </button>
            {activeDay < 10 &&
              daysBreakdown[activeDay] &&
              daysBreakdown[activeDay].total > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectDay(activeDay + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E]"
                >
                  <span>Sang Ngày {activeDay + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      ) : null}

      {/* CENTERED FOCUS STUDIO WORKSPACE (No permanent right sidebar stealing 1/3 width) */}
      {!activeCard ? (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-[#181715] mb-2">
            Ngày {activeDay} của chủ đề &ldquo;{activeTopicMeta.titleVi}&rdquo;
            chưa có từ vựng
          </h3>
          <p className="text-sm text-[#57534E] mb-6">
            Bạn hãy mở Bảng Ngày Học để chọn Ngày 1 hoặc thêm từ vựng mới nhé.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onSelectDay(1)}
              className="px-5 py-2.5 rounded-xl bg-[#181715] text-white text-xs font-semibold"
            >
              Quay về Ngày 1
            </button>
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold"
            >
              + Thêm từ vựng mới
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white border border-[#E5E0D8] rounded-3xl p-5 sm:p-8 shadow-[0_12px_36px_rgba(24,23,21,0.04)]">
          {/* Top Compact Header inside Focus Studio */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#181715]">
                  Ngày {activeDay} • Từ {safeIndex + 1}/{currentDayCards.length}{" "}
                  <span className="font-mono text-[#8A847C]">
                    ({activeCard.level})
                  </span>
                </span>
                {activeTopicMeta.dayThemes?.[activeDay] && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1F5E3B]/10 text-[11px] font-semibold text-[#1F5E3B]">
                    <Sparkles className="w-3 h-3" />
                    {activeTopicMeta.dayThemes[activeDay]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] font-mono text-[#8A847C]">
                  Phím tắt: [Space] Nghe âm • [Enter] Tiếp tục
                </span>
                <span className="font-mono text-xs text-[#1F5E3B] font-bold">
                  Bước {currentStep}/5
                </span>
              </div>
            </div>

            {/* Anti-Spoiler Horizontal 1..10 Word Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {currentDayCards.map((wCard, idx) => {
                const isCurrentWord = idx === safeIndex;
                const isWordDone = wCard.isCompletedInTopic;
                return (
                  <button
                    key={wCard.id}
                    type="button"
                    onClick={() => onPersistCardIndex(activeTopicId, idx)}
                    title={
                      isSpoilerHidden
                        ? `Từ #${idx + 1} (Đang ẩn mặt chữ để kiểm tra trí nhớ)`
                        : `${idx + 1}. ${wCard.term} — ${wCard.meaningVi}`
                    }
                    className={`h-8 px-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      isCurrentWord
                        ? "bg-[#181715] text-white font-semibold shadow-2xs"
                        : isWordDone
                        ? "bg-[#1F5E3B]/12 text-[#1F5E3B] border border-[#1F5E3B]/30"
                        : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#57534E] border border-[#E5E0D8]"
                    }`}
                  >
                    <span className="font-mono font-bold">{idx + 1}</span>
                    {!isSpoilerHidden && (
                      <span className="max-w-[85px] truncate hidden md:inline">
                        {wCard.term}
                      </span>
                    )}
                    {isWordDone && (
                      <span
                        className={`text-[10px] font-bold ${
                          isCurrentWord ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                        }`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 5-Step Progress Pills */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { step: 1, label: "1. Nhìn từ" },
                { step: 2, label: "2. Nghe & Đọc" },
                { step: 3, label: "3. Hiểu sâu" },
                { step: 4, label: "4. Gõ khuyết" },
                { step: 5, label: "5. Ghép câu" },
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isDone = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      if (
                        isAdmin ||
                        item.step <= currentStep ||
                        activeCard.isCompletedInTopic
                      ) {
                        setCurrentStep(item.step as LearningStep);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold text-center transition-all ${
                      isActive
                        ? "bg-[#181715] text-white shadow-2xs"
                        : isDone
                        ? "bg-[#1F5E3B]/15 text-[#1F5E3B]"
                        : "bg-[#F2EFE9] text-[#8A847C]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= STEP 1: NHÌN TỪ (LOOK & COLLOCATION PREVIEW) ================= */}
          {currentStep === 1 && (
            <div className="py-6 text-center space-y-6 animate-in fade-in duration-150">
              <div className="inline-block px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                Bước 1/5: Quan sát kỹ mặt chữ, từ loại và phiên âm chuẩn
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F2EFE9] text-[11px] font-mono uppercase tracking-widest text-[#57534E] mb-2">
                  {activeCard.partOfSpeech}
                </span>
                <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#181715]">
                  {displayTerm}
                </h2>
                {showPhonetics && (
                  <p className="mt-2.5 text-xl font-mono text-[#9E2A2B]">
                    {activeCard.phonetic}
                  </p>
                )}
              </div>

              {/* Quick Collocation Preview Chip so the learner sees how the word combines */}
              {wordEnhancement && (
                <div className="max-w-lg mx-auto bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-3.5 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A847C]">
                    Cụm từ hay đi kèm:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715]">
                    {wordEnhancement.collocationTarget}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    speakText(activeCard.term, languageCode, 0.92);
                    setHasListenedInStep2(true);
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28] transition-all shadow-sm"
                >
                  <span>Đã nhìn rõ mặt chữ → Qua Bước 2 (Nghe & Tập phát âm)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: NGHE TỪ & CHẤM PHÁT ÂM (LISTEN & SPEAK) ================= */}
          {currentStep === 2 && (
            <div className="py-6 text-center space-y-6 animate-in fade-in duration-150">
              <div className="inline-block px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                Bước 2/5: Nghe phát âm bản xứ và bấm mic đọc thử để kiểm tra
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-[#181715]">
                  {displayTerm}
                </h2>
                <p className="mt-2 text-lg font-mono text-[#9E2A2B]">
                  {activeCard.phonetic}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    speakText(activeCard.term, languageCode, 0.94);
                    setHasListenedInStep2(true);
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#1F5E3B] text-white text-sm font-semibold hover:bg-[#18492E] shadow-sm transition-all"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Nghe chuẩn (1.0x)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    speakText(activeCard.term, languageCode, 0.65);
                    setHasListenedInStep2(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] text-sm font-medium transition-all"
                >
                  <Turtle className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Nghe chậm (0.65x)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePronunciationTest}
                  disabled={isRecordingPronunciation}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                    isRecordingPronunciation
                      ? "bg-[#9E2A2B] text-white border-[#9E2A2B] animate-pulse"
                      : "border-[#9E2A2B]/30 bg-[#9E2A2B]/8 text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {isRecordingPronunciation
                      ? "Đang lắng nghe bạn đọc..."
                      : "Đọc thử & Chấm phát âm"}
                  </span>
                </button>
              </div>

              {pronunciationFeedback && (
                <div
                  className={`max-w-md mx-auto p-4 rounded-2xl border text-xs sm:text-sm ${
                    pronunciationFeedback.errorMsg
                      ? "bg-[#B45309]/10 border-[#B45309]/30 text-[#B45309]"
                      : pronunciationFeedback.isMatch
                      ? "bg-[#1F5E3B]/10 border-[#1F5E3B]/30 text-[#1F5E3B]"
                      : "bg-[#9E2A2B]/10 border-[#9E2A2B]/30 text-[#9E2A2B]"
                  }`}
                >
                  {pronunciationFeedback.errorMsg ? (
                    <p className="font-medium">
                      {pronunciationFeedback.errorMsg}
                    </p>
                  ) : pronunciationFeedback.isMatch ? (
                    <p className="font-semibold">
                      🎙️ Phát âm rất tốt! Hệ thống nhận diện bạn đọc:{" "}
                      <strong>&ldquo;{pronunciationFeedback.transcript}&rdquo;</strong>{" "}
                      (Độ khớp ~{pronunciationFeedback.confidencePercent}%)
                    </p>
                  ) : (
                    <p className="font-medium">
                      🎙️ Hệ thống nghe được:{" "}
                      <strong>&ldquo;{pronunciationFeedback.transcript}&rdquo;</strong>.
                      Bạn có thể bấm nghe chậm (0.65x) và đọc thử lại từ{" "}
                      <strong>&ldquo;{displayTerm}&rdquo;</strong> nhé!
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!hasListenedInStep2}
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28] disabled:opacity-40 transition-all"
                >
                  <span>Đã nghe rõ → Qua Bước 3 (Hiểu sâu nghĩa & Ngữ cảnh)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: XEM NGHĨA, CỤM TỪ & CÂU NGỮ CẢNH ================= */}
          {currentStep === 3 && (
            <div className="py-3 space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                  Bước 3/5: Nắm vững nghĩa Tiếng Việt, cụm từ đi kèm và câu ví dụ
                </span>
                <button
                  type="button"
                  onClick={() => speakText(activeCard.term, languageCode, 0.94)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F5E3B]/10 text-xs font-semibold text-[#1F5E3B]"
                >
                  <Volume2 className="w-4 h-4" />
                  {displayTerm} ({activeCard.phonetic})
                </button>
              </div>

              {/* Primary Meaning & Context Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-5 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A847C]">
                    Nghĩa Tiếng Việt cốt lõi:
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#181715]">
                    {activeCard.meaningVi}
                  </h3>
                  {wordEnhancement && (
                    <p className="text-xs sm:text-sm text-[#57534E] pt-1 leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-[#B45309] inline mr-1" />
                      {wordEnhancement.memoryTipVi}
                    </p>
                  )}
                </div>

                {/* Collocations & Highlighted Sentence Box */}
                {wordEnhancement && (
                  <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-5 space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A847C] block">
                      Cụm từ thực tế hay đi kèm (Collocation):
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5">
                      <div>
                        <div className="text-sm font-bold text-[#181715]">
                          {wordEnhancement.collocationTarget}
                        </div>
                        <div className="text-xs text-[#57534E]">
                          Từ khóa: {wordEnhancement.collocationMeaningVi}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          speakText(
                            wordEnhancement.collocationTarget,
                            languageCode,
                            0.92
                          )
                        }
                        className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#1F5E3B]/15 text-[#1F5E3B]"
                        title="Nghe cụm từ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Example Sentence Preview with Word-by-Word Hover Lookup */}
              <div className="rounded-2xl bg-[#1F5E3B]/6 border border-[#1F5E3B]/20 p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#1F5E3B] font-semibold">
                    Câu ví dụ ứng dụng (Di chuột vào từng từ để tra nhanh):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(activeCard.exampleTarget, languageCode, 0.92)
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F5E3B] hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe câu
                  </button>
                </div>

                <div className="text-lg sm:text-xl font-bold text-[#181715]">
                  <HoverableSentence
                    sentence={activeCard.exampleTarget}
                    languageCode={languageCode}
                    allCards={cards}
                  />
                </div>
                {showPhonetics && activeCard.examplePhonetic && (
                  <p className="text-xs font-mono text-[#9E2A2B]">
                    {activeCard.examplePhonetic}
                  </p>
                )}
                <p className="text-sm text-[#57534E] font-medium">
                  → {activeCard.exampleVi}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28]"
                >
                  <span>Qua Bước 4: Ghi nhớ chữ viết (Điền khuyết 3 lần)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: GHI LẠI TỪ 3 LẦN QUA ĐIỀN KHUYẾT ================= */}
          {currentStep === 4 && (
            <div className="py-4 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                  Bước 4/5: Gõ lại từ 3 lần với chữ cái ẩn tăng dần (Lần{" "}
                  {step4Round}/3)
                </span>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((r) => (
                    <span
                      key={r}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${
                        step4Round === r
                          ? "bg-[#9E2A2B] text-white"
                          : step4Round > r
                          ? "bg-[#1F5E3B]/15 text-[#1F5E3B]"
                          : "bg-[#F2EFE9] text-[#8A847C]"
                      }`}
                    >
                      Lần {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#57534E]">
                  <span>
                    Nghĩa:{" "}
                    <strong className="text-[#181715]">
                      {activeCard.meaningVi}
                    </strong>{" "}
                    ({activeCard.phonetic})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(activeCard.term, languageCode, 0.92)
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#E5E0D8] text-xs font-semibold text-[#1F5E3B]"
                    title="Nghe gợi ý phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe âm
                  </button>
                </div>

                <div className="py-2">
                  <span className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.22em] text-[#181715] bg-white px-6 py-3 rounded-2xl border border-[#E5E0D8] inline-block">
                    {maskedWordPreview}
                  </span>
                </div>

                <p className="text-xs text-[#8A847C]">
                  Gõ lại đầy đủ từ vựng để hoàn thành Lần {step4Round}/3:
                </p>
              </div>

              {step4Error && (
                <div className="p-3.5 rounded-xl bg-[#9E2A2B]/10 text-[#9E2A2B] text-xs font-medium">
                  {step4Error}
                </div>
              )}

              <form onSubmit={handleStep4Submit} className="flex gap-2">
                <input
                  type="text"
                  value={step4Input}
                  onChange={(e) => setStep4Input(e.target.value)}
                  placeholder={`Gõ phím hoặc chạm các ký tự bên dưới (Gợi ý: ${maskedWordPreview})...`}
                  className="flex-1 px-4 py-3.5 rounded-2xl border border-[#E5E0D8] text-base font-semibold focus:outline-none focus:border-[#181715]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28]"
                >
                  Xác nhận Lần {step4Round}/3
                </button>
              </form>

              {/* Smart Character / Syllable Tile Picker (Babbel & Memrise style — solves CJK/Accent IME friction) */}
              {step4CharacterTiles.length > 0 && (
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#181715]">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#1F5E3B]" />
                      <span>
                        Bàn phím ký tự thông minh (Chạm để ghép nhanh không cần bộ gõ ngoại ngữ):
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      {displayTerm.includes(" ") && (
                        <button
                          type="button"
                          onClick={() => {
                            playTileClick();
                            setStep4Input((prev) => `${prev} `);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[11px] font-mono font-semibold text-[#181715] hover:bg-[#F2EFE9]"
                        >
                          ␣ Khoảng trắng
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          playTileClick();
                          setStep4Input((prev) =>
                            Array.from(prev).slice(0, -1).join("")
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[11px] font-semibold text-[#57534E] hover:text-[#181715]"
                      >
                        <Delete className="w-3 h-3" />
                        <span>Xóa lùi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playTileClick();
                          setStep4Input("");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[11px] font-semibold text-[#9E2A2B] hover:bg-[#9E2A2B]/10"
                      >
                        Xóa hết
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {step4CharacterTiles.map((ch, idx) => (
                      <button
                        key={`${ch}-${idx}`}
                        type="button"
                        onClick={() => {
                          playTileClick();
                          setStep4Input((prev) =>
                            displayTerm.includes(" ") && displayTerm.length > 12
                              ? prev
                                ? `${prev} ${ch}`
                                : ch
                              : `${prev}${ch}`
                          );
                        }}
                        className="min-w-[40px] h-10 px-3 rounded-xl bg-white hover:bg-[#181715] text-[#181715] hover:text-white border border-[#E5E0D8] font-mono text-base font-bold shadow-2xs transition-all"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 5: DỊCH CÂU ĐA PHƯƠNG THỨC (WORD BANK + KEYBOARD + ĐẢO CHIỀU) ================= */}
          {currentStep === 5 && (
            <div className="py-3 space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                  Bước 5/5: Dịch câu ứng dụng & Ghép cấu trúc câu
                </span>

                <div className="flex items-center gap-2">
                  {/* Switch between Word Bank Tap Mode and Keyboard Mode */}
                  <div className="inline-flex rounded-xl bg-[#F2EFE9] p-0.5 border border-[#E5E0D8]">
                    <button
                      type="button"
                      onClick={() => setStep5Mode("wordbank")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        step5Mode === "wordbank"
                          ? "bg-white text-[#181715] shadow-2xs"
                          : "text-[#57534E]"
                      }`}
                    >
                      <MousePointerClick className="w-3.5 h-3.5 text-[#1F5E3B]" />
                      <span>Chạm ghép từ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep5Mode("keyboard")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        step5Mode === "keyboard"
                          ? "bg-white text-[#181715] shadow-2xs"
                          : "text-[#57534E]"
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>Tự gõ phím</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      speakText(activeCard.exampleTarget, languageCode, 0.92)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F5E3B]/10 text-xs font-semibold text-[#1F5E3B]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe câu mẫu
                  </button>
                </div>
              </div>

              {/* Target Sentence Box */}
              <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#8A847C]">
                  Câu giao tiếp mẫu (Di chuột vào từng từ để tra nghĩa & phát âm):
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#181715]">
                  <HoverableSentence
                    sentence={activeCard.exampleTarget}
                    languageCode={languageCode}
                    allCards={cards}
                  />
                </div>
                {showPhonetics && activeCard.examplePhonetic && (
                  <p className="text-xs font-mono text-[#9E2A2B]">
                    {activeCard.examplePhonetic}
                  </p>
                )}
                <p className="text-xs text-[#57534E] pt-1">
                  Từ mục tiêu: <strong>{displayTerm}</strong> ={" "}
                  {activeCard.meaningVi}
                </p>
              </div>

              {/* MODE A: INTERACTIVE VIETNAMESE WORD BANK */}
              {step5Mode === "wordbank" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#57534E]">
                      Chạm vào các thẻ từ bên dưới để ghép thành câu dịch Tiếng Việt:
                    </span>
                    {selectedWordBankIndices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWordBankIndices([]);
                          setStep5Result(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#9E2A2B] hover:underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Xóa chọn lại
                      </button>
                    )}
                  </div>

                  {/* Assembled Answer Tray */}
                  <div className="min-h-[56px] p-3 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#D6D1C7] flex flex-wrap items-center gap-2">
                    {selectedWordBankIndices.length === 0 ? (
                      <span className="text-xs text-[#8A847C] select-none">
                        Chạm vào các thẻ từ Tiếng Việt phía dưới để xếp vào khay này...
                      </span>
                    ) : (
                      selectedWordBankIndices.map((tileIdx, pos) => (
                        <button
                          key={`${tileIdx}-${pos}`}
                          type="button"
                          onClick={() => {
                            playTileClick();
                            setSelectedWordBankIndices((prev) =>
                              prev.filter((_, i) => i !== pos)
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#181715] text-white text-xs sm:text-sm font-semibold shadow-2xs hover:bg-[#9E2A2B] transition-colors"
                          title="Bấm để bỏ từ này khỏi câu"
                        >
                          {vietnameseWordBankTiles[tileIdx]}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available Word Tiles */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {vietnameseWordBankTiles.map((tile, idx) => {
                      const isUsed = selectedWordBankIndices.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isUsed}
                          onClick={() => {
                            playTileClick();
                            setSelectedWordBankIndices((prev) => [
                              ...prev,
                              idx,
                            ]);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                            isUsed
                              ? "bg-[#F2EFE9] text-[#D6D1C7] border-[#E5E0D8] opacity-40 cursor-not-allowed"
                              : "bg-white hover:bg-[#FAF8F5] text-[#181715] border-[#E5E0D8] shadow-2xs"
                          }`}
                        >
                          {tile}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={selectedWordBankIndices.length === 0}
                      onClick={() => evaluateStep5Translation(step5InputVi)}
                      className="px-6 py-3 rounded-2xl bg-[#181715] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E2C28] disabled:opacity-40"
                    >
                      Kiểm tra câu đã ghép
                    </button>
                  </div>
                </div>
              ) : (
                /* MODE B: FREE KEYBOARD TYPING */
                <form onSubmit={handleStep5Submit} className="space-y-3">
                  <label className="block text-xs font-semibold text-[#57534E]">
                    Nhập nghĩa tiếng Việt của câu trên (không phân biệt hoa/thường hay dấu câu):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={step5InputVi}
                      onChange={(e) => setStep5InputVi(e.target.value)}
                      placeholder="Nhập bản dịch tiếng Việt của bạn..."
                      className="flex-1 px-4 py-3.5 rounded-2xl border border-[#E5E0D8] text-sm sm:text-base font-medium focus:outline-none focus:border-[#181715]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-6 py-3.5 rounded-2xl bg-[#181715] text-white text-xs sm:text-sm font-semibold hover:bg-[#2E2C28]"
                    >
                      Kiểm tra dịch câu
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5 RESULT & OPTIONAL REVERSE FOREIGN SENTENCE CHALLENGE */}
              {step5Result && (
                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    step5Result.isCorrect
                      ? "bg-[#1F5E3B]/8 border-[#1F5E3B]/30"
                      : "bg-[#B45309]/8 border-[#B45309]/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        step5Result.isCorrect
                          ? "text-[#1F5E3B]"
                          : "text-[#B45309]"
                      }`}
                    >
                      {step5Result.message}
                    </p>

                    {!showReverseChallenge && (
                      <button
                        type="button"
                        onClick={() => setShowReverseChallenge(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715] hover:bg-[#FAF8F5]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        <span>Thử thách Đảo chiều: Ghép lại câu ngoại ngữ</span>
                      </button>
                    )}
                  </div>

                  {/* Optional Reverse Challenge: Tap foreign tokens to rebuild exampleTarget */}
                  {showReverseChallenge && (
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#181715]">
                          🔄 Thử thách Đảo chiều: Chạm ghép lại câu {langMeta.nameVi} cho nghĩa &ldquo;{activeCard.exampleVi}&rdquo;
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReverseIndices([]);
                            setReverseCheckPassed(null);
                          }}
                          className="text-xs text-[#9E2A2B] hover:underline"
                        >
                          Làm lại
                        </button>
                      </div>

                      <div className="min-h-[48px] p-2.5 rounded-xl bg-[#FAF8F5] border border-dashed border-[#D6D1C7] flex flex-wrap items-center gap-1.5">
                        {selectedReverseIndices.map((tIdx, pos) => (
                          <button
                            key={`${tIdx}-${pos}`}
                            type="button"
                            onClick={() =>
                              setSelectedReverseIndices((prev) =>
                                prev.filter((_, i) => i !== pos)
                              )
                            }
                            className="px-3 py-1 rounded-lg bg-[#1F5E3B] text-white text-xs sm:text-sm font-semibold"
                          >
                            {targetLangWordBankTiles[tIdx]}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {targetLangWordBankTiles.map((tile, idx) => {
                          const used = selectedReverseIndices.includes(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={used}
                              onClick={() =>
                                setSelectedReverseIndices((prev) => [
                                  ...prev,
                                  idx,
                                ])
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border ${
                                used
                                  ? "opacity-35 bg-[#F2EFE9] border-[#E5E0D8]"
                                  : "bg-[#FAF8F5] hover:bg-[#F2EFE9] border-[#E5E0D8] text-[#181715]"
                              }`}
                            >
                              {tile}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleVerifyReverseChallenge}
                          className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-semibold"
                        >
                          Kiểm tra câu ngoại ngữ
                        </button>
                        {reverseCheckPassed === true && (
                          <span className="text-xs font-bold text-[#1F5E3B]">
                            ✓ Chính xác tuyệt đối! Bạn đã làm chủ cấu trúc câu này!
                          </span>
                        )}
                        {reverseCheckPassed === false && (
                          <span className="text-xs font-semibold text-[#9E2A2B]">
                            Chưa đúng thứ tự. Câu chuẩn: &ldquo;{activeCard.exampleTarget}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleFinishWord5Steps}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F5E3B] text-white text-xs sm:text-sm font-bold hover:bg-[#18492E]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Hoàn thành từ &ldquo;{displayTerm}&rdquo; & Sang từ tiếp
                      theo →
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL / DRAWER: DANH SÁCH 10 TỪ NGÀY HIỆN TẠI ================= */}
      {isWordListDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#181715]">
                  Danh Sách 10 Từ — Ngày {activeDay}
                </h3>
                <p className="text-xs text-[#57534E]">
                  Đã hoàn thành {currentDayStat.completed}/{currentDayStat.total}{" "}
                  từ trong Ngày {activeDay} ({activeTopicMeta.titleVi})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWordListDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {currentDayCards.map((item, idx) => {
                const isCurrent = activeCard?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onPersistCardIndex(activeTopicId, idx);
                      setIsWordListDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? "bg-[#181715] text-white font-semibold"
                        : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border border-[#E5E0D8]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.isCompletedInTopic ? (
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isCurrent ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                          }`}
                        />
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full border shrink-0 inline-block ${
                            isCurrent ? "border-white/50" : "border-[#8A847C]"
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <span className="font-bold">
                          {idx + 1}. {item.term}
                        </span>{" "}
                        <span
                          className={`font-mono ${
                            isCurrent ? "text-white/75" : "text-[#9E2A2B]"
                          }`}
                        >
                          {item.phonetic}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`truncate max-w-[140px] font-medium ${
                        isCurrent ? "text-[#E5E0D8]" : "text-[#57534E]"
                      }`}
                    >
                      {item.meaningVi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HỘI THOẠI ỨNG DỤNG 10 TỪ TRONG NGÀY ================= */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[88vh] flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold">
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Ngữ cảnh thực hành Ngày {activeDay}/10</span>
                </div>
                <h3 className="text-xl font-bold text-[#181715] mt-0.5">
                  Hội Thoại Kết Nối 10 Từ Vựng Ngày {activeDay}
                </h3>
                <p className="text-xs text-[#57534E]">
                  Di chuột vào bất kỳ từ nào trong câu để tra nhanh phiên âm & nghĩa, hoặc bấm biểu tượng loa để nghe từng câu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoryModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {dailyStoryLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#1F5E3B]">
                      <span>{line.speaker} ({line.roleLabel})</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-[#E5E0D8] text-[#181715]">
                        Từ #{idx + 1}: {line.featuredTerm} ({line.featuredMeaningVi})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(line.targetSentence, languageCode, 0.92)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-xs font-semibold text-[#1F5E3B] hover:bg-[#1F5E3B] hover:text-white transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe</span>
                    </button>
                  </div>

                  <div className="text-base sm:text-lg font-bold text-[#181715]">
                    <HoverableSentence
                      sentence={line.targetSentence}
                      languageCode={languageCode}
                      allCards={cards}
                    />
                  </div>
                  {showPhonetics && line.phonetic && (
                    <p className="text-xs font-mono text-[#9E2A2B]">
                      {line.phonetic}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-[#57534E]">
                    → {line.viSentence}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const fullScript = dailyStoryLines
                    .map((l) => l.targetSentence)
                    .join(". ");
                  speakText(fullScript, languageCode, 0.9);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E]"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe liền mạch toàn bộ 10 câu</span>
              </button>
              <button
                type="button"
                onClick={() => setIsStoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#181715] text-white text-xs font-semibold"
              >
                Đóng hội thoại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: CHỌN CHỦ ĐỀ (8 CHỦ ĐỀ) ================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[88vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#181715]">
                  Chọn Chủ Đề Học Tập ({langMeta.nameVi})
                </h3>
                <p className="text-xs text-[#57534E]">
                  Mỗi chủ đề được chia theo lộ trình 10 ngày với độ khó tăng dần từ cơ bản đến nâng cao.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPICS.map((t) => {
                const stat = topicStatsMap[t.id];
                const isSelected = t.id === activeTopicId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectTopic(t.id);
                      setIsTopicModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "bg-[#181715] text-white border-[#181715]"
                        : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">{t.titleVi}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                            isSelected
                              ? "bg-white/15 text-white"
                              : "bg-white text-[#57534E] border border-[#E5E0D8]"
                          }`}
                        >
                          {stat.completed}/{stat.total} từ
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          isSelected ? "text-[#E5E0D8]" : "text-[#57534E]"
                        }`}
                      >
                        {t.subtitleVi}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-mono">
                      <span>{t.levelLabel}</span>
                      {stat.isCompleted && (
                        <span className="text-[#4ADE80] font-semibold">
                          ✓ Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: BẢNG LỘ TRÌNH 10 NGÀY HỌC (LOCK/UNLOCK) ================= */}
      {isDayGridModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[88vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#181715]">
                  Bảng Lộ Trình 10 Ngày — Chủ đề: {activeTopicMeta.titleVi}
                </h3>
                <p className="text-xs text-[#57534E]">
                  Hoàn thành 100% từ vựng hoặc hoàn tất Bài Tập Ôn Luyện để nhận dấu tick xanh ✓ Hoàn thành Ngày và mở khóa Ngày tiếp theo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDayGridModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {daysBreakdown.map((item) => {
                const isCurrent = item.day === activeDay;
                const dayTheme = activeTopicMeta.dayThemes?.[item.day];
                return (
                  <button
                    key={item.day}
                    type="button"
                    disabled={!item.isUnlocked}
                    onClick={() => {
                      onSelectDay(item.day);
                      setIsDayGridModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      !item.isUnlocked
                        ? "bg-[#F2EFE9]/60 border-[#E5E0D8] text-[#8A847C] opacity-65 cursor-not-allowed"
                        : isCurrent
                        ? "bg-[#181715] text-white border-[#181715] shadow-sm"
                        : item.isDone
                        ? "bg-[#1F5E3B]/12 border-[#1F5E3B]/40 text-[#181715]"
                        : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">
                          Ngày {item.day}
                        </span>
                        {!item.isUnlocked ? (
                          <Lock className="w-4 h-4 text-[#8A847C]" />
                        ) : item.isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              isCurrent ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                            }`}
                          />
                        ) : (
                          <Unlock className="w-4 h-4 text-[#B45309]" />
                        )}
                      </div>
                      {dayTheme && (
                        <p
                          className={`text-xs mt-1 leading-snug font-medium ${
                            isCurrent
                              ? "text-[#E5E0D8]"
                              : !item.isUnlocked
                              ? "text-[#8A847C]"
                              : "text-[#57534E]"
                          }`}
                        >
                          {dayTheme}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between">
                      <div className="text-xs font-mono">
                        {item.completed}/{item.total} từ
                      </div>
                      <div className="text-[10px] font-semibold">
                        {!item.isUnlocked
                          ? `Hoàn thành Ngày ${item.day - 1} để mở`
                          : item.isDone
                          ? "✓ Đã hoàn thành"
                          : "Đang mở khóa"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onResetTopicProgress(activeTopicId);
                  setIsDayGridModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#9E2A2B] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại tiến độ chủ đề này về Ngày 1
              </button>
              <button
                type="button"
                onClick={() => setIsDayGridModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-semibold"
              >
                Đóng bảng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
