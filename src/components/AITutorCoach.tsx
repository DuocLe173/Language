"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  RotateCcw,
  Eye,
  EyeOff,
  Wand2,
} from "lucide-react";
import {
  ChatMessage,
  LanguageCode,
  SuggestedVocabItem,
  UserProfile,
  VocabCard,
} from "@/types/language";
import { LANGUAGES, ROLEPLAY_SCENARIOS } from "@/lib/seed-data";
import {
  clearScenarioChat,
  loadUserChatMessages,
  saveChatMessage,
} from "@/lib/storage";
import {
  speakText,
  startVoiceRecognition,
  SpeechRecognitionHandle,
} from "@/lib/speech";
import { AIResponsePayload } from "@/lib/grammar-engine";

interface AITutorCoachProps {
  user: UserProfile;
  languageCode: LanguageCode;
  onSaveVocabFromChat: (card: VocabCard) => void;
}

export default function AITutorCoach({
  user,
  languageCode,
  onSaveVocabFromChat,
}: AITutorCoachProps) {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>("daily_checkin");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showPhonetics, setShowPhonetics] = useState(true);
  const [savedTerms, setSavedTerms] = useState<Record<string, boolean>>({});
  const [engineBadge, setEngineBadge] = useState<string>(
    "Natural Mentor Engine"
  );

  const recognitionRef = useRef<SpeechRecognitionHandle | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const langMeta = LANGUAGES[languageCode];
  const activeScenario =
    ROLEPLAY_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    ROLEPLAY_SCENARIOS[0];
  const greetingData =
    activeScenario.greetings[languageCode] || activeScenario.greetings.en;

  useEffect(() => {
    const stored = loadUserChatMessages(
      user.id,
      languageCode,
      selectedScenarioId
    );
    if (stored.length === 0) {
      const initialGreeting: ChatMessage = {
        id: `init_${selectedScenarioId}_${languageCode}`,
        userId: user.id,
        languageCode,
        scenarioId: selectedScenarioId,
        role: "assistant",
        content: greetingData.target,
        phonetic: greetingData.phonetic,
        translationVi: greetingData.vi,
        timestamp: new Date().toISOString(),
      };
      setMessages([initialGreeting]);
    } else {
      setMessages(stored);
    }
  }, [user.id, languageCode, selectedScenarioId, greetingData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleToggleVoice = () => {
    setVoiceError(null);
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const handle = startVoiceRecognition(
      languageCode,
      (transcript) => {
        setInputText(transcript);
      },
      (errMsg) => {
        setVoiceError(errMsg);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
    recognitionRef.current = handle;
  };

  const handleSendMessage = async (textOverride?: string) => {
    const contentToSend = (textOverride ?? inputText).trim();
    if (!contentToSend || isSending) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setInputText("");
    setIsSending(true);

    const userMsgId = `msg_user_${Date.now()}`;
    const optimisticUserMsg: ChatMessage = {
      id: userMsgId,
      userId: user.id,
      languageCode,
      scenarioId: selectedScenarioId,
      role: "user",
      content: contentToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText: contentToSend,
          languageCode,
          scenarioId: selectedScenarioId,
          scenarioTitle: activeScenario.titleVi,
          geminiApiKey: user.geminiApiKey,
          openaiApiKey: user.openaiApiKey,
        }),
      });

      const data = (await res.json()) as AIResponsePayload;

      if (data.engineUsed === "gemini") {
        setEngineBadge("Gemini 2.5 Flash AI");
      } else if (data.engineUsed === "openai") {
        setEngineBadge("OpenAI GPT-4o-mini");
      } else {
        setEngineBadge("Natural Mentor Engine");
      }

      const enrichedUserMsg: ChatMessage = {
        ...optimisticUserMsg,
        grammarAnalysis: data.grammarAnalysis,
      };
      saveChatMessage(enrichedUserMsg);

      const aiReplyMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        userId: user.id,
        languageCode,
        scenarioId: selectedScenarioId,
        role: "assistant",
        content: data.replyTarget,
        phonetic: data.replyPhonetic,
        translationVi: data.replyVi,
        timestamp: new Date().toISOString(),
      };
      saveChatMessage(aiReplyMsg);

      setMessages((prev) =>
        prev
          .map((m) => (m.id === userMsgId ? enrichedUserMsg : m))
          .concat(aiReplyMsg)
      );

      speakText(data.replyTarget, languageCode, 0.94);
    } catch {
      // ignore error
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSuggestedVocab = (vocab: SuggestedVocabItem) => {
    const newCard: VocabCard = {
      id: `chat_vocab_${Date.now()}`,
      userId: user.id,
      languageCode,
      topicId: activeScenario.topicId || "custom_saved",
      dayNumber: 1,
      orderIndex: 99,
      term: vocab.term,
      phonetic: vocab.phonetic,
      partOfSpeech: vocab.partOfSpeech,
      meaningVi: vocab.meaningVi,
      naturalContextVi: `Từ vựng thực tế được gợi ý trong tình huống "${activeScenario.titleVi}".`,
      exampleTarget: vocab.exampleTarget,
      exampleVi: vocab.exampleVi,
      notes: `Lưu trực tiếp từ phòng luyện nói AI (${activeScenario.titleVi})`,
      tags: ["AI-Chat", langMeta.shortLabel],
      level: "Thực tế",
      isCompletedInTopic: false,
      state: "new",
      intervalDays: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    onSaveVocabFromChat(newCard);
    setSavedTerms((prev) => ({ ...prev, [vocab.term]: true }));
  };

  const handleResetChat = () => {
    clearScenarioChat(user.id, languageCode, selectedScenarioId);
    const initialGreeting: ChatMessage = {
      id: `init_${selectedScenarioId}_${languageCode}_${Date.now()}`,
      userId: user.id,
      languageCode,
      scenarioId: selectedScenarioId,
      role: "assistant",
      content: greetingData.target,
      phonetic: greetingData.phonetic,
      translationVi: greetingData.vi,
      timestamp: new Date().toISOString(),
    };
    setMessages([initialGreeting]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar: Scenarios & Sample Prompts (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 shadow-[0_4px_20px_rgba(24,23,21,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#57534E]">
              Chủ Đề Hội Thoại ({langMeta.nameVi})
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#1F5E3B]/10 text-[#1F5E3B]">
              {engineBadge}
            </span>
          </div>

          <div className="space-y-2.5">
            {ROLEPLAY_SCENARIOS.map((sc) => {
              const active = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    active
                      ? "bg-[#181715] text-white border-[#181715] shadow-xs"
                      : "bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#181715] border-[#E5E0D8]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{sc.titleVi}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-[#E5E0D8] text-[#57534E]"
                      }`}
                    >
                      {sc.difficulty}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      active ? "text-[#E5E0D8]" : "text-[#57534E]"
                    }`}
                  >
                    {sc.subtitleVi}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 shadow-[0_4px_20px_rgba(24,23,21,0.03)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Wand2 className="w-4 h-4 text-[#9E2A2B]" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#57534E]">
              Gợi Ý Câu Phản Hồi Tự Nhiên
            </h4>
          </div>
          <p className="text-xs text-[#8A847C] mb-3">
            Nhấn để gửi thử và xem cách AI dịch thuật truyền cảm, sửa lỗi ngữ pháp gần gũi như người bản xứ:
          </p>
          <div className="space-y-2">
            {greetingData.prompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p.target)}
                disabled={isSending}
                className="w-full text-left p-3 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] transition-colors group"
              >
                <div className="text-xs font-medium text-[#181715] group-hover:text-[#1F5E3B]">
                  &ldquo;{p.target}&rdquo;
                </div>
                {p.phonetic && (
                  <div className="text-[11px] font-mono text-[#9E2A2B] mt-0.5">
                    {p.phonetic}
                  </div>
                )}
                <div className="text-[11px] text-[#57534E] mt-1">{p.vi}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Live Chat & Grammar Coach Inspector (8 cols) */}
      <div className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-3xl flex flex-col h-[700px] shadow-[0_12px_36px_rgba(24,23,21,0.04)] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: langMeta.accentColor }}
              />
              <h3 className="font-semibold text-[#181715] text-sm sm:text-base">
                {activeScenario.titleVi} — {langMeta.nativeName}
              </h3>
            </div>
            <p className="text-xs text-[#57534E]">
              Đồng hành cùng bạn: {activeScenario.roleAi} • Tự động lưu lịch sử trò chuyện
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPhonetics((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-white text-xs text-[#57534E] hover:text-[#181715]"
            >
              {showPhonetics ? (
                <Eye className="w-3.5 h-3.5 text-[#1F5E3B]" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              {langMeta.phoneticLabel}
            </button>
            <button
              onClick={() => setShowTranslations((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-white text-xs text-[#57534E] hover:text-[#181715]"
            >
              Dịch Việt: {showTranslations ? "Bật" : "Ẩn"}
            </button>
            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] bg-white text-xs text-[#57534E] hover:text-[#9E2A2B]"
              title="Làm mới cuộc trò chuyện"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isAi = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isAi ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-5 ${
                    isAi
                      ? "bg-[#FAF8F5] border border-[#E5E0D8] text-[#181715]"
                      : "bg-[#181715] text-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base leading-relaxed font-medium">
                      {msg.content}
                    </p>
                    <button
                      onClick={() => speakText(msg.content, languageCode, 0.94)}
                      className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                        isAi
                          ? "bg-[#F2EFE9] hover:bg-[#E5E0D8] text-[#1F5E3B]"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {showPhonetics && msg.phonetic && (
                    <p
                      className={`text-xs font-mono mt-2 ${
                        isAi ? "text-[#9E2A2B]" : "text-[#E5E0D8]"
                      }`}
                    >
                      {msg.phonetic}
                    </p>
                  )}

                  {showTranslations && msg.translationVi && (
                    <p
                      className={`text-xs mt-2 pt-2 border-t leading-relaxed ${
                        isAi
                          ? "border-[#E5E0D8] text-[#57534E]"
                          : "border-white/15 text-[#E5E0D8]"
                      }`}
                    >
                      {msg.translationVi}
                    </p>
                  )}
                </div>

                {/* Live Grammar & Naturalness Inspector Card */}
                {!isAi && msg.grammarAnalysis && (
                  <div className="mt-3 w-full max-w-[92%] sm:max-w-[85%] rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 shadow-xs text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {msg.grammarAnalysis.isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F5E3B]/10 text-[#1F5E3B] text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Diễn đạt tự nhiên ({msg.grammarAnalysis.score}/100)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9E2A2B]/10 text-[#9E2A2B] text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Gợi ý chỉnh ngữ pháp ({msg.grammarAnalysis.score}/100)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#8A847C]">
                        Hướng dẫn từ Bản xứ
                      </span>
                    </div>

                    {msg.grammarAnalysis.mistakes.length > 0 && (
                      <div className="space-y-2">
                        {msg.grammarAnalysis.mistakes.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-[#9E2A2B]/25 text-xs space-y-1"
                          >
                            <div className="flex flex-wrap items-center gap-2 font-mono">
                              <span className="line-through text-[#9E2A2B] bg-[#9E2A2B]/10 px-2 py-0.5 rounded">
                                {m.wrong}
                              </span>
                              <span className="text-[#8A847C]">→</span>
                              <span className="font-semibold text-[#1F5E3B] bg-[#1F5E3B]/10 px-2 py-0.5 rounded">
                                {m.right}
                              </span>
                            </div>
                            <p className="text-[#181715] leading-relaxed">
                              <strong>Giải thích dễ hiểu:</strong> {m.ruleVi}
                            </p>
                          </div>
                        ))}

                        <div className="p-3 rounded-xl bg-[#1F5E3B]/6 border border-[#1F5E3B]/20 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[#1F5E3B] font-semibold">
                              Câu chuẩn tự nhiên:{" "}
                            </span>
                            <span className="font-medium text-[#181715]">
                              {msg.grammarAnalysis.correctedText}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              speakText(
                                msg.grammarAnalysis!.correctedText,
                                languageCode,
                                0.92
                              )
                            }
                            className="p-1.5 rounded-lg bg-white text-[#1F5E3B] hover:bg-[#1F5E3B]/10 shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {msg.grammarAnalysis.explanationVi}
                    </p>

                    <div className="p-3 rounded-xl bg-white border border-[#E5E0D8] text-xs flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono uppercase tracking-wider text-[10px] text-[#8A847C] block mb-0.5">
                          💡 Cách người bản xứ hay nói ngoài đời:
                        </span>
                        <span className="font-medium text-[#181715]">
                          {msg.grammarAnalysis.nativeAlternative}
                        </span>
                        {msg.grammarAnalysis.nativeAlternativePhonetic && (
                          <span className="block font-mono text-[11px] text-[#9E2A2B] mt-0.5">
                            {msg.grammarAnalysis.nativeAlternativePhonetic}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          speakText(
                            msg.grammarAnalysis!.nativeAlternative,
                            languageCode,
                            0.94
                          )
                        }
                        className="p-1.5 rounded-lg bg-[#F2EFE9] text-[#181715] hover:bg-[#E5E0D8] shrink-0"
                        title="Nghe câu mẫu bản xứ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {msg.grammarAnalysis.suggestedVocab && (
                      <div className="pt-2 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="text-[#8A847C]">Cụm từ nên nhớ: </span>
                          <strong className="text-[#181715]">
                            {msg.grammarAnalysis.suggestedVocab.term}
                          </strong>{" "}
                          <span className="font-mono text-[#9E2A2B]">
                            ({msg.grammarAnalysis.suggestedVocab.phonetic})
                          </span>{" "}
                          — {msg.grammarAnalysis.suggestedVocab.meaningVi}
                        </div>
                        <button
                          onClick={() =>
                            handleSaveSuggestedVocab(
                              msg.grammarAnalysis!.suggestedVocab!
                            )
                          }
                          disabled={
                            savedTerms[msg.grammarAnalysis.suggestedVocab.term]
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            savedTerms[msg.grammarAnalysis.suggestedVocab.term]
                              ? "bg-[#1F5E3B]/15 text-[#1F5E3B]"
                              : "bg-[#1F5E3B] text-white hover:bg-[#18492E]"
                          }`}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          {savedTerms[msg.grammarAnalysis.suggestedVocab.term]
                            ? "Đã lưu vào Chủ đề"
                            : "Lưu vào Sổ từ"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-[#57534E] font-mono">
              <Sparkles className="w-4 h-4 animate-spin text-[#1F5E3B]" />
              Đang phản hồi tự nhiên bằng {langMeta.nameVi}...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Voice / Text Input Footer */}
        <div className="p-4 border-t border-[#E5E0D8] bg-[#FAF8F5]">
          {voiceError && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#9E2A2B]/10 text-[#9E2A2B] text-xs">
              {voiceError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-3.5 rounded-2xl border transition-all shrink-0 flex items-center gap-2 text-xs font-medium ${
                isRecording
                  ? "bg-[#9E2A2B] text-white border-[#9E2A2B] animate-pulse"
                  : "bg-white text-[#181715] border-[#E5E0D8] hover:bg-[#F2EFE9]"
              }`}
              title="Nhấn để nói bằng giọng của bạn (Speech-to-Text)"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Đang nghe...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#9E2A2B]" />
                  <span className="hidden sm:inline">Luyện nói</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Nhắn hoặc nói bằng ${langMeta.nameVi} như đang trò chuyện với bạn bè...`}
              className="flex-1 px-4 py-3.5 rounded-2xl border border-[#E5E0D8] bg-white text-sm text-[#181715] focus:outline-none focus:border-[#181715]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-5 py-3.5 rounded-2xl bg-[#181715] text-white text-sm font-medium hover:bg-[#2E2C28] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
