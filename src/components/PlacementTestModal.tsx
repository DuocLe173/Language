"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Target,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import {
  playTileClick,
  playSuccessChime,
  playErrorTone,
  playCelebrationFanfare,
} from "@/lib/sound-effects";
import AccessibleModal from "@/components/ui/AccessibleModal";
import { computePlacementUnlockDay } from "@/lib/placement-utils";

interface PlacementQuestion {
  card: VocabCard;
  options: VocabCard[];
  difficultyWeight: number;
}

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: LanguageCode;
  topicCards: VocabCard[];
  onApplyPlacementResult: (recommendedDay: number) => void;
}

export default function PlacementTestModal({
  isOpen,
  onClose,
  languageCode,
  topicCards,
  onApplyPlacementResult,
}: PlacementTestModalProps) {
  const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;

  const questions = useMemo<PlacementQuestion[]>(() => {
    if (topicCards.length < 4) return [];
    const targetDays = [1, 2, 4, 6, 8, 10];
    const picked: VocabCard[] = [];

    for (const d of targetDays) {
      const candidates = topicCards.filter(
        (c) => (c.dayNumber || 1) === d && !picked.some((p) => p.id === c.id)
      );
      if (candidates.length > 0) {
        picked.push(candidates[0]);
      }
    }
    // Fill up to 6 questions if the language has fewer days
    for (const c of topicCards) {
      if (picked.length >= Math.min(6, topicCards.length)) break;
      if (!picked.some((p) => p.id === c.id)) {
        picked.push(c);
      }
    }

    return picked.map((card, idx) => {
      const distractors = topicCards
        .filter((c) => c.id !== card.id)
        .sort(
          (a, b) =>
            ((a.term.charCodeAt(0) + idx * 17) % 31) -
            ((b.term.charCodeAt(0) + idx * 13) % 31)
        )
        .slice(0, 3);
      const options = [card, ...distractors].sort(
        (a, b) =>
          ((a.meaningVi.charCodeAt(0) + idx * 7) % 29) -
          ((b.meaningVi.charCodeAt(0) + idx * 11) % 29)
      );
      return { card, options, difficultyWeight: card.dayNumber || 1 };
    });
  }, [topicCards]);

  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const resetTest = () => {
    setQIndex(0);
    setSelectedId(null);
    setCorrectCount(0);
    setIsCompleted(false);
  };

  const handleClose = () => {
    resetTest();
    onClose();
  };

  const currentQ = questions[qIndex];
  const result = computePlacementUnlockDay(correctCount, questions.length);

  const handleSelectOption = (optionCard: VocabCard) => {
    if (!currentQ || selectedId !== null) return;
    setSelectedId(optionCard.id);
    const isOk = optionCard.id === currentQ.card.id;
    if (isOk) {
      playSuccessChime();
      setCorrectCount((c) => c + 1);
    } else {
      playErrorTone();
    }
    speakText(currentQ.card.term, languageCode, 0.94);

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        playCelebrationFanfare();
        setIsCompleted(true);
      } else {
        setQIndex((prev) => prev + 1);
        setSelectedId(null);
      }
    }, 850);
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel={`Kiểm tra trình độ đầu vào ${langMeta.nameVi}`}
      maxWidthClass="max-w-xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F5E3B]/10 text-[#1F5E3B] text-xs font-semibold mb-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Adaptive Placement Test ({langMeta.nameVi})</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#181715]">
            {isCompleted
              ? "Kết Quả Đánh Giá Trình Độ"
              : `Kiểm tra nhanh 1 phút — Câu ${Math.min(qIndex + 1, questions.length)}/${questions.length}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng kiểm tra trình độ"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {questions.length < 4 ? (
        <div className="py-6 text-center text-sm text-[#57534E]">
          Chủ đề này chưa đủ số lượng từ để tạo bài kiểm tra đầu vào. Bạn có thể vào học trực tiếp từ Ngày 1 nhé!
        </div>
      ) : isCompleted ? (
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-[#1F5E3B]/12 text-[#1F5E3B] flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#B45309] font-bold">
              Trả lời đúng {correctCount}/{questions.length} câu • {result.levelLabel}
            </div>
            <h4 className="text-xl font-bold text-[#181715]">
              Đề xuất bắt đầu tại Ngày {result.recommendedDay}/10
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
              {result.summaryVi}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playTileClick();
                onApplyPlacementResult(result.recommendedDay);
                handleClose();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#18492E] text-white text-sm font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Áp dụng & Mở khóa tới Ngày {result.recommendedDay}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetTest}
              className="px-4 py-3 rounded-2xl border border-[#E5E0D8] text-xs font-semibold text-[#57534E] hover:text-[#181715]"
            >
              Làm lại bài test
            </button>
          </div>
        </div>
      ) : (
        currentQ && (
          <div className="space-y-5">
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#F2EFE9] overflow-hidden">
              <div
                className="h-full bg-[#1F5E3B] transition-all duration-300"
                style={{
                  width: `${Math.round((qIndex / questions.length) * 100)}%`,
                }}
              />
            </div>

            {/* Prompt Card */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B655E]">
                Độ khó: Ngày {currentQ.difficultyWeight} • Chọn nghĩa tiếng Việt chính xác
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#181715]">
                {currentQ.card.term}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono text-[#9E2A2B]">
                  {currentQ.card.phonetic}
                </span>
                <button
                  type="button"
                  onClick={() => speakText(currentQ.card.term, languageCode, 0.94)}
                  className="p-1.5 rounded-lg bg-white border border-[#E5E0D8] text-[#1F5E3B] hover:bg-[#F2EFE9]"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt) => {
                const isPicked = selectedId === opt.id;
                const isRight = opt.id === currentQ.card.id;
                let cls =
                  "bg-white hover:bg-[#FAF8F5] border-[#E5E0D8] text-[#181715]";
                if (selectedId !== null) {
                  if (isRight) {
                    cls = "bg-[#1F5E3B] text-white border-[#1F5E3B] font-bold";
                  } else if (isPicked && !isRight) {
                    cls =
                      "bg-[#9E2A2B]/12 text-[#9E2A2B] border-[#9E2A2B]/40";
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={selectedId !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-all ${cls}`}
                  >
                    <span>{opt.meaningVi}</span>
                    {selectedId !== null && isRight && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    )}
                    {selectedId !== null && isPicked && !isRight && (
                      <XCircle className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </AccessibleModal>
  );
}
