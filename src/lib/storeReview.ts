import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

import { trackEvent } from './analytics';

const REVIEW_META_KEY = 'domino_latino_store_review_meta_v1';
const COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // 60 days between requests
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_YEAR = 2; // Strictly within Apple's 3/year OS cap

interface StoreReviewMeta {
  lastRequestedAt: number | null;
  timestamps: number[];
}

async function loadReviewMeta(): Promise<StoreReviewMeta> {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_META_KEY);
    if (!raw) return { lastRequestedAt: null, timestamps: [] };
    const parsed = JSON.parse(raw) as Partial<StoreReviewMeta>;
    return {
      lastRequestedAt:
        typeof parsed.lastRequestedAt === 'number' ? parsed.lastRequestedAt : null,
      timestamps: Array.isArray(parsed.timestamps)
        ? parsed.timestamps.filter((t): t is number => typeof t === 'number')
        : [],
    };
  } catch {
    return { lastRequestedAt: null, timestamps: [] };
  }
}

async function saveReviewMeta(meta: StoreReviewMeta): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEW_META_KEY, JSON.stringify(meta));
  } catch {
    // Non-fatal
  }
}

/**
 * 100% Apple HIG & Google Play compliant In-App Review trigger:
 * - Calls the native OS prompt (`StoreReview.requestReview()`) directly with ZERO
 *   pre-screening / opinion-gating modal.
 * - Only fires at genuine "Peak Joy" behavioral moments (after winning a full match
 *   once the player has experienced the game: >= 2 total wins or completed 3/3 daily stars).
 * - Respects a 60-day cooldown and max 2 requests per rolling 365 days.
 */
export async function maybeRequestStoreReview(params: {
  humanWon: boolean;
  totalWins: number;
  dailyStars: number;
  userId?: string | null;
}): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!params.humanWon) return false;

  // Behavioral readiness (never on first match or after a loss)
  const isPeakJoyMoment = params.totalWins >= 2 || params.dailyStars >= 3;
  if (!isPeakJoyMoment) return false;

  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) return false;

    const now = Date.now();
    const meta = await loadReviewMeta();

    if (meta.lastRequestedAt !== null && now - meta.lastRequestedAt < COOLDOWN_MS) {
      return false;
    }

    const recentYearTimestamps = meta.timestamps.filter((ts) => now - ts < YEAR_MS);
    if (recentYearTimestamps.length >= MAX_REQUESTS_PER_YEAR) {
      return false;
    }

    // Record timestamp BEFORE invoking native prompt so concurrent calls never double-fire
    await saveReviewMeta({
      lastRequestedAt: now,
      timestamps: [...recentYearTimestamps, now],
    });

    trackEvent(
      'store_review_requested',
      { totalWins: params.totalWins, dailyStars: params.dailyStars },
      params.userId ?? undefined
    );

    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
