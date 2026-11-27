import AsyncStorage from '@react-native-async-storage/async-storage';

import { BotSpeed } from '@/components/domino/PauseModal';
import { AvatarConfig, sanitizeAvatarConfig } from '@/constants/avatarCatalog';
import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { TILE_STYLES, TileStyleId } from '@/constants/tileStyles';
import { GameMode, TargetScore } from '@/engine/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  computeLevelFromXp,
  getTodayKey,
  RetentionProgress,
  saveRetentionProgress,
} from './gameStorage';

const PENDING_MATCHES_KEY = 'domino_latino_pending_matches_v1';
const CACHED_PROFILE_KEY = 'domino_latino_cached_profile_v1';

export interface UserProfileCache {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  preferredMode: GameMode;
  preferredTargetScore: TargetScore;
  preferredBotSpeed: BotSpeed;
}

export interface MatchRecordPayload {
  clientMatchId: string;
  mode: GameMode;
  targetScore: TargetScore;
  humanWon: boolean;
  handsPlayed: number;
  finalScores: number[];
  playedAt: string;
}

interface CloudProgressRow {
  daily_date?: string | null;
  daily_stars?: number | null;
  win_streak?: number | null;
  best_streak?: number | null;
  total_wins?: number | null;
  club_chips?: number | null;
  xp?: number | null;
  level?: number | null;
  daily_claim_streak?: number | null;
  last_daily_claim_date?: string | null;
  equipped_theme?: string | null;
  unlocked_themes?: string[] | null;
  equipped_tile_style?: string | null;
  avatar_config?: unknown;
  unlocked_cosmetics?: string[] | null;
}

function mapCloudProgressToLocal(
  cloud: CloudProgressRow | null | undefined,
  fallback: RetentionProgress
): RetentionProgress {
  if (!cloud) return fallback;
  const today = getTodayKey();
  const cloudTodayStars = cloud.daily_date === today ? cloud.daily_stars ?? 0 : 0;
  const xp = typeof cloud.xp === 'number' ? Math.max(0, cloud.xp) : fallback.xp;
  const unlockedRaw =
    Array.isArray(cloud.unlocked_themes) && cloud.unlocked_themes.length > 0
      ? (cloud.unlocked_themes.filter((t) => typeof t === 'string' && t in TABLE_THEMES) as TableThemeId[])
      : (['caribe'] as TableThemeId[]);
  const unlockedThemes = Array.from(new Set<TableThemeId>(['caribe', ...unlockedRaw]));
  const equippedCandidate = cloud.equipped_theme as TableThemeId | undefined;
  const equippedTheme: TableThemeId =
    equippedCandidate && unlockedThemes.includes(equippedCandidate)
      ? equippedCandidate
      : 'caribe';

  const unlockedCosmetics = Array.isArray(cloud.unlocked_cosmetics)
    ? Array.from(
        new Set(
          cloud.unlocked_cosmetics.filter((k): k is string => typeof k === 'string' && k.length > 0)
        )
      )
    : fallback.unlockedCosmetics;

  const tileCandidate = cloud.equipped_tile_style as TileStyleId | undefined;
  const equippedTileStyle: TileStyleId =
    tileCandidate &&
    tileCandidate in TILE_STYLES &&
    (tileCandidate === 'marfil' || unlockedCosmetics.includes(`tile:${tileCandidate}`))
      ? tileCandidate
      : 'marfil';

  const avatarConfig = cloud.avatar_config
    ? sanitizeAvatarConfig(cloud.avatar_config)
    : fallback.avatarConfig;

  return {
    dateKey: today,
    dailyStars: Math.min(3, Math.max(0, cloudTodayStars)),
    winStreak: Math.max(0, cloud.win_streak ?? 0),
    bestStreak: Math.max(0, cloud.best_streak ?? 0),
    totalWins: Math.max(0, cloud.total_wins ?? 0),
    clubChips: Math.max(0, cloud.club_chips ?? 1000),
    xp,
    level: computeLevelFromXp(xp),
    dailyClaimStreak: Math.min(7, Math.max(0, cloud.daily_claim_streak ?? 0)),
    lastDailyClaimDate: cloud.last_daily_claim_date ?? null,
    equippedTheme,
    unlockedThemes,
    equippedTileStyle,
    avatarConfig,
    unlockedCosmetics,
  };
}

async function invokeAccountFn<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('domino-account', {
    body: payload,
  });
  if (error) {
    throw new Error(error.message || 'Error sincronizando con el servidor.');
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as T;
}

async function loadPendingMatches(): Promise<MatchRecordPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_MATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function savePendingMatches(items: MatchRecordPayload[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_MATCHES_KEY, JSON.stringify(items));
  } catch {
    // Non-fatal
  }
}

export async function loadCachedProfile(): Promise<UserProfileCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHED_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfileCache;
  } catch {
    return null;
  }
}

export async function saveCachedProfile(profile: UserProfileCache | null): Promise<void> {
  try {
    if (!profile) {
      await AsyncStorage.removeItem(CACHED_PROFILE_KEY);
    } else {
      await AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Authoritative server-side daily 7-day reward claim via `domino-account`.
 */
export async function syncDailyRewardToCloud(
  userId: string | null,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'claim_daily_reward',
    today: getTodayKey(),
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Authoritative server-side free Club Chips refill (when < 200 chips).
 */
export async function syncFreeRefillToCloud(
  userId: string | null,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'free_refill',
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Authoritative server-side cosmetic table theme unlock / equip.
 */
export async function syncThemeToCloud(
  userId: string | null,
  themeId: TableThemeId,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'unlock_or_equip_theme',
    themeId,
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Authoritative server-side collectible tile style unlock / equip.
 */
export async function syncTileStyleToCloud(
  userId: string | null,
  tileStyleId: TileStyleId,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'unlock_or_equip_tile_style',
    tileStyleId,
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Authoritative server-side unlock for a paid avatar accessory / frame.
 */
export async function syncCosmeticUnlockToCloud(
  userId: string | null,
  itemKey: string,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'unlock_cosmetic',
    itemKey,
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Authoritative server-side save for the player's modular avatar configuration.
 */
export async function syncAvatarConfigToCloud(
  userId: string | null,
  avatarConfig: AvatarConfig,
  fallback: RetentionProgress
): Promise<RetentionProgress | null> {
  if (!userId || !isSupabaseConfigured) return null;
  const res = await invokeAccountFn<{ ok: boolean; progress?: CloudProgressRow }>({
    action: 'save_avatar_config',
    avatarConfig,
  });
  if (!res.progress) return null;
  const authoritative = mapCloudProgressToLocal(res.progress, fallback);
  await saveRetentionProgress(authoritative);
  return authoritative;
}

/**
 * Permanent account deletion (Apple App Store 5.1.1(v) + SOC 2 Privacy).
 */
export async function deleteUserAccount(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado.');
  }
  await invokeAccountFn<{ ok: boolean }>({
    action: 'delete_account',
  });
  await Promise.all([savePendingMatches([]), saveCachedProfile(null)]);
}

export async function queueAndSyncMatch(
  userId: string | null,
  record: MatchRecordPayload,
  localProgress: RetentionProgress
): Promise<RetentionProgress | null> {
  const existing = await loadPendingMatches();
  const deduped = existing.some((m) => m.clientMatchId === record.clientMatchId)
    ? existing
    : [...existing, record].slice(-50);
  await savePendingMatches(deduped);

  if (!userId || !isSupabaseConfigured) return null;
  const { mergedProgress } = await flushPendingAndSyncProgress(userId, localProgress);
  return mergedProgress;
}

export async function flushPendingAndSyncProgress(
  userId: string,
  localProgress: RetentionProgress
): Promise<{
  mergedProgress: RetentionProgress;
  profile: UserProfileCache | null;
}> {
  if (!isSupabaseConfigured) {
    return { mergedProgress: localProgress, profile: null };
  }

  // 1. Flush offline local-match queue through authoritative `domino-account` Edge Function
  const pending = await loadPendingMatches();
  if (pending.length > 0) {
    const remaining: MatchRecordPayload[] = [];
    const today = getTodayKey();
    for (const m of pending) {
      try {
        await invokeAccountFn({
          action: 'record_local_match',
          clientMatchId: m.clientMatchId,
          mode: m.mode,
          targetScore: m.targetScore,
          humanWon: m.humanWon,
          handsPlayed: m.handsPlayed,
          finalScores: m.finalScores,
          playedAt: m.playedAt,
          today,
        });
      } catch {
        remaining.push(m);
      }
    }
    await savePendingMatches(remaining);
  }

  // 2. Read-only fetch of authoritative profile + progress (client writes to user_progress are revoked)
  const [profileRes, progressRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, display_name, avatar_url, preferred_mode, preferred_target_score, preferred_bot_speed'
      )
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('user_progress')
      .select(
        'daily_date, daily_stars, win_streak, best_streak, total_wins, total_matches, club_chips, xp, level, daily_claim_streak, last_daily_claim_date, equipped_theme, unlocked_themes, equipped_tile_style, avatar_config, unlocked_cosmetics'
      )
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  let profile: UserProfileCache | null = null;
  if (profileRes.data) {
    profile = {
      id: profileRes.data.id,
      displayName: profileRes.data.display_name,
      avatarUrl: profileRes.data.avatar_url,
      preferredMode: profileRes.data.preferred_mode as GameMode,
      preferredTargetScore: profileRes.data.preferred_target_score as TargetScore,
      preferredBotSpeed: profileRes.data.preferred_bot_speed as BotSpeed,
    };
    await saveCachedProfile(profile);
  }

  const mergedProgress = mapCloudProgressToLocal(progressRes.data, localProgress);
  await saveRetentionProgress(mergedProgress);

  return { mergedProgress, profile };
}

export async function syncUserPreferences(
  userId: string | null,
  prefs: {
    mode?: GameMode;
    targetScore?: TargetScore;
    botSpeed?: BotSpeed;
  }
): Promise<void> {
  if (!userId || !isSupabaseConfigured) return;
  const patch: Record<string, unknown> = {};
  if (prefs.mode) patch.preferred_mode = prefs.mode;
  if (prefs.targetScore) patch.preferred_target_score = prefs.targetScore;
  if (prefs.botSpeed) patch.preferred_bot_speed = prefs.botSpeed;
  if (Object.keys(patch).length === 0) return;

  await supabase.from('profiles').update(patch).eq('id', userId);
}
