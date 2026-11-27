import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundEffect = 'pickup' | 'clack' | 'double' | 'draw' | 'tick' | 'pass' | 'win';

const SOUND_SOURCES: Record<SoundEffect, number> = {
  clack: require('@/assets/sounds/clack.wav'),
  double: require('@/assets/sounds/double.wav'),
  pickup: require('@/assets/sounds/pickup.wav'),
  draw: require('@/assets/sounds/draw.wav'),
  tick: require('@/assets/sounds/tick.wav'),
  pass: require('@/assets/sounds/pass.wav'),
  win: require('@/assets/sounds/win.wav'),
};

const SOUND_VOLUMES: Record<SoundEffect, number> = {
  clack: 0.72,
  double: 0.85,
  pickup: 0.48,
  draw: 0.62,
  tick: 0.42,
  pass: 0.60,
  win: 0.80,
};

let nativeAudioReady = false;
const nativePlayers: Partial<Record<SoundEffect, AudioPlayer>> = {};

/**
 * Configures non-intrusive game SFX audio mode (mixes with background music/podcasts
 * and respects the hardware silent switch on iOS/Android) and preloads sound effects.
 */
export function initGameAudio() {
  if (Platform.OS === 'web' || nativeAudioReady) return;
  nativeAudioReady = true;

  setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
  }).catch(() => {});

  // Preload lightweight WAV SFX players so the very first tile clack has zero decode lag
  (Object.keys(SOUND_SOURCES) as SoundEffect[]).forEach((effect) => {
    try {
      const player = createAudioPlayer(SOUND_SOURCES[effect]);
      player.volume = SOUND_VOLUMES[effect];
      nativePlayers[effect] = player;
    } catch {
      // Non-fatal fallback
    }
  });
}

function playNativeSound(effect: SoundEffect) {
  if (!nativeAudioReady) {
    initGameAudio();
  }
  try {
    let player = nativePlayers[effect];
    if (!player) {
      player = createAudioPlayer(SOUND_SOURCES[effect]);
      player.volume = SOUND_VOLUMES[effect];
      nativePlayers[effect] = player;
    }
    player
      .seekTo(0)
      .then(() => {
        try {
          player?.play();
        } catch {
          // Ignore transient native playback errors
        }
      })
      .catch(() => {
        try {
          player?.play();
        } catch {
          // Ignore
        }
      });
  } catch {
    // Non-fatal
  }
}

let audioCtx: AudioContext | null = null;

function getWebAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Cross-platform domino SFX:
 * - iOS & Android (Expo Go / EAS): preloaded native WAV players via `expo-audio`.
 * - Web: zero-latency procedural Web Audio synthesis.
 */
export function playGameSound(effect: SoundEffect, soundEnabled: boolean) {
  if (!soundEnabled) return;

  if (Platform.OS !== 'web') {
    playNativeSound(effect);
    return;
  }

  const ctx = getWebAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (effect === 'clack') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.065);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.start(now);
    osc.stop(now + 0.075);
  } else if (effect === 'double') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.07);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.19);
  } else if (effect === 'pickup' || effect === 'draw') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (effect === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (effect === 'pass') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.16);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (effect === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.start(now);
    osc.stop(now + 0.44);
  }
}

export function hapticLight() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticSnap() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function hapticDouble() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

export function hapticSoft() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
}

export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticWarning() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
