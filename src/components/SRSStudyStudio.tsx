"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Volume2,
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
  Trophy,
  X,
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
import { speakText } from "@/lib/speech";
import PracticeArenaModal from "@/components/PracticeArenaModal";
import { HoverableSentence } from "@/components/HoverWordTooltip";

interface SRSStudyStudioProps {
  languageCode: LanguageCode;
  activeTopicId: TopicId;
  topicProgress: TopicProgress;
  cards: VocabCard[];
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

  // 5-Step Fixed Learning Flow State Machine
  const [currentStep, setCurrentStep] = useState<LearningStep>(1);
  const [hasListenedInStep2, setHasListenedInStep2] = useState(false);

  // Step 4: 3-round progressive cloze typing (e.g. He_lo -> He__o -> _el__)
  const [step4Round, setStep4Round] = useState<1 | 2 | 3>(1);
  const [step4Input, setStep4Input] = useState("");
  const [step4Error, setStep4Error] = useState<string | null>(null);

  // Step 5: Basic sentence translation
  const [step5InputVi, setStep5InputVi] = useState("");
  const [step5Result, setStep5Result] = useState<null | {
    isCorrect: boolean;
    message: string;
  }>(null);

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
    setStep4Round(1);
    setStep4Input("");
    setStep4Error(null);
    setStep5InputVi("");
    setStep5Result(null);
  }, [activeCard?.id, activeDay, activeTopicId, languageCode]);

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
      const isUnlocked = d <= unlockedDay;
      const gatePassed =
        d === 1 || topicProgress.gateTestPassedDays.includes(d);
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
  }, [topicCards, unlockedDay, topicProgress.gateTestPassedDays]);

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

  const maskedWordPreview = useMemo(() => {
    if (!activeCard) return "";
    return generateMaskedWord(displayTerm, step4Round);
  }, [activeCard, displayTerm, step4Round]);

  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;

    const isMatch = verifyStep4WordInput(
      step4Input,
      activeCard.term,
      activeCard.traditionalTerm
    );

    if (!isMatch) {
      setStep4Error(
        `Chưa chính xác. Hãy nhìn gợi ý khuyết "${maskedWordPreview}" và gõ lại đầy đủ từ "${displayTerm}" nhé!`
      );
      return;
    }

    setStep4Error(null);
    setStep4Input("");
    speakText(activeCard.term, languageCode, 0.94);

    if (step4Round < 3) {
      setStep4Round((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      setCurrentStep(5);
    }
  };

  const handleStep5Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard || !step5InputVi.trim()) return;

    const check = verifyStep5SentenceTranslation(
      step5InputVi,
      activeCard.exampleVi,
      activeCard.acceptedTranslationsVi
    );

    if (check.isCorrect) {
      setStep5Result({
        isCorrect: true,
        message: `✓ Dịch chuẩn xác! Nghĩa mẫu: "${activeCard.exampleVi}"`,
      });
      speakText(activeCard.exampleTarget, languageCode, 0.94);
    } else {
      setStep5Result({
        isCorrect: false,
        message: `Gợi ý nghĩa chuẩn: "${activeCard.exampleVi}". Bạn hãy nhập lại hoặc bấm Hoàn thành sau khi đã nắm rõ nghĩa câu nhé!`,
      });
    }
  };

  const handleFinishWord5Steps = () => {
    if (!activeCard) return;
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

  return (
    <div className="space-y-6">
      {/* Compact Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-[0_2px_10px_rgba(24,23,21,0.03)]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button 1: Open Topic Modal */}
          <button
            type="button"
            onClick={() => setIsTopicModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181715] text-white text-xs sm:text-sm font-medium hover:bg-[#2E2C28] transition-all"
          >
            <FolderKanban className="w-4 h-4 text-[#1F5E3B]" />
            <span>Chủ đề: {activeTopicMeta.titleVi}</span>
          </button>

          {/* Button 2: Open 10-Day Curriculum Table Modal (with Green Tick when Day is Completed!) */}
          <button
            type="button"
            onClick={() => setIsDayGridModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
              currentDayStat.isDone
                ? "bg-[#1F5E3B]/12 border-[#1F5E3B]/40 text-[#1F5E3B]"
                : "bg-[#FAF8F5] border-[#E5E0D8] hover:border-[#181715] text-[#181715]"
            }`}
          >
            {currentDayStat.isDone ? (
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
            ) : (
              <CalendarDays className="w-4 h-4 text-[#9E2A2B]" />
            )}
            <span>
              Ngày {activeDay}/10 ({currentDayStat.completed}/
              {currentDayStat.total} từ)
            </span>
            {currentDayStat.isDone && (
              <span className="px-2 py-0.5 rounded-md bg-[#1F5E3B] text-white text-[10px] font-bold">
                ✓ Đã hoàn thành
              </span>
            )}
          </button>

          {/* Button 3: Open Interactive Practice Arena Modal */}
          <button
            type="button"
            onClick={() => setIsPracticeModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1F5E3B]/10 text-[#1F5E3B] hover:bg-[#1F5E3B]/20 text-xs sm:text-sm font-semibold transition-all"
          >
            <Puzzle className="w-4 h-4" />
            <span>Làm Bài Tập Ôn Luyện (Đủ {currentDayCards.length} từ)</span>
          </button>
        </div>

        {/* Right Controls: Phonetics + Script + Add Word */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTogglePhonetics}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs font-medium text-[#57534E] hover:text-[#181715]"
          >
            {showPhonetics ? (
              <Eye className="w-3.5 h-3.5 text-[#1F5E3B]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            {langMeta.phoneticLabel}: {showPhonetics ? "Bật" : "Ẩn"}
          </button>

          {isChinese && (
            <button
              onClick={onToggleChineseScript}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs font-medium text-[#9E2A2B] bg-[#9E2A2B]/5"
            >
              Chữ Hán:{" "}
              {chineseScript === "simplified" ? "Giản thể (简)" : "Phồn thể (繁)"}
            </button>
          )}

          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-medium hover:bg-[#18492E]"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm từ
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

      {/* DAY COMPLETED CELEBRATION BANNER WITH GREEN CHECKMARK */}
      {currentDayStat.isDone && activeCard ? (
        <div className="bg-[#1F5E3B]/8 border border-[#1F5E3B]/30 rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5E3B] uppercase tracking-wider">
                ✓ Đã hoàn thành Ngày {activeDay} ({currentDayStat.completed}/
                {currentDayStat.total} từ)
              </div>
              <h3 className="text-lg font-bold text-[#181715] mt-0.5">
                Chúc mừng! Ngày {activeDay} đã có dấu tick xanh hoàn thành!
              </h3>
              <p className="text-xs text-[#57534E]">
                Ngày {Math.min(10, activeDay + 1)} đã được mở khóa. Bạn có thể làm lại bài tập tổng hợp hoặc chuyển sang Ngày {Math.min(10, activeDay + 1)}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPracticeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715] hover:bg-[#F2EFE9]"
            >
              Làm lại Bài tập Ngày {activeDay}
            </button>
            {activeDay < 10 &&
              daysBreakdown[activeDay] &&
              daysBreakdown[activeDay].total > 0 && (
                <button
                  onClick={() => onSelectDay(activeDay + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E]"
                >
                  <span>
                    Sang Ngày {activeDay + 1} (Kiểm tra đầu giờ)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      ) : null}

      {/* MAIN 5-STEP INTERACTIVE LEARNING WORKSPACE */}
      {!activeCard ? (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-[#181715] mb-2">
            Ngày {activeDay} của chủ đề &ldquo;{activeTopicMeta.titleVi}&rdquo; chưa có từ vựng
          </h3>
          <p className="text-sm text-[#57534E] mb-6">
            Bạn hãy mở Bảng Ngày Học để chọn Ngày 1 hoặc thêm từ vựng mới nhé.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onSelectDay(1)}
              className="px-5 py-2.5 rounded-xl bg-[#181715] text-white text-xs font-semibold"
            >
              Quay về Ngày 1
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="px-5 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold"
            >
              + Thêm từ vựng mới
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Focused 5-Step Word Card */}
          <div className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-10 shadow-[0_12px_36px_rgba(24,23,21,0.04)]">
            {/* Step Progress Indicator (Steps 1 -> 5) */}
            <div className="mb-8">
              {activeTopicMeta.dayThemes?.[activeDay] && (
                <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/25 text-xs font-semibold text-[#1F5E3B]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Nhóm phân loại Ngày {activeDay}:{" "}
                    {activeTopicMeta.dayThemes[activeDay]}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#57534E] mb-3">
                <span className="font-semibold text-[#181715]">
                  Ngày {activeDay} • Từ {safeIndex + 1}/{currentDayCards.length}{" "}
                  ({activeCard.level})
                </span>
                <span className="font-mono text-[#1F5E3B] font-semibold">
                  Quy trình 5 Bước: Bước {currentStep}/5
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { step: 1, label: "1. Nhìn từ" },
                  { step: 2, label: "2. Nghe từ" },
                  { step: 3, label: "3. Xem nghĩa" },
                  { step: 4, label: "4. Gõ khuyết" },
                  { step: 5, label: "5. Dịch câu" },
                ].map((item) => {
                  const isActive = currentStep === item.step;
                  const isDone = currentStep > item.step;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        if (
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

            {/* ================= STEP 1: NHÌN TỪ (LOOK) ================= */}
            {currentStep === 1 && (
              <div className="py-8 text-center space-y-6 animate-in fade-in duration-150">
                <div className="inline-block px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                  Bước 1/5: Nhìn kỹ mặt chữ, từ loại và phiên âm
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#8A847C] block mb-2">
                    {activeCard.partOfSpeech}
                  </span>
                  <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#181715]">
                    {displayTerm}
                  </h2>
                  {showPhonetics && (
                    <p className="mt-3 text-xl font-mono text-[#9E2A2B]">
                      {activeCard.phonetic}
                    </p>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      speakText(activeCard.term, languageCode, 0.92);
                      setHasListenedInStep2(true);
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28] transition-all shadow-sm"
                  >
                    <span>Đã nhìn rõ mặt chữ → Qua Bước 2 (Nghe từ)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: NGHE TỪ (LISTEN) ================= */}
            {currentStep === 2 && (
              <div className="py-8 text-center space-y-6 animate-in fade-in duration-150">
                <div className="inline-block px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                  Bước 2/5: Bấm nghe phát âm chuẩn và đọc nhẩm theo
                </div>

                <div>
                  <h2 className="text-4xl sm:text-5xl font-bold text-[#181715]">
                    {displayTerm}
                  </h2>
                  <p className="mt-2 text-lg font-mono text-[#9E2A2B]">
                    {activeCard.phonetic}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      speakText(activeCard.term, languageCode, 0.94);
                      setHasListenedInStep2(true);
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-[#1F5E3B] text-white text-sm font-semibold hover:bg-[#18492E] shadow-sm transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>Bấm nghe phát âm chuẩn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      speakText(activeCard.term, languageCode, 0.65);
                      setHasListenedInStep2(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] text-sm font-medium transition-all"
                  >
                    <Turtle className="w-4 h-4 text-[#9E2A2B]" />
                    <span>Nghe chậm (0.65x)</span>
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    disabled={!hasListenedInStep2}
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28] disabled:opacity-40 transition-all"
                  >
                    <span>Đã nghe rõ → Qua Bước 3 (Xem nghĩa)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: XEM NGHĨA (MEANING) ================= */}
            {currentStep === 3 && (
              <div className="py-4 space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                    Bước 3/5: Hiểu nghĩa tiếng Việt và ngữ cảnh sử dụng
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(activeCard.term, languageCode, 0.94)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F5E3B]"
                  >
                    <Volume2 className="w-4 h-4" />
                    {displayTerm} ({activeCard.phonetic})
                  </button>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 space-y-2">
                  <span className="text-xs font-mono uppercase text-[#8A847C]">
                    Nghĩa Tiếng Việt:
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#181715]">
                    {activeCard.meaningVi}
                  </h3>
                  {activeCard.naturalContextVi && (
                    <p className="text-sm text-[#57534E] pt-1 leading-relaxed">
                      💬 {activeCard.naturalContextVi}
                    </p>
                  )}
                </div>

                {activeCard.notes && (
                  <div className="rounded-2xl bg-[#1F5E3B]/6 border border-[#1F5E3B]/20 p-4 text-xs sm:text-sm text-[#181715]">
                    <strong className="text-[#1F5E3B]">💡 Ghi chú: </strong>
                    {activeCard.notes}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-semibold hover:bg-[#2E2C28]"
                  >
                    <span>Qua Bước 4: Ghi lại từ 3 lần (Điền khuyết)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: GHI LẠI TỪ 3 LẦN QUA ĐIỀN KHUYẾT ================= */}
            {currentStep === 4 && (
              <div className="py-4 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
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
                  <div className="text-xs text-[#57534E]">
                    Nghĩa:{" "}
                    <strong className="text-[#181715]">
                      {activeCard.meaningVi}
                    </strong>{" "}
                    ({activeCard.phonetic})
                  </div>

                  <div className="py-3">
                    <span className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.22em] text-[#181715] bg-white px-6 py-3 rounded-2xl border border-[#E5E0D8] inline-block">
                      {maskedWordPreview}
                    </span>
                  </div>

                  <p className="text-xs text-[#8A847C]">
                    Hãy gõ lại đầy đủ từ vựng để hoàn thành Lần {step4Round}/3:
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
                    placeholder={`Gõ lại từ đầy đủ (Gợi ý: ${maskedWordPreview})...`}
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
              </div>
            )}

            {/* ================= STEP 5: DỊCH CÂU CƠ BẢN CHỨA TỪ ĐÓ ================= */}
            {currentStep === 5 && (
              <div className="py-4 space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono text-[#57534E]">
                    Bước 5/5: Dịch câu cơ bản chứa từ &ldquo;{displayTerm}&rdquo;
                    sang Tiếng Việt
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(activeCard.exampleTarget, languageCode, 0.92)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1F5E3B]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe câu mẫu
                  </button>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-6 space-y-2">
                  <span className="text-xs font-mono uppercase text-[#8A847C]">
                    Câu giao tiếp cơ bản (Di chuột vào từng từ để xem phát âm & nghĩa):
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
                    Từ vừa học: <strong>{displayTerm}</strong> ={" "}
                    {activeCard.meaningVi}
                  </p>
                </div>

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

                {step5Result && (
                  <div
                    className={`p-5 rounded-2xl border space-y-3 ${
                      step5Result.isCorrect
                        ? "bg-[#1F5E3B]/10 border-[#1F5E3B]/30"
                        : "bg-[#B45309]/10 border-[#B45309]/30"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        step5Result.isCorrect
                          ? "text-[#1F5E3B]"
                          : "text-[#B45309]"
                      }`}
                    >
                      {step5Result.message}
                    </p>
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

          {/* Right 4 Cols: Current Day Word Queue */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 shadow-[0_4px_20px_rgba(24,23,21,0.03)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#57534E]">
                  Danh Sách Từ Ngày {activeDay} ({currentDayStat.completed}/
                  {currentDayStat.total})
                </h3>
                {currentDayStat.isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#1F5E3B]" />
                )}
              </div>

              <div className="w-full h-2 rounded-full bg-[#F2EFE9] overflow-hidden mb-4">
                <div
                  className="h-full bg-[#1F5E3B] transition-all duration-300"
                  style={{
                    width: `${
                      currentDayStat.total > 0
                        ? Math.round(
                            (currentDayStat.completed / currentDayStat.total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {currentDayCards.map((item, idx) => {
                  const isCurrent = item.id === activeCard.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onPersistCardIndex(activeTopicId, idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors ${
                        isCurrent
                          ? "bg-[#181715] text-white font-semibold"
                          : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.isCompletedInTopic ? (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isCurrent ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                            }`}
                          />
                        ) : (
                          <span
                            className={`w-3.5 h-3.5 rounded-full border shrink-0 inline-block ${
                              isCurrent
                                ? "border-white/50"
                                : "border-[#8A847C]"
                            }`}
                          />
                        )}
                        <span className="truncate">
                          {idx + 1}. {item.term}
                        </span>
                      </div>
                      <span
                        className={`truncate max-w-[110px] ${
                          isCurrent ? "text-[#E5E0D8]" : "text-[#8A847C]"
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
