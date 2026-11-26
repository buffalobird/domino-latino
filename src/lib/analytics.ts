import { isSupabaseConfigured, supabase } from './supabase';

const SESSION_ID = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export type AnalyticsEventName =
  | 'app_open'
  | 'match_start'
  | 'hand_end'
  | 'match_end'
  | 'daily_claim'
  | 'free_refill'
  | 'theme_unlock'
  | 'room_created'
  | 'room_joined'
  | 'room_started_with_bots';

/**
 * Lightweight, privacy-first event tracking (Comparative Report O1 / DL-01).
 * Never sends PII; non-blocking insert to Supabase `analytics_events` when authenticated.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  props: Record<string, string | number | boolean | null> = {},
  userId?: string | null
): void {
  if (__DEV__) {
    console.debug('[analytics]', eventName, props);
  }
  if (!isSupabaseConfigured || !userId) return;

  supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      session_id: SESSION_ID,
      event_name: eventName,
      props,
    })
    .then(() => {}, () => {});
}
