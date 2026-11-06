import { LANGUAGES } from "@/lib/seed-data";
import { LanguageCode } from "@/types/language";

export function speakText(
  text: string,
  languageCode: LanguageCode,
  rate: number = 0.92
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const targetBcp47 = LANGUAGES[languageCode]?.speechLang || "en-US";
  utterance.lang = targetBcp47;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang.toLowerCase() === targetBcp47.toLowerCase()) ||
    voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetBcp47.slice(0, 2).toLowerCase())
    );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
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
  const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionImpl) {
    onError("Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói (Hãy thử Chrome hoặc Edge).");
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

