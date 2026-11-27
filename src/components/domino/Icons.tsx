import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function PauseIcon({ size = 20, color = '#F8FAFC' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6} y={5} width={4.2} height={14} rx={1.6} fill={color} />
      <Rect x={13.8} y={5} width={4.2} height={14} rx={1.6} fill={color} />
    </Svg>
  );
}

export function SoundOnIcon({ size = 20, color = '#F8FAFC' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9.5V14.5H8L13 19V5L8 9.5H4Z" fill={color} />
      <Path
        d="M16.4 8.6C17.8 10 17.8 14 16.4 15.4"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
      <Path
        d="M19.4 6C21.9 8.8 21.9 15.2 19.4 18"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SoundOffIcon({ size = 20, color = '#7E95AE' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9.5V14.5H8L13 19V5L8 9.5H4Z" fill={color} />
      <Path
        d="M16.5 9L21.5 15M21.5 9L16.5 15"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 18, color = '#F8FAFC' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StarIcon({
  size = 20,
  color = '#F5C451',
  filled = true,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.6L14.85 8.4L21.25 9.3L16.6 13.85L17.7 20.2L12 17.2L6.3 20.2L7.4 13.85L2.75 9.3L9.15 8.4L12 2.6Z"
        fill={filled ? color : 'transparent'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HistoryIcon({ size = 18, color = '#F8FAFC' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={2.1} />
      <Path
        d="M12 7.5V12L15.2 14"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlayIcon({ size = 20, color = '#0D1520' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.5 5.4C7.5 4.6 8.35 4.1 9.05 4.5L19.1 10.6C19.75 11 19.75 12 19.1 12.4L9.05 18.5C8.35 18.9 7.5 18.4 7.5 17.6V5.4Z"
        fill={color}
      />
    </Svg>
  );
}

/** Tactile Club Chip coin icon for economy balance & buy-ins */
export function ChipIcon({ size = 16, color = '#F5C451' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.5} fill={color} />
      <Circle
        cx={12}
        cy={12}
        r={6.4}
        stroke="#0D1520"
        strokeWidth={1.7}
        strokeDasharray="3.2 2.6"
      />
      <Circle cx={12} cy={12} r={2.6} fill="#0D1520" />
    </Svg>
  );
}

/** Table felt & frame icon for Mesas / Themes selector */
export function TableIcon({ size = 15, color = '#B9C8D9' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={14}
        rx={3.5}
        stroke={color}
        strokeWidth={2.1}
      />
      <Rect
        x={7}
        y={9}
        width={10}
        height={6}
        rx={1.5}
        stroke={color}
        strokeWidth={1.6}
        opacity={0.75}
      />
    </Svg>
  );
}

export function GlobeIcon({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={2} />
      <Path
        d="M3.8 12H20.2M12 3.5C14.3 6 15.5 8.8 15.5 12C15.5 15.2 14.3 18 12 20.5C9.7 18 8.5 15.2 8.5 12C8.5 8.8 9.7 6 12 3.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockIcon({ size = 15, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={5}
        y={10.5}
        width={14}
        height={9.5}
        rx={2.8}
        stroke={color}
        strokeWidth={2.1}
      />
      <Path
        d="M8.5 10.5V7.8C8.5 5.7 10.05 4 12 4C13.95 4 15.5 5.7 15.5 7.8V10.5"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={15.2} r={1.3} fill={color} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 18, color = '#F8FAFC' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5.5L8.5 12L15 18.5"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 15, color = '#0D1520' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.5 12.5L10 17L18.5 7.5"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size = 16, color = '#38BDF8' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4V14.5M12 4L8 8M12 4L16 8"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 13.5V17.5C5 18.88 6.12 20 7.5 20H16.5C17.88 20 19 18.88 19 17.5V13.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MessageIcon({ size = 16, color = '#B9C8D9' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6.5C5 5.12 6.12 4 7.5 4H16.5C17.88 4 19 5.12 19 6.5V13.5C19 14.88 17.88 16 16.5 16H10L6 19.5V16H7.5C6.12 16 5 14.88 5 13.5V6.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Circle cx={9.5} cy={10} r={1} fill={color} />
      <Circle cx={12} cy={10} r={1} fill={color} />
      <Circle cx={14.5} cy={10} r={1} fill={color} />
    </Svg>
  );
}

export function TrophyIcon({ size = 22, color = '#F5C451' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 4H17V10C17 12.76 14.76 15 12 15C9.24 15 7 12.76 7 10V4Z"
        fill={color}
      />
      <Path
        d="M7 6H4.5C4.5 9.2 5.7 11 7.5 11.2M17 6H19.5C19.5 9.2 18.3 11 16.5 11.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 15V19M8.5 20H15.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CrownIcon({ size = 18, color = '#F5C451' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 17.5L5.2 7.5L9.5 11.2L12 5.5L14.5 11.2L18.8 7.5L20.5 17.5H3.5Z"
        fill={color}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Rect x={4.5} y={19} width={15} height={2} rx={1} fill={color} />
    </Svg>
  );
}

export function RefreshIcon({ size = 15, color = '#38BDF8' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.5 12A7.5 7.5 0 1 1 17.3 6.7L19.5 8.8M19.5 4.5V8.8H15.2"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Compact user silhouette for 1v1 / 2v2 / 4 Jug. mode pills */
export function UserSilhouetteIcon({ size = 14, color = '#7E95AE' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.2} r={3.6} fill={color} />
      <Path
        d="M5.5 19.5C5.9 15.8 8.5 13.8 12 13.8C15.5 13.8 18.1 15.8 18.5 19.5H5.5Z"
        fill={color}
      />
    </Svg>
  );
}

/** Key icon for Private Room ("Sala Privada") matching the mockup */
export function KeyIcon({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={8.5} cy={12} r={4.2} stroke={color} strokeWidth={2.2} />
      <Path
        d="M12.7 12H20.5M17.5 12V15.5M20 12V14.8"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Clean settings/support gear icon for top-right glossy orb */
export function GearIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15.2A3.2 3.2 0 1 0 12 8.8A3.2 3.2 0 1 0 12 15.2Z"
        stroke={color}
        strokeWidth={2.1}
      />
      <Path
        d="M19.4 13.5L20.8 12L19.4 10.5L19.8 8.4L17.8 7.5L17.2 5.4L15 5.6L13.5 4L12 5L10.5 4L9 5.6L6.8 5.4L6.2 7.5L4.2 8.4L4.6 10.5L3.2 12L4.6 13.5L4.2 15.6L6.2 16.5L6.8 18.6L9 18.4L10.5 20L12 19L13.5 20L15 18.4L17.2 18.6L17.8 16.5L19.8 15.6L19.4 13.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
