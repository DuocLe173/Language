import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-vi",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-vi",
  display: "swap",
});

const SITE_URL = "https://learnlanguage-beige.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LinguaForge — Studio Học Đa Ngôn Ngữ 5 Bước & AI Grammar Coach",
    template: "%s | LinguaForge Studio",
  },
  description:
    "Nền tảng luyện nhớ sâu 5 bước (Active Recall), ôn tập ngắt quãng SRS, hội thoại thực chiến cùng AI bản xứ và sửa ngữ pháp chuyên sâu cho Tiếng Anh, Trung, Nhật, Hàn, Pháp.",
  keywords: [
    "học tiếng anh",
    "học tiếng trung",
    "học từ vựng SRS",
    "luyện nói với AI",
    "sửa ngữ pháp AI",
    "LinguaForge",
    "active recall",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "LinguaForge Studio",
    title: "LinguaForge — Studio Học Đa Ngôn Ngữ 5 Bước & AI Grammar Coach",
    description:
      "Luyện nhớ sâu 5 bước, ôn tập SRS khoa học và trò chuyện thực chiến với AI bản xứ cho 6 ngôn ngữ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinguaForge — Studio Học Đa Ngôn Ngữ 5 Bước & AI Grammar Coach",
    description:
      "Luyện nhớ sâu 5 bước, ôn tập SRS khoa học và trò chuyện thực chiến với AI bản xứ.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#FAF8F5] text-[#181715] font-sans selection:bg-[#1F5E3B]/15 selection:text-[#1F5E3B]">
        {children}
      </body>
    </html>
  );
}
