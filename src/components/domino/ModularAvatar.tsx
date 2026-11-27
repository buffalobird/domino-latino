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
  const isFem = config.bodyType === 'feminine';
  const browCol = hair === 'bald' ? '#3B2F2F' : hairCol;

  // Proportionally tailored torso silhouettes: gracefully tapered for feminine, structured broad for masculine
  const torsoBasePath = isFem
    ? 'M24 140C28 106 44 91 70 91C96 91 112 106 116 140Z'
    : 'M16 140C20 103 38 89 70 89C102 89 120 103 124 140Z';
  const neckX = isFem ? 62 : 60.2;
  const neckW = isFem ? 16 : 19.6;

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
          <Path d={`M${lx} ${ey + 4.5}C${lx - 4.2} ${ey + 1} ${lx - 5.5} ${ey - 2} ${lx - 3.5} ${ey - 4}C${lx - 2} ${ey - 5.2} ${lx - 0.5} ${ey - 4} ${lx} ${ey - 2.6}C${lx + 0.5} ${ey - 4} ${lx + 2} ${ey - 5.2} ${lx + 3.5} ${ey - 4}C${lx + 5.5} ${ey - 2} ${lx + 4.2} ${ey + 1} ${lx} ${ey + 4.5}Z`} fill="#F43F5E" stroke="#9F1239" strokeWidth={0.8} />
          <Path d={`M${rx} ${ey + 4.5}C${rx - 4.2} ${ey + 1} ${rx - 5.5} ${ey - 2} ${rx - 3.5} ${ey - 4}C${rx - 2} ${ey - 5.2} ${rx - 0.5} ${ey - 4} ${rx} ${ey - 2.6}C${rx + 0.5} ${ey - 4} ${rx + 2} ${ey - 5.2} ${rx + 3.5} ${ey - 4}C${rx + 5.5} ${ey - 2} ${rx + 4.2} ${ey + 1} ${rx} ${ey + 4.5}Z`} fill="#F43F5E" stroke="#9F1239" strokeWidth={0.8} />
        </G>
      );
    }

    if (config.eyeStyle === 'hero_white' || config.eyeStyle === 'laser_red') {
      const fill = config.eyeStyle === 'laser_red' ? '#EF4444' : '#FFFFFF';
      return (
        <G>
          <Path
            d={`M${lx - 6.2} ${ey - 2.4}L${lx + 5.5} ${ey + 0.8}C${lx + 2.5} ${ey + 3.8} ${lx - 3.2} ${ey + 3.4} ${lx - 6.2} ${ey - 2.4}Z`}
            fill={fill}
            stroke="#0F172A"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path
            d={`M${rx + 6.2} ${ey - 2.4}L${rx - 5.5} ${ey + 0.8}C${rx - 2.5} ${ey + 3.8} ${rx + 3.2} ${ey + 3.4} ${rx + 6.2} ${ey - 2.4}Z`}
            fill={fill}
            stroke="#0F172A"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </G>
      );
    }

    if (config.eyeStyle === 'cat_gold') {
      return (
        <G>
          <Path
            d={`M${lx - 6.2} ${ey - 1.5}Q${lx} ${ey - 3.5} ${lx + 5.6} ${ey + 0.6}Q${lx} ${ey + 3.8} ${lx - 6.2} ${ey - 1.5}Z`}
            fill="#FACC15"
            stroke="#7F1D1D"
            strokeWidth={1.4}
          />
          <Path
            d={`M${rx + 6.2} ${ey - 1.5}Q${rx} ${ey - 3.5} ${rx - 5.6} ${ey + 0.6}Q${rx} ${ey + 3.8} ${rx + 6.2} ${ey - 1.5}Z`}
            fill="#FACC15"
            stroke="#7F1D1D"
            strokeWidth={1.4}
          />
          <Ellipse cx={lx} cy={ey + 0.2} rx={1.15} ry={2.7} fill="#0F172A" />
          <Ellipse cx={rx} cy={ey + 0.2} rx={1.15} ry={2.7} fill="#0F172A" />
        </G>
      );
    }

    if (config.eyeStyle === 'closed_calm') {
      return (
        <G>
          <Path d={`M${lx - 5.2} ${ey + 0.4}Q${lx} ${ey + 3.2} ${lx + 5.2} ${ey + 0.4}`} stroke="#1E1B18" strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d={`M${rx - 5.2} ${ey + 0.4}Q${rx} ${ey + 3.2} ${rx + 5.2} ${ey + 0.4}`} stroke="#1E1B18" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    }

    if (config.eyeStyle === 'shocked') {
      return (
        <G>
          <Circle cx={lx} cy={ey} r={5.6} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.5} />
          <Circle cx={rx} cy={ey} r={5.6} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.5} />
          <Circle cx={lx + 0.8} cy={ey} r={1.65} fill="#0B111C" />
          <Circle cx={rx - 0.8} cy={ey} r={1.65} fill="#0B111C" />
        </G>
      );
    }

    if (config.eyeStyle === 'crazy') {
      return (
        <G>
          {/* Giant wide left eye + smaller goofy right eye */}
          <Circle cx={lx - 0.5} cy={ey - 0.4} r={6.6} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.6} />
          <Circle cx={lx + 1.6} cy={ey + 0.6} r={2.3} fill={config.eyeColor} />
          <Circle cx={lx + 1.6} cy={ey + 0.6} r={1.3} fill="#0B111C" />
          <Circle cx={lx + 2.3} cy={ey - 0.2} r={0.7} fill="#FFFFFF" />

          <Circle cx={rx + 0.8} cy={ey + 0.6} r={4.3} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.5} />
          <Circle cx={rx - 0.4} cy={ey + 0.2} r={1.8} fill={config.eyeColor} />
          <Circle cx={rx - 0.4} cy={ey + 0.2} r={1.0} fill="#0B111C" />
          <Circle cx={rx + 0.2} cy={ey - 0.3} r={0.6} fill="#FFFFFF" />
        </G>
      );
    }

    if (config.eyeStyle === 'goofy_squint') {
      return (
        <G>
          {/* Narrow suspicious squint left + wide inquisitive right */}
          <Ellipse cx={lx} cy={ey + 0.6} rx={5.4} ry={2.4} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.6} />
          <Circle cx={lx + 0.8} cy={ey + 0.7} r={1.9} fill={config.eyeColor} />
          <Circle cx={lx + 0.8} cy={ey + 0.7} r={1.0} fill="#0B111C" />
          <Path d={`M${lx - 5.8} ${ey - 1.2}Q${lx} ${ey - 2.6} ${lx + 5.8} ${ey - 0.6}`} stroke="#181C26" strokeWidth={2.2} strokeLinecap="round" fill="none" />

          <Circle cx={rx} cy={ey} r={5.4} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.6} />
          <Circle cx={rx - 0.4} cy={ey + 0.3} r={2.7} fill={config.eyeColor} />
          <Circle cx={rx - 0.4} cy={ey + 0.3} r={1.5} fill="#0B111C" />
          <Circle cx={rx + 0.6} cy={ey - 0.8} r={1.0} fill="#FFFFFF" />
        </G>
      );
    }

    if (config.eyeStyle === 'sleepy' || config.eyeStyle === 'relaxed') {
      const isSleepy = config.eyeStyle === 'sleepy';
      return (
        <G>
          {[lx, rx].map((cx) => (
            <G key={cx}>
              <Ellipse cx={cx} cy={ey + 0.8} rx={5.4} ry={3.4} fill="#FFFFFF" stroke={skin.outline} strokeWidth={1} />
              <Circle cx={cx} cy={ey + 0.8} r={2.6} fill={config.eyeColor} />
              <Circle cx={cx} cy={ey + 0.8} r={1.4} fill="#0B111C" />
              <Circle cx={cx + 0.9} cy={ey} r={0.85} fill="#FFFFFF" />
              {/* Half-closed heavy upper eyelid */}
              <Path
                d={`M${cx - 5.8} ${ey - 0.2}Q${cx} ${ey - 4.4} ${cx + 5.8} ${ey - 0.2}L${cx + 5.8} ${ey + 0.4}L${cx - 5.8} ${ey + 0.4}Z`}
                fill={skin.base}
              />
              <Path
                d={`M${cx - 5.8} ${ey + 0.2}L${cx + 5.8} ${ey + 0.2}`}
                stroke="#181C26"
                strokeWidth={1.9}
                strokeLinecap="round"
              />
              <Path
                d={`M${cx - 4.4} ${ey - 2.2}Q${cx} ${ey - 3.8} ${cx + 4.4} ${ey - 2.2}`}
                stroke={skin.outline}
                strokeWidth={1}
                fill="none"
              />
              {isSleepy && (
                <Path
                  d={`M${cx - 4.2} ${ey + 5.2}Q${cx} ${ey + 7.2} ${cx + 4.2} ${ey + 5.2}`}
                  stroke={skin.outline}
                  strokeWidth={1.15}
                  opacity={0.75}
                  fill="none"
                />
              )}
            </G>
          ))}
        </G>
      );
    }

    if (config.eyeStyle === 'sharp' || config.eyeStyle === 'rock_smoky') {
      const isRock = config.eyeStyle === 'rock_smoky';
      return (
        <G>
          {isRock && (
            <>
              <Path d={`M${lx - 7.5} ${ey - 3.5}L${lx + 6.5} ${ey - 0.2}L${lx + 4.5} ${ey + 4.2}L${lx - 6.5} ${ey + 2.8}Z`} fill="#0F172A" />
              <Path d={`M${rx + 7.5} ${ey - 3.5}L${rx - 6.5} ${ey - 0.2}L${rx - 4.5} ${ey + 4.2}L${rx + 6.5} ${ey + 2.8}Z`} fill="#0F172A" />
            </>
          )}
          <Path
            d={`M${lx - 6} ${ey - 2}L${lx + 5.4} ${ey + 0.3}C${lx + 3} ${ey + 3.6} ${lx - 3} ${ey + 3.5} ${lx - 6} ${ey - 2}Z`}
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth={isRock ? 1.5 : 2.1}
            strokeLinejoin="round"
          />
          <Path
            d={`M${rx + 6} ${ey - 2}L${rx - 5.4} ${ey + 0.3}C${rx - 3} ${ey + 3.6} ${rx + 3} ${ey + 3.5} ${rx + 6} ${ey - 2}Z`}
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth={isRock ? 1.5 : 2.1}
            strokeLinejoin="round"
          />
          <Circle cx={lx + 0.3} cy={ey + 0.5} r={2.3} fill={config.eyeColor} />
          <Circle cx={lx + 0.3} cy={ey + 0.5} r={1.2} fill="#0B111C" />
          <Circle cx={lx + 1.1} cy={ey - 0.2} r={0.85} fill="#FFFFFF" />

          <Circle cx={rx - 0.3} cy={ey + 0.5} r={2.3} fill={config.eyeColor} />
          <Circle cx={rx - 0.3} cy={ey + 0.5} r={1.2} fill="#0B111C" />
          <Circle cx={rx + 0.5} cy={ey - 0.2} r={0.85} fill="#FFFFFF" />
        </G>
      );
    }

    if (config.eyeStyle === 'puppy') {
      return (
        <G>
          {[lx, rx].map((cx) => (
            <G key={cx}>
              <Ellipse cx={cx} cy={ey + 0.2} rx={5.6} ry={5.2} fill="#FFFFFF" stroke="#181C26" strokeWidth={1.3} />
              <Circle cx={cx} cy={ey + 0.5} r={3.9} fill={config.eyeColor} />
              <Circle cx={cx} cy={ey + 0.5} r={2.3} fill="#0B111C" />
              <Circle cx={cx - 1.3} cy={ey - 1.1} r={1.55} fill="#FFFFFF" />
              <Circle cx={cx + 1.4} cy={ey + 1.5} r={0.85} fill="#FFFFFF" opacity={0.88} />
            </G>
          ))}
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
    if (config.mouth === 'smirk_teeth') {
      return (
        <G>
          <Path
            d="M61 72.2C67 72.8 74 71.2 79 67.6C79 73.2 71.5 75.8 61 72.2Z"
            fill="#FFFFFF"
            stroke="#3B1E10"
            strokeWidth={1.45}
            strokeLinejoin="round"
          />
        </G>
      );
    }
    if (config.mouth === 'tongue') {
      return (
        <G>
          <Path
            d="M61.5 72.5C65.5 69.2 73 69 78 71.2"
            stroke="#3B1E10"
            strokeWidth={2.1}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M68.5 70C69 76.2 75.5 77.6 76.5 72.5C76.8 71.2 75.5 70 73.5 70Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth={1.1}
          />
          <Path d="M72.5 70.5L73.2 74.2" stroke="#991B1B" strokeWidth={0.9} strokeLinecap="round" />
        </G>
      );
    }
    if (config.mouth === 'cat_mouth') {
      return (
        <Path
          d="M62 70.2C62.5 74.2 68.5 74.2 70 70.6C71.5 74.2 77.5 74.2 78 70.2"
          stroke="#3B1E10"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    }
    if (config.mouth === 'surprised_o') {
      return (
        <Ellipse
          cx={70}
          cy={72}
          rx={3.6}
          ry={4.2}
          fill="#7F1D1D"
          stroke="#3B1E10"
          strokeWidth={1.4}
        />
      );
    }
    if (config.mouth === 'grumpy') {
      return (
        <Path
          d="M62.5 73.5C65.8 70 74.2 70 77.5 73.5"
          stroke="#3B1E10"
          strokeWidth={2.3}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    if (config.mouth === 'grit') {
      return (
        <G>
          <Path
            d="M60.5 72.8C61.5 68.6 78.5 68.6 79.5 72.8C78.5 75.2 61.5 75.2 60.5 72.8Z"
            fill="#FFFFFF"
            stroke="#3B1E10"
            strokeWidth={1.45}
          />
          <Path d="M61.5 72H78.5M66 69.5V74.5M70 69.2V74.8M74 69.5V74.5" stroke="#64748B" strokeWidth={0.95} />
        </G>
      );
    }
    if (config.mouth === 'buck_teeth') {
      return (
        <G>
          <Path
            d="M60.5 70C65 71.5 75 71.5 79.5 70"
            stroke="#3B1E10"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Rect x={66.2} y={70.5} width={3.6} height={4.6} rx={0.9} fill="#FFFFFF" stroke="#3B1E10" strokeWidth={1.1} />
          <Rect x={70.2} y={70.5} width={3.6} height={4.6} rx={0.9} fill="#FFFFFF" stroke="#3B1E10" strokeWidth={1.1} />
        </G>
      );
    }
    if (config.mouth === 'vampire') {
      return (
        <G>
          <Path
            d="M61.5 71.4C65.5 69.6 74.5 69.6 78.5 71.4"
            stroke="#3B1E10"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M63.5 70.8L65.3 75.6L67.2 70.8Z" fill="#FFFFFF" stroke="#3B1E10" strokeWidth={1} strokeLinejoin="round" />
          <Path d="M72.8 70.8L74.7 75.6L76.5 70.8Z" fill="#FFFFFF" stroke="#3B1E10" strokeWidth={1} strokeLinejoin="round" />
        </G>
      );
    }
    if (config.mouth === 'stitched') {
      return (
        <G>
          <Path d="M60 71.8C65 71.2 75 71.2 80 71.8" stroke="#3B1E10" strokeWidth={1.9} strokeLinecap="round" fill="none" />
          <Path d="M63 69.6V73.8M66.5 69.4V73.8M70 69.4V73.8M73.5 69.4V73.8M77 69.6V73.8" stroke="#3B1E10" strokeWidth={1.3} strokeLinecap="round" />
        </G>
      );
    }
    if (config.mouth === 'pacifier') {
      return (
        <G>
          <Path
            d="M59 69C59 66.5 64 66 70 67.5C76 66 81 66.5 81 69C81 74.5 76.5 77.5 70 77.5C63.5 77.5 59 74.5 59 69Z"
            fill="#38BDF8"
            stroke="#0369A1"
            strokeWidth={1.4}
          />
          <Circle cx={70} cy={71.8} r={4.2} fill="#7DD3FC" stroke="#0284C7" strokeWidth={1.3} />
          <Circle cx={70} cy={74.6} r={4.6} stroke="#BAE6FD" strokeWidth={2.2} fill="none" />
        </G>
      );
    }
    if (config.mouth === 'gold_tooth') {
      return (
        <G>
          <Path
            d="M59.5 69.5C62.5 76.5 77.5 76.5 80.5 69.5C75.5 70.8 64.5 70.8 59.5 69.5Z"
            fill="#FFFFFF"
            stroke="#3B1E10"
            strokeWidth={1.45}
            strokeLinejoin="round"
          />
          {/* Gleaming single gold tooth */}
          <Rect x={72.5} y={70.2} width={3.6} height={4.4} rx={0.6} fill={`url(#${goldId})`} />
          <Path d="M60.8 72.5H79.2M65.5 70.2V74.8M70 70.4V75M74.5 70.2V74.8" stroke="#64748B" strokeWidth={0.85} />
        </G>
      );
    }
    if (config.mouth === 'daisy') {
      return (
        <G>
          <Path
            d="M61 70C64 75.5 76 75.5 79 70C74.5 71 65.5 71 61 70Z"
            fill="#FFFFFF"
            stroke="#3B1E10"
            strokeWidth={1.35}
          />
          <Path d="M56 71.5L83 70" stroke="#16A34A" strokeWidth={2.1} strokeLinecap="round" />
          {/* Blue-and-gold daisy blossom */}
          <Circle cx={55} cy={68} r={3.2} fill="#38BDF8" stroke="#0369A1" strokeWidth={0.7} />
          <Circle cx={59} cy={70} r={3.2} fill="#38BDF8" stroke="#0369A1" strokeWidth={0.7} />
          <Circle cx={57.5} cy={74.2} r={3.2} fill="#38BDF8" stroke="#0369A1" strokeWidth={0.7} />
          <Circle cx={52.5} cy={74.2} r={3.2} fill="#38BDF8" stroke="#0369A1" strokeWidth={0.7} />
          <Circle cx={51} cy={70} r={3.2} fill="#38BDF8" stroke="#0369A1" strokeWidth={0.7} />
          <Circle cx={55} cy={71.4} r={2.6} fill="#FACC15" />
        </G>
      );
    }
    if (config.mouth === 'wide_villain') {
      return (
        <G>
          <Path
            d="M55 67.5C61 79.5 79 79.5 85 67.5C78 71.5 62 71.5 55 67.5Z"
            fill="#FFFFFF"
            stroke="#7F1D1D"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="M57.5 72H82.5M62.5 69.8V75.6M67.5 70.5V76.5M72.5 70.5V76.5M77.5 69.8V75.6" stroke="#64748B" strokeWidth={0.95} />
        </G>
      );
    }
    if (config.mouth === 'rose') {
      return (
        <G>
          <Path
            d="M61 70C64 75.2 76 75.2 79 70C74.5 71 65.5 71 61 70Z"
            fill="#FFFFFF"
            stroke="#3B1E10"
            strokeWidth={1.35}
          />
          <Path d="M57 72L84 69.5" stroke="#15803D" strokeWidth={2.2} strokeLinecap="round" />
          <Ellipse cx={64} cy={73} rx={3.2} ry={1.5} fill="#22C55E" transform="rotate(-18 64 73)" />
          {/* Lush crimson rose */}
          <Circle cx={55.5} cy={71.5} r={5.4} fill="#DC2626" stroke="#7F1D1D" strokeWidth={1.1} />
          <Path d="M53 70.5C54.5 68.5 57.5 69 57.5 71.5C57.5 73.5 54 74 53.5 72" stroke="#FCA5A5" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </G>
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

        {/* Back layers for new expressive male/unisex hairstyles */}
        {hair === 'curtain' && (
          <Path
            d="M40 52L36 74L44 72L41 82L51 78H89L99 82L96 72L104 74L100 52Z"
            fill={hairCol}
            stroke="rgba(0,0,0,0.28)"
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
        )}

        {hair === 'shaggy' && (
          <Path
            d="M40 50L37 72L45 78H95L103 72L100 50Z"
            fill={hairCol}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={1.2}
          />
        )}

        {hair === 'slick_tail' && (
          <G>
            {/* Low sleek side ponytail peeking behind neck */}
            <Path
              d="M52 72C42 74 36 82 34 91C42 90 50 86 56 80Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
            <Path d="M40 84L45 81L43 86" stroke="rgba(255,255,255,0.3)" strokeWidth={1.3} fill="none" />
          </G>
        )}

        {hair === 'samurai_bun' && !fullCoverHat && (
          <G>
            {/* Fluffy high top-knot bun */}
            <Circle cx={70} cy={14} r={11.5} fill={hairCol} stroke="rgba(0,0,0,0.32)" strokeWidth={1.4} />
            <Circle cx={62} cy={15} r={6.5} fill={hairCol} />
            <Circle cx={78} cy={14} r={6.5} fill={hairCol} />
            <Circle cx={70} cy={8} r={6} fill={hairCol} />
            <Rect x={63} y={22} width={14} height={4.5} rx={2} fill="#7C2D12" stroke="#1C1917" strokeWidth={1} />
          </G>
        )}

        {hair === 'rocker_long' && (
          <Path
            d="M36 44L30 58L36 62L31 76L38 80L35 94L48 88H92L105 94L102 80L109 76L104 62L110 58L104 44C99 24 86 17 70 17C54 17 41 24 36 44Z"
            fill={hairCol}
            stroke="rgba(0,0,0,0.32)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        )}

        {hair === 'dreads_band' && (
          <G>
            {/* Textured curly dreadlock silhouette framing cheeks and neck */}
            <Circle cx={40} cy={46} r={9} fill={hairCol} />
            <Circle cx={100} cy={46} r={9} fill={hairCol} />
            <Circle cx={38} cy={60} r={8.5} fill={hairCol} />
            <Circle cx={102} cy={60} r={8.5} fill={hairCol} />
            <Circle cx={42} cy={74} r={8.5} fill={hairCol} />
            <Circle cx={98} cy={74} r={8.5} fill={hairCol} />
            <Circle cx={50} cy={80} r={7.5} fill={hairCol} />
            <Circle cx={90} cy={80} r={7.5} fill={hairCol} />
            <Circle cx={48} cy={27} r={9.5} fill={hairCol} />
            <Circle cx={61} cy={21} r={10} fill={hairCol} />
            <Circle cx={79} cy={21} r={10} fill={hairCol} />
            <Circle cx={92} cy={27} r={9.5} fill={hairCol} />
          </G>
        )}

        {/* ===== LAYER 2: ELEVATED UPPER TORSO & REAL GARMENTS (y=86..140!) ===== */}
        {outfit === 'tee' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.24)" strokeWidth={1.5} />
            <Path d="M53 90C58 102 82 102 87 90Z" fill={skin.base} />
            <Path d="M52 90C57 104 83 104 88 90" stroke="rgba(255,255,255,0.42)" strokeWidth={3.2} fill="none" />
            <Path d="M40 112V138M100 112V138" stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
          </G>
        )}

        {outfit === 'vneck' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.24)" strokeWidth={1.5} />
            <Path d="M54 90L70 112L86 90Z" fill={`url(#${skinId})`} />
            <Path d="M53.5 90L70 113L86.5 90" stroke="rgba(255,255,255,0.38)" strokeWidth={2.5} strokeLinejoin="round" fill="none" />
          </G>
        )}

        {outfit === 'tank' && (
          <G>
            {/* Bare shoulders + clean sleeveless athletic/beach tank top */}
            <Path d={torsoBasePath} fill={`url(#${skinId})`} stroke={skin.outline} strokeWidth={1.3} />
            <Path
              d="M42 93L48 93C53 106 87 106 92 93L98 93C98 108 102 124 104 140H36C38 124 42 108 42 93Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.26)"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <Path d="M48 93C53 107 87 107 92 93" stroke="rgba(255,255,255,0.4)" strokeWidth={2.4} fill="none" />
          </G>
        )}

        {outfit === 'stripes' && (
          <G>
            {/* Classic horizontal striped sailor/casual tee */}
            <Path d={torsoBasePath} fill="#F8FAFC" stroke="rgba(0,0,0,0.24)" strokeWidth={1.5} />
            <Path d="M36 101H104M29 111H111M24 121H116M20 131H120" stroke={outfitCol} strokeWidth={4.5} />
            <Path d="M51 90C56 103 84 103 89 90Z" fill={`url(#${skinId})`} />
            <Path d="M51 90C56 103 84 103 89 90" stroke={outfitCol} strokeWidth={2.4} fill="none" />
          </G>
        )}

        {outfit === 'polo' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.24)" strokeWidth={1.5} />
            <Path d="M55 90L70 104L85 90Z" fill="#FFFFFF" opacity={0.9} />
            <Path d="M53 89L66 104L55 108L48 95Z" fill={outfitCol} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />
            <Path d="M87 89L74 104L85 108L92 95Z" fill={outfitCol} stroke="rgba(255,255,255,0.45)" strokeWidth={1.2} />
            <Rect x={67} y={102} width={6} height={22} rx={2} fill="rgba(0,0,0,0.15)" />
            <Circle cx={70} cy={109} r={1.8} fill="#FFFFFF" />
            <Circle cx={70} cy={118} r={1.8} fill="#FFFFFF" />
          </G>
        )}

        {outfit === 'tie_shirt' && (
          <G>
            {/* Crisp white dress shirt + colored silk necktie */}
            <Path d={torsoBasePath} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.4} />
            <Path d="M53 89L67 101L57 106L49 94Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.1} />
            <Path d="M87 89L73 101L83 106L91 94Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.1} />
            <Path d="M66.5 98H73.5L72 104H68Z" fill={outfitCol} stroke="rgba(0,0,0,0.25)" strokeWidth={0.9} />
            <Path d="M68 104H72L75 130L70 137L65 130Z" fill={outfitCol} stroke="rgba(0,0,0,0.25)" strokeWidth={1.1} />
          </G>
        )}

        {outfit === 'flannel' && (
          <G>
            {/* Lumberjack red/charcoal tartan plaid flannel shirt */}
            <Path d={torsoBasePath} fill="#B91C1C" stroke="#450A0A" strokeWidth={1.5} />
            <Path d="M36 102H104M28 114H112M22 126H118" stroke="#1E293B" strokeWidth={4} opacity={0.55} />
            <Path d="M46 92V140M58 92V140M82 92V140M94 92V140" stroke="#1E293B" strokeWidth={3.5} opacity={0.52} />
            <Path d="M36 108H104M26 120H114M52 94V140M88 94V140" stroke="#FCA5A5" strokeWidth={1.2} opacity={0.45} />
            <Rect x={66.5} y={96} width={7} height={44} fill="#991B1B" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
            <Path d="M54 89L67 100L57 105L49 94Z" fill="#991B1B" stroke="#450A0A" strokeWidth={1.1} />
            <Path d="M86 89L73 100L83 105L91 94Z" fill="#991B1B" stroke="#450A0A" strokeWidth={1.1} />
            <Circle cx={70} cy={107} r={1.6} fill="#F8FAFC" />
            <Circle cx={70} cy={118} r={1.6} fill="#F8FAFC" />
            <Circle cx={70} cy={129} r={1.6} fill="#F8FAFC" />
          </G>
        )}

        {outfit === 'rock_skull' && (
          <G>
            {/* Matte black rock band tee with crisp stylized white skull emblem */}
            <Path d={torsoBasePath} fill="#141923" stroke="#05080F" strokeWidth={1.5} />
            <Path d="M53 90C58 101 82 101 87 90Z" fill={skin.base} />
            <Circle cx={70} cy={115} r={8.5} fill="#F8FAFC" />
            <Rect x={65} y={120} width={10} height={5.5} rx={2} fill="#F8FAFC" />
            <Circle cx={66.8} cy={115} r={2.3} fill="#141923" />
            <Circle cx={73.2} cy={115} r={2.3} fill="#141923" />
            <Path d="M68 122V125.5M70 122V125.5M72 122V125.5" stroke="#141923" strokeWidth={1.2} />
          </G>
        )}

        {outfit === 'hawaiian_floral' && (
          <G>
            {/* Vibrant tropical beach shirt with hibiscus blossoms & palm leaves */}
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} />
            <Path d="M54 90L70 108L86 90Z" fill={`url(#${skinId})`} />
            <Path d="M49 90L62 106L52 109L44 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.4)" strokeWidth={1.1} />
            <Path d="M91 90L78 106L88 109L96 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.4)" strokeWidth={1.1} />
            {/* Tropical flowers */}
            <Circle cx={44} cy={118} r={4.5} fill="#FEF08A" opacity={0.9} />
            <Circle cx={44} cy={118} r={1.8} fill="#F43F5E" />
            <Circle cx={94} cy={114} r={4.5} fill="#FDA4AF" opacity={0.9} />
            <Circle cx={94} cy={114} r={1.8} fill="#FEF08A" />
            <Circle cx={84} cy={130} r={4} fill="#86EFAC" opacity={0.85} />
            <Circle cx={56} cy={131} r={4} fill="#FFFBEB" opacity={0.85} />
          </G>
        )}

        {outfit === 'suspenders' && (
          <G>
            {/* Retro dress shirt + bold suspenders + tie */}
            <Path d={torsoBasePath} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.4} />
            <Path d="M54 89L68 101L58 106L49 94Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.1} />
            <Path d="M86 89L72 101L82 106L91 94Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1.1} />
            {/* Suspenders straps */}
            <Rect x={48} y={91} width={6.5} height={49} fill={outfitCol} stroke="rgba(0,0,0,0.28)" strokeWidth={1} />
            <Rect x={85.5} y={91} width={6.5} height={49} fill={outfitCol} stroke="rgba(0,0,0,0.28)" strokeWidth={1} />
            {/* Center necktie */}
            <Path d="M67 99H73L75 129L70 135L65 129Z" fill="#1E293B" />
            <Path d="M66.5 107L73.5 111M66 116L74 120M66 125L74 129" stroke={outfitCol} strokeWidth={1.8} />
          </G>
        )}

        {outfit === 'ballet' && (
          <G>
            {/* Graceful off-shoulder dance / ballet bodice with sweetheart neckline & pearl bow */}
            <Path d={torsoBasePath} fill={`url(#${skinId})`} stroke={skin.outline} strokeWidth={1.3} />
            <Path
              d="M34 114C46 106 60 112 70 116C80 112 94 106 106 114L112 140H28Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1.4}
            />
            <Path d="M46 93L48 112M94 93L92 112" stroke={outfitCol} strokeWidth={3.2} strokeLinecap="round" />
            <Circle cx={70} cy={117} r={3} fill="#FFFDF9" stroke="rgba(0,0,0,0.18)" strokeWidth={0.9} />
            <Path d="M36 116C48 111 60 115 70 119C80 115 92 111 104 116" stroke="rgba(255,255,255,0.55)" strokeWidth={1.6} fill="none" />
          </G>
        )}

        {outfit === 'vest_bowtie' && (
          <G>
            {/* White dress shirt + tailored colored gala vest + classic black bowtie */}
            <Path d={torsoBasePath} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.4} />
            <Path d="M44 91L67 119L70 140H36L40 100Z" fill={outfitCol} stroke="rgba(0,0,0,0.28)" strokeWidth={1.2} />
            <Path d="M96 91L73 119L70 140H104L100 100Z" fill={outfitCol} stroke="rgba(0,0,0,0.28)" strokeWidth={1.2} />
            <Path d="M61 96L70 101L79 96V105L70 101L61 105Z" fill="#0F172A" />
            <Circle cx={70} cy={100.5} r={2.4} fill="#334155" />
            <Circle cx={70} cy={124} r={1.7} fill="#FEF08A" />
            <Circle cx={70} cy={133} r={1.7} fill="#FEF08A" />
          </G>
        )}

        {outfit === 'kimono' && (
          <G>
            {/* Traditional crossover Japanese kimono wrap with contrasting lapel trim */}
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.26)" strokeWidth={1.5} />
            <Path d="M51 90L70 114L89 90Z" fill={`url(#${skinId})`} />
            {/* Left-over-right crossover lapels */}
            <Path d="M46 90L78 134L70 140L39 95Z" fill="#FFFDF9" stroke="rgba(0,0,0,0.22)" strokeWidth={1.2} />
            <Path d="M94 90L72 118L66 112L86 90Z" fill="#FFFDF9" stroke="rgba(0,0,0,0.22)" strokeWidth={1.2} />
            {/* Golden obi sash band at bottom */}
            <Rect x={34} y={128} width={72} height={12} fill={`url(#${goldId})`} stroke="#78350F" strokeWidth={1.1} />
          </G>
        )}

        {outfit === 'pirate' && (
          <G>
            {/* Cream adventure pirate tunic + diagonal leather cross-belt with brass buckle */}
            <Path d={torsoBasePath} fill="#F5ECD7" stroke="#9C8462" strokeWidth={1.5} />
            <Path d="M54 90L70 114L86 90Z" fill={`url(#${skinId})`} />
            <Path d="M48 90L62 108L50 111L43 96Z" fill="#EFE2C4" stroke="#9C8462" strokeWidth={1.1} />
            <Path d="M92 90L78 108L90 111L97 96Z" fill="#EFE2C4" stroke="#9C8462" strokeWidth={1.1} />
            {/* Diagonal leather baldric strap + buckle */}
            <Path d="M41 93L99 138L88 140L33 98Z" fill="#6B3410" stroke="#3B1A06" strokeWidth={1.3} />
            <Rect x={58} y={108} width={11} height={9} rx={2} fill={`url(#${goldId})`} stroke="#78350F" strokeWidth={1.2} transform="rotate(37 63 112)" />
          </G>
        )}

        {outfit === 'winter_fur' && (
          <G>
            {/* Heavy Nordic / Russian winter coat with plush cream fur collar */}
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />
            <Path d="M70 104V140" stroke="rgba(0,0,0,0.3)" strokeWidth={2.2} />
            {/* Plush fur shawl collar */}
            <Path
              d="M39 94C46 86 58 88 70 96C82 88 94 86 101 94C102 104 88 112 70 112C52 112 38 104 39 94Z"
              fill="#F3EAD8"
              stroke="#B8A88A"
              strokeWidth={1.4}
            />
            <Circle cx={70} cy={113} r={3.5} fill={`url(#${goldId})`} stroke="#78350F" strokeWidth={1} />
          </G>
        )}

        {outfit === 'princess' && (
          <G>
            {/* Off-shoulder royal princess gown with puff sleeves & gemstone pendant */}
            <Path d={torsoBasePath} fill={`url(#${skinId})`} stroke={skin.outline} strokeWidth={1.3} />
            {/* Puff sleeves */}
            <Circle cx={33} cy={120} r={14} fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.3} />
            <Circle cx={107} cy={120} r={14} fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.3} />
            {/* Sweetheart bodice */}
            <Path d="M38 114C50 107 62 111 70 116C78 111 90 107 102 114L108 140H32Z" fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.4} />
            <Path d="M39 115C50 109 62 112 70 117C78 112 90 109 101 115" stroke="#FEF08A" strokeWidth={2.2} fill="none" />
            <Path d="M55 96C62 104 78 104 85 96" stroke={`url(#${goldId})`} strokeWidth={1.6} fill="none" />
            <Circle cx={70} cy={104} r={3.6} fill="#38BDF8" stroke="#FEF08A" strokeWidth={1.3} />
          </G>
        )}

        {outfit === 'carnival' && (
          <G>
            {/* Vibrant Brazilian carnival / festive feathered shoulder collar & jeweled necklace */}
            <Path d={torsoBasePath} fill={`url(#${skinId})`} stroke={skin.outline} strokeWidth={1.3} />
            {/* Feathered festive plumes on shoulders */}
            <Ellipse cx={34} cy={108} rx={14} ry={8} fill="#10B981" stroke="#065F46" strokeWidth={1.2} transform="rotate(-28 34 108)" />
            <Ellipse cx={106} cy={108} rx={14} ry={8} fill="#10B981" stroke="#065F46" strokeWidth={1.2} transform="rotate(28 106 108)" />
            <Ellipse cx={38} cy={115} rx={12} ry={6.5} fill="#FACC15" stroke="#B45309" strokeWidth={1.1} transform="rotate(-16 38 115)" />
            <Ellipse cx={102} cy={115} rx={12} ry={6.5} fill="#FACC15" stroke="#B45309" strokeWidth={1.1} transform="rotate(16 102 115)" />
            <Path d="M40 118C52 110 88 110 100 118L106 140H34Z" fill={outfitCol} stroke="#FEF08A" strokeWidth={1.8} />
            {/* Colorful jeweled collar */}
            <Path d="M48 97C58 109 82 109 92 97" stroke={`url(#${goldId})`} strokeWidth={3.2} fill="none" />
            <Circle cx={58} cy={103} r={2.5} fill="#38BDF8" />
            <Circle cx={70} cy={106} r={3.4} fill="#F43F5E" stroke="#FEF08A" strokeWidth={1} />
            <Circle cx={82} cy={103} r={2.5} fill="#34D399" />
          </G>
        )}

        {outfit === 'pharaoh' && (
          <G>
            {/* Egyptian linen tunic with ornate turquoise/gold beaded royal collar */}
            <Path d={torsoBasePath} fill="#FFF7E6" stroke="#C8B288" strokeWidth={1.4} />
            <Path d="M46 92C56 108 84 108 94 92L101 102C88 122 52 122 39 102Z" fill={`url(#${goldId})`} stroke="#78350F" strokeWidth={1.3} />
            <Path d="M46 102C58 115 82 115 94 102" stroke="#0EA5E9" strokeWidth={3.2} strokeDasharray="4 3" fill="none" />
            <Path d="M51 96C60 107 80 107 89 96" stroke="#DC2626" strokeWidth={2.2} strokeDasharray="3 4" fill="none" />
            <Circle cx={70} cy={116} r={5.2} fill="#0284C7" stroke="#FEF08A" strokeWidth={1.6} />
          </G>
        )}

        {outfit === 'queen' && (
          <G>
            {/* Regal velvet imperial gown with high gold-trimmed collar & ruby brooch */}
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />
            {/* High royal standing collar */}
            <Path d="M45 92L38 78L55 88Z" fill={outfitCol} stroke={`url(#${goldId})`} strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M95 92L102 78L85 88Z" fill={outfitCol} stroke={`url(#${goldId})`} strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M52 91C58 106 82 106 88 91Z" fill={`url(#${skinId})`} />
            <Path d="M50 91C57 108 83 108 90 91" stroke={`url(#${goldId})`} strokeWidth={3.4} fill="none" />
            <Path d="M36 104C50 116 90 116 104 104" stroke="#FEF08A" strokeWidth={1.6} opacity={0.75} fill="none" />
            <Circle cx={70} cy={106} r={4.2} fill="#E11D48" stroke="#FEF08A" strokeWidth={1.4} />
          </G>
        )}

        {outfit === 'hoodie' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
            <Path
              d="M44 92C52 106 88 106 96 92C92 85 84 85 70 86C56 85 48 85 44 92Z"
              fill={outfitCol}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={1.6}
            />
            <Path d="M52 94C58 103 82 103 88 94Z" fill="rgba(0,0,0,0.24)" />
            <Path d="M61 101L59 126M79 101L81 126" stroke="#F8FAFC" strokeWidth={2.6} strokeLinecap="round" />
            <Circle cx={59} cy={126} r={2} fill="#CBD5E1" />
            <Circle cx={81} cy={126} r={2} fill="#CBD5E1" />
          </G>
        )}

        {outfit === 'sweater' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} />
            <Path
              d="M52 88C58 98 82 98 88 88C90 94 84 103 70 103C56 103 50 94 52 88Z"
              fill={outfitCol}
              stroke="rgba(255,255,255,0.32)"
              strokeWidth={1.4}
            />
            <Path d="M34 114L44 108L54 114L64 108L76 108L86 114L96 108L106 114" stroke="rgba(255,255,255,0.28)" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M30 126L44 120L58 126L70 120L82 126L96 120L110 126" stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeLinecap="round" fill="none" />
          </G>
        )}

        {outfit === 'open_shirt' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} />
            <Rect x={55} y={92} width={30} height={48} fill="#FFFFFF" />
            <Path d="M55 92C60 100 80 100 85 92Z" fill={skin.base} />
            <Path d="M52 90L57 104L46 108L43 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
            <Path d="M88 90L83 104L94 108L97 96Z" fill={outfitCol} stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
            <Path d="M55 104V140M85 104V140" stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} />
          </G>
        )}

        {outfit === 'blouse' && (
          <G>
            <Path d={torsoBasePath} fill={outfitCol} stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} />
            <Path d="M50 91C55 109 85 109 90 91Z" fill={`url(#${skinId})`} />
            <Path d="M53 94C60 106 80 106 87 94" stroke={`url(#${goldId})`} strokeWidth={2} fill="none" />
            <Circle cx={70} cy={104.5} r={3.5} fill="#FFFBEB" stroke="#D97706" strokeWidth={1} />
          </G>
        )}

        {outfit === 'jacket' && (
          <G>
            <Path d={torsoBasePath} fill="#1E2430" stroke="#0F141D" strokeWidth={1.5} />
            <Path d="M56 91L70 124L84 91Z" fill={outfitCol} />
            <Path d="M47 90L62 112L49 116L39 98Z" fill="#2F384A" stroke="rgba(255,255,255,0.14)" strokeWidth={1.1} />
            <Path d="M93 90L78 112L91 116L101 98Z" fill="#2F384A" stroke="rgba(255,255,255,0.14)" strokeWidth={1.1} />
            <Path d="M84 98L81 136" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="2.5 2.5" />
          </G>
        )}

        {outfit === 'blazer' && (
          <G>
            <Path d={torsoBasePath} fill="#182745" stroke="#0D162B" strokeWidth={1.5} />
            <Path d="M56 90L70 125L84 90Z" fill="#F8FAFC" />
            <Path d="M48 89L67 123L53 126L41 97Z" fill="#263D69" />
            <Path d="M92 89L73 123L87 126L99 97Z" fill="#263D69" />
            <Path d="M87 119L98 114L99 121H87Z" fill={outfitCol} />
          </G>
        )}

        {outfit === 'royal_tux' && (
          <G>
            <Path d={torsoBasePath} fill="#0F172A" stroke="#050812" strokeWidth={1.5} />
            <Path d="M56 90L70 126L84 90Z" fill="#FFFFFF" />
            <Path d="M47 89L68 124L56 127L41 97Z" fill={`url(#${goldId})`} />
            <Path d="M93 89L72 124L84 127L99 97Z" fill={`url(#${goldId})`} />
            <Path d="M61 98L70 102.5L79 98V107L70 102.5L61 107Z" fill={`url(#${goldId})`} />
            <Circle cx={70} cy={102.5} r={2.8} fill="#FFFBEB" />
          </G>
        )}

        {/* ===== LAYER 3: NECK, EARS & SCULPTED 2.5D HEAD ===== */}
        <Rect x={neckX} y={76} width={neckW} height={20} rx={7} fill={skin.shadow} />
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
              stroke="rgba(0,0,0,0.28)"
              strokeWidth={1.3}
            />
            {!fullCoverHat && (
              <Path d="M52 24C62 18 78 18 87 24" stroke="rgba(255,255,255,0.26)" strokeWidth={2.6} strokeLinecap="round" fill="none" />
            )}
          </G>
        )}

        {/* ===== NEW EXPRESSIVE MALE / UNISEX HAIRSTYLES (with zig-zag sheen & temple sideburns) ===== */}
        {hair === 'textured_crop' && (
          <G>
            <Path
              d="M43 52C42 33 52 21 70 21C88 21 98 33 97 52L94 49L92 38L87 40L83 34L78 39L74 33L70 39L66 33L62 39L57 34L53 40L48 38L46 49Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.35}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M56 30L60 26L64 31L68 25L72 31L76 26L81 30"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'spiky' && (
          <G>
            <Path
              d="M43 53L41 36L46 39L48 25L56 30L64 16L71 25L79 14L83 27L92 22L94 37L99 35L97 53L93 48L91 37C84 35 77 34 70 34C63 34 56 35 49 37L47 48Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.34)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M52 31L57 26L61 32L66 25L70 32L75 25L79 32L84 26L88 31"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'spiky_wild' && (
          <G>
            <Path
              d="M43 53L36 37L43 37L31 21L50 26L46 15L62 23L70 11L78 23L94 15L90 26L109 21L97 37L104 37L97 53L93 46L91 39C85 35 78 33 70 36C62 33 55 35 49 39L47 46Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.36)"
              strokeWidth={1.45}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M44 26L52 29L58 24L64 31L70 24L76 31L82 24L88 29L96 26"
                stroke="rgba(255,255,255,0.36)"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'curtain' && (
          <G>
            {/* Middle-parted curtain bangs with crisp central V gap */}
            <Path
              d="M41 56C40 34 50 21 69 22L70 28L71 22C90 21 100 34 99 56L94 52C93 41 85 34 75 33L78 44L70 33L62 44L65 33C55 34 47 41 46 52Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <>
                <Path d="M51 32C55 27 62 27 65 30" stroke="rgba(255,255,255,0.28)" strokeWidth={2} strokeLinecap="round" fill="none" />
                <Path d="M89 32C85 27 78 27 75 30" stroke="rgba(255,255,255,0.28)" strokeWidth={2} strokeLinecap="round" fill="none" />
              </>
            )}
          </G>
        )}

        {hair === 'shaggy' && (
          <G>
            {/* Layered full forehead bangs with wispy separated tips */}
            <Path
              d="M41 55C40 32 51 20 70 20C89 20 100 32 99 55L94 49L91 41L86 46L82 37L75 46L70 36L64 46L58 37L54 46L49 41L46 49Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M54 29L59 25L63 30L68 25L72 30L77 25L82 29"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.8}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'side_sweep' && (
          <G>
            {/* Diagonal swept bangs across forehead with expressive points */}
            <Path
              d="M41 55L38 49C40 30 52 19 71 20C89 21 99 32 101 51L96 54L92 43L82 47L76 41L66 49L57 42L48 52Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path d="M55 29L64 25L68 31L77 27" stroke="rgba(255,255,255,0.32)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
          </G>
        )}

        {hair === 'wavy_part' && (
          <G>
            {/* Voluminous side-parted wavy quiff */}
            <Path
              d="M42 53C38 40 42 26 53 23C59 16 78 15 89 22C99 28 102 41 97 53L92 46C91 37 83 34 73 36C67 37 62 32 54 34C48 36 47 43 46 50Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M57 25C64 21 74 22 81 27C85 30 88 28 90 32"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'bowl_mod' && (
          <G>
            {/* Clean retro mod bowl cut with sharp straight bangs & zig-zag sheen */}
            <Path
              d="M41 48C42 28 53 19 70 19C87 19 98 28 99 48L93 48L90 38H50L47 48Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path
                d="M52 31L56 26L61 32L66 26L71 32L76 26L81 32L86 27"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'slick_tail' && (
          <G>
            {/* Sleek combed-back hairline with bright horizontal glossy arc */}
            <Path
              d="M43 51C43 31 53 21 70 21C87 21 97 31 97 51L93 47C92 38 86 34 70 34C54 34 48 38 47 47Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1.35}
            />
            {!fullCoverHat && (
              <Path
                d="M49 34C55 27 85 27 91 34"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth={3.2}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'samurai_bun' && (
          <G>
            {/* Pulled-back spiky temples + signature single forehead curl */}
            <Path
              d="M43 52L40 42L45 40L44 31C51 24 60 22 70 22C80 22 89 24 96 31L95 40L100 42L97 52L93 47C92 38 85 34 70 34C55 34 48 38 47 47Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.35}
              strokeLinejoin="round"
            />
            <Path d="M70 33C68 38 72 42 75 40" stroke={hairCol} strokeWidth={2.8} strokeLinecap="round" fill="none" />
            {!fullCoverHat && (
              <Path d="M56 30L61 26L65 30L70 26L75 30L79 26L84 30" stroke="rgba(255,255,255,0.32)" strokeWidth={1.7} fill="none" />
            )}
          </G>
        )}

        {hair === 'rocker_long' && (
          <G>
            {/* Dramatic swept-back front hairline with high crown tuft */}
            <Path
              d="M43 52C42 35 49 23 62 21L67 14L72 20L77 15L80 22C92 25 98 35 97 52L93 47C92 37 83 32 70 32C57 32 48 37 47 47Z"
              fill={hairCol}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth={1.35}
              strokeLinejoin="round"
            />
            {!fullCoverHat && (
              <Path d="M54 27C62 23 78 23 86 27" stroke="rgba(255,255,255,0.28)" strokeWidth={2.2} strokeLinecap="round" fill="none" />
            )}
          </G>
        )}

        {hair === 'dreads_band' && (
          <G>
            {/* Textured dread hairline + vibrant sporty headband */}
            <Path
              d="M43 50C44 33 54 24 70 24C86 24 96 33 97 50C92 40 83 37 70 37C57 37 48 40 43 50Z"
              fill={hairCol}
            />
            {!fullCoverHat && (
              <Path
                d="M44 42C51 28 89 28 96 42"
                stroke={outfitCol}
                strokeWidth={5.5}
                strokeLinecap="round"
                fill="none"
              />
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
