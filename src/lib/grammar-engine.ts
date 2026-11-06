import { GrammarAnalysis, LanguageCode } from "@/types/language";

export interface AIResponsePayload {
  replyTarget: string;
  replyPhonetic?: string;
  replyVi: string;
  grammarAnalysis: GrammarAnalysis;
  engineUsed: "gemini" | "openai" | "local-smart";
}

interface RuleCheck {
  pattern: RegExp;
  replace: (match: string) => { wrong: string; right: string; ruleVi: string };
}

const ENGLISH_GRAMMAR_RULES: RuleCheck[] = [
  {
    pattern: /\bdrinked\b/i,
    replace: () => ({
      wrong: "drinked",
      right: "drank",
      ruleVi: "Từ 'drink' khi kể về chuyện đã qua mình chuyển thành 'drank' bạn nhé (bất quy tắc: drink → drank → drunk), không thêm '-ed' đâu nè.",
    }),
  },
  {
    pattern: /\bgoed\b/i,
    replace: () => ({
      wrong: "goed",
      right: "went",
      ruleVi: "Khi nói 'đã đi' trong quá khứ, người bản xứ dùng 'went' thay vì 'goed' nhé.",
    }),
  },
  {
    pattern: /\bbuyed\b/i,
    replace: () => ({
      wrong: "buyed",
      right: "bought",
      ruleVi: "Quá khứ của 'buy' (mua) là 'bought' (/bɔːt/) bạn nhé.",
    }),
  },
  {
    pattern: /\bdiscuss about\b/i,
    replace: () => ({
      wrong: "discuss about",
      right: "discuss / talk about",
      ruleVi: "Trong tiếng Anh tự nhiên, 'discuss' đã mang sẵn nghĩa 'thảo luận về...' rồi nên mình ghép thẳng với chủ đề luôn, hoặc dùng 'talk about' sẽ rất tự nhiên.",
    }),
  },
  {
    pattern: /\binformations\b/i,
    replace: () => ({
      wrong: "informations",
      right: "information",
      ruleVi: "'Information' luôn ở dạng không đếm được nên dù nhiều thông tin đến mấy mình cũng giữ nguyên là 'information' (không có 's') nhé.",
    }),
  },
  {
    pattern: /\badvices\b/i,
    replace: () => ({
      wrong: "advices",
      right: "advice / some tips",
      ruleVi: "'Advice' không thêm 's' được. Trong giao tiếp hàng ngày, bạn dùng 'some advice' hoặc 'a few tips' nghe sẽ gần gũi hơn nhiều!",
    }),
  },
  {
    pattern: /\b(he|she|it) don't\b/i,
    replace: (m) => {
      const subj = m.split(" ")[0];
      return {
        wrong: m,
        right: `${subj} doesn't`,
        ruleVi: `Đi với '${subj}', mình nhớ dùng 'doesn't' thay cho 'don't' nhé!`,
      };
    },
  },
  {
    pattern: /\bi am agree\b/i,
    replace: () => ({
      wrong: "I am agree",
      right: "I agree / I totally agree",
      ruleVi: "Người Việt mình hay dịch từng chữ 'tôi là đồng ý', nhưng trong tiếng Anh 'agree' là động từ rồi nên chỉ cần nói gọn là 'I agree' hoặc 'I totally agree!' thôi nhé.",
    }),
  },
  {
    pattern: /\bvery like\b/i,
    replace: () => ({
      wrong: "very like",
      right: "really like",
      ruleVi: "Thay vì ghép 'very like' theo thói quen tiếng Việt ('rất thích'), người bản xứ luôn nói 'I really like...' — nghe êm tai và chuẩn xác ngay!",
    }),
  },
];

const CHINESE_GRAMMAR_RULES: RuleCheck[] = [
  {
    pattern: /很(咖啡|水|书|钱|人|朋友|东西|时间)/,
    replace: (m) => {
      const noun = m.slice(1);
      return {
        wrong: m,
        right: `很多${noun}`,
        ruleVi: `Từ '很' (rất) chỉ đi cùng tính từ thôi. Khi muốn nói 'nhiều ${noun}', mình thêm chữ '多' vào thành '很多${noun}' là chuẩn giọng bản xứ ngay nhé!`,
      };
    },
  },
  {
    pattern: /不(去了|吃了|喝了|看了|买了|做了)/,
    replace: (m) => {
      const verb = m.slice(1, -1);
      return {
        wrong: m,
        right: `没${verb}`,
        ruleVi: "Để nói 'đã không làm gì đó' trong quá khứ, người Trung Quốc dùng '没 + Động từ' và bỏ chữ '了' ở cuối câu đi bạn nhé.",
      };
    },
  },
  {
    pattern: /我(去|吃|喝|看|买|学)(.*)昨天/,
    replace: (m) => ({
      wrong: m,
      right: "我昨天...",
      ruleVi: "Trong tiếng Trung, từ chỉ thời gian như '昨天' (hôm qua) luôn được ưu tiên đặt ngay sau chủ ngữ hoặc đầu câu ('我昨天...'), không để ở cuối câu như tiếng Việt mình đâu nhé.",
    }),
  },
];

export function analyzeAndRespondLocally(
  userText: string,
  languageCode: LanguageCode,
  scenarioId: string
): AIResponsePayload {
  const trimmed = userText.trim();
  const mistakes: GrammarAnalysis["mistakes"] = [];
  let corrected = trimmed;

  if (languageCode === "en") {
    for (const rule of ENGLISH_GRAMMAR_RULES) {
      const match = corrected.match(rule.pattern);
      if (match) {
        const info = rule.replace(match[0]);
        mistakes.push(info);
        corrected = corrected.replace(rule.pattern, info.right.split(" / ")[0]);
      }
    }
    if (corrected.length > 0 && /^[a-z]/.test(corrected)) {
      corrected = corrected[0].toUpperCase() + corrected.slice(1);
    }
  } else if (languageCode === "zh-CN" || languageCode === "zh-TW") {
    for (const rule of CHINESE_GRAMMAR_RULES) {
      const match = corrected.match(rule.pattern);
      if (match) {
        const info = rule.replace(match[0]);
        mistakes.push(info);
        if (info.right !== "我昨天...") {
          corrected = corrected.replace(rule.pattern, info.right);
        }
      }
    }
  }

  const isCorrect = mistakes.length === 0;
  const score = isCorrect ? 96 : Math.max(72, 95 - mistakes.length * 12);

  if (languageCode === "en") {
    const explanationVi = isCorrect
      ? "Câu bạn vừa diễn đạt nghe rất tự nhiên và tròn ý! Mình gợi ý thêm một cách nói đời thường ở dưới để bạn đổi gió khi trò chuyện với người bản xứ nhé."
      : `Ý bạn truyền đạt rất rõ rồi! Chỉ cần chỉnh nhẹ ${mistakes.length} chỗ nhỏ bên dưới là câu nói sẽ mượt và chuẩn y như người bản xứ luôn.`;

    const nativeAlternative = isCorrect
      ? `${corrected.replace(/\.$/, "")} — honestly, taking it step by step makes it so much more enjoyable.`
      : corrected;

    let replyTarget =
      "I love that! Honestly, taking small steps every day is the best way to make a new language feel like second nature. What part of learning do you enjoy the most so far?";
    let replyVi =
      "Mình rất thích cách nghĩ đó của bạn! Thật sự cứ đi từng bước nhỏ mỗi ngày là cách tốt nhất để ngoại ngữ thấm dần một cách tự nhiên. Cho tới giờ bạn thích nhất phần nào khi học?";

    if (scenarioId === "tech_standup") {
      replyTarget =
        "That sounds like a really practical plan! Organizing lessons by real-life topics definitely helps learners stay motivated. What's our next step for testing?";
      replyVi =
        "Kế hoạch nghe thiết thực lắm! Việc chia bài học theo các chủ đề đời thực chắc chắn sẽ giúp người học hứng thú hơn nhiều. Bước kiểm thử tiếp theo của nhóm mình là gì nhỉ?";
    } else if (scenarioId === "cafe_travel") {
      replyTarget =
        "You got it! I'll whip that up fresh for you right away. Are you exploring the neighborhood today, or just taking a quiet break?";
      replyVi =
        "Có ngay cho bạn đây! Mình sẽ pha mới liền cho bạn nhé. Hôm nay bạn đang đi dạo khám phá khu phố này hay chỉ ghé nghỉ ngơi thư giãn thôi?";
    }

    return {
      replyTarget,
      replyPhonetic: "/aɪ lʌv ðæt! ˈɑːnɪstli, ˈteɪkɪŋ smɔːl stɛps ˈɛvri deɪ.../",
      replyVi,
      engineUsed: "local-smart",
      grammarAnalysis: {
        isCorrect,
        score,
        correctedText: corrected,
        explanationVi,
        nativeAlternative,
        mistakes,
        suggestedVocab: {
          term: "second nature",
          phonetic: "/ˌsek.ənd ˈneɪ.tʃər/",
          meaningVi: "Trở thành phản xạ tự nhiên (như bản năng, không cần nghĩ ngợi)",
          partOfSpeech: "noun phrase",
          exampleTarget: "With daily practice, speaking English will soon become second nature to you.",
          exampleVi: "Khi luyện tập hàng ngày, việc nói tiếng Anh sẽ sớm trở thành phản xạ tự nhiên của bạn.",
        },
      },
    };
  }

  if (languageCode === "zh-CN") {
    const explanationVi = isCorrect
      ? "Câu tiếng Trung của bạn nghe rất êm tai và đúng ngữ pháp đời sống! Mình gợi ý thêm một cách diễn đạt thân mật bên dưới để bạn tham khảo nhé."
      : `Bạn diễn đạt ý rất tốt! Chỉ cần chỉnh nhẹ ${mistakes.length} điểm nhỏ về cách dùng từ bên dưới là câu nói sẽ chuẩn giọng bản xứ ngay.`;

    return {
      replyTarget:
        "太棒了！其实学语言就像交朋友一样，每天聊几句，慢慢就会越来越有语感。你最近最感兴趣的话题是什么呀？",
      replyPhonetic:
        "Tài bàng le! Qíshí xué yǔyán jiù xiàng jiāo péngyou yīyàng, měitiān liáo jǐ jù, mànmàn jiù huì yuè lái yuè yǒu yǔgǎn. Nǐ zuìjìn zuì gǎn xìngqù de huàtí shì shénme ya?",
      replyVi:
        "Tuyệt lắm bạn ơi! Thật ra học ngoại ngữ cũng giống như kết bạn vậy, mỗi ngày trò chuyện vài câu là cảm giác ngôn ngữ sẽ lên rất nhanh. Dạo này bạn đang hứng thú với chủ đề nào nhất?",
      engineUsed: "local-smart",
      grammarAnalysis: {
        isCorrect,
        score,
        correctedText: corrected,
        correctedPhonetic: isCorrect
          ? undefined
          : "Wǒ zuótiān qù kāfēidiàn hē le hěn duō kāfēi.",
        explanationVi,
        nativeAlternative: isCorrect
          ? `${corrected.replace(/[。！]$/, "")}，慢慢来，每天进步一点点就很开心了。`
          : corrected,
        nativeAlternativePhonetic:
          "mànmàn lái, měitiān jìnbù yīdiǎndiǎn jiù hěn kāixīn le.",
        mistakes,
        suggestedVocab: {
          term: "语感",
          phonetic: "yǔ gǎn",
          meaningVi: "Cảm giác ngôn ngữ (độ nhạy tự nhiên khi nghe và nói)",
          partOfSpeech: "名词 (Danh từ)",
          exampleTarget: "多跟母语者聊天能很快培养你的中文语感。",
          exampleVi: "Trò chuyện nhiều với người bản xứ sẽ giúp bạn nuôi dưỡng cảm giác tiếng Trung rất nhanh.",
        },
      },
    };
  }

  if (languageCode === "zh-TW") {
    return {
      replyTarget:
        "說得真好！每天維持一點點練習的習慣，不知不覺就會進步很多喔。你平時最常聽什麼樣的中文內容呢？",
      replyPhonetic:
        "Shuō de zhēn hǎo! Měitiān wéichí yīdiǎndiǎn liànxí de xíguàn, bùzhī bùjué jiù huì jìnbù hěn duō ō.",
      replyVi:
        "Bạn nói hay lắm! Mỗi ngày duy trì thói quen luyện một chút, chẳng mấy chốc sẽ tiến bộ vượt bậc đấy. Bình thường bạn hay nghe nội dung tiếng Trung về chủ đề gì nhất?",
      engineUsed: "local-smart",
      grammarAnalysis: {
        isCorrect,
        score,
        correctedText: corrected,
        explanationVi: isCorrect
          ? "Câu tiếng Trung Phồn thể của bạn rất tự nhiên và gần gũi!"
          : "Mình chỉnh nhẹ một chút ở dưới để câu nói mượt mà hơn nhé.",
        nativeAlternative: `${corrected}（我們一步一步來，輕鬆學最有效！）`,
        mistakes,
        suggestedVocab: {
          term: "不知不覺",
          phonetic: "bù zhī bù jué",
          meaningVi: "Lúc nào chẳng hay, tự nhiên thấm dần",
          partOfSpeech: "成語",
          exampleTarget: "每天練習十幾分鐘，不知不覺就能流利對話了。",
          exampleVi: "Mỗi ngày luyện mười mấy phút, lúc nào chẳng hay đã có thể trò chuyện trôi chảy rồi.",
        },
      },
    };
  }

  return {
    replyTarget:
      languageCode === "ja"
        ? "とても自然な表現ですね！その調子で楽しく会話を続けましょう。最近何か楽しかったことはありますか？"
        : languageCode === "ko"
        ? "정말 자연스럽게 잘 말씀하셨어요! 그렇게 편안하게 매일 조금씩 이야기해 봐요. 오늘 가장 기분 좋았던 일은 무엇인가요?"
        : "C'est super naturel ! Continue comme ça, c'est en pratiquant avec plaisir qu'on progresse le mieux.",
    replyPhonetic:
      languageCode === "ja"
        ? "Totemo shizen na hyougen desu ne! Sono choushi de tanoshiku kaiwa o tsuzukemashou."
        : languageCode === "ko"
        ? "Jeongmal jayeonseureopge jal malsseumhasyeosseoyo! Geureoke pyeonanhage maeil jogeumssik iyagihae bwayo."
        : "/sɛ sy.pɛʁ na.ty.ʁɛl! kɔ̃.ti.ny kɔm sa./",
    replyVi:
      "Bạn diễn đạt tự nhiên lắm! Cứ giữ tâm thế thoải mái như vậy để trò chuyện mỗi ngày nhé. Hôm nay có chuyện gì vui chia sẻ cùng mình không?",
    engineUsed: "local-smart",
    grammarAnalysis: {
      isCorrect: true,
      score: 96,
      correctedText: corrected,
      explanationVi: "Câu nói của bạn rất tự nhiên, gần gũi và đúng ngữ cảnh giao tiếp hàng ngày.",
      nativeAlternative: corrected,
      mistakes: [],
    },
  };
}
