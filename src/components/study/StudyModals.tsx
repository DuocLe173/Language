"use client";

import React from "react";
import {
  CheckCircle2,
  X,
  BookOpenCheck,
  Volume2,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import { LanguageCode, TopicId, TopicMeta, VocabCard } from "@/types/language";
import { TOPICS } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import { DailyStoryTurn } from "@/lib/study-enhancements";
import { HoverableSentence } from "@/components/HoverWordTooltip";
import AccessibleModal from "@/components/ui/AccessibleModal";

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDay: number;
  activeTopicId: TopicId;
  activeTopicTitle: string;
  currentDayCards: VocabCard[];
  activeCardId?: string;
  maxUnlockedWordIdx: number;
  completedCount: number;
  totalCount: number;
  onSelectWordIndex: (topicId: TopicId, idx: number) => void;
}

export function WordListDrawerModal({
  isOpen,
  onClose,
  activeDay,
  activeTopicId,
  activeTopicTitle,
  currentDayCards,
  activeCardId,
  maxUnlockedWordIdx,
  completedCount,
  totalCount,
  onSelectWordIndex,
}: WordListModalProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Danh sách 10 từ Ngày ${activeDay}`}
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
        <div>
          <h3 className="text-lg font-bold text-[#181715]">
            Danh Sách 10 Từ — Ngày {activeDay}
          </h3>
          <p className="text-xs text-[#57534E]">
            Đã hoàn thành {completedCount}/{totalCount} từ trong Ngày{" "}
            {activeDay} ({activeTopicTitle})
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng danh sách từ"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 pr-1">
        {currentDayCards.map((item, idx) => {
          const isCurrent = activeCardId === item.id;
          const isUnlocked =
            idx <= maxUnlockedWordIdx || Boolean(item.isCompletedInTopic);
          return (
            <button
              key={item.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                onSelectWordIndex(activeTopicId, idx);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-3 transition-colors ${
                isCurrent
                  ? "bg-[#181715] text-white font-semibold"
                  : !isUnlocked
                  ? "bg-[#FAF8F5] text-[#6B655E] border border-[#E5E0D8]/70 opacity-70 cursor-not-allowed"
                  : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border border-[#E5E0D8]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.isCompletedInTopic ? (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      isCurrent ? "text-[#4ADE80]" : "text-[#1F5E3B]"
                    }`}
                  />
                ) : !isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 shrink-0 text-[#6B655E]" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full border shrink-0 inline-block ${
                      isCurrent ? "border-white/50" : "border-[#6B655E]"
                    }`}
                  />
                )}
                <div className="truncate">
                  {!isUnlocked ? (
                    <span className="font-semibold text-[#6B655E]">
                      Từ {idx + 1} • Đang khóa
                    </span>
                  ) : (
                    <>
                      <span className="font-bold">
                        {idx + 1}. {item.term}
                      </span>{" "}
                      <span
                        className={`font-mono ${
                          isCurrent ? "text-white/75" : "text-[#9E2A2B]"
                        }`}
                      >
                        {item.phonetic}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`truncate max-w-[140px] font-medium ${
                  isCurrent ? "text-[#E5E0D8]" : "text-[#57534E]"
                }`}
              >
                {!isUnlocked ? "🔒 Hoàn thành từ trước" : item.meaningVi}
              </span>
            </button>
          );
        })}
      </div>
    </AccessibleModal>
  );
}

interface DailyStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDay: number;
  languageCode: LanguageCode;
  showPhonetics: boolean;
  allCards: VocabCard[];
  dailyStoryLines: DailyStoryTurn[];
}

export function DailyStoryModal({
  isOpen,
  onClose,
  activeDay,
  languageCode,
  showPhonetics,
  allCards,
  dailyStoryLines,
}: DailyStoryModalProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Hội thoại kết nối 10 từ vựng Ngày ${activeDay}`}
      maxWidthClass="max-w-2xl"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold">
            <BookOpenCheck className="w-4 h-4" />
            <span>Ngữ cảnh thực hành Ngày {activeDay}/10</span>
          </div>
          <h3 className="text-xl font-bold text-[#181715] mt-0.5">
            Hội Thoại Kết Nối 10 Từ Vựng Ngày {activeDay}
          </h3>
          <p className="text-xs text-[#57534E]">
            Chạm hoặc di chuột vào bất kỳ từ nào trong câu để tra nhanh phiên âm & nghĩa, hoặc bấm biểu tượng loa để nghe từng câu.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hội thoại"
          className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 pr-1">
        {dailyStoryLines.map((line, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#1F5E3B]">
                <span>
                  {line.speaker} ({line.roleLabel})
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E5E0D8] text-[#181715]">
                  Từ #{idx + 1}: {line.featuredTerm} ({line.featuredMeaningVi})
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  speakText(line.targetSentence, languageCode, 0.92)
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-xs font-semibold text-[#1F5E3B] hover:bg-[#1F5E3B] hover:text-white transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe</span>
              </button>
            </div>

            <div className="text-base sm:text-lg font-bold text-[#181715]">
              <HoverableSentence
                sentence={line.targetSentence}
                languageCode={languageCode}
                allCards={allCards}
              />
            </div>
            {showPhonetics && line.phonetic && (
              <p className="text-xs font-mono text-[#9E2A2B]">
                {line.phonetic}
              </p>
            )}
            <p className="text-xs sm:text-sm text-[#57534E]">
              → {line.viSentence}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const fullScript = dailyStoryLines
              .map((l) => l.targetSentence)
              .join(". ");
            speakText(fullScript, languageCode, 0.9);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E]"
        >
          <Volume2 className="w-4 h-4" />
          <span>Nghe liền mạch toàn bộ 10 câu</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-[#181715] text-white text-xs font-semibold"
        >
          Đóng hội thoại
        </button>
      </div>
    </AccessibleModal>
  );
}

interface TopicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageNameVi: string;
  activeTopicId: TopicId;
  topicStatsMap: Record<
    TopicId,
    { completed: number; total: number; isCompleted: boolean }
  >;
  onSelectTopic: (topicId: TopicId) => void;
}

export function TopicPickerModal({
  isOpen,
  onClose,
  languageNameVi,
  activeTopicId,
  topicStatsMap,
  onSelectTopic,
}: TopicPickerModalProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Chọn chủ đề học tập ${languageNameVi}`}
      maxWidthClass="max-w-2xl"
    >
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#181715]">
            Chọn Chủ Đề Học Tập ({languageNameVi})
          </h3>
          <p className="text-xs text-[#57534E]">
            Mỗi chủ đề được chia theo lộ trình 10 ngày với độ khó tăng dần từ cơ bản đến nâng cao.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chọn chủ đề"
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
                onClose();
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
    </AccessibleModal>
  );
}

interface DayRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopicId: TopicId;
  activeTopicMeta: TopicMeta;
  activeDay: number;
  daysBreakdown: Array<{
    day: number;
    completed: number;
    total: number;
    isDone: boolean;
    isUnlocked: boolean;
  }>;
  onSelectDay: (day: number) => void;
  onResetTopicProgress: (topicId: TopicId) => void;
}

export function DayRoadmapModal({
  isOpen,
  onClose,
  activeTopicId,
  activeTopicMeta,
  activeDay,
  daysBreakdown,
  onSelectDay,
  onResetTopicProgress,
}: DayRoadmapModalProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Bảng lộ trình 10 ngày — ${activeTopicMeta.titleVi}`}
      maxWidthClass="max-w-2xl"
    >
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
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng lộ trình"
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
              type="button"
              disabled={!item.isUnlocked}
              onClick={() => {
                onSelectDay(item.day);
                onClose();
              }}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                !item.isUnlocked
                  ? "bg-[#F2EFE9]/60 border-[#E5E0D8] text-[#6B655E] opacity-65 cursor-not-allowed"
                  : isCurrent
                  ? "bg-[#181715] text-white border-[#181715] shadow-sm"
                  : item.isDone
                  ? "bg-[#1F5E3B]/12 border-[#1F5E3B]/40 text-[#181715]"
                  : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Ngày {item.day}</span>
                  {!item.isUnlocked ? (
                    <Lock className="w-4 h-4 text-[#6B655E]" />
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
                        ? "text-[#6B655E]"
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
            onClose();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#9E2A2B] hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại tiến độ chủ đề này về Ngày 1
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-semibold"
        >
          Đóng bảng
        </button>
      </div>
    </AccessibleModal>
  );
}
