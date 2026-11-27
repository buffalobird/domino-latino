import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { GameMode, TARGET_SCORES, TargetScore } from '@/engine/types';
import { canClaimDailyReward, RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AccountCard } from './AccountCard';
import { AvatarIllustration } from './AvatarIllustration';
import { DominoTile } from './DominoTile';
import {
  ChipIcon,
  GlobeIcon,
  LockIcon,
  MessageIcon,
  PlayIcon,
  StarIcon,
  TableIcon,
} from './Icons';

interface SetupViewProps {
  mode: GameMode;
  targetScore: TargetScore;
  retention: RetentionProgress;
  onlineEnabled: boolean;
  maintenanceBanner: string | null;
  onChangeMode: (mode: GameMode) => void;
  onChangeTargetScore: (score: TargetScore) => void;
  onStartQuickMatch: () => void;
  onOpenOnlineLobby: (tab: 'public' | 'private') => void;
  onOpenDailyRewards: () => void;
  onOpenThemes: () => void;
  onOpenFeedback: () => void;
}

const MODE_OPTIONS: {
  value: GameMode;
  shortTitle: string;
  subtitle: string;
  ctaLabel: string;
}[] = [
  {
    value: '1v1',
    shortTitle: '1 vs 1',
    subtitle: 'Pozo · 14',
    ctaLabel: '1v1 Pozo',
  },
  {
    value: '2v2',
    shortTitle: '2 vs 2',
    subtitle: 'Parejas',
    ctaLabel: '2v2 Parejas',
  },
  {
    value: '4ffa',
    shortTitle: '4 Jug.',
    subtitle: 'Todos vs todos',
    ctaLabel: '4 Jugadores',
  },
];

/**
 * Thumb-First Mobile Home Architecture (CRO 60/30/10):
 * - TOP (Glance zone): Level/XP, Themes, Club Chips, Feedback button, Compact Hero & Daily Challenge.
 * - MIDDLE (Easy stretch, 0-scroll fit): Compact 1-row Mode pills, 1-row Score chips, Slim OAuth bar.
 * - BOTTOM STICKY THUMB DOCK (Golden thumb arc): Dominant "Jugar ahora" CTA + Online/Private CTAs.
 */
export function SetupView({
  mode,
  targetScore,
  retention,
  onlineEnabled,
  maintenanceBanner,
  onChangeMode,
  onChangeTargetScore,
  onStartQuickMatch,
  onOpenOnlineLobby,
  onOpenDailyRewards,
  onOpenThemes,
  onOpenFeedback,
}: SetupViewProps) {
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedMode = MODE_OPTIONS.find((m) => m.value === mode) ?? MODE_OPTIONS[0];
  const hasDailyBonus = canClaimDailyReward(retention);
  const xpIntoLevel = retention.xp % 100;

  return (
    <LinearGradient
      colors={[CLUB.roomBgTop, CLUB.roomBgBottom]}
      style={styles.gradient}
    >
      <View style={styles.shell}>
        {/* TOP + MIDDLE: Glance Info & Compact Quick-Setup (scrollable only on tiny/landscape screens) */}
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Top Economy, Level & Utility Strip */}
          <View style={styles.topStrip}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nv. {retention.level}</Text>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${xpIntoLevel}%` }]} />
              </View>
            </View>

            <View style={styles.topRightPills}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenThemes();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.themesPill, pressed && { opacity: 0.85 }]}
              >
                <TableIcon size={14} color={CLUB.goldSoft} />
                <Text style={styles.themesPillText}>Mesas</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenDailyRewards();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.chipsPill,
                  hasDailyBonus && styles.chipsPillReady,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <ChipIcon size={15} color={CLUB.gold} />
                <Text style={styles.chipsValue}>
                  {retention.clubChips.toLocaleString('es-ES')}
                </Text>
                {hasDailyBonus && <View style={styles.readyDot} />}
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenFeedback();
                }}
                accessibilityRole="button"
                accessibilityLabel="Enviar sugerencia o reportar fallo"
                style={({ pressed }) => [styles.helpPill, pressed && { opacity: 0.8 }]}
              >
                <MessageIcon size={15} color={CLUB.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* 2. Club Caribe Hero Stage (expands gracefully on tall phones so all controls sit lower in thumb reach) */}
          <View style={styles.heroStage}>
            <View style={styles.hero}>
              <View style={styles.faceoffRow}>
                <View style={styles.avatarRing}>
                  <AvatarIllustration isBot={false} accentColor={CLUB.emerald} size={44} />
                </View>
                <View style={styles.centerTile}>
                  <DominoTile a={6} b={6} orientation="horizontal" unit={23} />
                </View>
                <View style={[styles.avatarRing, { borderColor: CLUB.cyan }]}>
                  <AvatarIllustration
                    isBot
                    accentColor={CLUB.cyan}
                    mood="play"
                    size={44}
                  />
                </View>
              </View>
              <Text style={styles.title}>Dominó Latino</Text>
              <Text style={styles.heroSub}>Club Caribe · Doble Seis</Text>
            </View>
          </View>

          {maintenanceBanner && (
            <View style={styles.maintenanceBanner}>
              <Text style={styles.maintenanceBannerText}>{maintenanceBanner}</Text>
            </View>
          )}

          {/* 3–5. Lower Interactive Cluster anchored cleanly right above the Thumb Dock (0 empty void) */}
          <View style={styles.lowerCluster}>
            {/* 3. Compact Daily 3-Star Challenge Strip */}
            <Pressable
              onPress={() => {
                hapticLight();
                onOpenDailyRewards();
              }}
              accessibilityRole="button"
              style={styles.challengeCard}
            >
              <View style={styles.starsRow}>
                {[0, 1, 2].map((idx) => (
                  <StarIcon
                    key={idx}
                    size={17}
                    color={CLUB.gold}
                    filled={idx < retention.dailyStars}
                  />
                ))}
              </View>
              <View style={styles.challengeTextCol}>
                <Text style={styles.challengeTitle} numberOfLines={1}>
                  {remainingStars === 0
                    ? 'Reto diario completado'
                    : `Reto diario · ${retention.dailyStars}/3`}
                </Text>
                <Text style={styles.challengeSub} numberOfLines={1}>
                  {hasDailyBonus
                    ? 'Bono diario de fichas disponible'
                    : `Racha ${retention.winStreak} · Mejor ${retention.bestStreak}`}
                </Text>
              </View>
              <View style={[styles.bonusBadge, hasDailyBonus && styles.bonusBadgeReady]}>
                <Text
                  style={[styles.bonusBadgeText, hasDailyBonus && styles.bonusBadgeTextReady]}
                >
                  {hasDailyBonus ? 'Reclamar' : 'Bonos'}
                </Text>
              </View>
            </Pressable>

            {/* 4. Compact Configuration Card (10% visual weight — clearly selectors, ZERO scroll) */}
            <View style={styles.setupCard}>
              <View style={styles.setupGroup}>
                <Text style={styles.sectionLabel}>Modalidad</Text>
                <View style={styles.modeSegmentedRow}>
                  {MODE_OPTIONS.map((opt) => {
                    const active = mode === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => {
                          hapticLight();
                          onChangeMode(opt.value);
                        }}
                        accessibilityRole="button"
                        style={[styles.modePill, active && styles.modePillActive]}
                      >
                        <Text
                          style={[styles.modePillTitle, active && styles.modePillTitleActive]}
                        >
                          {opt.shortTitle}
                        </Text>
                        <Text
                          style={[styles.modePillSub, active && styles.modePillSubActive]}
                          numberOfLines={1}
                        >
                          {opt.subtitle}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.setupGroup}>
                <Text style={styles.sectionLabel}>Meta de puntos</Text>
                <View style={styles.scoreSingleRow}>
                  {TARGET_SCORES.map((pts) => {
                    const active = targetScore === pts;
                    return (
                      <Pressable
                        key={pts}
                        onPress={() => {
                          hapticLight();
                          onChangeTargetScore(pts);
                        }}
                        accessibilityRole="button"
                        style={[styles.scoreChip, active && styles.scoreChipActive]}
                      >
                        <Text
                          style={[styles.scoreChipText, active && styles.scoreChipTextActive]}
                        >
                          {pts}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 5. Slim 1-Row Optional OAuth / Cloud Sync Bar */}
            <AccountCard />
          </View>
        </ScrollView>

        {/* BOTTOM STICKY THUMB DOCK (Golden Thumb Arc — 60% Primary CTA + 30% Online CTAs) */}
        <View style={styles.thumbDock}>
          <Pressable
            onPress={() => {
              hapticSnap();
              onStartQuickMatch();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.primaryBtnPressed,
            ]}
          >
            <View style={styles.primaryBtnTop}>
              <PlayIcon size={20} color={CLUB.textInk} />
              <Text style={styles.primaryBtnText}>Jugar ahora</Text>
            </View>
            <Text style={styles.primaryBtnSub}>
              {selectedMode.ctaLabel} · Meta {targetScore} pts (Bots)
            </Text>
          </Pressable>

          <View style={styles.onlineRow}>
            <Pressable
              onPress={() => {
                if (!onlineEnabled) return;
                hapticSnap();
                onOpenOnlineLobby('public');
              }}
              disabled={!onlineEnabled}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.onlineBtn,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && { transform: [{ translateY: 2 }], opacity: 0.94 },
              ]}
            >
              <View style={styles.onlineBtnTop}>
                <GlobeIcon size={14} color="#FFFFFF" />
                <Text style={styles.onlineBtnTitle}>Salas Online</Text>
              </View>
              <Text style={styles.onlineBtnSub}>
                {onlineEnabled ? 'Mesas públicas' : 'En mantenimiento'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!onlineEnabled) return;
                hapticSnap();
                onOpenOnlineLobby('private');
              }}
              disabled={!onlineEnabled}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.privateBtn,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && { transform: [{ translateY: 2 }], opacity: 0.94 },
              ]}
            >
              <View style={styles.onlineBtnTop}>
                <LockIcon size={13} color="#FFFFFF" />
                <Text style={styles.onlineBtnTitle}>Sala Privada</Text>
              </View>
              <Text style={styles.onlineBtnSub}>
                {onlineEnabled ? 'Con amigos' : 'En mantenimiento'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10,
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  xpBarBg: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: CLUB.cyan,
    borderRadius: 3,
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderTopColor: CLUB.surfaceHighlight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  themesPillText: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipsPillReady: {
    borderColor: CLUB.gold,
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
  },
  chipsValue: {
    color: CLUB.gold,
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CLUB.emerald,
  },
  helpPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderTopColor: CLUB.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStage: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 96,
    paddingVertical: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 4,
  },
  faceoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: CLUB.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerTile: {
    transform: [{ rotate: '-6deg' }],
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  heroSub: {
    color: CLUB.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  lowerCluster: {
    gap: 10,
  },
  maintenanceBanner: {
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  maintenanceBannerText: {
    color: CLUB.goldSoft,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.32)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  challengeTextCol: {
    flex: 1,
  },
  challengeTitle: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  challengeSub: {
    color: CLUB.goldSoft,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  bonusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: CLUB.surfaceCardLight,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
  },
  bonusBadgeReady: {
    backgroundColor: 'rgba(245, 196, 81, 0.18)',
    borderColor: CLUB.gold,
  },
  bonusBadgeText: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  bonusBadgeTextReady: {
    color: CLUB.gold,
  },
  setupCard: {
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderTopColor: CLUB.surfaceHighlight,
    padding: 12,
    gap: 11,
  },
  setupGroup: {
    gap: 6,
  },
  sectionLabel: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.85,
  },
  modeSegmentedRow: {
    flexDirection: 'row',
    gap: 7,
  },
  modePill: {
    flex: 1,
    minHeight: 52,
    backgroundColor: CLUB.surfaceDeep,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  modePillActive: {
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
    borderColor: CLUB.gold,
    borderWidth: 1.5,
  },
  modePillTitle: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  modePillTitleActive: {
    color: CLUB.gold,
  },
  modePillSub: {
    color: CLUB.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  modePillSubActive: {
    color: CLUB.goldSoft,
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    flex: 1,
    minHeight: 40,
    backgroundColor: CLUB.surfaceDeep,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipActive: {
    backgroundColor: CLUB.gold,
    borderColor: CLUB.goldSoft,
  },
  scoreChipText: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scoreChipTextActive: {
    color: CLUB.textInk,
  },
  thumbDock: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: CLUB.borderSubtle,
    backgroundColor: CLUB.glassBgStrong,
  },
  primaryBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 58,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 22px rgba(39, 209, 136, 0.30)',
  },
  primaryBtnPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.94,
  },
  primaryBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: CLUB.textInk,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  primaryBtnSub: {
    color: CLUB.emeraldDeep,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  onlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  onlineBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineBtn: {
    flex: 1,
    backgroundColor: CLUB.cobalt,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#1E3A8A',
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateBtn: {
    flex: 1,
    backgroundColor: CLUB.violet,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.violetDark,
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  onlineBtnSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  onlineBtnDisabled: {
    opacity: 0.45,
  },
});
