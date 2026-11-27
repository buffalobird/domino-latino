import React, { useId } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { BotMood } from '@/constants/seatProfiles';
import { ModularAvatar } from './ModularAvatar';

interface AvatarIllustrationProps {
  isBot: boolean;
  accentColor: string;
  mood?: BotMood;
  size?: number;
  avatarConfig?: AvatarConfig;
}

/**
 * Illustrated SVG Club Caribe Avatars (100% Expo Go compatible, unique SVG gradient IDs):
 * - Player: delegates to customizable ModularAvatar bust (inclusive styles & accessories).
 * - Bot: tactile metallic robotito with diagonal visor glass glint, brass ear bolts, and expressive moods.
 */
export function AvatarIllustration({
  isBot,
  accentColor,
  mood = 'idle',
  size = 48,
  avatarConfig,
}: AvatarIllustrationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  if (!isBot) {
    return <ModularAvatar config={avatarConfig} mood={mood} size={size} />;
  }

  // Expressive Club Robotito
  const bgId = `bbg_${uid}`;
  const metalId = `bmet_${uid}`;
  const antennaColor =
    mood === 'double' || mood === 'win'
      ? '#F5C451'
      : mood === 'pass' || mood === 'lose'
      ? '#F43F5E'
      : accentColor;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={bgId} x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0" stopColor="#1B3046" />
          <Stop offset="1" stopColor="#0A1420" />
        </LinearGradient>
        <LinearGradient id={metalId} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#F1F5F9" />
          <Stop offset="0.55" stopColor="#CBD5E1" />
          <Stop offset="1" stopColor="#8A9BB0" />
        </LinearGradient>
      </Defs>
      <Circle cx={32} cy={32} r={32} fill={`url(#${bgId})`} />

      {/* Shoulders */}
      <Path
        d="M15.5 61C17.8 49.5 23.8 46.5 32 46.5C40.2 46.5 46.2 49.5 48.5 61"
        fill={accentColor}
      />
      <Rect x={26} y={48} width={12} height={3.8} rx={1.9} fill="#0B1622" opacity={0.45} />

      {/* Antenna */}
      <Path d="M32 18V11.2" stroke="#CBD5E1" strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={32} cy={9.4} r={4.2} fill={antennaColor} />
      <Circle cx={30.7} cy={8.1} r={1.25} fill="#FFFFFF" opacity={0.9} />

      {/* Ear bolts */}
      <Rect x={10.5} y={27.5} width={5.2} height={10.5} rx={2.6} fill={accentColor} />
      <Rect x={48.3} y={27.5} width={5.2} height={10.5} rx={2.6} fill={accentColor} />

      {/* Sculpted metallic head */}
      <Rect x={14.8} y={17.8} width={34.4} height={29.4} rx={11.5} fill={`url(#${metalId})`} />
      {/* LED Face visor */}
      <Rect x={19} y={22.8} width={26} height={19.4} rx={7.2} fill="#08111B" />
      {/* Subtle diagonal glass reflection */}
      <Path
        d="M22.5 24.4H29.5L24 31.8V26.2C24 25.1 23.3 24.4 22.5 24.4Z"
        fill="#FFFFFF"
        opacity={0.07}
      />

      {/* Mood-driven LED eyes & mouth */}
      {mood === 'thinking' && (
        <>
          <Circle cx={28.5} cy={30.8} r={2.8} fill={accentColor} />
          <Circle cx={38.5} cy={30.8} r={2.8} fill={accentColor} />
          <Path d="M27.5 37H36.5" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {mood === 'play' && (
        <>
          <Circle cx={26.5} cy={30.8} r={3} fill={accentColor} />
          <Path
            d="M34.5 31C36 28.8 38.5 28.8 40 31"
            stroke={accentColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M27.5 36.5C29.5 38.6 34.5 38.6 36.5 36.5"
            stroke="#27D188"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {(mood === 'double' || mood === 'win') && (
        <>
          <Path
            d="M26.5 26.8L27.5 29.4L30.2 30.2L27.5 31L26.5 33.6L25.5 31L22.8 30.2L25.5 29.4L26.5 26.8Z"
            fill="#F5C451"
          />
          <Path
            d="M37.5 26.8L38.5 29.4L41.2 30.2L38.5 31L37.5 33.6L36.5 31L33.8 30.2L36.5 29.4L37.5 26.8Z"
            fill="#F5C451"
          />
          <Path
            d="M26.2 36.5C29 40 35 40 37.8 36.5"
            stroke="#F5C451"
            strokeWidth={2.3}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {mood === 'draw' && (
        <>
          <Circle cx={26.5} cy={30.8} r={3.2} stroke="#F5C451" strokeWidth={2} fill="none" />
          <Circle cx={37.5} cy={30.8} r={3.2} stroke="#F5C451" strokeWidth={2} fill="none" />
          <Circle cx={32} cy={37.5} r={2.2} fill="#F5C451" />
        </>
      )}

      {(mood === 'pass' || mood === 'lose') && (
        <>
          <Path
            d="M24 28.8L29 33.2M29 28.8L24 33.2"
            stroke="#F43F5E"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M35 28.8L40 33.2M40 28.8L35 33.2"
            stroke="#F43F5E"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M28 38.2C30 36 34 36 36 38.2"
            stroke="#F43F5E"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {mood === 'idle' && (
        <>
          <Circle cx={26.5} cy={30.8} r={2.9} fill={accentColor} />
          <Circle cx={37.5} cy={30.8} r={2.9} fill={accentColor} />
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
