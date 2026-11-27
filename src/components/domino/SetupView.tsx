import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { getWarmHostGreeting } from '@/constants/socialReactions';
import { CLUB } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { GameMode, TARGET_SCORES, TargetScore } from '@/engine/types';
import { canClaimDailyReward, RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AccountCard } from './AccountCard';
import { DominoTile } from './DominoTile';
import {
  ChipIcon,
  DuoSoloSilhouetteIcon,
  GearIcon,
  GlobeIcon,
  KeyIcon,
  PairSilhouetteIcon,
  PlayIcon,
  StarIcon,
  UserSilhouetteIcon,
} from './Icons';
import { ModularAvatar } from './ModularAvatar';

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
  onOpenAvatarStudio: () => void;
  onOpenFeedback: () => void;
  onOpenAuth: () => void;
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

/** Warm overhead parlor lamp glow matching the active nocturnal domino table */
function WarmParlorBackdrop() {
  return (
    <View style={styles.backdropLayer} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="parlorLamp" cx="50%" cy="18%" r="54%">
            <Stop offset="0%" stopColor="#F5C451" stopOpacity={0.14} />
            <Stop offset="45%" stopColor="#14626A" stopOpacity={0.22} />
            <Stop offset="100%" stopColor="#071419" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="feltWarmth" cx="50%" cy="88%" r="46%">
            <Stop offset="0%" stopColor="#1A6E56" stopOpacity={0.22} />
            <Stop offset="60%" stopColor="#0C353C" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#061116" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#parlorLamp)" />
        <Rect x={0} y={0} width={100} height={100} fill="url(#feltWarmth)" />
      </Svg>
    </View>
  );
}

/**
 * Unified "La Sobremesa" Nocturnal Domino Club Home Screen (see DESIGN_LANGUAGE.md):
 * - Same warm obsidian-teal atmosphere, brass hairlines, porcelain domino tiles, and live 2.5D avatar
 *   as the active table — zero 3D-arcade visual mismatch in the first 50 ms.
 * - Warm time-of-day host greeting designed for players seeking calm company around the table.
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
  onOpenAvatarStudio,
  onOpenFeedback,
  onOpenAuth,
}: SetupViewProps) {
  const { profile } = useAuth();
  const { height: winH } = useWindowDimensions();
  const isCompactH = winH < 780;

  const { greeting, inviteLine } = getWarmHostGreeting(profile?.displayName);
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedMode = MODE_OPTIONS.find((m) => m.value === mode) ?? MODE_OPTIONS[0];
  const hasDailyBonus = canClaimDailyReward(retention);
  const xpIntoLevel = Math.max(8, retention.xp % 100);
  const emblemTileUnit = isCompactH ? 24 : 27;

  return (
    <LinearGradient
      colors={[CLUB.roomBgTop, CLUB.roomBgMid, '#091A21', CLUB.roomBgBottom]}
      locations={[0, 0.36, 0.74, 1]}
      style={styles.gradient}
    >
      <WarmParlorBackdrop />

      <View style={styles.shell}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyContent,
            isCompactH && { gap: 8, paddingTop: 6, paddingBottom: 6 },
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Top Club Bar (Level + Boutique + Club Chips + Feedback) */}
          <View style={styles.topStrip}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nivel {retention.level}</Text>
              <View style={styles.xpBarBg}>
                <LinearGradient
                  colors={[CLUB.goldSoft, CLUB.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.xpBarFill, { width: `${xpIntoLevel}%` }]}
                />
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
                <ChipIcon size={14} color={CLUB.gold} />
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
                accessibilityLabel="Sugerencias y soporte"
                style={({ pressed }) => [
                  styles.gearBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <GearIcon size={18} color={CLUB.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* 2. Unified Sobremesa Brand Header + Live Companion Host Card */}
          <View style={[styles.brandBlock, isCompactH && { paddingVertical: 2 }]}>
            <Text style={styles.brandKicker}>LA SOBREMESA · DOBLE SEIS</Text>
            <Text style={[styles.brandTitle, isCompactH && { fontSize: 28 }]}>
              DOMINÓ <Text style={styles.brandTitleAccent}>LATINO</Text>
            </Text>
            <View style={styles.brassRule} />
          </View>

          {/* Signature Tactile Card: Your live 2.5D Avatar + Warm Greeting + Real Porcelain Tiles */}
          <Pressable
            onPress={() => {
              hapticLight();
              onOpenAvatarStudio();
            }}
            accessibilityRole="button"
            accessibilityLabel="Personalizar mi avatar"
            style={({ pressed }) => [
              styles.hostCard,
              isCompactH && { paddingVertical: 10, paddingHorizontal: 12 },
              pressed && { opacity: 0.94 },
            ]}
          >
            <View style={styles.hostAvatarWrap}>
              <ModularAvatar
                config={retention.avatarConfig}
                size={isCompactH ? 54 : 62}
                showFrameRing
              />
              <View style={styles.avatarEditPill}>
                <Text style={styles.avatarEditPillText}>Editar</Text>
              </View>
            </View>

            <View style={styles.hostCopyCol}>
              <Text style={styles.hostGreeting} numberOfLines={1}>
                {greeting}
              </Text>
              <Text style={styles.hostInvite} numberOfLines={2}>
                {inviteLine}
              </Text>
            </View>

            {/* Real tactile domino pieces in user's equipped tile style */}
            <View style={styles.emblemTiles} pointerEvents="none">
              <View style={styles.emblemTileBack}>
                <DominoTile
                  a={5}
                  b={3}
                  orientation="vertical"
                  unit={emblemTileUnit}
                  tileStyleId={retention.equippedTileStyle}
                />
              </View>
              <View style={styles.emblemTileFront}>
                <DominoTile
                  a={6}
                  b={6}
                  orientation="vertical"
                  unit={emblemTileUnit}
                  tileStyleId={retention.equippedTileStyle}
                />
              </View>
            </View>
          </Pressable>

          {maintenanceBanner && (
            <View style={styles.maintenanceBanner}>
              <Text style={styles.maintenanceBannerText}>{maintenanceBanner}</Text>
            </View>
          )}

          {/* 3–5. Lower Interactive Cluster */}
          <View style={styles.lowerCluster}>
            {/* 3. Warm Daily Challenge Card */}
            <Pressable
              onPress={() => {
                hapticLight();
                onOpenDailyRewards();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.challengeCard,
                pressed && { opacity: 0.92 },
              ]}
            >
              <View style={styles.starsRow}>
                {[0, 1, 2].map((idx) => (
                  <StarIcon
                    key={idx}
                    size={17}
                    color={idx < retention.dailyStars ? CLUB.gold : 'rgba(245,196,81,0.32)'}
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
                    ? 'Tu bono de bienvenida de hoy está listo'
                    : `Racha ${retention.winStreak} · Mejor ${retention.bestStreak}`}
                </Text>
              </View>
              <View style={[styles.bonusBadge, hasDailyBonus && styles.bonusBadgeReady]}>
                <Text
                  style={[
                    styles.bonusBadgeText,
                    hasDailyBonus && styles.bonusBadgeTextReady,
                  ]}
                >
                  {hasDailyBonus ? 'Reclamar' : 'Bonos'}
                </Text>
              </View>
            </Pressable>

            {/* 4. Smoked-Glass Table Setup Card */}
            <View style={styles.setupCard}>
              <View style={styles.setupGroup}>
                <Text style={styles.sectionLabel}>MODALIDAD</Text>
                <View style={styles.modeSegmentedRow}>
                  {MODE_OPTIONS.map((opt) => {
                    const active = mode === opt.value;
                    const silColor = active ? CLUB.gold : 'rgba(185, 200, 217, 0.45)';
                    const renderSideIcon = () =>
                      opt.value === '1v1' ? (
                        <UserSilhouetteIcon size={14} color={silColor} />
                      ) : opt.value === '2v2' ? (
                        <PairSilhouetteIcon size={16} color={silColor} />
                      ) : (
                        <DuoSoloSilhouetteIcon size={15} color={silColor} />
                      );

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
                        <View style={styles.modePillInner}>
                          {renderSideIcon()}
                          <View style={styles.modeTextCenter}>
                            <Text
                              style={[
                                styles.modePillTitle,
                                active && styles.modePillTitleActive,
                              ]}
                              numberOfLines={1}
                            >
                              {opt.shortTitle}
                            </Text>
                            <Text
                              style={[
                                styles.modePillSub,
                                active && styles.modePillSubActive,
                              ]}
                              numberOfLines={1}
                            >
                              {opt.subtitle}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.setupGroup}>
                <Text style={styles.sectionLabel}>META DE PUNTOS</Text>
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
                          style={[
                            styles.scoreChipText,
                            active && styles.scoreChipTextActive,
                          ]}
                        >
                          {pts}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 5. Account / Profile Sign-in Card */}
            <AccountCard onOpenAuth={onOpenAuth} />
          </View>
        </ScrollView>

        {/* BOTTOM STICKY THUMB DOCK (Single Emerald Primary CTA + Calm Parlor Online CTAs) */}
        <View style={styles.thumbDock}>
          <Pressable
            onPress={() => {
              hapticSnap();
              onStartQuickMatch();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryBtnOuter,
              pressed && styles.primaryBtnPressed,
            ]}
          >
            <LinearGradient
              colors={['#38DF96', '#21BA77', '#138956']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.primaryBtnGrad}
            >
              <View style={styles.primaryBtnTop}>
                <PlayIcon size={19} color="#06291A" />
                <Text style={styles.primaryBtnText}>Jugar ahora</Text>
              </View>
              <Text style={styles.primaryBtnSub}>
                {selectedMode.ctaLabel} · Meta {targetScore} pts (Bots)
              </Text>
            </LinearGradient>
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
                styles.secondaryBtn,
                styles.secondaryBtnWarm,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <GlobeIcon size={19} color={CLUB.gold} />
              <View style={styles.secondaryTextCol}>
                <Text style={styles.onlineBtnTitle} numberOfLines={1}>
                  Salas Online
                </Text>
                <Text style={styles.onlineBtnSub} numberOfLines={1}>
                  {onlineEnabled ? 'Juega con otros' : 'Mantenimiento'}
                </Text>
              </View>
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
                styles.secondaryBtn,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <KeyIcon size={18} color={CLUB.emerald} />
              <View style={styles.secondaryTextCol}>
                <Text style={styles.onlineBtnTitle} numberOfLines={1}>
                  Sala Privada
                </Text>
                <Text style={styles.onlineBtnSub} numberOfLines={1}>
                  {onlineEnabled ? 'Con amigos' : 'Mantenimiento'}
                </Text>
              </View>
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
    position: 'relative',
  },
  backdropLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    gap: 8,
    backgroundColor: CLUB.glassBg,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  levelText: {
    color: CLUB.ivoryTop,
    fontSize: 12,
    fontWeight: '800',
  },
  xpBarBg: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  themesPill: {
    backgroundColor: CLUB.glassBg,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  themesPillText: {
    color: CLUB.ivoryTop,
    fontSize: 12,
    fontWeight: '800',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 27, 14, 0.78)',
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    position: 'relative',
  },
  chipsPillReady: {
    borderColor: CLUB.gold,
  },
  chipsValue: {
    color: CLUB.gold,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CLUB.emerald,
  },
  gearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: CLUB.glassBg,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  brandKicker: {
    color: CLUB.goldSoft,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    opacity: 0.85,
  },
  brandTitle: {
    color: CLUB.ivoryTop,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  brandTitleAccent: {
    color: CLUB.gold,
  },
  brassRule: {
    width: 48,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 196, 81, 0.55)',
    marginTop: 2,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 38, 46, 0.86)',
    borderRadius: 20,
    borderWidth: 1.25,
    borderColor: 'rgba(245, 214, 138, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.42)',
  },
  hostAvatarWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarEditPill: {
    marginTop: -8,
    backgroundColor: '#1E3D49',
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
  },
  avatarEditPillText: {
    color: CLUB.goldSoft,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hostCopyCol: {
    flex: 1,
    gap: 3,
  },
  hostGreeting: {
    color: CLUB.ivoryTop,
    fontSize: 17,
    fontWeight: '900',
  },
  hostInvite: {
    color: CLUB.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  emblemTiles: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 66,
    height: 60,
    position: 'relative',
  },
  emblemTileBack: {
    position: 'absolute',
    left: 2,
    top: 4,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.88,
  },
  emblemTileFront: {
    position: 'absolute',
    right: 2,
    top: 2,
    transform: [{ rotate: '8deg' }],
  },
  maintenanceBanner: {
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
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
  lowerCluster: {
    gap: 10,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(24, 34, 34, 0.78)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.32)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  challengeTextCol: {
    flex: 1,
    gap: 1,
  },
  challengeTitle: {
    color: CLUB.ivoryTop,
    fontSize: 13,
    fontWeight: '800',
  },
  challengeSub: {
    color: CLUB.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  bonusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
  },
  bonusBadgeReady: {
    backgroundColor: CLUB.gold,
    borderColor: CLUB.goldSoft,
  },
  bonusBadgeText: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  bonusBadgeTextReady: {
    color: CLUB.textInk,
  },
  setupCard: {
    backgroundColor: CLUB.glassBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    padding: 12,
    gap: 11,
  },
  setupGroup: {
    gap: 6,
  },
  sectionLabel: {
    color: CLUB.textMuted,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modeSegmentedRow: {
    flexDirection: 'row',
    gap: 7,
  },
  modePill: {
    flex: 1,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: 'rgba(245, 196, 81, 0.16)',
    borderColor: CLUB.gold,
  },
  modePillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  modeTextCenter: {
    alignItems: 'center',
  },
  modePillTitle: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  modePillTitleActive: {
    color: CLUB.goldSoft,
  },
  modePillSub: {
    color: CLUB.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  modePillSubActive: {
    color: CLUB.gold,
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: CLUB.surfaceCardLight,
    borderWidth: 1,
    borderColor: CLUB.borderSubtle,
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
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreChipTextActive: {
    color: CLUB.textInk,
    fontWeight: '900',
  },
  thumbDock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 214, 138, 0.12)',
    backgroundColor: 'rgba(6, 17, 22, 0.92)',
  },
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    borderBottomWidth: 3.5,
    borderBottomColor: '#0D6840',
    boxShadow: '0px 8px 22px rgba(39, 209, 136, 0.28)',
  },
  primaryBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  primaryBtnGrad: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  primaryBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  primaryBtnText: {
    color: '#06291A',
    fontSize: 17,
    fontWeight: '900',
  },
  primaryBtnSub: {
    color: 'rgba(6, 41, 26, 0.80)',
    fontSize: 11.5,
    fontWeight: '800',
  },
  onlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  secondaryBtnWarm: {
    borderColor: 'rgba(245, 196, 81, 0.36)',
    backgroundColor: 'rgba(22, 42, 46, 0.92)',
  },
  secondaryBtnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  onlineBtnDisabled: {
    opacity: 0.45,
  },
  secondaryTextCol: {
    flex: 1,
  },
  onlineBtnTitle: {
    color: CLUB.ivoryTop,
    fontSize: 13.5,
    fontWeight: '900',
  },
  onlineBtnSub: {
    color: CLUB.textSecondary,
    fontSize: 10.5,
    fontWeight: '600',
  },
});
