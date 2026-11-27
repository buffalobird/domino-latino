import { AvatarConfig, sanitizeAvatarConfig } from '@/constants/avatarCatalog';
import { isSupabaseConfigured, supabase } from './supabase';

export interface TableCompanion {
  companion_user_id: string;
  companion_name: string;
  companion_avatar: AvatarConfig | null;
  matches_together: number;
  last_played_at: string;
}

function normalizeCompanionList(raw: unknown): TableCompanion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
    .map((r) => ({
      companion_user_id: String(r.companion_user_id ?? ''),
      companion_name: String(r.companion_name ?? 'Jugador'),
      companion_avatar: r.companion_avatar ? sanitizeAvatarConfig(r.companion_avatar) : null,
      matches_together: Math.max(1, Number(r.matches_together ?? 1)),
      last_played_at: String(r.last_played_at ?? new Date().toISOString()),
    }))
    .filter((c) => c.companion_user_id.length > 0);
}

export async function fetchTableCompanions(): Promise<TableCompanion[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.functions.invoke('domino-account', {
      body: { action: 'list_companions' },
    });
    if (error || !data?.ok) return [];
    return normalizeCompanionList(data.companions);
  } catch {
    return [];
  }
}

export async function saveTableCompanion(
  companionUserId: string
): Promise<TableCompanion[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.functions.invoke('domino-account', {
      body: { action: 'save_companion', companionUserId },
    });
    if (error || !data?.ok) return null;
    return normalizeCompanionList(data.companions);
  } catch {
    return null;
  }
}

export async function removeTableCompanion(
  companionUserId: string
): Promise<TableCompanion[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.functions.invoke('domino-account', {
      body: { action: 'remove_companion', companionUserId },
    });
    if (error || !data?.ok) return null;
    return normalizeCompanionList(data.companions);
  } catch {
    return null;
  }
}
