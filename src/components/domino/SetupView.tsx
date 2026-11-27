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
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
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

function AmbientPaletteBackdrop() {
  const { palette } = usePalette();
  return (
    <View style={styles.backdropLayer} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="palTop" cx="50%" cy="16%" r="58%">
            <Stop offset="0%" stopColor={palette.glowTop} stopOpacity={palette.glowTopOpacity} />
            <Stop offset="100%" stopColor={palette.bgTop} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="palBot" cx="50%" cy="88%" r="48%">
            <Stop
              offset="0%"
              stopColor={palette.glowBottom}
              stopOpacity={palette.glowBottomOpacity}
            />
            <Stop offset="100%" stopColor={palette.bgBottom} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#palTop)" />
        <Rect x={0} y={0} width={100} height={100} fill="url(#palBot)" />
      </Svg>
    </View>
  );
}

/**
 * Dynamically themed Home Screen driven 100% by `PaletteContext` so new color palettes
 * (daylight or nocturnal) can be tested live in 1 tap without rewriting screens.
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
  const { palette, cyclePalette } = usePalette();
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
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.45, 1]}
      style={styles.gradient}
    >
      <AmbientPaletteBackdrop />

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
          {/* 1. Top Club Bar (Level + 1-Tap Live Palette Lab + Boutique + Chips + Feedback) */}
          <View style={styles.topStrip}>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: palette.surfacePill,
                  borderColor: palette.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.levelText, { color: palette.textPrimary }]}>
                Nv. {retention.level}
              </Text>
              <View
                style={[
                  styles.xpBarBg,
                  {
                    backgroundColor: palette.isDark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(26,49,54,0.10)',
                  },
                ]}
              >
                <LinearGradient
                  colors={[palette.accent, palette.brandAccent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.xpBarFill, { width: `${xpIntoLevel}%` }]}
                />
              </View>
            </View>

            <View style={styles.topRightPills}>
              {/* 1-Tap Live Palette Lab Switcher */}
              <Pressable
                onPress={() => {
                  hapticLight();
                  cyclePalette();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Cambiar paleta de color, actual ${palette.name}`}
                style={({ pressed }) => [
                  styles.palettePill,
                  {
                    backgroundColor: palette.surfacePill,
                    borderColor: palette.borderSubtle,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.swatchDots}>
                  {palette.swatches.slice(0, 3).map((hex, i) => (
                    <View
                      key={i}
                      style={[
                        styles.swatchDot,
                        { backgroundColor: hex, borderColor: palette.surfaceCard },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.palettePillText, { color: palette.textPrimary }]}>
                  {palette.name.split(' ')[0]}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenThemes();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.themesPill,
                  {
                    backgroundColor: palette.surfacePill,
                    borderColor: palette.borderSubtle,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.themesPillText, { color: palette.textPrimary }]}>
                  Mesas
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenDailyRewards();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.chipsPill,
                  {
                    backgroundColor: palette.chipPillBg,
                    borderColor: hasDailyBonus ? palette.brandAccent : palette.borderWarm,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <ChipIcon size={14} color={palette.chipIconColor} />
                <Text style={[styles.chipsValue, { color: palette.chipPillText }]}>
                  {retention.clubChips.toLocaleString('es-ES')}
                </Text>
                {hasDailyBonus && (
                  <View style={[styles.readyDot, { backgroundColor: palette.brandAccent }]} />
                )}
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
                  {
                    backgroundColor: palette.surfacePill,
                    borderColor: palette.borderSubtle,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <GearIcon size={17} color={palette.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* 2. Brand Header */}
          <View style={[styles.brandBlock, isCompactH && { paddingVertical: 2 }]}>
            <Text style={[styles.brandKicker, { color: palette.textMuted }]}>
              LA SOBREMESA · DOBLE SEIS
            </Text>
            <Text
              style={[
                styles.brandTitle,
                { color: palette.textPrimary },
                isCompactH && { fontSize: 28 },
              ]}
            >
              DOMINÓ{' '}
              <Text style={{ color: palette.brandAccent }}>LATINO</Text>
            </Text>
            <View style={[styles.brassRule, { backgroundColor: palette.accent }]} />
          </View>

          {/* Signature Tactile Host Card: Live 2.5D Avatar + Warm Greeting + Real Porcelain Tiles */}
          <Pressable
            onPress={() => {
              hapticLight();
              onOpenAvatarStudio();
            }}
            accessibilityRole="button"
            accessibilityLabel="Personalizar mi avatar"
            style={({ pressed }) => [
              styles.hostCard,
              {
                backgroundColor: palette.surfaceHighlight,
                borderColor: palette.borderSubtle,
              },
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
              <View
                style={[
                  styles.avatarEditPill,
                  {
                    backgroundColor: palette.chipPillBg,
                    borderColor: palette.borderWarm,
                  },
                ]}
              >
                <Text style={[styles.avatarEditPillText, { color: palette.chipPillText }]}>
                  Editar
                </Text>
              </View>
            </View>

            <View style={styles.hostCopyCol}>
              <Text
                style={[styles.hostGreeting, { color: palette.textPrimary }]}
                numberOfLines={1}
              >
                {greeting}
              </Text>
              <Text
                style={[styles.hostInvite, { color: palette.textSecondary }]}
                numberOfLines={2}
              >
                {inviteLine}
              </Text>
            </View>

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
            <View
              style={[
                styles.maintenanceBanner,
                {
                  backgroundColor: palette.chipPillBg,
                  borderColor: palette.borderWarm,
                },
              ]}
            >
              <Text style={[styles.maintenanceBannerText, { color: palette.chipPillText }]}>
                {maintenanceBanner}
              </Text>
            </View>
          )}

          {/* 3–5. Lower Interactive Cluster */}
          <View style={styles.lowerCluster}>
            {/* 3. Daily Challenge Card */}
            <Pressable
              onPress={() => {
                hapticLight();
                onOpenDailyRewards();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.challengeCard,
                {
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderSubtle,
                },
                pressed && { opacity: 0.92 },
              ]}
            >
              <View style={styles.starsRow}>
                {[0, 1, 2].map((idx) => (
                  <StarIcon
                    key={idx}
                    size={17}
                    color={idx < retention.dailyStars ? palette.starColor : palette.starMuted}
                    filled={idx < retention.dailyStars}
                  />
                ))}
              </View>
              <View style={styles.challengeTextCol}>
                <Text
                  style={[styles.challengeTitle, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {remainingStars === 0
                    ? 'Reto diario completado'
                    : `Reto diario · ${retention.dailyStars}/3`}
                </Text>
                <Text
                  style={[styles.challengeSub, { color: palette.textSecondary }]}
                  numberOfLines={1}
                >
                  {hasDailyBonus
                    ? 'Tu bono de bienvenida de hoy está listo'
                    : `Racha ${retention.winStreak} · Mejor ${retention.bestStreak}`}
                </Text>
              </View>
              <View
                style={[
                  styles.bonusBadge,
                  {
                    backgroundColor: hasDailyBonus ? palette.chipPillBg : palette.surfaceCardAlt,
                    borderColor: hasDailyBonus ? palette.borderWarm : palette.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bonusBadgeText,
                    { color: hasDailyBonus ? palette.chipPillText : palette.textSecondary },
                  ]}
                >
                  {hasDailyBonus ? 'Reclamar' : 'Bonos'}
                </Text>
              </View>
            </Pressable>

            {/* 4. Table Setup Card */}
            <View
              style={[
                styles.setupCard,
                {
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderSubtle,
                },
              ]}
            >
              <View style={styles.setupGroup}>
                <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
                  MODALIDAD
                </Text>
                <View style={styles.modeSegmentedRow}>
                  {MODE_OPTIONS.map((opt) => {
                    const active = mode === opt.value;
                    const silColor = active ? palette.selectedText : palette.textMuted;
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
                        style={[
                          styles.modePill,
                          {
                            backgroundColor: active ? palette.selectedBg : palette.surfaceCardAlt,
                            borderColor: active ? palette.selectedBorder : palette.borderSubtle,
                          },
                        ]}
                      >
                        <View style={styles.modePillInner}>
                          {renderSideIcon()}
                          <View style={styles.modeTextCenter}>
                            <Text
                              style={[
                                styles.modePillTitle,
                                { color: active ? palette.selectedText : palette.textPrimary },
                              ]}
                              numberOfLines={1}
                            >
                              {opt.shortTitle}
                            </Text>
                            <Text
                              style={[
                                styles.modePillSub,
                                { color: active ? palette.selectedSubText : palette.textMuted },
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
                <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
                  META DE PUNTOS
                </Text>
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
                        style={[
                          styles.scoreChip,
                          {
                            backgroundColor: active ? palette.selectedBg : palette.surfaceCardAlt,
                            borderColor: active ? palette.selectedBorder : palette.borderSubtle,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreChipText,
                            { color: active ? palette.selectedText : palette.textSecondary },
                            active && { fontWeight: '900' },
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

        {/* BOTTOM STICKY THUMB DOCK */}
        <View
          style={[
            styles.thumbDock,
            {
              backgroundColor: palette.dockBg,
              borderTopColor: palette.dockBorder,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              hapticSnap();
              onStartQuickMatch();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryBtnOuter,
              { borderBottomColor: palette.primaryShadow },
              pressed && styles.primaryBtnPressed,
            ]}
          >
            <LinearGradient
              colors={[palette.primaryTop, palette.primaryMid, palette.primaryBottom]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.primaryBtnGrad}
            >
              <View style={styles.primaryBtnTop}>
                <PlayIcon size={19} color={palette.textOnPrimary} />
                <Text style={[styles.primaryBtnText, { color: palette.textOnPrimary }]}>
                  Jugar ahora
                </Text>
              </View>
              <Text style={[styles.primaryBtnSub, { color: palette.textOnPrimary }]}>
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
                {
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderAccent,
                },
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <GlobeIcon size={19} color={palette.accent} />
              <View style={styles.secondaryTextCol}>
                <Text
                  style={[styles.onlineBtnTitle, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  Salas Online
                </Text>
                <Text
                  style={[styles.onlineBtnSub, { color: palette.textSecondary }]}
                  numberOfLines={1}
                >
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
                {
                  backgroundColor: palette.surfaceCard,
                  borderColor: palette.borderSubtle,
                },
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <KeyIcon size={18} color={palette.brandAccent} />
              <View style={styles.secondaryTextCol}>
                <Text
                  style={[styles.onlineBtnTitle, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  Sala Privada
                </Text>
                <Text
                  style={[styles.onlineBtnSub, { color: palette.textSecondary }]}
                  numberOfLines={1}
                >
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
    gap: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  xpBarBg: {
    width: 34,
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  palettePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  swatchDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: -2,
  },
  palettePillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  themesPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  themesPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipsValue: {
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    paddingVertical: 3,
    gap: 2,
  },
  brandKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  brassRule: {
    width: 48,
    height: 2.5,
    borderRadius: 999,
    marginTop: 2,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1.25,
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: '0px 8px 20px rgba(26, 49, 54, 0.10)',
  },
  hostAvatarWrap: {
    alignItems: 'center',
  },
  avatarEditPill: {
    marginTop: -8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
  },
  avatarEditPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hostCopyCol: {
    flex: 1,
    gap: 3,
  },
  hostGreeting: {
    fontSize: 17,
    fontWeight: '900',
  },
  hostInvite: {
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
    opacity: 0.9,
  },
  emblemTileFront: {
    position: 'absolute',
    right: 2,
    top: 2,
    transform: [{ rotate: '8deg' }],
  },
  maintenanceBanner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  maintenanceBannerText: {
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
    borderRadius: 16,
    borderWidth: 1,
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
    fontSize: 13,
    fontWeight: '800',
  },
  challengeSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  bonusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  bonusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  setupCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 11,
  },
  setupGroup: {
    gap: 6,
  },
  sectionLabel: {
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
    borderRadius: 13,
    borderWidth: 1.25,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '900',
  },
  modePillSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  thumbDock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  primaryBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    borderBottomWidth: 3.5,
    boxShadow: '0px 8px 20px rgba(237, 106, 90, 0.28)',
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
    fontSize: 17,
    fontWeight: '900',
  },
  primaryBtnSub: {
    fontSize: 11.5,
    fontWeight: '800',
    opacity: 0.88,
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
    borderRadius: 14,
    borderWidth: 1.25,
    paddingHorizontal: 12,
    paddingVertical: 11,
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
    fontSize: 13.5,
    fontWeight: '900',
  },
  onlineBtnSub: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
