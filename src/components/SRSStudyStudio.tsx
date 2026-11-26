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
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Headphones,
  LifeBuoy,
} from "lucide-react";
import {
  LanguageCode,
  SRSRating,
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
import {
  WordListDrawerModal,
  DailyStoryModal,
  TopicPickerModal,
  DayRoadmapModal,
} from "@/components/study/StudyModals";

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
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenPlacementTest?: () => void;
  onOpenSpeedBlitz?: () => void;
  onOpenAudioPodcast?: () => void;
  weakCount?: number;
  onOpenRescueDrill?: () => void;
  onOpenDailyQuests?: () => void;
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
  isZenMode = false,
  onToggleZenMode,
  onOpenPlacementTest,
  onOpenSpeedBlitz,
  onOpenAudioPodcast,
  weakCount = 0,
  onOpenRescueDrill,
  onOpenDailyQuests,
}: SRSStudyStudioProps) {
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isDayGridModalOpen, setIsDayGridModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isWordListDrawerOpen, setIsWordListDrawerOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Duolingo-inspired Session Dopamine Engine (XP + Combo + Mentor Cheer)
  const [sessionXp, setSessionXp] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [mentorCheer, setMentorCheer] = useState<string | null>(null);

  const triggerMentorCheer = (msg: string, xpGain: number, incrementCombo = true) => {
    setSessionXp((prev) => prev + xpGain);
    if (incrementCombo) {
      setComboStreak((prev) => prev + 1);
    }
    setMentorCheer(msg);
    setTimeout(() => {
      setMentorCheer((current) => (current === msg ? null : current));
    }, 2600);
  };

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
    return buildTargetLanguageWordBank(activeCard.exampleTarget, languageCode);
  }, [activeCard, languageCode]);

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
      setComboStreak(0);
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
      triggerMentorCheer(
        `🦉 Chuẩn xác! +10 XP • Chuỗi đúng ${comboStreak + 1} liên tiếp!`,
        10,
        true
      );
      setStep4Round((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      triggerMentorCheer(
        `🔥 Vượt trọn 3 vòng gõ khuyết! +15 XP — Sang Bước 5 ghép câu nào!`,
        15,
        true
      );
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
      .join("")
      .toLowerCase()
      .replace(/[.,!?;:"'“”‘’()[\]。！？，、（）「」\s]/g, "")
      .trim();
    const expected = activeCard.exampleTarget
      .toLowerCase()
      .replace(/[.,!?;:"'“”‘’()[\]。！？，、（）「」\s]/g, "")
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

  const handleFinishWord5Steps = (rating: SRSRating = "good") => {
    if (!activeCard) return;
    playCelebrationFanfare();
    triggerMentorCheer(
      `🏆 Tuyệt vời! +25 XP — Bạn vừa nạp sâu từ "${activeCard.term}" vào trí nhớ dài hạn!`,
      25,
      true
    );
    const srsResult = calculateNextReview(activeCard, rating);
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
  const stepMeta: Record<LearningStep, { label: string; accent: string }> = {
    1: { label: "Nhìn mặt chữ", accent: "#181715" },
    2: { label: "Nghe & Phát âm", accent: "#1F5E3B" },
    3: { label: "Hiểu sâu ngữ cảnh", accent: "#1F5E3B" },
    4: { label: "Gõ khuyết 3 vòng", accent: "#B45309" },
    5: { label: "Ghép câu phản xạ", accent: "#9E2A2B" },
  };
  const activeStepInfo = stepMeta[currentStep];
  const isSpoilerHidden = currentStep === 4 || currentStep === 5;

  // Sequential word unlocking: learner must finish the current word before unlocking the next (Duolingo-style linear flow)
  const firstUncompletedIdx = currentDayCards.findIndex(
    (c) => !c.isCompletedInTopic
  );
  const maxUnlockedWordIdx = isAdmin
    ? Math.max(0, currentDayCards.length - 1)
    : firstUncompletedIdx === -1
    ? Math.max(0, currentDayCards.length - 1)
    : firstUncompletedIdx;

  const dayProgressPercent =
    currentDayCards.length > 0
      ? Math.round(
          ((safeIndex + (activeCard?.isCompletedInTopic ? 1 : 0.2)) /
            currentDayCards.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* MINIMAL DISTRACTION-FREE SESSION BAR (1 sleek row aligned to the Hero Stage) */}
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Compact Topic › Day Pill */}
        <div className="inline-flex items-center rounded-2xl bg-white border border-[#E5E0D8] p-1 gap-0.5 shadow-[0_2px_8px_rgba(24,23,21,0.03)] min-w-0">
          <button
            type="button"
            onClick={() => setIsTopicModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#181715] text-white text-xs font-semibold hover:bg-[#2E2C28] truncate max-w-[140px] sm:max-w-[200px]"
            title={`Đổi chủ đề (${activeTopicMeta.titleVi})`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
            <span className="truncate">{activeTopicMeta.titleVi}</span>
          </button>

          <span className="text-[#8A847C] text-xs px-0.5 select-none">›</span>

          <button
            type="button"
            onClick={() => setIsDayGridModalOpen(true)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 ${
              currentDayStat.isDone
                ? "bg-[#1F5E3B]/12 text-[#1F5E3B]"
                : "hover:bg-[#F2EFE9] text-[#181715]"
            }`}
            title="Mở bảng lộ trình 10 ngày"
          >
            {currentDayStat.isDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
            ) : (
              <CalendarDays className="w-3.5 h-3.5 text-[#9E2A2B]" />
            )}
            <span>Ngày {activeDay}</span>
          </button>
        </div>

        {/* Center: Smooth Word Progress Track (Replaces 10 noisy pill buttons) */}
        {currentDayCards.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[240px]">
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={() => onPersistCardIndex(activeTopicId, Math.max(0, safeIndex - 1))}
              className="p-1.5 rounded-lg text-[#57534E] hover:bg-white hover:text-[#181715] disabled:opacity-30"
              title="Từ trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#57534E]">
                <span>Từ {safeIndex + 1}/{currentDayCards.length}</span>
                <span className="text-[#1F5E3B] font-semibold">
                  {currentDayStat.completed}/{currentDayStat.total} ✓
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E5E0D8]/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1F5E3B] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, dayProgressPercent)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              disabled={safeIndex >= maxUnlockedWordIdx}
              onClick={() =>
                onPersistCardIndex(
                  activeTopicId,
                  Math.min(maxUnlockedWordIdx, safeIndex + 1)
                )
              }
              className="p-1.5 rounded-lg text-[#57534E] hover:bg-white hover:text-[#181715] disabled:opacity-30"
              title={
                safeIndex >= maxUnlockedWordIdx
                  ? "Hoàn thành 5 bước của từ hiện tại để mở khóa từ tiếp theo"
                  : "Từ tiếp theo"
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Live Session XP/Combo + Single Compact Tools Popover + Zen Focus Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {sessionXp > 0 && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/25 text-xs font-bold text-[#1F5E3B] animate-pop">
              <span>⚡ +{sessionXp} XP</span>
              {comboStreak >= 2 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#B45309] text-white text-[10px] font-mono">
                  🔥 x{comboStreak}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsToolsMenuOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all ${
              isToolsMenuOpen
                ? "bg-[#181715] text-white border-[#181715]"
                : "bg-white border-[#E5E0D8] text-[#181715] hover:border-[#181715]/40 shadow-[0_2px_8px_rgba(24,23,21,0.03)]"
            }`}
            title="Mở công cụ học tập & cài đặt hiển thị"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Công cụ</span>
          </button>

          {onToggleZenMode && (
            <button
              type="button"
              onClick={onToggleZenMode}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all ${
                isZenMode
                  ? "bg-[#1F5E3B] text-white border-[#1F5E3B] shadow-sm"
                  : "bg-white border-[#E5E0D8] text-[#57534E] hover:text-[#181715] hover:border-[#181715]/40 shadow-[0_2px_8px_rgba(24,23,21,0.03)]"
              }`}
              title={
                isZenMode
                  ? "Thoát Chế độ Tập trung (Hiện lại thanh điều hướng)"
                  : "Bật Chế độ Tập trung Zen (Ẩn mọi thanh điều hướng phụ)"
              }
            >
              {isZenMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Thoát Zen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tập trung</span>
                </>
              )}
            </button>
          )}

          {/* Compact Tools Popover Drawer */}
          {isToolsMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsToolsMenuOpen(false)}
              />
              <div className="absolute right-0 top-12 z-40 w-64 bg-white border border-[#E5E0D8] rounded-2xl shadow-2xl p-2 space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#6B655E]">
                  Luyện tập & Lộ trình Ngày {activeDay}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsPracticeModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Puzzle className="w-4 h-4 text-[#1F5E3B]" />
                    Bài tập tổng hợp ({currentDayCards.length} từ)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsStoryModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpenCheck className="w-4 h-4 text-[#9E2A2B]" />
                    Hội thoại kết nối 10 từ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    setIsWordListDrawerOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-[#1F5E3B]" />
                    Danh sách 10 từ hôm nay
                  </span>
                  <span className="text-[11px] font-mono text-[#6B655E]">
                    {currentDayStat.completed}/{currentDayStat.total}
                  </span>
                </button>
                {onOpenSpeedBlitz && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenSpeedBlitz();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#B45309]/10 text-xs font-bold text-[#B45309]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" />
                      Đấu trường tốc độ 60s
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#B45309]/15">
                      HOT
                    </span>
                  </button>
                )}
                {onOpenRescueDrill && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenRescueDrill();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#9E2A2B]/8 text-xs font-semibold text-[#181715]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4 text-[#9E2A2B]" />
                      <span>
                        🛟 Ôn từ hay sai{weakCount > 0 ? ` (${weakCount} từ)` : ""}
                      </span>
                    </span>
                    {weakCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#9E2A2B] text-white">
                        {weakCount}
                      </span>
                    )}
                  </button>
                )}
                {onOpenDailyQuests && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenDailyQuests();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1F5E3B]/8 text-xs font-semibold text-[#181715]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#1F5E3B]" />
                      <span>🎯 Nhiệm vụ hôm nay</span>
                    </span>
                  </button>
                )}
                {onOpenAudioPodcast && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenAudioPodcast();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-[#1F5E3B]" />
                      Nghe thụ động (Podcast)
                    </span>
                  </button>
                )}
                {onOpenPlacementTest && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenPlacementTest();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#B45309]" />
                      Kiểm tra trình độ đầu vào
                    </span>
                  </button>
                )}

                <div className="my-1 border-t border-[#E5E0D8]" />
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#6B655E]">
                  Cài đặt hiển thị & Âm thanh
                </div>

                <button
                  type="button"
                  onClick={onTogglePhonetics}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-medium text-[#181715]"
                >
                  <span className="inline-flex items-center gap-2">
                    {showPhonetics ? (
                      <Eye className="w-4 h-4 text-[#1F5E3B]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#6B655E]" />
                    )}
                    Phiên âm ({langMeta.phoneticLabel})
                  </span>
                  <span className="text-[11px] font-mono text-[#1F5E3B] font-semibold">
                    {showPhonetics ? "Bật" : "Ẩn"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSoundMute}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-medium text-[#181715]"
                >
                  <span className="inline-flex items-center gap-2">
                    {soundMuted ? (
                      <VolumeX className="w-4 h-4 text-[#9E2A2B]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#1F5E3B]" />
                    )}
                    Âm thanh hiệu ứng
                  </span>
                  <span className="text-[11px] font-mono text-[#1F5E3B] font-semibold">
                    {soundMuted ? "Tắt" : "Bật"}
                  </span>
                </button>

                {isChinese && (
                  <button
                    type="button"
                    onClick={onToggleChineseScript}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-medium text-[#9E2A2B]"
                  >
                    <span>Kiểu chữ Hán</span>
                    <span className="font-mono font-bold">
                      {chineseScript === "simplified" ? "Giản (简)" : "Phồn (繁)"}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenQuickAdd();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-xs font-semibold text-[#181715]"
                >
                  <Plus className="w-4 h-4 text-[#1F5E3B]" />
                  Thêm từ vựng cá nhân
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onCompleteFullDay(activeDay);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#B45309]/10 hover:bg-[#B45309]/20 text-xs font-semibold text-[#B45309]"
                  >
                    <Unlock className="w-4 h-4" />
                    Admin: Hoàn thành nhanh Ngày {activeDay}
                  </button>
                )}

                {totalCount > 0 && (
                  <div className="mt-1 pt-1.5 border-t border-[#E5E0D8] px-3 py-1 flex items-center justify-between text-[11px] text-[#6B655E]">
                    <span>Tổng đã thuộc ({langMeta.shortLabel}):</span>
                    <strong className="font-mono text-[#181715]">
                      {learnedCount}/{totalCount} từ
                    </strong>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* VISUAL 10-WORD LINEAR LEARNING PATH (See all today's words clearly; unlock sequentially after completing each word) */}
      {currentDayCards.length > 0 && (
        <div className="max-w-3xl mx-auto bg-white/85 border border-[#E5E0D8] rounded-2xl px-3.5 py-2.5 shadow-[0_2px_8px_rgba(24,23,21,0.02)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-[#57534E]">
              Lộ trình {currentDayCards.length} từ Ngày {activeDay}
              {activeTopicMeta.dayThemes?.[activeDay]
                ? ` — ${activeTopicMeta.dayThemes[activeDay]}`
                : ""}
            </span>
            <span className="text-[11px] font-mono text-[#6B655E]">
              Học xong từng từ để mở khóa từ tiếp theo
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {currentDayCards.map((wCard, idx) => {
              const isCurrent = idx === safeIndex;
              const isDone = Boolean(wCard.isCompletedInTopic);
              const isUnlocked = idx <= maxUnlockedWordIdx || isDone;
              const hideTermForTest = isCurrent && isSpoilerHidden;

              return (
                <button
                  key={wCard.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      onPersistCardIndex(activeTopicId, idx);
                    }
                  }}
                  title={
                    !isUnlocked
                      ? `🔒 Hoàn thành từ #${maxUnlockedWordIdx + 1} trước để mở khóa Từ ${idx + 1}`
                      : hideTermForTest
                      ? `Từ #${idx + 1} (Đang kiểm tra trí nhớ)`
                      : `${idx + 1}. ${wCard.term} — ${wCard.meaningVi}`
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all border ${
                    isCurrent
                      ? "bg-[#181715] text-white border-[#181715] shadow-xs"
                      : isDone
                      ? "bg-[#1F5E3B]/10 text-[#1F5E3B] border-[#1F5E3B]/30 hover:bg-[#1F5E3B]/18"
                      : isUnlocked
                      ? "bg-white text-[#181715] border-[#E5E0D8] hover:border-[#181715]"
                      : "bg-[#FAF8F5] text-[#6B655E] border-[#E5E0D8]/80 opacity-75 cursor-not-allowed"
                  }`}
                >
                  {!isUnlocked ? (
                    <>
                      <span className="font-mono text-[11px]">Từ {idx + 1}</span>
                      <Lock className="w-3 h-3 shrink-0 opacity-75" />
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] opacity-80">
                        {idx + 1}.
                      </span>
                      <span className="max-w-[96px] truncate">
                        {hideTermForTest ? "•••" : wCard.term}
                      </span>
                      {isDone && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                          }`}
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        <div className="max-w-3xl mx-auto bg-[#1F5E3B]/8 border border-[#1F5E3B]/30 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
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
        <div className="max-w-3xl mx-auto bg-white border border-[#E5E0D8] rounded-[28px] overflow-hidden shadow-[0_24px_60px_rgba(24,23,21,0.06)] transition-all">
          {/* Subtle Dynamic Step Accent Ribbon (Gives clear visual rhythm across Steps 1 → 5) */}
          <div
            className="h-1 w-full transition-colors duration-300"
            style={{ backgroundColor: activeStepInfo.accent }}
          />

          <div className="p-6 sm:p-10">
            {/* Whisper-Quiet 1-Line Stepper Header (Zero Cockpit Clutter) */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E0D8]/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-white shrink-0 transition-colors"
                  style={{ backgroundColor: activeStepInfo.accent }}
                >
                  Bước {currentStep}/5
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#181715] truncate">
                  {activeStepInfo.label}
                </span>
                {activeCard.isCompletedInTopic && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1F5E3B]/10 text-[#1F5E3B] text-[10px] font-bold">
                    ✓ Đã thuộc
                  </span>
                )}
              </div>

              {/* 5 Sleek Progress Segments (Clickable for completed steps) */}
              <div
                className="flex items-center gap-1.5 shrink-0"
                role="tablist"
                aria-label="Tiến trình 5 bước học"
              >
                {([1, 2, 3, 4, 5] as LearningStep[]).map((stepNum) => {
                  const isActive = currentStep === stepNum;
                  const isDone = currentStep > stepNum;
                  const canJump =
                    isAdmin ||
                    stepNum <= currentStep ||
                    activeCard.isCompletedInTopic;
                  return (
                    <button
                      key={stepNum}
                      type="button"
                      disabled={!canJump}
                      onClick={() => {
                        if (canJump) setCurrentStep(stepNum);
                      }}
                      title={`Bước ${stepNum}: ${stepMeta[stepNum].label}`}
                      aria-label={`Bước ${stepNum}: ${stepMeta[stepNum].label}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-8 bg-[#181715]"
                          : isDone
                          ? "w-4 bg-[#1F5E3B]"
                          : "w-3 bg-[#E5E0D8]"
                      } ${canJump ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                    />
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
                  className="btn-tactile-ink inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold shadow-sm"
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
                  className="btn-tactile-green inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold disabled:opacity-40"
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

                  {/* SRS Spaced Repetition Confidence Rating + Finish Word */}
                  <div className="pt-2 border-t border-current/15 space-y-2">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-[#57534E]">
                      Đánh giá độ nhớ từ &ldquo;{displayTerm}&rdquo; để xếp lịch ôn tập SRS:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFinishWord5Steps("hard")}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#B45309] hover:bg-[#B45309]/10 transition-colors"
                      >
                        🔄 Hơi khó (Ôn lại ngày mai)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinishWord5Steps("good")}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs sm:text-sm font-bold hover:bg-[#18492E] transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Đã nắm vững & Sang từ tiếp theo →
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinishWord5Steps("easy")}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715] hover:bg-[#FAF8F5] transition-colors"
                      >
                        ⚡ Thuộc làu (Nhớ lâu • Ôn sau 4-7 ngày)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expressive Duolingo-style Mentor Feedback Strip */}
          {mentorCheer && (
            <div className="mt-5 p-3.5 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/30 text-[#1F5E3B] text-xs sm:text-sm font-bold flex items-center justify-between gap-2 animate-pop">
              <span>{mentorCheer}</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-[#1F5E3B] text-white shrink-0">
                {sessionXp} XP
              </span>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ================= MODULAR ACCESSIBLE MODALS (Esc + Backdrop Dismiss) ================= */}
      <WordListDrawerModal
        isOpen={isWordListDrawerOpen}
        onClose={() => setIsWordListDrawerOpen(false)}
        activeDay={activeDay}
        activeTopicId={activeTopicId}
        activeTopicTitle={activeTopicMeta.titleVi}
        currentDayCards={currentDayCards}
        activeCardId={activeCard?.id}
        maxUnlockedWordIdx={maxUnlockedWordIdx}
        completedCount={currentDayStat.completed}
        totalCount={currentDayStat.total}
        onSelectWordIndex={onPersistCardIndex}
      />

      <DailyStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        activeDay={activeDay}
        languageCode={languageCode}
        showPhonetics={showPhonetics}
        allCards={cards}
        dailyStoryLines={dailyStoryLines}
      />

      <TopicPickerModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        languageNameVi={langMeta.nameVi}
        activeTopicId={activeTopicId}
        topicStatsMap={topicStatsMap}
        onSelectTopic={onSelectTopic}
      />

      <DayRoadmapModal
        isOpen={isDayGridModalOpen}
        onClose={() => setIsDayGridModalOpen(false)}
        activeTopicId={activeTopicId}
        activeTopicMeta={activeTopicMeta}
        activeDay={activeDay}
        daysBreakdown={daysBreakdown}
        onSelectDay={onSelectDay}
        onResetTopicProgress={onResetTopicProgress}
      />
    </div>
  );
}
