import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  sanitizeAvatarConfig,
} from '@/constants/avatarCatalog';
import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { TILE_STYLES, TileStyleId } from '@/constants/tileStyles';
import { isValidPersistedState } from '@/engine/rules';
import { GameState } from '@/engine/types';

const STORAGE_KEY = 'domino_latino_game_state_v2';
const RETENTION_KEY = 'domino_latino_retention_v2';

/** Escalating 7-day soft-currency rewards (never purchasable with real money) */
export const DAILY_REWARD_SCHEDULE = [100, 150, 200, 300, 400, 500, 1000] as const;

export interface RetentionProgress {
  dateKey: string;
  /** Daily 3-Star Challenge progress (0..3 wins today) */
  dailyStars: number;
  winStreak: number;
  bestStreak: number;
  totalWins: number;
  /** Safe Double-Layer Economy: soft currency earned strictly via gameplay & daily bonuses */
  clubChips: number;
  /** Visible XP & Player Level */
  xp: number;
  level: number;
  /** 7-day escalating daily login bonus */
  dailyClaimStreak: number;
  lastDailyClaimDate: string | null;
  /** Cosmetic table themes */
  equippedTheme: TableThemeId;
  unlockedThemes: TableThemeId[];
  /** Collectible domino tile styles */
  equippedTileStyle: TileStyleId;
  /** Modular bust avatar configuration */
  avatarConfig: AvatarConfig;
  /** Unlocked cosmetic keys (`hair:bun`, `hat:panama`, `tile:jade`, `frame:oro_real`, etc.) */
  unlockedCosmetics: string[];
}

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.max(0, xp) / 100) + 1);
}

export function createDefaultRetention(): RetentionProgress {
  return {
    dateKey: getTodayKey(),
    dailyStars: 0,
    winStreak: 0,
    bestStreak: 0,
    totalWins: 0,
    clubChips: 1000,
    xp: 0,
    level: 1,
    dailyClaimStreak: 0,
    lastDailyClaimDate: null,
    equippedTheme: 'caribe',
    unlockedThemes: ['caribe'],
    equippedTileStyle: 'marfil',
    avatarConfig: { ...DEFAULT_AVATAR_CONFIG },
    unlockedCosmetics: [],
  };
}

export function canClaimDailyReward(progress: RetentionProgress): boolean {
  return progress.lastDailyClaimDate !== getTodayKey();
}

export function getNextDailyRewardAmount(progress: RetentionProgress): {
  dayIndex: number;
  amount: number;
} {
  const dayIndex = progress.dailyClaimStreak % 7;
  return {
    dayIndex,
    amount: DAILY_REWARD_SCHEDULE[dayIndex],
  };
}

export function claimDailyRewardLocal(prev: RetentionProgress): {
  updated: RetentionProgress;
  awarded: number;
} {
  const today = getTodayKey();
  if (prev.lastDailyClaimDate === today) {
    return { updated: prev, awarded: 0 };
  }
  const { dayIndex, amount } = getNextDailyRewardAmount(prev);
  const nextStreak = dayIndex + 1;
  return {
    awarded: amount,
    updated: {
      ...prev,
      dateKey: today,
      clubChips: prev.clubChips + amount,
      dailyClaimStreak: nextStreak >= 7 ? 0 : nextStreak,
      lastDailyClaimDate: today,
    },
  };
}

export function applyFreeClubRefill(prev: RetentionProgress): {
  updated: RetentionProgress;
  awarded: number;
} {
  if (prev.clubChips >= 200) return { updated: prev, awarded: 0 };
  const refill = 300;
  return {
    awarded: refill,
    updated: {
      ...prev,
      clubChips: prev.clubChips + refill,
    },
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
    const raw =
      (await AsyncStorage.getItem(RETENTION_KEY)) ??
      (await AsyncStorage.getItem('domino_latino_retention_v1'));
    if (!raw) return createDefaultRetention();
    const parsed = JSON.parse(raw) as Partial<RetentionProgress>;
    const today = getTodayKey();
    const sameDay = parsed.dateKey === today;
    const xp = typeof parsed.xp === 'number' ? Math.max(0, parsed.xp) : 0;
    const unlockedRaw =
      Array.isArray(parsed.unlockedThemes) && parsed.unlockedThemes.length > 0
        ? (parsed.unlockedThemes.filter((t) => typeof t === 'string' && t in TABLE_THEMES) as TableThemeId[])
        : (['caribe'] as TableThemeId[]);
    const unlocked = Array.from(new Set<TableThemeId>(['caribe', ...unlockedRaw]));
    const equipped: TableThemeId =
      parsed.equippedTheme && unlocked.includes(parsed.equippedTheme)
        ? parsed.equippedTheme
        : 'caribe';

    const unlockedCosmetics = Array.isArray(parsed.unlockedCosmetics)
      ? Array.from(
          new Set(
            parsed.unlockedCosmetics.filter((k): k is string => typeof k === 'string' && k.length > 0)
          )
        )
      : [];

    const tileCandidate = parsed.equippedTileStyle as TileStyleId | undefined;
    const equippedTileStyle: TileStyleId =
      tileCandidate &&
      tileCandidate in TILE_STYLES &&
      (tileCandidate === 'marfil' || unlockedCosmetics.includes(`tile:${tileCandidate}`))
        ? tileCandidate
        : 'marfil';

    return {
      dateKey: today,
      dailyStars:
        sameDay && typeof parsed.dailyStars === 'number'
          ? Math.min(3, Math.max(0, parsed.dailyStars))
          : 0,
      winStreak: typeof parsed.winStreak === 'number' ? Math.max(0, parsed.winStreak) : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? Math.max(0, parsed.bestStreak) : 0,
      totalWins: typeof parsed.totalWins === 'number' ? Math.max(0, parsed.totalWins) : 0,
      clubChips:
        typeof parsed.clubChips === 'number' ? Math.max(0, parsed.clubChips) : 1000,
      xp,
      level: computeLevelFromXp(xp),
      dailyClaimStreak:
        typeof parsed.dailyClaimStreak === 'number'
          ? Math.min(7, Math.max(0, parsed.dailyClaimStreak))
          : 0,
      lastDailyClaimDate:
        typeof parsed.lastDailyClaimDate === 'string' ? parsed.lastDailyClaimDate : null,
      equippedTheme: equipped,
      unlockedThemes: unlocked,
      equippedTileStyle,
      avatarConfig: sanitizeAvatarConfig(parsed.avatarConfig),
      unlockedCosmetics,
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
): { updated: RetentionProgress; chipsEarned: number; xpEarned: number } {
  const today = getTodayKey();
  const baseStars = prev.dateKey === today ? prev.dailyStars : 0;
  const chipsEarned = humanWon ? 50 : 15;
  const xpEarned = humanWon ? 40 : 15;
  const nextXp = prev.xp + xpEarned;

  if (humanWon) {
    const nextStreak = prev.winStreak + 1;
    return {
      chipsEarned,
      xpEarned,
      updated: {
        ...prev,
        dateKey: today,
        dailyStars: Math.min(3, baseStars + 1),
        winStreak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        totalWins: prev.totalWins + 1,
        clubChips: prev.clubChips + chipsEarned,
        xp: nextXp,
        level: computeLevelFromXp(nextXp),
      },
    };
  }
  return {
    chipsEarned,
    xpEarned,
    updated: {
      ...prev,
      dateKey: today,
      dailyStars: baseStars,
      winStreak: 0,
      clubChips: prev.clubChips + chipsEarned,
      xp: nextXp,
      level: computeLevelFromXp(nextXp),
    },
  };
}
