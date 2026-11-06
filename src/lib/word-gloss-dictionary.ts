import { LanguageCode, VocabCard } from "@/types/language";

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
};

/**
 * Looks up the pronunciation and Vietnamese meaning of any single word or tile token.
 */
export function lookupWordGloss(
  rawToken: string,
  languageCode: LanguageCode,
  allCards: VocabCard[] = []
): WordGlossInfo | null {
  const cleaned = rawToken
    .replace(/[.,!?;:"'“”‘’()[\]—–-。！？，、]/g, "")
    .trim();

  if (!cleaned || /^_+$/.test(cleaned)) {
    return null;
  }

  const lower = cleaned.toLowerCase();

  // 1. Check user's active vocabulary cards first
  const matchedCard = allCards.find(
    (c) =>
      c.languageCode === languageCode &&
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

  // 2. Check English micro-dictionary
  if (languageCode === "en") {
    if (EN_WORD_GLOSSES[lower]) {
      return {
        word: cleaned,
        ...EN_WORD_GLOSSES[lower],
      };
    }
    // Check base stems (-s, -ed, -ing)
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

  // 3. Check Chinese micro-dictionary
  if (languageCode === "zh-CN" || languageCode === "zh-TW") {
    if (ZH_WORD_GLOSSES[cleaned]) {
      return {
        word: cleaned,
        ...ZH_WORD_GLOSSES[cleaned],
      };
    }
    // Partial match inside user cards
    const partialCard = allCards.find(
      (c) =>
        (c.languageCode === "zh-CN" || c.languageCode === "zh-TW") &&
        (c.term.includes(cleaned) || cleaned.includes(c.term))
    );
    if (partialCard) {
      return {
        word: partialCard.term,
        phonetic: partialCard.phonetic,
        partOfSpeech: partialCard.partOfSpeech,
        meaningVi: partialCard.meaningVi,
      };
    }
  }

  // 4. Universal fallback so every hovered word shows a helpful phonetic/audio card
  return {
    word: cleaned,
    phonetic: "Bấm loa để nghe phát âm",
    partOfSpeech: "từ trong câu",
    meaningVi: "Di chuột và bấm biểu tượng loa để nghe cách đọc chuẩn của từ này",
  };
}

