import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { GameMode, TARGET_SCORES, TargetScore } from '@/engine/types';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap } from '@/utils/feedback';
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
}: SetupViewProps) {
  const remainingStars = Math.max(0, 3 - retention.dailyStars);
  const selectedModeTitle = MODE_OPTIONS.find((m) => m.value === mode)?.title ?? '';

  return (
    <LinearGradient
      colors={[CLUB.roomBgTop, CLUB.roomBgBottom]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Club Caribe Hero with Player vs Bot face-off */}
        <View style={styles.hero}>
          <View style={styles.faceoffRow}>
            <View style={styles.avatarRing}>
              <AvatarIllustration isBot={false} accentColor={CLUB.emerald} size={52} />
            </View>
            <View style={styles.centerTile}>
              <DominoTile a={6} b={6} orientation="horizontal" unit={26} />
            </View>
            <View style={[styles.avatarRing, { borderColor: CLUB.cyan }]}>
              <AvatarIllustration
                isBot
                accentColor={CLUB.cyan}
                mood="play"
                size={52}
              />
            </View>
          </View>

          <Text style={styles.title}>Dominó Latino</Text>
          <Text style={styles.subtitle}>Partida rápida contra el Bot</Text>
        </View>

        {/* Primary CTA */}
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
            <Text style={styles.primaryBtnText}>Partida rápida</Text>
          </View>
          <Text style={styles.primaryBtnSub}>
            {selectedModeTitle} · Meta {targetScore} pts
          </Text>
        </Pressable>

        {/* Retention Hook: 3-Star Daily Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.starsRow}>
            {[0, 1, 2].map((idx) => (
              <StarIcon
                key={idx}
                size={22}
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
              {remainingStars === 0
                ? `Racha: ${retention.winStreak} · Mejor: ${retention.bestStreak}`
                : `Te ${remainingStars === 1 ? 'falta 1 victoria' : `faltan ${remainingStars}`} hoy · Racha ${retention.winStreak}`}
            </Text>
          </View>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Modalidad</Text>
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
                          style={[
                            styles.modeTagText,
                            active && { color: CLUB.gold },
                          ]}
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
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  faceoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: CLUB.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 18,
    borderBottomWidth: 5,
    borderBottomColor: CLUB.emeraldDark,
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    fontSize: 20,
    fontWeight: '900',
  },
  primaryBtnSub: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
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
    paddingVertical: 11,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
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
    color: CLUB.textSecondary,
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
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 58,
  },
  modeCardActive: {
    backgroundColor: CLUB.surfaceCardLight,
    borderColor: CLUB.gold,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: CLUB.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: CLUB.gold,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
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
    minHeight: 46,
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
