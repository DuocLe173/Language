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
  getOrInitTopicProgress,
  getUserVocabCards,
  loadAllUsers,
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

type ActiveTab = "study" | "ai-coach" | "vault";

export default function PolyglotHomePage() {
  const [mounted, setMounted] = useState(false);
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
    const currentProfile = getActiveUserProfile();
    setUser(currentProfile);
    setAllUsers(loadAllUsers());
    setCards(getUserVocabCards(currentProfile.id));
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-sm font-mono text-[#57534E]">
          Đang khôi phục tiến trình học tập của bạn...
        </div>
      </div>
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

      {/* Clean Top Header with Compact Language Dropdown */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#181715] text-[#FAF8F5] flex items-center justify-center font-bold text-lg">
              文
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#181715]">
                  LinguaForge
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#F2EFE9] text-[#57534E]">
                  Polyglot Studio
                </span>
              </div>
              <p className="text-[11px] text-[#8A847C] hidden md:block">
                Lộ Trình 10 Ngày • Học 5 Bước Tương Tác • Bài Tập Đa Dạng
              </p>
            </div>
          </div>

          {/* Right Controls: Compact Language Dropdown + Streak + User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageDropdown
              activeLang={activeLang}
              progressByLang={progressByLang}
              onSelectLanguage={handleSelectLanguage}
            />

            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#B45309]/10 text-[#B45309] text-xs font-semibold"
              title="Chuỗi ngày học liên tiếp"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>{user.streakDays} ngày</span>
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] hover:bg-[#F2EFE9] text-xs font-medium text-[#181715] transition-colors"
              title="Chuyển người dùng (Multi-user) & Cài đặt AI"
            >
              <Users className="w-3.5 h-3.5 text-[#1F5E3B]" />
              <span className="max-w-[110px] truncate hidden sm:inline">
                {user.name}
              </span>
              <Settings className="w-3.5 h-3.5 text-[#8A847C]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bento Overview Strip */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Active Language & Current Topic Summary (5 cols) */}
          <div className="md:col-span-5 bg-white border border-[#E5E0D8] rounded-3xl p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(24,23,21,0.025)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#8A847C]">
                  Ngôn ngữ & Lộ trình đang học
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181715] mt-1">
                  {langMeta.nameVi}{" "}
                  <span className="text-base font-normal text-[#57534E]">
                    ({langMeta.nativeName})
                  </span>
                </h1>
                <p className="text-xs text-[#1F5E3B] font-semibold mt-1">
                  Chủ đề: {activeTopicMeta.titleVi} • Ngày{" "}
                  {currentTopicProgress.activeDay}/10
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("vault");
                  setShowQuickAddModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F2EFE9] hover:bg-[#E5E0D8] text-xs font-medium text-[#181715] transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm từ
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#57534E]">
              <span>Phiên âm: {langMeta.phoneticLabel}</span>
              <span className="font-mono">
                Đã thuộc:{" "}
                <strong className="text-[#181715]">
                  {langStats.learnedCount}/{langStats.total}
                </strong>{" "}
                từ
              </span>
            </div>
          </div>

          {/* 3 Metric Cards (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3 sm:gap-4">
            <div
              onClick={() => setActiveTab("study")}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-[#1F5E3B]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[#1F5E3B]">
                <span className="text-xs font-mono uppercase">
                  Mở khóa lộ trình
                </span>
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-bold text-[#181715]">
                  Ngày {currentTopicProgress.unlockedDay}/10
                </div>
                <div className="text-[11px] text-[#57534E] mt-0.5 truncate">
                  Đang học Ngày {currentTopicProgress.activeDay}
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("ai-coach")}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-[#9E2A2B]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[#9E2A2B]">
                <span className="text-xs font-mono uppercase">
                  Người bạn bản xứ AI
                </span>
                <MessageSquareText className="w-4 h-4" />
              </div>
              <div className="mt-2">
                <div className="text-lg sm:text-xl font-bold text-[#181715]">
                  Luyện Nói Tự Nhiên
                </div>
                <div className="text-[11px] text-[#57534E] mt-0.5">
                  Dịch truyền cảm & sửa ngữ pháp
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("vault")}
              className="bg-white border border-[#E5E0D8] rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-[#181715]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[#57534E]">
                <span className="text-xs font-mono uppercase">
                  Tổng kho từ
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-bold text-[#181715]">
                  {langStats.total}
                </div>
                <div className="text-[11px] text-[#57534E] mt-0.5">
                  Đã hoàn thành: {langStats.learnedCount} từ
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Module Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D8] pb-3">
          <div className="inline-flex rounded-2xl bg-[#F2EFE9] p-1.5 gap-1">
            <button
              onClick={() => setActiveTab("study")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "study"
                  ? "bg-white text-[#181715] shadow-xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#1F5E3B]" />
              <span>1. Học Từ Vựng Theo Ngày (5 Bước)</span>
            </button>

            <button
              onClick={() => setActiveTab("ai-coach")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "ai-coach"
                  ? "bg-white text-[#181715] shadow-xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-[#9E2A2B]" />
              <span>2. Trò Chuyện Luyện Nói & Sửa Ngữ Pháp AI</span>
            </button>

            <button
              onClick={() => setActiveTab("vault")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "vault"
                  ? "bg-white text-[#181715] shadow-xs"
                  : "text-[#57534E] hover:text-[#181715]"
              }`}
            >
              <Layers className="w-4 h-4 text-[#57534E]" />
              <span>3. Kho Từ Vựng ({langStats.total})</span>
            </button>
          </div>
        </div>

        {/* Active Module Content */}
        {activeTab === "study" && (
          <SRSStudyStudio
            languageCode={activeLang}
            activeTopicId={activeTopicId}
            topicProgress={currentTopicProgress}
            cards={cards}
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
