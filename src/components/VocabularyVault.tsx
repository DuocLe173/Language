"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Volume2,
  Trash2,
  RotateCcw,
  Sparkles,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { LanguageCode, TopicId, VocabCard } from "@/types/language";
import { BUILTIN_DICTIONARY, LANGUAGES, TOPICS } from "@/lib/seed-data";
import { speakText } from "@/lib/speech";
import { playTileClick, playSuccessChime } from "@/lib/sound-effects";

interface VocabularyVaultProps {
  userId: string;
  languageCode: LanguageCode;
  activeTopicId: TopicId;
  cards: VocabCard[];
  showQuickAddModal: boolean;
  onCloseQuickAddModal: () => void;
  onOpenQuickAddModal: () => void;
  onAddOrUpdateCard: (card: VocabCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export default function VocabularyVault({
  userId,
  languageCode,
  activeTopicId,
  cards,
  showQuickAddModal,
  onCloseQuickAddModal,
  onOpenQuickAddModal,
  onAddOrUpdateCard,
  onDeleteCard,
}: VocabularyVaultProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState<"all" | TopicId>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "due_srs" | "completed" | "unlearned"
  >("all");
  const [isSelfTestMode, setIsSelfTestMode] = useState(false);
  const [revealedCardIds, setRevealedCardIds] = useState<
    Record<string, boolean>
  >({});

  // Form states for Quick Add
  const [selectedTopicForNew, setSelectedTopicForNew] =
    useState<TopicId>(activeTopicId);
  const [term, setTerm] = useState("");
  const [traditionalTerm, setTraditionalTerm] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("phrase / verb");
  const [meaningVi, setMeaningVi] = useState("");
  const [naturalContextVi, setNaturalContextVi] = useState("");
  const [exampleTarget, setExampleTarget] = useState("");
  const [exampleVi, setExampleVi] = useState("");
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState("Thông dụng");

  const langMeta = LANGUAGES[languageCode];

  const langCards = useMemo(
    () => cards.filter((c) => c.languageCode === languageCode),
    [cards, languageCode]
  );

  const statusCounts = useMemo(() => {
    const now = new Date();
    let completed = 0;
    let unlearned = 0;
    let dueSrs = 0;
    for (const c of langCards) {
      if (c.isCompletedInTopic) {
        completed++;
        if (!c.nextReviewAt || new Date(c.nextReviewAt) <= now) {
          dueSrs++;
        }
      } else {
        unlearned++;
      }
    }
    return {
      all: langCards.length,
      completed,
      unlearned,
      dueSrs,
    };
  }, [langCards]);

  const filteredCards = useMemo(() => {
    const now = new Date();
    return langCards
      .filter((c) => {
        if (filterTopic === "all") return true;
        return c.topicId === filterTopic;
      })
      .filter((c) => {
        if (statusFilter === "completed") return Boolean(c.isCompletedInTopic);
        if (statusFilter === "unlearned") return !c.isCompletedInTopic;
        if (statusFilter === "due_srs") {
          return (
            Boolean(c.isCompletedInTopic) &&
            (!c.nextReviewAt || new Date(c.nextReviewAt) <= now)
          );
        }
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.term.toLowerCase().includes(q) ||
          c.phonetic.toLowerCase().includes(q) ||
          c.meaningVi.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        );
      });
  }, [langCards, filterTopic, statusFilter, searchQuery]);

  const handleAutoFillPreset = (wordKey: string) => {
    const preset =
      BUILTIN_DICTIONARY[wordKey] || BUILTIN_DICTIONARY[wordKey.toLowerCase()];
    if (!preset) return;
    setTerm(preset.term);
    setTraditionalTerm(preset.traditionalTerm || "");
    setPhonetic(preset.phonetic);
    setPartOfSpeech(preset.partOfSpeech);
    setMeaningVi(preset.meaningVi);
    setNaturalContextVi(preset.naturalContextVi || "");
    setExampleTarget(preset.exampleTarget);
    setExampleVi(preset.exampleVi);
    setNotes(preset.notes || "");
    setLevel(preset.level);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaningVi.trim()) return;

    const topicCardsCount = cards.filter(
      (c) =>
        c.languageCode === languageCode && c.topicId === selectedTopicForNew
    ).length;

    const newCard: VocabCard = {
      id: `custom_${Date.now()}`,
      userId,
      languageCode,
      topicId: selectedTopicForNew,
      dayNumber: 1,
      orderIndex: topicCardsCount + 1,
      term: term.trim(),
      traditionalTerm: traditionalTerm.trim() || undefined,
      phonetic: phonetic.trim() || "—",
      partOfSpeech: partOfSpeech.trim() || "từ vựng",
      meaningVi: meaningVi.trim(),
      naturalContextVi:
        naturalContextVi.trim() ||
        "Từ vựng thiết thực được bạn thêm vào sổ học tập.",
      exampleTarget: exampleTarget.trim() || `${term.trim()}`,
      exampleVi: exampleVi.trim() || meaningVi.trim(),
      notes: notes.trim() || undefined,
      tags: ["Tự thêm", langMeta.shortLabel],
      level: level.trim() || "Thông dụng",
      isCompletedInTopic: false,
      state: "new",
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateCard(newCard);
    setTerm("");
    setTraditionalTerm("");
    setPhonetic("");
    setMeaningVi("");
    setNaturalContextVi("");
    setExampleTarget("");
    setExampleVi("");
    setNotes("");
    onCloseQuickAddModal();
  };

  const handleToggleCompleted = (card: VocabCard) => {
    onAddOrUpdateCard({
      ...card,
      isCompletedInTopic: !card.isCompletedInTopic,
    });
  };

  return (
    <div className="space-y-5">
      {/* Search, Self-Test Mode & Status Filter Header */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-3.5 shadow-[0_2px_10px_rgba(24,23,21,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#8A847C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm từ vựng, phiên âm (${langMeta.phoneticLabel}), nghĩa tiếng Việt...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#181715]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quizlet-style Flashcard Self-Test Toggle */}
            <button
              type="button"
              onClick={() => {
                playTileClick();
                setIsSelfTestMode((prev) => !prev);
                setRevealedCardIds({});
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSelfTestMode
                  ? "bg-[#9E2A2B] text-white border-[#9E2A2B] shadow-2xs"
                  : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
              }`}
              title="Ẩn nghĩa Tiếng Việt để tự nhẩm nghĩa và chạm lật thẻ kiểm tra trí nhớ"
            >
              {isSelfTestMode ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[#1F5E3B]" />
              )}
              <span>
                {isSelfTestMode
                  ? "Đang bật: Tự dò nghĩa (Chạm thẻ để lật)"
                  : "Chế độ Tự dò nghĩa (Flashcard)"}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenQuickAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ mới</span>
            </button>
          </div>
        </div>

        {/* Status & SRS Review Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5E0D8]/70">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase text-[#8A847C] mr-1">
              Trạng thái:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-[#181715] text-white"
                  : "bg-[#FAF8F5] text-[#57534E] border border-[#E5E0D8]"
              }`}
            >
              Tất cả ({statusCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("due_srs")}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === "due_srs"
                  ? "bg-[#B45309] text-white"
                  : "bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/25"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Cần ôn SRS ({statusCounts.dueSrs})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === "completed"
                  ? "bg-[#1F5E3B] text-white"
                  : "bg-[#1F5E3B]/10 text-[#1F5E3B] border border-[#1F5E3B]/25"
              }`}
            >
              ✓ Đã thuộc ({statusCounts.completed})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unlearned")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === "unlearned"
                  ? "bg-[#181715] text-white"
                  : "bg-[#FAF8F5] text-[#57534E] border border-[#E5E0D8]"
              }`}
            >
              ○ Chưa học ({statusCounts.unlearned})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTopic("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterTopic === "all"
                  ? "bg-[#181715] text-white"
                  : "bg-[#F2EFE9] text-[#57534E] hover:text-[#181715]"
              }`}
            >
              Mọi chủ đề
            </button>
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterTopic(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterTopic === t.id
                    ? "bg-[#181715] text-white"
                    : "bg-[#F2EFE9] text-[#57534E] hover:text-[#181715]"
                }`}
              >
                {t.titleVi}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const topicMeta =
            TOPICS.find((t) => t.id === card.topicId) || TOPICS[0];
          const isMeaningHidden =
            isSelfTestMode && !revealedCardIds[card.id];
          return (
            <div
              key={card.id}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-5 flex flex-col justify-between hover:border-[#181715]/30 transition-all shadow-[0_4px_16px_rgba(24,23,21,0.025)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#F2EFE9] text-[#57534E]">
                        {topicMeta.titleVi}
                      </span>
                      {card.dayNumber && (
                        <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E5E0D8] text-[#8A847C]">
                          Ngày {card.dayNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-2xl font-bold text-[#181715]">
                        {card.term}
                      </h4>
                      {card.traditionalTerm &&
                        card.traditionalTerm !== card.term && (
                          <span className="text-sm text-[#8A847C]">
                            ({card.traditionalTerm})
                          </span>
                        )}
                    </div>
                    <p className="text-xs font-mono text-[#9E2A2B] mt-0.5">
                      {card.phonetic} • {card.partOfSpeech}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(card.term, languageCode, 0.92)}
                    className="p-2 rounded-xl bg-[#F2EFE9] hover:bg-[#E5E0D8] text-[#181715] transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4 text-[#1F5E3B]" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E0D8]">
                  {isMeaningHidden ? (
                    <button
                      type="button"
                      onClick={() => {
                        playTileClick();
                        speakText(card.term, languageCode, 0.92);
                        setRevealedCardIds((prev) => ({
                          ...prev,
                          [card.id]: true,
                        }));
                      }}
                      className="w-full py-6 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-dashed border-[#D6D1C7] text-center space-y-1 transition-all"
                    >
                      <span className="text-xs font-bold text-[#1F5E3B] block">
                        🙈 Chạm để lật xem nghĩa Tiếng Việt & câu ví dụ
                      </span>
                      <span className="text-[11px] text-[#8A847C] block">
                        Hãy tự nhẩm nghĩa của từ &ldquo;{card.term}&rdquo; trước khi lật nhé!
                      </span>
                    </button>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[#181715]">
                        {card.meaningVi}
                      </p>
                      {card.naturalContextVi && (
                        <p className="text-xs text-[#57534E] mt-1">
                          💬 {card.naturalContextVi}
                        </p>
                      )}
                      <p className="text-xs font-medium text-[#181715] mt-2 leading-relaxed">
                        &ldquo;{card.exampleTarget}&rdquo;
                      </p>
                      <p className="text-xs text-[#8A847C] mt-0.5">
                        → {card.exampleVi}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {card.isCompletedInTopic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] bg-[#1F5E3B]/12 text-[#1F5E3B]">
                      <CheckCircle2 className="w-3 h-3" />
                      Đã thuộc{" "}
                      {card.intervalDays > 0
                        ? `• Ôn ${card.intervalDays}d`
                        : ""}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E]">
                      Chưa học
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playSuccessChime();
                      handleToggleCompleted(card);
                    }}
                    className="p-1.5 rounded-lg text-[#8A847C] hover:text-[#181715] hover:bg-[#F2EFE9]"
                    title="Đổi trạng thái hoàn thành của từ này"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1.5 rounded-lg text-[#8A847C] hover:text-[#9E2A2B] hover:bg-[#9E2A2B]/10"
                    title="Xóa thẻ từ vựng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#181715]">
                  Thêm Từ Mới Theo Chủ Đề ({langMeta.nameVi})
                </h3>
                <p className="text-xs text-[#57534E]">
                  Từ mới sẽ được lưu cố định vào chủ đề bạn chọn.
                </p>
              </div>
              <button
                onClick={onCloseQuickAddModal}
                className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Auto-fill suggestions */}
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#1F5E3B] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Điền nhanh mẫu từ vựng thông dụng:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(BUILTIN_DICTIONARY).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAutoFillPreset(key)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-xs font-medium hover:border-[#181715]"
                  >
                    + {key}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                  Chọn Chủ đề lưu từ *
                </label>
                <select
                  value={selectedTopicForNew}
                  onChange={(e) =>
                    setSelectedTopicForNew(e.target.value as TopicId)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm bg-white"
                >
                  {TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.titleVi} — {t.subtitleVi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                    Từ vựng ({langMeta.nativeName}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={term}
                    onChange={(e) => {
                      setTerm(e.target.value);
                      if (BUILTIN_DICTIONARY[e.target.value.trim()]) {
                        handleAutoFillPreset(e.target.value.trim());
                      }
                    }}
                    placeholder="VD: touch base / 全力以赴"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                    Phiên âm ({langMeta.phoneticLabel})
                  </label>
                  <input
                    type="text"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    placeholder="VD: /tʌtʃ beɪs/ hoặc quán lì yǐ fù"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                    Nghĩa Tiếng Việt tự nhiên *
                  </label>
                  <input
                    type="text"
                    required
                    value={meaningVi}
                    onChange={(e) => setMeaningVi(e.target.value)}
                    placeholder="Nhập nghĩa tiếng Việt gần gũi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                    Từ loại
                  </label>
                  <input
                    type="text"
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    placeholder="VD: idiom, verb, 成语..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                  Câu ví dụ thực tế ({langMeta.nameVi})
                </label>
                <input
                  type="text"
                  value={exampleTarget}
                  onChange={(e) => setExampleTarget(e.target.value)}
                  placeholder="Câu ví dụ chứa từ này..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#57534E] mb-1">
                  Dịch nghĩa câu ví dụ
                </label>
                <input
                  type="text"
                  value={exampleVi}
                  onChange={(e) => setExampleVi(e.target.value)}
                  placeholder="Bản dịch tiếng Việt mượt mà..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseQuickAddModal}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-xs font-medium text-[#57534E]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-medium hover:bg-[#18492E]"
                >
                  Lưu vào Chủ đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
