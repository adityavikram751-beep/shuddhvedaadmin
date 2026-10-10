// Voice notification utility for Shuddh Veda Admin
// Plays Hindi voice alert: "Hello Shuddh Veda team, ek notification hai please check kijiye"

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
let isAudioUnlocked = false;

// Initialize voices and unlock handlers
if (typeof window !== "undefined") {
  const loadVoices = () => {
    if ("speechSynthesis" in window) {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
        voicesLoaded = true;
      }
    }
  };

  loadVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Unlock audio on first user gesture
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const dummyCtx = new AudioCtx();
        dummyCtx
          .resume()
          .then(() => {
            dummyCtx.close().catch(() => {});
            isAudioUnlocked = true;
          })
          .catch(() => {});
      }
    } catch {}

    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
    window.removeEventListener("pointerdown", unlockAudio);
  };

  window.addEventListener("click", unlockAudio, { once: true, passive: true });
  window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
  window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
}

export function isVoiceNotificationEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("shuddhveda_voice_notification_enabled");
  return stored !== "false";
}

export function setVoiceNotificationEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "shuddhveda_voice_notification_enabled",
    enabled ? "true" : "false"
  );
}

/**
 * Returns available Hindi or Indian accent voice
 */
export function getBestHindiVoice(): {
  voice: SpeechSynthesisVoice | null;
  isHindi: boolean;
} {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { voice: null, isHindi: false };
  }

  const voices =
    cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();

  if (!voices || voices.length === 0) {
    return { voice: null, isHindi: false };
  }

  // 1. Direct Hindi language match (hi-IN, hi_IN, or name contains Hindi/हिन्दी)
  const hindiVoice = voices.find((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return (
      lang.startsWith("hi") ||
      name.includes("hindi") ||
      name.includes("हिन्दी") ||
      name.includes("swara") ||
      name.includes("madhur") ||
      name.includes("kalpana") ||
      name.includes("hemant")
    );
  });

  if (hindiVoice) {
    return { voice: hindiVoice, isHindi: true };
  }

  // 2. Indian English voice (en-IN or name contains India)
  const indianVoice = voices.find((v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return (
      lang.includes("en-in") ||
      name.includes("india") ||
      name.includes("neerja") ||
      name.includes("prabhat") ||
      name.includes("ravi") ||
      name.includes("heera")
    );
  });

  if (indianVoice) {
    return { voice: indianVoice, isHindi: false };
  }

  // 3. Fallback
  return { voice: null, isHindi: false };
}

/**
 * Plays a clean, pleasant notification chime using Web Audio API
 */
export function playNotificationChime(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) {
        resolve();
        return;
      }

      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.24, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);

      setTimeout(() => {
        try {
          ctx.close().catch(() => {});
        } catch {}
        resolve();
      }, 350);
    } catch {
      resolve();
    }
  });
}

let lastSpokenTime = 0;
const spokenIds = new Set<string>();

/**
 * Speaks the notification alert in Hindi:
 * "Hello Shuddh Veda team, ek notification hai please check kijiye"
 */
export async function playNotificationVoice(
  notificationId?: string,
  force = false
): Promise<void> {
  if (typeof window === "undefined") return;

  // Check if muted
  if (!force && !isVoiceNotificationEnabled()) {
    return;
  }

  const now = Date.now();

  // Deduplicate by notification ID
  if (notificationId && spokenIds.has(notificationId) && !force) {
    return;
  }

  // Debounce rapid repeated triggers (< 3.5 seconds)
  if (!force && now - lastSpokenTime < 3500) {
    return;
  }

  if (notificationId) {
    spokenIds.add(notificationId);
    if (spokenIds.size > 200) {
      const first = spokenIds.values().next().value;
      if (first) spokenIds.delete(first);
    }
  }

  lastSpokenTime = now;

  // Play chime first
  try {
    await playNotificationChime();
  } catch {}

  if (!("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any stalled speech

    const { voice, isHindi } = getBestHindiVoice();

    // Use natural Devanagari Hindi when Hindi voice is active,
    // or clear Hinglish Latin text if fallback voice is used
    const textToSpeak = isHindi
      ? "हेलो शुद्ध वेदा टीम, एक नोटिफिकेशन है, प्लीज चेक कीजिए।"
      : "Hello Shuddh Veda team, ek notification hai, please check kijiye";

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "hi-IN";
    } else {
      utterance.lang = "hi-IN";
    }

    utterance.rate = 0.92; // Natural, clear articulation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis failed:", err);
  }
}

/**
 * Test function that ignores debounce/mute so user can verify audio immediately
 */
export async function testNotificationVoice(): Promise<void> {
  await playNotificationVoice("test-" + Date.now(), true);
}
