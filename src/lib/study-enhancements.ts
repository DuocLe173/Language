import { LanguageCode, VocabCard } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";

export interface WordCollocationInfo {
  collocationTarget: string;
  collocationMeaningVi: string;
  memoryTipVi: string;
  highlightedParts: Array<{ text: string; isMatch: boolean }>;
}

/**
 * Extracts a natural 2-4 word collocation phrase containing the target term from exampleTarget,
 * splits exampleTarget to highlight the target word, and builds a practical memory tip.
 */
export function getWordCollocationsAndTip(
  card: VocabCard
): WordCollocationInfo {
  const sentence = card.exampleTarget || "";
  const term = card.term || "";

  // Highlight target word inside exampleTarget (case-insensitive)
  const highlightedParts: Array<{ text: string; isMatch: boolean }> = [];
  if (sentence && term) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const rawParts = sentence.split(regex);
    for (const part of rawParts) {
      if (!part) continue;
      highlightedParts.push({
        text: part,
        isMatch: part.toLowerCase() === term.toLowerCase(),
      });
    }
  } else {
    highlightedParts.push({ text: sentence, isMatch: false });
  }

  // Extract a surrounding 2-4 word collocation from the example sentence
  let collocationTarget = term;
  if (sentence && term) {
    const words = sentence
      .replace(/[.,!?;:"“”()]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const matchIdx = words.findIndex((w) =>
      w.toLowerCase().includes(term.toLowerCase().split(/\s+/)[0])
    );
    if (matchIdx !== -1) {
      const start = Math.max(0, matchIdx - 1);
      const end = Math.min(words.length, matchIdx + 3);
      collocationTarget = words.slice(start, end).join(" ");
    }
  }

  const posMap: Record<string, string> = {
    noun: "Danh từ — thường đứng sau mạo từ (a/an/the) hoặc tính từ để làm chủ ngữ/tân ngữ.",
    verb: "Động từ — chú ý chia thì phù hợp với chủ ngữ và ngữ cảnh hành động.",
    adjective: "Tính từ — thường đứng trước danh từ hoặc sau động từ to be/linking verbs.",
    adverb: "Trạng từ — bổ nghĩa cho động từ hoặc cả câu để tăng sắc thái biểu đạt.",
    phrase: "Cụm từ giao tiếp — hãy học thuộc nguyên cụm thay vì tách lẻ từng chữ.",
    idiom: "Thành ngữ bản xứ — dùng nguyên cụm để câu nói tự nhiên và giàu hình ảnh.",
  };

  const memoryTipVi =
    card.notes ||
    posMap[card.partOfSpeech.toLowerCase()] ||
    `Gắn từ "${card.term}" vào cụm "${collocationTarget}" và đọc to 2 lần để não ghi nhớ theo ngữ cảnh.`;

  return {
    collocationTarget,
    collocationMeaningVi: card.meaningVi,
    memoryTipVi,
    highlightedParts,
  };
}

/**
 * Generates shuffled word/phrase tiles for Step 5 interactive Word Bank translation
 * so learners can tap tiles instead of typing long sentences by hand.
 */
export function buildVietnameseWordBank(
  exampleVi: string,
  allDayCards: VocabCard[]
): string[] {
  const clean = exampleVi
    .replace(/[.,!?;:"“”()]/g, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);

  // Group into 2-word chunks if the sentence has more than 9 words so tiles stay ergonomic
  const chunks: string[] = [];
  if (words.length > 9) {
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
  } else {
    chunks.push(...words);
  }

  // Add 2 subtle distractor chunks from other cards in the same day
  const distractors: string[] = [];
  for (const c of allDayCards) {
    if (c.exampleVi !== exampleVi && c.meaningVi) {
      const dWord = c.meaningVi.split(/[;,/]/)[0].trim();
      if (dWord && !chunks.includes(dWord) && distractors.length < 2) {
        distractors.push(dWord);
      }
    }
  }

  const combined = [...chunks, ...distractors];
  // Deterministic shuffle based on string char codes so it doesn't jitter on re-render
  return combined
    .map((item, idx) => ({
      item,
      sortKey:
        ((item.charCodeAt(0) || 7) * 31 + idx * 17 + exampleVi.length * 13) %
        97,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((x) => x.item);
}

/**
 * Generates shuffled target-language word tiles for Reverse Sentence Assembly practice.
 */
export function buildTargetLanguageWordBank(exampleTarget: string): string[] {
  const clean = exampleTarget
    .replace(/[.,!?;:"“”()]/g, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return words
    .map((item, idx) => ({
      item,
      sortKey:
        ((item.charCodeAt(0) || 11) * 29 +
          idx * 19 +
          exampleTarget.length * 7) %
        89,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((x) => x.item);
}

/**
 * Generates an interactive Character / Syllable Tile Bank for Step 4 (3-Round Cloze Spelling)
 * so learners can tap characters/chunks even if they don't have Chinese/Japanese/Korean IME installed.
 */
export function buildStep4CharacterBank(
  displayTerm: string,
  allDayCards: VocabCard[],
  round: number
): string[] {
  const clean = displayTerm.trim();
  if (!clean) return [];

  // If the term has spaces and is long (>12 chars), split by words or 2-3 char syllables; otherwise split by characters
  let baseUnits: string[] = [];
  if (clean.includes(" ") && clean.length > 12) {
    baseUnits = clean.split(/\s+/).filter(Boolean);
  } else {
    baseUnits = Array.from(clean);
  }

  // Gather 2 subtle distractor characters/units from other cards of the same day
  const distractors: string[] = [];
  for (const c of allDayCards) {
    if (c.term !== displayTerm && c.term) {
      const candidateChars =
        clean.includes(" ") && clean.length > 12
          ? c.term.split(/\s+/).filter(Boolean)
          : Array.from(c.term.trim());
      for (const ch of candidateChars) {
        if (
          ch.trim() &&
          !baseUnits.includes(ch) &&
          !distractors.includes(ch) &&
          distractors.length < 2
        ) {
          distractors.push(ch);
        }
      }
    }
  }

  const combined = [...baseUnits, ...distractors];
  return combined
    .map((unit, idx) => ({
      unit,
      sortKey:
        ((unit.charCodeAt(0) || 13) * 37 +
          idx * 23 +
          round * 19 +
          clean.length * 11) %
        101,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((x) => x.unit);
}

export interface DailyStoryTurn {
  speaker: string;
  roleLabel: string;
  targetSentence: string;
  phonetic?: string;
  viSentence: string;
  featuredTerm: string;
  featuredMeaningVi: string;
}

/**
 * Builds a cohesive 10-turn mini-dialogue / context story combining all 10 words of the current day.
 */
export function buildDailyContextStory(
  dayCards: VocabCard[]
): DailyStoryTurn[] {
  const speakers = [
    { speaker: "Alex", roleLabel: "Người bản xứ" },
    { speaker: "Minh", roleLabel: "Bạn đồng hành" },
  ];

  return dayCards.map((card, idx) => {
    const sp = speakers[idx % 2];
    return {
      speaker: sp.speaker,
      roleLabel: sp.roleLabel,
      targetSentence: card.exampleTarget,
      phonetic: card.examplePhonetic || card.phonetic,
      viSentence: card.exampleVi,
      featuredTerm: card.term,
      featuredMeaningVi: card.meaningVi,
    };
  });
}

/**
 * Uses Web Speech Recognition API (if supported by browser) to listen to learner's pronunciation
 * and compare it with the target word.
 */
export function startPronunciationCheck(
  expectedTerm: string,
  languageCode: LanguageCode,
  onSuccess: (transcript: string, isMatch: boolean) => void,
  onError: (errorMsg: string) => void
): () => void {
  if (typeof window === "undefined") {
    onError("Trình duyệt chưa sẵn sàng.");
    return () => {};
  }

  const SpeechRecognitionCtor =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    onError(
      "Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói trực tiếp (Khuyên dùng Chrome/Edge)."
    );
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognitionCtor as any)();
  recognition.lang = LANGUAGES[languageCode]?.speechLang || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const results = event.results?.[0];
    if (!results) {
      onError("Chưa nghe rõ giọng đọc, bạn hãy thử lại nhé.");
      return;
    }

    const cleanExpected = expectedTerm
      .toLowerCase()
      .replace(/[.,!?;:"“”()'-]/g, "")
      .trim();

    let bestTranscript = "";
    let matched = false;

    for (let i = 0; i < results.length; i++) {
      const candidate = String(results[i].transcript || "").trim();
      if (i === 0) bestTranscript = candidate;
      const cleanCand = candidate
        .toLowerCase()
        .replace(/[.,!?;:"“”()'-]/g, "")
        .trim();
      if (
        cleanCand === cleanExpected ||
        cleanCand.includes(cleanExpected) ||
        cleanExpected.includes(cleanCand)
      ) {
        matched = true;
        bestTranscript = candidate;
        break;
      }
    }

    onSuccess(bestTranscript, matched);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    const code = String(event?.error || "");
    if (code === "not-allowed") {
      onError("Vui lòng cấp quyền Micro trên trình duyệt để chấm phát âm.");
    } else {
      onError("Chưa thu được âm thanh. Bạn hãy đọc to và rõ hơn nhé!");
    }
  };

  try {
    recognition.start();
  } catch {
    onError("Không thể khởi động Micro. Vui lòng thử lại.");
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  };
}

