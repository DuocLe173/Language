"use client";

import React from "react";
import { TopicMeta } from "@/types/language";
import {
  Check,
  Lock,
  Play,
  Compass,
  BookOpen,
  Sparkles,
  Trophy,
  RotateCcw,
  Layers,
} from "lucide-react";

export interface VisualJourneyPathProps {
  activeTopicMeta: TopicMeta;
  activeDay: number;
  daysBreakdown: Array<{
    day: number;
    completed: number;
    total: number;
    isDone: boolean;
    isUnlocked: boolean;
  }>;
  onSelectDayAndStart: (day: number) => void;
  onOpenTopicPicker: () => void;
  onClosePathView: () => void;
}

type NodePosition = "center" | "left" | "right";

const CURVE_PATTERN: Array<{ pos: NodePosition; xPct: number; svgX: number }> = [
  { pos: "center", xPct: 50, svgX: 200 }, // Day 1 — Start
  { pos: "left", xPct: 26, svgX: 104 },   // Day 2
  { pos: "center", xPct: 50, svgX: 200 }, // Day 3
  { pos: "right", xPct: 74, svgX: 296 },  // Day 4
  { pos: "center", xPct: 50, svgX: 200 }, // Day 5 — Midpoint
  { pos: "left", xPct: 26, svgX: 104 },   // Day 6
  { pos: "center", xPct: 50, svgX: 200 }, // Day 7
  { pos: "right", xPct: 74, svgX: 296 },  // Day 8
  { pos: "center", xPct: 50, svgX: 200 }, // Day 9
  { pos: "center", xPct: 50, svgX: 200 }, // Day 10 — Finale Summit
];

function getNodePlacement(index: number) {
  return CURVE_PATTERN[index % CURVE_PATTERN.length];
}

export default function VisualJourneyPath({
  activeTopicMeta,
  activeDay,
  daysBreakdown,
  onSelectDayAndStart,
  onOpenTopicPicker,
  onClosePathView,
}: VisualJourneyPathProps) {
  const totalDays = daysBreakdown.length || activeTopicMeta.totalDays || 10;
  const completedDaysCount = daysBreakdown.filter((d) => d.isDone).length;
  const totalCompletedWords = daysBreakdown.reduce((acc, d) => acc + d.completed, 0);
  const totalWords = daysBreakdown.reduce((acc, d) => acc + d.total, 0);
  const topicPercent =
    totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;

  return (
    <section
      aria-label={`Bản đồ lộ trình 10 ngày — ${activeTopicMeta.titleVi}`}
      className="w-full max-w-3xl mx-auto overflow-x-hidden space-y-6 pb-10"
    >
      {/* Top Editorial Topic Banner */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2EFE9] text-[#181715] text-[11px] font-semibold tracking-wide">
                <Compass className="w-3.5 h-3.5 text-[#1F5E3B]" />
                Lộ trình {totalDays} ngày
              </span>
              <span className="px-2.5 py-1 rounded-full border border-[#E5E0D8] bg-[#FAF8F5] text-[#57534E] text-[11px] font-mono">
                {activeTopicMeta.levelLabel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#181715] leading-snug">
              {activeTopicMeta.titleVi}
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              {activeTopicMeta.subtitleVi}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenTopicPicker}
              className="btn-tactile-soft inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <Layers className="w-4 h-4 text-[#57534E]" />
              <span>Đổi chủ đề</span>
            </button>
            <button
              type="button"
              onClick={onClosePathView}
              className="btn-tactile-ink inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span>Về thẻ học · Ngày {activeDay}</span>
            </button>
          </div>
        </div>

        {/* Overall Topic Progress */}
        <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
          <div className="flex items-center justify-between text-xs mb-2 gap-2">
            <span className="font-semibold text-[#181715]">
              {completedDaysCount}/{totalDays} ngày hoàn thành
            </span>
            <span className="font-mono text-[#6B655E]">
              {totalCompletedWords}/{totalWords} từ · {topicPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#F2EFE9] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1F5E3B] transition-all duration-500"
              style={{ width: `${Math.max(topicPercent, completedDaysCount > 0 ? 8 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Winding S-Curve Learning Path Canvas */}
      <div className="relative bg-[#FAF8F5] border border-[#E5E0D8] rounded-3xl px-3 sm:px-8 py-7 sm:py-9 overflow-hidden">
        {/* Subtle editorial dot texture background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(#D8D1C5 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Legend strip */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#6B655E] mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F5E3B]" />
            Đã hoàn thành
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#181715] ring-2 ring-[#1F5E3B]/30" />
            Đang học
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#B45309]" />
            Đã mở khóa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DDD6CB]" />
            Chưa mở khóa
          </span>
        </div>

        {/* S-Curve Nodes & SVG Connectors */}
        <div className="relative z-10 max-w-xl mx-auto">
          {daysBreakdown.map((item, idx) => {
            const placement = getNodePlacement(idx);
            const nextItem = daysBreakdown[idx + 1];
            const nextPlacement = nextItem ? getNodePlacement(idx + 1) : null;

            const isCurrent = item.day === activeDay;
            const isDone = item.isDone;
            const isUnlocked = item.isUnlocked;
            const isFinale = idx === daysBreakdown.length - 1;
            const dayTheme =
              activeTopicMeta.dayThemes?.[item.day] ??
              `Chặng ${item.day} — Từ vựng trọng tâm`;
            const pct =
              item.total > 0
                ? Math.min(100, Math.round((item.completed / item.total) * 100))
                : 0;

            // SVG progress ring values for active day
            const ringRadius = 38;
            const ringCircumference = 2 * Math.PI * ringRadius;
            const ringDashOffset =
              ringCircumference - (pct / 100) * ringCircumference;

            // Connector state between this node and the next
            const connectorConquered = isDone && nextItem?.isUnlocked;
            const connectorActive = !connectorConquered && isUnlocked && nextItem?.isUnlocked;

            return (
              <React.Fragment key={item.day}>
                {/* Milestone Row */}
                <div className="relative">
                  {placement.pos === "center" ? (
                    /* Center Node Layout: Circle centered, card neatly below */
                    <div className="flex flex-col items-center text-center">
                      <NodeCircleButton
                        item={item}
                        isCurrent={isCurrent}
                        isDone={isDone}
                        isUnlocked={isUnlocked}
                        isFinale={isFinale}
                        dayTheme={dayTheme}
                        ringRadius={ringRadius}
                        ringCircumference={ringCircumference}
                        ringDashOffset={ringDashOffset}
                        onSelect={() => onSelectDayAndStart(item.day)}
                      />

                      <div className="mt-3 w-full max-w-[280px] sm:max-w-[320px]">
                        <NodeInfoCard
                          item={item}
                          isCurrent={isCurrent}
                          isDone={isDone}
                          isUnlocked={isUnlocked}
                          isFinale={isFinale}
                          dayTheme={dayTheme}
                          pct={pct}
                          align="center"
                          onSelect={() => onSelectDayAndStart(item.day)}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Left or Right Winding Node Layout */
                    <div className="relative min-h-[96px] sm:min-h-[104px] flex items-center">
                      {/* Positioned Circle at exact SVG X coordinate */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                        style={{ left: `${placement.xPct}%` }}
                      >
                        <NodeCircleButton
                          item={item}
                          isCurrent={isCurrent}
                          isDone={isDone}
                          isUnlocked={isUnlocked}
                          isFinale={isFinale}
                          dayTheme={dayTheme}
                          ringRadius={ringRadius}
                          ringCircumference={ringCircumference}
                          ringDashOffset={ringDashOffset}
                          onSelect={() => onSelectDayAndStart(item.day)}
                        />
                      </div>

                      {/* Companion Info Card opposite to the circle */}
                      {placement.pos === "left" ? (
                        <div
                          className="w-full"
                          style={{ paddingLeft: "calc(26% + 52px)" }}
                        >
                          <NodeInfoCard
                            item={item}
                            isCurrent={isCurrent}
                            isDone={isDone}
                            isUnlocked={isUnlocked}
                            isFinale={isFinale}
                            dayTheme={dayTheme}
                            pct={pct}
                            align="left"
                            onSelect={() => onSelectDayAndStart(item.day)}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full"
                          style={{ paddingRight: "calc(26% + 52px)" }}
                        >
                          <NodeInfoCard
                            item={item}
                            isCurrent={isCurrent}
                            isDone={isDone}
                            isUnlocked={isUnlocked}
                            isFinale={isFinale}
                            dayTheme={dayTheme}
                            pct={pct}
                            align="right"
                            onSelect={() => onSelectDayAndStart(item.day)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Winding SVG Connector Curve to Next Node */}
                {nextPlacement && (
                  <div
                    aria-hidden="true"
                    className="w-full h-14 sm:h-16 select-none pointer-events-none"
                  >
                    <svg
                      viewBox="0 0 400 72"
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                    >
                      {/* Base subtle road track */}
                      <path
                        d={`M ${placement.svgX} 0 C ${placement.svgX} 36, ${nextPlacement.svgX} 36, ${nextPlacement.svgX} 72`}
                        fill="none"
                        stroke="#E8E2D7"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Active / Completed / Locked foreground path */}
                      <path
                        d={`M ${placement.svgX} 0 C ${placement.svgX} 36, ${nextPlacement.svgX} 36, ${nextPlacement.svgX} 72`}
                        fill="none"
                        stroke={
                          connectorConquered
                            ? "#1F5E3B"
                            : connectorActive
                            ? "#B45309"
                            : "#C9C1B4"
                        }
                        strokeWidth={connectorConquered ? "4" : "3"}
                        strokeLinecap="round"
                        strokeDasharray={connectorConquered ? undefined : "6 7"}
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Empty safety fallback */}
        {daysBreakdown.length === 0 && (
          <div className="relative z-10 text-center py-10 text-sm text-[#6B655E]">
            Chưa có dữ liệu lộ trình cho chủ đề này.
          </div>
        )}
      </div>
    </section>
  );
}

interface NodeCircleButtonProps {
  item: {
    day: number;
    completed: number;
    total: number;
    isDone: boolean;
    isUnlocked: boolean;
  };
  isCurrent: boolean;
  isDone: boolean;
  isUnlocked: boolean;
  isFinale: boolean;
  dayTheme: string;
  ringRadius: number;
  ringCircumference: number;
  ringDashOffset: number;
  onSelect: () => void;
}

function NodeCircleButton({
  item,
  isCurrent,
  isDone,
  isUnlocked,
  isFinale,
  dayTheme,
  ringRadius,
  ringCircumference,
  ringDashOffset,
  onSelect,
}: NodeCircleButtonProps) {
  const ariaLabel = !isUnlocked
    ? `Ngày ${item.day}: ${dayTheme} — Đang khóa`
    : isDone
    ? `Ngày ${item.day}: ${dayTheme} — Đã hoàn thành ${item.completed}/${item.total} từ, nhấn để ôn tập`
    : isCurrent
    ? `Ngày ${item.day}: ${dayTheme} — Đang học (${item.completed}/${item.total} từ), nhấn để bắt đầu`
    : `Ngày ${item.day}: ${dayTheme} — Đã mở khóa, nhấn để học`;

  // State 1: Current Active Day
  if (isCurrent && isUnlocked) {
    return (
      <div className="relative inline-flex items-center justify-center">
        {/* Soft emerald outer halo */}
        <span
          aria-hidden="true"
          className="absolute -inset-2 rounded-full bg-[#1F5E3B]/12 animate-pulse"
        />
        {/* SVG circular progress ring */}
        <svg
          aria-hidden="true"
          viewBox="0 0 88 88"
          className="w-[86px] h-[86px] sm:w-[92px] sm:h-[92px] -rotate-90 pointer-events-none"
        >
          <circle
            cx="44"
            cy="44"
            r={ringRadius}
            fill="none"
            stroke="#E5E0D8"
            strokeWidth="5"
          />
          <circle
            cx="44"
            cy="44"
            r={ringRadius}
            fill="none"
            stroke="#1F5E3B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringDashOffset}
            className="transition-all duration-500"
          />
        </svg>

        <button
          type="button"
          onClick={onSelect}
          aria-label={ariaLabel}
          className={`absolute w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full flex flex-col items-center justify-center shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5E3B] focus-visible:ring-offset-2 ${
            isDone
              ? "btn-tactile-green"
              : "btn-tactile-ink"
          }`}
        >
          {isDone ? (
            <Check className="w-7 h-7 stroke-[2.75]" />
          ) : isFinale ? (
            <Trophy className="w-6 h-6 text-[#FBBF24]" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase mt-0.5 opacity-90">
            N.{item.day}
          </span>
        </button>
      </div>
    );
  }

  // State 2: Completed Day (not active)
  if (isDone) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={ariaLabel}
        className="btn-tactile-green w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex flex-col items-center justify-center ring-4 ring-[#1F5E3B]/15 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5E3B] focus-visible:ring-offset-2"
      >
        {isFinale ? (
          <Trophy className="w-6 h-6 text-[#FDE68A]" />
        ) : (
          <Check className="w-6 h-6 stroke-[2.75]" />
        )}
        <span className="text-[10px] font-mono font-semibold opacity-90 mt-0.5">
          N.{item.day}
        </span>
      </button>
    );
  }

  // State 3: Unlocked but not active
  if (isUnlocked) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={ariaLabel}
        className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full bg-white text-[#B45309] border-2 border-[#B45309]/60 border-b-4 border-b-[#B45309] shadow-xs hover:bg-[#FFFBF2] flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2"
      >
        {isFinale ? (
          <Trophy className="w-5 h-5" />
        ) : (
          <span className="text-lg font-bold font-mono leading-none">{item.day}</span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-wide mt-0.5 text-[#92400E]">
          Mở
        </span>
      </button>
    );
  }

  // State 4: Locked
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-label={ariaLabel}
      className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full bg-[#EFECE6] text-[#8A837A] border-2 border-[#DDD6CB] border-b-4 border-b-[#CFC8BC] flex flex-col items-center justify-center cursor-not-allowed opacity-90"
    >
      {isFinale ? (
        <Trophy className="w-5 h-5 opacity-60" />
      ) : (
        <Lock className="w-5 h-5" />
      )}
      <span className="text-[10px] font-mono font-semibold mt-0.5">
        N.{item.day}
      </span>
    </button>
  );
}

interface NodeInfoCardProps {
  item: {
    day: number;
    completed: number;
    total: number;
    isDone: boolean;
    isUnlocked: boolean;
  };
  isCurrent: boolean;
  isDone: boolean;
  isUnlocked: boolean;
  isFinale: boolean;
  dayTheme: string;
  pct: number;
  align: "center" | "left" | "right";
  onSelect: () => void;
}

function NodeInfoCard({
  item,
  isCurrent,
  isDone,
  isUnlocked,
  isFinale,
  dayTheme,
  pct,
  align,
  onSelect,
}: NodeInfoCardProps) {
  const alignClasses =
    align === "center"
      ? "items-center text-center"
      : align === "right"
      ? "items-end text-right"
      : "items-start text-left";

  // Current Active Day Card with Floating Tactile CTA Pill
  if (isCurrent && isUnlocked) {
    return (
      <div
        className={`flex flex-col ${alignClasses} bg-white border-2 border-[#181715] rounded-2xl p-3.5 sm:p-4 shadow-sm animate-pop`}
      >
        <div
          className={`flex flex-wrap items-center gap-1.5 ${
            align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
          }`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181715] text-white text-[10px] font-mono font-semibold uppercase tracking-wide">
            <Sparkles className="w-3 h-3 text-[#4ADE80]" />
            Ngày {item.day} · Đang học
          </span>
          <span className="text-[11px] font-mono font-semibold text-[#1F5E3B]">
            {item.completed}/{item.total} từ
          </span>
        </div>

        <p className="text-sm font-bold text-[#181715] mt-1.5 leading-snug">
          {dayTheme}
        </p>

        {/* Mini Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[#F2EFE9] overflow-hidden mt-2.5">
          <div
            className="h-full rounded-full bg-[#1F5E3B] transition-all duration-300"
            style={{ width: `${Math.max(pct, item.completed > 0 ? 10 : 0)}%` }}
          />
        </div>

        {/* Floating Tactile CTA Pill */}
        <button
          type="button"
          onClick={onSelect}
          className="btn-tactile-green mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>Bắt đầu học Ngày {item.day}</span>
        </button>
      </div>
    );
  }

  // Completed Day Card (clickable to review)
  if (isDone) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex flex-col ${alignClasses} bg-white hover:bg-[#F4FAF6] border border-[#1F5E3B]/25 rounded-2xl px-3.5 py-2.5 cursor-pointer group`}
      >
        <div
          className={`flex flex-wrap items-center gap-1.5 ${
            align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
          }`}
        >
          <span className="text-[11px] font-mono font-bold text-[#1F5E3B]">
            Ngày {item.day} {isFinale ? "· Đích đến" : ""}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#E9F5EE] text-[#1F5E3B] text-[10px] font-mono font-semibold">
            ✓ {item.completed}/{item.total} từ
          </span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-[#181715] mt-1 leading-snug">
          {dayTheme}
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F5E3B] mt-1 opacity-85 group-hover:opacity-100">
          <RotateCcw className="w-3 h-3" />
          Ôn tập lại
        </span>
      </button>
    );
  }

  // Unlocked but not active
  if (isUnlocked) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex flex-col ${alignClasses} bg-white hover:bg-[#FFFBF2] border border-[#B45309]/35 rounded-2xl px-3.5 py-2.5 cursor-pointer`}
      >
        <div
          className={`flex flex-wrap items-center gap-1.5 ${
            align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
          }`}
        >
          <span className="text-[11px] font-mono font-bold text-[#B45309]">
            Ngày {item.day}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono font-semibold">
            {item.completed}/{item.total} từ
          </span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-[#181715] mt-1 leading-snug">
          {dayTheme}
        </p>
      </button>
    );
  }

  // Locked Day Preview Card
  return (
    <div
      className={`w-full flex flex-col ${alignClasses} bg-[#F2EFE9]/75 border border-dashed border-[#D8D1C5] rounded-2xl px-3.5 py-2.5`}
    >
      <div
        className={`flex flex-wrap items-center gap-1.5 ${
          align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span className="text-[11px] font-mono font-semibold text-[#6B655E]">
          Ngày {item.day} {isFinale ? "· Đích đến" : ""}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#6B655E]">
          <Lock className="w-2.5 h-2.5" />
          Khóa
        </span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-[#6B655E] mt-1 leading-snug">
        {dayTheme}
      </p>
    </div>
  );
}
