"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Volume2,
  Turtle,
  Clock,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { LanguageCode, SRSRating, VocabCard } from "@/types/language";
import { calculateNextReview } from "@/lib/srs";
import { speakText } from "@/lib/speech";
import {
  playTileClick,
  playSuccessChime,
  playCelebrationFanfare,
} from "@/lib/sound-effects";

interface SRSDueReviewModalProps {
  isOpen: boolean;
  languageCode: LanguageCode;
  dueCards: VocabCard[];
  onClose: () => void;
  onReviewCard: (updatedCard: VocabCard) => void;
}

export default function SRSDueReviewModal({
  isOpen,
  languageCode,
  dueCards,
  onClose,
  onReviewCard,
}: SRSDueReviewModalProps) {
  const [queue, setQueue] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQueue(dueCards);
      setCurrentIdx(0);
      setIsRevealed(false);
      setReviewedCount(0);
    }
  }, [isOpen, dueCards]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCard = queue[currentIdx];
  const isFinished = !currentCard || currentIdx >= queue.length;

  const handleRate = (rating: SRSRating) => {
    if (!currentCard) return;
    const srsUpdate = calculateNextReview(currentCard, rating);
    const updated: VocabCard = {
      ...currentCard,
      ...srsUpdate,
      isCompletedInTopic: true,
    };
    onReviewCard(updated);
    setReviewedCount((c) => c + 1);

    if (currentIdx + 1 >= queue.length) {
      playCelebrationFanfare();
    } else {
      playSuccessChime();
    }

    setIsRevealed(false);
    setCurrentIdx((idx) => idx + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ôn tập SRS đến hạn hôm nay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E5E0D8] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#B45309]/12 text-[#B45309] text-xs font-semibold mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Hàng đợi Ôn tập Ngắt quãng (SRS SM-2)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#181715]">
              {isFinished
                ? "Hoàn thành phiên ôn tập SRS hôm nay!"
                : `Ôn lại từ đến hạn (${Math.min(currentIdx + 1, queue.length)}/${queue.length})`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ ôn tập"
            className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinished ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1F5E3B]/12 text-[#1F5E3B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-[#181715]">
                Tuyệt vời! Bạn đã ôn xong {reviewedCount} từ đến hạn.
              </p>
              <p className="text-xs text-[#57534E]">
                Hệ thống SM-2 đã tự động giãn lịch ôn tập tối ưu để đưa các từ này vào trí nhớ dài hạn.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-[#1F5E3B] hover:bg-[#18492E] text-white text-sm font-semibold"
            >
              Quay lại học bài mới
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-[#F2EFE9] overflow-hidden">
              <div
                className="h-full bg-[#1F5E3B] transition-all duration-300"
                style={{
                  width: `${Math.round((currentIdx / Math.max(1, queue.length)) * 100)}%`,
                }}
              />
            </div>

            {/* Card Face */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#181715] tracking-tight">
                {currentCard.term}
              </div>
              <div className="text-sm font-mono text-[#9E2A2B]">
                {currentCard.phonetic} • {currentCard.partOfSpeech}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => speakText(currentCard.term, languageCode, 0.94)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#181715] text-xs font-semibold text-[#181715]"
                >
                  <Volume2 className="w-4 h-4 text-[#1F5E3B]" />
                  <span>Nghe phát âm</span>
                </button>
                <button
                  type="button"
                  onClick={() => speakText(currentCard.term, languageCode, 0.65)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#181715] text-xs font-semibold text-[#57534E]"
                >
                  <Turtle className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Nghe chậm</span>
                </button>
              </div>
            </div>

            {/* Reveal / Answer Panel */}
            {!isRevealed ? (
              <button
                type="button"
                onClick={() => {
                  playTileClick();
                  speakText(currentCard.exampleTarget, languageCode, 0.92);
                  setIsRevealed(true);
                }}
                className="w-full py-4 px-5 rounded-2xl bg-[#181715] hover:bg-[#2E2C28] text-white text-sm font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
                <span>Lật xem nghĩa & Câu ví dụ</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-1.5">
                  <div className="text-base font-bold text-[#1F5E3B]">
                    {currentCard.meaningVi}
                  </div>
                  <p className="text-sm font-medium text-[#181715]">
                    &ldquo;{currentCard.exampleTarget}&rdquo;
                  </p>
                  <p className="text-xs text-[#57534E]">
                    → {currentCard.exampleVi}
                  </p>
                </div>

                {/* 4-Level SM-2 Rating Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B655E] block text-center">
                    Bạn nhớ từ này ở mức nào?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRate("again")}
                      className="py-2.5 px-3 rounded-xl bg-[#9E2A2B]/10 hover:bg-[#9E2A2B]/20 text-[#9E2A2B] text-xs font-bold flex flex-col items-center gap-0.5"
                    >
                      <span className="inline-flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Quên
                      </span>
                      <span className="text-[10px] font-mono opacity-80">10 phút</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate("hard")}
                      className="py-2.5 px-3 rounded-xl bg-[#B45309]/10 hover:bg-[#B45309]/20 text-[#B45309] text-xs font-bold flex flex-col items-center gap-0.5"
                    >
                      <span>Hơi khó</span>
                      <span className="text-[10px] font-mono opacity-80">1 ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate("good")}
                      className="py-2.5 px-3 rounded-xl bg-[#1F5E3B]/12 hover:bg-[#1F5E3B]/20 text-[#1F5E3B] text-xs font-bold flex flex-col items-center gap-0.5"
                    >
                      <span>Đã nhớ</span>
                      <span className="text-[10px] font-mono opacity-80">3 ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRate("easy")}
                      className="py-2.5 px-3 rounded-xl bg-[#181715] hover:bg-[#2E2C28] text-white text-xs font-bold flex flex-col items-center gap-0.5"
                    >
                      <span>Thuộc làu</span>
                      <span className="text-[10px] font-mono opacity-80">4-7 ngày</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
