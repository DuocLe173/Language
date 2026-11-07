"use client";

import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Flame,
  Compass,
} from "lucide-react";
import { UserProfile } from "@/types/language";
import {
  authenticateUserAccount,
  registerUserAccount,
} from "@/lib/storage";
import CoverFeatureSections from "@/components/CoverFeatureSections";

interface CoverAuthGateProps {
  existingUsers: UserProfile[];
  onAuthenticated: (loggedInUser: UserProfile) => void;
}

type CoverPanelMode = "welcome" | "login" | "register";

export default function CoverAuthGate({
  existingUsers,
  onAuthenticated,
}: CoverAuthGateProps) {
  const [panelMode, setPanelMode] = useState<CoverPanelMode>("welcome");

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Success banner shown on the cover welcome screen right after creating an account
  const [justCreatedUsername, setJustCreatedUsername] = useState<string | null>(
    null
  );

  const registeredAccounts = existingUsers.filter(
    (u) => Boolean(u.username) && !u.isAdmin
  );

  const handleOpenLogin = (prefillUsername?: string) => {
    setLoginError(null);
    if (prefillUsername !== undefined) {
      setLoginUsername(prefillUsername);
    } else if (justCreatedUsername && !loginUsername) {
      setLoginUsername(justCreatedUsername);
    }
    setLoginPassword("");
    setPanelMode("login");
  };

  const handleOpenRegister = () => {
    setRegError(null);
    setRegUsername("");
    setRegPassword("");
    setRegConfirmPassword("");
    setPanelMode("register");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = authenticateUserAccount(loginUsername, loginPassword);
    if (!res.ok || !res.user) {
      setLoginError(
        res.error || "Tên đăng nhập hoặc mật khẩu chưa chính xác."
      );
      return;
    }
    onAuthenticated(res.user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regUsername.trim()) {
      setRegError("Vui lòng nhập Tên đăng nhập.");
      return;
    }
    if (!regPassword) {
      setRegError("Vui lòng nhập Mật khẩu.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu và Nhập lại mật khẩu chưa khớp nhau.");
      return;
    }

    const res = registerUserAccount(regUsername, regPassword);
    if (!res.ok || !res.user) {
      setRegError(res.error || "Không thể tạo tài khoản. Vui lòng thử lại.");
      return;
    }

    // Per task.md requirement: after creating account, save credentials and return to Cover page
    // so the user selects "Đăng nhập" and logs in with their newly created account.
    const createdName = res.user.username || regUsername.trim();
    setJustCreatedUsername(createdName);
    setLoginUsername(createdName);
    setLoginPassword("");
    setPanelMode("welcome");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181715] flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Ambient Background Shapes for Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-[#1F5E3B]/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-[#9E2A2B]/6 blur-3xl" />
      </div>

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#181715] text-[#FAF8F5] flex items-center justify-center font-bold text-xl shadow-sm">
            文
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#181715]">
                LinguaForge
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#1F5E3B]/10 text-[#1F5E3B] font-semibold">
                Polyglot Studio
              </span>
            </div>
            <p className="text-[11px] text-[#57534E]">
              Đánh thức phản xạ đa ngôn ngữ mỗi ngày
            </p>
          </div>
        </div>
      </header>

      {/* Seamless Single-Canvas Hero Section (No Boxy Card Partitions) */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 pb-16 min-h-[82vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ================= PHẦN BÊN TRÁI (7 COLS): MINH HỌA 2D & KHẨU HIỆU NẰM TRỰC TIẾP TRÊN TRANG ================= */}
          <div className="lg:col-span-7 space-y-6 group">
            {/* Seamless 2D Animated Character & Polyglot World Scene */}
            <div className="relative py-2">
              {/* Floating 2D Language Speech Bubbles */}
              <div className="relative z-10 flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5E0D8] text-xs font-semibold text-[#181715] shadow-2xs transition-transform duration-500 group-hover:-translate-y-1">
                  <span className="w-2 h-2 rounded-full bg-[#1F5E3B]" />
                  EN: Hello! <span className="font-mono text-[#8A847C]">/həˈloʊ/</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5E0D8] text-xs font-semibold text-[#9E2A2B] shadow-2xs transition-transform duration-500 delay-75 group-hover:-translate-y-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9E2A2B]" />
                  中文: 你好 <span className="font-mono text-[#8A847C]">nǐ hǎo</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5E0D8] text-xs font-semibold text-[#264653] shadow-2xs transition-transform duration-500 delay-150 group-hover:-translate-y-1">
                  JP: こんにちは • KR: 안녕 • FR: Bonjour
                </span>
              </div>

              {/* 2D Art-Directed SVG Illustration with Character, Books, Lamp & Floating Cards */}
              <div className="relative z-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 640 310"
                  className="w-full max-w-[580px] h-auto drop-shadow-xs select-none"
                  role="img"
                  aria-label="Minh họa 2D người học ngôn ngữ cùng sách và thẻ từ vựng"
                >
                  {/* Background Soft Sun / Warm Halo */}
                  <circle
                    cx="320"
                    cy="155"
                    r="118"
                    fill="#FAF8F5"
                    stroke="#E5E0D8"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="320"
                    cy="155"
                    r="88"
                    fill="#1F5E3B"
                    fillOpacity="0.06"
                  />

                  {/* Left Floating 2D Vocabulary Card (Day 1 -> Day 3 Progression) */}
                  <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-translate-x-1">
                    <rect
                      x="32"
                      y="44"
                      width="148"
                      height="86"
                      rx="16"
                      fill="#FFFFFF"
                      stroke="#E5E0D8"
                      strokeWidth="2"
                    />
                    <rect
                      x="46"
                      y="58"
                      width="54"
                      height="18"
                      rx="6"
                      fill="#1F5E3B"
                      fillOpacity="0.12"
                    />
                    <text
                      x="73"
                      y="70"
                      textAnchor="middle"
                      fill="#1F5E3B"
                      fontSize="9"
                      fontWeight="700"
                    >
                      NGÀY 1 ✓
                    </text>
                    <text
                      x="46"
                      y="94"
                      fill="#181715"
                      fontSize="15"
                      fontWeight="700"
                    >
                      Biodiversity
                    </text>
                    <text x="46" y="112" fill="#9E2A2B" fontSize="10" fontFamily="monospace">
                      /ˌbaɪ.oʊ.dɪˈvɜːr.sə.ti/
                    </text>
                  </g>

                  {/* Right Floating 2D Paper Plane & Sparkle Motif */}
                  <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:translate-x-1">
                    <path
                      d="M475 96 Q510 112 542 84"
                      stroke="#D6D1C7"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <polygon
                      points="544,82 586,66 566,102 558,90"
                      fill="#FAF8F5"
                      stroke="#181715"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="558,90 566,102 552,98"
                      fill="#1F5E3B"
                    />
                    <circle cx="488" cy="64" r="3.5" fill="#9E2A2B" fillOpacity="0.55" />
                    <circle cx="594" cy="96" r="2.5" fill="#1F5E3B" fillOpacity="0.6" />
                  </g>

                  {/* Desk Surface (2D Perspective Layer) */}
                  <rect
                    x="70"
                    y="246"
                    width="500"
                    height="14"
                    rx="7"
                    fill="#181715"
                  />
                  <rect
                    x="110"
                    y="260"
                    width="420"
                    height="8"
                    rx="4"
                    fill="#E5E0D8"
                  />

                  {/* Left Stack of 2D Books on Desk */}
                  <g className="transition-transform duration-300 group-hover:-translate-y-0.5">
                    <rect
                      x="105"
                      y="222"
                      width="92"
                      height="24"
                      rx="6"
                      fill="#9E2A2B"
                    />
                    <rect
                      x="114"
                      y="227"
                      width="74"
                      height="4"
                      rx="2"
                      fill="#FAF8F5"
                    />
                    <rect
                      x="112"
                      y="198"
                      width="84"
                      height="24"
                      rx="6"
                      fill="#1F5E3B"
                    />
                    <rect
                      x="122"
                      y="204"
                      width="64"
                      height="4"
                      rx="2"
                      fill="#FAF8F5"
                    />
                  </g>

                  {/* Warm Study Lamp on Right of Desk */}
                  <g>
                    <rect
                      x="472"
                      y="236"
                      width="46"
                      height="10"
                      rx="5"
                      fill="#57534E"
                    />
                    <path
                      d="M495 236 L512 172 L478 152"
                      stroke="#181715"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Lamp Cone & Warm Glow */}
                    <polygon
                      points="450,165 495,142 530,246 420,246"
                      fill="#F59E0B"
                      fillOpacity="0.09"
                    />
                    <path
                      d="M456 164 L492 142 L502 158 L466 176 Z"
                      fill="#D97706"
                    />
                  </g>

                  {/* Center 2D Polyglot Character (Stylized Geometric Editorial Character) */}
                  <g className="transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                    {/* Shoulders / Torso Coat */}
                    <path
                      d="M236 246 C238 192 272 176 320 176 C368 176 402 192 404 246 Z"
                      fill="#1F5E3B"
                    />
                    {/* Collar & Tie Accent */}
                    <polygon
                      points="302,176 320,206 338,176"
                      fill="#FAF8F5"
                    />
                    <polygon
                      points="315,194 325,194 328,232 320,240 312,232"
                      fill="#9E2A2B"
                    />

                    {/* Neck & Head */}
                    <rect
                      x="309"
                      y="152"
                      width="22"
                      height="28"
                      rx="10"
                      fill="#F3D2B3"
                    />
                    <circle cx="320" cy="122" r="38" fill="#F7DEC4" />

                    {/* Hair (2D Stylized Editorial Cut) */}
                    <path
                      d="M280 120 C280 86 302 74 326 76 C348 78 362 94 358 118 C348 104 334 98 312 100 C296 102 286 110 280 120 Z"
                      fill="#181715"
                    />

                    {/* Glasses (Smart Scholar Look) */}
                    <circle
                      cx="306"
                      cy="122"
                      r="10"
                      fill="none"
                      stroke="#181715"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="334"
                      cy="122"
                      r="10"
                      fill="none"
                      stroke="#181715"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="316"
                      y1="122"
                      x2="324"
                      y2="122"
                      stroke="#181715"
                      strokeWidth="2.5"
                    />
                    <circle cx="306" cy="122" r="2.8" fill="#181715" />
                    <circle cx="334" cy="122" r="2.8" fill="#181715" />

                    {/* Confident Warm Smile */}
                    <path
                      d="M311 138 Q320 145 329 138"
                      stroke="#181715"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Open Book in Front of Character */}
                    <path
                      d="M254 246 L254 206 L318 216 L318 246 Z"
                      fill="#FFFFFF"
                      stroke="#181715"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M386 246 L386 206 L322 216 L322 246 Z"
                      fill="#FAF8F5"
                      stroke="#181715"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="268"
                      y1="222"
                      x2="306"
                      y2="227"
                      stroke="#8A847C"
                      strokeWidth="2"
                    />
                    <line
                      x1="268"
                      y1="232"
                      x2="302"
                      y2="236"
                      stroke="#8A847C"
                      strokeWidth="2"
                    />
                    <line
                      x1="334"
                      y1="227"
                      x2="372"
                      y2="222"
                      stroke="#1F5E3B"
                      strokeWidth="2"
                    />
                    <line
                      x1="334"
                      y1="236"
                      x2="368"
                      y2="232"
                      stroke="#1F5E3B"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Inspiring Slogan Block Directly on Warm Ivory Canvas for Editorial Depth */}
            <div className="space-y-4 px-1">
              <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-[#181715] leading-[1.18]">
                Mỗi ngôn ngữ mới là một cuộc đời mới được mở ra
              </h1>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl">
                Đừng sợ nói sai hay bắt đầu chậm. Chỉ cần 10 từ vựng mỗi ngày, từng bước nhỏ hôm nay sẽ kết nối bạn với những nền văn hóa, tri thức và cơ hội rộng lớn khắp năm châu.
              </p>

              {/* 3 Motivational Keywords (Subtle Pill Tags on Canvas) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <div className="px-3.5 py-2 rounded-full bg-white/80 border border-[#E5E0D8] flex items-center gap-2 shadow-2xs">
                  <Flame className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                  <span className="text-xs font-semibold text-[#181715]">
                    Bền bỉ từng bước nhỏ
                  </span>
                </div>
                <div className="px-3.5 py-2 rounded-full bg-white/80 border border-[#E5E0D8] flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#1F5E3B] shrink-0" />
                  <span className="text-xs font-semibold text-[#181715]">
                    Tự tin cất tiếng nói
                  </span>
                </div>
                <div className="px-3.5 py-2 rounded-full bg-white/80 border border-[#E5E0D8] flex items-center gap-2 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                  <span className="text-xs font-semibold text-[#181715]">
                    Chạm tới chân trời mới
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PHẦN BÊN PHẢI (5 COLS): CÁC NÚT HÀNH ĐỘNG & CỬA SỔ ĐĂNG NHẬP TRỰC TIẾP TRÊN TRANG ================= */}
          <div className="lg:col-span-5">
            {/* ---------------- MODE 1: TRANG BÌA MẶC ĐỊNH (NẰM LIỀN MẠCH TRÊN CÙNG 1 TRANG, KHÔNG ĐÓNG KHUNG RỜI RẠC) ---------------- */}
            {panelMode === "welcome" && (
              <div className="space-y-6 animate-in fade-in duration-200 lg:pl-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181715]">
                    Bắt đầu hành trình đa ngôn ngữ của bạn
                  </h2>
                  <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                    Chọn đăng nhập để tiếp tục bài học hôm nay hoặc tạo tài khoản mới để khởi động hành trình của riêng bạn.
                  </p>
                </div>

                {/* Confirmation Banner when returning from "Tạo tài khoản" */}
                {justCreatedUsername && (
                  <div className="p-4 rounded-2xl bg-[#1F5E3B]/10 border border-[#1F5E3B]/35 space-y-1.5 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1F5E3B]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Đã tạo tài khoản &ldquo;{justCreatedUsername}&rdquo; thành công!
                      </span>
                    </div>
                    <p className="text-xs text-[#181715] leading-relaxed">
                      Tên đăng nhập và mật khẩu của bạn đã được lưu giữ. Bây giờ hãy bấm nút{" "}
                      <strong>&ldquo;Đăng nhập&rdquo;</strong> bên dưới để vào học nhé!
                    </p>
                  </div>
                )}

                {/* 2 Primary Action Buttons Directly on the Unified Page */}
                <div className="space-y-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenLogin()}
                    className="group w-full py-4 px-6 rounded-2xl bg-[#181715] hover:bg-[#1F5E3B] active:scale-[0.99] text-white font-bold text-base shadow-[0_12px_28px_rgba(24,23,21,0.14)] hover:shadow-[0_14px_30px_rgba(31,94,59,0.25)] transition-all duration-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center">
                        <LogIn className="w-4 h-4 text-white" />
                      </span>
                      <span>Đăng nhập</span>
                    </span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegister}
                    className="group w-full py-4 px-6 rounded-2xl bg-white/80 hover:bg-white active:scale-[0.99] text-[#181715] border-2 border-[#181715]/15 hover:border-[#181715] font-bold text-base transition-all duration-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-[#181715]/8 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-[#181715]" />
                      </span>
                      <span>Tạo tài khoản</span>
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#57534E] group-hover:text-[#181715] transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Saved Accounts Quick Hint (Subtle Inline Pills) */}
                {registeredAccounts.length > 0 && (
                  <div className="pt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#8A847C]">
                      Tài khoản gần đây:
                    </span>
                    {registeredAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleOpenLogin(acc.username)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-[#E5E0D8] text-xs font-semibold text-[#181715] transition-colors"
                        title="Bấm để điền nhanh tên đăng nhập"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#1F5E3B]" />
                        <span>{acc.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- MODE 2 & 3: CỬA SỔ NHỎ ĐĂNG NHẬP / TẠO TÀI KHOẢN KHI BẤM NÚT ---------------- */}
            {(panelMode === "login" || panelMode === "register") && (
              <div className="bg-white/90 backdrop-blur-sm border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(24,23,21,0.06)]">
                {panelMode === "login" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginError(null);
                          setPanelMode("welcome");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#181715] transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#1F5E3B]/10 text-[#1F5E3B] text-[11px] font-mono font-semibold">
                        Đăng nhập
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-[#181715]">
                        Đăng nhập tài khoản
                      </h2>
                      <p className="text-xs text-[#57534E] mt-1">
                        Nhập tên đăng nhập và mật khẩu để vào trang học chính thức.
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-3.5 rounded-2xl bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-xs font-semibold text-[#9E2A2B]">
                        ✗ {loginError}
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#181715] mb-1.5">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="Nhập tên đăng nhập của bạn..."
                          className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white text-sm font-medium text-[#181715] focus:outline-none focus:border-[#181715] transition-colors"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#181715] mb-1.5">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                            className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white text-sm font-medium text-[#181715] focus:outline-none focus:border-[#181715] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowLoginPassword(!showLoginPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A847C] hover:text-[#181715] p-1"
                            title={
                              showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                          >
                            {showLoginPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#181715] hover:bg-[#1F5E3B] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Vào trang học chính thức →</span>
                      </button>
                    </form>

                    <div className="pt-3 border-t border-[#E5E0D8] text-center">
                      <span className="text-xs text-[#57534E]">
                        Chưa có tài khoản?{" "}
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenRegister}
                        className="text-xs font-bold text-[#1F5E3B] hover:underline"
                      >
                        Tạo tài khoản mới ngay
                      </button>
                    </div>
                  </div>
                )}

                {panelMode === "register" && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setRegError(null);
                          setPanelMode("welcome");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57534E] hover:text-[#181715] transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#9E2A2B]/10 text-[#9E2A2B] text-[11px] font-mono font-semibold">
                        Tạo tài khoản mới
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-[#181715]">
                        Tạo tài khoản học tập
                      </h2>
                      <p className="text-xs text-[#57534E] mt-1">
                        Khởi tạo tài khoản riêng để lưu trữ tiến trình học từ Ngày 1.
                      </p>
                    </div>

                    {regError && (
                      <div className="p-3.5 rounded-2xl bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-xs font-semibold text-[#9E2A2B]">
                        ✗ {regError}
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#181715] mb-1.5">
                          1. Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="Ví dụ: duocle, hocvien_a..."
                          className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white text-sm font-medium text-[#181715] focus:outline-none focus:border-[#181715] transition-colors"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#181715] mb-1.5">
                          2. Mật khẩu
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Nhập mật khẩu (tối thiểu 3 ký tự)..."
                            className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white text-sm font-medium text-[#181715] focus:outline-none focus:border-[#181715] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A847C] hover:text-[#181715] p-1"
                          >
                            {showRegPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#181715] mb-1.5">
                          3. Nhập lại mật khẩu
                        </label>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Nhập lại đúng mật khẩu ở trên..."
                          className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white text-sm font-medium text-[#181715] focus:outline-none focus:border-[#181715] transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#1F5E3B] hover:bg-[#18492E] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tạo tài khoản</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Scrollable 2D-Illustrated Website Introduction Sections Below the Fold */}
      <CoverFeatureSections
        onSelectLogin={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          handleOpenLogin();
        }}
        onSelectRegister={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          handleOpenRegister();
        }}
      />

      {/* Subtle Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 border-t border-[#E5E0D8]/70 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8A847C]">
        <span>LinguaForge Polyglot Studio</span>
        <span>Nuôi dưỡng thói quen ngôn ngữ mỗi ngày</span>
      </footer>
    </div>
  );
}

