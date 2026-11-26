"use client";

import React, { useState } from "react";
import {
  X,
  Trophy,
  Flame,
  Copy,
  Check,
  Snowflake,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { LanguageCode, UserProfile } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface AchievementShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  languageCode: LanguageCode;
  learnedCount: number;
  totalCount: number;
}

export default function AchievementShareModal({
  isOpen,
  onClose,
  user,
  languageCode,
  learnedCount,
  totalCount,
}: AchievementShareModalProps) {
  const [copied, setCopied] = useState(false);
  const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;
  const freezes = user.streakFreezes ?? 2;

  const shareText = `🏆 Thành tích học ${langMeta.nameVi} của ${user.name} trên LinguaForge Studio:\n🔥 Chuỗi học liên tiếp: ${user.streakDays} ngày\n📚 Đã làm chủ: ${learnedCount}/${totalCount} từ vựng thực chiến (Active Recall 5 bước)\n👉 Trải nghiệm học thử miễn phí tại: https://learnlanguage-beige.vercel.app`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Thẻ thành tích học tập LinguaForge"
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#B45309]" />
          <h3 className="text-lg font-bold text-[#181715]">
            Thẻ Thành Tích & Bảo Vệ Chuỗi
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thẻ thành tích"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Editorial Certificate Card */}
      <div className="rounded-3xl bg-[#181715] text-[#FAF8F5] p-6 space-y-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#1F5E3B]/35 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#181715] flex items-center justify-center font-bold text-lg">
              文
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">
                LinguaForge Studio
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                Verified Polyglot Progress
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#1F5E3B] text-white text-[11px] font-semibold">
            {langMeta.nameVi}
          </span>
        </div>

        <div>
          <div className="text-xs text-white/65">Học viên</div>
          <div className="text-2xl font-extrabold tracking-tight">
            {user.name}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/8 border border-white/10">
            <div className="inline-flex items-center gap-1 text-[11px] text-[#FBBF24] font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Streak</span>
            </div>
            <div className="text-xl font-extrabold mt-1">
              {user.streakDays} ngày
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/8 border border-white/10">
            <div className="inline-flex items-center gap-1 text-[11px] text-[#4ADE80] font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đã thuộc</span>
            </div>
            <div className="text-xl font-extrabold mt-1">
              {learnedCount} từ
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/8 border border-white/10">
            <div className="inline-flex items-center gap-1 text-[11px] text-[#93C5FD] font-semibold">
              <Snowflake className="w-3.5 h-3.5" />
              <span>Freeze</span>
            </div>
            <div className="text-xl font-extrabold mt-1">
              {freezes} lá chắn
            </div>
          </div>
        </div>
      </div>

      {/* 28-Day Study Activity Heatmap (GitHub / Duolingo-style Consistency Grid) */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#181715]">
            Bản Đồ Nhiệt Chuyên Cần (28 ngày gần nhất)
          </span>
          <span className="font-mono text-[11px] text-[#1F5E3B] font-semibold">
            Kỷ lục Tốc độ: {user.bestBlitzScore ?? 0} pts
          </span>
        </div>
        <div className="grid grid-cols-14 gap-1.5">
          {Array.from({ length: 28 }, (_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - (27 - idx));
            const key = d.toISOString().slice(0, 10);
            const todayKey = new Date().toISOString().slice(0, 10);
            const count =
              user.studyHistoryByDate?.[key] ??
              (key === todayKey ? user.reviewedToday : 0);
            let bg = "bg-[#F2EFE9]";
            if (count >= 10) bg = "bg-[#1F5E3B]";
            else if (count >= 5) bg = "bg-[#1F5E3B]/70";
            else if (count >= 1) bg = "bg-[#1F5E3B]/35";
            return (
              <div
                key={key}
                title={`${key}: ${count} từ đã luyện`}
                className={`aspect-square rounded-md ${bg} ${
                  key === todayKey ? "ring-2 ring-[#B45309] ring-offset-1" : ""
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6B655E]">
          <span>4 tuần trước</span>
          <div className="inline-flex items-center gap-1">
            <span>Ít</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F2EFE9]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1F5E3B]/35" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1F5E3B]/70" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1F5E3B]" />
            <span>Nhiều</span>
          </div>
          <span>Hôm nay</span>
        </div>
      </div>

      {/* Streak Freeze Explanation */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-start gap-2.5 text-xs text-[#57534E]">
        <Snowflake className="w-4 h-4 text-[#1F5E3B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#181715]">Lá chắn Streak Freeze ({freezes} lượt):</strong>{" "}
          Nếu bạn lỡ bận 1 ngày không kịp vào học, hệ thống sẽ tự động dùng 1 lá chắn để giữ nguyên chuỗi ngày học của bạn không bị đứt!
        </p>
      </div>

      {/* Copy & Share Action */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopyShare}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1F5E3B] hover:bg-[#18492E] text-white text-xs sm:text-sm font-bold"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã sao chép thẻ thành tích!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Sao chép chia sẻ Facebook / Zalo</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 rounded-2xl border border-[#E5E0D8] text-xs font-semibold text-[#57534E]"
        >
          Đóng
        </button>
      </div>
    </AccessibleModal>
  );
}
