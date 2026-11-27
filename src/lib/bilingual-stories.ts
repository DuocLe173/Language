import { LanguageCode } from "@/types/language";

export interface BilingualStoryLine {
  speaker?: string;
  target: string;
  phonetic?: string;
  vi: string;
  highlightTerm: string;
  highlightMeaningVi: string;
  highlightPhonetic?: string;
}

export interface BilingualStory {
  id: string;
  languageCode: LanguageCode;
  titleVi: string;
  titleTarget: string;
  level: string;
  categoryVi: string;
  durationLabel: string;
  lines: BilingualStoryLine[];
}

export interface DictationWordDiff {
  word: string;
  matched: boolean;
}

export interface DictationEvaluationResult {
  accuracyPercent: number;
  isPassed: boolean;
  wordDiffs: DictationWordDiff[];
}

export const BILINGUAL_STORIES: BilingualStory[] = [
  // =========================================================================
  // ENGLISH (2 rich everyday stories)
  // =========================================================================
  {
    id: "en-coffee-morning",
    languageCode: "en",
    titleVi: "Buổi sáng tại quán cà phê quen",
    titleTarget: "A Quiet Morning at the Coffee Shop",
    level: "A2–B1",
    categoryVi: "Giao tiếp hàng ngày",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "Barista",
        target: "Good morning! Would you like your usual oat milk latte today?",
        phonetic: "/ɡʊd ˈmɔːrnɪŋ! wʊd juː laɪk jʊr ˈjuːʒuəl oʊt mɪlk ˈlɑːteɪ təˈdeɪ/",
        vi: "Chào buổi sáng! Hôm nay bạn vẫn dùng latte sữa yến mạch như mọi khi chứ?",
        highlightTerm: "usual",
        highlightMeaningVi: "như thường lệ, món quen",
        highlightPhonetic: "/ˈjuːʒuəl/",
      },
      {
        speaker: "Alex",
        target: "Yes please, and make it iced because the weather is getting warmer.",
        phonetic: "/jes pliːz, ænd meɪk ɪt aɪst bɪˈkɔːz ðə ˈweðər ɪz ˈɡetɪŋ ˈwɔːrmər/",
        vi: "Vâng làm ơn, cho mình thêm đá nhé vì trời đang ấm dần lên rồi.",
        highlightTerm: "getting warmer",
        highlightMeaningVi: "đang ấm dần lên",
        highlightPhonetic: "/ˈɡetɪŋ ˈwɔːrmər/",
      },
      {
        speaker: "Barista",
        target: "No problem. We just baked fresh almond croissants if you are hungry.",
        phonetic: "/noʊ ˈprɑːbləm. wiː dʒʌst beɪkt freʃ ˈɑːmənd krəˈsɑːnts ɪf juː ɑːr ˈhʌŋɡri/",
        vi: "Không vấn đề gì. Tụi mình vừa nướng xong bánh sừng bò hạnh nhân nóng hổi nếu bạn đói.",
        highlightTerm: "freshly baked",
        highlightMeaningVi: "mới ra lò, mới nướng",
        highlightPhonetic: "/ˈfreʃli beɪkt/",
      },
      {
        speaker: "Alex",
        target: "That sounds tempting! I will take one to share with my colleague.",
        phonetic: "/ðæt saʊndz ˈtemptɪŋ! aɪ wɪl teɪk wʌn tuː ʃer wɪð maɪ ˈkɑːliːɡ/",
        vi: "Nghe hấp dẫn quá! Cho mình lấy một cái để ăn chung với đồng nghiệp nhé.",
        highlightTerm: "tempting",
        highlightMeaningVi: "hấp dẫn, khó cưỡng",
        highlightPhonetic: "/ˈtemptɪŋ/",
      },
      {
        speaker: "Barista",
        target: "Your total comes to nine dollars. Feel free to grab a seat by the window.",
        phonetic: "/jʊr ˈtoʊtl kʌmz tuː naɪn ˈdɑːlərz. fiːl friː tuː ɡræb ə siːt baɪ ðə ˈwɪndoʊ/",
        vi: "Tổng cộng của bạn hết chín đô la. Bạn cứ tự nhiên chọn chỗ ngồi cạnh cửa sổ nhé.",
        highlightTerm: "grab a seat",
        highlightMeaningVi: "chọn chỗ ngồi, ngồi xuống",
        highlightPhonetic: "/ɡræb ə siːt/",
      },
      {
        speaker: "Alex",
        target: "Thanks so much! Have a wonderful day ahead.",
        phonetic: "/θæŋks soʊ mʌtʃ! hæv ə ˈwʌndərfəl deɪ əˈhed/",
        vi: "Cảm ơn bạn nhiều nhé! Chúc bạn một ngày mới thật tuyệt vời.",
        highlightTerm: "day ahead",
        highlightMeaningVi: "ngày mới phía trước",
        highlightPhonetic: "/deɪ əˈhed/",
      },
    ],
  },
  {
    id: "en-monday-standup",
    languageCode: "en",
    titleVi: "Họp nhanh đầu tuần ở văn phòng",
    titleTarget: "Monday Stand-up at the Office",
    level: "B1–B2",
    categoryVi: "Công việc & Văn phòng",
    durationLabel: "3 phút",
    lines: [
      {
        speaker: "Maya",
        target: "Morning everyone! Let us quickly review our priorities for this week.",
        phonetic: "/ˈmɔːrnɪŋ ˈevriwʌn! let ʌs ˈkwɪkli rɪˈvjuː ˈaʊər praɪˈɔːrətiz fɔːr ðɪs wiːk/",
        vi: "Chào buổi sáng cả nhà! Chúng ta điểm nhanh các đầu việc ưu tiên cho tuần này nhé.",
        highlightTerm: "priorities",
        highlightMeaningVi: "các mục ưu tiên hàng đầu",
        highlightPhonetic: "/praɪˈɔːrətiz/",
      },
      {
        speaker: "David",
        target: "I wrapped up the client presentation yesterday, so it is ready for feedback.",
        phonetic: "/aɪ ræpt ʌp ðə ˈklaɪənt ˌprezənˈteɪʃən ˈjestərdeɪ, soʊ ɪt ɪz ˈredi fɔːr ˈfiːdbæk/",
        vi: "Mình đã hoàn tất bài thuyết trình cho khách hàng hôm qua, giờ sẵn sàng nhận góp ý rồi.",
        highlightTerm: "wrapped up",
        highlightMeaningVi: "hoàn tất, chốt xong",
        highlightPhonetic: "/ræpt ʌp/",
      },
      {
        speaker: "Maya",
        target: "Great work, David. Are there any blockers slowing down the design team?",
        phonetic: "/ɡreɪt wɜːrk, ˈdeɪvɪd. ɑːr ðer ˈeni ˈblɑːkərz ˈsloʊɪŋ daʊn ðə dɪˈzaɪn tiːm/",
        vi: "Làm tốt lắm David. Có vướng mắc nào đang làm chậm nhóm thiết kế không?",
        highlightTerm: "blockers",
        highlightMeaningVi: "vướng mắc, trở ngại công việc",
        highlightPhonetic: "/ˈblɑːkərz/",
      },
      {
        speaker: "David",
        target: "We are still waiting for the updated figures from the marketing department.",
        phonetic: "/wiː ɑːr stɪl ˈweɪtɪŋ fɔːr ði ʌpˈdeɪtɪd ˈfɪɡjərz frʌm ðə ˈmɑːrkətɪŋ dɪˈpɑːrtmənt/",
        vi: "Tụi mình vẫn đang chờ số liệu cập nhật từ phòng marketing.",
        highlightTerm: "updated figures",
        highlightMeaningVi: "số liệu mới cập nhật",
        highlightPhonetic: "/ʌpˈdeɪtɪd ˈfɪɡjərz/",
      },
      {
        speaker: "Maya",
        target: "I will follow up with them right after this call so we stay on schedule.",
        phonetic: "/aɪ wɪl ˈfɑːloʊ ʌp wɪð ðem raɪt ˈæftər ðɪs kɔːl soʊ wiː steɪ ɑːn ˈskedʒuːl/",
        vi: "Mình sẽ nhắc lại với họ ngay sau cuộc họp này để nhóm giữ đúng tiến độ.",
        highlightTerm: "stay on schedule",
        highlightMeaningVi: "giữ đúng tiến độ, đúng hạn",
        highlightPhonetic: "/steɪ ɑːn ˈskedʒuːl/",
      },
      {
        speaker: "David",
        target: "Sounds like a plan. Let us sync again tomorrow morning.",
        phonetic: "/saʊndz laɪk ə plæn. let ʌs sɪŋk əˈɡen təˈmɔːroʊ ˈmɔːrnɪŋ/",
        vi: "Nhất trí luôn. Sáng mai chúng ta cập nhật tiến độ lại nhé.",
        highlightTerm: "sync again",
        highlightMeaningVi: "họp nhanh đồng bộ lại thông tin",
        highlightPhonetic: "/sɪŋk əˈɡen/",
      },
    ],
  },

  // =========================================================================
  // CHINESE SIMPLIFIED (zh-CN)
  // =========================================================================
  {
    id: "zh-cn-midnight-noodles",
    languageCode: "zh-CN",
    titleVi: "Gọi món tại quán mì đêm ở Thượng Hải",
    titleTarget: "上海夜宵面馆点单",
    level: "HSK 2–3",
    categoryVi: "Ẩm thực & Đời sống",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "老板",
        target: "欢迎光临！这么晚才下班，想吃点什么？",
        phonetic: "Huānyíng guānglín! Zhème wǎn cái xiàbān, xiǎng chī diǎn shénme?",
        vi: "Chào mừng quý khách! Muộn thế này mới tan làm à, bạn muốn ăn gì nào?",
        highlightTerm: "下班",
        highlightMeaningVi: "tan làm, hết giờ làm",
        highlightPhonetic: "xiàbān",
      },
      {
        speaker: "小陈",
        target: "老板，给我来一碗招牌牛肉面，少放一点辣。",
        phonetic: "Lǎobǎn, gěi wǒ lái yī wǎn zhāopái niúròumiàn, shǎo fàng yīdiǎn là.",
        vi: "Chủ quán ơi, cho tôi một bát mì bò đặc sản của quán, ít cay một chút nhé.",
        highlightTerm: "招牌",
        highlightMeaningVi: "món tủ, đặc sản của quán",
        highlightPhonetic: "zhāopái",
      },
      {
        speaker: "老板",
        target: "好的，面条要软一点还是筋道一点？",
        phonetic: "Hǎo de, miàntiáo yào ruǎn yīdiǎn háishì jīndào yīdiǎn?",
        vi: "Được thôi, sợi mì bạn muốn ăn mềm một chút hay dai một chút?",
        highlightTerm: "筋道",
        highlightMeaningVi: "dai ngon (sợi mì, đồ ăn)",
        highlightPhonetic: "jīndào",
      },
      {
        speaker: "小陈",
        target: "筋道一点吧，再加一个卤蛋和一瓶冰豆奶。",
        phonetic: "Jīndào yīdiǎn ba, zài jiā yīgè lǔdàn hé yī píng bīng dòunǎi.",
        vi: "Dai một chút đi ạ, thêm một quả trứng kho và một chai sữa đậu nành lạnh nữa.",
        highlightTerm: "卤蛋",
        highlightMeaningVi: "trứng kho tàu / trứng hầm xì dầu",
        highlightPhonetic: "lǔdàn",
      },
      {
        speaker: "老板",
        target: "没问题，你先坐一会儿，马上就好。",
        phonetic: "Méi wèntí, nǐ xiān zuò yīhuìr, mǎshàng jiù hǎo.",
        vi: "Không thành vấn đề, bạn cứ ngồi nghỉ lát nhé, có ngay đây.",
        highlightTerm: "马上就好",
        highlightMeaningVi: "xong ngay lập tức",
        highlightPhonetic: "mǎshàng jiù hǎo",
      },
      {
        speaker: "小陈",
        target: "谢谢老板，我可以直接扫码付款吗？",
        phonetic: "Xièxie lǎobǎn, wǒ kěyǐ zhíjiē sǎomǎ fùkuǎn ma?",
        vi: "Cảm ơn chủ quán, tôi quét mã thanh toán luôn được không ạ?",
        highlightTerm: "扫码付款",
        highlightMeaningVi: "quét mã thanh toán",
        highlightPhonetic: "sǎomǎ fùkuǎn",
      },
    ],
  },

  // =========================================================================
  // CHINESE TRADITIONAL (zh-TW)
  // =========================================================================
  {
    id: "zh-tw-taipei-nightmarket",
    languageCode: "zh-TW",
    titleVi: "Dạo chợ đêm Đài Bắc cuối tuần",
    titleTarget: "週末逛台北夜市",
    level: "TOCFL A2–B1",
    categoryVi: "Du lịch & Văn hóa",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "小美",
        target: "今晚天氣好涼爽，我們一起去逛饒河夜市吧！",
        phonetic: "Jīnwǎn tiānqì hǎo liángshuǎng, wǒmen yīqǐ qù guàng Ráohé Yèshì ba!",
        vi: "Tối nay trời mát mẻ quá, tụi mình cùng đi dạo chợ đêm Nhiêu Hà đi!",
        highlightTerm: "涼爽",
        highlightMeaningVi: "mát mẻ, dễ chịu",
        highlightPhonetic: "liángshuǎng",
      },
      {
        speaker: "阿傑",
        target: "好主意！聽說入口那家的胡椒餅非常有名。",
        phonetic: "Hǎo zhǔyì! Tīngshuō rùkǒu nà jiā de hújiāobǐng fēicháng yǒumíng.",
        vi: "Ý hay đấy! Nghe nói quán bánh tiêu ngay cổng vào nổi tiếng lắm.",
        highlightTerm: "有名",
        highlightMeaningVi: "nổi tiếng",
        highlightPhonetic: "yǒumíng",
      },
      {
        speaker: "小美",
        target: "排隊的人雖然很多，不過店員動作很快。",
        phonetic: "Páiduì de rén suīrán hěn duō, bùguò diànyuán dòngzuò hěn kuài.",
        vi: "Tuy người xếp hàng khá đông nhưng nhân viên làm nhanh tay lắm.",
        highlightTerm: "排隊",
        highlightMeaningVi: "xếp hàng",
        highlightPhonetic: "páiduì",
      },
      {
        speaker: "阿傑",
        target: "剛出爐的餅好燙，吃的時候要小心喔。",
        phonetic: "Gāng chūlú de bǐng hǎo tàng, chī de shíhòu yào xiǎoxīn ō.",
        vi: "Bánh mới ra lò nóng bỏng tay luôn, lúc ăn nhớ cẩn thận nhé.",
        highlightTerm: "剛出爐",
        highlightMeaningVi: "mới ra lò",
        highlightPhonetic: "gāng chūlú",
      },
      {
        speaker: "小美",
        target: "等一下我們再去買兩杯微糖去冰的珍珠奶茶。",
        phonetic: "Děng yīxià wǒmen zài qù mǎi liǎng bēi wéitáng qùbīng de zhēnzhū nǎichá.",
        vi: "Lát nữa tụi mình đi mua thêm hai ly trà sữa trân châu ít đường không đá nhé.",
        highlightTerm: "微糖去冰",
        highlightMeaningVi: "ít đường, không đá",
        highlightPhonetic: "wéitáng qùbīng",
      },
    ],
  },

  // =========================================================================
  // JAPANESE (ja)
  // =========================================================================
  {
    id: "ja-tokyo-station",
    languageCode: "ja",
    titleVi: "Hỏi đường tới ga tàu điện ở Tokyo",
    titleTarget: "東京駅への道を聞く",
    level: "JLPT N4",
    categoryVi: "Du lịch & Di chuyển",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "旅行者",
        target: "すみません、東京駅まで歩いて行けますか。",
        phonetic: "Sumimasen, Tōkyō-eki made aruite ikemasu ka.",
        vi: "Xin lỗi, từ đây có thể đi bộ tới ga Tokyo được không ạ?",
        highlightTerm: "歩いて",
        highlightMeaningVi: "đi bộ",
        highlightPhonetic: "aruite",
      },
      {
        speaker: "地元の人",
        target: "はい、ここから歩いて十分くらいですよ。",
        phonetic: "Hai, koko kara aruite juppun kurai desu yo.",
        vi: "Được chứ, đi bộ từ đây mất khoảng mười phút thôi.",
        highlightTerm: "くらい",
        highlightMeaningVi: "khoảng chừng, tầm",
        highlightPhonetic: "kurai",
      },
      {
        speaker: "旅行者",
        target: "どの道を行けばいいか教えていただけますか。",
        phonetic: "Dono michi o ikeba ii ka oshiete itadakemasu ka.",
        vi: "Anh/chị có thể chỉ giúp tôi nên đi đường nào được không ạ?",
        highlightTerm: "教えていただけますか",
        highlightMeaningVi: "vui lòng chỉ giúp tôi (lịch sự)",
        highlightPhonetic: "oshiete itadakemasu ka",
      },
      {
        speaker: "地元の人",
        target: "この通りをまっすぐ行って、二つ目の信号を右に曲がってください。",
        phonetic: "Kono tōri o massugu itte, futatsume no shingō o migi ni magatte kudasai.",
        vi: "Bạn cứ đi thẳng con phố này, đến đèn giao thông thứ hai thì rẽ phải nhé.",
        highlightTerm: "まっすぐ",
        highlightMeaningVi: "đi thẳng",
        highlightPhonetic: "massugu",
      },
      {
        speaker: "旅行者",
        target: "とても分かりやすいです。本当にありがとうございます！",
        phonetic: "Totemo wakariyasui desu. Hontō ni arigatō gozaimasu!",
        vi: "Rất dễ hiểu ạ. Tôi thực sự cảm ơn rất nhiều!",
        highlightTerm: "分かりやすい",
        highlightMeaningVi: "dễ hiểu, rõ ràng",
        highlightPhonetic: "wakariyasui",
      },
    ],
  },

  // =========================================================================
  // KOREAN (ko)
  // =========================================================================
  {
    id: "ko-after-work-bbq",
    languageCode: "ko",
    titleVi: "Hẹn bạn đi ăn thịt nướng sau giờ làm",
    titleTarget: "퇴근 후 삼겹살 약속",
    level: "TOPIK I–II",
    categoryVi: "Giao tiếp & Ẩm thực",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "민수",
        target: "지은 씨, 오늘 퇴근하고 시간 괜찮아요?",
        phonetic: "Jieun-ssi, oneul toegeunhago sigan gwaenchanayo?",
        vi: "Jieun ơi, hôm nay tan làm xong bạn có rảnh không?",
        highlightTerm: "퇴근하고",
        highlightMeaningVi: "sau khi tan làm",
        highlightPhonetic: "toegeunhago",
      },
      {
        speaker: "지은",
        target: "네, 여섯 시에 끝나요. 무슨 일 있어요?",
        phonetic: "Ne, yeoseot si-e kkeutnayo. Museun il isseoyo?",
        vi: "Có chứ, sáu giờ mình xong việc. Có chuyện gì thế?",
        highlightTerm: "끝나요",
        highlightMeaningVi: "kết thúc, xong việc",
        highlightPhonetic: "kkeutnayo",
      },
      {
        speaker: "민수",
        target: "회사 근처에 새로 생긴 삼겹살 맛집이 있어서 같이 가고 싶어요.",
        phonetic: "Hoesa geuncheo-e saero saenggin samgyeopsal matjib-i isseoseo gachi gago sipeoyo.",
        vi: "Gần công ty mới mở một quán thịt ba chỉ nướng ngon lắm nên mình muốn rủ bạn đi cùng.",
        highlightTerm: "맛집",
        highlightMeaningVi: "quán ăn ngon nổi tiếng",
        highlightPhonetic: "matjip",
      },
      {
        speaker: "지은",
        target: "좋아요! 요즘 일이 많아서 맛있는 걸 먹고 싶었어요.",
        phonetic: "Joayo! Yojeum ir-i manaseo masinneun geol meokgo sipeosseoyo.",
        vi: "Tuyệt luôn! Dạo này nhiều việc quá nên mình cũng thèm đi ăn món gì ngon ngon.",
        highlightTerm: "요즘",
        highlightMeaningVi: "dạo này, gần đây",
        highlightPhonetic: "yojeum",
      },
      {
        speaker: "민수",
        target: "그럼 제가 미리 예약해 둘게요. 이따가 로비에서 만나요!",
        phonetic: "Geureom jega miri yeyakhae dulgeyo. Ittaga robi-eseo mannayo!",
        vi: "Vậy để mình đặt bàn trước nhé. Lát nữa gặp nhau ở sảnh công ty nha!",
        highlightTerm: "미리 예약하다",
        highlightMeaningVi: "đặt chỗ trước",
        highlightPhonetic: "miri yeyakhada",
      },
    ],
  },

  // =========================================================================
  // FRENCH (fr)
  // =========================================================================
  {
    id: "fr-paris-bakery",
    languageCode: "fr",
    titleVi: "Mua bánh mì và cà phê sáng ở Paris",
    titleTarget: "Un matin à la boulangerie",
    level: "DELF A2",
    categoryVi: "Đời sống hàng ngày",
    durationLabel: "2 phút",
    lines: [
      {
        speaker: "Boulangère",
        target: "Bonjour ! Qu'est-ce qui vous ferait plaisir ce matin ?",
        phonetic: "/bɔ̃.ʒuʁ ! kɛs.ki vu fə.ʁɛ plɛ.ziʁ sə ma.tɛ̃/",
        vi: "Xin chào! Sáng nay bạn muốn dùng món gì nào?",
        highlightTerm: "faire plaisir",
        highlightMeaningVi: "làm hài lòng, bạn thích món gì",
        highlightPhonetic: "/fɛʁ plɛ.ziʁ/",
      },
      {
        speaker: "Lucas",
        target: "Bonjour madame, je voudrais une baguette tradition bien cuite, s'il vous plaît.",
        phonetic: "/bɔ̃.ʒuʁ ma.dam, ʒə vu.dʁɛ yn ba.ɡɛt tʁa.di.sjɔ̃ bjɛ̃ kɥit, sil vu plɛ/",
        vi: "Chào cô, cháu muốn mua một ổ bánh mì truyền thống nướng giòn một chút ạ.",
        highlightTerm: "bien cuite",
        highlightMeaningVi: "nướng chín giòn, vỏ vàng",
        highlightPhonetic: "/bjɛ̃ kɥit/",
      },
      {
        speaker: "Boulangère",
        target: "Très bien. Et avec ceci ? Nos pains au chocolat sortent tout juste du four.",
        phonetic: "/tʁɛ bjɛ̃. e a.vɛk sə.si ? no pɛ̃ o ʃɔ.kɔ.la sɔʁt tu ʒyst dy fuʁ/",
        vi: "Được ngay. Bạn có lấy thêm gì không? Bánh sô-cô-la bên cô vừa mới ra lò đấy.",
        highlightTerm: "sortent du four",
        highlightMeaningVi: "vừa mới ra lò",
        highlightPhonetic: "/sɔʁt dy fuʁ/",
      },
      {
        speaker: "Lucas",
        target: "Je vais en prendre deux, ainsi qu'un café allongé à emporter.",
        phonetic: "/ʒə vɛ ɑ̃ pʁɑ̃dʁ dø, ɛ̃.si kœ̃ ka.fe a.lɔ̃.ʒe a ɑ̃.pɔʁ.te/",
        vi: "Cháu lấy hai chiếc nhé, cùng một ly cà phê loãng mang đi ạ.",
        highlightTerm: "à emporter",
        highlightMeaningVi: "mang đi (take away)",
        highlightPhonetic: "/a ɑ̃.pɔʁ.te/",
      },
      {
        speaker: "Boulangère",
        target: "Voilà pour vous ! Ça fait six euros cinquante. Bonne journée !",
        phonetic: "/vwa.la puʁ vu ! sa fɛ si zø.ʁo sɛ̃.kɑ̃t. bɔn ʒuʁ.ne/",
        vi: "Của bạn đây! Tổng cộng hết sáu euro năm mươi xu. Chúc một ngày tốt lành!",
        highlightTerm: "Bonne journée",
        highlightMeaningVi: "Chúc một ngày tốt lành",
        highlightPhonetic: "/bɔn ʒuʁ.ne/",
      },
    ],
  },
];

export function getStoriesByLanguage(
  languageCode: LanguageCode
): BilingualStory[] {
  return BILINGUAL_STORIES.filter((s) => s.languageCode === languageCode);
}

const CJK_CHAR_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const PUNCTUATION_REGEX =
  /[.,!?;:"'“”‘’()[\]{}—–\-…¿¡。！？，、；：（）「」『』【】《》·]/g;

function normalizeToken(token: string): string {
  return token
    .normalize("NFC")
    .replace(/[’‘]/g, "'")
    .replace(PUNCTUATION_REGEX, "")
    .trim()
    .toLowerCase();
}

function tokenizeForDictation(
  text: string,
  isCjkCharacterMode: boolean
): Array<{ display: string; normalized: string }> {
  const cleaned = text.trim();
  if (!cleaned) return [];

  if (isCjkCharacterMode) {
    const chars = Array.from(cleaned);
    const result: Array<{ display: string; normalized: string }> = [];
    for (const ch of chars) {
      const norm = normalizeToken(ch);
      if (norm) {
        result.push({ display: ch, normalized: norm });
      }
    }
    return result;
  }

  const edgePunctuation =
    /^[.,!?;:"“”‘’()[\]{}—–…¿¡。！？，、；：（）「」『』【】《》·]+|[.,!?;:"“”‘’()[\]{}—–…¿¡。！？，、；：（）「」『』【】《》·]+$/g;

  return cleaned
    .split(/\s+/)
    .map((raw) => ({
      display: raw.replace(edgePunctuation, "") || raw,
      normalized: normalizeToken(raw),
    }))
    .filter((item) => item.normalized.length > 0);
}

/**
 * Computes Longest Common Subsequence (LCS) matched indices on the expected token array
 * so a single missed or extra word/character never shifts and invalidates the rest of the sentence.
 */
function computeMatchedExpectedIndices(
  expectedNorm: string[],
  userNorm: string[]
): Set<number> {
  const m = expectedNorm.length;
  const n = userNorm.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (expectedNorm[i] === userNorm[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const matched = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (expectedNorm[i] === userNorm[j]) {
      matched.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return matched;
}

/**
 * Evaluates a learner's dictation input against the expected target sentence.
 * Cleanly supports both spaced Latin/Korean sentences and unspaced CJK (Chinese/Japanese) sentences.
 */
export function evaluateDictationInput(
  userInput: string,
  expectedTarget: string
): DictationEvaluationResult {
  const isCjkCharacterMode =
    CJK_CHAR_REGEX.test(expectedTarget) &&
    expectedTarget.trim().split(/\s+/).length <= 2;

  const expectedTokens = tokenizeForDictation(
    expectedTarget,
    isCjkCharacterMode
  );
  const userTokens = tokenizeForDictation(userInput, isCjkCharacterMode);

  if (expectedTokens.length === 0) {
    return {
      accuracyPercent: 100,
      isPassed: true,
      wordDiffs: [],
    };
  }

  if (userTokens.length === 0) {
    return {
      accuracyPercent: 0,
      isPassed: false,
      wordDiffs: expectedTokens.map((t) => ({
        word: t.display,
        matched: false,
      })),
    };
  }

  const matchedSet = computeMatchedExpectedIndices(
    expectedTokens.map((t) => t.normalized),
    userTokens.map((t) => t.normalized)
  );

  const wordDiffs: DictationWordDiff[] = expectedTokens.map((t, idx) => ({
    word: t.display,
    matched: matchedSet.has(idx),
  }));

  const matchedCount = matchedSet.size;
  const accuracyPercent = Math.round(
    (matchedCount / expectedTokens.length) * 100
  );

  return {
    accuracyPercent,
    isPassed: accuracyPercent >= 80,
    wordDiffs,
  };
}
