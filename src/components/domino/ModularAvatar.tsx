import React, { useId } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  getAvatarFrame,
  getSkinTone,
} from '@/constants/avatarCatalog';
import { BotMood } from '@/constants/seatProfiles';

interface ModularAvatarProps {
  config?: AvatarConfig;
  mood?: BotMood;
  size?: number;
  showFrameRing?: boolean;
}

/**
 * 2.5D Illustrated Modular SVG Bust Avatar (`140x140` studio framing):
 * - Elevated head + full visible upper torso so tees, V-necks, hoodies, sweaters, polos & blazers shine.
 * - Independent facial anatomy (4 face shapes, sclera+colored iris eyes, 5 brows, 5 noses, 6 mouths)
 *   so every user crafts a genuinely unique identity.
 * - Soft radial 2.5D lighting, forehead hair cast shadow, chin shadow, and clean colored line-art.
 */
export function ModularAvatar({
  config = DEFAULT_AVATAR_CONFIG,
  mood = 'idle',
  size = 56,
  showFrameRing = false,
}: ModularAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const skin = getSkinTone(config.skinTone);
  const frame = getAvatarFrame(config.frame);

  const bgId = `bg_${uid}`;
  const spotId = `sp_${uid}`;
  const skinId = `sk_${uid}`;
  const clipId = `cl_${uid}`;
  const goldId = `gd_${uid}`;
  const lensId = `ln_${uid}`;

  const hair = config.hair;
  const hairCol = config.hairColor;
  const outfit = config.outfit;
  const outfitCol = config.outfitColor;
  const hat = config.hat;
  const browCol = hair === 'bald' ? '#3B2F2F' : hairCol;

  const fullCoverHat =
    hat === 'cap' ||
    hat === 'beanie' ||
    hat === 'bandana' ||
    hat === 'chef' ||
    hat === 'captain' ||
    hat === 'fedora';

  // Face silhouette paths (centered around x=70, y=54)
  const facePath =
    config.faceShape === 'angular'
      ? 'M45 50C45 33 55 25 70 25C85 25 95 33 95 50L93 66C92 74 82 81 70 82C58 81 48 74 47 66Z'
      : config.faceShape === 'soft'
      ? 'M43.5 53C43.5 34 54 25 70 25C86 25 96.5 34 96.5 53C96.5 71 85.5 82.5 70 82.5C54.5 82.5 43.5 71 43.5 53Z'
      : config.faceShape === 'slim'
      ? 'M47 52C47 34 56 25 70 25C84 25 93 34 93 52C93 69 83 83.5 70 83.5C57 83.5 47 69 47 52Z'
      : 'M45 52C45 34 55 25 70 25C85 25 95 34 95 52C95 69 84.5 82 70 82C55.5 82 45 69 45 52Z';

  const renderEyePair = () => {
    const lx = 59;
    const rx = 81;
    const ey = 54.5;

    if (config.eyeStyle === 'hearts') {
      return (
        <G>
          <Path d={`M${lx} ${ey + 4.5}C${lx - 4.2} ${ey + 1} ${lx - 5.5} ${ey - 2} ${lx - 3.5} ${ey - 4}C${lx - 2} ${ey - 5.2} ${lx - 0.5} ${ey - 4} ${lx} ${ey - 2.6}C${lx + 0.5} ${ey - 4} ${lx + 2} ${ey - 5.2} ${lx + 3.5} ${ey - 4}C${lx + 5.5} ${ey - 2} ${lx + 4.2} ${ey + 1} ${lx} ${ey + 4.5}Z`} fill="#F43F5E" />
          <Path d={`M${rx} ${ey + 4.5}C${rx - 4.2} ${ey + 1} ${rx - 5.5} ${ey - 2} ${rx - 3.5} ${ey - 4}C${rx - 2} ${ey - 5.2} ${rx - 0.5} ${ey - 4} ${rx} ${ey - 2.6}C${rx + 0.5} ${ey - 4} ${rx + 2} ${ey - 5.2} ${rx + 3.5} ${ey - 4}C${rx + 5.5} ${ey - 2} ${rx + 4.2} ${ey + 1} ${rx} ${ey + 4.5}Z`} fill="#F43F5E" />
        </G>
      );
    }

    const eyeRx = config.eyeStyle === 'bright' ? 5.6 : config.eyeStyle === 'almond' ? 5.5 : 5.1;
    const eyeRy = config.eyeStyle === 'bright' ? 4.9 : config.eyeStyle === 'focused' ? 3.5 : 4.2;
    const irisR = config.eyeStyle === 'bright' ? 3.4 : 3.0;
    const pupilOffsetX = config.eyeStyle === 'skeptic' ? 1.1 : 0;

    const renderSingleEye = (cx: number, isRight: boolean) => (
      <G key={cx}>
        {/* White sclera with subtle upper eyelid shadow */}
        <Ellipse cx={cx} cy={ey} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" stroke={skin.outline} strokeWidth={0.85} />
        {/* Colored iris */}
        <Circle cx={cx + pupilOffsetX} cy={ey + 0.2} r={irisR} fill={config.eyeColor} />
        {/* Pupil */}
        <Circle cx={cx + pupilOffsetX} cy={ey + 0.2} r={irisR * 0.52} fill="#0B111C" />
        {/* Crisp 2.5D catchlights */}
        {config.eyeStyle === 'star' ? (
          <Path
            d={`M${cx} ${ey - 2.6}L${cx + 0.7} ${ey - 0.7}L${cx + 2.6} ${ey}L${cx + 0.7} ${ey + 0.7}L${cx} ${ey + 2.6}L${cx - 0.7} ${ey + 0.7}L${cx - 2.6} ${ey}L${cx - 0.7} ${ey - 0.7}Z`}
            fill="#FEF08A"
          />
        ) : (
          <>
            <Circle cx={cx + pupilOffsetX + 1.1} cy={ey - 1.1} r={1.15} fill="#FFFFFF" />
            <Circle cx={cx + pupilOffsetX - 1.1} cy={ey + 1.1} r={0.55} fill="#FFFFFF" opacity={0.75} />
          </>
        )}
        {/* Upper lash line */}
        <Path
          d={`M${cx - eyeRx - 0.4} ${ey - 0.3}C${cx - eyeRx * 0.4} ${ey - eyeRy - 1} ${cx + eyeRx * 0.4} ${ey - eyeRy - 1} ${cx + eyeRx + 0.4} ${ey - 0.3}`}
          stroke="#181C26"
          strokeWidth={config.eyeStyle === 'almond' ? 2.1 : 1.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Winged lashes on almond / bright */}
        {config.eyeStyle === 'almond' && (
          <Path
            d={
              isRight
                ? `M${cx + eyeRx - 0.2} ${ey - 1.2}L${cx + eyeRx + 2.6} ${ey - 3.2}`
                : `M${cx - eyeRx + 0.2} ${ey - 1.2}L${cx - eyeRx - 2.6} ${ey - 3.2}`
            }
            stroke="#181C26"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        )}
      </G>
    );

    if (config.eyeStyle === 'wink') {
      return (
        <G>
          {renderSingleEye(lx, false)}
          <Path
            d={`M${rx - 5.2} ${ey + 0.6}C${rx - 2.5} ${ey - 3.2} ${rx + 2.5} ${ey - 3.2} ${rx + 5.2} ${ey + 0.6}`}
            stroke="#181C26"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    }

    return (
      <G>
        {renderSingleEye(lx, false)}
        {renderSingleEye(rx, true)}
      </G>
    );
  };

  const renderEyebrows = () => {
    if (config.eyeStyle === 'skeptic') {
      return (
        <G>
          <Path d="M52 47.5L65 47" stroke={browCol} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M75 45.2C78.5 41.2 84 41.4 88 45.2" stroke={browCol} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    if (config.eyebrows === 'thick') {
      return (
        <G>
          <Path d="M52 46.8C56 44.5 61 44.8 65 46.5" stroke={browCol} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d="M75 46.5C79 44.8 84 44.5 88 46.8" stroke={browCol} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    if (config.eyebrows === 'arched') {
      return (
        <G>
          <Path d="M52 46.8C56.5 43.2 61.5 44 65 46.2" stroke={browCol} strokeWidth={1.9} strokeLinecap="round" fill="none" />
          <Path d="M75 46.2C78.5 44 83.5 43.2 88 46.8" stroke={browCol} strokeWidth={1.9} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    if (config.eyebrows === 'straight') {
      return (
        <G>
          <Path d="M52 46.5L65 46.8" stroke={browCol} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M75 46.8L88 46.5" stroke={browCol} strokeWidth={2.5} strokeLinecap="round" />
        </G>
      );
    }
    if (config.eyebrows === 'expressive') {
      return (
        <G>
          <Path d="M52 45.8C56 43 61 44.5 65 47" stroke={browCol} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M75 47C79 44.5 84 43 88 45.8" stroke={browCol} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    return (
      <G>
        <Path d="M52.5 46.8C56 44.6 61 44.8 65 46.4" stroke={browCol} strokeWidth={2.3} strokeLinecap="round" fill="none" />
        <Path d="M75 46.4C79 44.8 84 44.6 87.5 46.8" stroke={browCol} strokeWidth={2.3} strokeLinecap="round" fill="none" />
      </G>
    );
  };

  const renderNose = () => {
    if (config.nose === 'small') {
      return (
        <Path
          d="M68 62.5C69.2 64.2 70.8 64.2 72 62.5"
          stroke={skin.outline}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (config.nose === 'straight') {
      return (
        <G>
          <Path d="M70 53V62.5" stroke={skin.shadow} strokeWidth={2} strokeLinecap="round" />
          <Path d="M67.2 63C68.6 64.5 71.4 64.5 72.8 63" stroke={skin.outline} strokeWidth={1.7} strokeLinecap="round" fill="none" />
        </G>
      );
    }
    if (config.nose === 'defined') {
      return (
        <Path
          d="M70 52.5L67.6 62.8C68.6 64.4 71.5 64.4 72.6 63"
          stroke={skin.outline}
          strokeWidth={1.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    }
    if (config.nose === 'wide') {
      return (
        <G>
          <Path d="M65.8 62.2C67.4 64.8 72.6 64.8 74.2 62.2" stroke={skin.outline} strokeWidth={1.9} strokeLinecap="round" fill="none" />
          <Circle cx={67} cy={62.5} r={1.1} fill={skin.outline} opacity={0.45} />
          <Circle cx={73} cy={62.5} r={1.1} fill={skin.outline} opacity={0.45} />
        </G>
      );
    }
    return (
      <Path
        d="M70 54.5L68.4 62.5C69.2 63.8 71.2 63.8 72 62.8"
        stroke={skin.outline}
        strokeWidth={1.75}
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  const renderMouth = () => {
    // Live table mood overrides
    if (mood === 'lose' || mood === 'pass') {
      return (
        <Path
          d="M62 72.8C65 69.8 75 69.8 78 72.8"
          stroke={skin.outline}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (mood === 'win' || mood === 'double' || config.mouth === 'laugh') {
      return (
        <G>
          <Path
            d="M59.5 68.8C63 77.2 77 77.2 80.5 68.8Z"
            fill="#9F2B3B"
            stroke={skin.outline}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <Path d="M61 69.2H79C77.5 72.2 62.5 72.2 61 69.2Z" fill="#FFFFFF" />
        </G>
      );
    }
    if (config.mouth === 'grin') {
      return (
        <G>
          <Path
            d="M60.5 69.2C64 75.6 76 75.6 79.5 69.2Z"
            fill="#FFFFFF"
            stroke={skin.outline}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </G>
      );
    }
    if (config.mouth === 'lips') {
      return (
        <G>
          <Path
            d="M61.5 70.6C64.5 68.8 68 69.2 70 70.1C72 69.2 75.5 68.8 78.5 70.6C76 74.2 64 74.2 61.5 70.6Z"
            fill={skin.lipColor}
          />
          <Path
            d="M62.8 70.8C66 72.1 74 72.1 77.2 70.8"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    }
    if (config.mouth === 'smirk') {
      return (
        <Path
          d="M62.5 71.8C67 72.8 74 71.8 78.5 68.6"
          stroke={skin.outline}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (config.mouth === 'calm') {
      return (
        <Path
          d="M63 71.2C66.5 72.2 73.5 72.2 77 71.2"
          stroke={skin.outline}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    return (
      <Path
        d="M61.5 69.8C65 73.8 75 73.8 78.5 69.8"
        stroke={skin.outline}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 140 140">
      <Defs>
        <LinearGradient id={bgId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={frame.bgTop} />
          <Stop offset="1" stopColor={frame.bgBottom} />
        </LinearGradient>
        <RadialGradient id={spotId} cx="50%" cy="42%" r="48%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={frame.isLightBackdrop ? 0.55 : 0.36} />
          <Stop offset="0.65" stopColor={frame.ringColor} stopOpacity={0.12} />
          <Stop offset="1" stopColor={frame.bgBottom} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={skinId} cx="42%" cy="36%" r="68%">
          <Stop offset="0" stopColor={skin.light} />
          <Stop offset="0.58" stopColor={skin.base} />
          <Stop offset="1" stopColor={skin.shadow} />
        </RadialGradient>
        <LinearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FEF08A" />
          <Stop offset="0.5" stopColor="#F59E0B" />
          <Stop offset="1" stopColor="#92400E" />
        </LinearGradient>
        <LinearGradient id={lensId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#38BDF8" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#0F172A" stopOpacity={0.86} />
        </LinearGradient>
        <ClipPath id={clipId}>
          <Circle cx={70} cy={70} r={showFrameRing ? 64 : 69} />
        </ClipPath>
      </Defs>

      {/* Studio Backdrop */}
      <Circle cx={70} cy={70} r={showFrameRing ? 64 : 69} fill={`url(#${bgId})`} />

      <G clipPath={`url(#${clipId})`}>
        <Circle cx={70} cy={58} r={60} fill={`url(#${spotId})`} />

        {frame.hasSparkles && (
          <G opacity={0.85}>
            <Path d="M22 30L23.8 34.4L28.2 36.2L23.8 38L22 42.4L20.2 38L15.8 36.2L20.2 34.4Z" fill="#FFFFFF" />
            <Path d="M118 34L119.4 37.5L122.9 38.9L119.4 40.3L118 43.8L116.6 40.3L113.1 38.9L116.6 37.5Z" fill="#FEF08A" />
            <Circle cx={28} cy={88} r={2.2} fill="#FFFFFF" opacity={0.75} />
            <Circle cx={114} cy={80} r={2} fill="#FEF08A" opacity={0.7} />
          </G>
        )}

        {/* ===== LAYER 1: BACK HAIR ===== */}
        {hair === 'straight_long' && (
          <G>
            <Path
              d="M40 48L35 126H105L100 48C96 29 85 21 70 21C55 21 44 29 40 48Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.3}
            />
            <Path d="M43 68V118M97 68V118" stroke="rgba(255,255,255,0.14)" strokeWidth={2.4} strokeLinecap="round" />
          </G>
        )}

        {hair === 'waves' && (
          <G>
            <Path
              d="M38 50C31 68 30 92 34 126H106C110 92 109 68 102 50C97 30 85 21 70 21C55 21 43 30 38 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.3}
            />
            <Path
              d="M39 74C43 82 39 94 43 114M101 74C97 82 101 94 97 114"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {hair === 'bob' && (
          <Path
            d="M39 50C35 66 37 82 44 90H96C103 82 105 66 101 50C97 30 85 21 70 21C55 21 43 30 39 50Z"
            fill={hairCol}
            stroke="rgba(0,0,0,0.22)"
            strokeWidth={1.3}
          />
        )}

        {hair === 'ponytail' && (
          <G>
            <Path
              d="M84 24C102 22 116 38 113 68C111 82 103 91 96 96C95 80 99 63 94 47C91 37 86 32 80 31Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.2}
            />
            <Ellipse cx={86} cy={29} rx={5.5} ry={4} fill={`url(#${goldId})`} />
          </G>
        )}

        {hair === 'bun' && !fullCoverHat && (
          <G>
            <Circle cx={70} cy={19} r={14.5} fill={hairCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.2} />
            <Path d="M60 15C65 10 75 10 80 15" stroke="rgba(255,255,255,0.2)" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Rect x={59} y={26} width={22} height={4} rx={2} fill={`url(#${goldId})`} />
          </G>
        )}

        {hair === 'afro' && (
          <G>
            <Circle cx={70} cy={46} r={37} fill={hairCol} />
            <Circle cx={42} cy={41} r={15} fill={hairCol} />
            <Circle cx={98} cy={41} r={15} fill={hairCol} />
            <Circle cx={52} cy={22} r={15} fill={hairCol} />
            <Circle cx={88} cy={22} r={15} fill={hairCol} />
            <Circle cx={40} cy={61} r={11.5} fill={hairCol} />
            <Circle cx={100} cy={61} r={11.5} fill={hairCol} />
          </G>
        )}

        {hair === 'braids' && (
          <G>
            <Path
              d="M42 50C40 62 38 74 40 86C38 96 39 110 41 124H50C49 110 50 96 49 84C50 72 49 60 50 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.1}
            />
            <Path
              d="M98 50C100 62 102 74 100 86C102 96 101 110 99 124H90C91 110 90 96 91 84C90 72 91 60 90 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.1}
            />
            <Circle cx={44.5} cy={94} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={45} cy={110} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={95.5} cy={94} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={95} cy={110} r={2.8} fill={`url(#${goldId})`} />
          </G>
        )}

        {/* ===== LAYER 2: ELEVATED UPPER TORSO & REAL GARMENTS (y=84..140!) ===== */}
        {outfit === 'tee' && (
          <G>
            <Path
              d="M18 140C22 104 40 90 70 90C100 90 118 104 122 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.5}
            />
            {/* Crew neck collar rib + subtle torso highlight */}
            <Path d="M53 90C58 102 82 102 87 90Z" fill={skin.base} />
            <Path
              d="M52 90C57 104 83 104 88 90"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth={3.2}
              fill="none"
            />
            <Path d="M40 110V138M100 110V138" stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
          </G>
        )}

        {outfit === 'vneck' && (
          <G>
            <Path
              d="M18 140C22 104 40 90 70 90C100 90 118 104 122 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.5}
            />
            <Path d="M54 90L70 112L86 90Z" fill={`url(#${skinId})`} />
            <Path
              d="M53.5 90L70 113L86.5 90"
              stroke="rgba(255,255,255,0.38)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              fill="none"
            />
          </G>
        )}

        {outfit === 'polo' && (
          <G>
            <Path
              d="M18 140C22 104 40 90 70 90C100 90 118 104 122 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.5}
            />
            {/* Crisp folded polo collar + placket */}
            <Path d="M55 90L70 104L85 90Z" fill="#FFFFFF" opacity={0.9} />
            <Path d="M53 89L66 104L55 108L48 95Z" fill={outfitCol} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />
            <Path d="M87 89L74 104L85 108L92 95Z" fill={outfitCol} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />
            <Rect x={67} y={102} width={6} height={22} rx={2} fill="rgba(0,0,0,0.15)" />
            <Circle cx={70} cy={109} r={1.8} fill="#FFFFFF" />
            <Circle cx={70} cy={118} r={1.8} fill="#FFFFFF" />
          </G>
        )}

        {outfit === 'hoodie' && (
          <G>
            <Path
              d="M16 140C20 103 38 89 70 89C102 89 120 103 124 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={1.5}
            />
            {/* Layered hood rim around neck */}
            <Path
              d="M44 92C52 106 88 106 96 92C92 85 84 85 70 86C56 85 48 85 44 92Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.6}
            />
            <Path d="M52 94C58 103 82 103 88 94Z" fill="rgba(0,0,0,0.24)" />
            {/* Iconic white hoodie drawstrings */}
            <Path d="M61 101L59 126M79 101L81 126" stroke="#F8FAFC" strokeWidth={2.6} strokeLinecap="round" />
            <Circle cx={59} cy={126} r={2} fill="#CBD5E1" />
            <Circle cx={81} cy={126} r={2} fill="#CBD5E1" />
          </G>
        )}

        {outfit === 'sweater' && (
          <G>
            <Path
              d="M17 140C21 104 39 90 70 90C101 90 119 104 123 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.5}
            />
            {/* Cozy ribbed turtleneck/crew band + knit chevron texture */}
            <Path
              d="M52 88C58 98 82 98 88 88C90 94 84 103 70 103C56 103 50 94 52 88Z"
              fill={outfitCol}
              stroke="rgba(255,255,255,0.32)"
              strokeWidth={1.4}
            />
            <Path
              d="M34 114L44 108L54 114L64 108L76 108L86 114L96 108L106 114"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M30 126L44 120L58 126L70 120L82 126L96 120L110 126"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {outfit === 'open_shirt' && (
          <G>
            {/* Casual open overshirt over crisp white inner tee */}
            <Path
              d="M17 140C21 104 39 90 70 90C101 90 119 104 123 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.5}
            />
            <Rect x={55} y={92} width={30} height={48} fill="#FFFFFF" />
            <Path d="M55 92C60 100 80 100 85 92Z" fill={skin.base} />
            <Path d="M52 90L57 104L46 108L43 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
            <Path d="M88 90L83 104L94 108L97 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
            <Path d="M55 104V140M85 104V140" stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} />
          </G>
        )}

        {outfit === 'blouse' && (
          <G>
            <Path
              d="M20 140C24 105 40 91 70 91C100 91 116 105 120 140Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.5}
            />
            <Path d="M50 91C55 109 85 109 90 91Z" fill={`url(#${skinId})`} />
            <Path
              d="M53 94C60 106 80 106 87 94"
              stroke={`url(#${goldId})`}
              strokeWidth={2}
              fill="none"
            />
            <Circle cx={70} cy={104.5} r={3.5} fill="#FFFBEB" stroke="#D97706" strokeWidth={1} />
          </G>
        )}

        {outfit === 'jacket' && (
          <G>
            <Path
              d="M16 140C20 102 38 89 70 89C102 89 120 102 124 140Z"
              fill="#1E2430"
              stroke="#0F141D"
              strokeWidth={1.5}
            />
            <Path d="M56 91L70 124L84 91Z" fill={outfitCol} />
            <Path d="M47 90L62 112L49 116L39 98Z" fill="#2F384A" stroke="rgba(255,255,255,0.14)" strokeWidth={1.1} />
            <Path d="M93 90L78 112L91 116L101 98Z" fill="#2F384A" stroke="rgba(255,255,255,0.14)" strokeWidth={1.1} />
            <Path d="M84 98L81 136" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="2.5 2.5" />
          </G>
        )}

        {outfit === 'blazer' && (
          <G>
            <Path
              d="M16 140C20 102 38 89 70 89C102 89 120 102 124 140Z"
              fill="#182745"
              stroke="#0D162B"
              strokeWidth={1.5}
            />
            <Path d="M56 90L70 125L84 90Z" fill="#F8FAFC" />
            <Path d="M48 89L67 123L53 126L41 97Z" fill="#263D69" />
            <Path d="M92 89L73 123L87 126L99 97Z" fill="#263D69" />
            {/* Pocket square */}
            <Path d="M87 119L98 114L99 121H87Z" fill={outfitCol} />
          </G>
        )}

        {outfit === 'royal_tux' && (
          <G>
            <Path
              d="M16 140C20 102 38 89 70 89C102 89 120 102 124 140Z"
              fill="#0F172A"
              stroke="#050812"
              strokeWidth={1.5}
            />
            <Path d="M56 90L70 126L84 90Z" fill="#FFFFFF" />
            <Path d="M47 89L68 124L56 127L41 97Z" fill={`url(#${goldId})`} />
            <Path d="M93 89L72 124L84 127L99 97Z" fill={`url(#${goldId})`} />
            <Path d="M61 98L70 102.5L79 98V107L70 102.5L61 107Z" fill={`url(#${goldId})`} />
            <Circle cx={70} cy={102.5} r={2.8} fill="#FFFBEB" />
          </G>
        )}

        {/* ===== LAYER 3: NECK, EARS & SCULPTED 2.5D HEAD ===== */}
        <Rect x={60.5} y={76} width={19} height={20} rx={7} fill={skin.shadow} />
        <Ellipse cx={70} cy={83.5} rx={11} ry={5} fill="rgba(0,0,0,0.16)" />

        {/* Ears */}
        <Circle cx={44.5} cy={58} r={6} fill={skin.base} stroke={skin.outline} strokeWidth={1.2} />
        <Circle cx={95.5} cy={58} r={6} fill={skin.base} stroke={skin.outline} strokeWidth={1.2} />
        <Path d="M43.5 55.5C45.5 56.5 45.5 60 43.5 60.5" stroke={skin.outline} strokeWidth={1.1} fill="none" />
        <Path d="M96.5 55.5C94.5 56.5 94.5 60 96.5 60.5" stroke={skin.outline} strokeWidth={1.1} fill="none" />

        {/* Face shape with 2.5D radial shading & subtle colored line-art */}
        <Path d={facePath} fill={`url(#${skinId})`} stroke={skin.outline} strokeWidth={1.35} />

        {/* Soft forehead shadow cast by front hair */}
        {hair !== 'bald' && (
          <Path
            d="M47 41C55 37 85 37 93 41C89 35 79 33 70 33C61 33 51 35 47 41Z"
            fill="rgba(0,0,0,0.08)"
          />
        )}

        {/* ===== LAYER 4: FACIAL ACCENTS, FRECKLES, EARRINGS & BEARDS ===== */}
        {(config.facial === 'blush' || config.facial === 'hoops') && (
          <G>
            <Ellipse cx={53} cy={63.5} rx={5.8} ry={3.2} fill={skin.blush} opacity={0.35} />
            <Ellipse cx={87} cy={63.5} rx={5.8} ry={3.2} fill={skin.blush} opacity={0.35} />
          </G>
        )}

        {config.facial === 'freckles' && (
          <G fill={skin.outline} opacity={0.48}>
            <Circle cx={51} cy={62} r={1.1} />
            <Circle cx={55} cy={63.5} r={1} />
            <Circle cx={53} cy={65.2} r={0.95} />
            <Circle cx={89} cy={62} r={1.1} />
            <Circle cx={85} cy={63.5} r={1} />
            <Circle cx={87} cy={65.2} r={0.95} />
          </G>
        )}

        {config.facial === 'blush' && (
          <G>
            <Circle cx={44} cy={64} r={2.6} fill="#FFFDF9" stroke="#CBD5E1" strokeWidth={0.9} />
            <Circle cx={96} cy={64} r={2.6} fill="#FFFDF9" stroke="#CBD5E1" strokeWidth={0.9} />
          </G>
        )}

        {config.facial === 'hoops' && (
          <G>
            <Circle cx={43} cy={67.5} r={5} stroke={`url(#${goldId})`} strokeWidth={2.2} fill="none" />
            <Circle cx={97} cy={67.5} r={5} stroke={`url(#${goldId})`} strokeWidth={2.2} fill="none" />
          </G>
        )}

        {config.facial === 'stubble' && (
          <Path
            d="M47 60C48 75 57 82 70 82C83 82 92 75 93 60C90 69 81 74 70 74C59 74 50 69 47 60Z"
            fill={hairCol}
            opacity={0.23}
          />
        )}

        {config.facial === 'beard' && (
          <G>
            <Path
              d="M45.5 58C45.5 75 55 86 70 86C85 86 94.5 75 94.5 58C90.5 66 84 69.5 79 68.5C75.5 66 64.5 66 61 68.5C56 69.5 49.5 66 45.5 58Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.1}
            />
            <Path d="M60 68C64 65 76 65 80 68C78 70.5 62 70.5 60 68Z" fill={hairCol} />
          </G>
        )}

        {config.facial === 'mustache' && (
          <Path
            d="M56 68C59 63.5 67 64.2 70 67.2C73 64.2 81 63.5 84 68C80 70 74 69 70 68.2C66 69 60 70 56 68Z"
            fill={hairCol}
          />
        )}

        {config.facial === 'goatee' && (
          <G>
            <Path d="M60 68C64 65 76 65 80 68C78 70.5 62 70.5 60 68Z" fill={hairCol} />
            <Path d="M61 73C62 81 66 85 70 85C74 85 78 81 79 73C75 76 65 76 61 73Z" fill={hairCol} />
          </G>
        )}

        {config.facial === 'dali' && (
          <Path
            d="M70 67.5C65 64 58 64.5 54 68C50 71 45 68.5 45.5 64C46 62 48.5 62 48.5 64C48.5 65.5 50.8 66 53.2 64.3C57 61.7 65.5 61.5 70 66C74.5 61.5 83 61.7 86.8 64.3C89.2 66 91.5 65.5 91.5 64C91.5 62 94 62 94.5 64C95 68.5 90 71 86 68C82 64.5 75 64 70 67.5Z"
            fill={hairCol}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={0.7}
          />
        )}

        {config.facial === 'pirate_beard' && (
          <G>
            <Path
              d="M45.5 58C45.5 75 54 87 62 89L60 100H67L70 90L73 100H80L78 89C86 87 94.5 75 94.5 58C90.5 66 84 70 79 69C75.5 66 64.5 66 61 69C56 70 49.5 66 45.5 58Z"
              fill={hairCol}
            />
            <Rect x={60} y={93} width={7} height={3} rx={1.5} fill={`url(#${goldId})`} />
            <Rect x={73} y={93} width={7} height={3} rx={1.5} fill={`url(#${goldId})`} />
          </G>
        )}

        {/* ===== LAYER 5: NOSE, MOUTH, EYES & EYEBROWS ===== */}
        {renderNose()}
        {renderMouth()}
        {renderEyePair()}
        {renderEyebrows()}

        {/* ===== LAYER 6: FRONT HAIR ===== */}
        {hair === 'bald' && !fullCoverHat && (
          <Ellipse cx={60} cy={34} rx={7.5} ry={3.5} fill="#FFFFFF" opacity={0.3} />
        )}

        {hair === 'buzz' && (
          <Path
            d="M44.5 47C45 31 55 23 70 23C85 23 95 31 95.5 47C91 38 82 34 70 34C58 34 49 38 44.5 47Z"
            fill={hairCol}
            opacity={0.86}
          />
        )}

        {hair === 'receding' && (
          <Path
            d="M44 50C44 37 49 30 56 32C60 33 63 36 70 36C77 36 80 33 84 32C91 30 96 37 96 50C93 43 88 40 83 41C81 36 76 34 70 34C64 34 59 36 57 41C52 40 47 43 44 50Z"
            fill={hairCol}
          />
        )}

        {hair === 'classic' && (
          <G>
            <Path
              d="M43 50C43 31 54 21 70 21C86 21 97 31 97 50C92 39 81 36 68 36C56 36 48 40 43 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.2}
            />
            {!fullCoverHat && (
              <Path d="M52 31C60 26 75 25 85 30" stroke="rgba(255,255,255,0.2)" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            )}
          </G>
        )}

        {hair === 'messy' && (
          <G>
            <Path
              d="M42 50C41 33 50 21 68 20C86 19 98 30 98 50C93 40 87 37 82 40C77 35 68 35 62 41C55 37 47 41 42 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.2}
            />
            {!fullCoverHat && (
              <Path d="M52 24L57 18L63 23L71 17L77 23L85 19L89 27" fill={hairCol} />
            )}
          </G>
        )}

        {hair === 'fade' && (
          <G>
            <Path
              d="M45 47C45 30 54 21 70 21C86 21 95 30 95 47C92 38 85 35 70 35C55 35 48 38 45 47Z"
              fill={hairCol}
            />
            {!fullCoverHat && <Rect x={52} y={20} width={36} height={10} rx={5} fill={hairCol} />}
          </G>
        )}

        {(hair === 'waves' || hair === 'bob' || hair === 'straight_long') && (
          <G>
            <Path
              d="M42 53C42 32 54 21 70 21C86 21 98 32 98 53C91 40 80 35 72 35C61 35 51 42 42 53Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.2}
            />
            <Path d="M50 35C60 40 75 40 85 33" stroke="rgba(255,255,255,0.2)" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          </G>
        )}

        {(hair === 'ponytail' || hair === 'bun') && (
          <Path
            d="M43 50C43 32 54 22 70 22C86 22 97 32 97 50C92 38 82 34 70 34C58 34 48 38 43 50Z"
            fill={hairCol}
          />
        )}

        {hair === 'curls' && (
          <G>
            <Circle cx={50} cy={36} r={9.5} fill={hairCol} />
            <Circle cx={61} cy={29} r={10.5} fill={hairCol} />
            <Circle cx={74} cy={28} r={11} fill={hairCol} />
            <Circle cx={86} cy={33} r={10} fill={hairCol} />
            <Circle cx={94} cy={44} r={7.5} fill={hairCol} />
            <Circle cx={46} cy={45} r={7.5} fill={hairCol} />
          </G>
        )}

        {hair === 'afro' && (
          <Path
            d="M44 49C48 37 58 33 70 33C82 33 92 37 96 49C91 42 82 39 70 39C58 39 49 42 44 49Z"
            fill={hairCol}
          />
        )}

        {hair === 'braids' && (
          <G>
            <Path
              d="M43 50C43 32 54 22 70 22C86 22 97 32 97 50C92 38 81 35 70 35C59 35 48 38 43 50Z"
              fill={hairCol}
            />
            <Path d="M70 23V35" stroke={skin.base} strokeWidth={1.6} opacity={0.8} />
          </G>
        )}

        {hair === 'pompadour' && (
          <G>
            <Path
              d="M43 49C42 30 51 16 72 15C91 14 99 27 97 49C93 38 84 35 70 35C55 35 48 39 43 49Z"
              fill={hairCol}
            />
            {!fullCoverHat && (
              <Path d="M52 24C62 18 78 18 87 24" stroke="rgba(255,255,255,0.24)" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            )}
          </G>
        )}

        {/* ===== LAYER 7: GLASSES ===== */}
        {config.glasses === 'round' && (
          <G>
            <Circle cx={59} cy={54.5} r={9} stroke="#D97706" strokeWidth={2.2} fill="rgba(255,255,255,0.12)" />
            <Circle cx={81} cy={54.5} r={9} stroke="#D97706" strokeWidth={2.2} fill="rgba(255,255,255,0.12)" />
            <Path d="M68 54.5H72M45 53.5L50 54M90 54L95 53.5" stroke="#D97706" strokeWidth={2} />
          </G>
        )}

        {config.glasses === 'square' && (
          <G>
            <Rect x={49} y={48} width={19} height={13} rx={3} stroke="#1E293B" strokeWidth={2.3} fill="rgba(255,255,255,0.14)" />
            <Rect x={72} y={48} width={19} height={13} rx={3} stroke="#1E293B" strokeWidth={2.3} fill="rgba(255,255,255,0.14)" />
            <Path d="M68 53H72M45 52L49 52.5M91 52.5L95 52" stroke="#1E293B" strokeWidth={2.2} />
          </G>
        )}

        {config.glasses === 'cat_eye' && (
          <G>
            <Path d="M47 49.5L67 51.5C67 59.5 62 62.5 56 61.5C51 60.5 48 55.5 47 49.5Z" fill="rgba(244,63,94,0.16)" stroke="#BE123C" strokeWidth={2.4} strokeLinejoin="round" />
            <Path d="M93 49.5L73 51.5C73 59.5 78 62.5 84 61.5C89 60.5 92 55.5 93 49.5Z" fill="rgba(244,63,94,0.16)" stroke="#BE123C" strokeWidth={2.4} strokeLinejoin="round" />
            <Path d="M67 53H73" stroke="#F59E0B" strokeWidth={2.2} />
          </G>
        )}

        {config.glasses === 'aviator' && (
          <G>
            <Path d="M49 49.5H67C67 59.5 62 63.5 56 62.5C51 61.5 49 56.5 49 49.5Z" fill={`url(#${lensId})`} stroke={`url(#${goldId})`} strokeWidth={2.2} />
            <Path d="M73 49.5H91C91 56.5 89 61.5 84 62.5C78 63.5 73 59.5 73 49.5Z" fill={`url(#${lensId})`} stroke={`url(#${goldId})`} strokeWidth={2.2} />
            <Path d="M66 50H74M67 52.5H73" stroke={`url(#${goldId})`} strokeWidth={1.8} />
            <Path d="M52 52L57 58.5M76 52L81 58.5" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.45} strokeLinecap="round" />
          </G>
        )}

        {config.glasses === 'wayfarer' && (
          <G>
            <Rect x={48} y={48.5} width={19} height={13} rx={3.5} fill="#0F172A" stroke="#334155" strokeWidth={1.8} />
            <Rect x={73} y={48.5} width={19} height={13} rx={3.5} fill="#0F172A" stroke="#334155" strokeWidth={1.8} />
            <Path d="M67 52H73M45 51.5L48 52M92 52L95 51.5" stroke="#0F172A" strokeWidth={2.6} />
            <Path d="M51 51L57 58.5M76 51L82 58.5" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.35} strokeLinecap="round" />
          </G>
        )}

        {config.glasses === 'hearts_shades' && (
          <G>
            <Path d="M58 62.5C51 57.5 48 52.5 51 49C53.5 46.5 56.8 48.3 58 50.5C59.2 48.3 62.5 46.5 65 49C68 52.5 65 57.5 58 62.5Z" fill="rgba(244, 63, 94, 0.84)" stroke="#FFF1F2" strokeWidth={1.8} />
            <Path d="M82 62.5C75 57.5 72 52.5 75 49C77.5 46.5 80.8 48.3 82 50.5C83.2 48.3 86.5 46.5 89 49C92 52.5 89 57.5 82 62.5Z" fill="rgba(244, 63, 94, 0.84)" stroke="#FFF1F2" strokeWidth={1.8} />
            <Path d="M66 52.5H74" stroke="#FFF1F2" strokeWidth={2} />
          </G>
        )}

        {config.glasses === 'pixel_boss' && (
          <G>
            <Rect x={45} y={48.5} width={50} height={4} fill="#090D16" />
            <Rect x={48} y={52.5} width={19} height={6} fill="#090D16" />
            <Rect x={51} y={58.5} width={13} height={3} fill="#090D16" />
            <Rect x={73} y={52.5} width={19} height={6} fill="#090D16" />
            <Rect x={76} y={58.5} width={13} height={3} fill="#090D16" />
            <Rect x={51} y={52.5} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={54.5} y={55.5} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={76} y={52.5} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={79.5} y={55.5} width={3.5} height={3} fill="#FFFFFF" />
          </G>
        )}

        {config.glasses === 'star_party' && (
          <G>
            <Path d="M58 44.5L61 51L68 52L63 56.5L64.2 63.5L58 60L51.8 63.5L53 56.5L48 52L55 51Z" fill="rgba(232, 121, 249, 0.8)" stroke="#FEF08A" strokeWidth={1.9} strokeLinejoin="round" />
            <Path d="M82 44.5L85 51L92 52L87 56.5L88.2 63.5L82 60L75.8 63.5L77 56.5L72 52L79 51Z" fill="rgba(232, 121, 249, 0.8)" stroke="#FEF08A" strokeWidth={1.9} strokeLinejoin="round" />
            <Path d="M66.5 53.5H73.5" stroke="#FEF08A" strokeWidth={2.2} />
          </G>
        )}

        {config.glasses === 'monocle' && (
          <G>
            <Circle cx={81} cy={54.5} r={9.5} fill="rgba(224, 242, 254, 0.22)" stroke={`url(#${goldId})`} strokeWidth={2.4} />
            <Path d="M77 50L81 54" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
            <Path d="M90.5 55.5C93.5 65 92 77 88 89" stroke={`url(#${goldId})`} strokeWidth={1.5} strokeDasharray="2 2" fill="none" />
          </G>
        )}

        {config.glasses === 'gold_visor' && (
          <G>
            <Path d="M46 48H94L91 61C88 62.5 79 62.5 75 59.5L70 56.5L65 59.5C61 62.5 52 62.5 49 61Z" fill={`url(#${goldId})`} opacity={0.92} stroke="#FEF08A" strokeWidth={1.8} />
            <Path d="M52 50.5L62 58.5M75 50.5L85 58.5" stroke="#FFFFFF" strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />
          </G>
        )}

        {/* ===== LAYER 8: HATS & HEADPIECES ===== */}
        {hat === 'headband' && (
          <G>
            <Path d="M44 41C50 23 90 23 96 41" stroke={`url(#${goldId})`} strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Circle cx={56} cy={29.5} r={2.4} fill="#FFFDF9" />
            <Circle cx={63} cy={27.2} r={2.6} fill="#FFFDF9" />
            <Circle cx={70} cy={26.5} r={2.8} fill="#FFFDF9" />
            <Circle cx={77} cy={27.2} r={2.6} fill="#FFFDF9" />
            <Circle cx={84} cy={29.5} r={2.4} fill="#FFFDF9" />
          </G>
        )}

        {hat === 'cap' && (
          <G>
            <Path d="M42 40C42 22 54 14 70 14C86 14 98 22 98 40Z" fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.3} />
            <Path d="M39 39C54 34 86 34 105 41C101 45 84 44 70 43C54 43 42 43 39 39Z" fill="#0F172A" />
            <Circle cx={70} cy={27} r={4.2} fill={`url(#${goldId})`} />
          </G>
        )}

        {hat === 'beanie' && (
          <G>
            <Path d="M42 40C42 20 54 12 70 12C86 12 98 20 98 40Z" fill={outfitCol} stroke="rgba(0,0,0,0.2)" strokeWidth={1.3} />
            <Rect x={41} y={32} width={58} height={10} rx={5} fill={outfitCol} stroke="rgba(255,255,255,0.28)" strokeWidth={1.3} />
            <Path d="M52 33V41M61 33V41M70 33V41M79 33V41M88 33V41" stroke="rgba(0,0,0,0.22)" strokeWidth={1.6} />
          </G>
        )}

        {hat === 'beret' && (
          <G>
            <Path d="M40 36C38 20 60 12 80 15C96 17 103 26 98 37C85 32 58 32 40 36Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth={1.2} />
            <Path d="M68 14L71 9" stroke="#7F1D1D" strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M50 22C62 18 78 18 88 22" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" fill="none" />
          </G>
        )}

        {hat === 'fedora' && (
          <G>
            <Path d="M48 36L53 17C58 13 82 13 87 17L92 36Z" fill="#EFE4CC" stroke="#C5B28D" strokeWidth={1.2} />
            <Path d="M49 30H91L92 35H48Z" fill="#1E293B" />
            <Ellipse cx={70} cy={36} rx={36} ry={6.5} fill="#E7D8B7" stroke="#BCA67E" strokeWidth={1.3} />
          </G>
        )}

        {hat === 'flower' && (
          <G>
            <Ellipse cx={90} cy={37} rx={7} ry={3.5} fill="#10B981" transform="rotate(-24 90 37)" />
            <Ellipse cx={99} cy={44} rx={6.5} ry={3.2} fill="#059669" transform="rotate(28 99 44)" />
            <Circle cx={94} cy={36} r={5.4} fill="#FB7185" />
            <Circle cx={100} cy={40} r={5.4} fill="#F43F5E" />
            <Circle cx={97} cy={46} r={5.2} fill="#FB7185" />
            <Circle cx={90} cy={45} r={5.2} fill="#F43F5E" />
            <Circle cx={88.5} cy={39.5} r={5.2} fill="#FDA4AF" />
            <Circle cx={94} cy={41.5} r={3.2} fill="#FEF08A" />
          </G>
        )}

        {hat === 'bandana' && (
          <G>
            <Path d="M42 41C43 22 55 14 70 14C85 14 97 22 98 41C86 35 54 35 42 41Z" fill="#DC2626" stroke="#991B1B" strokeWidth={1.4} />
            <Path d="M47 33C60 29 80 29 93 33" stroke="#FEF08A" strokeWidth={2.2} strokeDasharray="4 4" fill="none" />
            <Path d="M95 35L106 31L103 40Z" fill="#B91C1C" />
            <Path d="M96 38L107 43L100 46Z" fill="#DC2626" />
          </G>
        )}

        {hat === 'dj_phones' && (
          <G>
            <Path d="M40 52C40 21 52 12 70 12C88 12 100 21 100 52" stroke="#1E293B" strokeWidth={6} strokeLinecap="round" fill="none" />
            <Path d="M43 42C46 22 56 14 70 14C84 14 94 22 97 42" stroke="#38BDF8" strokeWidth={2} strokeLinecap="round" fill="none" />
            <Rect x={35} y={46} width={10} height={22} rx={5} fill="#0F172A" stroke="#38BDF8" strokeWidth={2} />
            <Rect x={95} y={46} width={10} height={22} rx={5} fill="#0F172A" stroke="#38BDF8" strokeWidth={2} />
          </G>
        )}

        {hat === 'chef' && (
          <G>
            <Circle cx={54} cy={19} r={11} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.3} />
            <Circle cx={70} cy={14} r={13} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.3} />
            <Circle cx={86} cy={19} r={11} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.3} />
            <Rect x={48} y={23} width={44} height={15} rx={4} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.3} />
            <Path d="M49 33H91" stroke="#E2E8F0" strokeWidth={2} />
          </G>
        )}

        {hat === 'captain' && (
          <G>
            <Path d="M42 29C48 14 92 14 98 29L92 37H48Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.3} />
            <Rect x={47} y={30} width={46} height={7} rx={2} fill="#0F172A" />
            <Path d="M48 32H92" stroke={`url(#${goldId})`} strokeWidth={1.6} />
            <Path d="M41 37C54 33 86 33 99 37C91 43 49 43 41 37Z" fill="#0F172A" />
            <Circle cx={70} cy={23.5} r={4.2} fill={`url(#${goldId})`} />
            <Circle cx={70} cy={23.5} r={1.8} fill="#0F172A" />
          </G>
        )}

        {hat === 'crown' && (
          <G>
            <Path d="M49 32L46 12L60 21L70 7L80 21L94 12L91 32Z" fill={`url(#${goldId})`} stroke="#FEF08A" strokeWidth={1.5} strokeLinejoin="round" />
            <Rect x={49} y={29} width={42} height={5} rx={2.5} fill="#B45309" />
            <Circle cx={70} cy={23} r={3.2} fill="#10B981" stroke="#FEF08A" strokeWidth={1} />
            <Circle cx={57} cy={25} r={2.2} fill="#F43F5E" />
            <Circle cx={83} cy={25} r={2.2} fill="#38BDF8" />
          </G>
        )}
      </G>

      {/* Outer collectible frame ring */}
      {showFrameRing && (
        <>
          <Circle cx={70} cy={70} r={66} stroke={frame.ringColor} strokeWidth={4.5} fill="none" />
          <Circle cx={70} cy={70} r={61.8} stroke="rgba(255,255,255,0.45)" strokeWidth={1.1} fill="none" />
        </>
      )}
    </Svg>
  );
}
