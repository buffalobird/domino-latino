import AsyncStorage from '@react-native-async-storage/async-storage';

import { isValidPersistedState } from '@/engine/rules';
import { GameState } from '@/engine/types';

const STORAGE_KEY = 'domino_latino_game_state_v2';
const RETENTION_KEY = 'domino_latino_retention_v1';

export interface RetentionProgress {
  dateKey: string;
  /** Daily 3-Star Challenge progress (0..3 wins today) */
  dailyStars: number;
  /** Consecutive match wins */
  winStreak: number;
  bestStreak: number;
  totalWins: number;
}

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDefaultRetention(): RetentionProgress {
  return {
    dateKey: getTodayKey(),
    dailyStars: 0,
    winStreak: 0,
    bestStreak: 0,
    totalWins: 0,
  };
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal
  }
}

export async function loadGameState(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValidPersistedState(parsed)) {
      return parsed;
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export async function loadRetentionProgress(): Promise<RetentionProgress> {
  try {
    const raw = await AsyncStorage.getItem(RETENTION_KEY);
    if (!raw) return createDefaultRetention();
    const parsed = JSON.parse(raw) as Partial<RetentionProgress>;
    const today = getTodayKey();
    const sameDay = parsed.dateKey === today;
    return {
      dateKey: today,
      dailyStars: sameDay && typeof parsed.dailyStars === 'number' ? Math.min(3, Math.max(0, parsed.dailyStars)) : 0,
      winStreak: typeof parsed.winStreak === 'number' ? Math.max(0, parsed.winStreak) : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? Math.max(0, parsed.bestStreak) : 0,
      totalWins: typeof parsed.totalWins === 'number' ? Math.max(0, parsed.totalWins) : 0,
    };
  } catch {
    return createDefaultRetention();
  }
}

export async function saveRetentionProgress(progress: RetentionProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(RETENTION_KEY, JSON.stringify(progress));
  } catch {
    // Non-fatal
  }
}

export function recordMatchResult(
  prev: RetentionProgress,
  humanWon: boolean
): RetentionProgress {
  const today = getTodayKey();
  const baseStars = prev.dateKey === today ? prev.dailyStars : 0;
  if (humanWon) {
    const nextStreak = prev.winStreak + 1;
    return {
      dateKey: today,
      dailyStars: Math.min(3, baseStars + 1),
      winStreak: nextStreak,
      bestStreak: Math.max(prev.bestStreak, nextStreak),
      totalWins: prev.totalWins + 1,
    };
  }
  return {
    ...prev,
    dateKey: today,
    dailyStars: baseStars,
    winStreak: 0,
  };
}
