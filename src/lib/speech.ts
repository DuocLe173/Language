import { LANGUAGES } from "@/lib/seed-data";
import { LanguageCode } from "@/types/language";

/**
 * Scores available browser SpeechSynthesis voices to prioritize high-quality
 * Natural / Online / Neural / Google / Apple / Microsoft voices over legacy robotic voices.
 */
function pickBestNativeVoice(
  voices: SpeechSynthesisVoice[],
  targetBcp47: string
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  const targetLower = targetBcp47.toLowerCase();
  const langPrefix = targetLower.slice(0, 2);

  const candidates = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang === targetLower || vLang.startsWith(langPrefix);
  });

  if (candidates.length === 0) return undefined;

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const vLang = v.lang.toLowerCase().replace("_", "-");
    const name = v.name.toLowerCase();

    // Exact locale match (e.g. zh-CN vs zh-TW, fr-FR, en-US)
    if (vLang === targetLower) {
      score += 50;
    }

    // High-quality Neural / Natural / Online voices
    if (name.includes("natural")) score += 40;
    if (name.includes("online")) score += 35;
    if (name.includes("neural")) score += 35;
    if (name.includes("google")) score += 30;
    if (name.includes("premium") || name.includes("enhanced")) score += 25;
    if (name.includes("siri")) score += 25;

    // Well-known expressive regional voices across Windows/macOS/Chrome
    if (
      name.includes("aria") ||
      name.includes("jenny") ||
      name.includes("guy") ||
      name.includes("samantha") ||
      name.includes("xiaoxiao") ||
      name.includes("yunxi") ||
      name.includes("hsiaochen") ||
      name.includes("nanami") ||
      name.includes("kyoko") ||
      name.includes("sunhi") ||
      name.includes("yuna") ||
      name.includes("denise") ||
      name.includes("amelie") ||
      name.includes("thomas")
    ) {
      score += 20;
    }

    if (!v.localService) {
      score += 10;
    }

    return score;
  };

  return [...candidates].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

export function speakText(
  text: string,
  languageCode: LanguageCode,
  rate: number = 0.92
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const cleanText = text.replace(/______/g, "...").trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const targetBcp47 = LANGUAGES[languageCode]?.speechLang || "en-US";
  utterance.lang = targetBcp47;
  utterance.rate = rate;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const bestVoice = pickBestNativeVoice(voices, targetBcp47);

  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export interface SpeechRecognitionHandle {
  stop: () => void;
}

export function startVoiceRecognition(
  languageCode: LanguageCode,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (errMessage: string) => void,
  onEnd: () => void
): SpeechRecognitionHandle | null {
  if (typeof window === "undefined") return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionImpl =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionImpl) {
    onError(
      "Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói (Hãy thử Chrome hoặc Edge)."
    );
    return null;
  }

  const recognition = new SpeechRecognitionImpl();
  recognition.lang = LANGUAGES[languageCode]?.speechLang || "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += piece;
      } else {
        interimTranscript += piece;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    if (event.error !== "no-speech" && event.error !== "aborted") {
      onError(`Lỗi thu âm: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch {
    onError("Không thể khởi động microphone.");
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}
