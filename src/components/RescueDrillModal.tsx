"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  LifeBuoy,
  Volume2,
  CheckCircle2,
  Sparkles,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import {
  playSuccessChime,
  playErrorTone,
  playTileClick,
} from "@/lib/sound-effects";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface RescueDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: LanguageCode;
  weakCards: VocabCard[];
  allLangCards: VocabCard[];
  onMasterWeakCard: (cardId: string) => void;
}

export default function RescueDrillModal({
  isOpen,
  onClose,
  languageCode,
  weakCards,
  allLangCards,
  onMasterWeakCard,
}: RescueDrillModalProps) {
  const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;

  const [streakByCardId, setStreakByCardId] = useState<Record<string, number>>(
    {}
  );
  const [cardCursor, setCardCursor] = useState(0);
  const [optionSeed, setOptionSeed] = useState(1);
  const [rescuedCount, setRescuedCount] = useState(0);
  const [rescuedToast, setRescuedToast] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | {
    status: "correct" | "wrong";
    pickedId: string;
    message: string;
  }>(null);

  // Reset session state whenever modal closes or language changes
  useEffect(() => {
    if (!isOpen) {
      setStreakByCardId({});
      setCardCursor(0);
      setOptionSeed(1);
      setRescuedCount(0);
      setRescuedToast(null);
      setFeedback(null);
    }
  }, [isOpen, languageCode]);

  const activeCard = useMemo(() => {
    if (weakCards.length === 0) return null;
    return weakCards[cardCursor % weakCards.length];
  }, [weakCards, cardCursor]);

  const currentOptions = useMemo(() => {
    if (!activeCard) return [];
    const pool = allLangCards.filter(
      (c) => c.id !== activeCard.id && Boolean(c.meaningVi)
    );
    const distractors: VocabCard[] = [];
    const step = Math.max(1, (optionSeed % 5) + 2);
    for (
      let i = 0;
      i < pool.length && distractors.length < 3;
      i++
    ) {
      const cand = pool[(optionSeed * 3 + i * step) % pool.length];
      if (
        cand &&
        cand.meaningVi !== activeCard.meaningVi &&
        !distractors.some((d) => d.id === cand.id || d.meaningVi === cand.meaningVi)
      ) {
        distractors.push(cand);
      }
    }

    return [activeCard, ...distractors].sort((a, b) => {
      const hashA =
        (a.term.charCodeAt(0) * 17 + a.meaningVi.length * 7 + optionSeed * 13) %
        53;
      const hashB =
        (b.term.charCodeAt(0) * 19 + b.meaningVi.length * 5 + optionSeed * 11) %
        53;
      return hashA - hashB;
    });
  }, [activeCard, allLangCards, optionSeed]);

  const activeStreak = activeCard ? streakByCardId[activeCard.id] || 0 : 0;

  const handleSelectOption = (picked: VocabCard) => {
    if (!activeCard || feedback) return;
    playTileClick();

    const isCorrect = picked.id === activeCard.id;

    if (isCorrect) {
      playSuccessChime();
      speakText(activeCard.term, languageCode, 0.95);
      const nextStreak = activeStreak + 1;

      if (nextStreak >= 2) {
        const rescuedTerm = activeCard.term;
        setRescuedCount((c) => c + 1);
        setRescuedToast(
          `🎉 Đã giải cứu "${rescuedTerm}" (2/2 đúng liên tiếp)!`
        );
        setStreakByCardId((prev) => {
          const copy = { ...prev };
          delete copy[activeCard.id];
          return copy;
        });
        onMasterWeakCard(activeCard.id);
        setOptionSeed((s) => s + 1);
        setTimeout(() => {
          setRescuedToast((curr) =>
            curr?.includes(rescuedTerm) ? null : curr
          );
        }, 2800);
      } else {
        setStreakByCardId((prev) => ({
          ...prev,
          [activeCard.id]: nextStreak,
        }));
        setFeedback({
          status: "correct",
          pickedId: picked.id,
          message: "Chuẩn xác! Đúng thêm 1 lần nữa để giải cứu từ này.",
        });
        setTimeout(() => {
          setFeedback(null);
          setCardCursor((c) => (weakCards.length > 1 ? c + 1 : c));
          setOptionSeed((s) => s + 1);
        }, 650);
      }
    } else {
      playErrorTone();
      setStreakByCardId((prev) => ({
        ...prev,
        [activeCard.id]: 0,
      }));
      setFeedback({
        status: "wrong",
        pickedId: picked.id,
        message: `Chưa đúng — Nghĩa đúng là: "${activeCard.meaningVi}"`,
      });
      setTimeout(() => {
        setFeedback(null);
        setCardCursor((c) => (weakCards.length > 1 ? c + 1 : c));
        setOptionSeed((s) => s + 1);
      }, 1150);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Ôn cấp tốc từ hay sai ${langMeta.nameVi}`}
      maxWidthClass="max-w-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#9E2A2B]/12 text-[#9E2A2B] flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#181715]">
              🛟 Ôn Cấp Tốc Từ Hay Sai
            </h3>
            <p className="text-xs text-[#57534E]">
              Rescue Drill • {langMeta.nameVi} • Trả lời đúng{" "}
              <strong className="text-[#1F5E3B]">2 lần liên tiếp</strong> để
              giải cứu từ
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng ôn cấp tốc từ hay sai"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Rescue Celebration Banner */}
      {rescuedToast && (
        <div className="px-4 py-2.5 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/30 text-xs sm:text-sm font-bold text-[#1F5E3B] flex items-center gap-2 animate-pop">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{rescuedToast}</span>
        </div>
      )}

      {/* Empty / All Rescued State */}
      {weakCards.length === 0 ? (
        <div className="py-8 text-center space-y-4 animate-pop">
          <div className="w-16 h-16 rounded-3xl bg-[#1F5E3B]/12 text-[#1F5E3B] flex items-center justify-center mx-auto">
            {rescuedCount > 0 ? (
              <Trophy className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-lg font-extrabold text-[#181715]">
              {rescuedCount > 0
                ? `Xuất sắc! Đã giải cứu trọn vẹn ${rescuedCount} từ!`
                : "Tuyệt vời! Bạn hiện không có từ hay sai nào cần giải cứu."}
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {rescuedCount > 0
                ? "Tất cả từ hay sai trong ngôn ngữ này đã được xóa khỏi danh sách cảnh báo."
                : "Các từ bạn trả lời nhầm trong Đấu trường tốc độ 60s sẽ tự động xuất hiện tại đây để ôn cấp tốc."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-ink inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
          >
            <span>Quay lại học tiếp</span>
          </button>
        </div>
      ) : (
        activeCard && (
          <div className="space-y-4">
            {/* Compact Status Bar */}
            <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl px-4 py-2.5 text-xs">
              <div className="inline-flex items-center gap-1.5 font-semibold text-[#9E2A2B]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Còn {weakCards.length} từ cần giải cứu</span>
              </div>
              <div className="inline-flex items-center gap-2">
                {rescuedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#1F5E3B]/12 text-[#1F5E3B] font-bold">
                    ✓ Đã giải cứu: {rescuedCount}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#181715]">
                  Tiến độ từ này:
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      activeStreak >= 1 ? "bg-[#1F5E3B]" : "bg-[#E5E0D8]"
                    }`}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      activeStreak >= 2 ? "bg-[#1F5E3B]" : "bg-[#E5E0D8]"
                    }`}
                  />
                  <span className="text-[#1F5E3B] ml-0.5">{activeStreak}/2</span>
                </span>
              </div>
            </div>

            {/* Active Weak Word Card */}
            <div
              className={`p-6 rounded-2xl border-2 text-center space-y-2.5 transition-colors ${
                feedback?.status === "correct"
                  ? "bg-[#1F5E3B]/10 border-[#1F5E3B]"
                  : feedback?.status === "wrong"
                  ? "bg-[#9E2A2B]/10 border-[#9E2A2B] animate-shake"
                  : "bg-white border-[#E5E0D8]"
              }`}
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#57534E]">
                Chọn nghĩa tiếng Việt đúng
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#181715]">
                {activeCard.term}
              </div>
              <div className="flex items-center justify-center gap-2">
                {activeCard.phonetic && (
                  <span className="text-xs font-mono text-[#9E2A2B]">
                    {activeCard.phonetic}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => speakText(activeCard.term, languageCode, 0.92)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#E5E0D8] text-xs font-semibold text-[#1F5E3B]"
                  aria-label="Nghe phát âm từ cần ôn"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe</span>
                </button>
              </div>
            </div>

            {/* Feedback Banner */}
            {feedback && (
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border ${
                  feedback.status === "correct"
                    ? "bg-[#1F5E3B]/10 border-[#1F5E3B]/30 text-[#1F5E3B]"
                    : "bg-[#9E2A2B]/10 border-[#9E2A2B]/30 text-[#9E2A2B]"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {/* 4-Choice Meaning Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentOptions.map((opt) => {
                const isPicked = feedback?.pickedId === opt.id;
                const isAnswer = opt.id === activeCard.id;
                let stateClass =
                  "btn-tactile-soft text-[#181715] hover:border-[#181715]";
                if (feedback) {
                  if (isAnswer) {
                    stateClass =
                      "bg-[#1F5E3B]/15 border-2 border-[#1F5E3B] text-[#1F5E3B]";
                  } else if (isPicked && !isAnswer) {
                    stateClass =
                      "bg-[#9E2A2B]/12 border-2 border-[#9E2A2B] text-[#9E2A2B]";
                  } else {
                    stateClass =
                      "bg-[#FAF8F5] border border-[#E5E0D8] text-[#8A847C] opacity-60";
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(feedback)}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl text-left text-sm font-bold transition-all ${stateClass}`}
                  >
                    {opt.meaningVi}
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
