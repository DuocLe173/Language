import { LanguageCode, VocabCard } from "@/types/language";
import { INITIAL_VOCAB_CARDS } from "@/lib/seed-data";

export interface WordGlossInfo {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningVi: string;
}

const EN_WORD_GLOSSES: Record<string, Omit<WordGlossInfo, "word">> = {
  // Pronouns & Determiners
  i: { phonetic: "/aɪ/", partOfSpeech: "đại từ", meaningVi: "tôi, mình" },
  you: { phonetic: "/juː/", partOfSpeech: "đại từ", meaningVi: "bạn, các bạn" },
  he: { phonetic: "/hiː/", partOfSpeech: "đại từ", meaningVi: "anh ấy, ông ấy" },
  she: { phonetic: "/ʃiː/", partOfSpeech: "đại từ", meaningVi: "cô ấy, chị ấy" },
  it: { phonetic: "/ɪt/", partOfSpeech: "đại từ", meaningVi: "nó, điều đó" },
  we: { phonetic: "/wiː/", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng ta" },
  they: { phonetic: "/ðeɪ/", partOfSpeech: "đại từ", meaningVi: "họ, chúng" },
  me: { phonetic: "/miː/", partOfSpeech: "đại từ", meaningVi: "tôi, mình (tân ngữ)" },
  him: { phonetic: "/hɪm/", partOfSpeech: "đại từ", meaningVi: "anh ấy (tân ngữ)" },
  her: { phonetic: "/hɜːr/", partOfSpeech: "đại từ / tính từ", meaningVi: "cô ấy; của cô ấy" },
  us: { phonetic: "/ʌs/", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng tôi" },
  them: { phonetic: "/ðem/", partOfSpeech: "đại từ", meaningVi: "họ (tân ngữ)" },
  my: { phonetic: "/maɪ/", partOfSpeech: "tính từ sở hữu", meaningVi: "của mình, của tôi" },
  your: { phonetic: "/jɔːr/", partOfSpeech: "tính từ sở hữu", meaningVi: "của bạn" },
  our: { phonetic: "/aʊər/", partOfSpeech: "tính từ sở hữu", meaningVi: "của chúng mình, của chúng ta" },
  his: { phonetic: "/hɪz/", partOfSpeech: "tính từ sở hữu", meaningVi: "của anh ấy" },
  their: { phonetic: "/ðer/", partOfSpeech: "tính từ sở hữu", meaningVi: "của họ" },
  this: { phonetic: "/ðɪs/", partOfSpeech: "từ chỉ định", meaningVi: "này, điều này" },
  that: { phonetic: "/ðæt/", partOfSpeech: "từ chỉ định", meaningVi: "đó, điều đó" },
  these: { phonetic: "/ðiːz/", partOfSpeech: "từ chỉ định", meaningVi: "những cái này" },
  those: { phonetic: "/ðoʊz/", partOfSpeech: "từ chỉ định", meaningVi: "những cái đó" },
  the: { phonetic: "/ðə/", partOfSpeech: "mạo từ", meaningVi: "(xác định danh từ đã biết)" },
  a: { phonetic: "/ə/", partOfSpeech: "mạo từ", meaningVi: "một" },
  an: { phonetic: "/æn/", partOfSpeech: "mạo từ", meaningVi: "một (trước nguyên âm)" },
  some: { phonetic: "/sʌm/", partOfSpeech: "lượng từ", meaningVi: "một ít, một vài" },
  any: { phonetic: "/ˈen.i/", partOfSpeech: "lượng từ", meaningVi: "bất kỳ, chút nào" },
  all: { phonetic: "/ɔːl/", partOfSpeech: "lượng từ", meaningVi: "tất cả, toàn bộ" },
  every: { phonetic: "/ˈev.ri/", partOfSpeech: "lượng từ", meaningVi: "mỗi, mọi" },
  enough: { phonetic: "/ɪˈnʌf/", partOfSpeech: "tính từ / phó từ", meaningVi: "đủ, đầy đủ" },
  everyone: { phonetic: "/ˈev.ri.wʌn/", partOfSpeech: "đại từ", meaningVi: "mọi người, cả nhà" },
  everything: { phonetic: "/ˈev.ri.θɪŋ/", partOfSpeech: "đại từ", meaningVi: "mọi thứ" },
  each: { phonetic: "/iːtʃ/", partOfSpeech: "lượng từ", meaningVi: "mỗi" },
  other: { phonetic: "/ˈʌð.ər/", partOfSpeech: "tính từ / đại từ", meaningVi: "khác, nhau" },

  // Prepositions & Conjunctions
  in: { phonetic: "/ɪn/", partOfSpeech: "giới từ", meaningVi: "ở trong, vào lúc" },
  on: { phonetic: "/ɑːn/", partOfSpeech: "giới từ", meaningVi: "ở trên, vào (ngày)" },
  at: { phonetic: "/æt/", partOfSpeech: "giới từ", meaningVi: "tại, ở, vào lúc" },
  to: { phonetic: "/tuː/", partOfSpeech: "giới từ", meaningVi: "đến, tới, để" },
  for: { phonetic: "/fɔːr/", partOfSpeech: "giới từ", meaningVi: "cho, dành cho, vì" },
  of: { phonetic: "/ʌv/", partOfSpeech: "giới từ", meaningVi: "của" },
  with: { phonetic: "/wɪð/", partOfSpeech: "giới từ", meaningVi: "với, cùng với" },
  about: { phonetic: "/əˈbaʊt/", partOfSpeech: "giới từ", meaningVi: "về, khoảng" },
  after: { phonetic: "/ˈæf.tər/", partOfSpeech: "giới từ", meaningVi: "sau, sau khi" },
  before: { phonetic: "/bɪˈfɔːr/", partOfSpeech: "giới từ", meaningVi: "trước, trước khi" },
  from: { phonetic: "/frʌm/", partOfSpeech: "giới từ", meaningVi: "từ" },
  through: { phonetic: "/θruː/", partOfSpeech: "giới từ", meaningVi: "xuyên qua, vượt qua" },
  and: { phonetic: "/ænd/", partOfSpeech: "liên từ", meaningVi: "và" },
  or: { phonetic: "/ɔːr/", partOfSpeech: "liên từ", meaningVi: "hoặc, hay là" },
  but: { phonetic: "/bʌt/", partOfSpeech: "liên từ", meaningVi: "nhưng" },
  so: { phonetic: "/soʊ/", partOfSpeech: "phó từ / liên từ", meaningVi: "rất, quá; vì vậy" },
  when: { phonetic: "/wen/", partOfSpeech: "liên từ / từ hỏi", meaningVi: "khi, lúc nào" },
  where: { phonetic: "/wer/", partOfSpeech: "từ hỏi", meaningVi: "ở đâu" },
  what: { phonetic: "/wʌt/", partOfSpeech: "từ hỏi", meaningVi: "cái gì, món gì" },
  how: { phonetic: "/haʊ/", partOfSpeech: "từ hỏi", meaningVi: "như thế nào, ra sao" },

  // Common Verbs & Auxiliaries
  am: { phonetic: "/æm/", partOfSpeech: "động từ to-be", meaningVi: "thì, là, ở (đi với I)" },
  is: { phonetic: "/ɪz/", partOfSpeech: "động từ to-be", meaningVi: "thì, là, ở (ngôi thứ 3 số ít)" },
  are: { phonetic: "/ɑːr/", partOfSpeech: "động từ to-be", meaningVi: "thì, là, ở (đi với you/we/they)" },
  was: { phonetic: "/wʌz/", partOfSpeech: "động từ to-be (QK)", meaningVi: "đã là, đã ở" },
  were: { phonetic: "/wɜːr/", partOfSpeech: "động từ to-be (QK)", meaningVi: "đã là, đã ở" },
  be: { phonetic: "/biː/", partOfSpeech: "động từ", meaningVi: "thì, là, trở nên" },
  being: { phonetic: "/ˈbiː.ɪŋ/", partOfSpeech: "V-ing", meaningVi: "việc đang là / vì đã..." },
  have: { phonetic: "/hæv/", partOfSpeech: "động từ", meaningVi: "có, dùng (đồ ăn/thức uống)" },
  has: { phonetic: "/hæz/", partOfSpeech: "động từ", meaningVi: "có (ngôi thứ 3 số ít)" },
  had: { phonetic: "/hæd/", partOfSpeech: "động từ (QK)", meaningVi: "đã có" },
  having: { phonetic: "/ˈhæv.ɪŋ/", partOfSpeech: "V-ing", meaningVi: "đang có, đang ăn/uống" },
  do: { phonetic: "/duː/", partOfSpeech: "động từ / trợ từ", meaningVi: "làm" },
  don: { phonetic: "/doʊnt/", partOfSpeech: "trợ từ phủ định", meaningVi: "đừng, không" },
  "don't": { phonetic: "/doʊnt/", partOfSpeech: "trợ từ phủ định", meaningVi: "đừng, không" },
  can: { phonetic: "/kæn/", partOfSpeech: "động từ khuyết thiếu", meaningVi: "có thể" },
  could: { phonetic: "/kʊd/", partOfSpeech: "động từ khuyết thiếu", meaningVi: "có thể (lịch sự)" },
  will: { phonetic: "/wɪl/", partOfSpeech: "trợ từ tương lai", meaningVi: "sẽ" },
  would: { phonetic: "/wʊd/", partOfSpeech: "động từ khuyết thiếu", meaningVi: "muốn, sẽ (lịch sự)" },
  let: { phonetic: "/let/", partOfSpeech: "động từ", meaningVi: "hãy để, cùng nhau" },
  "let's": { phonetic: "/lets/", partOfSpeech: "cấu trúc rủ", meaningVi: "hãy cùng nhau..." },
  say: { phonetic: "/seɪ/", partOfSpeech: "động từ", meaningVi: "nói, gửi lời" },
  want: { phonetic: "/wɑːnt/", partOfSpeech: "động từ", meaningVi: "muốn, mong muốn" },
  feel: { phonetic: "/fiːl/", partOfSpeech: "động từ", meaningVi: "cảm thấy" },
  felt: { phonetic: "/felt/", partOfSpeech: "động từ (QK của feel)", meaningVi: "đã cảm thấy" },
  open: { phonetic: "/ˈoʊ.pən/", partOfSpeech: "động từ / tính từ", meaningVi: "mở ra; rộng mở" },
  speak: { phonetic: "/spiːk/", partOfSpeech: "động từ", meaningVi: "nói, phát biểu" },
  meet: { phonetic: "/miːt/", partOfSpeech: "động từ", meaningVi: "gặp gỡ" },
  met: { phonetic: "/met/", partOfSpeech: "động từ (QK của meet)", meaningVi: "đã gặp" },
  drink: { phonetic: "/drɪŋk/", partOfSpeech: "động từ / danh từ", meaningVi: "uống; đồ uống" },
  drank: { phonetic: "/dræŋk/", partOfSpeech: "động từ (QK của drink)", meaningVi: "đã uống" },
  make: { phonetic: "/meɪk/", partOfSpeech: "động từ", meaningVi: "làm cho, tạo nên" },
  makes: { phonetic: "/meɪks/", partOfSpeech: "động từ", meaningVi: "làm cho, khiến cho" },
  greeted: { phonetic: "/ˈɡriː.tɪd/", partOfSpeech: "động từ (QK)", meaningVi: "đã chào đón" },
  work: { phonetic: "/wɜːrk/", partOfSpeech: "động từ / danh từ", meaningVi: "làm việc; công việc" },
  look: { phonetic: "/lʊk/", partOfSpeech: "động từ", meaningVi: "nhìn, trông có vẻ" },
  poured: { phonetic: "/pɔːrd/", partOfSpeech: "động từ (QK)", meaningVi: "đã rót (nước)" },
  like: { phonetic: "/laɪk/", partOfSpeech: "động từ", meaningVi: "thích, muốn" },
  wait: { phonetic: "/weɪt/", partOfSpeech: "động từ", meaningVi: "đợi, chờ đợi" },
  see: { phonetic: "/siː/", partOfSpeech: "động từ", meaningVi: "gặp, nhìn thấy" },
  seeing: { phonetic: "/ˈsiː.ɪŋ/", partOfSpeech: "V-ing", meaningVi: "việc gặp gỡ" },
  love: { phonetic: "/lʌv/", partOfSpeech: "động từ", meaningVi: "yêu thích" },
  loves: { phonetic: "/lʌvz/", partOfSpeech: "động từ", meaningVi: "rất thích, yêu" },
  spending: { phonetic: "/ˈspen.dɪŋ/", partOfSpeech: "V-ing", meaningVi: "dành ra (thời gian)" },
  go: { phonetic: "/ɡoʊ/", partOfSpeech: "động từ", meaningVi: "đi, xuất phát" },
  going: { phonetic: "/ˈɡoʊ.ɪŋ/", partOfSpeech: "V-ing", meaningVi: "việc đi, đang diễn ra" },
  wake: { phonetic: "/weɪk/", partOfSpeech: "động từ", meaningVi: "thức giấc (wake up)" },
  up: { phonetic: "/ʌp/", partOfSpeech: "phó từ", meaningVi: "lên, dậy" },
  take: { phonetic: "/teɪk/", partOfSpeech: "động từ", meaningVi: "lấy, dành ra" },
  lives: { phonetic: "/lɪvz/", partOfSpeech: "động từ", meaningVi: "sống, sinh sống" },
  cook: { phonetic: "/kʊk/", partOfSpeech: "động từ", meaningVi: "nấu ăn" },
  join: { phonetic: "/dʒɔɪn/", partOfSpeech: "động từ", meaningVi: "tham gia cùng" },
  know: { phonetic: "/noʊ/", partOfSpeech: "động từ", meaningVi: "biết" },
  arrived: { phonetic: "/əˈraɪvd/", partOfSpeech: "động từ (QK)", meaningVi: "đã đến nơi" },
  sit: { phonetic: "/sɪt/", partOfSpeech: "động từ", meaningVi: "ngồi (sit down = ngồi xuống)" },
  down: { phonetic: "/daʊn/", partOfSpeech: "phó từ", meaningVi: "xuống" },
  gave: { phonetic: "/ɡeɪv/", partOfSpeech: "động từ (QK của give)", meaningVi: "đã trao, đã dành cho" },
  help: { phonetic: "/help/", partOfSpeech: "động từ / danh từ", meaningVi: "giúp đỡ" },
  helps: { phonetic: "/helps/", partOfSpeech: "động từ", meaningVi: "giúp cho" },
  tell: { phonetic: "/tel/", partOfSpeech: "động từ", meaningVi: "nói, kể, báo cho" },
  call: { phonetic: "/kɔːl/", partOfSpeech: "động từ", meaningVi: "gọi điện" },
  sharing: { phonetic: "/ˈʃer.ɪŋ/", partOfSpeech: "V-ing", meaningVi: "việc chia sẻ" },
  reading: { phonetic: "/ˈriː.dɪŋ/", partOfSpeech: "danh động từ", meaningVi: "việc đọc sách" },

  // Common Nouns, Adjectives & Adverbs
  hello: { phonetic: "/həˈloʊ/", partOfSpeech: "thán từ", meaningVi: "xin chào" },
  thank: { phonetic: "/θæŋk/", partOfSpeech: "động từ", meaningVi: "cảm ơn" },
  sorry: { phonetic: "/ˈsɑː.ri/", partOfSpeech: "tính từ", meaningVi: "xin lỗi, có lỗi, tiếc" },
  please: { phonetic: "/pliːz/", partOfSpeech: "phó từ", meaningVi: "làm ơn, vui lòng" },
  friend: { phonetic: "/frend/", partOfSpeech: "danh từ", meaningVi: "người bạn" },
  friends: { phonetic: "/frendz/", partOfSpeech: "danh từ số nhiều", meaningVi: "những người bạn" },
  morning: { phonetic: "/ˈmɔːr.nɪŋ/", partOfSpeech: "danh từ", meaningVi: "buổi sáng" },
  smile: { phonetic: "/smaɪl/", partOfSpeech: "danh từ / động từ", meaningVi: "nụ cười; mỉm cười" },
  happy: { phonetic: "/ˈhæp.i/", partOfSpeech: "tính từ", meaningVi: "vui vẻ, hạnh phúc" },
  water: { phonetic: "/ˈwɔː.tər/", partOfSpeech: "danh từ", meaningVi: "nước uống" },
  today: { phonetic: "/təˈdeɪ/", partOfSpeech: "danh từ / phó từ", meaningVi: "hôm nay" },
  tomorrow: { phonetic: "/təˈmɔːr.oʊ/", partOfSpeech: "danh từ / phó từ", meaningVi: "ngày mai" },
  tonight: { phonetic: "/təˈnaɪt/", partOfSpeech: "phó từ", meaningVi: "tối nay" },
  dear: { phonetic: "/dɪr/", partOfSpeech: "tính từ", meaningVi: "thân mến, yêu quý" },
  mistake: { phonetic: "/mɪˈsteɪk/", partOfSpeech: "danh từ", meaningVi: "lỗi, sự nhầm lẫn" },
  accident: { phonetic: "/ˈæk.sə.dənt/", partOfSpeech: "danh từ", meaningVi: "sự cố vô tình, tai nạn" },
  teacher: { phonetic: "/ˈtiː.tʃər/", partOfSpeech: "danh từ", meaningVi: "giáo viên, thầy/cô giáo" },
  class: { phonetic: "/klæs/", partOfSpeech: "danh từ", meaningVi: "lớp học, buổi học" },
  window: { phonetic: "/ˈwɪn.doʊ/", partOfSpeech: "danh từ", meaningVi: "cửa sổ" },
  little: { phonetic: "/ˈlɪt.əl/", partOfSpeech: "tính từ / phó từ", meaningVi: "một chút, nhỏ" },
  slower: { phonetic: "/ˈsloʊ.ər/", partOfSpeech: "tính từ so sánh hơn", meaningVi: "chậm hơn" },
  very: { phonetic: "/ˈver.i/", partOfSpeech: "phó từ", meaningVi: "rất, lắm" },
  kind: { phonetic: "/kaɪnd/", partOfSpeech: "tính từ", meaningVi: "tốt bụng, tử tế" },
  old: { phonetic: "/oʊld/", partOfSpeech: "tính từ", meaningVi: "cũ, lâu năm, già" },
  new: { phonetic: "/nuː/", partOfSpeech: "tính từ", meaningVi: "mới" },
  coffee: { phonetic: "/ˈkɔː.fi/", partOfSpeech: "danh từ", meaningVi: "cà phê" },
  shop: { phonetic: "/ʃɑːp/", partOfSpeech: "danh từ", meaningVi: "cửa hàng, quán" },
  park: { phonetic: "/pɑːrk/", partOfSpeech: "danh từ", meaningVi: "công viên" },
  quiet: { phonetic: "/ˈkwaɪ.ət/", partOfSpeech: "tính từ", meaningVi: "yên tĩnh" },
  warm: { phonetic: "/wɔːrm/", partOfSpeech: "tính từ", meaningVi: "ấm áp, nồng hậu" },
  big: { phonetic: "/bɪɡ/", partOfSpeech: "tính từ", meaningVi: "lớn, thật tươi (nụ cười)" },
  children: { phonetic: "/ˈtʃɪl.drən/", partOfSpeech: "danh từ số nhiều", meaningVi: "trẻ em, lũ trẻ" },
  garden: { phonetic: "/ˈɡɑːr.dən/", partOfSpeech: "danh từ", meaningVi: "khu vườn" },
  day: { phonetic: "/deɪ/", partOfSpeech: "danh từ", meaningVi: "ngày" },
  glass: { phonetic: "/ɡlæs/", partOfSpeech: "danh từ", meaningVi: "cốc, ly thủy tinh" },
  cold: { phonetic: "/koʊld/", partOfSpeech: "tính từ", meaningVi: "lạnh, mát" },
  great: { phonetic: "/ɡreɪt/", partOfSpeech: "tính từ", meaningVi: "tuyệt vời, rất hay" },
  lesson: { phonetic: "/ˈles.ən/", partOfSpeech: "danh từ", meaningVi: "bài học" },
  late: { phonetic: "/leɪt/", partOfSpeech: "tính từ / phó từ", meaningVi: "muộn, trễ" },
  best: { phonetic: "/best/", partOfSpeech: "tính từ so sánh nhất", meaningVi: "tốt nhất, thân nhất" },
  good: { phonetic: "/ɡʊd/", partOfSpeech: "tính từ", meaningVi: "tốt, đẹp" },
  lovely: { phonetic: "/ˈlʌv.li/", partOfSpeech: "tính từ", meaningVi: "dễ thương, đáng yêu" },
  much: { phonetic: "/mʌtʃ/", partOfSpeech: "phó từ / lượng từ", meaningVi: "nhiều" },
  always: { phonetic: "/ˈɔːl.weɪz/", partOfSpeech: "phó từ", meaningVi: "luôn luôn" },
  just: { phonetic: "/dʒʌst/", partOfSpeech: "phó từ", meaningVi: "chỉ là, vừa mới" },
  together: { phonetic: "/təˈɡeð.ər/", partOfSpeech: "phó từ", meaningVi: "cùng nhau" },
  welcome: { phonetic: "/ˈwel.kəm/", partOfSpeech: "động từ / tính từ", meaningVi: "chào mừng, đón chào" },
  family: { phonetic: "/ˈfæm.əl.i/", partOfSpeech: "danh từ", meaningVi: "gia đình" },
  dinner: { phonetic: "/ˈdɪn.ər/", partOfSpeech: "danh từ", meaningVi: "bữa tối" },
  ready: { phonetic: "/ˈred.i/", partOfSpeech: "tính từ", meaningVi: "sẵn sàng" },
  listen: { phonetic: "/ˈlɪs.ən/", partOfSpeech: "động từ", meaningVi: "lắng nghe" },
  share: { phonetic: "/ʃer/", partOfSpeech: "động từ", meaningVi: "chia sẻ" },
  busy: { phonetic: "/ˈbɪz.i/", partOfSpeech: "tính từ", meaningVi: "bận rộn" },
  early: { phonetic: "/ˈɜːr.li/", partOfSpeech: "tính từ / phó từ", meaningVi: "sớm" },
  agree: { phonetic: "/əˈɡriː/", partOfSpeech: "động từ", meaningVi: "đồng ý" },
  relax: { phonetic: "/rɪˈlæks/", partOfSpeech: "động từ", meaningVi: "thư giãn" },
  house: { phonetic: "/haʊs/", partOfSpeech: "danh từ", meaningVi: "ngôi nhà" },
  gate: { phonetic: "/ɡeɪt/", partOfSpeech: "danh từ", meaningVi: "cánh cổng" },
  peaceful: { phonetic: "/ˈpiːs.fəl/", partOfSpeech: "tính từ", meaningVi: "yên bình" },
  city: { phonetic: "/ˈsɪt.i/", partOfSpeech: "danh từ", meaningVi: "thành phố" },
  delicious: { phonetic: "/dɪˈlɪʃ.əs/", partOfSpeech: "tính từ", meaningVi: "thơm ngon" },
  trip: { phonetic: "/trɪp/", partOfSpeech: "danh từ", meaningVi: "chuyến đi" },
  now: { phonetic: "/naʊ/", partOfSpeech: "phó từ", meaningVi: "bây giờ" },
  carefully: { phonetic: "/ˈker.fəl.i/", partOfSpeech: "phó từ", meaningVi: "một cách cẩn thận, kỹ lưỡng" },
  speaker: { phonetic: "/ˈspiː.kər/", partOfSpeech: "danh từ", meaningVi: "người nói, diễn giả" },
  table: { phonetic: "/ˈteɪ.bəl/", partOfSpeech: "danh từ", meaningVi: "chiếc bàn" },
  books: { phonetic: "/bʊks/", partOfSpeech: "danh từ số nhiều", meaningVi: "những cuốn sách" },
  week: { phonetic: "/wiːk/", partOfSpeech: "danh từ", meaningVi: "tuần lễ" },
  restaurant: { phonetic: "/ˈres.tə.rɑːnt/", partOfSpeech: "danh từ", meaningVi: "nhà hàng" },
  sunday: { phonetic: "/ˈsʌn.deɪ/", partOfSpeech: "danh từ", meaningVi: "Chủ Nhật" },
  nights: { phonetic: "/naɪts/", partOfSpeech: "danh từ", meaningVi: "những buổi tối" },
  station: { phonetic: "/ˈsteɪ.ʃən/", partOfSpeech: "danh từ", meaningVi: "nhà ga" },
  bed: { phonetic: "/bed/", partOfSpeech: "danh từ", meaningVi: "giường ngủ" },
  health: { phonetic: "/helθ/", partOfSpeech: "danh từ", meaningVi: "sức khỏe" },
  plan: { phonetic: "/plæn/", partOfSpeech: "danh từ", meaningVi: "kế hoạch" },
  daily: { phonetic: "/ˈdeɪ.li/", partOfSpeech: "tính từ", meaningVi: "hàng ngày" },
  practice: { phonetic: "/ˈpræk.tɪs/", partOfSpeech: "danh từ / động từ", meaningVi: "sự luyện tập" },
  key: { phonetic: "/kiː/", partOfSpeech: "danh từ / tính từ", meaningVi: "chìa khóa, yếu tố cốt lõi" },
  few: { phonetic: "/fjuː/", partOfSpeech: "lượng từ", meaningVi: "một vài (a few)" },
  minutes: { phonetic: "/ˈmɪn.ɪts/", partOfSpeech: "danh từ số nhiều", meaningVi: "phút" },
  cup: { phonetic: "/kʌp/", partOfSpeech: "danh từ", meaningVi: "tách, cốc" },
  tea: { phonetic: "/tiː/", partOfSpeech: "danh từ", meaningVi: "trà" },
  team: { phonetic: "/tiːm/", partOfSpeech: "danh từ", meaningVi: "đội, nhóm" },
  time: { phonetic: "/taɪm/", partOfSpeech: "danh từ", meaningVi: "thời gian" },
  music: { phonetic: "/ˈmjuː.zɪk/", partOfSpeech: "danh từ", meaningVi: "âm nhạc" },
  night: { phonetic: "/naɪt/", partOfSpeech: "danh từ", meaningVi: "buổi tối, ban đêm" },
  story: { phonetic: "/ˈstɔːr.i/", partOfSpeech: "danh từ", meaningVi: "câu chuyện" },
  afternoon: { phonetic: "/ˌæf.tərˈnuːn/", partOfSpeech: "danh từ", meaningVi: "buổi chiều" },
  totally: { phonetic: "/ˈtoʊ.təl.i/", partOfSpeech: "phó từ", meaningVi: "hoàn toàn" },
  jack: { phonetic: "/dʒæk/", partOfSpeech: "tên riêng", meaningVi: "Jack (tên người)" },
  anna: { phonetic: "/ˈæn.ə/", partOfSpeech: "tên riêng", meaningVi: "Anna (tên người)" },
};

const ZH_WORD_GLOSSES: Record<string, Omit<WordGlossInfo, "word">> = {
  "老师": { phonetic: "lǎo shī", partOfSpeech: "danh từ", meaningVi: "thầy/cô giáo" },
  "你好": { phonetic: "nǐ hǎo", partOfSpeech: "câu chào", meaningVi: "xin chào" },
  "请问": { phonetic: "qǐng wèn", partOfSpeech: "động từ", meaningVi: "xin hỏi" },
  "现在": { phonetic: "xiàn zài", partOfSpeech: "danh từ", meaningVi: "bây giờ" },
  "可以": { phonetic: "kě yǐ", partOfSpeech: "động từ năng nguyện", meaningVi: "có thể, được phép" },
  "进去": { phonetic: "jìn qù", partOfSpeech: "động từ", meaningVi: "đi vào trong" },
  "吗": { phonetic: "ma", partOfSpeech: "trợ từ nghi vấn", meaningVi: "không? / chưa?" },
  "谢谢": { phonetic: "xiè xie", partOfSpeech: "động từ", meaningVi: "cảm ơn" },
  "你": { phonetic: "nǐ", partOfSpeech: "đại từ", meaningVi: "bạn" },
  "我": { phonetic: "wǒ", partOfSpeech: "đại từ", meaningVi: "tôi, mình" },
  "他": { phonetic: "tā", partOfSpeech: "đại từ", meaningVi: "anh ấy" },
  "她": { phonetic: "tā", partOfSpeech: "đại từ", meaningVi: "cô ấy" },
  "我们": { phonetic: "wǒ men", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng ta" },
  "今天": { phonetic: "jīn tiān", partOfSpeech: "danh từ", meaningVi: "hôm nay" },
  "明天": { phonetic: "míng tiān", partOfSpeech: "danh từ", meaningVi: "ngày mai" },
  "陪": { phonetic: "péi", partOfSpeech: "động từ", meaningVi: "đồng hành, cùng với" },
  "一起": { phonetic: "yī qǐ", partOfSpeech: "phó từ", meaningVi: "cùng nhau" },
  "练习": { phonetic: "liàn xí", partOfSpeech: "động từ", meaningVi: "luyện tập" },
  "中文": { phonetic: "Zhōng wén", partOfSpeech: "danh từ", meaningVi: "tiếng Trung" },
  "对不起": { phonetic: "duì bu qǐ", partOfSpeech: "thán từ", meaningVi: "xin lỗi" },
  "朋友": { phonetic: "péng you", partOfSpeech: "danh từ", meaningVi: "bạn bè" },
  "高兴": { phonetic: "gāo xìng", partOfSpeech: "tính từ", meaningVi: "vui vẻ, phấn khởi" },
  "喝水": { phonetic: "hē shuǐ", partOfSpeech: "động từ", meaningVi: "uống nước" },
  "喜欢": { phonetic: "xǐ huan", partOfSpeech: "động từ", meaningVi: "thích, yêu thích" },
  "休息": { phonetic: "xiū xi", partOfSpeech: "động từ", meaningVi: "nghỉ ngơi" },
  "再见": { phonetic: "zài jiàn", partOfSpeech: "động từ", meaningVi: "tạm biệt" },
  "天气": { phonetic: "tiān qì", partOfSpeech: "danh từ", meaningVi: "thời tiết" },
  "真好": { phonetic: "zhēn hǎo", partOfSpeech: "tính từ", meaningVi: "thật đẹp, thật tốt" },
  "很": { phonetic: "hěn", partOfSpeech: "phó từ", meaningVi: "rất" },
  "非常": { phonetic: "fēi cháng", partOfSpeech: "phó từ", meaningVi: "vô cùng, cực kỳ" },
  "的": { phonetic: "de", partOfSpeech: "trợ từ kết cấu", meaningVi: "của / (nối định ngữ)" },
  "了": { phonetic: "le", partOfSpeech: "trợ từ ngữ khí", meaningVi: "rồi, đã" },
  "吧": { phonetic: "ba", partOfSpeech: "trợ từ cuối câu", meaningVi: "nhé, đi nào" },
  "在": { phonetic: "zài", partOfSpeech: "giới từ / phó từ", meaningVi: "ở tại; đang" },
  "和": { phonetic: "hé", partOfSpeech: "liên từ", meaningVi: "và, cùng với" },
  "去": { phonetic: "qù", partOfSpeech: "động từ", meaningVi: "đi, đến" },
  "工作": { phonetic: "gōng zuò", partOfSpeech: "danh từ / động từ", meaningVi: "công việc; làm việc" },
  "学习": { phonetic: "xué xí", partOfSpeech: "động từ", meaningVi: "học tập" },
  "这个": { phonetic: "zhè ge", partOfSpeech: "đại từ chỉ định", meaningVi: "cái này, điều này" },
  "大家": { phonetic: "dà jiā", partOfSpeech: "đại từ", meaningVi: "mọi người" },
  "每天": { phonetic: "měi tiān", partOfSpeech: "danh từ", meaningVi: "mỗi ngày" },
};

const JA_WORD_GLOSSES: Record<string, Omit<WordGlossInfo, "word">> = {
  "私": { phonetic: "watashi", partOfSpeech: "đại từ", meaningVi: "tôi, mình" },
  "私たち": { phonetic: "watashitachi", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng tôi" },
  "今日": { phonetic: "kyō", partOfSpeech: "danh từ", meaningVi: "hôm nay" },
  "明日": { phonetic: "ashita", partOfSpeech: "danh từ", meaningVi: "ngày mai" },
  "毎日": { phonetic: "mainichi", partOfSpeech: "danh từ", meaningVi: "mỗi ngày" },
  "とても": { phonetic: "totemo", partOfSpeech: "phó từ", meaningVi: "rất, lắm" },
  "一緒": { phonetic: "issho", partOfSpeech: "danh từ", meaningVi: "cùng nhau" },
  "友達": { phonetic: "tomodachi", partOfSpeech: "danh từ", meaningVi: "người bạn" },
  "先生": { phonetic: "sensei", partOfSpeech: "danh từ", meaningVi: "thầy/cô giáo" },
  "仕事": { phonetic: "shigoto", partOfSpeech: "danh từ", meaningVi: "công việc" },
  "勉強": { phonetic: "benkyō", partOfSpeech: "danh từ / động từ", meaningVi: "việc học tập" },
  "です": { phonetic: "desu", partOfSpeech: "trợ động từ lịch sự", meaningVi: "thì, là (lịch sự)" },
  "ます": { phonetic: "masu", partOfSpeech: "đuôi động từ lịch sự", meaningVi: "(đuôi lịch sự hiện tại/tương lai)" },
  "は": { phonetic: "wa", partOfSpeech: "trợ từ chủ đề", meaningVi: "thì, về phần" },
  "を": { phonetic: "o", partOfSpeech: "trợ từ tân ngữ", meaningVi: "(đánh dấu tân ngữ)" },
  "に": { phonetic: "ni", partOfSpeech: "trợ từ", meaningVi: "vào lúc, ở tại, đến" },
  "で": { phonetic: "de", partOfSpeech: "trợ từ", meaningVi: "tại (nơi chốn), bằng (phương tiện)" },
  "の": { phonetic: "no", partOfSpeech: "trợ từ sở hữu", meaningVi: "của" },
  "と": { phonetic: "to", partOfSpeech: "trợ từ", meaningVi: "và, cùng với" },
};

const KO_WORD_GLOSSES: Record<string, Omit<WordGlossInfo, "word">> = {
  "저는": { phonetic: "jeo-neun", partOfSpeech: "đại từ", meaningVi: "tôi, mình (lịch sự)" },
  "나는": { phonetic: "na-neun", partOfSpeech: "đại từ", meaningVi: "mình, tớ" },
  "우리는": { phonetic: "u-ri-neun", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng ta" },
  "오늘": { phonetic: "o-neul", partOfSpeech: "danh từ", meaningVi: "hôm nay" },
  "내일": { phonetic: "nae-il", partOfSpeech: "danh từ", meaningVi: "ngày mai" },
  "매일": { phonetic: "mae-il", partOfSpeech: "phó từ", meaningVi: "mỗi ngày" },
  "정말": { phonetic: "jeong-mal", partOfSpeech: "phó từ", meaningVi: "thật sự, rất" },
  "아주": { phonetic: "a-ju", partOfSpeech: "phó từ", meaningVi: "rất, vô cùng" },
  "함께": { phonetic: "ham-kke", partOfSpeech: "phó từ", meaningVi: "cùng nhau" },
  "같이": { phonetic: "ga-chi", partOfSpeech: "phó từ", meaningVi: "cùng với nhau" },
  "친구": { phonetic: "chin-gu", partOfSpeech: "danh từ", meaningVi: "người bạn" },
  "선생님": { phonetic: "seon-saeng-nim", partOfSpeech: "danh từ", meaningVi: "thầy/cô giáo" },
};

const FR_WORD_GLOSSES: Record<string, Omit<WordGlossInfo, "word">> = {
  "je": { phonetic: "/ʒə/", partOfSpeech: "đại từ", meaningVi: "tôi, mình" },
  "tu": { phonetic: "/ty/", partOfSpeech: "đại từ", meaningVi: "bạn" },
  "il": { phonetic: "/il/", partOfSpeech: "đại từ", meaningVi: "anh ấy" },
  "elle": { phonetic: "/ɛl/", partOfSpeech: "đại từ", meaningVi: "cô ấy" },
  "nous": { phonetic: "/nu/", partOfSpeech: "đại từ", meaningVi: "chúng mình, chúng tôi" },
  "vous": { phonetic: "/vu/", partOfSpeech: "đại từ", meaningVi: "bạn (lịch sự), các bạn" },
  "ils": { phonetic: "/il/", partOfSpeech: "đại từ", meaningVi: "họ" },
  "le": { phonetic: "/lə/", partOfSpeech: "mạo từ xác định", meaningVi: "(giống đực số ít)" },
  "la": { phonetic: "/la/", partOfSpeech: "mạo từ xác định", meaningVi: "(giống cái số ít)" },
  "les": { phonetic: "/le/", partOfSpeech: "mạo từ số nhiều", meaningVi: "những, các" },
  "un": { phonetic: "/œ̃/", partOfSpeech: "mạo từ", meaningVi: "một (giống đực)" },
  "une": { phonetic: "/yn/", partOfSpeech: "mạo từ", meaningVi: "một (giống cái)" },
  "de": { phonetic: "/də/", partOfSpeech: "giới từ", meaningVi: "của, từ" },
  "dans": { phonetic: "/dɑ̃/", partOfSpeech: "giới từ", meaningVi: "ở trong" },
  "avec": { phonetic: "/a.vɛk/", partOfSpeech: "giới từ", meaningVi: "với, cùng với" },
  "pour": { phonetic: "/puʁ/", partOfSpeech: "giới từ", meaningVi: "cho, để" },
  "est": { phonetic: "/ɛ/", partOfSpeech: "động từ être", meaningVi: "thì, là, ở" },
  "sont": { phonetic: "/sɔ̃/", partOfSpeech: "động từ être", meaningVi: "thì, là (số nhiều)" },
  "très": { phonetic: "/tʁɛ/", partOfSpeech: "phó từ", meaningVi: "rất, lắm" },
  "toujours": { phonetic: "/tu.ʒuʁ/", partOfSpeech: "phó từ", meaningVi: "luôn luôn" },
  "aujourd'hui": { phonetic: "/o.ʒuʁ.dɥi/", partOfSpeech: "phó từ", meaningVi: "hôm nay" },
};

/**
 * Smartly segments a sentence into interactive hoverable tokens.
 * For spaced languages (en, ko, fr), splits by whitespace.
 * For unspaced CJK languages (zh-CN, zh-TW, ja), greedily matches known vocabulary terms and glosses first,
 * then groups remaining characters into natural 2-char / 1-char tokens so every word in the sentence is hoverable!
 */
export function segmentSentenceIntoTokens(
  sentence: string,
  languageCode: LanguageCode,
  allCards: VocabCard[] = []
): string[] {
  const trimmed = sentence.trim();
  if (!trimmed) return [];

  if (
    languageCode !== "zh-CN" &&
    languageCode !== "zh-TW" &&
    languageCode !== "ja"
  ) {
    return trimmed.split(/\s+/).filter(Boolean);
  }

  // If the sentence already contains spaces (e.g. a cloze blank "______" with spaces), preserve blanks
  const combinedCards =
    allCards.length > 0 ? allCards : INITIAL_VOCAB_CARDS;
  const knownTerms = new Set<string>();

  for (const c of combinedCards) {
    if (
      c.languageCode === languageCode ||
      ((languageCode === "zh-CN" || languageCode === "zh-TW") &&
        (c.languageCode === "zh-CN" || c.languageCode === "zh-TW"))
    ) {
      if (c.term) knownTerms.add(c.term.trim());
      if (c.traditionalTerm) knownTerms.add(c.traditionalTerm.trim());
    }
  }

  Object.keys(ZH_WORD_GLOSSES).forEach((k) => knownTerms.add(k));
  Object.keys(JA_WORD_GLOSSES).forEach((k) => knownTerms.add(k));

  const chars = Array.from(trimmed);
  const tokens: string[] = [];
  let i = 0;

  while (i < chars.length) {
    // Skip whitespace
    if (/\s/.test(chars[i])) {
      i++;
      continue;
    }

    // Check for cloze blank "______"
    if (chars[i] === "_") {
      let endBlank = i;
      while (endBlank < chars.length && chars[endBlank] === "_") {
        endBlank++;
      }
      tokens.push(chars.slice(i, endBlank).join(""));
      i = endBlank;
      continue;
    }

    // Punctuation standalone
    if (/[。！？，、.,!?;:"'“”‘’（）()「」]/.test(chars[i])) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1] += chars[i];
      } else {
        tokens.push(chars[i]);
      }
      i++;
      continue;
    }

    // Greedy match from 5 characters down to 2 characters against knownTerms
    let matchedLen = 0;
    for (let len = Math.min(5, chars.length - i); len >= 2; len--) {
      const candidate = chars.slice(i, i + len).join("");
      if (knownTerms.has(candidate)) {
        matchedLen = len;
        break;
      }
    }

    if (matchedLen > 0) {
      tokens.push(chars.slice(i, i + matchedLen).join(""));
      i += matchedLen;
    } else if (
      i + 1 < chars.length &&
      !/[。！？，、.,!?;:_]/.test(chars[i + 1]) &&
      !knownTerms.has(chars[i]) &&
      !knownTerms.has(chars[i + 1])
    ) {
      tokens.push(chars.slice(i, i + 2).join(""));
      i += 2;
    } else {
      tokens.push(chars[i]);
      i += 1;
    }
  }

  return tokens;
}

/**
 * Looks up the pronunciation and Vietnamese meaning of any single word or tile token.
 */
export function lookupWordGloss(
  rawToken: string,
  languageCode: LanguageCode,
  allCards: VocabCard[] = []
): WordGlossInfo | null {
  const cleaned = rawToken
    .replace(/[.,!?;:"'“”‘’()[\]—–-。！？，、（）「」]/g, "")
    .trim();

  if (!cleaned || /^_+$/.test(cleaned)) {
    return null;
  }

  const lower = cleaned.toLowerCase();
  const pool =
    allCards.length > 0
      ? [...allCards, ...INITIAL_VOCAB_CARDS]
      : INITIAL_VOCAB_CARDS;

  // 1. Exact match in vocabulary pool
  const matchedCard = pool.find(
    (c) =>
      (c.languageCode === languageCode ||
        ((languageCode === "zh-CN" || languageCode === "zh-TW") &&
          (c.languageCode === "zh-CN" || c.languageCode === "zh-TW"))) &&
      (c.term.toLowerCase() === lower ||
        c.traditionalTerm?.toLowerCase() === lower)
  );
  if (matchedCard) {
    return {
      word: cleaned,
      phonetic: matchedCard.phonetic,
      partOfSpeech: matchedCard.partOfSpeech,
      meaningVi: matchedCard.meaningVi,
    };
  }

  // 2. Language-specific core glossaries
  if (languageCode === "en") {
    if (EN_WORD_GLOSSES[lower]) {
      return { word: cleaned, ...EN_WORD_GLOSSES[lower] };
    }
    if (lower.endsWith("s") && EN_WORD_GLOSSES[lower.slice(0, -1)]) {
      const base = EN_WORD_GLOSSES[lower.slice(0, -1)];
      return {
        word: cleaned,
        phonetic: base.phonetic,
        partOfSpeech: base.partOfSpeech,
        meaningVi: base.meaningVi,
      };
    }
    if (lower.endsWith("ed") && EN_WORD_GLOSSES[lower.slice(0, -2)]) {
      const base = EN_WORD_GLOSSES[lower.slice(0, -2)];
      return {
        word: cleaned,
        phonetic: base.phonetic,
        partOfSpeech: `${base.partOfSpeech} (quá khứ)`,
        meaningVi: `đã ${base.meaningVi}`,
      };
    }
  }

  if (languageCode === "zh-CN" || languageCode === "zh-TW") {
    if (ZH_WORD_GLOSSES[cleaned]) {
      return { word: cleaned, ...ZH_WORD_GLOSSES[cleaned] };
    }
  }

  if (languageCode === "ja") {
    if (JA_WORD_GLOSSES[cleaned]) {
      return { word: cleaned, ...JA_WORD_GLOSSES[cleaned] };
    }
  }

  if (languageCode === "ko") {
    if (KO_WORD_GLOSSES[cleaned]) {
      return { word: cleaned, ...KO_WORD_GLOSSES[cleaned] };
    }
    // Strip common Korean particles (은/는/이/가/을/를/에/에서/도) to match stem in pool
    const strippedKo = cleaned.replace(/(은|는|이|가|을|를|에서|에게|에|도|와|과)$/, "");
    if (strippedKo && strippedKo !== cleaned) {
      if (KO_WORD_GLOSSES[strippedKo]) {
        return { word: cleaned, ...KO_WORD_GLOSSES[strippedKo] };
      }
      const koStemCard = pool.find(
        (c) =>
          c.languageCode === "ko" &&
          (c.term === strippedKo || c.term.startsWith(strippedKo))
      );
      if (koStemCard) {
        return {
          word: cleaned,
          phonetic: koStemCard.phonetic,
          partOfSpeech: koStemCard.partOfSpeech,
          meaningVi: koStemCard.meaningVi,
        };
      }
    }
  }

  if (languageCode === "fr") {
    if (FR_WORD_GLOSSES[lower]) {
      return { word: cleaned, ...FR_WORD_GLOSSES[lower] };
    }
    // Handle French elision (l'ami, d'eau, j'aime)
    if (lower.includes("'")) {
      const afterApostrophe = lower.split("'").pop() || "";
      if (afterApostrophe) {
        if (FR_WORD_GLOSSES[afterApostrophe]) {
          return { word: cleaned, ...FR_WORD_GLOSSES[afterApostrophe] };
        }
        const frCard = pool.find(
          (c) =>
            c.languageCode === "fr" &&
            c.term.toLowerCase().includes(afterApostrophe)
        );
        if (frCard) {
          return {
            word: cleaned,
            phonetic: frCard.phonetic,
            partOfSpeech: frCard.partOfSpeech,
            meaningVi: frCard.meaningVi,
          };
        }
      }
    }
  }

  // 3. Partial / Substring match inside the 800-card pool for the current language
  const partialCard = pool.find(
    (c) =>
      (c.languageCode === languageCode ||
        ((languageCode === "zh-CN" || languageCode === "zh-TW") &&
          (c.languageCode === "zh-CN" || c.languageCode === "zh-TW"))) &&
      cleaned.length >= 2 &&
      (c.term.toLowerCase().includes(lower) ||
        lower.includes(c.term.toLowerCase()))
  );
  if (partialCard) {
    return {
      word: cleaned,
      phonetic: partialCard.phonetic,
      partOfSpeech: partialCard.partOfSpeech,
      meaningVi: partialCard.meaningVi,
    };
  }

  // 4. Universal fallback with click-to-listen
  return {
    word: cleaned,
    phonetic: "Bấm loa để nghe phát âm",
    partOfSpeech: "từ trong câu",
    meaningVi: "Chạm hoặc bấm biểu tượng loa để nghe phát âm chuẩn bản xứ",
  };
}

