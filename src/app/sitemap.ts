import type { MetadataRoute } from "next";
import { INITIAL_VOCAB_CARDS } from "@/lib/seed-data";

const BASE_URL = "https://learnlanguage-beige.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const seen = new Set<string>();
  for (const card of INITIAL_VOCAB_CARDS) {
    const key = `${card.languageCode}/${card.topicId}`;
    if (!seen.has(key)) {
      seen.add(key);
      routes.push({
        url: `${BASE_URL}/tu-vung/${card.languageCode}/${card.topicId}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return routes;
}
