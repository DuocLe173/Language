export type LanguageCode = "en" | "zh-CN" | "zh-TW" | "ja" | "ko" | "fr";

export type TopicId =
  | "daily_communication"
  | "animals_nature"
  | "travel_dining"
  | "work_office"
  | "tech_digital"
  | "food_culinary"
  | "shopping_lifestyle"
  | "core_academic"
  | "custom_saved";

export interface LanguageMeta {
  code: LanguageCode;
  nameVi: string;
  nativeName: string;
  shortLabel: string;
  speechLang: string;
  phoneticLabel: string; // e.g., "IPA", "Pinyin", "Romaji"
  hasCharacterBreakdown?: boolean;
  accentColor: string;
}

export interface TopicMeta {
  id: TopicId;
  titleVi: string;
  subtitleVi: string;
  iconName:
    | "message"
    | "paw"
    | "compass"
    | "briefcase"
    | "cpu"
    | "utensils"
    | "shopping"
    | "graduation"
    | "bookmark";
  levelLabel: string;
  totalDays: number;
  wordsPerDay: number;
  order: number;
  dayThemes?: Record<number, string>;
}

export interface TopicProgress {
  topicId: TopicId;
  languageCode: LanguageCode;
  activeDay: number; // 1..10
  unlockedDay: number; // Highest unlocked day (starts at 1; Day N+1 unlocks when Day N is 100% done)
  gateTestPassedDays: number[]; // Days (e.g. [2, 3]) where the user passed the Day N review test to enter Day N+1
  completedCardIds: string[];
  currentCardIndex: number; // Exact index within activeDay (0..9)
  isCompleted: boolean;
  completedAt?: string;
  lastStudiedAt?: string;
}

export type SRSState = "new" | "learning" | "review" | "mastered";
export type SRSRating = "again" | "hard" | "good" | "easy";

export interface VocabCard {
  id: string;
  userId: string;
  languageCode: LanguageCode;
  topicId: TopicId;
  dayNumber: number; // 1..10 (10 words per day)
  orderIndex: number; // 1..10 within that day
  term: string;
  traditionalTerm?: string;
  phonetic: string;
  partOfSpeech: string;
  meaningVi: string;
  naturalContextVi: string;
  exampleTarget: string; // Basic sentence for Step 5 translation & Sentence Building
  examplePhonetic?: string;
  exampleVi: string; // Target translation for Step 5
  acceptedTranslationsVi?: string[]; // Alternative valid Vietnamese translations
  notes?: string;
  tags: string[];
  level: string; // A1 -> A2 -> B1 -> B2 -> C1 progressive by day
  isCompletedInTopic: boolean;
  // Spaced Repetition System (SM-2 enhanced)
  state: SRSState;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
  createdAt: string;
}

export interface GrammarMistakeItem {
  wrong: string;
  right: string;
  ruleVi: string;
}

export interface SuggestedVocabItem {
  term: string;
  phonetic: string;
  meaningVi: string;
  partOfSpeech: string;
  exampleTarget: string;
  exampleVi: string;
}

export interface GrammarAnalysis {
  isCorrect: boolean;
  score: number;
  correctedText: string;
  correctedPhonetic?: string;
  explanationVi: string;
  nativeAlternative: string;
  nativeAlternativePhonetic?: string;
  mistakes: GrammarMistakeItem[];
  suggestedVocab?: SuggestedVocabItem;
}

export interface ChatMessage {
  id: string;
  userId: string;
  languageCode: LanguageCode;
  scenarioId: string;
  role: "user" | "assistant";
  content: string;
  phonetic?: string;
  translationVi?: string;
  timestamp: string;
  grammarAnalysis?: GrammarAnalysis;
}

export interface RoleplayScenario {
  id: string;
  topicId?: TopicId;
  titleVi: string;
  subtitleVi: string;
  roleAi: string;
  roleUser: string;
  difficulty: string;
  greetings: Record<
    LanguageCode,
    {
      target: string;
      phonetic?: string;
      vi: string;
      prompts: Array<{ target: string; phonetic?: string; vi: string }>;
    }
  >;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email?: string;
  nativeLang: "vi";
  activeTargetLang: LanguageCode;
  activeTopicByLang: Record<LanguageCode, TopicId>;
  topicProgressMap: Record<string, TopicProgress>; // key: `${languageCode}__${topicId}`
  enabledLangs: LanguageCode[];
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  dailyGoalCards: number;
  reviewedToday: number;
  totalLearnedWords: number;
  showPhonetics: boolean;
  chineseScript: "simplified" | "traditional";
  aiProvider: "auto" | "gemini" | "openai";
  geminiApiKey?: string;
  openaiApiKey?: string;
  createdAt: string;
}
