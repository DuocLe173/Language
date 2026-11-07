"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  BookOpen,
  MessageSquareText,
  Layers,
  Settings,
  Plus,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Users,
  LogOut,
} from "lucide-react";
import {
  INITIAL_USER_PROFILE,
  INITIAL_VOCAB_CARDS,
  LANGUAGES,
  TOPICS,
} from "@/lib/seed-data";
import {
  LanguageCode,
  TopicId,
  UserProfile,
  VocabCard,
} from "@/types/language";
import {
  completeFullDayForUser,
  createNewUserProfile,
  deleteVocabCard,
  getActiveUserProfile,
  getLoggedInSessionUserId,
  getOrInitTopicProgress,
  getUserVocabCards,
  loadAllUsers,
  logoutCurrentUser,
  makeTopicKey,
  resetTopicProgressForUser,
  saveUserProfile,
  switchUserProfile,
  upsertVocabCard,
} from "@/lib/storage";
import LanguageDropdown from "@/components/LanguageDropdown";
import SRSStudyStudio from "@/components/SRSStudyStudio";
import AITutorCoach from "@/components/AITutorCoach";
import VocabularyVault from "@/components/VocabularyVault";
import MultiUserSettingsModal from "@/components/MultiUserSettingsModal";
import CoverAuthGate from "@/components/CoverAuthGate";

type ActiveTab = "study" | "ai-coach" | "vault";

export default function PolyglotHomePage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([
    INITIAL_USER_PROFILE,
  ]);
  const [cards, setCards] = useState<VocabCard[]>(INITIAL_VOCAB_CARDS);
  const [activeTab, setActiveTab] = useState<ActiveTab>("study");
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const users = loadAllUsers();
    setAllUsers(users);
    const sessionUserId = getLoggedInSessionUserId();
    if (sessionUserId) {
      const matched = users.find((u) => u.id === sessionUserId);
      if (matched) {
        setUser(matched);
        setCards(getUserVocabCards(matched.id));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } else {
      const currentProfile = getActiveUserProfile();
      setUser(currentProfile);
      setCards(getUserVocabCards(currentProfile.id));
      setIsAuthenticated(false);
    }
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeLang = user.activeTargetLang;
  const langMeta = LANGUAGES[activeLang];
  const activeTopicId: TopicId =
    user.activeTopicByLang?.[activeLang] || "daily_communication";
  const activeTopicMeta =
    TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  // Progress per language for the compact LanguageDropdown
  const progressByLang = useMemo(() => {
    const map = {} as Record<
      LanguageCode,
      { learned: number; total: number; completedTopics: number }
    >;

    (Object.keys(LANGUAGES) as LanguageCode[]).forEach((code) => {
      const list = cards.filter((c) => c.languageCode === code);
      const learned = list.filter((c) => c.isCompletedInTopic).length;
      let completedTopics = 0;
      for (const t of TOPICS) {
        const tCards = list.filter((c) => c.topicId === t.id);
        if (tCards.length > 0 && tCards.every((c) => c.isCompletedInTopic)) {
          completedTopics += 1;
        }
      }
      map[code] = {
        learned,
        total: list.length,
        completedTopics,
      };
    });
    return map;
  }, [cards]);

  // Stats for active language
  const langStats = useMemo(() => {
    const list = cards.filter((c) => c.languageCode === activeLang);
    const learnedCount = list.filter((c) => c.isCompletedInTopic).length;
    const remainingCount = list.length - learnedCount;

    let completedTopicsCount = 0;
    let totalActiveTopicsCount = 0;
    for (const t of TOPICS) {
      const tCards = list.filter((c) => c.topicId === t.id);
      if (tCards.length > 0) {
        totalActiveTopicsCount += 1;
        if (tCards.every((c) => c.isCompletedInTopic)) {
          completedTopicsCount += 1;
        }
      }
    }

    return {
      total: list.length,
      learnedCount,
      remainingCount,
      completedTopicsCount,
      totalActiveTopicsCount,
    };
  }, [cards, activeLang]);

  const activeTopicCards = useMemo(
    () =>
      cards
        .filter(
          (c) => c.languageCode === activeLang && c.topicId === activeTopicId
        )
        .sort((a, b) => {
          if ((a.dayNumber || 1) !== (b.dayNumber || 1)) {
            return (a.dayNumber || 1) - (b.dayNumber || 1);
          }
          return (a.orderIndex || 99) - (b.orderIndex || 99);
        }),
    [cards, activeLang, activeTopicId]
  );

  const currentTopicProgress = useMemo(
    () =>
      getOrInitTopicProgress(
        user,
        activeLang,
        activeTopicId,
        activeTopicCards
      ),
    [user, activeLang, activeTopicId, activeTopicCards]
  );

  const handleSelectLanguage = (code: LanguageCode) => {
    const updated: UserProfile = {
      ...user,
      activeTargetLang: code,
    };
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
  };

  const handleSelectTopic = (topicId: TopicId) => {
    const updated: UserProfile = {
      ...user,
      activeTopicByLang: {
        ...user.activeTopicByLang,
        [activeLang]: topicId,
      },
    };
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
  };

  const handleSelectDay = (dayNumber: number) => {
    const key = makeTopicKey(activeLang, activeTopicId);
    const updated: UserProfile = {
      ...user,
      topicProgressMap: {
        ...user.topicProgressMap,
        [key]: {
          ...currentTopicProgress,
          activeDay: dayNumber,
          currentCardIndex: 0,
          lastStudiedAt: new Date().toISOString(),
        },
      },
    };
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
  };

  const handlePassGateTestForDay = (dayNumber: number) => {
    const key = makeTopicKey(activeLang, activeTopicId);
    const nextPassed = Array.from(
      new Set([...currentTopicProgress.gateTestPassedDays, dayNumber])
    );
    const updated: UserProfile = {
      ...user,
      topicProgressMap: {
        ...user.topicProgressMap,
        [key]: {
          ...currentTopicProgress,
          gateTestPassedDays: nextPassed,
          activeDay: dayNumber,
          currentCardIndex: 0,
          lastStudiedAt: new Date().toISOString(),
        },
      },
    };
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
    showToast(
      `🎉 Chúc mừng! Bạn đã vượt qua bài kiểm tra ôn tập và mở khóa Ngày ${dayNumber}!`
    );
  };

  const handleCompleteFullDay = (dayNumber: number) => {
    const { updatedUser, updatedCards } = completeFullDayForUser(
      user,
      activeLang,
      activeTopicId,
      dayNumber
    );
    setUser(updatedUser);
    setAllUsers(loadAllUsers());
    setCards(updatedCards);
    showToast(
      `✓ Đã hoàn thành Ngày ${dayNumber} (100%) và mở khóa Ngày ${Math.min(
        10,
        dayNumber + 1
      )}!`
    );
  };

  const handlePersistCardIndex = (topicId: TopicId, newIndex: number) => {
    const key = makeTopicKey(activeLang, topicId);
    const prevProg = getOrInitTopicProgress(
      user,
      activeLang,
      topicId,
      activeTopicCards
    );
    const updated: UserProfile = {
      ...user,
      topicProgressMap: {
        ...user.topicProgressMap,
        [key]: {
          ...prevProg,
          currentCardIndex: newIndex,
          lastStudiedAt: new Date().toISOString(),
        },
      },
    };
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
  };

  const handleCompleteCardInTopic = (
    updatedCard: VocabCard,
    nextDayCardIndex: number,
    newUnlockedDay: number,
    isTopicNowCompleted: boolean
  ) => {
    const nextCards = upsertVocabCard(updatedCard);
    setCards(nextCards);

    const key = makeTopicKey(activeLang, updatedCard.topicId);
    const topicCardsAfter = nextCards.filter(
      (c) =>
        c.languageCode === activeLang && c.topicId === updatedCard.topicId
    );
    const completedIds = topicCardsAfter
      .filter((c) => c.isCompletedInTopic)
      .map((c) => c.id);

    const totalLearnedAllLangs = nextCards.filter(
      (c) => c.isCompletedInTopic
    ).length;

    const updatedUser: UserProfile = {
      ...user,
      reviewedToday: user.reviewedToday + 1,
      totalLearnedWords: totalLearnedAllLangs,
      lastStudyDate: new Date().toISOString().slice(0, 10),
      topicProgressMap: {
        ...user.topicProgressMap,
        [key]: {
          ...currentTopicProgress,
          topicId: updatedCard.topicId,
          languageCode: activeLang,
          unlockedDay: newUnlockedDay,
          completedCardIds: completedIds,
          currentCardIndex: nextDayCardIndex,
          isCompleted: isTopicNowCompleted,
          completedAt: isTopicNowCompleted
            ? new Date().toISOString()
            : undefined,
          lastStudiedAt: new Date().toISOString(),
        },
      },
    };

    setUser(updatedUser);
    setAllUsers(saveUserProfile(updatedUser));

    if (newUnlockedDay > currentTopicProgress.unlockedDay) {
      showToast(
        `🔓 Tuyệt vời! Bạn đã hoàn thành Ngày ${currentTopicProgress.activeDay} và mở khóa Ngày ${newUnlockedDay}!`
      );
    } else {
      showToast(`✓ Đã hoàn thành 5 bước cho từ "${updatedCard.term}"!`);
    }
  };

  const handleResetTopicProgress = (topicId: TopicId) => {
    const { updatedUser, updatedCards } = resetTopicProgressForUser(
      user,
      activeLang,
      topicId
    );
    setUser(updatedUser);
    setAllUsers(loadAllUsers());
    setCards(updatedCards);
    showToast("Đã đặt lại lộ trình chủ đề này về Ngày 1.");
  };

  const handleAddOrUpdateVocab = (card: VocabCard) => {
    const nextCards = upsertVocabCard(card);
    setCards(nextCards);
    showToast(`Đã lưu "${card.term}" vào chủ đề học tập (${langMeta.nameVi})!`);
  };

  const handleDeleteVocab = (cardId: string) => {
    const nextCards = deleteVocabCard(cardId, user.id);
    setCards(nextCards);
    showToast("Đã xóa thẻ từ vựng.");
  };

  const handleSwitchUser = (userId: string) => {
    const nextUser = switchUserProfile(userId);
    setUser(nextUser);
    setAllUsers(loadAllUsers());
    setCards(getUserVocabCards(nextUser.id));
    showToast(`Đã chuyển sang hồ sơ học tập: ${nextUser.name}`);
  };

  const handleCreateUser = (name: string) => {
    const created = createNewUserProfile(name);
    setUser(created);
    setAllUsers(loadAllUsers());
    setCards(getUserVocabCards(created.id));
    showToast(`Đã tạo hồ sơ người học mới: ${created.name}`);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    setAllUsers(saveUserProfile(updated));
  };

  const handleLogout = () => {
    logoutCurrentUser();
    setAllUsers(loadAllUsers());
    setIsAuthenticated(false);
    showToast("Đã đăng xuất khỏi tài khoản. Hẹn gặp lại bạn!");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-sm font-mono text-[#57534E]">
          Đang khôi phục tiến trình học tập của bạn...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <CoverAuthGate
        existingUsers={allUsers}
        onAuthenticated={(loggedInUser) => {
          setUser(loggedInUser);
          setAllUsers(loadAllUsers());
          setCards(getUserVocabCards(loggedInUser.id));
          setIsAuthenticated(true);
          showToast(`Chào mừng ${loggedInUser.name} đã vào trang học chính thức!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181715] text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-medium flex items-center gap-2 border border-white/10">
          <Sparkles className="w-4 h-4 text-[#1F5E3B]" />
          {toastMessage}
        </div>
      )}

      {/* Unified Sticky Top Header: Brand + Center Navigation Tabs + Right User Cluster */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#181715] text-[#FAF8F5] flex items-center justify-center font-bold text-lg shadow-2xs">
              文
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#181715]">
                  LinguaForge
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#F2EFE9] text-[#57534E]">
                  Studio
                </span>
              </div>
            </div>
          </div>

          {/* Center (Desktop): Primary 3-Module Segmented Navigation */}
          <nav
            aria-label="Chế độ học tập"
            className="hidden lg:inline-flex rounded-2xl bg-[#F2EFE9] p-1 border border-[#E5E0D8]/80 gap-1"
          >
            <button
              type="button"
              onClick={() => setActiveTab("study")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "study"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1F5E3B]" />
              <span>Học Từ Vựng (5 Bước)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai-coach")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "ai-coach"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Luyện Nói & Sửa Ngữ Pháp AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "vault"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#57534E]" />
              <span>Kho Từ ({langStats.total})</span>
            </button>
          </nav>

          {/* Right Controls: Language Dropdown + Streak + Unified Account & Logout Pill */}
          <div className="flex items-center gap-2">
            <LanguageDropdown
              activeLang={activeLang}
              progressByLang={progressByLang}
              onSelectLanguage={handleSelectLanguage}
            />

            <div
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#B45309]/10 text-[#B45309] text-xs font-semibold"
              title="Chuỗi ngày học liên tiếp"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{user.streakDays} ngày</span>
            </div>

            {/* Unified User Profile + Logout Capsule */}
            <div className="inline-flex items-center rounded-xl bg-white border border-[#E5E0D8] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F2EFE9] text-xs font-medium text-[#181715] transition-colors"
                title="Hồ sơ cá nhân & Cài đặt AI"
              >
                <Users className="w-3.5 h-3.5 text-[#1F5E3B]" />
                <span className="max-w-[115px] truncate hidden sm:inline">
                  {user.name}
                </span>
                {user.isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-[#1F5E3B] text-white text-[9px] font-mono uppercase tracking-wider font-bold">
                    Admin
                  </span>
                )}
                <Settings className="w-3 h-3 text-[#8A847C]" />
              </button>

              <div className="w-px h-4 bg-[#E5E0D8] mx-0.5" />

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#9E2A2B]/10 text-xs font-semibold text-[#57534E] hover:text-[#9E2A2B] transition-colors"
                title="Đăng xuất về Trang bìa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Thoát</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Strip (Only visible below lg) */}
        <div className="lg:hidden px-4 pb-2.5 flex items-center justify-center">
          <div className="inline-flex w-full sm:w-auto rounded-2xl bg-[#F2EFE9] p-1 border border-[#E5E0D8] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("study")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "study"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1F5E3B]" />
              <span>Học 5 Bước</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai-coach")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "ai-coach"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E]"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Luyện Nói AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "vault"
                  ? "bg-white text-[#181715] shadow-2xs"
                  : "text-[#57534E]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#57534E]" />
              <span>Kho Từ ({langStats.total})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (Streamlined Layering so Study Card is Immediately Centered) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Compact Status & Progress Ribbon (Only shown on AI Coach & Vault tabs; merged into Unified Studio Bar on Study tab) */}
        {activeTab !== "study" && (
          <section className="bg-white/80 border border-[#E5E0D8] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-[0_2px_10px_rgba(24,23,21,0.02)]">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#181715]">
                <span>{langMeta.nameVi}</span>
                <span className="text-xs font-normal text-[#57534E]">
                  ({langMeta.nativeName})
                </span>
              </span>
              <span className="text-[#D6D1C7]">•</span>
              <span className="text-xs font-semibold text-[#1F5E3B]">
                {activeTopicMeta.titleVi}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-[#57534E]">
              <div className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#1F5E3B]" />
                <span>
                  Mở khóa:{" "}
                  <strong className="text-[#181715]">
                    Ngày {user.isAdmin ? 10 : currentTopicProgress.unlockedDay}/10
                  </strong>
                </span>
              </div>

              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E3B]" />
                <span>
                  Đã thuộc:{" "}
                  <strong className="text-[#181715] font-mono">
                    {langStats.learnedCount}/{langStats.total}
                  </strong>{" "}
                  từ
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Active Module Content */}
        {activeTab === "study" && (
          <SRSStudyStudio
            languageCode={activeLang}
            activeTopicId={activeTopicId}
            topicProgress={currentTopicProgress}
            cards={cards}
            learnedCount={langStats.learnedCount}
            totalCount={langStats.total}
            isAdmin={Boolean(user.isAdmin)}
            showPhonetics={user.showPhonetics}
            chineseScript={user.chineseScript}
            onSelectTopic={handleSelectTopic}
            onSelectDay={handleSelectDay}
            onPassGateTestForDay={handlePassGateTestForDay}
            onCompleteFullDay={handleCompleteFullDay}
            onPersistCardIndex={handlePersistCardIndex}
            onTogglePhonetics={() =>
              handleUpdateUser({ ...user, showPhonetics: !user.showPhonetics })
            }
            onToggleChineseScript={() =>
              handleUpdateUser({
                ...user,
                chineseScript:
                  user.chineseScript === "simplified"
                    ? "traditional"
                    : "simplified",
              })
            }
            onCompleteCardInTopic={handleCompleteCardInTopic}
            onResetTopicProgress={handleResetTopicProgress}
            onOpenQuickAdd={() => {
              setActiveTab("vault");
              setShowQuickAddModal(true);
            }}
          />
        )}

        {activeTab === "ai-coach" && (
          <AITutorCoach
            user={user}
            languageCode={activeLang}
            currentDayCards={activeTopicCards.filter(
              (c) => (c.dayNumber || 1) === (currentTopicProgress.activeDay || 1)
            )}
            activeDay={currentTopicProgress.activeDay || 1}
            activeTopicTitle={activeTopicMeta.titleVi}
            onSaveVocabFromChat={handleAddOrUpdateVocab}
          />
        )}

        {activeTab === "vault" && (
          <VocabularyVault
            userId={user.id}
            languageCode={activeLang}
            activeTopicId={activeTopicId}
            cards={cards}
            showQuickAddModal={showQuickAddModal}
            onCloseQuickAddModal={() => setShowQuickAddModal(false)}
            onOpenQuickAddModal={() => setShowQuickAddModal(true)}
            onAddOrUpdateCard={handleAddOrUpdateVocab}
            onDeleteCard={handleDeleteVocab}
          />
        )}
      </main>

      {/* Multi-User & AI Settings Modal */}
      <MultiUserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        activeUser={user}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDataImported={() => {
          const refreshed = getActiveUserProfile();
          setUser(refreshed);
          setAllUsers(loadAllUsers());
          setCards(getUserVocabCards(refreshed.id));
        }}
      />
    </div>
  );
}
