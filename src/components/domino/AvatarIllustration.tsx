import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { BotMood } from '@/constants/seatProfiles';

interface AvatarIllustrationProps {
  isBot: boolean;
  accentColor: string;
  mood?: BotMood;
  size?: number;
}

/**
 * Illustrated SVG avatars (100% Expo Go compatible):
 * - Bot: charming metallic robotito with LED face screen, glowing antenna, and mood expressions
 *   (idle, thinking, play wink, double stars, draw o_o, pass sad, win happy, lose X_X).
 * - Player: warm stylized club player bust.
 */
export function AvatarIllustration({
  isBot,
  accentColor,
  mood = 'idle',
  size = 48,
}: AvatarIllustrationProps) {
  if (!isBot) {
    return (
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="playerBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1E3A5F" />
            <Stop offset="1" stopColor="#0E1D33" />
          </LinearGradient>
        </Defs>
        <Circle cx={32} cy={32} r={32} fill="url(#playerBg)" />
        {/* Shoulders / Guayabera shirt */}
        <Path
          d="M12 60C14 47 22 43 32 43C42 43 50 47 52 60"
          fill={accentColor}
        />
        <Path d="M27 43L32 51L37 43" fill="#F8FAFC" opacity={0.85} />
        {/* Neck */}
        <Rect x={28} y={37} width={8} height={8} rx={3} fill="#D99B72" />
        {/* Head */}
        <Circle cx={32} cy={27} r={12.5} fill="#E6AD84" />
        {/* Hair */}
        <Path
          d="M19.5 25C19.5 16.5 25 13 32 13C39 13 44.5 16.5 44.5 25C42 20.5 37 19.5 32 19.5C27 19.5 22 20.5 19.5 25Z"
          fill="#1E293B"
        />
        {/* Eyes & warm smile */}
        <Circle cx={27.5} cy={27.5} r={1.8} fill="#111827" />
        <Circle cx={36.5} cy={27.5} r={1.8} fill="#111827" />
        <Path
          d={
            mood === 'lose'
              ? 'M28 34C29.5 32.5 34.5 32.5 36 34'
              : 'M27.5 32.5C29.5 35 34.5 35 36.5 32.5'
          }
          stroke="#7C2D12"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  // Expressive Bot Robotito
  const antennaColor =
    mood === 'double' || mood === 'win'
      ? '#F5C451'
      : mood === 'pass' || mood === 'lose'
      ? '#F43F5E'
      : accentColor;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="botBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1B2A47" />
          <Stop offset="1" stopColor="#0C1527" />
        </LinearGradient>
        <LinearGradient id="botMetal" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E2E8F0" />
          <Stop offset="1" stopColor="#94A3B8" />
        </LinearGradient>
      </Defs>
      <Circle cx={32} cy={32} r={32} fill="url(#botBg)" />

      {/* Body collar */}
      <Path
        d="M16 61C18 50 24 47 32 47C40 47 46 50 48 61"
        fill={accentColor}
      />
      <Rect x={26} y={48} width={12} height={4} rx={2} fill="#0F172A" opacity={0.4} />

      {/* Antenna */}
      <Path d="M32 18V11" stroke="#CBD5E1" strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={32} cy={9.5} r={4} fill={antennaColor} />
      <Circle cx={30.8} cy={8.3} r={1.2} fill="#FFFFFF" opacity={0.85} />

      {/* Ear bolts */}
      <Rect x={11} y={28} width={5} height={10} rx={2.5} fill={accentColor} />
      <Rect x={48} y={28} width={5} height={10} rx={2.5} fill={accentColor} />

      {/* Rounded metallic head */}
      <Rect x={15} y={18} width={34} height={29} rx={11} fill="url(#botMetal)" />
      {/* LED Face visor */}
      <Rect x={19} y={23} width={26} height={19} rx={7} fill="#0B1322" />

      {/* Mood-driven LED eyes & mouth */}
      {mood === 'thinking' && (
        <>
          <Circle cx={29} cy={31} r={2.8} fill={accentColor} />
          <Circle cx={39} cy={31} r={2.8} fill={accentColor} />
          <Path d="M27 37H37" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {mood === 'play' && (
        <>
          <Circle cx={26.5} cy={31} r={3} fill={accentColor} />
          <Path
            d="M34.5 31C36 29 38.5 29 40 31"
            stroke={accentColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M27.5 36.5C29.5 38.5 34.5 38.5 36.5 36.5"
            stroke="#34D399"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {(mood === 'double' || mood === 'win') && (
        <>
          <Circle cx={26.5} cy={30.5} r={3.6} fill="#F5C451" />
          <Circle cx={37.5} cy={30.5} r={3.6} fill="#F5C451" />
          <Path
            d="M26 36.5C29 40 35 40 38 36.5"
            stroke="#F5C451"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {mood === 'draw' && (
        <>
          <Circle cx={26.5} cy={31} r={3.4} stroke="#F5C451" strokeWidth={2} fill="none" />
          <Circle cx={37.5} cy={31} r={3.4} stroke="#F5C451" strokeWidth={2} fill="none" />
          <Circle cx={32} cy={37.5} r={2.2} fill="#F5C451" />
        </>
      )}

      {(mood === 'pass' || mood === 'lose') && (
        <>
          <Path
            d="M24 29L29 33M29 29L24 33"
            stroke="#F43F5E"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M35 29L40 33M40 29L35 33"
            stroke="#F43F5E"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M28 38C30 36 34 36 36 38"
            stroke="#F43F5E"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {mood === 'idle' && (
        <>
          <Circle cx={26.5} cy={31} r={3} fill={accentColor} />
          <Circle cx={37.5} cy={31} r={3} fill={accentColor} />
          <Path
            d="M28.5 36.8C30.5 38.2 33.5 38.2 35.5 36.8"
            stroke={accentColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}
