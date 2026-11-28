import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { BotMood, SeatProfile } from '@/constants/seatProfiles';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { AvatarIllustration } from './AvatarIllustration';

interface SeatAvatarProps {
  profile: SeatProfile;
  tileCount: number;
  score?: number;
  targetScore?: number;
  showScore?: boolean;
  isActiveTurn: boolean;
  timerProgress?: number;
  secondsLeft?: number | null;
  lastAction?: string | null;
  reactionText?: string | null;
  mood?: BotMood;
  avatarConfig?: AvatarConfig;
  layout?: 'horizontal' | 'stacked';
  bubbleAnchor?:
    | 'left'
    | 'right'
    | 'below'
    | 'below-left'
    | 'below-right'
    | 'above-left';
}

function isKeyTacticalCallout(action: string | null): boolean {
  if (!action) return false;
  const lower = action.toLowerCase();
  return (
    lower.includes('pas') ||
    lower.includes('rob') ||
    lower.includes('peg') ||
    lower.includes('gan')
  );
}

export function SeatAvatar({
  profile,
  tileCount,
  score = 0,
  targetScore = 100,
  showScore = true,
  isActiveTurn,
  timerProgress = 1,
  secondsLeft = null,
  lastAction = null,
  reactionText = null,
  mood = 'idle',
  avatarConfig,
  layout = 'horizontal',
  bubbleAnchor = 'below',
}: SeatAvatarProps) {
  const { palette } = usePalette();
  const isStacked = layout === 'stacked';
  const avatarSize = isStacked ? 40 : 48;
  const ringStroke = isStacked ? 3.5 : 4;
  const outerSize = avatarSize + ringStroke * 2 + 4;
  const radius = (outerSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, timerProgress));
  const strokeDashoffset = circumference * (1 - clamped);

  // Auto-expire tactical callouts ("¡Pasó!", "Robó") after 1.85s so they never clutter the felt permanently
  const [transientAction, setTransientAction] = useState<string | null>(null);
  useEffect(() => {
    if (!isKeyTacticalCallout(lastAction)) {
      setTransientAction(null);
      return;
    }
    const clean =
      lastAction!.toLowerCase().includes('rob') ? 'Robó ficha' : lastAction!;
    setTransientAction(clean);
    const t = setTimeout(() => setTransientAction(null), 1850);
    return () => clearTimeout(t);
  }, [lastAction, tileCount, isActiveTurn]);

  const isUrgent = isActiveTurn && secondsLeft !== null && secondsLeft <= 5;
  const ringTrackColor = palette.isDark
    ? 'rgba(255,255,255,0.14)'
    : 'rgba(21, 43, 50, 0.16)';
  const ringColor = !isActiveTurn
    ? ringTrackColor
    : isUrgent
    ? CLUB.coral
    : clamped <= 0.35
    ? CLUB.gold
    : palette.accent;

  const activeBubble = reactionText ?? transientAction;
  const isReactionBubble = Boolean(reactionText);

  const bubbleProgress = useSharedValue(activeBubble ? 1 : 0);
  useEffect(() => {
    if (activeBubble) {
      bubbleProgress.value = 0.88;
      bubbleProgress.value = withTiming(1, { duration: 150 });
    } else {
      bubbleProgress.value = withTiming(0, { duration: 130 });
    }
  }, [activeBubble, bubbleProgress]);

  const shakeX = useSharedValue(0);
  useEffect(() => {
    if (lastAction && lastAction.toLowerCase().includes('pas')) {
      shakeX.value = withSequence(
        withTiming(-4, { duration: 45 }),
        withTiming(4, { duration: 45 }),
        withTiming(-2, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
    }
  }, [lastAction, shakeX]);

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    opacity: bubbleProgress.value,
    transform: [{ scale: bubbleProgress.value }],
  }));

  const avatarShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const isPassBubble = Boolean(transientAction?.toLowerCase().includes('pas'));
  const isDrawBubble = Boolean(transientAction?.toLowerCase().includes('rob'));
  const isWinBubble = Boolean(
    transientAction?.toLowerCase().includes('gan') ||
      transientAction?.toLowerCase().includes('peg')
  );

  const resolvedAvatar = avatarConfig ?? profile.avatarConfig;

  const avatarCircle = (
    <Animated.View style={[styles.avatarWrap, avatarShakeStyle]}>
      <Svg
        width={outerSize}
        height={outerSize}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={radius}
          stroke={ringTrackColor}
          strokeWidth={ringStroke}
          fill="none"
        />
        {isActiveTurn && (
          <Circle
            cx={outerSize / 2}
            cy={outerSize / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={ringStroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>

      <View
        style={[
          styles.avatarInner,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        ]}
      >
        <AvatarIllustration
          isBot={profile.isBot}
          seatHint={profile.seat}
          accentColor={profile.accentColor}
          mood={isActiveTurn && profile.isBot ? 'thinking' : mood}
          size={avatarSize}
          avatarConfig={resolvedAvatar}
        />
        {isUrgent && (
          <View style={styles.urgentOverlay}>
            <Text style={[styles.urgentDigit, isStacked && { fontSize: 20 }]}>
              {secondsLeft}
            </Text>
          </View>
        )}
      </View>

      {/* Remaining tiles count badge */}
      <View
        style={[
          styles.countBadge,
          !palette.isDark && {
            backgroundColor: palette.textPrimary,
            borderColor: '#FFFFFF',
          },
          isActiveTurn && {
            backgroundColor: palette.brandAccent,
            borderColor: '#FFFFFF',
          },
        ]}
      >
        <Text
          style={[
            styles.countBadgeText,
            isActiveTurn && {
              color: palette.isDark ? CLUB.textInk : '#FFFFFF',
            },
          ]}
        >
          {tileCount}
        </Text>
      </View>
    </Animated.View>
  );

  const bubblePosStyle =
    bubbleAnchor === 'below-left'
      ? styles.bubbleBelowLeft
      : bubbleAnchor === 'below-right'
      ? styles.bubbleBelowRight
      : bubbleAnchor === 'above-left'
      ? styles.bubbleAboveLeft
      : bubbleAnchor === 'below'
      ? styles.bubbleBelow
      : bubbleAnchor === 'left'
      ? styles.bubbleLeft
      : styles.bubbleRight;

  const cardScoreColor = palette.isDark ? CLUB.gold : palette.brandAccent;

  return (
    <View style={styles.anchorContainer}>
      {isStacked ? (
        <View
          style={[
            styles.stackedCard,
            {
              backgroundColor: palette.hudPillBg,
              borderColor: isActiveTurn ? palette.accent : palette.hudPillBorder,
            },
          ]}
        >
          {avatarCircle}
          <View style={styles.nameInlineRow}>
            <Text
              style={[styles.stackedName, { color: palette.hudPillText }]}
              numberOfLines={1}
            >
              {profile.displayName}
            </Text>
          </View>
          {showScore ? (
            <Text style={[styles.stackedScore, { color: cardScoreColor }]}>
              {score}/{targetScore}
            </Text>
          ) : profile.badgeText ? (
            <Text style={[styles.partnerTiny, { color: palette.accent }]}>
              {profile.badgeText}
            </Text>
          ) : profile.isBot ? (
            <Text style={[styles.cpuTiny, { color: palette.textMuted }]}>
              CLUB
            </Text>
          ) : null}
        </View>
      ) : (
        <View
          style={[
            styles.horizontalCard,
            {
              backgroundColor: palette.hudPillBg,
              borderColor: isActiveTurn ? palette.accent : palette.hudPillBorder,
            },
          ]}
        >
          {avatarCircle}
          <View style={styles.infoCol}>
            <View style={styles.nameInlineRow}>
              <Text
                style={[styles.name, { color: palette.hudPillText }]}
                numberOfLines={1}
              >
                {profile.displayName}
              </Text>
              {profile.isBot && (
                <View
                  style={[
                    styles.cpuBadge,
                    { backgroundColor: palette.surfaceCardAlt },
                  ]}
                >
                  <Text
                    style={[styles.cpuBadgeText, { color: palette.textSecondary }]}
                  >
                    CPU
                  </Text>
                </View>
              )}
            </View>
            {showScore && (
              <Text style={[styles.scoreText, { color: cardScoreColor }]}>
                {score}/{targetScore}
              </Text>
            )}
          </View>
        </View>
      )}

      {activeBubble && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bubbleBase,
            bubblePosStyle,
            !isReactionBubble && isPassBubble && styles.bubblePass,
            !isReactionBubble && isDrawBubble && styles.bubbleDraw,
            !isReactionBubble && isWinBubble && styles.bubbleWin,
            isReactionBubble && styles.bubbleReaction,
            bubbleAnimStyle,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              !isReactionBubble &&
                (isPassBubble || isWinBubble) &&
                styles.bubbleTextLight,
              isReactionBubble && styles.bubbleReactionText,
            ]}
            numberOfLines={2}
          >
            {activeBubble}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  anchorContainer: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 25,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 13,
  },
  stackedCard: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    minWidth: 84,
    maxWidth: 110,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInner: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(11, 19, 34, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentDigit: {
    fontFamily: FONT.display,
    color: '#FFFFFF',
    fontSize: 24,
    fontVariant: ['tabular-nums'],
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    left: -3,
    minWidth: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#132B36',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    fontFamily: FONT.extraBold,
    color: '#FFFFFF',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  infoCol: {
    justifyContent: 'center',
  },
  nameInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
    maxWidth: 88,
  },
  cpuBadge: {
    borderRadius: 5,
    paddingHorizontal: 4.5,
    paddingVertical: 1,
  },
  cpuBadgeText: {
    fontFamily: FONT.extraBold,
    fontSize: 8.5,
    letterSpacing: 0.4,
  },
  cpuTiny: {
    fontFamily: FONT.extraBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  scoreText: {
    fontFamily: FONT.display,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  stackedName: {
    fontFamily: FONT.extraBold,
    fontSize: 11.5,
    marginTop: 3,
  },
  stackedScore: {
    fontFamily: FONT.display,
    fontSize: 11.5,
    fontVariant: ['tabular-nums'],
  },
  partnerTiny: {
    fontFamily: FONT.extraBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  bubbleBase: {
    position: 'absolute',
    backgroundColor: '#FFFDF7',
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1.25,
    borderColor: 'rgba(15, 23, 42, 0.16)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.28)',
    zIndex: 55,
    maxWidth: 196,
  },
  bubbleBelow: {
    top: '100%',
    marginTop: 5,
    minWidth: 118,
    alignItems: 'center',
  },
  bubbleBelowLeft: {
    top: '100%',
    left: 0,
    marginTop: 5,
    minWidth: 118,
  },
  bubbleBelowRight: {
    top: '100%',
    right: 0,
    marginTop: 5,
    minWidth: 118,
  },
  bubbleAboveLeft: {
    bottom: '100%',
    left: 2,
    marginBottom: 6,
    minWidth: 118,
  },
  bubbleLeft: {
    right: '100%',
    marginRight: 8,
    top: '50%',
    marginTop: -14,
  },
  bubbleRight: {
    left: '100%',
    marginLeft: 8,
    top: '50%',
    marginTop: -14,
  },
  bubbleDraw: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  bubblePass: {
    backgroundColor: CLUB.coral,
    borderColor: CLUB.coralDark,
  },
  bubbleWin: {
    backgroundColor: CLUB.emerald,
    borderColor: CLUB.emeraldDark,
  },
  bubbleReaction: {
    backgroundColor: '#FFFBF0',
    borderColor: CLUB.gold,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
  },
  bubbleText: {
    fontFamily: FONT.extraBold,
    color: '#11252E',
    fontSize: 11.5,
    lineHeight: 15,
    textAlign: 'center',
  },
  bubbleReactionText: {
    fontFamily: FONT.extraBold,
    color: '#11252E',
    fontSize: 12,
    lineHeight: 15.5,
    textAlign: 'center',
  },
  bubbleTextLight: {
    color: '#FFFFFF',
  },
});
