"use client";

import React, { useState } from "react";
import {
  Users,
  KeyRound,
  Download,
  Upload,
  Check,
  UserPlus,
  X,
  Database,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { UserProfile } from "@/types/language";
import {
  deleteUserAccount,
  exportFullBackupJson,
  importFullBackupJson,
} from "@/lib/storage";

interface MultiUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  onCreateUser: (name: string) => void;
  onUpdateUser: (updated: UserProfile) => void;
  onDataImported: () => void;
}

export default function MultiUserSettingsModal({
  isOpen,
  onClose,
  activeUser,
  allUsers,
  onSwitchUser,
  onCreateUser,
  onUpdateUser,
  onDataImported,
}: MultiUserSettingsModalProps) {
  const [newUserName, setNewUserName] = useState("");
  const [geminiKey, setGeminiKey] = useState(activeUser.geminiApiKey || "");
  const [openaiKey, setOpenaiKey] = useState(activeUser.openaiApiKey || "");
  const [savedNotice, setSavedNotice] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...activeUser,
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExport = () => {
    const json = exportFullBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linguaforge-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importFullBackupJson(String(reader.result || ""));
      if (ok) {
        setImportStatus("Đã khôi phục dữ liệu thành công!");
        onDataImported();
      } else {
        setImportStatus("File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-semibold text-[#181715]">
                {activeUser.isAdmin
                  ? "Bảng Quản Trị Hệ Thống (Admin Console)"
                  : "Hồ Sơ Cá Nhân & Cấu Hình AI"}
              </h3>
              {activeUser.isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1F5E3B] text-white text-[10px] font-mono uppercase tracking-wider font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#57534E] mt-0.5">
              {activeUser.isAdmin
                ? "Tài khoản Quản trị viên có toàn quyền mở khóa mọi Ngày học, quản lý danh sách học viên và sao lưu hệ thống."
                : `Đang đăng nhập: ${activeUser.username || activeUser.name} • Tiến trình được bảo mật độc lập.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F2EFE9] text-[#57534E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Admin Console (Only visible to Administrator LeThanhDuoc) */}
        {activeUser.isAdmin && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1F5E3B] font-semibold">
                <Users className="w-4 h-4 text-[#1F5E3B]" />
                Quản lý toàn bộ tài khoản trên hệ thống ({allUsers.length})
              </div>
              <span className="text-[11px] text-[#57534E]">
                Đặc quyền: Mở khóa 10/10 Ngày học ở mọi chủ đề
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allUsers.map((u) => {
                const isCurrent = u.id === activeUser.id;
                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isCurrent
                        ? "bg-[#181715] text-white border-[#181715]"
                        : "bg-[#FAF8F5] text-[#181715] border-[#E5E0D8]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSwitchUser(u.id)}
                      className="flex-1 text-left"
                      title="Bấm để chuyển nhanh sang kiểm tra tài khoản này"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{u.name}</span>
                        {u.isAdmin && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1F5E3B] text-white text-[9px] font-mono uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] font-mono mt-0.5 ${
                          isCurrent ? "text-[#E5E0D8]" : "text-[#8A847C]"
                        }`}
                      >
                        User: {u.username || "Mặc định"} • MK:{" "}
                        {u.password || "—"} • Streak {u.streakDays} ngày
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCurrent && (
                        <Check className="w-4 h-4 text-[#1F5E3B]" />
                      )}
                      {!u.isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteUserAccount(u.id);
                            onDataImported();
                          }}
                          className="p-1.5 rounded-lg text-[#9E2A2B] hover:bg-[#9E2A2B]/15 transition-colors"
                          title="Xóa tài khoản học viên này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Tạo nhanh hồ sơ học viên thử nghiệm..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newUserName.trim()) return;
                  onCreateUser(newUserName);
                  setNewUserName("");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1F5E3B] text-white text-xs font-medium hover:bg-[#18492E]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Tạo hồ sơ mới
              </button>
            </div>
          </div>
        )}

        {/* 2. AI API Keys Configuration */}
        <form
          onSubmit={handleSaveKeys}
          className="space-y-3 pt-4 border-t border-[#E5E0D8]"
        >
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#57534E]">
            <KeyRound className="w-4 h-4 text-[#9E2A2B]" />
            Kết nối AI Nâng Cao (Tùy chọn — Gemini / OpenAI)
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed">
            Mặc định ứng dụng đã tích hợp sẵn <strong>Bộ máy Bắt lỗi Ngữ pháp & Hội thoại Nội bộ</strong> chạy ngay lập tức. Nếu bạn nhập thêm Gemini API Key hoặc OpenAI API Key, hệ thống sẽ tự động dùng LLM đám mây để phân tích sâu mọi câu bất kỳ.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#57534E] mb-1">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#57534E] mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedNotice ? (
              <span className="text-xs font-medium text-[#1F5E3B]">
                ✓ Đã lưu cấu hình AI cho hồ sơ {activeUser.name}!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#181715] text-white text-xs font-medium hover:bg-[#2E2C28]"
            >
              Lưu cấu hình AI
            </button>
          </div>
        </form>

        {/* 3. Data Backup & Cloud Migration */}
        <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#57534E]">
            <Database className="w-4 h-4 text-[#181715]" />
            Sao Lưu Dữ Liệu & Sẵn Sàng Đồng Bộ Cloud Database
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-medium text-[#181715]"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất file Backup (.json)
            </button>

            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-medium text-[#181715] cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Nhập file Backup (.json)
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {importStatus && (
              <span className="text-xs text-[#1F5E3B] font-medium">
                {importStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

