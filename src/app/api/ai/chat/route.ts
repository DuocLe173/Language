import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRespondLocally, AIResponsePayload } from "@/lib/grammar-engine";
import { LANGUAGES } from "@/lib/seed-data";
import { LanguageCode } from "@/types/language";

const NATURAL_MENTOR_SYSTEM_PROMPT = `Bạn là một Người Bạn Bản Xứ kiêm Chuyên Gia Hướng Dẫn Ngôn Ngữ (Native Language Mentor) vô cùng ấm áp, tinh tế và gần gũi, đang trực tiếp đồng hành cùng một người Việt học ngoại ngữ.

NGUYÊN TẮC CỐT LÕI VỀ GIỌNG VĂN, DỊCH THUẬT & PHẢN HỒI:
1. PHONG CÁCH TRÒ CHUYỆN TỰ NHIÊN:
   - Phản hồi như hai người bạn hoặc đồng nghiệp thân thiết đang trò chuyện trực tiếp ngoài đời thực.
   - Sử dụng từ vựng và cấu trúc câu có tính ứng dụng cao, thông dụng trong giao tiếp và công việc hàng ngày của người bản xứ.
   - TUYỆT ĐỐI KHÔNG dùng các từ vựng quá hàn lâm, cổ lỗ hoặc hiếm gặp không phù hợp với ngữ cảnh hội thoại.

2. NGUYÊN TẮC DỊCH THUẬT TRUYỀN CẢM (KHÔNG DỊCH WORD-BY-WORD):
   - Khi dịch sang Tiếng Việt (replyVi, exampleVi), hãy dịch theo Ý và CẢM XÚC tự nhiên của tiếng Việt đời thường (dùng từ xưng hô thân thiện như "mình - bạn", thêm các tiểu từ tình thái nhẹ nhàng như "nhé, nha, đấy, lắm").
   - TUYỆT ĐỐI TRÁNH lối dịch sát nghĩa từng từ (word-by-word) cứng nhắc, máy móc kiểu Google Translate cũ.

3. CÁCH SỬA LỖI NGỮ PHÁP & GIẢI THÍCH ĐÁP ÁN:
   - Luôn khích lệ tinh thần người học trước, sau đó chỉ ra điểm cần sửa một cách nhẹ nhàng, dễ hiểu ("Chỗ này người bản xứ thường nói là... vì...").
   - Không dùng quá nhiều thuật ngữ ngôn ngữ học phức tạp; hãy giải thích bằng mẹo thực tế để người học nhớ ngay lập tức.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userText,
      languageCode = "en",
      scenarioId = "daily_checkin",
      scenarioTitle = "Giao tiếp tự nhiên",
      geminiApiKey,
      openaiApiKey,
    } = body as {
      userText: string;
      languageCode: LanguageCode;
      scenarioId: string;
      scenarioTitle?: string;
      geminiApiKey?: string;
      openaiApiKey?: string;
    };

    if (!userText || !userText.trim()) {
      return NextResponse.json(
        { error: "Empty message" },
        { status: 400 }
      );
    }

    const activeGeminiKey =
      geminiApiKey?.trim() || process.env.GEMINI_API_KEY || "";
    const activeOpenAiKey =
      openaiApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    const langMeta = LANGUAGES[languageCode] || LANGUAGES.en;

    const fullPrompt = `${NATURAL_MENTOR_SYSTEM_PROMPT}

Ngôn ngữ mục tiêu đang học: ${langMeta.nameVi} (${langMeta.nativeName}).
Bối cảnh hội thoại hiện tại: "${scenarioTitle}".
Câu người học vừa nói: "${userText}"

Hãy thực hiện:
1. Phân tích câu của người học, kiểm tra ngữ pháp và mức độ tự nhiên trong giao tiếp thực tế của người bản xứ.
2. Đưa ra câu trả lời tiếp nối cuộc trò chuyện bằng ${langMeta.nameVi} thật tự nhiên, kèm phiên âm (${langMeta.phoneticLabel}) và bản dịch Tiếng Việt mượt mà, truyền cảm.
3. Gợi ý 1 từ vựng hoặc cụm từ thiết thực, dễ áp dụng nhất liên quan đến ngữ cảnh vừa nói.
4. Trả về ĐÚNG định dạng JSON sau (không bọc markdown ngoài JSON):
{
  "replyTarget": "Câu trả lời tiếp theo bằng ngôn ngữ đích, tự nhiên như người bản xứ",
  "replyPhonetic": "Phiên âm Pinyin/IPA/Romaji chuẩn xác",
  "replyVi": "Bản dịch tiếng Việt tự nhiên, gần gũi, truyền cảm (không dịch word-by-word)",
  "grammarAnalysis": {
    "isCorrect": true hoặc false,
    "score": số điểm từ 0 đến 100,
    "correctedText": "Câu của người học sau khi đã chỉnh chuẩn xác",
    "correctedPhonetic": "Phiên âm của câu đã chỉnh",
    "explanationVi": "Lời nhận xét và giải thích ấm áp, dễ hiểu như người hướng dẫn trực tiếp",
    "nativeAlternative": "Cách diễn đạt tự nhiên, đời thường nhất mà người bản xứ hay dùng trong tình huống này",
    "nativeAlternativePhonetic": "Phiên âm của câu bản xứ",
    "mistakes": [
      {
        "wrong": "cụm từ chưa chuẩn",
        "right": "cụm từ chuẩn tự nhiên",
        "ruleVi": "giải thích ngắn gọn, gần gũi bằng tiếng Việt vì sao nên đổi"
      }
    ],
    "suggestedVocab": {
      "term": "1 từ hoặc cụm từ thiết thực, thông dụng",
      "phonetic": "phiên âm",
      "meaningVi": "nghĩa tiếng Việt tự nhiên, dễ hiểu",
      "partOfSpeech": "từ loại",
      "exampleTarget": "câu ví dụ thực tế",
      "exampleVi": "dịch câu ví dụ sang tiếng Việt mượt mà"
    }
  }
}`;

    // 1. Try Gemini API if key is available
    if (activeGeminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            activeGeminiKey
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.45,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const parsed = JSON.parse(rawText) as AIResponsePayload;
          return NextResponse.json({
            ...parsed,
            engineUsed: "gemini",
          });
        }
      } catch {
        // Fallback if Gemini call fails
      }
    }

    // 2. Try OpenAI API if key is available
    if (activeOpenAiKey) {
      try {
        const openAiRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${activeOpenAiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: fullPrompt }],
              temperature: 0.45,
            }),
          }
        );

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const rawText = data?.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(rawText) as AIResponsePayload;
          return NextResponse.json({
            ...parsed,
            engineUsed: "openai",
          });
        }
      } catch {
        // Fallback if OpenAI call fails
      }
    }

    // 3. Built-in Local Smart Grammar & Conversation Engine
    const localResult = analyzeAndRespondLocally(
      userText,
      languageCode,
      scenarioId
    );
    return NextResponse.json(localResult);
  } catch {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
