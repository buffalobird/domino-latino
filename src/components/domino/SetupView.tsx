import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { CLUB } from '@/constants/tokens';
import { GameMode, TARGET_SCORES, TargetScore } from '@/engine/types';
import { canClaimDailyReward, RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AccountCard } from './AccountCard';
import {
  GearIcon,
  GlobeIcon,
  KeyIcon,
  PlayIcon,
  StarIcon,
  UserSilhouetteIcon,
} from './Icons';

const TITLE_LOGO_IMG = require('@/assets/images/domino-title-logo.png');
const HERO_CHARACTERS_IMG = require('@/assets/images/home-hero-characters.png');

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

const STARFIELD_DOTS: { cx: number; cy: number; r: number; fill: string; o: number }[] = [
  { cx: 14, cy: 16, r: 1.3, fill: '#93C5FD', o: 0.5 },
  { cx: 82, cy: 14, r: 1.1, fill: '#FDE68A', o: 0.45 },
  { cx: 26, cy: 28, r: 1.5, fill: '#67E8F9', o: 0.4 },
  { cx: 89, cy: 26, r: 1.4, fill: '#93C5FD', o: 0.5 },
  { cx: 9, cy: 36, r: 1.1, fill: '#FFFFFF', o: 0.35 },
  { cx: 74, cy: 34, r: 1.0, fill: '#FDE68A', o: 0.4 },
  { cx: 18, cy: 84, r: 1.8, fill: '#4ADE80', o: 0.55 },
  { cx: 84, cy: 83, r: 1.6, fill: '#4ADE80', o: 0.5 },
  { cx: 77, cy: 80, r: 2.2, fill: '#86EFAC', o: 0.45 },
  { cx: 24, cy: 90, r: 1.3, fill: '#60A5FA', o: 0.45 },
  { cx: 90, cy: 88, r: 1.4, fill: '#C084FC', o: 0.45 },
];

function AmbientStarfieldBackdrop() {
  return (
    <View style={styles.backdropLayer} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="heroGlow" cx="50%" cy="24%" r="48%">
            <Stop offset="0%" stopColor="#1A4278" stopOpacity={0.48} />
            <Stop offset="60%" stopColor="#0C1E3B" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#081327" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="dockGlow" cx="50%" cy="86%" r="44%">
            <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.22} />
            <Stop offset="65%" stopColor="#16A34A" stopOpacity={0.05} />
            <Stop offset="100%" stopColor="#081327" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#heroGlow)" />
        <Rect x={0} y={0} width={100} height={100} fill="url(#dockGlow)" />
        {STARFIELD_DOTS.map((d, i) => (
          <Circle key={i} cx={d.cx} cy={d.cy} r={d.r * 0.45} fill={d.fill} opacity={d.o} />
        ))}
      </Svg>
    </View>
  );
}

/**
 * Glossy 3D Arcade Club Caribe Home Screen:
 * - Midnight starfield canvas + 3D "DOMINÓ LATINO" logo & Pixar-style faceoff artwork.
 * - Golden-glow Daily Challenge card + frosted-glass 0-scroll Setup card with luminous gold chips.
 * - Sticky bottom thumb dock with glossy specular emerald Play CTA + Cobalt/Purple Online CTAs.
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
  const { height: winH } = useWindowDimensions();
  const isCompactH = winH < 780;
  // Dynamically size 3D hero artwork so the ENTIRE Home screen fits 0-scroll on every portrait phone
  const logoH = Math.round(Math.max(66, Math.min(104, winH * 0.112)));
  const charsH = Math.round(Math.max(76, Math.min(120, winH * 0.132)));

  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedMode = MODE_OPTIONS.find((m) => m.value === mode) ?? MODE_OPTIONS[0];
  const hasDailyBonus = canClaimDailyReward(retention);
  const xpIntoLevel = Math.max(8, retention.xp % 100);

  return (
    <LinearGradient
      colors={['#071124', '#081327', '#0A1830', '#060E1F']}
      locations={[0, 0.35, 0.72, 1]}
      style={styles.gradient}
    >
      <AmbientStarfieldBackdrop />

      <View style={styles.shell}>
        {/* TOP + MIDDLE: 0-scroll fit on all portrait phones; scrolls gracefully only on tiny/landscape */}
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyContent,
            isCompactH && { gap: 7, paddingTop: 4, paddingBottom: 6 },
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Top Frosted HUD Bar */}
          <View style={styles.topStrip}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nv. {retention.level}</Text>
              <View style={styles.xpBarBg}>
                <LinearGradient
                  colors={['#67E8F9', '#38BDF8']}
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
                  styles.gearOrbWrap,
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                <LinearGradient
                  colors={['#60A5FA', '#2563EB', '#1D4ED8']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.gearOrb}
                >
                  <View style={styles.orbGloss} pointerEvents="none" />
                  <GearIcon size={19} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* 2. 3D Illustrated Hero Stage (Height-scaled for 0-scroll portrait fit) */}
          <View style={styles.heroStage}>
            <Image
              source={TITLE_LOGO_IMG}
              style={[styles.logoImage, { height: logoH, width: Math.round(logoH * (880 / 453)) }]}
              resizeMode="contain"
              accessibilityLabel="Dominó Latino"
            />
            <Text style={styles.heroSub}>Club Caribe · Doble Seis</Text>
            <Image
              source={HERO_CHARACTERS_IMG}
              style={[
                styles.charactersImage,
                { height: charsH, width: Math.round(charsH * (960 / 431)) },
              ]}
              resizeMode="contain"
              accessibilityLabel="Jugador y Bot frente a frente con fichas de dominó"
            />
          </View>

          {maintenanceBanner && (
            <View style={styles.maintenanceBanner}>
              <Text style={styles.maintenanceBannerText}>{maintenanceBanner}</Text>
            </View>
          )}

          {/* 3–5. Lower Interactive Cluster anchored seamlessly above Thumb Dock */}
          <View style={styles.lowerCluster}>
            {/* 3. Golden-Glow Daily Challenge Card */}
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
                    size={18}
                    color={idx < retention.dailyStars ? '#F5C451' : 'rgba(245,196,81,0.35)'}
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
                    ? 'Bono diario de fichas listo'
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

            {/* 4. Frosted Glass Configuration Card */}
            <View style={styles.setupCard}>
              <View style={styles.setupGroup}>
                <Text style={styles.sectionLabel}>MODALIDAD</Text>
                <View style={styles.modeSegmentedRow}>
                  {MODE_OPTIONS.map((opt) => {
                    const active = mode === opt.value;
                    const silColor = active ? '#E8B84B' : 'rgba(148, 178, 214, 0.45)';
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
                          <UserSilhouetteIcon size={13} color={silColor} />
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
                          <UserSilhouetteIcon size={13} color={silColor} />
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
                        style={[styles.scoreChipWrap, active && styles.scoreChipGlow]}
                      >
                        {active ? (
                          <LinearGradient
                            colors={['#FFF2A6', '#F7C948', '#E39D1E']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={styles.scoreChipActiveGrad}
                          >
                            <Text style={styles.scoreChipTextActive}>{pts}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.scoreChip}>
                            <Text style={styles.scoreChipText}>{pts}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 5. Slim Frosted OAuth Row */}
            <AccountCard />
          </View>
        </ScrollView>

        {/* BOTTOM STICKY THUMB DOCK (Glossy Candy-Glass Arcade CTAs) */}
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
              colors={['#7DF6B6', '#33D982', '#17A459']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.primaryBtnGrad}
            >
              {/* Glossy top-half specular glass highlight */}
              <View style={styles.btnGlossTop} pointerEvents="none" />
              <View style={styles.primaryBtnTop}>
                <PlayIcon size={20} color="#06311B" />
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
                styles.secondaryBtnOuter,
                styles.onlineShadow,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <LinearGradient
                colors={['#4393FF', '#2264DF', '#1646A8']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.secondaryBtnGrad}
              >
                <View style={styles.secondaryGlossTop} pointerEvents="none" />
                <GlobeIcon size={21} color="#E0F2FE" />
                <View style={styles.secondaryTextCol}>
                  <Text style={styles.onlineBtnTitle} numberOfLines={1}>
                    Salas Online
                  </Text>
                  <Text style={styles.onlineBtnSub} numberOfLines={1}>
                    {onlineEnabled ? 'Mesas públicas' : 'Mantenimiento'}
                  </Text>
                </View>
              </LinearGradient>
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
                styles.secondaryBtnOuter,
                styles.privateShadow,
                !onlineEnabled && styles.onlineBtnDisabled,
                pressed && onlineEnabled && styles.secondaryBtnPressed,
              ]}
            >
              <LinearGradient
                colors={['#B35CFF', '#8A2EE5', '#6418B5']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.secondaryBtnGrad}
              >
                <View style={styles.secondaryGlossTop} pointerEvents="none" />
                <KeyIcon size={20} color="#F5E8FF" />
                <View style={styles.secondaryTextCol}>
                  <Text style={styles.onlineBtnTitle} numberOfLines={1}>
                    Sala Privada
                  </Text>
                  <Text style={styles.onlineBtnSub} numberOfLines={1}>
                    {onlineEnabled ? 'Con amigos' : 'Mantenimiento'}
                  </Text>
                </View>
              </LinearGradient>
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
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 7,
    gap: 8,
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
    backgroundColor: 'rgba(26, 46, 78, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.24)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  levelText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
  },
  xpBarBg: {
    width: 52,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(7, 15, 29, 0.65)',
    borderWidth: 0.75,
    borderColor: 'rgba(148, 190, 255, 0.16)',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  themesPill: {
    backgroundColor: 'rgba(26, 46, 78, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.24)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  themesPillText: {
    color: '#E2ECF8',
    fontSize: 13,
    fontWeight: '800',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 28, 16, 0.72)',
    borderWidth: 1.25,
    borderColor: 'rgba(245, 196, 81, 0.65)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipsPillReady: {
    borderColor: '#F5C451',
    boxShadow: '0px 0px 12px rgba(245, 196, 81, 0.35)',
  },
  chipsValue: {
    color: '#F5C451',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
  },
  gearOrbWrap: {
    borderRadius: 20,
    boxShadow: '0px 0px 16px rgba(56, 189, 248, 0.55)',
  },
  gearOrb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(147, 213, 255, 0.65)',
    overflow: 'hidden',
  },
  orbGloss: {
    position: 'absolute',
    top: 2,
    left: 5,
    right: 5,
    height: 13,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  heroStage: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  logoImage: {
    maxWidth: '72%',
  },
  heroSub: {
    color: '#D5E3F5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: -3,
    marginBottom: 1,
  },
  charactersImage: {
    maxWidth: '92%',
  },
  maintenanceBanner: {
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  maintenanceBannerText: {
    color: CLUB.goldSoft,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  lowerCluster: {
    gap: 8,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(34, 27, 16, 0.66)',
    borderRadius: 15,
    borderWidth: 1.25,
    borderColor: 'rgba(245, 196, 81, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    boxShadow: '0px 0px 20px rgba(245, 196, 81, 0.22)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  challengeTextCol: {
    flex: 1,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  challengeSub: {
    color: '#E5C67E',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  bonusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 196, 81, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.58)',
  },
  bonusBadgeReady: {
    backgroundColor: 'rgba(245, 196, 81, 0.24)',
    borderColor: '#F5C451',
  },
  bonusBadgeText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '800',
  },
  bonusBadgeTextReady: {
    color: '#FFE699',
  },
  setupCard: {
    backgroundColor: 'rgba(22, 42, 72, 0.52)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.22)',
    paddingHorizontal: 11,
    paddingVertical: 9,
    gap: 8,
  },
  setupGroup: {
    gap: 5,
  },
  sectionLabel: {
    color: '#8EA6C6',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  modeSegmentedRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modePill: {
    flex: 1,
    minHeight: 46,
    backgroundColor: 'rgba(38, 62, 96, 0.44)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: 'rgba(66, 52, 24, 0.62)',
    borderColor: '#F5C451',
    borderWidth: 1.5,
    boxShadow: '0px 0px 14px rgba(245, 196, 81, 0.22)',
  },
  modePillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  modeTextCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modePillTitle: {
    color: '#CBD9EC',
    fontSize: 13,
    fontWeight: '900',
  },
  modePillTitleActive: {
    color: '#F5C451',
  },
  modePillSub: {
    color: '#8098B8',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 1,
  },
  modePillSubActive: {
    color: '#E9CFA0',
  },
  scoreSingleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreChipWrap: {
    flex: 1,
    borderRadius: 11,
  },
  scoreChipGlow: {
    boxShadow: '0px 0px 16px rgba(245, 196, 81, 0.5)',
  },
  scoreChipActiveGrad: {
    minHeight: 37,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFF7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChip: {
    minHeight: 37,
    backgroundColor: 'rgba(42, 68, 104, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.22)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipText: {
    color: '#D3E1F2',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreChipTextActive: {
    color: '#1A1405',
    fontSize: 14,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  thumbDock: {
    paddingHorizontal: 15,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
  },
  primaryBtnOuter: {
    borderRadius: 22,
    borderBottomWidth: 4,
    borderBottomColor: '#0E733E',
    boxShadow: '0px 6px 24px rgba(41, 214, 127, 0.44)',
  },
  primaryBtnPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.95,
  },
  primaryBtnGrad: {
    minHeight: 54,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.65)',
  },
  btnGlossTop: {
    position: 'absolute',
    top: 2,
    left: 10,
    right: 10,
    height: '44%',
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  primaryBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  primaryBtnText: {
    color: '#06311B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  primaryBtnSub: {
    color: '#0B4D2B',
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 0,
  },
  onlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtnOuter: {
    flex: 1,
    borderRadius: 15,
    borderBottomWidth: 3.5,
  },
  onlineShadow: {
    borderBottomColor: '#10317A',
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.34)',
  },
  privateShadow: {
    borderBottomColor: '#480E87',
    boxShadow: '0px 4px 16px rgba(139, 92, 246, 0.34)',
  },
  secondaryBtnPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.94,
  },
  secondaryBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  secondaryGlossTop: {
    position: 'absolute',
    top: 1.5,
    left: 6,
    right: 6,
    height: '42%',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  secondaryTextCol: {
    alignItems: 'flex-start',
  },
  onlineBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  onlineBtnSub: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 11,
    fontWeight: '700',
  },
  onlineBtnDisabled: {
    opacity: 0.45,
  },
});
