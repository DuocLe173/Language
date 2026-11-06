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
  LOGGED_IN_USER_ID: "linguaforge_logged_in_session_v1",
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

export const ADMIN_USER_ID = "user_admin_lethanhduoc";
export const ADMIN_USERNAME = "LeThanhDuoc";
export const ADMIN_PASSWORD = "123456789";

function buildDefaultAdminProfile(existing?: Partial<UserProfile>): UserProfile {
  return normalizeUserProfile({
    ...INITIAL_USER_PROFILE,
    ...(existing || {}),
    id: existing?.id || ADMIN_USER_ID,
    name: existing?.name || "Lê Thành Được (Admin)",
    username: ADMIN_USERNAME,
    password: existing?.password || ADMIN_PASSWORD,
    isAdmin: true,
  });
}

function ensureAdminAccountInList(users: UserProfile[]): UserProfile[] {
  const idx = users.findIndex(
    (u) =>
      u.id === ADMIN_USER_ID ||
      (u.username || "").toLowerCase() === ADMIN_USERNAME.toLowerCase()
  );
  if (idx === -1) {
    return [buildDefaultAdminProfile(), ...users];
  }
  const updated = [...users];
  updated[idx] = buildDefaultAdminProfile(updated[idx]);
  return updated;
}

export function loadAllUsers(): UserProfile[] {
  if (typeof window === "undefined") {
    return [buildDefaultAdminProfile(), INITIAL_USER_PROFILE];
  }
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) {
      const initial = ensureAdminAccountInList([
        normalizeUserProfile(INITIAL_USER_PROFILE),
      ]);
      localStorage.setItem(KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = ensureAdminAccountInList([
        normalizeUserProfile(INITIAL_USER_PROFILE),
      ]);
      localStorage.setItem(KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const normalized = ensureAdminAccountInList(
      parsed.map(normalizeUserProfile)
    );
    localStorage.setItem(KEYS.USERS, JSON.stringify(normalized));
    return normalized;
  } catch {
    return [buildDefaultAdminProfile(), INITIAL_USER_PROFILE];
  }
}

export function deleteUserAccount(targetUserId: string): UserProfile[] {
  const users = loadAllUsers();
  const target = users.find((u) => u.id === targetUserId);
  if (!target || target.isAdmin) {
    return users;
  }
  const remaining = users.filter((u) => u.id !== targetUserId);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.USERS, JSON.stringify(remaining));
  }
  return remaining;
}

export function getLoggedInSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  const sessionUserId = localStorage.getItem(KEYS.LOGGED_IN_USER_ID);
  if (!sessionUserId) return null;
  const users = loadAllUsers();
  const exists = users.some((u) => u.id === sessionUserId);
  return exists ? sessionUserId : null;
}

export function setLoggedInSessionUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(KEYS.LOGGED_IN_USER_ID, userId);
    localStorage.setItem(KEYS.ACTIVE_USER_ID, userId);
  } else {
    localStorage.removeItem(KEYS.LOGGED_IN_USER_ID);
  }
}

export function logoutCurrentUser(): void {
  setLoggedInSessionUserId(null);
}

/**
 * Registers a brand-new user account with username + password.
 * Does NOT auto-login so the user returns to the Cover page and clicks "Đăng nhập" as required.
 */
export function registerUserAccount(
  usernameInput: string,
  passwordInput: string
): { ok: boolean; error?: string; user?: UserProfile } {
  const cleanUsername = usernameInput.trim();
  if (!cleanUsername) {
    return { ok: false, error: "Vui lòng nhập Tên đăng nhập." };
  }
  if (cleanUsername.length < 2) {
    return {
      ok: false,
      error: "Tên đăng nhập cần có ít nhất 2 ký tự.",
    };
  }
  if (!passwordInput || passwordInput.length < 3) {
    return {
      ok: false,
      error: "Mật khẩu cần có ít nhất 3 ký tự.",
    };
  }

  const users = loadAllUsers();
  const duplicate = users.find(
    (u) =>
      (u.username || "").toLowerCase() === cleanUsername.toLowerCase()
  );
  if (duplicate) {
    return {
      ok: false,
      error: `Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác hoặc bấm Đăng nhập.`,
    };
  }

  const newId = `user_${Date.now()}`;
  const newUser: UserProfile = normalizeUserProfile({
    ...INITIAL_USER_PROFILE,
    id: newId,
    name: cleanUsername,
    username: cleanUsername,
    password: passwordInput,
    streakDays: 1,
    reviewedToday: 0,
    totalLearnedWords: 0,
    topicProgressMap: {},
    createdAt: new Date().toISOString(),
  });

  users.push(newUser);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  return { ok: true, user: newUser };
}

/**
 * Verifies username + password and activates that user's session.
 */
export function authenticateUserAccount(
  usernameInput: string,
  passwordInput: string
): { ok: boolean; error?: string; user?: UserProfile } {
  const cleanUsername = usernameInput.trim();
  if (!cleanUsername || !passwordInput) {
    return {
      ok: false,
      error: "Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.",
    };
  }

  const users = loadAllUsers();
  const matched = users.find(
    (u) =>
      (u.username || "").toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!matched) {
    return {
      ok: false,
      error: `Không tìm thấy tài khoản "${cleanUsername}". Bạn hãy kiểm tra lại hoặc bấm Tạo tài khoản mới nhé!`,
    };
  }

  if (matched.password !== passwordInput) {
    return {
      ok: false,
      error: "Mật khẩu chưa chính xác. Vui lòng thử lại!",
    };
  }

  setLoggedInSessionUserId(matched.id);
  return { ok: true, user: matched };
}

export function getActiveUserProfile(): UserProfile {
  const users = loadAllUsers();
  if (typeof window === "undefined") return users[0];
  const sessionId = localStorage.getItem(KEYS.LOGGED_IN_USER_ID);
  const activeId =
    sessionId || localStorage.getItem(KEYS.ACTIVE_USER_ID) || DEFAULT_USER_ID;
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
  const cleanName = name.trim() || "Học Viên Mới";
  const newUser: UserProfile = normalizeUserProfile({
    ...INITIAL_USER_PROFILE,
    id: newId,
    name: cleanName,
    username: cleanName,
    streakDays: 1,
    reviewedToday: 0,
    totalLearnedWords: 0,
    topicProgressMap: {},
    createdAt: new Date().toISOString(),
  });
  saveUserProfile(newUser);
  return newUser;
}

export function switchUserProfile(userId: string): UserProfile {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.ACTIVE_USER_ID, userId);
    localStorage.setItem(KEYS.LOGGED_IN_USER_ID, userId);
  }
  return getActiveUserProfile();
}

function makeCardIdForUser(userId: string, baseSeedId: string): string {
  return userId === DEFAULT_USER_ID ? baseSeedId : `${userId}__${baseSeedId}`;
}

function loadSavedCardsFromStorage(): VocabCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.VOCAB);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VocabCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCardsToStorage(cardsToSave: VocabCard[]): void {
  if (typeof window === "undefined") return;
  try {
    // Only persist cards that have progress or are custom user-added cards to keep localStorage fast & compact
    const seedIdSet = new Set(INITIAL_VOCAB_CARDS.map((s) => s.id));
    const compact = cardsToSave.filter((c) => {
      const baseId =
        c.userId === DEFAULT_USER_ID
          ? c.id
          : c.id.replace(`${c.userId}__`, "").replace(`${c.userId}_`, "");
      const isSeed = seedIdSet.has(baseId);
      if (!isSeed) return true; // Custom card added by user
      return (
        c.isCompletedInTopic ||
        c.state !== "new" ||
        c.repetitions > 0
      );
    });
    localStorage.setItem(KEYS.VOCAB, JSON.stringify(compact));
  } catch {
    // ignore quota errors
  }
}

function loadAllVocabCardsRaw(): VocabCard[] {
  return loadSavedCardsFromStorage();
}

export function getUserVocabCards(userId: string): VocabCard[] {
  const savedAll = loadSavedCardsFromStorage();
  const savedByUserMap = new Map<string, VocabCard>();
  for (const c of savedAll) {
    if (c.userId === userId) {
      savedByUserMap.set(c.id, c);
      // Also support legacy single-underscore prefix
      const normalizedKey = c.id.replace(`${userId}_`, `${userId}__`);
      savedByUserMap.set(normalizedKey, c);
    }
  }

  const result: VocabCard[] = [];
  const usedIds = new Set<string>();

  // 1. Build all 800+ curriculum seed cards for this specific userId, overlaying any saved progress
  for (const seedCard of INITIAL_VOCAB_CARDS) {
    const userCardId = makeCardIdForUser(userId, seedCard.id);
    const saved = savedByUserMap.get(userCardId);
    usedIds.add(userCardId);
    if (saved) {
      usedIds.add(saved.id);
      result.push({
        ...seedCard,
        id: userCardId,
        userId,
        isCompletedInTopic: Boolean(saved.isCompletedInTopic),
        state: saved.state || "new",
        intervalDays: saved.intervalDays ?? 0,
        easeFactor: saved.easeFactor ?? 2.5,
        repetitions: saved.repetitions ?? 0,
        nextReviewAt: saved.nextReviewAt || seedCard.nextReviewAt,
        lastReviewedAt: saved.lastReviewedAt,
      });
    } else {
      result.push({
        ...seedCard,
        id: userCardId,
        userId,
        isCompletedInTopic: false,
      });
    }
  }

  // 2. Append any custom cards added by this user
  for (const c of savedAll) {
    if (c.userId === userId && !usedIds.has(c.id)) {
      result.push(c);
    }
  }

  return result.sort((a, b) => {
    if ((a.dayNumber || 1) !== (b.dayNumber || 1)) {
      return (a.dayNumber || 1) - (b.dayNumber || 1);
    }
    return (a.orderIndex || 99) - (b.orderIndex || 99);
  });
}

export function upsertVocabCard(card: VocabCard): VocabCard[] {
  if (typeof window === "undefined") return INITIAL_VOCAB_CARDS;
  const all = loadSavedCardsFromStorage();
  const idx = all.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    all[idx] = card;
  } else {
    all.push(card);
  }
  saveCardsToStorage(all);
  return getUserVocabCards(card.userId);
}

export function completeFullDayForUser(
  user: UserProfile,
  languageCode: LanguageCode,
  topicId: TopicId,
  dayNumber: number
): { updatedUser: UserProfile; updatedCards: VocabCard[] } {
  const userFullDeck = getUserVocabCards(user.id).map((card) => {
    if (
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

  const otherUsersSaved = loadSavedCardsFromStorage().filter(
    (c) => c.userId !== user.id
  );
  saveCardsToStorage([...otherUsersSaved, ...userFullDeck]);

  const topicCards = userFullDeck.filter(
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
    totalLearnedWords: userFullDeck.filter((c) => c.isCompletedInTopic).length,
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
  const all = loadSavedCardsFromStorage().filter(
    (card) =>
      !(
        card.userId === user.id &&
        card.languageCode === languageCode &&
        card.topicId === topicId
      )
  );
  saveCardsToStorage(all);

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
