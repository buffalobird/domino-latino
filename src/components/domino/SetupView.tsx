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
import { FONT } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { GameMode, TargetScore, UI_TARGET_SCORES } from '@/engine/types';
import { canClaimDailyReward, RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
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
  TableIcon,
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
  onOpenSettings: () => void;
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
    subtitle: 'Con pozo',
    ctaLabel: '1 vs 1 con Pozo',
  },
  {
    value: '2v2',
    shortTitle: '2 vs 2',
    subtitle: 'Parejas',
    ctaLabel: '2 vs 2 en Parejas',
  },
  {
    value: '4ffa',
    shortTitle: '4 Jug.',
    subtitle: 'Individual',
    ctaLabel: 'Mesa de 4',
  },
];

function AmbientPaletteBackdrop() {
  const { palette } = usePalette();
  return (
    <View style={styles.backdropLayer} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="palTop" cx="50%" cy="14%" r="60%">
            <Stop
              offset="0%"
              stopColor={palette.glowTop}
              stopOpacity={palette.glowTopOpacity}
            />
            <Stop offset="100%" stopColor={palette.bgTop} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="palBot" cx="50%" cy="88%" r="52%">
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
  onOpenSettings,
}: SetupViewProps) {
  const { profile, isSignedIn } = useAuth();
  const { palette } = usePalette();
  const { height: winH } = useWindowDimensions();
  const isCompactH = winH < 760;

  const { greeting, inviteLine } = getWarmHostGreeting(profile?.displayName);
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedMode = MODE_OPTIONS.find((m) => m.value === mode) ?? MODE_OPTIONS[0];
  const hasDailyBonus = canClaimDailyReward(retention);
  const xpIntoLevel = Math.max(12, retention.xp % 100);
  const emblemTileUnit = isCompactH ? 25 : 28;
  const effectiveScoreOptions = UI_TARGET_SCORES.includes(targetScore)
    ? UI_TARGET_SCORES
    : [...UI_TARGET_SCORES.slice(0, 3), targetScore];

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.52, 1]}
      style={styles.gradient}
    >
      <AmbientPaletteBackdrop />

      <View style={styles.shell}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyContent,
            isCompactH && { gap: 9, paddingTop: 4, paddingBottom: 6 },
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Balanced 3-Cluster Header: Level/Account · Mesas & Chips · Real Settings */}
          <View style={styles.topStrip}>
            <Pressable
              onPress={() => {
                hapticLight();
                onOpenSettings();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Nivel ${retention.level}`}
              style={({ pressed }) => [
                styles.levelBadge,
                {
                  backgroundColor: palette.levelPillBg,
                  borderBottomColor: palette.levelPillLip,
                  borderColor: palette.topPillBorder,
                },
                pressed && styles.tactilePressed,
              ]}
            >
              {isSignedIn && (
                <View
                  style={[styles.syncDot, { backgroundColor: palette.accent }]}
                />
              )}
              <Text style={[styles.levelText, { color: palette.levelPillText }]}>
                Nv. {retention.level}
              </Text>
              <View style={styles.xpBarBg}>
                <View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${xpIntoLevel}%`,
                      backgroundColor: palette.starColor,
                    },
                  ]}
                />
              </View>
            </Pressable>

            <View style={styles.topRightPills}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenThemes();
                }}
                accessibilityRole="button"
                accessibilityLabel="Personalizar mesas y fichas"
                style={({ pressed }) => [
                  styles.topPill,
                  {
                    backgroundColor: palette.topPillBg,
                    borderBottomColor: palette.topPillLip,
                    borderColor: palette.topPillBorder,
                  },
                  pressed && styles.tactilePressed,
                ]}
              >
                <TableIcon size={14} color={palette.brandAccent} />
                <Text style={[styles.topPillText, { color: palette.topPillText }]}>
                  Estilo
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenDailyRewards();
                }}
                accessibilityRole="button"
                accessibilityLabel={`${retention.clubChips} fichas de club`}
                style={({ pressed }) => [
                  styles.chipsPill,
                  {
                    backgroundColor: palette.chipPillBg,
                    borderBottomColor: palette.topPillLip,
                    borderColor: hasDailyBonus
                      ? palette.brandAccent
                      : palette.topPillBorder,
                  },
                  pressed && styles.tactilePressed,
                ]}
              >
                <ChipIcon size={15} color={palette.chipIconColor} />
                <Text style={[styles.chipsValue, { color: palette.chipPillText }]}>
                  {retention.clubChips.toLocaleString('es-ES')}
                </Text>
                {hasDailyBonus && (
                  <View
                    style={[styles.readyDot, { backgroundColor: palette.brandAccent }]}
                  />
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenSettings();
                }}
                accessibilityRole="button"
                accessibilityLabel="Abrir ajustes"
                style={({ pressed }) => [
                  styles.gearBtn,
                  {
                    backgroundColor: palette.gearBg,
                    borderBottomColor: palette.gearLip,
                    borderColor: palette.topPillBorder,
                  },
                  pressed && styles.tactilePressed,
                ]}
              >
                <GearIcon size={18} color={palette.gearIcon} />
              </Pressable>
            </View>
          </View>

          {/* 2. Sculpted Rounded Brand Emblem */}
          <View style={[styles.brandBlock, isCompactH && { paddingVertical: 2 }]}>
            <Text style={[styles.brandKicker, { color: palette.kickerColor }]}>
              LA SOBREMESA · DOBLE SEIS
            </Text>
            <Text
              style={[
                styles.brandTitle,
                {
                  color: palette.titlePrimary,
                  textShadowColor: palette.titleShadow,
                },
                isCompactH && { fontSize: 33 },
              ]}
            >
              DOMINÓ{' '}
              <Text style={{ color: palette.titleSecondary }}>LATINO</Text>
            </Text>
          </View>

          {/* 3. Luminous Host Greeting & Avatar Card */}
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
                backgroundColor: palette.heroCardBg,
                borderColor: palette.heroCardBorder,
                borderBottomColor: palette.heroCardLip,
              },
              isCompactH && { paddingVertical: 11, paddingHorizontal: 13 },
              pressed && styles.tactilePressed,
            ]}
          >
            <View style={styles.hostAvatarWrap}>
              <View
                style={[
                  styles.heroAvatarHalo,
                  {
                    borderColor: palette.heroAvatarRing,
                    backgroundColor: palette.heroAvatarRing,
                  },
                ]}
              >
                <ModularAvatar
                  config={retention.avatarConfig}
                  size={isCompactH ? 58 : 66}
                  showFrameRing={false}
                />
              </View>
              <View
                style={[
                  styles.avatarEditPill,
                  { backgroundColor: palette.heroEditBg },
                ]}
              >
                <Text style={[styles.avatarEditPillText, { color: palette.heroEditText }]}>
                  Vestidor
                </Text>
              </View>
            </View>

            <View style={styles.hostCopyCol}>
              <Text
                style={[styles.hostGreeting, { color: palette.heroCardText }]}
                numberOfLines={1}
              >
                {greeting}
              </Text>
              <Text
                style={[styles.hostInvite, { color: palette.heroCardSub }]}
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
                  backgroundColor: palette.dailyCardBg,
                  borderColor: palette.brandAccent,
                },
              ]}
            >
              <Text
                style={[styles.maintenanceBannerText, { color: palette.dailyCardText }]}
              >
                {maintenanceBanner}
              </Text>
            </View>
          )}

          {/* 4. Daily Challenge & Streak Strip */}
          <Pressable
            onPress={() => {
              hapticLight();
              onOpenDailyRewards();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.challengeCard,
              {
                backgroundColor: palette.dailyCardBg,
                borderColor: palette.dailyCardBorder,
                borderBottomColor: palette.dailyCardLip,
              },
              pressed && styles.tactilePressed,
            ]}
          >
            <View style={styles.starsRow}>
              {[0, 1, 2].map((idx) => (
                <StarIcon
                  key={idx}
                  size={19}
                  color={idx < retention.dailyStars ? palette.starColor : palette.starMuted}
                  filled={idx < retention.dailyStars}
                />
              ))}
            </View>
            <View style={styles.challengeTextCol}>
              <Text
                style={[styles.challengeTitle, { color: palette.dailyCardText }]}
                numberOfLines={1}
              >
                {remainingStars === 0
                  ? 'Reto diario completado'
                  : `Reto diario · ${retention.dailyStars}/3`}
              </Text>
              <Text
                style={[styles.challengeSub, { color: palette.dailyCardSub }]}
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
                  backgroundColor: palette.dailyBtnBg,
                  borderBottomColor: palette.dailyBtnLip,
                },
              ]}
            >
              <Text style={[styles.bonusBadgeText, { color: palette.dailyBtnText }]}>
                {hasDailyBonus ? 'Reclamar' : 'Bonos'}
              </Text>
            </View>
          </Pressable>

          {/* 5. Clean Match Setup Tray: 3 Modes + 4 Classic Score Goals (50 · 100 · 150 · 200) */}
          <View
            style={[
              styles.setupCard,
              {
                backgroundColor: palette.trayBg,
                borderColor: palette.trayBorder,
              },
            ]}
          >
            <View style={styles.setupGroup}>
              <Text style={[styles.sectionLabel, { color: palette.trayLabel }]}>
                MODALIDAD
              </Text>
              <View style={styles.modeSegmentedRow}>
                {MODE_OPTIONS.map((opt) => {
                  const active = mode === opt.value;
                  const silColor = active ? palette.modeSelectedText : palette.modeText;
                  const renderSideIcon = () =>
                    opt.value === '1v1' ? (
                      <UserSilhouetteIcon size={15} color={silColor} />
                    ) : opt.value === '2v2' ? (
                      <PairSilhouetteIcon size={17} color={silColor} />
                    ) : (
                      <DuoSoloSilhouetteIcon size={16} color={silColor} />
                    );

                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        hapticLight();
                        onChangeMode(opt.value);
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.modePill,
                        {
                          backgroundColor: active ? palette.modeSelectedBg : palette.modeBg,
                          borderColor: active
                            ? palette.modeSelectedBorder
                            : palette.modeBorder,
                          borderBottomColor: active
                            ? palette.modeSelectedLip
                            : palette.modeLip,
                        },
                        pressed && styles.tactilePressed,
                      ]}
                    >
                      <View style={styles.modePillInner}>
                        {renderSideIcon()}
                        <View style={styles.modeTextCenter}>
                          <Text
                            style={[
                              styles.modePillTitle,
                              {
                                color: active
                                  ? palette.modeSelectedText
                                  : palette.modeText,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {opt.shortTitle}
                          </Text>
                          <Text
                            style={[
                              styles.modePillSub,
                              {
                                color: active ? palette.modeSelectedSub : palette.modeSub,
                              },
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
              <Text style={[styles.sectionLabel, { color: palette.trayLabel }]}>
                META DE PUNTOS
              </Text>
              <View style={styles.scoreSingleRow}>
                {effectiveScoreOptions.map((pts) => {
                  const active = targetScore === pts;
                  return (
                    <Pressable
                      key={pts}
                      onPress={() => {
                        hapticLight();
                        onChangeTargetScore(pts);
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.scoreChip,
                        {
                          backgroundColor: active
                            ? palette.scoreSelectedBg
                            : palette.scoreBg,
                          borderColor: active
                            ? palette.scoreSelectedBorder
                            : palette.scoreBorder,
                          borderBottomColor: active
                            ? palette.scoreSelectedLip
                            : palette.scoreLip,
                        },
                        pressed && styles.tactilePressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreChipText,
                          {
                            color: active
                              ? palette.scoreSelectedText
                              : palette.scoreText,
                          },
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
        </ScrollView>

        {/* 6. Bottom Thumb Dock: Primary CTA + Two Social Doors */}
        <View style={styles.thumbDock}>
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
              style={[
                styles.primaryBtnGrad,
                {
                  borderColor: palette.isDark
                    ? 'rgba(187, 247, 208, 0.45)'
                    : 'rgba(255, 255, 255, 0.44)',
                  borderTopColor: 'rgba(255, 255, 255, 0.52)',
                },
              ]}
            >
              <View style={styles.primaryBtnTop}>
                <PlayIcon size={20} color={palette.textOnPrimary} />
                <Text style={[styles.primaryBtnText, { color: palette.textOnPrimary }]}>
                  Jugar ahora
                </Text>
              </View>
              <Text style={[styles.primaryBtnSub, { color: palette.textOnPrimary }]}>
                {selectedMode.ctaLabel} · A {targetScore} puntos
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
                  backgroundColor: palette.onlineBtnBg,
                  borderColor: palette.onlineBtnBorder,
                  borderBottomColor: palette.onlineBtnLip,
                },
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.tactilePressed,
              ]}
            >
              <GlobeIcon size={20} color={palette.onlineIconColor} />
              <View style={styles.secondaryTextCol}>
                <Text
                  style={[styles.onlineBtnTitle, { color: palette.onlineBtnText }]}
                  numberOfLines={1}
                >
                  Salas Online
                </Text>
                <Text
                  style={[styles.onlineBtnSub, { color: palette.onlineBtnSub }]}
                  numberOfLines={1}
                >
                  {onlineEnabled ? 'Mesas abiertas' : 'Mantenimiento'}
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
                  backgroundColor: palette.privateBtnBg,
                  borderColor: palette.privateBtnBorder,
                  borderBottomColor: palette.privateBtnLip,
                },
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.tactilePressed,
              ]}
            >
              <KeyIcon size={19} color={palette.privateIconColor} />
              <View style={styles.secondaryTextCol}>
                <Text
                  style={[styles.onlineBtnTitle, { color: palette.privateBtnText }]}
                  numberOfLines={1}
                >
                  Con Amigos
                </Text>
                <Text
                  style={[styles.onlineBtnSub, { color: palette.privateBtnSub }]}
                  numberOfLines={1}
                >
                  {onlineEnabled ? 'Sala privada' : 'Mantenimiento'}
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
    gap: 12,
  },
  tactilePressed: {
    opacity: 0.93,
    transform: [{ translateY: 1.5 }],
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
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  levelText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  xpBarBg: {
    width: 34,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
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
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  topPillText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  chipsValue: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  brandKicker: {
    fontFamily: FONT.extraBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
  },
  brandTitle: {
    fontFamily: FONT.display,
    fontSize: 36,
    letterSpacing: 0.8,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 24,
    borderWidth: 1.5,
    borderTopWidth: 2,
    borderBottomWidth: 5,
    paddingHorizontal: 15,
    paddingVertical: 14,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 8px 22px rgba(0, 0, 0, 0.22)',
  },
  hostAvatarWrap: {
    alignItems: 'center',
  },
  heroAvatarHalo: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
  },
  avatarEditPill: {
    marginTop: -9,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.22)',
  },
  avatarEditPillText: {
    fontFamily: FONT.extraBold,
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
  hostCopyCol: {
    flex: 1,
    gap: 3,
  },
  hostGreeting: {
    fontFamily: FONT.display,
    fontSize: 19.5,
  },
  hostInvite: {
    fontFamily: FONT.semi,
    fontSize: 13,
    lineHeight: 18,
  },
  emblemTiles: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 68,
    height: 62,
    position: 'relative',
  },
  emblemTileBack: {
    position: 'absolute',
    left: 2,
    top: 4,
    transform: [{ rotate: '-11deg' }],
  },
  emblemTileFront: {
    position: 'absolute',
    right: 2,
    top: 2,
    transform: [{ rotate: '8deg' }],
  },
  maintenanceBanner: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  maintenanceBannerText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 20,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    boxShadow: '0px 5px 14px rgba(0, 0, 0, 0.16)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  challengeTextCol: {
    flex: 1,
    gap: 1,
  },
  challengeTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
  },
  challengeSub: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
  },
  bonusBadge: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderBottomWidth: 3,
  },
  bonusBadgeText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  setupCard: {
    borderRadius: 22,
    borderWidth: 1.25,
    padding: 13,
    gap: 12,
  },
  setupGroup: {
    gap: 7,
  },
  sectionLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 1.1,
    marginLeft: 2,
  },
  modeSegmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modePill: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.25,
    borderTopWidth: 1.5,
    borderBottomWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  modePillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeTextCenter: {
    alignItems: 'center',
  },
  modePillTitle: {
    fontFamily: FONT.display,
    fontSize: 14.5,
  },
  modePillSub: {
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.25,
    borderTopWidth: 1.5,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipText: {
    fontFamily: FONT.display,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  thumbDock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  primaryBtnOuter: {
    borderRadius: 22,
    overflow: 'hidden',
    borderBottomWidth: 5,
    boxShadow: '0px 8px 22px rgba(0, 0, 0, 0.24)',
  },
  primaryBtnPressed: {
    opacity: 0.95,
    transform: [{ translateY: 2 }],
  },
  primaryBtnGrad: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderTopWidth: 1.75,
    borderRadius: 21,
  },
  primaryBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: FONT.display,
    fontSize: 21,
    letterSpacing: 0.3,
  },
  primaryBtnSub: {
    fontFamily: FONT.bold,
    fontSize: 12,
    opacity: 0.9,
  },
  onlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 17,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  onlineBtnDisabled: {
    opacity: 0.45,
  },
  secondaryTextCol: {
    flex: 1,
  },
  onlineBtnTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  onlineBtnSub: {
    fontFamily: FONT.semi,
    fontSize: 11,
  },
});
