"use client";

import React from "react";
import {
  X,
  Target,
  CheckCircle2,
  Circle,
  Zap,
  LifeBuoy,
  Flame,
  BookOpen,
  Sparkles,
} from "lucide-react";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewedToday: number;
  bestBlitzScore: number;
  blitzCompletedToday?: boolean;
  streakDays: number;
  weakCount: number;
  onOpenSpeedBlitz: () => void;
  onOpenRescueDrill: () => void;
}

export default function DailyQuestsModal({
  isOpen,
  onClose,
  reviewedToday,
  bestBlitzScore,
  blitzCompletedToday = false,
  streakDays,
  weakCount,
  onOpenSpeedBlitz,
  onOpenRescueDrill,
}: DailyQuestsModalProps) {
  const wordsTarget = 5;
  const wordsProgress = Math.min(reviewedToday, wordsTarget);
  const quest1Done = reviewedToday >= wordsTarget;
  const quest2Done = bestBlitzScore > 0 || blitzCompletedToday;
  const quest3Done = streakDays >= 1;

  const quests = [
    {
      id: "learn_5",
      title: "Học 5 từ mới hôm nay",
      subtitle: quest1Done
        ? `Hoàn thành xuất sắc (${reviewedToday} từ hôm nay)`
        : `Còn ${wordsTarget - wordsProgress} từ nữa để đạt mục tiêu tối thiểu`,
      done: quest1Done,
      percent: Math.round((wordsProgress / wordsTarget) * 100),
      counterLabel: `${wordsProgress}/${wordsTarget}`,
      icon: BookOpen,
      accentBg: "bg-[#1F5E3B]/12 text-[#1F5E3B]",
      barColor: "bg-[#1F5E3B]",
    },
    {
      id: "speed_blitz",
      title: "Chinh phục Đấu trường tốc độ 60s",
      subtitle: quest2Done
        ? `Đã hoàn thành • Kỷ lục hiện tại: ${bestBlitzScore} điểm`
        : "Thử thách phản xạ 60 giây để rèn tốc độ nhận diện từ",
      done: quest2Done,
      percent: quest2Done ? 100 : 0,
      counterLabel: quest2Done ? "1/1" : "0/1",
      icon: Zap,
      accentBg: "bg-[#B45309]/12 text-[#B45309]",
      barColor: "bg-[#B45309]",
    },
    {
      id: "streak_keep",
      title: "Tích lũy chuỗi chuyên cần",
      subtitle: quest3Done
        ? `Đang giữ vững chuỗi ${streakDays} ngày học liên tiếp`
        : "Hoàn thành 1 từ hôm nay để kích hoạt chuỗi chuyên cần",
      done: quest3Done,
      percent: quest3Done ? 100 : 0,
      counterLabel: quest3Done ? `${streakDays} ngày` : "0/1",
      icon: Flame,
      accentBg: "bg-[#9E2A2B]/12 text-[#9E2A2B]",
      barColor: "bg-[#9E2A2B]",
    },
  ];

  const completedCount = quests.filter((q) => q.done).length;
  const totalPercent = Math.round((completedCount / quests.length) * 100);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Nhiệm vụ hôm nay"
      maxWidthClass="max-w-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#1F5E3B]/12 text-[#1F5E3B] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#181715]">
              🎯 Nhiệm Vụ Hôm Nay
            </h3>
            <p className="text-xs text-[#57534E]">
              Daily Quests • Duy trì nhịp học đều đặn mỗi ngày
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng nhiệm vụ hôm nay"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Overall Completion Summary */}
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
            Tiến độ tổng hôm nay
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold font-mono text-[#1F5E3B]">
            {completedCount === 3 && <Sparkles className="w-3.5 h-3.5" />}
            {completedCount}/3 hoàn thành
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#E5E0D8] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1F5E3B] transition-all duration-500 ease-out"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        {completedCount === 3 && (
          <p className="text-xs font-semibold text-[#1F5E3B]">
            🏆 Tuyệt đỉnh! Bạn đã hoàn thành trọn vẹn 3/3 nhiệm vụ hôm nay!
          </p>
        )}
      </div>

      {/* 3 Daily Quest Cards */}
      <div className="space-y-2.5">
        {quests.map((q) => {
          const Icon = q.icon;
          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-4 space-y-2.5 transition-colors ${
                q.done
                  ? "bg-[#1F5E3B]/5 border-[#1F5E3B]/30"
                  : "bg-white border-[#E5E0D8]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${q.accentBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#181715]">
                      {q.title}
                    </div>
                    <div className="text-xs text-[#57534E]">{q.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#181715]">
                    {q.counterLabel}
                  </span>
                  {q.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#1F5E3B]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#D6D1C7]" />
                  )}
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-[#E5E0D8]/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${q.barColor}`}
                  style={{ width: `${q.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Tap Quick Action Jump Buttons */}
      <div className="pt-2 border-t border-[#E5E0D8] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSpeedBlitz();
          }}
          className="btn-tactile-green inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Vào Đấu trường 60s</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenRescueDrill();
          }}
          className="btn-tactile-ink inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>
            Ôn từ hay sai{weakCount > 0 ? ` (${weakCount})` : ""}
          </span>
        </button>
      </div>
    </AccessibleModal>
  );
}
