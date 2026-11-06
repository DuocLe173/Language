"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Volume2,
  Sparkles,
  Puzzle,
  AlignLeft,
  Keyboard,
  Lock,
  ArrowLeft,
  Trophy,
  X,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import {
  getDistinctPracticeSentences,
  shuffleArrayRandom,
  tokenizeSentenceIntoTiles,
} from "@/lib/learning-utils";
import { speakText } from "@/lib/speech";
import { HoverWordTooltip, HoverableSentence } from "./HoverWordTooltip";

interface PracticeArenaModalProps {
  isOpen: boolean;
  isGatekeepingTest: boolean; // If true, mandatory test of Day N-1 before unlocking Day N
  targetDayNumber: number;
  languageCode: LanguageCode;
  cardsToTest: VocabCard[];
  onCloseOrBackToPrevDay: () => void;
  onPassGateTest: (unlockedDayNumber: number) => void;
  onCompleteDayPractice: (completedDayNumber: number) => void;
}

type ExerciseTab = "matching" | "sentence" | "cloze";

export default function PracticeArenaModal({
  isOpen,
  isGatekeepingTest,
  targetDayNumber,
  languageCode,
  cardsToTest,
  onCloseOrBackToPrevDay,
  onPassGateTest,
  onCompleteDayPractice,
}: PracticeArenaModalProps) {
  const [activeExercise, setActiveExercise] = useState<ExerciseTab>("matching");

  // Stage 1: Matching state — BOTH left and right columns are truly randomized across ALL words of the day
  const [leftWordsOrder, setLeftWordsOrder] = useState<VocabCard[]>([]);
  const [rightMeaningsOrder, setRightMeaningsOrder] = useState<VocabCard[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState<boolean>(false);

  // Stage 2: Sentence Building state — randomized deck covering ALL words of the day with NEW sentences
  const [sentenceDeck, setSentenceDeck] = useState<VocabCard[]>([]);
  const [sentenceCardIdx, setSentenceCardIdx] = useState(0);
  const [shuffledTiles, setShuffledTiles] = useState<string[]>([]);
  const [originalTiles, setOriginalTiles] = useState<string[]>([]);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [sentenceChecked, setSentenceChecked] = useState<boolean | null>(null);
  const [completedSentenceIds, setCompletedSentenceIds] = useState<string[]>(
    []
  );

  // Stage 3: Cloze Dictation state — randomized deck covering ALL words of the day with NEW sentences
  const [clozeDeck, setClozeDeck] = useState<VocabCard[]>([]);
  const [clozeCardIdx, setClozeCardIdx] = useState(0);
  const [clozeInput, setClozeInput] = useState("");
  const [clozeChecked, setClozeChecked] = useState<boolean | null>(null);
  const [completedClozeIds, setCompletedClozeIds] = useState<string[]>([]);

  const totalCount = cardsToTest.length;

  // Initialize & randomize all 3 exercises whenever the modal opens
  const randomizeAllExercises = () => {
    if (cardsToTest.length === 0) return;

    // 1. Randomize both Left and Right columns independently for Matching
    setLeftWordsOrder(shuffleArrayRandom(cardsToTest));
    setRightMeaningsOrder(shuffleArrayRandom(cardsToTest));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongPairFlash(false);

    // 2. Randomize Sentence Building deck across all day words
    const sDeck = shuffleArrayRandom(cardsToTest);
    setSentenceDeck(sDeck);
    setSentenceCardIdx(0);
    setSelectedTileIndices([]);
    setSentenceChecked(null);
    setCompletedSentenceIds([]);

    // 3. Randomize Cloze Dictation deck across all day words
    const cDeck = shuffleArrayRandom(cardsToTest);
    setClozeDeck(cDeck);
    setClozeCardIdx(0);
    setClozeInput("");
    setClozeChecked(null);
    setCompletedClozeIds([]);
  };

  useEffect(() => {
    if (isOpen && cardsToTest.length > 0) {
      setActiveExercise("matching");
      randomizeAllExercises();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetDayNumber, cardsToTest.length]);

  const currentSentenceCard =
    sentenceDeck[Math.min(sentenceCardIdx, Math.max(0, sentenceDeck.length - 1))];

  const currentSentenceData = useMemo(() => {
    if (!currentSentenceCard) return null;
    return getDistinctPracticeSentences(currentSentenceCard);
  }, [currentSentenceCard]);

  // Whenever currentSentenceCard changes, randomize its tiles with Math.random()
  useEffect(() => {
    if (!currentSentenceCard || !currentSentenceData) return;
    const orig = tokenizeSentenceIntoTiles(
      currentSentenceData.sentenceBuildTarget,
      languageCode
    );
    setOriginalTiles(orig);
    setShuffledTiles(shuffleArrayRandom(orig));
    setSelectedTileIndices([]);
    setSentenceChecked(null);
  }, [currentSentenceCard, currentSentenceData, languageCode]);

  const currentClozeCard =
    clozeDeck[Math.min(clozeCardIdx, Math.max(0, clozeDeck.length - 1))];

  const currentClozeData = useMemo(() => {
    if (!currentClozeCard) return null;
    return getDistinctPracticeSentences(currentClozeCard);
  }, [currentClozeCard]);

  if (!isOpen || totalCount === 0) return null;

  const isMatchingDone = matchedIds.length >= totalCount;
  const isSentenceDone = completedSentenceIds.length >= totalCount;
  const isClozeDone = completedClozeIds.length >= totalCount;
  const isAllThreeExercisesDone =
    isMatchingDone && isSentenceDone && isClozeDone;

  // Stage 1: Matching handler
  const handleSelectMeaningRight = (cardId: string) => {
    if (!selectedLeftId) return;
    if (selectedLeftId === cardId) {
      const card = cardsToTest.find((c) => c.id === cardId);
      if (card) speakText(card.term, languageCode, 0.94);
      setMatchedIds((prev) => Array.from(new Set([...prev, cardId])));
      setSelectedLeftId(null);
    } else {
      setWrongPairFlash(true);
      setTimeout(() => setWrongPairFlash(false), 600);
    }
  };

  // Stage 2: Sentence Building handlers
  const handleToggleTile = (tileIdx: number) => {
    if (sentenceChecked === true) return;
    if (sentenceChecked === false) {
      setSentenceChecked(null);
    }
    if (selectedTileIndices.includes(tileIdx)) {
      setSelectedTileIndices((prev) => prev.filter((i) => i !== tileIdx));
    } else {
      setSelectedTileIndices((prev) => [...prev, tileIdx]);
    }
  };

  const handleCheckSentence = () => {
    if (!currentSentenceCard || !currentSentenceData) return;
    const built = selectedTileIndices
      .map((i) => shuffledTiles[i])
      .join(" ")
      .replace(/[.,!?;:"'“”‘’]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
    const expected = originalTiles
      .join(" ")
      .replace(/[.,!?;:"'“”‘’]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    const ok = built === expected;
    setSentenceChecked(ok);
    speakText(currentSentenceData.sentenceBuildTarget, languageCode, 0.92);
    if (ok) {
      setCompletedSentenceIds((prev) =>
        Array.from(new Set([...prev, currentSentenceCard.id]))
      );
    }
  };

  const handleNextSentence = () => {
    if (sentenceCardIdx + 1 < sentenceDeck.length) {
      setSentenceCardIdx((prev) => prev + 1);
    }
  };

  // Stage 3: Cloze Dictation handlers
  const handleCheckCloze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClozeCard || !currentClozeData || !clozeInput.trim()) return;
    const ok =
      clozeInput.trim().toLowerCase() ===
        currentClozeCard.term.trim().toLowerCase() ||
      (currentClozeCard.traditionalTerm
        ? clozeInput.trim().toLowerCase() ===
          currentClozeCard.traditionalTerm.trim().toLowerCase()
        : false);

    setClozeChecked(ok);
    speakText(currentClozeData.clozeFullTarget, languageCode, 0.92);
    if (ok) {
      setCompletedClozeIds((prev) =>
        Array.from(new Set([...prev, currentClozeCard.id]))
      );
    }
  };

  const handleNextCloze = () => {
    setClozeInput("");
    setClozeChecked(null);
    if (clozeCardIdx + 1 < clozeDeck.length) {
      setClozeCardIdx((prev) => prev + 1);
    }
  };

  const dayToDisplay = isGatekeepingTest
    ? targetDayNumber - 1
    : targetDayNumber;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E0D8] pb-4">
          <div>
            {isGatekeepingTest ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#B45309]/12 text-[#B45309] text-xs font-semibold mb-2">
                <Lock className="w-3.5 h-3.5" />
                Bài Kiểm Tra Đầu Giờ Bắt Buộc (Ôn toàn bộ {totalCount} từ Ngày{" "}
                {targetDayNumber - 1} để mở Ngày {targetDayNumber})
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F5E3B]/12 text-[#1F5E3B] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Phòng Bài Tập Tổng Hợp — Ngày {dayToDisplay} (Đủ {totalCount}/
                {totalCount} từ)
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold text-[#181715]">
              {isGatekeepingTest
                ? `Kiểm tra đủ ${totalCount} từ Ngày ${targetDayNumber - 1} trước khi học Ngày ${targetDayNumber}`
                : `Bài tập Tổng hợp Ngày ${dayToDisplay}: Ghép từ • Xếp câu mới • Điền từ`}
            </h3>
            <p className="text-xs text-[#57534E] mt-1">
              Toàn bộ {totalCount} từ vựng trong ngày được xáo trộn ngẫu nhiên và kiểm tra bằng các mẫu câu mới hoàn toàn. Khi làm đúng hết cả 3 phần, bấm nút <strong>Hoàn thành Ngày {dayToDisplay}</strong> để nhận dấu tick xanh ✓.
            </p>
          </div>

          {!isGatekeepingTest ? (
            <button
              onClick={onCloseOrBackToPrevDay}
              className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onCloseOrBackToPrevDay}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E0D8] text-xs font-medium text-[#57534E] hover:text-[#181715]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Ngày {targetDayNumber - 1}
            </button>
          )}
        </div>

        {/* 3 Interactive Exercise Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-[#F2EFE9] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveExercise("matching")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeExercise === "matching"
                ? "bg-white text-[#181715] shadow-xs"
                : "text-[#57534E] hover:text-[#181715]"
            }`}
          >
            <Puzzle className="w-4 h-4 text-[#1F5E3B]" />
            <span>
              1. Ghép Từ ({matchedIds.length}/{totalCount})
            </span>
            {isMatchingDone && (
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
            )}
          </button>

          <button
            onClick={() => setActiveExercise("sentence")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeExercise === "sentence"
                ? "bg-white text-[#181715] shadow-xs"
                : "text-[#57534E] hover:text-[#181715]"
            }`}
          >
            <AlignLeft className="w-4 h-4 text-[#9E2A2B]" />
            <span>
              2. Xếp Câu Mới ({completedSentenceIds.length}/{totalCount})
            </span>
            {isSentenceDone && (
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
            )}
          </button>

          <button
            onClick={() => setActiveExercise("cloze")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeExercise === "cloze"
                ? "bg-white text-[#181715] shadow-xs"
                : "text-[#57534E] hover:text-[#181715]"
            }`}
          >
            <Keyboard className="w-4 h-4 text-[#B45309]" />
            <span>
              3. Điền Từ ({completedClozeIds.length}/{totalCount})
            </span>
            {isClozeDone && (
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
            )}
          </button>
        </div>

        {/* ================= EXERCISE 1: RANDOMIZED MATCHING PAIRS (ALL WORDS OF DAY) ================= */}
        {activeExercise === "matching" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
              <span>
                Bấm chọn <strong>Từ vựng</strong> ở cột trái, sau đó bấm{" "}
                <strong>Nghĩa tiếng Việt</strong> tương ứng ở cột phải (Cả 2 cột đều đã được xáo trộn ngẫu nhiên):
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLeftWordsOrder(shuffleArrayRandom(cardsToTest));
                    setRightMeaningsOrder(shuffleArrayRandom(cardsToTest));
                    setSelectedLeftId(null);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] hover:bg-[#F2EFE9] text-[#181715] font-medium"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Xáo trộn lại vị trí
                </button>
                <span className="font-mono font-semibold text-[#1F5E3B]">
                  Đã ghép đúng: {matchedIds.length}/{totalCount}
                </span>
              </div>
            </div>

            {wrongPairFlash && (
              <div className="text-xs text-[#9E2A2B] font-medium bg-[#9E2A2B]/10 px-3 py-2 rounded-xl">
                Chưa khớp rồi, bạn thử nhìn kỹ lại nghĩa tương ứng nhé!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Shuffled Target Words */}
              <div className="space-y-2">
                {leftWordsOrder.map((c) => {
                  const isMatched = matchedIds.includes(c.id);
                  const isSelected = selectedLeftId === c.id;
                  return (
                    <button
                      key={`left_${c.id}`}
                      disabled={isMatched}
                      onClick={() => {
                        setSelectedLeftId(c.id);
                        speakText(c.term, languageCode, 0.94);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all ${
                        isMatched
                          ? "bg-[#1F5E3B]/12 border-[#1F5E3B]/40 text-[#1F5E3B]"
                          : isSelected
                          ? "bg-[#181715] text-white border-[#181715] shadow-xs"
                          : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
                      }`}
                    >
                      <div>
                        <span>{c.term}</span>
                        <span
                          className={`ml-2 text-xs font-mono font-normal ${
                            isSelected ? "text-[#E5E0D8]" : "text-[#8A847C]"
                          }`}
                        >
                          {c.phonetic}
                        </span>
                      </div>
                      {isMatched && (
                        <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Independently Shuffled Meanings */}
              <div className="space-y-2">
                {rightMeaningsOrder.map((c) => {
                  const isMatched = matchedIds.includes(c.id);
                  return (
                    <button
                      key={`right_${c.id}`}
                      disabled={isMatched}
                      onClick={() => handleSelectMeaningRight(c.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-sm flex items-center justify-between transition-all ${
                        isMatched
                          ? "bg-[#1F5E3B]/12 border-[#1F5E3B]/40 text-[#1F5E3B] font-semibold"
                          : "bg-white hover:bg-[#FAF8F5] text-[#181715] border-[#E5E0D8]"
                      }`}
                    >
                      <span>{c.meaningVi}</span>
                      {isMatched && (
                        <CheckCircle2 className="w-4 h-4 text-[#1F5E3B] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {isMatchingDone && (
              <div className="p-4 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/30 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1F5E3B]">
                  ✓ Xuất sắc! Bạn đã ghép đúng toàn bộ {totalCount}/{totalCount}{" "}
                  từ của Ngày {dayToDisplay}.
                </span>
                <button
                  onClick={() => setActiveExercise("sentence")}
                  className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold hover:bg-[#18492E]"
                >
                  Qua Bài 2: Xếp Ô Thành Câu Mới ({totalCount} câu) →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= EXERCISE 2: SENTENCE BUILDING WITH NEW SENTENCES (ALL WORDS OF DAY) ================= */}
        {activeExercise === "sentence" &&
          currentSentenceCard &&
          currentSentenceData && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
                <span>
                  Câu mới #{sentenceCardIdx + 1}/{totalCount} — Vận dụng từ{" "}
                  <strong className="text-[#181715]">
                    &ldquo;{currentSentenceCard.term}&rdquo;
                  </strong>{" "}
                  ({currentSentenceCard.meaningVi}):
                </span>
                <span className="font-mono font-semibold text-[#1F5E3B]">
                  Đã xếp đúng: {completedSentenceIds.length}/{totalCount} câu
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#8A847C] block">
                    Hãy ghép các ô từ thành câu mới có nghĩa sau:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#181715] mt-0.5">
                    &ldquo;{currentSentenceData.sentenceBuildVi}&rdquo;
                  </p>
                </div>
                <button
                  onClick={() =>
                    speakText(
                      currentSentenceData.sentenceBuildTarget,
                      languageCode,
                      0.9
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs font-medium text-[#1F5E3B] shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  Nghe câu mới
                </button>
              </div>

              {/* Answer Construction Dropzone */}
              <div className="min-h-[68px] p-4 rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF8F5]/60 flex flex-wrap items-center gap-2">
                {selectedTileIndices.length === 0 ? (
                  <span className="text-xs text-[#8A847C]">
                    Bấm vào các ô từ ngẫu nhiên ở dưới để xếp thành câu hoàn chỉnh (Đưa chuột vào bất kỳ từ nào để xem phát âm & nghĩa)...
                  </span>
                ) : (
                  selectedTileIndices.map((tileIdx, pos) => (
                    <HoverWordTooltip
                      key={`${tileIdx}_${pos}`}
                      token={shuffledTiles[tileIdx]}
                      languageCode={languageCode}
                      allCards={cardsToTest}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTile(tileIdx)}
                        className="px-3.5 py-2 rounded-xl bg-[#181715] text-white text-sm font-semibold shadow-xs hover:bg-[#9E2A2B] transition-colors"
                      >
                        {shuffledTiles[tileIdx]}
                      </button>
                    </HoverWordTooltip>
                  ))
                )}
              </div>

              {/* Available Shuffled Word Tiles */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {shuffledTiles.map((word, idx) => {
                    const isUsed = selectedTileIndices.includes(idx);
                    return (
                      <HoverWordTooltip
                        key={idx}
                        token={word}
                        languageCode={languageCode}
                        allCards={cardsToTest}
                        disabled={isUsed}
                      >
                        <button
                          type="button"
                          disabled={isUsed}
                          onClick={() => handleToggleTile(idx)}
                          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            isUsed
                              ? "bg-[#F2EFE9] border-[#E5E0D8] text-transparent select-none cursor-default"
                              : "bg-white border-[#E5E0D8] text-[#181715] hover:border-[#181715] shadow-2xs"
                          }`}
                        >
                          {word}
                        </button>
                      </HoverWordTooltip>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#8A847C]">
                  💡 Mẹo: Đưa chuột lại gần bất kỳ ô từ nào để hiện hộp thoại nhỏ có phiên âm phát âm và nghĩa tiếng Việt của từ đó.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTileIndices([]);
                    setSentenceChecked(null);
                    setShuffledTiles(shuffleArrayRandom(originalTiles));
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#57534E] hover:bg-[#F2EFE9]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xáo lại các ô từ
                </button>

                {sentenceChecked === null && (
                  <button
                    type="button"
                    disabled={selectedTileIndices.length === 0}
                    onClick={handleCheckSentence}
                    className="px-6 py-2.5 rounded-xl bg-[#181715] text-white text-xs font-semibold hover:bg-[#2E2C28] disabled:opacity-40"
                  >
                    Kiểm tra câu đã ghép
                  </button>
                )}

                {sentenceChecked === false && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-[#9E2A2B]">
                      ✗ Chưa đúng thứ tự. Gợi ý câu đúng: &ldquo;
                      {currentSentenceData.sentenceBuildTarget}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTileIndices([]);
                        setSentenceChecked(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold"
                    >
                      Xếp lại câu này
                    </button>
                  </div>
                )}

                {sentenceChecked === true && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#1F5E3B]">
                      ✓ Chính xác! ({completedSentenceIds.length}/{totalCount}{" "}
                      câu hoàn tất)
                    </span>
                    {isSentenceDone ? (
                      <button
                        type="button"
                        onClick={() => setActiveExercise("cloze")}
                        className="px-4 py-2 rounded-xl bg-[#1F5E3B] text-white text-xs font-semibold"
                      >
                        Qua Bài 3: Điền Từ Vào Câu Mới ({totalCount} câu) →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextSentence}
                        className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-semibold"
                      >
                        Sang câu mới tiếp theo ({sentenceCardIdx + 2}/
                        {totalCount}) →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ================= EXERCISE 3: CLOZE & DICTATION WITH NEW SENTENCES (ALL WORDS OF DAY) ================= */}
        {activeExercise === "cloze" && currentClozeCard && currentClozeData && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-[#57534E]">
              <span>
                Câu điền khuyết mới #{clozeCardIdx + 1}/{totalCount} — Nghe câu và điền đúng từ vựng còn thiếu:
              </span>
              <span className="font-mono font-semibold text-[#1F5E3B]">
                Đã điền đúng: {completedClozeIds.length}/{totalCount} câu
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A847C]">
                  Gợi ý nghĩa của từ cần điền:{" "}
                  <strong className="text-[#181715]">
                    {currentClozeCard.meaningVi}
                  </strong>{" "}
                  ({currentClozeCard.phonetic})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      currentClozeData.clozeFullTarget,
                      languageCode,
                      0.9
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-medium text-[#1F5E3B]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Nghe cả câu mới
                </button>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#181715]">
                <HoverableSentence
                  sentence={currentClozeData.clozeSentenceWithBlank}
                  languageCode={languageCode}
                  allCards={cardsToTest}
                />
              </div>
              <p className="text-xs text-[#57534E]">
                → {currentClozeData.clozeVi}
              </p>
            </div>

            <form onSubmit={handleCheckCloze} className="flex gap-2">
              <input
                type="text"
                value={clozeInput}
                onChange={(e) => {
                  setClozeInput(e.target.value);
                  if (clozeChecked === false) setClozeChecked(null);
                }}
                placeholder="Nhập từ vựng còn thiếu vào chỗ trống..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm font-medium focus:outline-none focus:border-[#181715]"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#181715] text-white text-xs font-semibold hover:bg-[#2E2C28]"
              >
                Kiểm tra
              </button>
            </form>

            {clozeChecked === false && (
              <div className="p-4 rounded-2xl bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-xs font-semibold text-[#9E2A2B]">
                ✗ Chưa chính xác — Từ cần điền có nghĩa &ldquo;
                {currentClozeCard.meaningVi}&rdquo; ({currentClozeCard.term}). Hãy gõ lại để vượt qua câu này nhé!
              </div>
            )}

            {clozeChecked === true && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/30">
                <span className="text-xs font-semibold text-[#1F5E3B]">
                  ✓ Chính xác! Từ cần điền là &ldquo;{currentClozeCard.term}&rdquo; (
                  {completedClozeIds.length}/{totalCount} câu hoàn tất).
                </span>
                {!isClozeDone && (
                  <button
                    type="button"
                    onClick={handleNextCloze}
                    className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-semibold"
                  >
                    Sang câu tiếp theo ({clozeCardIdx + 2}/{totalCount}) →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= FINAL COMPLETION BANNER & GREEN CHECKMARK BUTTON ================= */}
        {isAllThreeExercisesDone && (
          <div className="p-6 rounded-3xl bg-[#1F5E3B] text-white flex flex-wrap items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#A7F3D0]">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã vượt qua 100% cả 3 bài tập ({totalCount}/{totalCount} từ)
                </div>
                <h4 className="text-lg font-bold mt-0.5">
                  {isGatekeepingTest
                    ? `Xuất sắc! Bạn đã vượt qua bài kiểm tra ôn tập Ngày ${targetDayNumber - 1}!`
                    : `Chúc mừng! Bạn đã làm đúng hết toàn bộ bài tập Ngày ${dayToDisplay}!`}
                </h4>
              </div>
            </div>

            {isGatekeepingTest ? (
              <button
                onClick={() => onPassGateTest(targetDayNumber)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#1F5E3B] text-sm font-bold hover:bg-[#FAF8F5] transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mở khóa & Vào học Ngày {targetDayNumber} ngay →</span>
              </button>
            ) : (
              <button
                onClick={() => onCompleteDayPractice(dayToDisplay)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#1F5E3B] text-sm font-bold hover:bg-[#FAF8F5] transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
                <span>✓ Ấn Hoàn Thành Ngày {dayToDisplay}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
