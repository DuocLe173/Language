"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface AudioPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: LanguageCode;
  playlistCards: VocabCard[];
  titleLabel?: string;
}

export default function AudioPodcastModal({
  isOpen,
  onClose,
  languageCode,
  playlistCards,
  titleLabel = "Chế Độ Nghe Thụ Động Rảnh Tay",
}: AudioPodcastModalProps) {
  const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 0.95 | 1.1>(0.95);
  const [loopPlaylist, setLoopPlaylist] = useState(true);
  const [stepPhase, setStepPhase] = useState<"term" | "example">("term");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeIdx = Math.min(currentIdx, Math.max(0, playlistCards.length - 1));
  const activeCard = playlistCards[safeIdx];

  const clearScheduledTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      clearScheduledTimer();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => clearScheduledTimer();
  }, [isOpen]);

  useEffect(() => {
    clearScheduledTimer();
    if (!isOpen || !isPlaying || !activeCard) return;

    if (stepPhase === "term") {
      speakText(activeCard.term, languageCode, speed);
      timerRef.current = setTimeout(() => {
        setStepPhase("example");
      }, Math.round(2400 / speed));
    } else {
      speakText(activeCard.exampleTarget, languageCode, speed);
      const estMs = Math.max(
        3200,
        Math.min(7000, Math.round((activeCard.exampleTarget.length * 85) / speed))
      );
      timerRef.current = setTimeout(() => {
        if (safeIdx + 1 < playlistCards.length) {
          setCurrentIdx((i) => i + 1);
          setStepPhase("term");
        } else if (loopPlaylist) {
          setCurrentIdx(0);
          setStepPhase("term");
        } else {
          setIsPlaying(false);
          setStepPhase("term");
        }
      }, estMs);
    }

    return () => clearScheduledTimer();
  }, [isOpen, isPlaying, activeCard, stepPhase, speed, safeIdx, playlistCards.length, loopPlaylist, languageCode]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearScheduledTimer();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setStepPhase("term");
      setIsPlaying(true);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={titleLabel}
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#1F5E3B]/12 text-[#1F5E3B] flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#181715]">
              {titleLabel}
            </h3>
            <p className="text-xs text-[#57534E]">
              Nghe tắm ngôn ngữ {langMeta.nameVi} tự động ({playlistCards.length} từ đã mở khóa)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng trình phát âm thanh"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!activeCard ? (
        <div className="py-8 text-center text-sm text-[#57534E]">
          Chưa có từ vựng nào để phát. Hãy học ít nhất 1 từ trước nhé!
        </div>
      ) : (
        <div className="space-y-5">
          {/* Dark Studio Audio Card */}
          <div className="rounded-3xl bg-[#181715] text-[#FAF8F5] p-6 text-center space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
              <span>
                Track {safeIdx + 1}/{playlistCards.length}
              </span>
              <span className="inline-flex items-center gap-1 text-[#4ADE80]">
                <Volume2 className="w-3.5 h-3.5" />
                {isPlaying
                  ? stepPhase === "term"
                    ? "Đang đọc từ vựng..."
                    : "Đang đọc câu mẫu..."
                  : "Đang tạm dừng"}
              </span>
            </div>

            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {activeCard.term}
              </div>
              <div className="text-sm font-mono text-[#FCA5A5] mt-1">
                {activeCard.phonetic}
              </div>
              <div className="text-base font-semibold text-[#4ADE80] mt-2">
                {activeCard.meaningVi}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs sm:text-sm space-y-1">
              <p
                className={`font-medium transition-opacity ${
                  stepPhase === "example" && isPlaying
                    ? "text-white"
                    : "text-white/70"
                }`}
              >
                &ldquo;{activeCard.exampleTarget}&rdquo;
              </p>
              <p className="text-xs text-white/55">→ {activeCard.exampleVi}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setStepPhase("term");
                setCurrentIdx((i) =>
                  i > 0 ? i - 1 : Math.max(0, playlistCards.length - 1)
                );
              }}
              className="p-3 rounded-2xl border border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#181715]"
              aria-label="Từ trước"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="btn-tactile-green w-16 h-16 rounded-full flex items-center justify-center shadow-md"
              aria-label={isPlaying ? "Tạm dừng" : "Phát tự động"}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStepPhase("term");
                setCurrentIdx((i) =>
                  i + 1 < playlistCards.length ? i + 1 : 0
                );
              }}
              className="p-3 rounded-2xl border border-[#E5E0D8] hover:bg-[#FAF8F5] text-[#181715]"
              aria-label="Từ tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Speed & Loop Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E0D8]">
            <div className="inline-flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8]">
              {([0.75, 0.95, 1.1] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    speed === s
                      ? "bg-[#181715] text-white"
                      : "text-[#57534E] hover:text-[#181715]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLoopPlaylist((l) => !l)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                loopPlaylist
                  ? "bg-[#1F5E3B]/10 text-[#1F5E3B] border-[#1F5E3B]/30"
                  : "bg-white text-[#57534E] border-[#E5E0D8]"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Lặp lại: {loopPlaylist ? "Bật" : "Tắt"}</span>
            </button>
          </div>
        </div>
      )}
    </AccessibleModal>
  );
}
