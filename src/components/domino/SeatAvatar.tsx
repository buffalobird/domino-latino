import React, { useEffect } from 'react';
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
import { CLUB } from '@/constants/tokens';
import { AvatarIllustration } from './AvatarIllustration';

interface SeatAvatarProps {
  profile: SeatProfile;
  tileCount: number;
  score?: number;
  targetScore?: number;
  /** Hide score text when team score is shown in a shared 2v2 scoreboard */
  showScore?: boolean;
  isActiveTurn: boolean;
  timerProgress?: number;
  secondsLeft?: number | null;
  lastAction?: string | null;
  /** Warm sobremesa reaction bubble (takes visual priority over mechanical lastAction while active) */
  reactionText?: string | null;
  mood?: BotMood;
  avatarConfig?: AvatarConfig;
  /** Vertical stacked pill for 4-player top arc (takes minimal horizontal width) */
  layout?: 'horizontal' | 'stacked';
  /** Floating bubble anchor so bubbles NEVER shift or collide with HUD layout */
  bubbleAnchor?: 'left' | 'right' | 'below';
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
  const isStacked = layout === 'stacked';
  const avatarSize = isStacked ? 40 : 48;
  const ringStroke = isStacked ? 3.5 : 4;
  const outerSize = avatarSize + ringStroke * 2 + 4;
  const radius = (outerSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, timerProgress));
  const strokeDashoffset = circumference * (1 - clamped);

  const isUrgent = isActiveTurn && secondsLeft !== null && secondsLeft <= 5;
  const ringColor = !isActiveTurn
    ? 'rgba(255,255,255,0.14)'
    : isUrgent
    ? CLUB.coral
    : clamped <= 0.35
    ? CLUB.gold
    : CLUB.emerald;

  const activeBubble = reactionText ?? lastAction;
  const isReactionBubble = Boolean(reactionText);

  // Crisp non-bouncy fade/scale for speech bubble (zero rubbery overshoot)
  const bubbleProgress = useSharedValue(activeBubble ? 1 : 0);
  useEffect(() => {
    if (activeBubble) {
      bubbleProgress.value = 0.85;
      bubbleProgress.value = withTiming(1, { duration: 150 });
    } else {
      bubbleProgress.value = withTiming(0, { duration: 120 });
    }
  }, [activeBubble, bubbleProgress]);

  // Subtle horizontal shake only on pass
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

  const isPassBubble = Boolean(lastAction?.toLowerCase().includes('pas'));
  const isDrawBubble = Boolean(lastAction?.toLowerCase().includes('rob'));
  const isWinBubble = Boolean(
    lastAction?.toLowerCase().includes('gan') ||
      lastAction?.toLowerCase().includes('peg')
  );

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
          stroke="rgba(255,255,255,0.15)"
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
          accentColor={profile.accentColor}
          mood={isActiveTurn && profile.isBot ? 'thinking' : mood}
          size={avatarSize}
          avatarConfig={avatarConfig}
        />
        {isUrgent && (
          <View style={styles.urgentOverlay}>
            <Text style={[styles.urgentDigit, isStacked && { fontSize: 20 }]}>
              {secondsLeft}
            </Text>
          </View>
        )}
      </View>

      {/* Tile count badge */}
      <View
        style={[
          styles.countBadge,
          isActiveTurn && { backgroundColor: CLUB.gold, borderColor: '#FFF' },
        ]}
      >
        <Text
          style={[styles.countBadgeText, isActiveTurn && { color: CLUB.textInk }]}
        >
          {tileCount}
        </Text>
      </View>
    </Animated.View>
  );

  const bubblePosStyle =
    bubbleAnchor === 'below'
      ? styles.bubbleBelow
      : bubbleAnchor === 'left'
      ? styles.bubbleLeft
      : styles.bubbleRight;

  return (
    <View style={styles.anchorContainer}>
      {isStacked ? (
        <View
          style={[
            styles.stackedCard,
            isActiveTurn && { borderColor: profile.accentColor },
          ]}
        >
          {avatarCircle}
          <Text style={styles.stackedName} numberOfLines={1}>
            {profile.displayName}
          </Text>
          {showScore ? (
            <Text style={styles.stackedScore}>
              {score}/{targetScore}
            </Text>
          ) : profile.badgeText ? (
            <Text style={styles.partnerTiny}>{profile.badgeText}</Text>
          ) : null}
        </View>
      ) : (
        <View
          style={[
            styles.horizontalCard,
            isActiveTurn && { borderColor: profile.accentColor },
          ]}
        >
          {avatarCircle}
          <View style={styles.infoCol}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.displayName}
            </Text>
            {showScore && (
              <Text style={styles.scoreText}>
                {score}/{targetScore}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Floating speech bubble — never pushes or clips HUD controls */}
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
              !isReactionBubble && (isPassBubble || isWinBubble) && styles.bubbleTextLight,
              isReactionBubble && styles.bubbleReactionText,
            ]}
            numberOfLines={1}
          >
            {isReactionBubble ? activeBubble : activeBubble.toUpperCase()}
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
    backgroundColor: CLUB.glassBg,
    borderWidth: 1.5,
    borderColor: CLUB.borderSubtle,
    borderRadius: 999,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 12,
  },
  stackedCard: {
    alignItems: 'center',
    backgroundColor: CLUB.glassBg,
    borderWidth: 1.5,
    borderColor: CLUB.borderSubtle,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    minWidth: 82,
    maxWidth: 108,
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
    backgroundColor: 'rgba(11, 19, 34, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentDigit: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    left: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  infoCol: {
    justifyContent: 'center',
  },
  name: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 86,
  },
  scoreText: {
    color: CLUB.gold,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  stackedName: {
    color: CLUB.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  stackedScore: {
    color: CLUB.gold,
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  partnerTiny: {
    color: CLUB.emerald,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bubbleBase: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.35)',
    zIndex: 40,
  },
  bubbleBelow: {
    top: '100%',
    marginTop: 4,
  },
  bubbleLeft: {
    right: '100%',
    marginRight: 8,
    top: '50%',
    marginTop: -12,
  },
  bubbleRight: {
    left: '100%',
    marginLeft: 8,
    top: '50%',
    marginTop: -12,
  },
  bubbleDraw: {
    backgroundColor: CLUB.goldSoft,
    borderColor: CLUB.goldDark,
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
    backgroundColor: '#FFF9EC',
    borderColor: CLUB.gold,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bubbleText: {
    color: CLUB.textInk,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.25,
  },
  bubbleReactionText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  bubbleTextLight: {
    color: '#FFFFFF',
  },
});
