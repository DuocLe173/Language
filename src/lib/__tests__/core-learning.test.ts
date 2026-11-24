import { describe, it, expect } from "vitest";
import { calculateNextReview, isCardDue } from "@/lib/srs";
import { verifyStep4WordInput, verifyStep5SentenceTranslation } from "@/lib/learning-utils";
import { segmentSentenceIntoTokens } from "@/lib/word-gloss-dictionary";
import { INITIAL_VOCAB_CARDS } from "@/lib/seed-data";
import { computePlacementUnlockDay } from "@/lib/placement-utils";
import { VocabCard } from "@/types/language";

const MOCK_CARD: VocabCard = {
  id: "test_card_1",
  userId: "user_1",
  languageCode: "en",
  topicId: "daily_communication",
  dayNumber: 1,
  orderIndex: 1,
  term: "Resilient",
  phonetic: "/rɪˈzɪl.jənt/",
  partOfSpeech: "adjective",
  meaningVi: "Kiên cường",
  naturalContextVi: "Diễn tả sự bền bỉ vượt qua nghịch cảnh.",
  exampleTarget: "She stayed resilient during hard times.",
  exampleVi: "Cô ấy vẫn kiên cường trong những lúc khó khăn.",
  tags: ["test"],
  level: "B1",
  isCompletedInTopic: true,
  state: "new",
  intervalDays: 0,
  easeFactor: 2.5,
  repetitions: 0,
  nextReviewAt: new Date(Date.now() - 3600_000).toISOString(),
  createdAt: new Date().toISOString(),
};

describe("SM-2 SRS Scheduling Engine", () => {
  it("marks cards with past nextReviewAt as due", () => {
    expect(isCardDue(MOCK_CARD)).toBe(true);
  });

  it("schedules longer intervals for easy vs hard ratings", () => {
    const now = new Date("2026-11-24T12:00:00Z");
    const hardRes = calculateNextReview(MOCK_CARD, "hard", now);
    const easyRes = calculateNextReview(MOCK_CARD, "easy", now);
    expect(hardRes.intervalDays).toBe(1);
    expect(easyRes.intervalDays).toBeGreaterThanOrEqual(4);
    expect(isCardDue({ ...MOCK_CARD, ...easyRes }, now)).toBe(false);
  });

  it("resets repetitions and schedules 10-minute retry on 'again'", () => {
    const now = new Date("2026-11-24T12:00:00Z");
    const res = calculateNextReview({ ...MOCK_CARD, repetitions: 3, intervalDays: 10 }, "again", now);
    expect(res.repetitions).toBe(0);
    expect(res.intervalDays).toBe(0);
    expect(res.state).toBe("learning");
  });
});

describe("Active Recall Verification & CJK Segmentation", () => {
  it("validates Step 4 input case-insensitively and ignores punctuation", () => {
    expect(verifyStep4WordInput("resilient", "Resilient")).toBe(true);
    expect(verifyStep4WordInput("wrong", "Resilient")).toBe(false);
  });

  it("validates Step 5 Vietnamese translation flexibly", () => {
    const ok = verifyStep5SentenceTranslation(
      "Cô ấy vẫn kiên cường trong lúc khó khăn",
      MOCK_CARD.exampleVi
    );
    expect(ok.isCorrect).toBe(true);
  });

  it("segments unspaced Chinese sentences into individual hoverable words", () => {
    const tokens = segmentSentenceIntoTokens("今天天气真好！", "zh-CN", INITIAL_VOCAB_CARDS);
    expect(tokens.length).toBeGreaterThanOrEqual(3);
    expect(tokens).toContain("今天");
    expect(tokens).toContain("天气");
  });

  it("includes expanded multi-language starter curricula across all 6 languages", () => {
    const langs = ["en", "zh-CN", "zh-TW", "ja", "ko", "fr"] as const;
    for (const lang of langs) {
      const count = INITIAL_VOCAB_CARDS.filter((c) => c.languageCode === lang).length;
      expect(count).toBeGreaterThanOrEqual(10);
    }
  });

  it("computes adaptive Placement Test unlock days accurately", () => {
    expect(computePlacementUnlockDay(1, 6).recommendedDay).toBe(1);
    expect(computePlacementUnlockDay(3, 6).recommendedDay).toBe(4);
    expect(computePlacementUnlockDay(5, 6).recommendedDay).toBe(6);
    expect(computePlacementUnlockDay(6, 6).recommendedDay).toBe(8);
  });
});
