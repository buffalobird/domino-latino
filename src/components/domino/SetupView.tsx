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

/**
 * Tactile 3D High-Contrast Home Screen matching the 4 user mockup architectures.
 * Tap the top palette pill to cycle live across Índigo Crema, Cacao Coral,
 * Noche Menta, Espresso Cielo, and Brisa Coral.
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
  const xpIntoLevel = Math.max(12, retention.xp % 100);
  const emblemTileUnit = isCompactH ? 24 : 27;

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <AmbientPaletteBackdrop />

      <View style={styles.shell}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyContent,
            isCompactH && { gap: 8, paddingTop: 4, paddingBottom: 6 },
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Tactile 3D Top Bar (Level + 1-Tap Palette Switcher + Mesas + Chips + Blue 3D Gear) */}
          <View style={styles.topStrip}>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: palette.levelPillBg,
                  borderBottomColor: palette.levelPillLip,
                  borderColor: 'rgba(255,255,255,0.28)',
                },
              ]}
            >
              <Text style={[styles.levelText, { color: palette.levelPillText }]}>
                Nv. {retention.level}
              </Text>
              <View style={styles.xpBarBg}>
                <View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${xpIntoLevel}%`,
                      backgroundColor: '#FFD166',
                    },
                  ]}
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
                  styles.topPill,
                  {
                    backgroundColor: palette.topPillBg,
                    borderBottomColor: palette.topPillLip,
                    borderColor: palette.topPillBorder,
                  },
                  pressed && styles.tactilePressed,
                ]}
              >
                <View style={styles.swatchDots}>
                  {palette.swatches.slice(1, 4).map((hex, i) => (
                    <View
                      key={i}
                      style={[
                        styles.swatchDot,
                        { backgroundColor: hex, borderColor: palette.topPillBg },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.topPillText, { color: palette.topPillText }]}>
                  {palette.shortLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onOpenThemes();
                }}
                accessibilityRole="button"
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
                <Text style={[styles.topPillText, { color: palette.topPillText }]}>
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
                    borderBottomColor: palette.topPillLip,
                    borderColor: hasDailyBonus ? palette.brandAccent : palette.topPillBorder,
                  },
                  pressed && styles.tactilePressed,
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
                    backgroundColor: palette.gearBg,
                    borderBottomColor: palette.gearLip,
                  },
                  pressed && styles.tactilePressed,
                ]}
              >
                <GearIcon size={18} color={palette.gearIcon} />
              </Pressable>
            </View>
          </View>

          {/* 2. Chunky 3D Extruded Brand Header */}
          <View style={[styles.brandBlock, isCompactH && { paddingVertical: 1 }]}>
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
                isCompactH && { fontSize: 30 },
              ]}
            >
              DOMINÓ{' '}
              <Text style={{ color: palette.titleSecondary }}>LATINO</Text>
            </Text>
          </View>

          {/* 3. High-Contrast Solid 3D Hero Greeting Card */}
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
              isCompactH && { paddingVertical: 10, paddingHorizontal: 12 },
              pressed && styles.tactilePressed,
            ]}
          >
            <View style={styles.cardTopGloss} pointerEvents="none" />
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
                  size={isCompactH ? 54 : 62}
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
                  Editar
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
              <Text style={[styles.maintenanceBannerText, { color: palette.dailyCardText }]}>
                {maintenanceBanner}
              </Text>
            </View>
          )}

          {/* 4. High-Contrast Tactile Daily Challenge Strip */}
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
                  size={18}
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

          {/* 5. Grouped Recessed Config Tray: 3 Tactile Mode Buttons + 6 Single-Row Score Chips */}
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
                      style={({ pressed }) => [
                        styles.modePill,
                        {
                          backgroundColor: active ? palette.modeSelectedBg : palette.modeBg,
                          borderColor: active ? palette.modeSelectedBorder : palette.modeBorder,
                          borderBottomColor: active ? palette.modeSelectedLip : palette.modeLip,
                        },
                        pressed && styles.tactilePressed,
                      ]}
                    >
                      <View style={styles.chipTopGloss} pointerEvents="none" />
                      <View style={styles.modePillInner}>
                        {renderSideIcon()}
                        <View style={styles.modeTextCenter}>
                          <Text
                            style={[
                              styles.modePillTitle,
                              { color: active ? palette.modeSelectedText : palette.modeText },
                            ]}
                            numberOfLines={1}
                          >
                            {opt.shortTitle}
                          </Text>
                          <Text
                            style={[
                              styles.modePillSub,
                              { color: active ? palette.modeSelectedSub : palette.modeSub },
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
                      style={({ pressed }) => [
                        styles.scoreChip,
                        {
                          backgroundColor: active ? palette.scoreSelectedBg : palette.scoreBg,
                          borderColor: active
                            ? palette.scoreSelectedBorder
                            : palette.scoreBorder,
                          borderBottomColor: active ? palette.scoreSelectedLip : palette.scoreLip,
                        },
                        pressed && styles.tactilePressed,
                      ]}
                    >
                      <View style={styles.scoreTopGloss} pointerEvents="none" />
                      <Text
                        style={[
                          styles.scoreChipText,
                          { color: active ? palette.scoreSelectedText : palette.scoreText },
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

          {/* 6. Compact 1-Row Account Bar */}
          <AccountCard onOpenAuth={onOpenAuth} />
        </ScrollView>

        {/* 7. Bottom Tactile 3D CTA & Online Buttons (Seamless on Canvas, ZERO heavy divider) */}
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
              style={styles.primaryBtnGrad}
            >
              <View style={styles.primaryBtnGloss} pointerEvents="none" />
              <View style={styles.primaryBtnTop}>
                <PlayIcon size={20} color={palette.textOnPrimary} />
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
                  Sala Privada
                </Text>
                <Text
                  style={[styles.onlineBtnSub, { color: palette.privateBtnSub }]}
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
    paddingTop: 6,
    paddingBottom: 6,
    gap: 11,
  },
  tactilePressed: {
    opacity: 0.92,
    transform: [{ translateY: 1.5 }],
  },
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '900',
  },
  xpBarBg: {
    width: 30,
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
    gap: 5,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  topPillText: {
    fontSize: 11.5,
    fontWeight: '800',
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
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderBottomWidth: 3,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },
  brandBlock: {
    alignItems: 'center',
    paddingVertical: 2,
    gap: 2,
  },
  brandKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.2,
    textShadowOffset: { width: 0, height: 3.5 },
    textShadowRadius: 0,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.24)',
  },
  cardTopGloss: {
    position: 'absolute',
    top: 2,
    left: 16,
    right: 16,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
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
    paddingVertical: 2,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
  },
  avatarEditPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  hostCopyCol: {
    flex: 1,
    gap: 3,
  },
  hostGreeting: {
    fontSize: 19,
    fontWeight: '900',
  },
  hostInvite: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17.5,
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
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    borderWidth: 1.25,
    borderBottomWidth: 4.5,
    paddingHorizontal: 13,
    paddingVertical: 10,
    boxShadow: '0px 5px 14px rgba(0, 0, 0, 0.2)',
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
    fontSize: 13.5,
    fontWeight: '900',
  },
  challengeSub: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  bonusBadge: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderBottomWidth: 3,
  },
  bonusBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  setupCard: {
    borderRadius: 22,
    borderWidth: 1.25,
    padding: 12,
    gap: 11,
  },
  setupGroup: {
    gap: 7,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginLeft: 2,
  },
  modeSegmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modePill: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1.25,
    borderBottomWidth: 4.5,
    paddingVertical: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.16)',
  },
  chipTopGloss: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    fontSize: 13.5,
    fontWeight: '900',
  },
  modePillSub: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
  },
  scoreTopGloss: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  scoreChipText: {
    fontSize: 13.5,
    fontWeight: '900',
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
    boxShadow: '0px 8px 22px rgba(0, 0, 0, 0.28)',
  },
  primaryBtnPressed: {
    opacity: 0.94,
    transform: [{ translateY: 2 }],
  },
  primaryBtnGrad: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  primaryBtnGloss: {
    position: 'absolute',
    top: 3,
    left: 18,
    right: 18,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
  primaryBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  primaryBtnSub: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.88,
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
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  },
  onlineBtnDisabled: {
    opacity: 0.45,
  },
  secondaryTextCol: {
    flex: 1,
  },
  onlineBtnTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  onlineBtnSub: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
