import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaForge — Không Gian Học Đa Ngôn Ngữ & AI Grammar Coach",
  description:
    "Hệ thống học từ mới, ôn tập ngắt quãng (SRS), trò chuyện luyện nói với AI và sửa lỗi ngữ pháp chuyên sâu cho Tiếng Anh, Tiếng Trung và các ngôn ngữ trên thế giới.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FAF8F5] text-[#181715] font-sans selection:bg-[#1F5E3B]/15 selection:text-[#1F5E3B]">
        {children}
      </body>
    </html>
  );
}
