"use client";

import React from "react";
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  MessageSquareText,
  CalendarDays,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface CoverFeatureSectionsProps {
  onSelectLogin: () => void;
  onSelectRegister: () => void;
}

export default function CoverFeatureSections({
  onSelectLogin,
  onSelectRegister,
}: CoverFeatureSectionsProps) {
  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-12 pb-20 space-y-24 sm:space-y-32">
      {/* Subtle Divider */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#D6D1C7] to-[#181715]/40" />
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A847C]">
          Khám phá cách LinguaForge giúp bạn làm chủ ngôn ngữ
        </span>
      </div>

      {/* ================= SECTION 1: PHƯƠNG PHÁP 5 BƯỚC TƯƠNG TÁC SÂU ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
        {/* Left: 2D Illustration of the 5-Step Interactive Memory Loop */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <svg
            viewBox="0 0 560 350"
            className="w-full max-w-[500px] h-auto select-none"
            role="img"
            aria-label="Minh họa 2D quy trình học 5 bước tương tác"
          >
            {/* Soft Organic Backdrop */}
            <ellipse
              cx="280"
              cy="178"
              rx="230"
              ry="140"
              fill="#F2EFE9"
            />
            <circle
              cx="140"
              cy="95"
              r="42"
              fill="#1F5E3B"
              fillOpacity="0.08"
            />
            <circle
              cx="425"
              cy="260"
              r="54"
              fill="#9E2A2B"
              fillOpacity="0.07"
            />

            {/* Step Path Curve */}
            <path
              d="M104 240 C158 112, 260 112, 308 188 C348 242, 422 190, 452 105"
              stroke="#181715"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              fill="none"
            />

            {/* 2D Step Node 1: Nhìn từ (Widened to fit all text comfortably) */}
            <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-translate-x-1">
              <rect
                x="24"
                y="210"
                width="160"
                height="68"
                rx="16"
                fill="#FFFFFF"
                stroke="#181715"
                strokeWidth="2"
              />
              <circle cx="50" cy="234" r="11" fill="#181715" />
              <text
                x="50"
                y="238"
                textAnchor="middle"
                fill="#FAF8F5"
                fontSize="10"
                fontWeight="700"
              >
                1
              </text>
              <text x="68" y="238" fill="#181715" fontSize="11.5" fontWeight="700">
                Nhìn mặt chữ
              </text>
              <text x="40" y="261" fill="#57534E" fontSize="10.5" fontFamily="monospace">
                Resilient /rɪˈzɪl.../
              </text>
            </g>

            {/* 2D Step Node 2 & 3: Nghe & Hiểu ngữ cảnh (Widened) */}
            <g className="transition-transform duration-500 delay-75 ease-out group-hover:-translate-y-2">
              <rect
                x="156"
                y="62"
                width="176"
                height="76"
                rx="18"
                fill="#1F5E3B"
              />
              <circle cx="186" cy="92" r="13" fill="#FAF8F5" />
              <text
                x="186"
                y="96"
                textAnchor="middle"
                fill="#1F5E3B"
                fontSize="10.5"
                fontWeight="700"
              >
                2•3
              </text>
              <text x="206" y="96" fill="#FAF8F5" fontSize="12" fontWeight="700">
                Nghe & Ngữ cảnh
              </text>
              <text x="174" y="121" fill="#D1FAE5" fontSize="10.5">
                🔊 Phát âm chuẩn bản xứ
              </text>
            </g>

            {/* 2D Step Node 4: Gõ từ khuyết 3 vòng (Widened to contain header & input box) */}
            <g className="transition-transform duration-500 delay-100 ease-out group-hover:-translate-y-1.5">
              <rect
                x="212"
                y="188"
                width="196"
                height="82"
                rx="18"
                fill="#FFFFFF"
                stroke="#181715"
                strokeWidth="2"
              />
              <text
                x="310"
                y="214"
                textAnchor="middle"
                fill="#9E2A2B"
                fontSize="10"
                fontWeight="700"
              >
                BƯỚC 4 • GÕ KHUYẾT 3 VÒNG
              </text>
              <rect
                x="232"
                y="225"
                width="156"
                height="30"
                rx="8"
                fill="#FAF8F5"
                stroke="#E5E0D8"
              />
              <text
                x="310"
                y="244"
                textAnchor="middle"
                fill="#181715"
                fontSize="13"
                fontFamily="monospace"
                fontWeight="700"
              >
                R e _ i l _ e n t
              </text>
            </g>

            {/* 2D Step Node 5: Dịch câu hoàn chỉnh (Widened) */}
            <g className="transition-transform duration-500 delay-150 ease-out group-hover:-translate-y-2 group-hover:translate-x-1">
              <rect
                x="368"
                y="54"
                width="168"
                height="76"
                rx="18"
                fill="#181715"
              />
              <circle cx="396" cy="82" r="11" fill="#1F5E3B" />
              <path
                d="M391 82 L395 86 L402 78"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <text x="414" y="86" fill="#FAF8F5" fontSize="12" fontWeight="700">
                5. Dịch câu
              </text>
              <text x="384" y="111" fill="#A7F3D0" fontSize="10.5">
                Khắc sâu trí nhớ dài hạn
              </text>
            </g>
          </svg>
        </div>

        {/* Right: Editorial Description */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1F5E3B] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Quy trình học 5 bước chủ động</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181715] leading-tight">
            Không học vẹt. Từng từ vựng đi qua 5 tầng giác quan trước khi chuyển tiếp
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
            Thay vì lướt thẻ flashcard thụ động rồi quên ngay sau vài giờ, mỗi từ vựng trên LinguaForge dẫn dắt bạn đi trọn 5 bước: nhận diện mặt chữ, luyện nghe tốc độ chuẩn & chậm, thấu hiểu ngữ cảnh tự nhiên, gõ lắp ghép ký tự khuyết qua 3 vòng và tự tay dịch câu hoàn chỉnh.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#181715]">
            <span className="inline-flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#1F5E3B]" />
              Nghe chuẩn giọng bản xứ
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
              Gõ từ khuyết 3 cấp độ
            </span>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: LỘ TRÌNH 10 NGÀY & GIẢI NGHĨA TỪNG TỪ TRONG CÂU ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
        {/* Left on Desktop: Editorial Description */}
        <div className="lg:col-span-6 space-y-4 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold">
            <CalendarDays className="w-4 h-4" />
            <span>Lộ trình 10 ngày & Tra nghĩa tức thì</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181715] leading-tight">
            Phân loại từ gốc đến nâng cao, chạm nhẹ vào bất kỳ từ nào để xem nghĩa ngay
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
            Mỗi chủ đề được thiết kế thành lộ trình 10 ngày bài bản (100 từ/chủ đề), đi từ khái niệm gốc ở Ngày 1 đến từ vựng học thuật ở Ngày 10. Đặc biệt, khi gặp câu ví dụ dài, bạn chỉ cần rê chuột hoặc chạm nhẹ vào bất kỳ từ nào trong câu để xem ngay phiên âm và nghĩa tiếng Việt mà không bị gián đoạn mạch học.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#181715]">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#9E2A2B]" />
              8 Chủ đề thiết thực (800+ từ)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F5E3B]" />
              Kiểm tra ôn tập mở khóa ngày mới
            </span>
          </div>
        </div>

        {/* Right on Desktop: 2D Illustration of Interactive Hover Word Tooltip & 10-Day Roadmap */}
        <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
          <svg
            viewBox="0 0 520 340"
            className="w-full max-w-[480px] h-auto select-none"
            role="img"
            aria-label="Minh họa 2D tính năng di chuột tra nghĩa từng từ và lộ trình 10 ngày"
          >
            <ellipse cx="260" cy="175" rx="210" ry="135" fill="#F2EFE9" />

            {/* 10-Day Stepping Stones */}
            <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <rect
                x="56"
                y="62"
                width="88"
                height="42"
                rx="12"
                fill="#1F5E3B"
              />
              <text
                x="100"
                y="87"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
              >
                Ngày 1 ✓
              </text>

              <line
                x1="144"
                y1="83"
                x2="174"
                y2="83"
                stroke="#1F5E3B"
                strokeWidth="2.5"
              />

              <rect
                x="174"
                y="62"
                width="88"
                height="42"
                rx="12"
                fill="#1F5E3B"
              />
              <text
                x="218"
                y="87"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
              >
                Ngày 2 ✓
              </text>

              <line
                x1="262"
                y1="83"
                x2="300"
                y2="83"
                stroke="#181715"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              <rect
                x="300"
                y="62"
                width="88"
                height="42"
                rx="12"
                fill="#FFFFFF"
                stroke="#181715"
                strokeWidth="2"
              />
              <text
                x="344"
                y="87"
                textAnchor="middle"
                fill="#181715"
                fontSize="11"
                fontWeight="700"
              >
                Ngày 10
              </text>
            </g>

            {/* Sentence Card with Interactive Hover Tooltip Popover */}
            <g className="transition-transform duration-500 delay-75 ease-out group-hover:-translate-y-1.5">
              <rect
                x="56"
                y="178"
                width="408"
                height="104"
                rx="20"
                fill="#FFFFFF"
                stroke="#181715"
                strokeWidth="2"
              />
              <text x="82" y="218" fill="#181715" fontSize="15" fontWeight="600">
                Protecting
              </text>
              {/* Highlighted Hovered Word */}
              <rect
                x="164"
                y="198"
                width="102"
                height="28"
                rx="8"
                fill="#1F5E3B"
                fillOpacity="0.15"
              />
              <text x="172" y="218" fill="#1F5E3B" fontSize="15" fontWeight="700">
                biodiversity
              </text>
              <text x="274" y="218" fill="#181715" fontSize="15" fontWeight="600">
                is essential for nature.
              </text>
              <text x="82" y="250" fill="#57534E" fontSize="12">
                Bảo vệ đa dạng sinh học là điều thiết yếu cho tự nhiên.
              </text>

              {/* Floating Dark Tooltip Above "biodiversity" */}
              <rect
                x="130"
                y="112"
                width="176"
                height="56"
                rx="14"
                fill="#181715"
              />
              <polygon points="210,168 220,168 215,176" fill="#181715" />
              <text
                x="218"
                y="134"
                textAnchor="middle"
                fill="#A7F3D0"
                fontSize="10"
                fontFamily="monospace"
              >
                /ˌbaɪ.oʊ.dɪˈvɜːr.sə.ti/
              </text>
              <text
                x="218"
                y="153"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="700"
              >
                đa dạng sinh học
              </text>
            </g>
          </svg>
        </div>
      </section>

      {/* ================= SECTION 3: NGƯỜI BẠN BẢN XỨ AI & ĐA NGÔN NGỮ ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
        {/* Left: 2D Illustration of AI Native Conversation & Grammar Correction */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <svg
            viewBox="0 0 520 320"
            className="w-full max-w-[480px] h-auto select-none"
            role="img"
            aria-label="Minh họa 2D trò chuyện cùng AI bản xứ và sửa lỗi ngữ pháp"
          >
            <ellipse cx="260" cy="160" rx="210" ry="130" fill="#F2EFE9" />

            {/* User Chat Bubble */}
            <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:translate-x-1">
              <rect
                x="150"
                y="46"
                width="310"
                height="68"
                rx="18"
                fill="#181715"
              />
              <text x="174" y="74" fill="#FAF8F5" fontSize="13" fontWeight="600">
                &ldquo;I very like learning new languages!&rdquo;
              </text>
              <text x="174" y="96" fill="#A7F3D0" fontSize="10" fontFamily="monospace">
                ✓ AI phân tích ngữ pháp & gợi ý cách nói tự nhiên
              </text>
            </g>

            {/* AI Tutor Correction & Native Reply Bubble */}
            <g className="transition-transform duration-500 delay-75 ease-out group-hover:-translate-y-1.5 group-hover:-translate-x-1">
              <rect
                x="56"
                y="136"
                width="356"
                height="128"
                rx="20"
                fill="#FFFFFF"
                stroke="#181715"
                strokeWidth="2"
              />
              <circle cx="88" cy="168" r="14" fill="#1F5E3B" />
              <text
                x="88"
                y="173"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="700"
              >
                AI
              </text>
              <text x="114" y="166" fill="#1F5E3B" fontSize="11" fontWeight="700">
                CÁCH DIỄN ĐẠT BẢN XỨ TỰ NHIÊN HƠN:
              </text>
              <text x="114" y="188" fill="#181715" fontSize="14" fontWeight="700">
                &ldquo;I really enjoy learning new languages!&rdquo;
              </text>
              <text x="114" y="214" fill="#57534E" fontSize="11">
                Giải thích: Dùng &ldquo;really enjoy&rdquo; thay cho &ldquo;very like&rdquo;
              </text>
              <text x="114" y="236" fill="#9E2A2B" fontSize="11" fontWeight="600">
                + Lưu nhanh từ vựng mới vào Sổ từ cá nhân
              </text>
            </g>
          </svg>
        </div>

        {/* Right: Editorial Description */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1F5E3B] font-semibold">
            <MessageSquareText className="w-4 h-4" />
            <span>Luyện phản xạ hội thoại & 6 ngôn ngữ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181715] leading-tight">
            Trò chuyện tự nhiên, sửa lỗi ngữ pháp tức thì và mở rộng sang 6 ngôn ngữ
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
            Thực hành giao tiếp trong các tình huống đời thực từ quán cà phê, sân bay đến phỏng vấn công sở. Hệ thống tự động chỉ ra lỗi ngữ pháp nhẹ nhàng, gợi ý cách nói chuẩn bản xứ cho cả Tiếng Anh, Tiếng Trung (Giản thể & Phồn thể), Tiếng Nhật, Tiếng Hàn và Tiếng Pháp.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSelectLogin}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#181715] hover:bg-[#1F5E3B] text-white text-xs sm:text-sm font-bold transition-colors"
            >
              <span>Đăng nhập học ngay</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSelectRegister}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#181715]/25 hover:border-[#181715] text-[#181715] text-xs sm:text-sm font-bold transition-colors"
            >
              <span>Tạo tài khoản mới</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

