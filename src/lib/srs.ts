import { SRSRating, SRSState, VocabCard } from "@/types/language";

export interface SRSUpdateResult {
  state: SRSState;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt: string;
}

/**
 * Computes the next SRS state using an enhanced SM-2 schedule.
 */
export function calculateNextReview(
  card: VocabCard,
  rating: SRSRating,
  now: Date = new Date()
): SRSUpdateResult {
  let { intervalDays, easeFactor, repetitions } = card;
  let state: SRSState = card.state;

  if (rating === "again") {
    repetitions = 0;
    intervalDays = 0; // Review again in ~10 minutes (same day)
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    state = "learning";
    const tenMinsLater = new Date(now.getTime() + 10 * 60 * 1000);
    return {
      state,
      intervalDays,
      easeFactor: Number(easeFactor.toFixed(2)),
      repetitions,
      nextReviewAt: tenMinsLater.toISOString(),
      lastReviewedAt: now.toISOString(),
    };
  }

  if (rating === "hard") {
    repetitions = Math.max(1, repetitions);
    intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    state = intervalDays >= 14 ? "mastered" : "review";
  } else if (rating === "good") {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(4, Math.round(intervalDays * easeFactor));
    }
    state = intervalDays >= 14 ? "mastered" : "review";
  } else if (rating === "easy") {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 4;
    } else {
      intervalDays = Math.max(6, Math.round(intervalDays * easeFactor * 1.3));
    }
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    state = intervalDays >= 14 ? "mastered" : "review";
  }

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    state,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    nextReviewAt: nextDate.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/**
 * Returns human-readable label for how far in the future each rating button will schedule the card.
 */
export function getIntervalPreviewLabel(card: VocabCard, rating: SRSRating): string {
  if (rating === "again") return "10 phút";
  const sim = calculateNextReview(card, rating);
  if (sim.intervalDays <= 1) return "1 ngày";
  return `${sim.intervalDays} ngày`;
}

export function isCardDue(card: VocabCard, now: Date = new Date()): boolean {
  if (card.state === "new") return true;
  return new Date(card.nextReviewAt).getTime() <= now.getTime();
}

