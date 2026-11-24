import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INITIAL_VOCAB_CARDS, LANGUAGES, TOPICS } from "@/lib/seed-data";
import { LanguageCode, TopicId } from "@/types/language";

interface PageProps {
  params: Promise<{ lang: string; topic: string }>;
}

export function generateStaticParams() {
  const combos: Array<{ lang: string; topic: string }> = [];
  const seen = new Set<string>();

  for (const card of INITIAL_VOCAB_CARDS) {
    const key = `${card.languageCode}::${card.topicId}`;
    if (!seen.has(key)) {
      seen.add(key);
      combos.push({ lang: card.languageCode, topic: card.topicId });
    }
  }
  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, topic } = await params;
  const langMeta = LANGUAGES[lang as LanguageCode];
  const topicMeta = TOPICS.find((t) => t.id === topic);

  if (!langMeta || !topicMeta) {
    return { title: "Không tìm thấy bộ từ vựng" };
  }

  const matchingCards = INITIAL_VOCAB_CARDS.filter(
    (c) => c.languageCode === lang && c.topicId === topic
  );

  const title = `${matchingCards.length} Từ Vựng ${langMeta.nameVi} Chủ Đề ${topicMeta.titleVi} — Có Phiên Âm & Câu Ví Dụ`;
  const description = `Học trọn bộ ${matchingCards.length} từ vựng ${langMeta.nameVi} (${langMeta.nativeName}) chủ đề ${topicMeta.titleVi} kèm phiên âm ${langMeta.phoneticLabel}, nghĩa Tiếng Việt tự nhiên và phương pháp nhớ sâu 5 bước trên LinguaForge.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "vi_VN",
    },
  };
}

export default async function ProgrammaticVocabTopicPage({
  params,
}: PageProps) {
  const { lang, topic } = await params;
  const langMeta = LANGUAGES[lang as LanguageCode];
  const topicMeta = TOPICS.find((t) => t.id === (topic as TopicId));

  if (!langMeta || !topicMeta) {
    notFound();
  }

  const cards = INITIAL_VOCAB_CARDS.filter(
    (c) => c.languageCode === lang && c.topicId === topic
  ).sort((a, b) => {
    if ((a.dayNumber || 1) !== (b.dayNumber || 1)) {
      return (a.dayNumber || 1) - (b.dayNumber || 1);
    }
    return (a.orderIndex || 99) - (b.orderIndex || 99);
  });

  if (cards.length === 0) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Từ vựng ${langMeta.nameVi} — ${topicMeta.titleVi}`,
    description: topicMeta.subtitleVi,
    provider: {
      "@type": "Organization",
      name: "LinguaForge Studio",
      url: "https://learnlanguage-beige.vercel.app",
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181715]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-[#E5E0D8] bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181715] text-[#FAF8F5] flex items-center justify-center font-bold text-lg">
              文
            </div>
            <span className="font-bold text-base tracking-tight">
              LinguaForge Studio
            </span>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-[#1F5E3B] hover:bg-[#18492E] text-white text-xs font-bold transition-colors"
          >
            Luyện nhớ sâu 5 bước miễn phí →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Hero */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5E3B]/10 text-[#1F5E3B] text-xs font-semibold">
            <span>{langMeta.nameVi} ({langMeta.nativeName})</span>
            <span>•</span>
            <span>{cards.length} từ vựng thực chiến</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#181715]">
            Từ Vựng {langMeta.nameVi}: {topicMeta.titleVi}
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed">
            {topicMeta.subtitleVi} Toàn bộ danh sách đi kèm phiên âm{" "}
            <strong>{langMeta.phoneticLabel}</strong>, nghĩa tiếng Việt tự nhiên và câu ví dụ giao tiếp thực tế.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-[#181715] hover:bg-[#1F5E3B] text-white text-sm font-bold transition-colors"
            >
              ✨ Vào học thử ngay với bộ từ này (Không cần đăng ký) →
            </Link>
          </div>
        </section>

        {/* Vocabulary Table / Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, idx) => (
            <article
              key={card.id}
              className="bg-white border border-[#E5E0D8] rounded-2xl p-5 space-y-2 shadow-[0_2px_10px_rgba(24,23,21,0.02)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold text-[#181715]">
                  {idx + 1}. {card.term}
                </h2>
                <span className="text-[11px] font-mono text-[#6B655E]">
                  Ngày {card.dayNumber || 1}
                </span>
              </div>
              <div className="text-xs font-mono text-[#9E2A2B]">
                {card.phonetic} • {card.partOfSpeech}
              </div>
              <div className="text-sm font-semibold text-[#1F5E3B]">
                {card.meaningVi}
              </div>
              <p className="text-xs text-[#181715] pt-1 border-t border-[#E5E0D8]/70">
                &ldquo;{card.exampleTarget}&rdquo;
              </p>
              <p className="text-xs text-[#57534E]">→ {card.exampleVi}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
