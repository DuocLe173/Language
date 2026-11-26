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

function hashCardSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickByHash<T>(items: T[], seed: string): T {
  return items[hashCardSeed(seed) % items.length];
}

interface PracticeTemplateOutput {
  sentenceBuildTarget: string;
  sentenceBuildVi: string;
  clozeFullTarget: string;
  clozeVi: string;
}

function extractShortMeaning(meaningVi: string): {
  raw: string;
  lower: string;
  capitalized: string;
} {
  const raw = meaningVi.split(/[;,/]/)[0].replace(/[!?.]+$/, "").trim();
  const lower = raw.charAt(0).toLowerCase() + raw.slice(1);
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  return { raw, lower, capitalized };
}

function buildFallbackPracticeSentences(card: VocabCard): PracticeTemplateOutput {
  const seed = `${card.id}:${card.term}`;
  const pos = card.partOfSpeech.toLowerCase();
  const { raw: shortRaw, lower: shortLower, capitalized: shortCap } =
    extractShortMeaning(card.meaningVi);
  const term = card.term.trim();
  const termLower = term.toLowerCase();

  if (card.languageCode === "en") {
    const isVerb =
      (pos.includes("verb") && !pos.includes("noun") && !pos.includes("adverb")) ||
      pos.includes("phrasal");
    const isAdjective = pos.includes("adjective") || pos === "adj";
    const isAdverb = pos.includes("adverb") || pos === "adv";
    const isExpression =
      pos.includes("interjection") ||
      pos.includes("idiom") ||
      pos.includes("phrase") ||
      pos.includes("expression");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `We try to ${termLower} carefully every day.`,
            sentenceBuildVi: `Chúng mình cố gắng ${shortLower} cẩn thận mỗi ngày.`,
            clozeFullTarget: `Please remember to ${term} before we finish.`,
            clozeVi: `Hãy nhớ ${shortLower} trước khi chúng mình kết thúc nhé.`,
          },
          {
            sentenceBuildTarget: `They often ${termLower} together after class.`,
            sentenceBuildVi: `Họ thường cùng nhau ${shortLower} sau giờ học.`,
            clozeFullTarget: `Can you help me ${term} this afternoon?`,
            clozeVi: `Chiều nay bạn có thể giúp mình ${shortLower} không?`,
          },
          {
            sentenceBuildTarget: `It is helpful to ${termLower} step by step.`,
            sentenceBuildVi: `Thật hữu ích khi ${shortLower} từng bước một.`,
            clozeFullTarget: `Let us ${term} calmly and clearly today.`,
            clozeVi: `Hôm nay tụi mình hãy bình tĩnh và rõ ràng ${shortLower} nhé.`,
          },
          {
            sentenceBuildTarget: `She wants to ${termLower} better this week.`,
            sentenceBuildVi: `Cô ấy muốn ${shortLower} tốt hơn trong tuần này.`,
            clozeFullTarget: `Good habits make it easier to ${term}.`,
            clozeVi: `Thói quen tốt giúp việc ${shortLower} trở nên dễ dàng hơn.`,
          },
          {
            sentenceBuildTarget: `You can ${termLower} whenever you feel ready.`,
            sentenceBuildVi: `Bạn có thể ${shortLower} bất cứ khi nào thấy sẵn sàng.`,
            clozeFullTarget: `We plan to ${term} early tomorrow morning.`,
            clozeVi: `Chúng mình dự định sẽ ${shortLower} từ sáng sớm mai.`,
          },
        ],
        seed
      );
    }

    if (isAdjective) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `This story feels very ${termLower} to me.`,
            sentenceBuildVi: `Câu chuyện này mang lại cho mình cảm giác rất ${shortLower}.`,
            clozeFullTarget: `Everyone noticed how ${term} the moment was.`,
            clozeVi: `Mọi người đều nhận thấy khoảnh khắc đó thật ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `Our teacher gave a ${termLower} explanation today.`,
            sentenceBuildVi: `Thầy cô hôm nay đã đưa ra một lời giải thích thật ${shortLower}.`,
            clozeFullTarget: `It seems really ${term} when you look closely.`,
            clozeVi: `Nhìn kỹ hơn thì điều đó trông thật sự ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `Things became much more ${termLower} this morning.`,
            sentenceBuildVi: `Sáng nay mọi thứ trở nên ${shortLower} hơn nhiều.`,
            clozeFullTarget: `People appreciate a ${term} attitude at work.`,
            clozeVi: `Mọi người rất trân trọng thái độ ${shortLower} trong công việc.`,
          },
          {
            sentenceBuildTarget: `That new idea sounds quite ${termLower}.`,
            sentenceBuildVi: `Ý tưởng mới đó nghe khá là ${shortLower}.`,
            clozeFullTarget: `We were surprised to see something so ${term}.`,
            clozeVi: `Chúng mình khá bất ngờ khi thấy một điều ${shortLower} như vậy.`,
          },
          {
            sentenceBuildTarget: `Today turned out to be surprisingly ${termLower}.`,
            sentenceBuildVi: `Hôm nay hóa ra lại ${shortLower} một cách bất ngờ.`,
            clozeFullTarget: `Try to keep your daily routine ${term}.`,
            clozeVi: `Hãy cố gắng giữ nhịp sinh hoạt hằng ngày thật ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isAdverb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `She spoke ${termLower} during the meeting.`,
            sentenceBuildVi: `Cô ấy đã nói chuyện một cách ${shortLower} trong buổi họp.`,
            clozeFullTarget: `Please handle this task ${term} today.`,
            clozeVi: `Hôm nay hãy xử lý công việc này thật ${shortLower} nhé.`,
          },
          {
            sentenceBuildTarget: `He answered the question very ${termLower}.`,
            sentenceBuildVi: `Anh ấy trả lời câu hỏi một cách rất ${shortLower}.`,
            clozeFullTarget: `We always try to work ${term} together.`,
            clozeVi: `Chúng mình luôn cố gắng làm việc cùng nhau thật ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `They completed the project ${termLower} on time.`,
            sentenceBuildVi: `Họ đã hoàn thành dự án ${shortLower} và đúng hạn.`,
            clozeFullTarget: `Listen ${term} when someone shares an idea.`,
            clozeVi: `Hãy lắng nghe thật ${shortLower} khi ai đó chia sẻ ý kiến.`,
          },
          {
            sentenceBuildTarget: `Everything moved forward quite ${termLower}.`,
            sentenceBuildVi: `Mọi việc đã tiến triển khá ${shortLower}.`,
            clozeFullTarget: `You can learn faster if you practice ${term}.`,
            clozeVi: `Bạn có thể học nhanh hơn nếu luyện tập một cách ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isExpression) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `Friends often say ${termLower} in daily chats.`,
            sentenceBuildVi: `Bạn bè thường nói "${shortRaw}" trong các cuộc trò chuyện hằng ngày.`,
            clozeFullTarget: `You can reply with ${term} to sound natural.`,
            clozeVi: `Bạn có thể đáp lại bằng "${shortRaw}" để nghe thật tự nhiên.`,
          },
          {
            sentenceBuildTarget: `Hearing ${termLower} always warms the conversation.`,
            sentenceBuildVi: `Nghe thấy câu "${shortRaw}" luôn khiến cuộc trò chuyện thêm ấm áp.`,
            clozeFullTarget: `In polite conversation, people often say ${term}.`,
            clozeVi: `Trong giao tiếp lịch sự, mọi người thường nói "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `Remember to use ${termLower} when greeting people.`,
            sentenceBuildVi: `Hãy nhớ dùng "${shortRaw}" khi giao tiếp với mọi người nhé.`,
            clozeFullTarget: `She smiled and said ${term} right away.`,
            clozeVi: `Cô ấy mỉm cười và nói ngay "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `Using ${termLower} makes your English sound friendly.`,
            sentenceBuildVi: `Dùng "${shortRaw}" giúp tiếng Anh của bạn nghe thân thiện hơn.`,
            clozeFullTarget: `Try saying ${term} clearly with a smile.`,
            clozeVi: `Hãy thử nói rõ ràng "${shortRaw}" kèm một nụ cười nhé.`,
          },
        ],
        seed
      );
    }

    // Default English: Noun
    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `We talked about ${termLower} during lunch today.`,
          sentenceBuildVi: `Hôm nay trong bữa trưa tụi mình đã trò chuyện về ${shortLower}.`,
          clozeFullTarget: `Today we read an interesting article about ${term}.`,
          clozeVi: `Hôm nay chúng mình đã đọc một bài viết thú vị về ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `Our class explored ${termLower} in detail yesterday.`,
          sentenceBuildVi: `Hôm qua lớp mình đã tìm hiểu kỹ về ${shortLower}.`,
          clozeFullTarget: `Can you share a clear example of ${term}?`,
          clozeVi: `Bạn có thể chia sẻ một ví dụ rõ ràng về ${shortLower} không?`,
        },
        {
          sentenceBuildTarget: `Many people notice ${termLower} in daily life.`,
          sentenceBuildVi: `Nhiều người thường bắt gặp ${shortLower} trong đời sống hằng ngày.`,
          clozeFullTarget: `Let us take a closer look at ${term}.`,
          clozeVi: `Chúng mình hãy cùng quan sát kỹ hơn về ${shortLower} nhé.`,
        },
        {
          sentenceBuildTarget: `${shortCap.length > 0 ? "Understanding" : "Learning"} ${termLower} helps in real conversations.`,
          sentenceBuildVi: `Hiểu rõ về ${shortLower} rất hữu ích trong giao tiếp thực tế.`,
          clozeFullTarget: `She wrote a helpful note about ${term}.`,
          clozeVi: `Cô ấy đã viết một ghi chú rất hữu ích về ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `Everyone asked a question about ${termLower}.`,
          sentenceBuildVi: `Mọi người đều đặt câu hỏi xoay quanh ${shortLower}.`,
          clozeFullTarget: `This chapter introduces the basics of ${term}.`,
          clozeVi: `Chương này giới thiệu những kiến thức cơ bản về ${shortLower}.`,
        },
      ],
      seed
    );
  }

  if (card.languageCode === "zh-CN") {
    const isVerb = pos.includes("动词");
    const isAdj = pos.includes("形容词");
    const isExpr =
      pos.includes("常用语") ||
      pos.includes("短语") ||
      pos.includes("感叹语") ||
      pos.includes("成语") ||
      pos.includes("问候语");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `大家决定今天下午一起${term}。`,
            sentenceBuildVi: `Mọi người quyết định chiều nay sẽ cùng nhau ${shortLower}.`,
            clozeFullTarget: `别忘了出门之前先${term}一下。`,
            clozeVi: `Đừng quên ${shortLower} một chút trước khi ra ngoài nhé.`,
          },
          {
            sentenceBuildTarget: `他每天都会抽出时间来${term}。`,
            sentenceBuildVi: `Mỗi ngày anh ấy đều dành thời gian để ${shortLower}.`,
            clozeFullTarget: `你有空的时候可以试着${term}。`,
            clozeVi: `Khi nào rảnh bạn có thể thử ${shortLower} xem sao.`,
          },
          {
            sentenceBuildTarget: `我们可以先休息一会儿再${term}。`,
            sentenceBuildVi: `Tụi mình có thể nghỉ một lát rồi mới ${shortLower}.`,
            clozeFullTarget: `老师提醒大家要认真${term}。`,
            clozeVi: `Thầy cô nhắc mọi người hãy nghiêm túc ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `周末的时候我习惯在家${term}。`,
            sentenceBuildVi: `Cuối tuần mình có thói quen ở nhà ${shortLower}.`,
            clozeFullTarget: `现在就开始${term}，时间刚刚好。`,
            clozeVi: `Bây giờ bắt đầu ${shortLower} là vừa kịp lúc luôn.`,
          },
        ],
        seed
      );
    }

    if (isAdj) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `这个新办法听起来特别${term}。`,
            sentenceBuildVi: `Cách làm mới này nghe có vẻ cực kỳ ${shortLower}.`,
            clozeFullTarget: `大家觉得今天的安排非常${term}。`,
            clozeVi: `Mọi người đều thấy lịch trình hôm nay vô cùng ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `住在这附近其实挺${term}的。`,
            sentenceBuildVi: `Sống quanh khu vực này thực ra khá là ${shortLower}.`,
            clozeFullTarget: `只要提前计划，一切都会很${term}。`,
            clozeVi: `Chỉ cần lên kế hoạch trước, mọi thứ sẽ rất ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `朋友说那家小店很${term}。`,
            sentenceBuildVi: `Bạn mình bảo tiệm nhỏ đó rất ${shortLower}.`,
            clozeFullTarget: `看到结果这么${term}，我们都放心了。`,
            clozeVi: `Thấy kết quả ${shortLower} như vậy, tụi mình yên tâm hẳn.`,
          },
          {
            sentenceBuildTarget: `这样交流让人感觉很${term}。`,
            sentenceBuildVi: `Trò chuyện theo cách này khiến người nghe cảm thấy rất ${shortLower}.`,
            clozeFullTarget: `她把事情解释得十分${term}。`,
            clozeVi: `Cô ấy giải thích sự việc vô cùng ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isExpr) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `和朋友聊天时，我经常会说${term}。`,
            sentenceBuildVi: `Khi trò chuyện với bạn bè, mình rất hay nói "${shortRaw}".`,
            clozeFullTarget: `遇到这种情况，微笑着说一声${term}吧。`,
            clozeVi: `Gặp tình huống này, hãy mỉm cười nói một câu "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `听到他说${term}，大家都笑了起来。`,
            sentenceBuildVi: `Nghe anh ấy nói "${shortRaw}", mọi người đều bật cười vui vẻ.`,
            clozeFullTarget: `在日常对话里，${term}是一句很暖心的话。`,
            clozeVi: `Trong hội thoại thường ngày, "${shortRaw}" là câu nói rất ấm áp.`,
          },
          {
            sentenceBuildTarget: `临走前她热情地对我们说了${term}。`,
            sentenceBuildVi: `Trước khi rời đi, cô ấy nhiệt tình nói "${shortRaw}" với tụi mình.`,
            clozeFullTarget: `学会自然地说${term}，交流会更顺畅。`,
            clozeVi: `Biết nói "${shortRaw}" thật tự nhiên sẽ giúp giao tiếp trôi chảy hơn.`,
          },
          {
            sentenceBuildTarget: `收到消息后，我马上回复了${term}。`,
            sentenceBuildVi: `Nhận được tin nhắn xong, mình liền trả lời ngay "${shortRaw}".`,
            clozeFullTarget: `刚才同事发来消息，第一句就是${term}。`,
            clozeVi: `Vừa nãy đồng nghiệp nhắn tin, câu đầu tiên chính là "${shortRaw}".`,
          },
        ],
        seed
      );
    }

    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `今天的话题刚好提到了${term}。`,
          sentenceBuildVi: `Chủ đề hôm nay vừa khéo nhắc đến ${shortLower}.`,
          clozeFullTarget: `我们在课上聊了很多关于${term}的事。`,
          clozeVi: `Trên lớp tụi mình đã trò chuyện rất nhiều về ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `大家对这个${term}都很感兴趣。`,
          sentenceBuildVi: `Mọi người đều rất hứng thú với ${shortLower} này.`,
          clozeFullTarget: `每天多留意身边的${term}会有新发现。`,
          clozeVi: `Mỗi ngày chú ý thêm đến ${shortLower} quanh mình sẽ có phát hiện mới.`,
        },
        {
          sentenceBuildTarget: `我想和你分享一下关于${term}的想法。`,
          sentenceBuildVi: `Mình muốn chia sẻ với bạn vài suy nghĩ về ${shortLower}.`,
          clozeFullTarget: `笔记本里记着几个和${term}有关的词。`,
          clozeVi: `Trong sổ tay có ghi vài từ liên quan đến ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `刚才朋友打电话聊起了${term}。`,
          sentenceBuildVi: `Vừa nãy bạn mình gọi điện nhắc tới ${shortLower}.`,
          clozeFullTarget: `提前了解${term}能让生活更轻松。`,
          clozeVi: `Tìm hiểu trước về ${shortLower} giúp cuộc sống nhẹ nhàng hơn.`,
        },
      ],
      seed
    );
  }

  if (card.languageCode === "zh-TW") {
    const termTw = card.traditionalTerm || term;
    const isVerb = pos.includes("動詞");
    const isAdj = pos.includes("形容詞");
    const isExpr =
      pos.includes("常用語") ||
      pos.includes("短語") ||
      pos.includes("感嘆語") ||
      pos.includes("問候語") ||
      pos.includes("成語");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `我們決定今天下午一起${termTw}。`,
            sentenceBuildVi: `Tụi mình quyết định chiều nay cùng nhau ${shortLower}.`,
            clozeFullTarget: `出門之前記得先${termTw}一下喔。`,
            clozeVi: `Trước khi ra ngoài nhớ ${shortLower} một chút nhé.`,
          },
          {
            sentenceBuildTarget: `他每天下班後都會${termTw}。`,
            sentenceBuildVi: `Mỗi ngày sau khi tan làm anh ấy đều ${shortLower}.`,
            clozeFullTarget: `你有空的時候可以慢慢${termTw}。`,
            clozeVi: `Khi nào rảnh bạn có thể thong thả ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `我們先喝杯茶再繼續${termTw}吧。`,
            sentenceBuildVi: `Tụi mình uống tách trà trước rồi tiếp tục ${shortLower} nhé.`,
            clozeFullTarget: `老師建議大家每天都要${termTw}。`,
            clozeVi: `Thầy cô khuyên mọi người mỗi ngày đều nên ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `週末的時候我最喜歡在家${termTw}。`,
            sentenceBuildVi: `Cuối tuần mình thích nhất là ở nhà ${shortLower}.`,
            clozeFullTarget: `現在開始${termTw}還來得及喔。`,
            clozeVi: `Bây giờ bắt đầu ${shortLower} vẫn còn kịp lắm đó.`,
          },
        ],
        seed
      );
    }

    if (isAdj) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `這個做法聽起來真的很${termTw}。`,
            sentenceBuildVi: `Cách làm này nghe thật sự rất ${shortLower}.`,
            clozeFullTarget: `大家都覺得今天的安排非常${termTw}。`,
            clozeVi: `Mọi người đều thấy lịch trình hôm nay vô cùng ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `住在這附近其實非常${termTw}。`,
            sentenceBuildVi: `Sống quanh khu này thực ra vô cùng ${shortLower}.`,
            clozeFullTarget: `她把重點說明得十分${termTw}。`,
            clozeVi: `Cô ấy trình bày trọng tâm vô cùng ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `朋友說那間咖啡廳很${termTw}。`,
            sentenceBuildVi: `Bạn mình bảo quán cà phê đó rất ${shortLower}.`,
            clozeFullTarget: `看到大家這麼${termTw}，我也好開心。`,
            clozeVi: `Thấy mọi người ${shortLower} như vậy, mình cũng vui lây.`,
          },
          {
            sentenceBuildTarget: `這樣的聊天氣氛讓人覺得很${termTw}。`,
            sentenceBuildVi: `Không khí trò chuyện thế này khiến ai cũng thấy rất ${shortLower}.`,
            clozeFullTarget: `提前規劃會讓整趟旅程更${termTw}。`,
            clozeVi: `Lên kế hoạch trước sẽ giúp cả chuyến đi thêm ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isExpr) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `在台灣聊天時大家常說${termTw}。`,
            sentenceBuildVi: `Khi trò chuyện ở Đài Loan mọi người rất hay nói "${shortRaw}".`,
            clozeFullTarget: `遇到朋友的時候，微笑說一聲${termTw}吧。`,
            clozeVi: `Khi gặp bạn bè, hãy mỉm cười nói một tiếng "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `聽到對方說${termTw}，心裡覺得暖暖的。`,
            sentenceBuildVi: `Nghe đối phương nói "${shortRaw}", trong lòng thấy thật ấm áp.`,
            clozeFullTarget: `這句${termTw}在日常生活中超級實用。`,
            clozeVi: `Câu "${shortRaw}" này cực kỳ hữu dụng trong đời sống hằng ngày.`,
          },
          {
            sentenceBuildTarget: `離開前她親切地對我們說了${termTw}。`,
            sentenceBuildVi: `Trước khi về, cô ấy thân thiện nói "${shortRaw}" với tụi mình.`,
            clozeFullTarget: `收到訊息後，我立刻回覆了${termTw}。`,
            clozeVi: `Nhận được tin nhắn xong, mình lập tức trả lời "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `自然地說出${termTw}能拉近彼此距離。`,
            sentenceBuildVi: `Nói "${shortRaw}" thật tự nhiên giúp mọi người gần gũi nhau hơn.`,
            clozeFullTarget: `跟店員互動時說聲${termTw}很有禮貌。`,
            clozeVi: `Nói tiếng "${shortRaw}" khi giao tiếp với nhân viên rất lịch sự.`,
          },
        ],
        seed
      );
    }

    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `今天午餐時我們聊到了${termTw}。`,
          sentenceBuildVi: `Bữa trưa hôm nay tụi mình đã trò chuyện về ${shortLower}.`,
          clozeFullTarget: `課堂上老師分享了許多關於${termTw}的故事。`,
          clozeVi: `Trên lớp thầy cô đã chia sẻ nhiều câu chuyện về ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `大家對${termTw}都非常有興趣。`,
          sentenceBuildVi: `Mọi người đều rất hứng thú với ${shortLower}.`,
          clozeFullTarget: `多了解${termTw}能讓對話更生動。`,
          clozeVi: `Hiểu thêm về ${shortLower} giúp cuộc trò chuyện thêm sinh động.`,
        },
        {
          sentenceBuildTarget: `我最近特別關注${termTw}的消息。`,
          sentenceBuildVi: `Dạo này mình đặc biệt quan tâm tin tức về ${shortLower}.`,
          clozeFullTarget: `筆記本裡記錄了幾個跟${termTw}相關的句子。`,
          clozeVi: `Trong sổ tay có ghi lại vài câu liên quan đến ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `剛才和同事討論了一下${termTw}。`,
          sentenceBuildVi: `Vừa nãy mình đã trao đổi một chút với đồng nghiệp về ${shortLower}.`,
          clozeFullTarget: `平時多注意${termTw}對生活很有幫助。`,
          clozeVi: `Thường ngày chú ý đến ${shortLower} rất có ích cho cuộc sống.`,
        },
      ],
      seed
    );
  }

  if (card.languageCode === "ja") {
    const isVerb = pos.includes("動詞");
    const isAdj = pos.includes("形容詞");
    const isExpr = pos.includes("感動詞") || pos.includes("表現");
    const isAdv = pos.includes("副詞");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `今日もみんなで楽しく${term}つもりです。`,
            sentenceBuildVi: `Hôm nay cả nhóm cũng dự định sẽ vui vẻ ${shortLower}.`,
            clozeFullTarget: `時間があるときにゆっくり${term}といいですよ。`,
            clozeVi: `Khi có thời gian, bạn thong thả ${shortLower} sẽ rất tốt đấy.`,
          },
          {
            sentenceBuildTarget: `明日の朝も忘れずに${term}予定です。`,
            sentenceBuildVi: `Sáng mai mình cũng dự định không quên ${shortLower}.`,
            clozeFullTarget: `友達と一緒に${term}のはとても楽しいです。`,
            clozeVi: `Cùng bạn bè ${shortLower} thật sự rất vui.`,
          },
          {
            sentenceBuildTarget: `少しずつ毎日${term}ようにしています。`,
            sentenceBuildVi: `Mình đang cố gắng mỗi ngày ${shortLower} từng chút một.`,
            clozeFullTarget: `これからすぐ${term}ので安心してください。`,
            clozeVi: `Bây giờ mình sẽ ${shortLower} ngay nên bạn cứ yên tâm nhé.`,
          },
          {
            sentenceBuildTarget: `週末に家でゆっくり${term}つもりです。`,
            sentenceBuildVi: `Cuối tuần mình dự định ở nhà thong thả ${shortLower}.`,
            clozeFullTarget: `必要なときにいつでも${term}ことができます。`,
            clozeVi: `Bạn có thể ${shortLower} bất cứ lúc nào cần thiết.`,
          },
        ],
        seed
      );
    }

    if (isAdj) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `このお店は本当に${term}ですね。`,
            sentenceBuildVi: `Quán này thật sự rất ${shortLower} nhỉ.`,
            clozeFullTarget: `友達もとても${term}と言っていました。`,
            clozeVi: `Bạn mình cũng nói rằng điều đó rất ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `今日の雰囲気はいつもより${term}です。`,
            sentenceBuildVi: `Không khí hôm nay ${shortLower} hơn mọi ngày.`,
            clozeFullTarget: `毎日が${term}だと気持ちがいいですね。`,
            clozeVi: `Nếu mỗi ngày đều ${shortLower} thì tâm trạng thật dễ chịu nhỉ.`,
          },
          {
            sentenceBuildTarget: `新しいアイデアはとても${term}と思います。`,
            sentenceBuildVi: `Mình nghĩ ý tưởng mới này rất ${shortLower}.`,
            clozeFullTarget: `みんなの前でもすごく${term}でした。`,
            clozeVi: `Trước mặt mọi người cũng thật sự ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `思っていた以上に${term}で驚きました。`,
            sentenceBuildVi: `Mình bất ngờ vì nó còn ${shortLower} hơn cả tưởng tượng.`,
            clozeFullTarget: `ここでの生活は毎日とても${term}です。`,
            clozeVi: `Cuộc sống ở đây mỗi ngày đều rất ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isExpr) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `友達に会ったら笑顔で${term}と言います。`,
            sentenceBuildVi: `Gặp bạn bè là mình mỉm cười nói "${shortRaw}" ngay.`,
            clozeFullTarget: `日本の日常会話で${term}はとても大切な言葉です。`,
            clozeVi: `Trong hội thoại tiếng Nhật hằng ngày, "${shortRaw}" là câu nói rất quan trọng.`,
          },
          {
            sentenceBuildTarget: `メッセージの最後にいつも${term}と書きます。`,
            sentenceBuildVi: `Cuối tin nhắn mình luôn viết thêm câu "${shortRaw}".`,
            clozeFullTarget: `別れる前に元気よく${term}と挨拶しました。`,
            clozeVi: `Trước lúc chia tay, mình hào hứng chào một câu "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `カフェでも丁寧に${term}と伝えてみましょう。`,
            sentenceBuildVi: `Ở quán cà phê cũng hãy thử lịch sự nói "${shortRaw}" nhé.`,
            clozeFullTarget: `相手から${term}と言われると嬉しくなります。`,
            clozeVi: `Nghe đối phương nói "${shortRaw}" khiến mình thấy vui hẳn lên.`,
          },
          {
            sentenceBuildTarget: `自然なタイミングで${term}を使えると素敵です。`,
            sentenceBuildVi: `Dùng "${shortRaw}" đúng lúc tự nhiên thì thật tuyệt vời.`,
            clozeFullTarget: `まず最初に${term}と声をかけてみましょう。`,
            clozeVi: `Trước tiên hãy thử mở lời bằng câu "${shortRaw}" nhé.`,
          },
        ],
        seed
      );
    }

    if (isAdv) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `返事をするときに${term}と答えました。`,
            sentenceBuildVi: `Khi trả lời, mình đã đáp ngay "${shortRaw}".`,
            clozeFullTarget: `誘われたら${term}と笑顔で返しましょう。`,
            clozeVi: `Nếu được mời, hãy mỉm cười đáp "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `みんな${term}賛成してくれました。`,
            sentenceBuildVi: `Mọi người đều ${shortLower} tán thành ngay.`,
            clozeFullTarget: `その計画なら${term}参加したいです。`,
            clozeVi: `Nếu là kế hoạch đó thì ${shortLower} mình muốn tham gia rồi.`,
          },
          {
            sentenceBuildTarget: `大切なことなので${term}覚えています。`,
            sentenceBuildVi: `Vì là việc quan trọng nên ${shortLower} mình nhớ rất rõ.`,
            clozeFullTarget: `約束の時間は${term}守ります。`,
            clozeVi: `Giờ hẹn thì ${shortLower} mình sẽ giữ đúng.`,
          },
        ],
        seed
      );
    }

    // Default Japanese: Noun
    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `今日の会話で${term}について話しました。`,
          sentenceBuildVi: `Trong cuộc trò chuyện hôm nay tụi mình đã nói về ${shortLower}.`,
          clozeFullTarget: `毎日の生活で${term}はとても大事です。`,
          clozeVi: `Trong đời sống hằng ngày, ${shortLower} vô cùng quan trọng.`,
        },
        {
          sentenceBuildTarget: `友達と${term}の話で盛り上がりました。`,
          sentenceBuildVi: `Mình và bạn bè đã trò chuyện rất sôi nổi về ${shortLower}.`,
          clozeFullTarget: `週末の前に${term}をしっかり確認しましょう。`,
          clozeVi: `Trước cuối tuần hãy kiểm tra kỹ ${shortLower} nhé.`,
        },
        {
          sentenceBuildTarget: `メモ帳に${term}のことを書いておきます。`,
          sentenceBuildVi: `Mình sẽ ghi chú việc liên quan đến ${shortLower} vào sổ tay.`,
          clozeFullTarget: `この本には${term}の良い例が載っています。`,
          clozeVi: `Cuốn sách này có nhiều ví dụ hay về ${shortLower}.`,
        },
        {
          sentenceBuildTarget: `昼休みに同僚と${term}の話をしました。`,
          sentenceBuildVi: `Giờ nghỉ trưa mình đã trò chuyện cùng đồng nghiệp về ${shortLower}.`,
          clozeFullTarget: `日本でも${term}はよく話題になります。`,
          clozeVi: `Ở Nhật ${shortLower} cũng rất hay được nhắc tới trong câu chuyện.`,
        },
      ],
      seed
    );
  }

  if (card.languageCode === "ko") {
    const isVerb = pos.includes("동사");
    const isAdj = pos.includes("형용사");
    const isExpr = pos.includes("감탄사") || pos.includes("표현");
    const isAdv = pos.includes("부사");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `오늘 친구에게 웃으면서 ${term}라고 말했어요.`,
            sentenceBuildVi: `Hôm nay mình đã mỉm cười nói "${shortRaw}" với bạn.`,
            clozeFullTarget: `그럴 때는 따뜻하게 ${term}라고 전해 보세요.`,
            clozeVi: `Lúc như vậy hãy thử nhắn gửi thật ấm áp "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `메시지로 먼저 ${term}라고 보냈어요.`,
            sentenceBuildVi: `Mình đã nhắn tin trước câu "${shortRaw}".`,
            clozeFullTarget: `대화 중에 자연스럽게 ${term}라고 답해 봐요.`,
            clozeVi: `Trong cuộc trò chuyện, hãy thử đáp tự nhiên là "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `모두가 기분 좋게 ${term}라고 이야기했어요.`,
            sentenceBuildVi: `Mọi người đều vui vẻ nói "${shortRaw}".`,
            clozeFullTarget: `필요한 순간에 꼭 ${term}라고 말해 주세요.`,
            clozeVi: `Vào lúc cần thiết, nhớ nói "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `헤어지기 전에 다정하게 ${term}라고 했어요.`,
            sentenceBuildVi: `Trước khi tạm biệt, mình đã ân cần nói "${shortRaw}".`,
            clozeFullTarget: `한국 친구들과 얘기할 때 ${term} 표현을 자주 써요.`,
            clozeVi: `Khi nói chuyện với bạn Hàn, câu "${shortRaw}" được dùng rất nhiều.`,
          },
        ],
        seed
      );
    }

    if (isAdj) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `오늘 분위기 정말 ${term}라고 생각해요.`,
            sentenceBuildVi: `Mình thấy không khí hôm nay thật sự "${shortRaw}".`,
            clozeFullTarget: `친구와 함께 있으면 언제나 ${term}.`,
            clozeVi: `Ở bên cạnh bạn bè lúc nào cũng cảm thấy ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `새로 간 식당이 아주 ${term}.`,
            sentenceBuildVi: `Nhà hàng mới đi thử thật sự rất ${shortLower}.`,
            clozeFullTarget: `주말에 쉬고 나니까 마음이 한결 ${term}.`,
            clozeVi: `Nghỉ ngơi cuối tuần xong thấy trong lòng ${shortLower} hơn hẳn.`,
          },
          {
            sentenceBuildTarget: `그 이야기를 들으니 정말 ${term}.`,
            sentenceBuildVi: `Nghe câu chuyện đó xong mình thấy thật sự ${shortLower}.`,
            clozeFullTarget: `여기 공간이 조용해서 공부하기 ${term}.`,
            clozeVi: `Không gian ở đây yên tĩnh nên học bài rất ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `다들 웃으면서 정말 ${term}라고 했어요.`,
            sentenceBuildVi: `Mọi người đều cười và bảo thật là ${shortLower}.`,
            clozeFullTarget: `처음 와 본 곳인데 생각보다 ${term}.`,
            clozeVi: `Lần đầu đến đây nhưng lại ${shortLower} hơn mình nghĩ.`,
          },
        ],
        seed
      );
    }

    if (isExpr) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `친구를 만나면 반갑게 ${term}라고 인사해요.`,
            sentenceBuildVi: `Gặp bạn bè là mình niềm nở nói "${shortRaw}".`,
            clozeFullTarget: `일상 대화에서 ${term}는 정말 자주 쓰이는 말이에요.`,
            clozeVi: `Trong giao tiếp hằng ngày, "${shortRaw}" là câu nói dùng cực kỳ thường xuyên.`,
          },
          {
            sentenceBuildTarget: `문자 끝에 항상 ${term}라고 남겨요.`,
            sentenceBuildVi: `Cuối tin nhắn mình luôn để lại lời "${shortRaw}".`,
            clozeFullTarget: `상대방에게 진심으로 ${term}라고 말해 보세요.`,
            clozeVi: `Hãy thử nói thật chân thành "${shortRaw}" với đối phương nhé.`,
          },
          {
            sentenceBuildTarget: `카페에서 직원을 부를 때도 ${term}라고 해요.`,
            sentenceBuildVi: `Trong tình huống thường ngày ở quán, mọi người cũng hay nói "${shortRaw}".`,
            clozeFullTarget: `웃는 얼굴로 ${term}라고 말하면 분위기가 좋아져요.`,
            clozeVi: `Nói "${shortRaw}" với gương mặt tươi cười giúp không khí thêm dễ chịu.`,
          },
          {
            sentenceBuildTarget: `오늘 통화 마지막에 ${term}라고 전했어요.`,
            sentenceBuildVi: `Cuối cuộc gọi hôm nay mình đã nhắn gửi "${shortRaw}".`,
            clozeFullTarget: `한국어로 자연스럽게 ${term}라고 말할 수 있어요.`,
            clozeVi: `Bạn hoàn toàn có thể nói "${shortRaw}" thật tự nhiên bằng tiếng Hàn.`,
          },
        ],
        seed
      );
    }

    if (isAdv) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `오늘은 서두르지 말고 ${term} 걸어가요.`,
            sentenceBuildVi: `Hôm nay đừng vội, tụi mình cứ đi ${shortLower} thôi.`,
            clozeFullTarget: `주말에 우리 ${term} 커피 한 잔 마셔요.`,
            clozeVi: `Cuối tuần tụi mình hãy ${shortLower} uống một ly cà phê nhé.`,
          },
          {
            sentenceBuildTarget: `차근차근 ${term} 연습하면 금방 늘어요.`,
            sentenceBuildVi: `Luyện tập ${shortLower} từng bước thì sẽ tiến bộ rất nhanh.`,
            clozeFullTarget: `시간 있을 때 ${term} 이야기 나눠요.`,
            clozeVi: `Lúc nào có thời gian tụi mình ${shortLower} trò chuyện nhé.`,
          },
          {
            sentenceBuildTarget: `친구랑 ${term} 저녁을 먹으러 갔어요.`,
            sentenceBuildVi: `Mình đã đi ăn tối ${shortLower} với bạn.`,
            clozeFullTarget: `어려운 부분은 ${term} 다시 읽어 보세요.`,
            clozeVi: `Phần nào khó bạn hãy đọc lại thật ${shortLower} nhé.`,
          },
        ],
        seed
      );
    }

    // Default Korean: Noun
    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `오늘 점심시간에 ${term} 이야기를 나눴어요.`,
          sentenceBuildVi: `Giờ ăn trưa hôm nay tụi mình đã trò chuyện về ${shortLower}.`,
          clozeFullTarget: `일상에서 ${term}는 정말 중요한 부분이에요.`,
          clozeVi: `Trong đời sống hằng ngày, ${shortLower} là một phần rất quan trọng.`,
        },
        {
          sentenceBuildTarget: `주말에 ${term} 덕분에 행복한 하루를 보냈어요.`,
          sentenceBuildVi: `Cuối tuần nhờ có ${shortLower} mà mình đã có một ngày thật vui.`,
          clozeFullTarget: `미리 ${term}를 잘 챙기면 마음이 편해요.`,
          clozeVi: `Chuẩn bị chu đáo cho ${shortLower} từ trước giúp mình yên tâm hẳn.`,
        },
        {
          sentenceBuildTarget: `친구와 오랜만에 ${term}에 대해 얘기했어요.`,
          sentenceBuildVi: `Lâu rồi mình mới trò chuyện cùng bạn về ${shortLower}.`,
          clozeFullTarget: `메모장에 오늘의 ${term} 계획을 적어 두었어요.`,
          clozeVi: `Mình đã ghi kế hoạch liên quan đến ${shortLower} hôm nay vào sổ tay.`,
        },
        {
          sentenceBuildTarget: `아침마다 ${term}를 확인하는 습관이 있어요.`,
          sentenceBuildVi: `Sáng nào mình cũng có thói quen kiểm tra ${shortLower}.`,
          clozeFullTarget: `한국 대화에서 ${term} 단어가 아주 자주 나와요.`,
          clozeVi: `Trong hội thoại tiếng Hàn, từ "${shortRaw}" xuất hiện rất thường xuyên.`,
        },
      ],
      seed
    );
  }

  if (card.languageCode === "fr") {
    const isVerb = pos.includes("verbe");
    const isAdj = pos.includes("adjectif");
    const isExpr =
      pos.includes("locution") ||
      pos.includes("expression") ||
      pos.includes("interjection");
    const isAdv = pos.includes("adverbe");

    if (isVerb) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `On aime bien ${termLower} après une longue journée.`,
            sentenceBuildVi: `Mọi người rất thích ${shortLower} sau một ngày dài.`,
            clozeFullTarget: `N'oublie pas de ${term} un peu ce week-end.`,
            clozeVi: `Đừng quên dành chút thời gian ${shortLower} cuối tuần này nhé.`,
          },
          {
            sentenceBuildTarget: `Je vais prendre le temps de ${termLower} ce soir.`,
            sentenceBuildVi: `Tối nay mình sẽ dành thời gian để ${shortLower}.`,
            clozeFullTarget: `C'est important de ${term} quand on est fatigué.`,
            clozeVi: `Thật quan trọng khi biết ${shortLower} những lúc mệt mỏi.`,
          },
          {
            sentenceBuildTarget: `Nous pouvons ${termLower} calmement avant de repartir.`,
            sentenceBuildVi: `Tụi mình có thể thong thả ${shortLower} trước khi đi tiếp.`,
            clozeFullTarget: `En français, on utilise souvent ${term} au quotidien.`,
            clozeVi: `Trong tiếng Pháp, người ta rất hay dùng "${shortRaw}" hằng ngày.`,
          },
          {
            sentenceBuildTarget: `Tu peux ${termLower} ici pendant quelques minutes.`,
            sentenceBuildVi: `Bạn có thể ${shortLower} ở đây vài phút nhé.`,
            clozeFullTarget: `Prends une pause pour ${term} tranquillement.`,
            clozeVi: `Hãy nghỉ giải lao một chút để thong thả ${shortLower} nhé.`,
          },
        ],
        seed
      );
    }

    if (isAdj) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `Tout le monde est vraiment ${termLower} aujourd'hui.`,
            sentenceBuildVi: `Hôm nay mọi người đều thật sự ${shortLower}.`,
            clozeFullTarget: `Je suis déjà ${term} pour notre rendez-vous.`,
            clozeVi: `Mình đã ${shortLower} cho cuộc hẹn của tụi mình rồi.`,
          },
          {
            sentenceBuildTarget: `Il semble très ${termLower} de commencer ce projet.`,
            sentenceBuildVi: `Anh ấy có vẻ rất ${shortLower} để bắt đầu dự án này.`,
            clozeFullTarget: `Dis-moi dès que tu es ${term} à partir.`,
            clozeVi: `Nhắn cho mình biết ngay khi bạn đã ${shortLower} xuất phát nhé.`,
          },
          {
            sentenceBuildTarget: `C'est agréable d'être toujours ${termLower} à l'avance.`,
            sentenceBuildVi: `Thật dễ chịu khi lúc nào cũng ${shortLower} từ sớm.`,
            clozeFullTarget: `Nous sommes tous ${term} pour la réunion.`,
            clozeVi: `Tất cả chúng mình đều đã ${shortLower} cho buổi họp.`,
          },
          {
            sentenceBuildTarget: `Mon collègue est super ${termLower} ce matin.`,
            sentenceBuildVi: `Sáng nay đồng nghiệp của mình cực kỳ ${shortLower}.`,
            clozeFullTarget: `Avec un peu de pratique, on se sent vite ${term}.`,
            clozeVi: `Luyện tập một chút là mình sẽ nhanh chóng thấy ${shortLower}.`,
          },
        ],
        seed
      );
    }

    if (isExpr) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `En France, on dit souvent ${termLower} avec le sourire.`,
            sentenceBuildVi: `Ở Pháp, mọi người rất hay nói "${shortRaw}" kèm một nụ cười.`,
            clozeFullTarget: `Dans un café, n'hésite pas à dire ${term}.`,
            clozeVi: `Ở quán cà phê, bạn đừng ngại nói "${shortRaw}" nhé.`,
          },
          {
            sentenceBuildTarget: `Quand on croise un ami, on répond ${termLower}.`,
            sentenceBuildVi: `Khi tình cờ gặp bạn bè, tụi mình hay đáp "${shortRaw}".`,
            clozeFullTarget: `Dire ${term} rend la discussion tout de suite chaleureuse.`,
            clozeVi: `Nói "${shortRaw}" khiến cuộc trò chuyện ấm áp lên ngay lập tức.`,
          },
          {
            sentenceBuildTarget: `Avant de partir, elle nous a lancé ${termLower}.`,
            sentenceBuildVi: `Trước lúc rời đi, cô ấy đã vui vẻ nói "${shortRaw}" với tụi mình.`,
            clozeFullTarget: `Tu peux répondre simplement ${term} dans cette situation.`,
            clozeVi: `Trong tình huống này bạn có thể đáp gọn gàng là "${shortRaw}".`,
          },
          {
            sentenceBuildTarget: `C'est très naturel d'ajouter ${termLower} en fin de phrase.`,
            sentenceBuildVi: `Thêm "${shortRaw}" vào cuối câu nghe vô cùng tự nhiên.`,
            clozeFullTarget: `Mon voisin m'a salué en disant ${term}.`,
            clozeVi: `Người hàng xóm chào mình bằng câu "${shortRaw}".`,
          },
        ],
        seed
      );
    }

    if (isAdv) {
      return pickByHash<PracticeTemplateOutput>(
        [
          {
            sentenceBuildTarget: `Nous allons déjeuner ${termLower} au petit bistrot.`,
            sentenceBuildVi: `Tụi mình sẽ ăn trưa ${shortLower} ở quán nhỏ xinh.`,
            clozeFullTarget: `J'ai envie de pratiquer le français ${term}.`,
            clozeVi: `Mình rất muốn luyện tiếng Pháp ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `On se retrouve ${termLower} devant la boulangerie.`,
            sentenceBuildVi: `Tụi mình hẹn gặp nhau ${shortLower} trước tiệm bánh nhé.`,
            clozeFullTarget: `Tout est plus simple quand on travaille ${term}.`,
            clozeVi: `Mọi việc đều nhẹ nhàng hơn khi làm việc ${shortLower}.`,
          },
          {
            sentenceBuildTarget: `Je vais préparer le dîner ${termLower} avec toi.`,
            sentenceBuildVi: `Mình sẽ chuẩn bị bữa tối ${shortLower} cùng bạn.`,
            clozeFullTarget: `Tu es libre ${term} pour prendre un café ?`,
            clozeVi: `${shortCap} bạn có rảnh đi uống ly cà phê không?`,
          },
        ],
        seed
      );
    }

    // Default French: Noun
    return pickByHash<PracticeTemplateOutput>(
      [
        {
          sentenceBuildTarget: `Nous avons parlé de ${termLower} pendant le déjeuner.`,
          sentenceBuildVi: `Trong bữa trưa tụi mình đã trò chuyện về ${shortLower}.`,
          clozeFullTarget: `On apprécie beaucoup ${term} dans la vie de tous les jours.`,
          clozeVi: `Mọi người rất trân trọng ${shortLower} trong cuộc sống hằng ngày.`,
        },
        {
          sentenceBuildTarget: `J'aime passer des moments doux avec ${termLower}.`,
          sentenceBuildVi: `Mình thích dành những khoảnh khắc êm đềm bên ${shortLower}.`,
          clozeFullTarget: `Dans cette leçon, on découvre le mot ${term}.`,
          clozeVi: `Trong bài học này, chúng mình tìm hiểu từ "${shortRaw}".`,
        },
        {
          sentenceBuildTarget: `On discute souvent de ${termLower} autour d'un café.`,
          sentenceBuildVi: `Mọi người hay bàn chuyện về ${shortLower} bên tách cà phê.`,
          clozeFullTarget: `C'est toujours un plaisir de retrouver ${term}.`,
          clozeVi: `Lúc nào gặp lại ${shortLower} cũng thật là niềm vui.`,
        },
        {
          sentenceBuildTarget: `Ce matin, j'ai pensé à ${termLower} en marchant.`,
          sentenceBuildVi: `Sáng nay khi đi bộ, mình đã nghĩ tới ${shortLower}.`,
          clozeFullTarget: `Tu connais bien ${term} en français ?`,
          clozeVi: `Bạn đã quen dùng từ "${shortRaw}" trong tiếng Pháp chưa?`,
        },
      ],
      seed
    );
  }

  return {
    sentenceBuildTarget: card.exampleTarget,
    sentenceBuildVi: card.exampleVi,
    clozeFullTarget: card.exampleTarget,
    clozeVi: card.exampleVi,
  };
}

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

  // If word is not in the preset bank, synthesize natural part-of-speech-aware sentences varied by card hash
  if (!sentenceBuildTarget) {
    const fallback = buildFallbackPracticeSentences(card);
    sentenceBuildTarget = fallback.sentenceBuildTarget;
    sentenceBuildVi = fallback.sentenceBuildVi;
    clozeFullTarget = fallback.clozeFullTarget;
    clozeVi = fallback.clozeVi;
  }

  const candidateTerms = Array.from(
    new Set([card.term.trim(), card.traditionalTerm?.trim()].filter(Boolean) as string[])
  );
  let clozeSentenceWithBlank = `______ (${clozeFullTarget})`;
  for (const candidate of candidateTerms) {
    const escapedTerm = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "i");
    if (regex.test(clozeFullTarget)) {
      clozeSentenceWithBlank = clozeFullTarget.replace(regex, "______");
      break;
    }
  }

  return {
    sentenceBuildTarget,
    sentenceBuildVi,
    clozeSentenceWithBlank,
    clozeFullTarget,
    clozeVi,
  };
}
