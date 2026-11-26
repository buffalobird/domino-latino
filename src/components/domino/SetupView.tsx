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
import { PlayIcon, StarIcon } from './Icons';

interface SetupViewProps {
  mode: GameMode;
  targetScore: TargetScore;
  retention: RetentionProgress;
  onChangeMode: (mode: GameMode) => void;
  onChangeTargetScore: (score: TargetScore) => void;
  onStartQuickMatch: () => void;
  onOpenOnlineLobby: (tab: 'public' | 'private') => void;
  onOpenDailyRewards: () => void;
  onOpenThemes: () => void;
}

const MODE_OPTIONS: {
  value: GameMode;
  title: string;
  subtitle: string;
  tag: string;
}[] = [
  {
    value: '1v1',
    title: '1 contra 1',
    subtitle: 'Tú vs Bot · Pozo de 14 fichas',
    tag: 'POZO',
  },
  {
    value: '2v2',
    title: '2 contra 2',
    subtitle: 'Tú + Bot Compa vs 2 Bots · 28 fichas',
    tag: 'PAREJAS',
  },
  {
    value: '4ffa',
    title: '4 todos contra todos',
    subtitle: 'Tú vs 3 Bots · 28 fichas',
    tag: '4 JUG.',
  },
];

export function SetupView({
  mode,
  targetScore,
  retention,
  onChangeMode,
  onChangeTargetScore,
  onStartQuickMatch,
  onOpenOnlineLobby,
  onOpenDailyRewards,
  onOpenThemes,
}: SetupViewProps) {
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedModeTitle = MODE_OPTIONS.find((m) => m.value === mode)?.title ?? '';
  const hasDailyBonus = canClaimDailyReward(retention);
  const xpIntoLevel = retention.xp % 100;

  return (
    <LinearGradient
      colors={[CLUB.roomBgTop, CLUB.roomBgBottom]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Economy & Level Strip (Comparative Report O2 + O4 + O5) */}
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
              style={styles.themesPill}
            >
              <Text style={styles.themesPillText}>Mesas</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                hapticLight();
                onOpenDailyRewards();
              }}
              style={[styles.chipsPill, hasDailyBonus && styles.chipsPillReady]}
            >
              <Text style={styles.chipsValue}>
                {retention.clubChips.toLocaleString('es-ES')}
              </Text>
              {hasDailyBonus && <View style={styles.readyDot} />}
            </Pressable>
          </View>
        </View>

        {/* Club Caribe Hero */}
        <View style={styles.hero}>
          <View style={styles.faceoffRow}>
            <View style={styles.avatarRing}>
              <AvatarIllustration isBot={false} accentColor={CLUB.emerald} size={48} />
            </View>
            <View style={styles.centerTile}>
              <DominoTile a={6} b={6} orientation="horizontal" unit={24} />
            </View>
            <View style={[styles.avatarRing, { borderColor: CLUB.cyan }]}>
              <AvatarIllustration
                isBot
                accentColor={CLUB.cyan}
                mood="play"
                size={48}
              />
            </View>
          </View>

          <Text style={styles.title}>Dominó Latino</Text>
        </View>

        {/* Dual Play Entry (Screenshot 1: Partida Rápida + Ver Salas Online / Sala Privada) */}
        <View style={styles.ctaGroup}>
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
              <PlayIcon size={19} color={CLUB.textInk} />
              <Text style={styles.primaryBtnText}>Partida rápida</Text>
            </View>
            <Text style={styles.primaryBtnSub}>
              {selectedModeTitle} · Meta {targetScore} pts (Bots)
            </Text>
          </Pressable>

          <View style={styles.onlineRow}>
            <Pressable
              onPress={() => {
                hapticSnap();
                onOpenOnlineLobby('public');
              }}
              style={({ pressed }) => [
                styles.onlineBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.onlineBtnTitle}>Ver Salas Online</Text>
              <Text style={styles.onlineBtnSub}>Mesas públicas</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                hapticSnap();
                onOpenOnlineLobby('private');
              }}
              style={({ pressed }) => [
                styles.privateBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.onlineBtnTitle}>Sala Privada</Text>
              <Text style={styles.onlineBtnSub}>Juega con amigos</Text>
            </Pressable>
          </View>
        </View>

        {/* Retention Hook: 3-Star Daily Challenge + Daily Bonus shortcut */}
        <Pressable
          onPress={() => {
            hapticLight();
            onOpenDailyRewards();
          }}
          style={styles.challengeCard}
        >
          <View style={styles.starsRow}>
            {[0, 1, 2].map((idx) => (
              <StarIcon
                key={idx}
                size={20}
                color={CLUB.gold}
                filled={idx < retention.dailyStars}
              />
            ))}
          </View>
          <View style={styles.challengeTextCol}>
            <Text style={styles.challengeTitle}>
              {remainingStars === 0
                ? 'Reto diario completado'
                : `Reto diario: ${retention.dailyStars}/3 victorias`}
            </Text>
            <Text style={styles.challengeSub}>
              {hasDailyBonus
                ? '¡Bono diario de fichas listo para reclamar!'
                : `Racha: ${retention.winStreak} · Mejor: ${retention.bestStreak}`}
            </Text>
          </View>
        </Pressable>

        {/* Optional Google & Apple OAuth Cloud Sync */}
        <AccountCard />

        {/* Mode Selector (for Quick Match) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Modalidad (Partida rápida)</Text>
          <View style={styles.modeList}>
            {MODE_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    hapticLight();
                    onChangeMode(opt.value);
                  }}
                  style={[styles.modeCard, active && styles.modeCardActive]}
                >
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.modeTextCol}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>{opt.title}</Text>
                      <View
                        style={[
                          styles.modeTag,
                          active && { backgroundColor: 'rgba(245, 196, 81, 0.22)' },
                        ]}
                      >
                        <Text
                          style={[styles.modeTagText, active && { color: CLUB.gold }]}
                        >
                          {opt.tag}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeSub}>{opt.subtitle}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Target Score Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Puntaje objetivo</Text>
          <View style={styles.scoreGrid}>
            {TARGET_SCORES.map((pts) => {
              const active = targetScore === pts;
              return (
                <Pressable
                  key={pts}
                  onPress={() => {
                    hapticLight();
                    onChangeTargetScore(pts);
                  }}
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
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
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
    width: 54,
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
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  themesPillText: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipsPillReady: {
    borderColor: CLUB.gold,
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
  },
  chipsValue: {
    color: CLUB.gold,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLUB.emerald,
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
    width: 54,
    height: 54,
    borderRadius: 27,
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
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  ctaGroup: {
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: CLUB.emeraldDark,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    boxShadow: '0px 8px 20px rgba(46, 209, 138, 0.28)',
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
    fontSize: 19,
    fontWeight: '900',
  },
  primaryBtnSub: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  onlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  onlineBtn: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#1E3A8A',
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  privateBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#4C1D95',
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
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
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  challengeTextCol: {
    flex: 1,
  },
  challengeTitle: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  challengeSub: {
    color: CLUB.goldSoft,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: CLUB.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  modeList: {
    gap: 8,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  modeCardActive: {
    backgroundColor: CLUB.surfaceCardLight,
    borderColor: CLUB.gold,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: CLUB.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: CLUB.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLUB.gold,
  },
  modeTextCol: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    color: CLUB.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  modeTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modeTagText: {
    color: CLUB.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  modeSub: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreChip: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 44,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipActive: {
    backgroundColor: CLUB.gold,
    borderColor: CLUB.goldSoft,
  },
  scoreChipText: {
    color: CLUB.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scoreChipTextActive: {
    color: CLUB.textInk,
  },
});
