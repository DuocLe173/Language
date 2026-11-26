"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Zap,
  Timer,
  Flame,
  Trophy,
  Volume2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import {
  playSuccessChime,
  playErrorTone,
  playCelebrationFanfare,
  playTileClick,
} from "@/lib/sound-effects";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface SpeedBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: LanguageCode;
  cardsPool: VocabCard[];
  bestScore: number;
  onFinishBlitz: (score: number, correctCount: number, missedIds: string[]) => void;
}

const BLITZ_DURATION_SECONDS = 60;

export default function SpeedBlitzModal({
  isOpen,
  onClose,
  languageCode,
  cardsPool,
  bestScore,
  onFinishBlitz,
}: SpeedBlitzModalProps) {
  const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;
  const [phase, setPhase] = useState<"ready" | "playing" | "finished">("ready");
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [questionSeed, setQuestionSeed] = useState(0);
  const [flashState, setFlashState] = useState<"idle" | "correct" | "wrong">("idle");

  const validPool = useMemo(
    () => cardsPool.filter((c) => c.term && c.meaningVi),
    [cardsPool]
  );

  const currentQuestion = useMemo(() => {
    if (validPool.length < 4) return null;
    const targetIdx = (questionSeed * 7 + 3) % validPool.length;
    const target = validPool[targetIdx];
    const distractors: VocabCard[] = [];
    for (let offset = 1; offset < validPool.length && distractors.length < 3; offset++) {
      const cand = validPool[(targetIdx + offset * 5) % validPool.length];
      if (cand.id !== target.id && !distractors.some((d) => d.id === cand.id)) {
        distractors.push(cand);
      }
    }
    const options = [target, ...distractors].sort(
      (a, b) =>
        ((a.term.charCodeAt(0) * 13 + questionSeed * 19) % 41) -
        ((b.term.charCodeAt(0) * 17 + questionSeed * 11) % 41)
    );
    return { target, options };
  }, [validPool, questionSeed]);

  const finishGame = useCallback(
    (finalScore: number, finalCorrect: number, finalMissed: string[]) => {
      setPhase("finished");
      playCelebrationFanfare();
      onFinishBlitz(finalScore, finalCorrect, finalMissed);
    },
    [onFinishBlitz]
  );

  // Countdown timer
  useEffect(() => {
    if (!isOpen || phase !== "playing") return;
    if (timeLeft <= 0) {
      finishGame(score, correctCount, missedIds);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isOpen, phase, timeLeft, score, correctCount, missedIds, finishGame]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPhase("ready");
      setTimeLeft(BLITZ_DURATION_SECONDS);
    }
  }, [isOpen]);

  const startGame = () => {
    playTileClick();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setMissedIds([]);
    setTimeLeft(BLITZ_DURATION_SECONDS);
    setQuestionSeed(Math.floor(Math.random() * 97) + 1);
    setFlashState("idle");
    setPhase("playing");
  };

  const handleAnswer = (picked: VocabCard) => {
    if (!currentQuestion || phase !== "playing") return;
    const isCorrect = picked.id === currentQuestion.target.id;

    if (isCorrect) {
      playSuccessChime();
      const nextCombo = combo + 1;
      const multiplier = Math.min(4, 1 + Math.floor(nextCombo / 3));
      const gained = 10 * multiplier;
      setScore((s) => s + gained);
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
      setCorrectCount((c) => c + 1);
      setFlashState("correct");
      speakText(currentQuestion.target.term, languageCode, 1.0);
    } else {
      playErrorTone();
      setCombo(0);
      setMissedIds((prev) => Array.from(new Set([...prev, currentQuestion.target.id])));
      setFlashState("wrong");
    }

    setTimeout(() => {
      setFlashState("idle");
      setQuestionSeed((s) => s + 1);
    }, 220);
  };

  const isNewRecord = phase === "finished" && score > bestScore && score > 0;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Đấu trường tốc độ 60 giây ${langMeta.nameVi}`}
      maxWidthClass="max-w-xl"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[#B45309]/15 text-[#B45309] flex items-center justify-center">
            <Zap className="w-5 h-5 fill-current" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#181715]">
              Đấu Trường Tốc Độ 60 Giây
            </h3>
            <p className="text-xs text-[#57534E]">
              Phản xạ nhanh {langMeta.nameVi} • Kỷ lục hiện tại:{" "}
              <strong className="font-mono text-[#1F5E3B]">
                {Math.max(bestScore, score)} điểm
              </strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng đấu trường tốc độ"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {validPool.length < 4 ? (
        <div className="py-8 text-center text-sm text-[#57534E]">
          Cần ít nhất 4 từ vựng trong ngôn ngữ này để mở Đấu trường tốc độ.
        </div>
      ) : phase === "ready" ? (
        <div className="py-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[#181715] text-[#FBBF24] flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xl font-extrabold text-[#181715]">
              Sẵn sàng bứt tốc phản xạ trong 60 giây?
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
              Trả lời liên tiếp đúng 3 câu để nhân điểm{" "}
              <strong className="text-[#B45309]">x2 → x3 → x4 Combo</strong>. Các từ bấm nhầm sẽ được tự động gom vào sổ từ cần ôn lại!
            </p>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="btn-tactile-green inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Bắt đầu đếm ngược 60s ngay!</span>
          </button>
        </div>
      ) : phase === "finished" ? (
        <div className="py-5 text-center space-y-5 animate-pop">
          <div className="w-16 h-16 rounded-3xl bg-[#1F5E3B]/15 text-[#1F5E3B] flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            {isNewRecord && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B45309] text-white text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> KỶ LỤC MỚI!
              </span>
            )}
            <h4 className="text-3xl font-extrabold text-[#181715] font-mono">
              {score} điểm
            </h4>
            <p className="text-xs sm:text-sm text-[#57534E]">
              Đúng <strong>{correctCount}</strong> từ • Chuỗi dài nhất{" "}
              <strong>🔥 x{maxCombo}</strong>
              {missedIds.length > 0
                ? ` • ${missedIds.length} từ cần chú ý đã được lưu`
                : " • Không sai câu nào!"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={startGame}
              className="btn-tactile-ink inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại phá kỷ lục</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-[#E5E0D8] text-xs font-semibold text-[#57534E]"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        currentQuestion && (
          <div className="space-y-4">
            {/* Live HUD: Timer + Score + Combo */}
            <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl px-4 py-2.5">
              <div
                className={`inline-flex items-center gap-1.5 font-mono text-sm font-extrabold ${
                  timeLeft <= 10 ? "text-[#9E2A2B] animate-pulse" : "text-[#181715]"
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>

              <div className="flex items-center gap-2">
                {combo >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B45309] text-white text-xs font-bold animate-pop">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    x{combo}
                  </span>
                )}
                <span className="font-mono text-sm font-extrabold text-[#1F5E3B]">
                  {score} pts
                </span>
              </div>
            </div>

            {/* Target Word Stage */}
            <div
              className={`p-6 rounded-2xl border-2 text-center space-y-2 transition-colors ${
                flashState === "correct"
                  ? "bg-[#1F5E3B]/10 border-[#1F5E3B]"
                  : flashState === "wrong"
                  ? "bg-[#9E2A2B]/10 border-[#9E2A2B] animate-shake"
                  : "bg-white border-[#E5E0D8]"
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#181715]">
                {currentQuestion.target.term}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono text-[#9E2A2B]">
                  {currentQuestion.target.phonetic}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(currentQuestion.target.term, languageCode, 0.95)
                  }
                  className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] text-[#1F5E3B]"
                  aria-label="Nghe phát âm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Fast-Tap Meaning Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer(opt)}
                  className="btn-tactile-soft p-4 rounded-2xl text-left text-sm font-bold text-[#181715] hover:border-[#181715]"
                >
                  {opt.meaningVi}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </AccessibleModal>
  );
}
