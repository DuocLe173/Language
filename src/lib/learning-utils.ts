import { LanguageCode, VocabCard } from "@/types/language";

/**
 * Generates progressive cloze masks for Step 4 (3 rounds of increasing difficulty).
 * Example for "Hello":
 * - Round 1: "He_lo"
 * - Round 2: "He__o"
 * - Round 3: "_el__"
 */
export function generateMaskedWord(term: string, round: 1 | 2 | 3): string {
  const clean = term.trim();
  const chars = Array.from(clean);
  const len = chars.length;

  if (len <= 1) return "_";

  if (len === 5 && /^[a-zA-Z]+$/.test(clean)) {
    if (round === 1) return `${chars[0]}${chars[1]}_${chars[3]}${chars[4]}`;
    if (round === 2) return `${chars[0]}${chars[1]}__${chars[4]}`;
    return `_${chars[1]}${chars[2]}__`;
  }

  if (len === 2) {
    if (round === 1) return `${chars[0]}_`;
    if (round === 2) return `_${chars[1]}`;
    return "__";
  }

  if (len === 3) {
    if (round === 1) return `${chars[0]}_${chars[2]}`;
    if (round === 2) return `${chars[0]}__`;
    return `_${chars[1]}_`;
  }

  if (len === 4) {
    if (round === 1) return `${chars[0]}_${chars[2]}${chars[3]}`;
    if (round === 2) return `${chars[0]}__${chars[3]}`;
    return `_${chars[1]}__`;
  }

  return chars
    .map((ch, idx) => {
      if (ch === " " || ch === "-" || ch === "'") return ch;
      if (round === 1) {
        return idx % 3 === 2 ? "_" : ch;
      }
      if (round === 2) {
        return idx % 2 === 1 ? "_" : ch;
      }
      return idx % 3 === 1 ? ch : "_";
    })
    .join("");
}

export function verifyStep4WordInput(
  userInput: string,
  targetTerm: string,
  traditionalTerm?: string
): boolean {
  const cleanInput = userInput.trim().replace(/\s+/g, " ").toLowerCase();
  const cleanTarget = targetTerm.trim().replace(/\s+/g, " ").toLowerCase();
  const cleanTrad = traditionalTerm
    ?.trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return (
    cleanInput === cleanTarget ||
    (cleanTrad ? cleanInput === cleanTrad : false)
  );
}

function normalizeVietnameseText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,!?;:"'“”‘’()[\]—–-]/g, " ")
    .replace(/\b(nhé|nha|ạ|ơi|nè|đấy|nhỉ|thôi)\b/g, " ")
    .replace(/\b(mình|tớ|em|anh|chị)\b/g, "tôi")
    .replace(/\b(cậu)\b/g, "bạn")
    .replace(/\s+/g, " ")
    .trim();
}

export function verifyStep5SentenceTranslation(
  userInputVi: string,
  expectedVi: string,
  acceptedVariants?: string[]
): { isCorrect: boolean; similarity: number } {
  const normUser = normalizeVietnameseText(userInputVi);
  if (!normUser) return { isCorrect: false, similarity: 0 };

  const candidates = [expectedVi, ...(acceptedVariants || [])];
  for (const cand of candidates) {
    const normCand = normalizeVietnameseText(cand);
    if (normUser === normCand) {
      return { isCorrect: true, similarity: 1 };
    }
    if (normUser.includes(normCand) || normCand.includes(normUser)) {
      if (normUser.length >= Math.floor(normCand.length * 0.6)) {
        return { isCorrect: true, similarity: 0.9 };
      }
    }
  }

  const targetWords = normalizeVietnameseText(expectedVi)
    .split(" ")
    .filter((w) => w.length > 1);
  const userWords = new Set(normUser.split(" "));

  if (targetWords.length === 0) return { isCorrect: true, similarity: 1 };

  let matched = 0;
  for (const tw of targetWords) {
    if (userWords.has(tw)) matched += 1;
  }

  const ratio = matched / targetWords.length;
  return {
    isCorrect: ratio >= 0.65,
    similarity: ratio,
  };
}

export function tokenizeSentenceIntoTiles(
  sentence: string,
  languageCode: LanguageCode
): string[] {
  const cleaned = sentence.trim();
  if (
    languageCode === "zh-CN" ||
    languageCode === "zh-TW" ||
    languageCode === "ja"
  ) {
    const chars = Array.from(cleaned.replace(/[。！？，、.,!?]/g, ""));
    const chunks: string[] = [];
    for (let i = 0; i < chars.length; i += 2) {
      chunks.push(chars.slice(i, i + 2).join(""));
    }
    return chunks;
  }

  return cleaned.split(/\s+/).filter(Boolean);
}

/**
 * True Fisher-Yates random shuffle using Math.random().
 * Guarantees the shuffled order is genuinely random and not identical to the input order.
 */
export function shuffleArrayRandom<T>(items: T[]): T[] {
  const arr = [...items];
  if (arr.length <= 1) return arr;

  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    const isSameAsOriginal = arr.every((v, idx) => v === items[idx]);
    const isExactReverse = arr.every(
      (v, idx) => v === items[items.length - 1 - idx]
    );
    if (!isSameAsOriginal && (arr.length <= 2 || !isExactReverse)) {
      break;
    }
  }
  return arr;
}

/**
 * Dedicated bank of BRAND-NEW sentences for Exercise 2 (Sentence Building)
 * and Exercise 3 (Cloze Dictation) so they NEVER simply repeat Step 5's sentence!
 */
const NEW_PRACTICE_SENTENCE_BANK: Record<
  string,
  {
    sentenceTarget: string;
    sentenceVi: string;
    clozeTarget: string;
    clozeVi: string;
  }
> = {
  // English Day 1 (10 words)
  hello: {
    sentenceTarget: "Hello my dear friend!",
    sentenceVi: "Xin chào người bạn thân mến của mình!",
    clozeTarget: "Please say Hello to your family for me.",
    clozeVi: "Cho mình gửi lời xin chào tới gia đình bạn nhé.",
  },
  thank: {
    sentenceTarget: "We want to thank you today.",
    sentenceVi: "Hôm nay chúng mình muốn cảm ơn bạn.",
    clozeTarget: "I always Thank my teacher after class.",
    clozeVi: "Mình luôn cảm ơn giáo viên sau buổi học.",
  },
  sorry: {
    sentenceTarget: "She felt sorry about the mistake.",
    sentenceVi: "Cô ấy cảm thấy có lỗi về sự nhầm lẫn đó.",
    clozeTarget: "Don't be Sorry, it was just an accident.",
    clozeVi: "Đừng thấy có lỗi nhé, đó chỉ là sự cố ngoài ý muốn thôi.",
  },
  please: {
    sentenceTarget: "Please open the window for me.",
    sentenceVi: "Làm ơn mở giúp mình cửa sổ nhé.",
    clozeTarget: "Could you Please speak a little slower?",
    clozeVi: "Bạn vui lòng nói chậm lại một chút được không?",
  },
  friend: {
    sentenceTarget: "He is a very kind friend.",
    sentenceVi: "Anh ấy là một người bạn rất tốt bụng.",
    clozeTarget: "I met an old Friend at the coffee shop.",
    clozeVi: "Mình đã gặp một người bạn cũ ở quán cà phê.",
  },
  morning: {
    sentenceTarget: "I drink coffee every morning.",
    sentenceVi: "Mình uống cà phê vào mỗi buổi sáng.",
    clozeTarget: "The park is very quiet in the Morning.",
    clozeVi: "Công viên rất yên tĩnh vào buổi sáng.",
  },
  smile: {
    sentenceTarget: "Your warm smile makes me happy.",
    sentenceVi: "Nụ cười ấm áp của bạn làm mình rất vui.",
    clozeTarget: "He greeted everyone with a big Smile.",
    clozeVi: "Anh ấy chào mọi người bằng một nụ cười thật tươi.",
  },
  happy: {
    sentenceTarget: "We are happy to work together.",
    sentenceVi: "Chúng mình rất vui khi được làm việc cùng nhau.",
    clozeTarget: "The children look very Happy in the garden.",
    clozeVi: "Lũ trẻ trông thật vui vẻ ở trong vườn.",
  },
  water: {
    sentenceTarget: "Please drink enough water every day.",
    sentenceVi: "Hãy nhớ uống đủ nước mỗi ngày nhé.",
    clozeTarget: "She poured a glass of cold Water.",
    clozeVi: "Cô ấy rót một ly nước mát.",
  },
  today: {
    sentenceTarget: "We have a great lesson today.",
    sentenceVi: "Hôm nay chúng mình có một bài học rất hay.",
    clozeTarget: "What would you like to do Today?",
    clozeVi: "Hôm nay bạn muốn làm gì nào?",
  },
  // English Day 2 (10 words)
  welcome: {
    sentenceTarget: "You are always welcome in our house.",
    sentenceVi: "Bạn luôn được chào đón tại nhà của tụi mình.",
    clozeTarget: "They gave us a warm Welcome at the gate.",
    clozeVi: "Họ đã dành cho chúng mình sự đón tiếp nồng hậu ở cổng.",
  },
  family: {
    sentenceTarget: "My family lives in a peaceful city.",
    sentenceVi: "Gia đình mình sống ở một thành phố yên bình.",
    clozeTarget: "We are having a big Family dinner tonight.",
    clozeVi: "Tối nay nhà mình có một bữa tối gia đình ấm cúng.",
  },
  dinner: {
    sentenceTarget: "Let us cook a delicious dinner tonight.",
    sentenceVi: "Tối nay tụi mình cùng nấu một bữa tối thật ngon nhé.",
    clozeTarget: "Would you like to join us for Dinner?",
    clozeVi: "Bạn có muốn cùng ăn bữa tối với tụi mình không?",
  },
  ready: {
    sentenceTarget: "Everything is ready for the trip now.",
    sentenceVi: "Mọi thứ đã sẵn sàng cho chuyến đi rồi.",
    clozeTarget: "Please let me know when you are Ready.",
    clozeVi: "Hãy báo cho mình biết khi bạn đã sẵn sàng nhé.",
  },
  listen: {
    sentenceTarget: "Please listen carefully to the speaker.",
    sentenceVi: "Hãy lắng nghe kỹ người nói nhé.",
    clozeTarget: "Good friends always Listen to each other.",
    clozeVi: "Những người bạn tốt luôn lắng nghe nhau.",
  },
  share: {
    sentenceTarget: "We can share this table together.",
    sentenceVi: "Tụi mình có thể dùng chung chiếc bàn này.",
    clozeTarget: "He loves to Share good books with friends.",
    clozeVi: "Anh ấy rất thích chia sẻ sách hay với bạn bè.",
  },
  busy: {
    sentenceTarget: "She had a very busy week at work.",
    sentenceVi: "Cô ấy đã có một tuần làm việc rất bận rộn.",
    clozeTarget: "The restaurant is always Busy on Sunday nights.",
    clozeVi: "Nhà hàng luôn đông đúc bận rộn vào tối Chủ Nhật.",
  },
  early: {
    sentenceTarget: "We arrived at the station very early.",
    sentenceVi: "Chúng mình đã tới nhà ga từ rất sớm.",
    clozeTarget: "Going to bed Early is good for your health.",
    clozeVi: "Đi ngủ sớm rất tốt cho sức khỏe của bạn.",
  },
  agree: {
    sentenceTarget: "Do you agree with this new plan?",
    sentenceVi: "Bạn có đồng ý với kế hoạch mới này không?",
    clozeTarget: "We all Agree that daily practice is key.",
    clozeVi: "Chúng mình đều đồng ý rằng luyện tập mỗi ngày là chìa khóa.",
  },
  relax: {
    sentenceTarget: "Sit down and relax for a few minutes.",
    sentenceVi: "Hãy ngồi xuống và thư giãn vài phút nhé.",
    clozeTarget: "A cup of warm tea helps me Relax.",
    clozeVi: "Một tách trà ấm giúp mình thư giãn.",
  },
  // Chinese Day 1
  "你好": {
    sentenceTarget: "老师你好，请问现在可以进去吗？",
    sentenceVi: "Em chào thầy/cô ạ, cho em hỏi bây giờ vào được chưa ạ?",
    clozeTarget: "见到新同事的时候，我们先说一声你好。",
    clozeVi: "Khi gặp đồng nghiệp mới, trước tiên chúng mình chào một tiếng xin chào.",
  },
  "谢谢": {
    sentenceTarget: "谢谢你今天陪我一起练习中文。",
    sentenceVi: "Cảm ơn bạn hôm nay đã cùng mình luyện tiếng Trung nhé.",
    clozeTarget: "收到礼物之后，他开心地说了声谢谢。",
    clozeVi: "Sau khi nhận quà, anh ấy vui vẻ nói lời cảm ơn.",
  },
  "对不起": {
    sentenceTarget: "对不起，我刚才没听清楚你说的话。",
    sentenceVi: "Xin lỗi nhé, vừa nãy mình nghe chưa rõ lời bạn nói.",
    clozeTarget: "如果做错了事，我们要勇敢说对不起。",
    clozeVi: "Nếu làm sai, chúng ta hãy dũng cảm nói lời xin lỗi.",
  },
  "朋友": {
    sentenceTarget: "周末我喜欢跟朋友一起去喝咖啡。",
    sentenceVi: "Cuối tuần mình thích đi uống cà phê cùng bạn bè.",
    clozeTarget: "真正的朋友会在困难的时候帮助你。",
    clozeVi: "Người bạn thực sự sẽ giúp đỡ bạn lúc khó khăn.",
  },
  "高兴": {
    sentenceTarget: "听到这个好消息，大家都非常高兴。",
    sentenceVi: "Nghe được tin vui này, mọi người đều vô cùng phấn khởi.",
    clozeTarget: "能参加你的生日聚会，我感到很高兴。",
    clozeVi: "Được tham gia tiệc sinh nhật của bạn, mình thấy rất vui.",
  },
  "喝水": {
    sentenceTarget: "运动完之后要记得多喝水。",
    sentenceVi: "Sau khi vận động xong nhớ uống nhiều nước nhé.",
    clozeTarget: "每天早上起床后，我都会先喝水。",
    clozeVi: "Mỗi sáng sau khi thức dậy, mình đều uống nước trước tiên.",
  },
  "明天": {
    sentenceTarget: "明天早上八点我们在学校门口见面吧。",
    sentenceVi: "Tám giờ sáng ngày mai tụi mình gặp nhau ở cổng trường nhé.",
    clozeTarget: "今天的任务已经完成了，明天继续加油！",
    clozeVi: "Nhiệm vụ hôm nay đã xong rồi, ngày mai tiếp tục cố gắng nhé!",
  },
  "喜欢": {
    sentenceTarget: "你平时最喜欢看什么类型的电影？",
    sentenceVi: "Bình thường bạn thích xem thể loại phim nào nhất?",
    clozeTarget: "她非常喜欢每天安静地读书。",
    clozeVi: "Cô ấy rất thích đọc sách yên tĩnh mỗi ngày.",
  },
  "休息": {
    sentenceTarget: "连续工作了三个小时，我们休息一下吧。",
    sentenceVi: "Làm việc liên tục ba tiếng rồi, tụi mình nghỉ ngơi một chút nhé.",
    clozeTarget: "周末的时候，我喜欢在家好好休息。",
    clozeVi: "Dịp cuối tuần, mình thích ở nhà nghỉ ngơi thật tốt.",
  },
  "再见": {
    sentenceTarget: "时间不早了，我先回家了，再见！",
    sentenceVi: "Cũng muộn rồi, mình về nhà trước đây, tạm biệt nhé!",
    clozeTarget: "大家挥手向老师说再见。",
    clozeVi: "Mọi người vẫy tay nói lời tạm biệt với thầy cô.",
  },
};

/**
 * Returns fresh sentences for Exercise 2 (Sentence Building) and Exercise 3 (Cloze Dictation)
 * that are distinct from the basic sentence used in Step 5!
 */
export function getDistinctPracticeSentences(card: VocabCard): {
  sentenceBuildTarget: string;
  sentenceBuildVi: string;
  clozeSentenceWithBlank: string;
  clozeFullTarget: string;
  clozeVi: string;
} {
  const key = card.term.trim().toLowerCase();
  const preset = NEW_PRACTICE_SENTENCE_BANK[key] || NEW_PRACTICE_SENTENCE_BANK[card.term.trim()];

  let sentenceBuildTarget = preset?.sentenceTarget || "";
  let sentenceBuildVi = preset?.sentenceVi || "";
  let clozeFullTarget = preset?.clozeTarget || "";
  let clozeVi = preset?.clozeVi || "";

  // If word is not in the preset bank, synthesize distinct contextual sentences so it never duplicates Step 5
  if (!sentenceBuildTarget) {
    if (card.languageCode === "en") {
      sentenceBuildTarget = `We always remember to use ${card.term} in daily life.`;
      sentenceBuildVi = `Chúng mình luôn nhớ vận dụng từ "${card.meaningVi}" trong cuộc sống hàng ngày.`;
      clozeFullTarget = `In this situation, ${card.term} is the best expression.`;
      clozeVi = `Trong tình huống này, "${card.meaningVi}" là cách diễn đạt phù hợp nhất.`;
    } else if (card.languageCode === "zh-CN" || card.languageCode === "zh-TW") {
      sentenceBuildTarget = `我们在日常交流中经常会用到${card.term}。`;
      sentenceBuildVi = `Chúng mình thường xuyên dùng từ "${card.meaningVi}" trong giao tiếp hàng ngày.`;
      clozeFullTarget = `这句话里的${card.term}用得非常自然。`;
      clozeVi = `Từ "${card.meaningVi}" trong câu này được dùng rất tự nhiên.`;
    } else {
      sentenceBuildTarget = card.exampleTarget;
      sentenceBuildVi = card.exampleVi;
      clozeFullTarget = card.exampleTarget;
      clozeVi = card.exampleVi;
    }
  }

  const escapedTerm = card.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedTerm, "i");
  const clozeSentenceWithBlank = regex.test(clozeFullTarget)
    ? clozeFullTarget.replace(regex, "______")
    : `______ (${clozeFullTarget})`;

  return {
    sentenceBuildTarget,
    sentenceBuildVi,
    clozeSentenceWithBlank,
    clozeFullTarget,
    clozeVi,
  };
}
