import {
  DEFAULT_USER_ID,
  INITIAL_USER_PROFILE,
  INITIAL_VOCAB_CARDS,
} from "@/lib/seed-data";
import {
  ChatMessage,
  LanguageCode,
  TopicId,
  TopicProgress,
  UserProfile,
  VocabCard,
} from "@/types/language";

const KEYS = {
  USERS: "linguaforge_users_v3",
  ACTIVE_USER_ID: "linguaforge_active_user_id_v3",
  VOCAB: "linguaforge_vocab_v3",
  CHATS: "linguaforge_chats_v3",
};

export function makeTopicKey(lang: LanguageCode, topicId: TopicId): string {
  return `${lang}__${topicId}`;
}

function normalizeUserProfile(rawUser: Partial<UserProfile>): UserProfile {
  const todayStr = new Date().toISOString().slice(0, 10);
  const base: UserProfile = {
    ...INITIAL_USER_PROFILE,
    ...rawUser,
    activeTopicByLang: {
      ...INITIAL_USER_PROFILE.activeTopicByLang,
      ...(rawUser.activeTopicByLang || {}),
    },
    topicProgressMap: {
      ...(rawUser.topicProgressMap || {}),
    },
  };

  if (base.lastStudyDate && base.lastStudyDate !== todayStr) {
    const lastDate = new Date(`${base.lastStudyDate}T00:00:00`);
    const currDate = new Date(`${todayStr}T00:00:00`);
    const diffDays = Math.round(
      (currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      base.streakDays = (base.streakDays || 1) + 1;
    } else if (diffDays > 1) {
      base.streakDays = 1;
    }
    base.reviewedToday = 0;
    base.lastStudyDate = todayStr;
  }

  return base;
}

export function loadAllUsers(): UserProfile[] {
  if (typeof window === "undefined") return [INITIAL_USER_PROFILE];
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) {
      const initial = [normalizeUserProfile(INITIAL_USER_PROFILE)];
      localStorage.setItem(KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [normalizeUserProfile(INITIAL_USER_PROFILE)];
      localStorage.setItem(KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const normalized = parsed.map(normalizeUserProfile);
    localStorage.setItem(KEYS.USERS, JSON.stringify(normalized));
    return normalized;
  } catch {
    return [INITIAL_USER_PROFILE];
  }
}

export function getActiveUserProfile(): UserProfile {
  const users = loadAllUsers();
  if (typeof window === "undefined") return users[0];
  const activeId = localStorage.getItem(KEYS.ACTIVE_USER_ID) || DEFAULT_USER_ID;
  return users.find((u) => u.id === activeId) || users[0];
}

export function saveUserProfile(updated: UserProfile): UserProfile[] {
  if (typeof window === "undefined") return [updated];
  const users = loadAllUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx >= 0) {
    users[idx] = updated;
  } else {
    users.push(updated);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.ACTIVE_USER_ID, updated.id);
  return users;
}

export function createNewUserProfile(name: string): UserProfile {
  const newId = `user_${Date.now()}`;
  const newUser: UserProfile = normalizeUserProfile({
    ...INITIAL_USER_PROFILE,
    id: newId,
    name: name.trim() || "Học Viên Mới",
    streakDays: 1,
    reviewedToday: 0,
    totalLearnedWords: 0,
    topicProgressMap: {},
    createdAt: new Date().toISOString(),
  });
  saveUserProfile(newUser);

  const allCards = loadAllVocabCardsRaw();
  const clonedSeed = INITIAL_VOCAB_CARDS.map((card) => ({
    ...card,
    id: `${newId}_${card.id}`,
    userId: newId,
  }));
  localStorage.setItem(KEYS.VOCAB, JSON.stringify([...allCards, ...clonedSeed]));
  return newUser;
}

export function switchUserProfile(userId: string): UserProfile {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.ACTIVE_USER_ID, userId);
  }
  return getActiveUserProfile();
}

function loadAllVocabCardsRaw(): VocabCard[] {
  if (typeof window === "undefined") return INITIAL_VOCAB_CARDS;
  try {
    const raw = localStorage.getItem(KEYS.VOCAB);
    if (!raw) {
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(INITIAL_VOCAB_CARDS));
      return INITIAL_VOCAB_CARDS;
    }
    const parsed = JSON.parse(raw) as VocabCard[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(INITIAL_VOCAB_CARDS));
      return INITIAL_VOCAB_CARDS;
    }

    const existingIds = new Set(parsed.map((c) => c.id));
    let addedMissing = false;
    for (const seedCard of INITIAL_VOCAB_CARDS) {
      if (!existingIds.has(seedCard.id)) {
        parsed.push(seedCard);
        addedMissing = true;
      }
    }
    if (addedMissing) {
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_VOCAB_CARDS;
  }
}

export function getUserVocabCards(userId: string): VocabCard[] {
  const all = loadAllVocabCardsRaw();
  return all
    .filter((c) => c.userId === userId)
    .sort((a, b) => {
      if ((a.dayNumber || 1) !== (b.dayNumber || 1)) {
        return (a.dayNumber || 1) - (b.dayNumber || 1);
      }
      return (a.orderIndex || 99) - (b.orderIndex || 99);
    });
}

export function upsertVocabCard(card: VocabCard): VocabCard[] {
  if (typeof window === "undefined") return INITIAL_VOCAB_CARDS;
  const all = loadAllVocabCardsRaw();
  const idx = all.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    all[idx] = card;
  } else {
    all.push(card);
  }
  localStorage.setItem(KEYS.VOCAB, JSON.stringify(all));
  return getUserVocabCards(card.userId);
}

export function completeFullDayForUser(
  user: UserProfile,
  languageCode: LanguageCode,
  topicId: TopicId,
  dayNumber: number
): { updatedUser: UserProfile; updatedCards: VocabCard[] } {
  const all = loadAllVocabCardsRaw().map((card) => {
    if (
      card.userId === user.id &&
      card.languageCode === languageCode &&
      card.topicId === topicId &&
      (card.dayNumber || 1) === dayNumber
    ) {
      return {
        ...card,
        isCompletedInTopic: true,
      };
    }
    return card;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.VOCAB, JSON.stringify(all));
  }

  const userCards = all.filter((c) => c.userId === user.id);
  const topicCards = userCards.filter(
    (c) => c.languageCode === languageCode && c.topicId === topicId
  );
  const completedIds = topicCards
    .filter((c) => c.isCompletedInTopic)
    .map((c) => c.id);

  const key = makeTopicKey(languageCode, topicId);
  const prevProg = getOrInitTopicProgress(user, languageCode, topicId, topicCards);
  const newUnlockedDay = Math.max(prevProg.unlockedDay, Math.min(10, dayNumber + 1));
  const isTopicNowCompleted =
    topicCards.length > 0 && completedIds.length >= topicCards.length;

  const updatedUser: UserProfile = {
    ...user,
    reviewedToday: user.reviewedToday + 10,
    totalLearnedWords: userCards.filter((c) => c.isCompletedInTopic).length,
    lastStudyDate: new Date().toISOString().slice(0, 10),
    topicProgressMap: {
      ...user.topicProgressMap,
      [key]: {
        ...prevProg,
        activeDay: dayNumber,
        unlockedDay: newUnlockedDay,
        completedCardIds: completedIds,
        isCompleted: isTopicNowCompleted,
        completedAt: isTopicNowCompleted
          ? new Date().toISOString()
          : undefined,
        lastStudiedAt: new Date().toISOString(),
      },
    },
  };
  saveUserProfile(updatedUser);

  return {
    updatedUser,
    updatedCards: getUserVocabCards(user.id),
  };
}

export function resetTopicProgressForUser(
  user: UserProfile,
  languageCode: LanguageCode,
  topicId: TopicId
): { updatedUser: UserProfile; updatedCards: VocabCard[] } {
  const all = loadAllVocabCardsRaw().map((card) => {
    if (
      card.userId === user.id &&
      card.languageCode === languageCode &&
      card.topicId === topicId
    ) {
      return {
        ...card,
        isCompletedInTopic: false,
      };
    }
    return card;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.VOCAB, JSON.stringify(all));
  }

  const key = makeTopicKey(languageCode, topicId);
  const updatedProgressMap = { ...user.topicProgressMap };
  updatedProgressMap[key] = {
    topicId,
    languageCode,
    activeDay: 1,
    unlockedDay: 1,
    gateTestPassedDays: [1],
    completedCardIds: [],
    currentCardIndex: 0,
    isCompleted: false,
    lastStudiedAt: new Date().toISOString(),
  };

  const updatedUser: UserProfile = {
    ...user,
    topicProgressMap: updatedProgressMap,
  };
  saveUserProfile(updatedUser);

  return {
    updatedUser,
    updatedCards: getUserVocabCards(user.id),
  };
}

export function deleteVocabCard(cardId: string, userId: string): VocabCard[] {
  if (typeof window === "undefined") return [];
  const all = loadAllVocabCardsRaw().filter((c) => c.id !== cardId);
  localStorage.setItem(KEYS.VOCAB, JSON.stringify(all));
  return getUserVocabCards(userId);
}

export function getOrInitTopicProgress(
  user: UserProfile,
  languageCode: LanguageCode,
  topicId: TopicId,
  topicCards: VocabCard[]
): TopicProgress {
  const key = makeTopicKey(languageCode, topicId);
  const existing = user.topicProgressMap[key];
  const completedFromCards = topicCards
    .filter((c) => c.isCompletedInTopic)
    .map((c) => c.id);

  const mergedCompletedIds = Array.from(
    new Set([...(existing?.completedCardIds || []), ...completedFromCards])
  ).filter((id) => topicCards.some((c) => c.id === id));

  // Calculate highest unlocked day based on sequential day completion
  let highestUnlockedDay = existing?.unlockedDay || 1;
  for (let d = 1; d <= 10; d++) {
    const dayCards = topicCards.filter((c) => (c.dayNumber || 1) === d);
    if (
      dayCards.length > 0 &&
      dayCards.every((c) => mergedCompletedIds.includes(c.id))
    ) {
      highestUnlockedDay = Math.max(highestUnlockedDay, Math.min(10, d + 1));
    } else {
      break;
    }
  }

  const activeDay = Math.min(
    highestUnlockedDay,
    Math.max(1, existing?.activeDay || 1)
  );

  const activeDayCards = topicCards.filter(
    (c) => (c.dayNumber || 1) === activeDay
  );
  const firstUncompletedInDay = activeDayCards.findIndex(
    (c) => !mergedCompletedIds.includes(c.id)
  );

  const resumeIndex =
    firstUncompletedInDay >= 0
      ? firstUncompletedInDay
      : Math.max(0, activeDayCards.length - 1);

  const isAllDone =
    topicCards.length > 0 && mergedCompletedIds.length >= topicCards.length;

  return {
    topicId,
    languageCode,
    activeDay,
    unlockedDay: highestUnlockedDay,
    gateTestPassedDays: Array.from(
      new Set([1, ...(existing?.gateTestPassedDays || [])])
    ),
    completedCardIds: mergedCompletedIds,
    currentCardIndex:
      existing?.currentCardIndex !== undefined
        ? Math.min(existing.currentCardIndex, Math.max(0, activeDayCards.length - 1))
        : resumeIndex,
    isCompleted: isAllDone,
    completedAt: isAllDone
      ? existing?.completedAt || new Date().toISOString()
      : undefined,
    lastStudiedAt: existing?.lastStudiedAt,
  };
}

export function loadUserChatMessages(
  userId: string,
  languageCode: string,
  scenarioId: string
): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.CHATS);
    if (!raw) return [];
    const all = JSON.parse(raw) as ChatMessage[];
    return all.filter(
      (m) =>
        m.userId === userId &&
        m.languageCode === languageCode &&
        m.scenarioId === scenarioId
    );
  } catch {
    return [];
  }
}

export function saveChatMessage(msg: ChatMessage): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEYS.CHATS);
    const all = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    all.push(msg);
    localStorage.setItem(KEYS.CHATS, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function clearScenarioChat(
  userId: string,
  languageCode: string,
  scenarioId: string
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEYS.CHATS);
    if (!raw) return;
    const all = JSON.parse(raw) as ChatMessage[];
    const remaining = all.filter(
      (m) =>
        !(
          m.userId === userId &&
          m.languageCode === languageCode &&
          m.scenarioId === scenarioId
        )
    );
    localStorage.setItem(KEYS.CHATS, JSON.stringify(remaining));
  } catch {
    // ignore
  }
}

export function exportFullBackupJson(): string {
  if (typeof window === "undefined") return "{}";
  const payload = {
    version: "3.0.0",
    exportedAt: new Date().toISOString(),
    users: loadAllUsers(),
    vocab: loadAllVocabCardsRaw(),
    chats: JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]"),
  };
  return JSON.stringify(payload, null, 2);
}

export function importFullBackupJson(rawJson: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed.users) && Array.isArray(parsed.vocab)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(parsed.users));
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(parsed.vocab));
      if (Array.isArray(parsed.chats)) {
        localStorage.setItem(KEYS.CHATS, JSON.stringify(parsed.chats));
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
