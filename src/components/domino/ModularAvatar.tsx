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
  /** Render the collectible frame outer ring (great in Home, Studio & Profile) */
  showFrameRing?: boolean;
}

/**
 * Expressive 2D Paper-Doll SVG Bust Avatar (100% Expo Go compatible, unique gradient IDs).
 * Designed with warm 3D lighting, inclusive hairstyles/features for women, men, and diverse personalities,
 * and crisp readability from 36px table badges up to 140px studio previews.
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

  const bgId = `abg_${uid}`;
  const rimId = `arm_${uid}`;
  const skinId = `ask_${uid}`;
  const clipId = `acl_${uid}`;
  const goldId = `agld_${uid}`;
  const lensId = `alns_${uid}`;

  const hair = config.hair;
  const hairCol = config.hairColor;
  const outfit = config.outfit;
  const outfitCol = config.outfitColor;
  const hat = config.hat;
  const fullCoverHat =
    hat === 'cap' ||
    hat === 'beanie' ||
    hat === 'bandana' ||
    hat === 'chef' ||
    hat === 'captain' ||
    hat === 'panama' ||
    hat === 'vueltiao';

  // Soft brow color slightly darker or matching hair
  const browColor = hair === 'bald' ? '#2A221E' : hairCol;

  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <Defs>
        <LinearGradient id={bgId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={frame.bgTop} />
          <Stop offset="1" stopColor={frame.bgBottom} />
        </LinearGradient>
        <RadialGradient id={rimId} cx="50%" cy="44%" r="48%">
          <Stop offset="0" stopColor="#E0F2FE" stopOpacity={0.34} />
          <Stop offset="0.58" stopColor={frame.ringColor} stopOpacity={0.14} />
          <Stop offset="1" stopColor={frame.bgBottom} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={skinId} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={skin.light} />
          <Stop offset="0.58" stopColor={skin.base} />
          <Stop offset="1" stopColor={skin.shadow} />
        </LinearGradient>
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
          <Circle cx={64} cy={64} r={showFrameRing ? 58 : 63} />
        </ClipPath>
      </Defs>

      {/* Outer backdrop */}
      <Circle cx={64} cy={64} r={showFrameRing ? 58 : 63} fill={`url(#${bgId})`} />

      <G clipPath={`url(#${clipId})`}>
        {/* Studio radial rim-light behind silhouette so dark hair pops crisply even at 40px */}
        <Circle cx={64} cy={56} r={54} fill={`url(#${rimId})`} />

        {/* Sparkles for premium frames */}
        {frame.hasSparkles && (
          <G opacity={0.78}>
            <Path d="M22 28L23.6 32L27.6 33.6L23.6 35.2L22 39.2L20.4 35.2L16.4 33.6L20.4 32Z" fill="#FEF08A" />
            <Path d="M106 32L107.2 35L110.2 36.2L107.2 37.4L106 40.4L104.8 37.4L101.8 36.2L104.8 35Z" fill="#7DD3FC" />
            <Circle cx={28} cy={88} r={2} fill="#FDE68A" opacity={0.7} />
            <Circle cx={102} cy={78} r={1.8} fill="#FFFFFF" opacity={0.65} />
          </G>
        )}

        {/* ===== LAYER 1: BACK HAIR (behind neck & shoulders) ===== */}
        {hair === 'waves' && (
          <G>
            <Path
              d="M32 52C26 68 25 88 29 116H99C103 88 102 68 96 52C91 34 79 25 64 25C49 25 37 34 32 52Z"
              fill={hairCol}
            />
            <Path
              d="M32 76C36 82 34 94 38 108M96 76C92 82 94 94 90 108"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {hair === 'bob' && (
          <Path
            d="M33 54C30 68 31 82 38 89L90 89C97 82 98 68 95 54C91 35 79 26 64 26C49 26 37 35 33 54Z"
            fill={hairCol}
          />
        )}

        {hair === 'ponytail' && (
          <G>
            <Path
              d="M78 26C95 24 108 38 105 64C103 77 96 86 90 91C89 76 92 61 88 47C85 38 80 34 74 33Z"
              fill={hairCol}
            />
            <Ellipse cx={80} cy={31} rx={5.5} ry={4} fill={`url(#${goldId})`} />
          </G>
        )}

        {hair === 'bun' && !fullCoverHat && (
          <G>
            <Circle cx={64} cy={22} r={14} fill={hairCol} />
            <Path
              d="M55 18C59 13 69 13 73 18"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Rect x={54} y={29} width={20} height={4} rx={2} fill={`url(#${goldId})`} />
          </G>
        )}

        {hair === 'afro' && (
          <G>
            <Circle cx={64} cy={47} r={35} fill={hairCol} />
            <Circle cx={38} cy={42} r={14} fill={hairCol} />
            <Circle cx={90} cy={42} r={14} fill={hairCol} />
            <Circle cx={48} cy={24} r={14} fill={hairCol} />
            <Circle cx={80} cy={24} r={14} fill={hairCol} />
            <Circle cx={36} cy={62} r={11} fill={hairCol} />
            <Circle cx={92} cy={62} r={11} fill={hairCol} />
          </G>
        )}

        {hair === 'braids' && (
          <G>
            <Path
              d="M36 52C34 62 32 72 34 82C32 90 33 102 35 114H44C43 102 44 90 43 80C44 70 43 60 44 52Z"
              fill={hairCol}
            />
            <Path
              d="M92 52C94 62 96 72 94 82C96 90 95 102 93 114H84C85 102 84 90 85 80C84 70 85 60 84 52Z"
              fill={hairCol}
            />
            {/* Golden braid beads */}
            <Circle cx={38} cy={86} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={39} cy={100} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={90} cy={86} r={2.8} fill={`url(#${goldId})`} />
            <Circle cx={89} cy={100} r={2.8} fill={`url(#${goldId})`} />
          </G>
        )}

        {/* ===== LAYER 2: SHOULDERS & OUTFIT ===== */}
        {outfit === 'guayabera' && (
          <G>
            <Path d="M20 126C24 96 40 87 64 87C88 87 104 96 108 126Z" fill={outfitCol} />
            <Path d="M51 87.5L64 106L77 87.5Z" fill="#FFFDF9" opacity={0.94} />
            <Path d="M47 92V124M51 94V124M81 92V124M77 94V124" stroke="rgba(255,255,255,0.28)" strokeWidth={1.6} />
            <Circle cx={64} cy={112} r={2} fill="#FFFDF9" />
            <Circle cx={64} cy={120} r={2} fill="#FFFDF9" />
          </G>
        )}

        {outfit === 'blouse' && (
          <G>
            <Path d="M22 126C26 97 41 88 64 88C87 88 102 97 106 126Z" fill={outfitCol} />
            {/* Graceful scoop neckline */}
            <Path d="M46 88C51 102 77 102 82 88Z" fill={`url(#${skinId})`} />
            {/* Delicate gold necklace & pearl pendant */}
            <Path
              d="M49 91C55 101 73 101 79 91"
              stroke={`url(#${goldId})`}
              strokeWidth={1.8}
              fill="none"
            />
            <Circle cx={64} cy={100.5} r={3} fill="#FFFBEB" stroke="#D97706" strokeWidth={0.9} />
          </G>
        )}

        {outfit === 'tee' && (
          <G>
            <Path d="M20 126C24 97 40 88 64 88C88 88 104 97 108 126Z" fill={outfitCol} />
            <Path
              d="M50 88C54 96 74 96 78 88"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={3}
              fill="none"
            />
          </G>
        )}

        {outfit === 'jacket' && (
          <G>
            <Path d="M18 126C23 95 39 86 64 86C89 86 105 95 109 126Z" fill="#181F2C" />
            {/* Inner accent shirt */}
            <Path d="M52 88L64 114L76 88Z" fill={outfitCol} />
            {/* Moto jacket lapels */}
            <Path d="M44 88L58 106L47 109L38 95Z" fill="#2A3446" />
            <Path d="M84 88L70 106L81 109L90 95Z" fill="#2A3446" />
            <Path d="M77 95L75 124" stroke="#CBD5E1" strokeWidth={1.8} strokeDasharray="2 2" />
          </G>
        )}

        {outfit === 'blazer' && (
          <G>
            <Path d="M18 126C23 95 39 86 64 86C89 86 105 95 109 126Z" fill="#172542" />
            <Path d="M52 88L64 115L76 88Z" fill="#F8FAFC" />
            <Path d="M45 87L62 114L50 116L40 94Z" fill="#243B64" />
            <Path d="M83 87L66 114L78 116L88 94Z" fill="#243B64" />
            {/* Pocket square */}
            <Path d="M79 111L89 107L90 113H79Z" fill={outfitCol} />
          </G>
        )}

        {outfit === 'hawaiian' && (
          <G>
            <Path d="M20 126C24 96 40 87 64 87C88 87 104 96 108 126Z" fill={outfitCol} />
            <Path d="M51 87L64 103L77 87Z" fill={`url(#${skinId})`} />
            {/* Tropical golden palm accents */}
            <Path d="M36 108C41 103 46 105 49 111M42 105C40 112 37 116 33 119" stroke="#FDE68A" strokeWidth={2} strokeLinecap="round" opacity={0.75} fill="none" />
            <Path d="M90 105C85 101 80 103 77 109M84 103C86 110 89 114 93 117" stroke="#FDE68A" strokeWidth={2} strokeLinecap="round" opacity={0.75} fill="none" />
            <Circle cx={44} cy={118} r={2.5} fill="#FFFBEB" opacity={0.65} />
            <Circle cx={82} cy={118} r={2.5} fill="#FFFBEB" opacity={0.65} />
          </G>
        )}

        {outfit === 'collar_gold' && (
          <G>
            <Path d="M19 126C24 96 39 87 64 87C89 87 104 96 109 126Z" fill="#131B2E" />
            <Path d="M50 87C55 98 73 98 78 87Z" fill={`url(#${skinId})`} />
            {/* Bold Cuban gold link chain */}
            <Path
              d="M44 92C51 110 77 110 84 92"
              stroke={`url(#${goldId})`}
              strokeWidth={5.2}
              strokeLinecap="round"
              strokeDasharray="4 2.5"
              fill="none"
            />
            <Path
              d="M44 92C51 110 77 110 84 92"
              stroke="#FEF9C3"
              strokeWidth={1.2}
              opacity={0.7}
              fill="none"
            />
          </G>
        )}

        {outfit === 'royal_tux' && (
          <G>
            <Path d="M18 126C23 95 39 86 64 86C89 86 105 95 109 126Z" fill="#0F172A" />
            <Path d="M52 87L64 116L76 87Z" fill="#FFFFFF" />
            <Path d="M44 87L63 115L53 118L39 95Z" fill={`url(#${goldId})`} />
            <Path d="M84 87L65 115L75 118L89 95Z" fill={`url(#${goldId})`} />
            {/* Golden bowtie / gala brooch */}
            <Path d="M56 94L64 98L72 94V102L64 98L56 102Z" fill={`url(#${goldId})`} />
            <Circle cx={64} cy={98} r={2.6} fill="#FFFBEB" />
          </G>
        )}

        {/* ===== LAYER 3: NECK, EARS & HEAD ===== */}
        <Rect x={55} y={76} width={18} height={17} rx={7} fill={skin.shadow} />
        <Ellipse cx={64} cy={83} rx={9} ry={4.5} fill="rgba(0,0,0,0.12)" />

        {/* Ears */}
        <Circle cx={38} cy={62} r={6.2} fill={skin.base} />
        <Circle cx={90} cy={62} r={6.2} fill={skin.base} />
        <Circle cx={38.5} cy={62.5} r={2.8} fill={skin.shadow} opacity={0.55} />
        <Circle cx={89.5} cy={62.5} r={2.8} fill={skin.shadow} opacity={0.55} />

        {/* Head */}
        <Ellipse cx={64} cy={58} rx={26} ry={28.5} fill={`url(#${skinId})`} />

        {/* Subtle nose */}
        <Path
          d="M64 56L62.2 64.5C62.8 66 65.2 66 66 64.8"
          stroke={skin.shadow}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />

        {/* ===== LAYER 4: FACIAL ACCENTS, EARRINGS & BEARDS ===== */}
        {(config.facial === 'blush' || config.facial === 'hoops') && (
          <G>
            <Ellipse cx={47} cy={66} rx={5.5} ry={3.2} fill={skin.blush} opacity={0.34} />
            <Ellipse cx={81} cy={66} rx={5.5} ry={3.2} fill={skin.blush} opacity={0.34} />
          </G>
        )}

        {config.facial === 'blush' && (
          <G>
            {/* Pearl stud earrings */}
            <Circle cx={37.5} cy={67.5} r={2.6} fill="#FFFDF9" stroke="#E2E8F0" strokeWidth={0.8} />
            <Circle cx={90.5} cy={67.5} r={2.6} fill="#FFFDF9" stroke="#E2E8F0" strokeWidth={0.8} />
          </G>
        )}

        {config.facial === 'hoops' && (
          <G>
            {/* Golden hoop earrings */}
            <Circle cx={36.5} cy={71.5} r={5.2} stroke={`url(#${goldId})`} strokeWidth={2.2} fill="none" />
            <Circle cx={91.5} cy={71.5} r={5.2} stroke={`url(#${goldId})`} strokeWidth={2.2} fill="none" />
          </G>
        )}

        {config.facial === 'stubble' && (
          <Path
            d="M41 64C42 78 51 86 64 86C77 86 86 78 87 64C84 72 75 78 64 78C53 78 44 72 41 64Z"
            fill={hairCol}
            opacity={0.24}
          />
        )}

        {config.facial === 'beard' && (
          <G>
            <Path
              d="M39 61C39 78 49 89 64 89C79 89 89 78 89 61C85 69 78 73 73 72C70 69 58 69 55 72C50 73 43 69 39 61Z"
              fill={hairCol}
            />
            <Path
              d="M54 71C58 68 70 68 74 71C72 74 56 74 54 71Z"
              fill={hairCol}
            />
          </G>
        )}

        {config.facial === 'mustache' && (
          <Path
            d="M50 71C53 66 61 67 64 70C67 67 75 66 78 71C74 73 68 72 64 71C60 72 54 73 50 71Z"
            fill={hairCol}
          />
        )}

        {config.facial === 'goatee' && (
          <G>
            <Path
              d="M54 71C58 67.5 70 67.5 74 71C72 73.5 56 73.5 54 71Z"
              fill={hairCol}
            />
            <Path
              d="M55 76C56 84 60 88 64 88C68 88 72 84 73 76C69 79 59 79 55 76Z"
              fill={hairCol}
            />
          </G>
        )}

        {config.facial === 'dali' && (
          <G>
            {/* Iconic curled Dalí / handlebar mustache */}
            <Path
              d="M64 70C59 66.5 52 67 48 70.5C44 73.5 39 71 39.5 66.5C40 64.5 42.5 64.5 42.5 66.5C42.5 68 44.8 68.5 47.2 66.8C51 64.2 59.5 64 64 68.5C68.5 64 77 64.2 80.8 66.8C83.2 68.5 85.5 68 85.5 66.5C85.5 64.5 88 64.5 88.5 66.5C89 71 84 73.5 80 70.5C76 67 69 66.5 64 70Z"
              fill={hairCol}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.7}
            />
          </G>
        )}

        {config.facial === 'pirate_beard' && (
          <G>
            {/* Sculpted Caribbean captain beard with twin braided ends & gold rings */}
            <Path
              d="M39 61C39 78 48 90 56 92L54 103H61L64 93L67 103H74L72 92C80 90 89 78 89 61C85 69 78 73 73 72C70 69 58 69 55 72C50 73 43 69 39 61Z"
              fill={hairCol}
            />
            <Rect x={54} y={96} width={7} height={3} rx={1.5} fill={`url(#${goldId})`} />
            <Rect x={67} y={96} width={7} height={3} rx={1.5} fill={`url(#${goldId})`} />
          </G>
        )}

        {/* ===== LAYER 5: MOUTH & MOOD ===== */}
        {mood === 'lose' || mood === 'pass' ? (
          <Path
            d="M56 75.5C59 72.5 69 72.5 72 75.5"
            stroke="#7C2D12"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
        ) : mood === 'win' || mood === 'double' ? (
          <G>
            <Path
              d="M53.5 72C57 79.5 71 79.5 74.5 72Z"
              fill="#FFFFFF"
              stroke="#7C2D12"
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          </G>
        ) : (
          <Path
            d="M55 72.5C58.8 76.8 69.2 76.8 73 72.5"
            stroke="#7C2D12"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ===== LAYER 6: EYES & EYEBROWS ===== */}
        {config.eyeStyle === 'lashes' ? (
          <G>
            {/* Graceful arched brows */}
            <Path d="M47 49.5C51 46.8 56 47.2 59 49" stroke={browColor} strokeWidth={2.1} strokeLinecap="round" fill="none" />
            <Path d="M69 49C72 47.2 77 46.8 81 49.5" stroke={browColor} strokeWidth={2.1} strokeLinecap="round" fill="none" />
            {/* Winged eyelashes */}
            <Path d="M48 56L45 53.8M50.5 54.5L48.5 52" stroke="#0F172A" strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M80 56L83 53.8M77.5 54.5L79.5 52" stroke="#0F172A" strokeWidth={1.6} strokeLinecap="round" />
            <Circle cx={54} cy={57} r={3.9} fill="#0F172A" />
            <Circle cx={74} cy={57} r={3.9} fill="#0F172A" />
            <Circle cx={55.3} cy={55.6} r={1.35} fill="#FFFFFF" />
            <Circle cx={75.3} cy={55.6} r={1.35} fill="#FFFFFF" />
            <Circle cx={52.6} cy={58.4} r={0.65} fill="#FFFFFF" opacity={0.75} />
            <Circle cx={72.6} cy={58.4} r={0.65} fill="#FFFFFF" opacity={0.75} />
          </G>
        ) : config.eyeStyle === 'fierce' ? (
          <G>
            <Path d="M47 49.5L59 52" stroke={browColor} strokeWidth={2.8} strokeLinecap="round" />
            <Path d="M81 49.5L69 52" stroke={browColor} strokeWidth={2.8} strokeLinecap="round" />
            <Circle cx={54} cy={57.5} r={3.6} fill="#0F172A" />
            <Circle cx={74} cy={57.5} r={3.6} fill="#0F172A" />
            <Circle cx={55.2} cy={56.2} r={1.2} fill="#FFFFFF" />
            <Circle cx={75.2} cy={56.2} r={1.2} fill="#FFFFFF" />
          </G>
        ) : config.eyeStyle === 'warm' ? (
          <G>
            <Path d="M47.5 49.5C51 47 56 47 59 49" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M69 49C72 47 77 47 80.5 49.5" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M49.5 58C51.5 54.2 56.5 54.2 58.5 58" stroke="#0F172A" strokeWidth={3} strokeLinecap="round" fill="none" />
            <Path d="M69.5 58C71.5 54.2 76.5 54.2 78.5 58" stroke="#0F172A" strokeWidth={3} strokeLinecap="round" fill="none" />
          </G>
        ) : config.eyeStyle === 'wink' ? (
          <G>
            {/* Playful cheeky wink */}
            <Path d="M47 48.5C51 45.8 56 46.5 59 49" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M69 50C72 48.5 77 48.8 81 51" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Circle cx={54} cy={57} r={3.7} fill="#0F172A" />
            <Circle cx={55.3} cy={55.7} r={1.3} fill="#FFFFFF" />
            <Path d="M69 57.5C72 54.2 76.5 54.2 79.5 57.5" stroke="#0F172A" strokeWidth={3} strokeLinecap="round" fill="none" />
          </G>
        ) : config.eyeStyle === 'skeptic' ? (
          <G>
            {/* Raised suspicious domino brow ("¿seguro que llevas?") */}
            <Path d="M47 51.5L59 51" stroke={browColor} strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M69 48.5C72.5 44.5 77.5 44.8 81.5 48.5" stroke={browColor} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Circle cx={55.2} cy={57.5} r={3.5} fill="#0F172A" />
            <Circle cx={75.2} cy={57} r={3.8} fill="#0F172A" />
            <Circle cx={56.3} cy={56.2} r={1.1} fill="#FFFFFF" />
            <Circle cx={76.4} cy={55.6} r={1.25} fill="#FFFFFF" />
          </G>
        ) : config.eyeStyle === 'hearts' ? (
          <G>
            <Path d="M47.5 49C51 46.5 56 46.5 59 48.8" stroke={browColor} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M69 48.8C72 46.5 77 46.5 80.5 49" stroke={browColor} strokeWidth={2.2} strokeLinecap="round" fill="none" />
            <Path d="M54 61.5C50 58.2 48.5 55.2 50.5 53.3C52 52 53.5 53.2 54 54.4C54.5 53.2 56 52 57.5 53.3C59.5 55.2 58 58.2 54 61.5Z" fill="#F43F5E" />
            <Path d="M74 61.5C70 58.2 68.5 55.2 70.5 53.3C72 52 73.5 53.2 74 54.4C74.5 53.2 76 52 77.5 53.3C79.5 55.2 78 58.2 74 61.5Z" fill="#F43F5E" />
          </G>
        ) : config.eyeStyle === 'star' ? (
          <G>
            <Path d="M47.5 49.5C51 47.2 56 47.2 59 49" stroke={browColor} strokeWidth={2.3} strokeLinecap="round" fill="none" />
            <Path d="M69 49C72 47.2 77 47.2 80.5 49.5" stroke={browColor} strokeWidth={2.3} strokeLinecap="round" fill="none" />
            <Circle cx={54} cy={57} r={4.2} fill="#0F172A" />
            <Circle cx={74} cy={57} r={4.2} fill="#0F172A" />
            <Path d="M54 53.5L54.9 56.1L57.5 57L54.9 57.9L54 60.5L53.1 57.9L50.5 57L53.1 56.1Z" fill="#FEF08A" />
            <Path d="M74 53.5L74.9 56.1L77.5 57L74.9 57.9L74 60.5L73.1 57.9L70.5 57L73.1 56.1Z" fill="#FEF08A" />
          </G>
        ) : (
          <G>
            <Path d="M47.5 50C51 48 56 48 59 49.8" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d="M69 49.8C72 48 77 48 80.5 50" stroke={browColor} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Circle cx={54} cy={57} r={3.6} fill="#0F172A" />
            <Circle cx={74} cy={57} r={3.6} fill="#0F172A" />
            <Circle cx={55.2} cy={55.8} r={1.25} fill="#FFFFFF" />
            <Circle cx={75.2} cy={55.8} r={1.25} fill="#FFFFFF" />
          </G>
        )}

        {/* ===== LAYER 7: FRONT HAIR ===== */}
        {hair === 'bald' && !fullCoverHat && (
          <Ellipse cx={54} cy={38} rx={7} ry={3.5} fill="#FFFFFF" opacity={0.22} />
        )}

        {hair === 'classic' && (
          <G>
            <Path
              d="M37 54C37 35 48 25 64 25C80 25 91 35 91 54C86 43 75 40 62 40C50 40 42 44 37 54Z"
              fill={hairCol}
            />
            {!fullCoverHat && (
              <Path
                d="M46 35C54 30 69 29 79 34"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={2.4}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>
        )}

        {hair === 'fade' && (
          <G>
            <Path
              d="M39 50C39 33 48 24 64 24C80 24 89 33 89 50C86 41 79 38 64 38C49 38 42 41 39 50Z"
              fill={hairCol}
            />
            {!fullCoverHat && (
              <Rect x={46} y={24} width={36} height={10} rx={5} fill={hairCol} />
            )}
          </G>
        )}

        {(hair === 'waves' || hair === 'bob') && (
          <G>
            <Path
              d="M36 56C36 35 48 25 64 25C80 25 92 35 92 56C85 43 74 39 66 39C56 39 46 45 36 56Z"
              fill={hairCol}
            />
            {/* Soft side-swept bangs */}
            <Path
              d="M44 38C54 44 69 44 79 37"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {(hair === 'ponytail' || hair === 'bun') && (
          <Path
            d="M37 54C37 35 48 26 64 26C80 26 91 35 91 54C86 42 76 38 64 38C52 38 42 42 37 54Z"
            fill={hairCol}
          />
        )}

        {hair === 'curls' && (
          <G>
            <Circle cx={44} cy={40} r={9.5} fill={hairCol} />
            <Circle cx={55} cy={33} r={10.5} fill={hairCol} />
            <Circle cx={68} cy={32} r={11} fill={hairCol} />
            <Circle cx={80} cy={37} r={10} fill={hairCol} />
            <Circle cx={88} cy={47} r={7.5} fill={hairCol} />
            <Circle cx={40} cy={48} r={7.5} fill={hairCol} />
          </G>
        )}

        {hair === 'afro' && (
          <Path
            d="M38 52C42 40 52 36 64 36C76 36 86 40 90 52C85 45 76 42 64 42C52 42 43 45 38 52Z"
            fill={hairCol}
          />
        )}

        {hair === 'braids' && (
          <G>
            <Path
              d="M37 54C37 35 48 26 64 26C80 26 91 35 91 54C86 42 75 39 64 39C53 39 42 42 37 54Z"
              fill={hairCol}
            />
            <Path d="M64 27V39" stroke={skin.base} strokeWidth={1.6} opacity={0.75} />
          </G>
        )}

        {hair === 'pompadour' && (
          <G>
            <Path
              d="M37 53C36 34 45 20 66 19C85 18 93 31 91 53C87 42 78 39 64 39C49 39 42 43 37 53Z"
              fill={hairCol}
            />
            {!fullCoverHat && (
              <Path
                d="M46 28C56 22 72 22 81 28"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={2.6}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </G>
        )}

        {/* ===== LAYER 8: GLASSES ===== */}
        {config.glasses === 'round' && (
          <G>
            <Circle cx={53} cy={57} r={9} stroke="#F5C451" strokeWidth={2.2} fill="rgba(255,255,255,0.1)" />
            <Circle cx={75} cy={57} r={9} stroke="#F5C451" strokeWidth={2.2} fill="rgba(255,255,255,0.1)" />
            <Path d="M62 57H66M39 56L44 56.5M84 56.5L89 56" stroke="#F5C451" strokeWidth={2} />
          </G>
        )}

        {config.glasses === 'cat_eye' && (
          <G>
            <Path
              d="M41 52L61 54C61 62 56 65 50 64C45 63 42 58 41 52Z"
              fill="rgba(244,63,94,0.18)"
              stroke="#E11D48"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <Path
              d="M87 52L67 54C67 62 72 65 78 64C83 63 86 58 87 52Z"
              fill="rgba(244,63,94,0.18)"
              stroke="#E11D48"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <Path d="M61 55.5H67" stroke="#F5C451" strokeWidth={2.2} />
            <Circle cx={42.5} cy={53} r={1.2} fill="#FEF08A" />
            <Circle cx={85.5} cy={53} r={1.2} fill="#FEF08A" />
          </G>
        )}

        {config.glasses === 'aviator' && (
          <G>
            <Path
              d="M43 52H61C61 62 56 66 50 65C45 64 43 59 43 52Z"
              fill={`url(#${lensId})`}
              stroke={`url(#${goldId})`}
              strokeWidth={2.2}
            />
            <Path
              d="M67 52H85C85 59 83 64 78 65C72 66 67 62 67 52Z"
              fill={`url(#${lensId})`}
              stroke={`url(#${goldId})`}
              strokeWidth={2.2}
            />
            <Path d="M60 52.5H68M61 55H67" stroke={`url(#${goldId})`} strokeWidth={1.8} />
            <Path d="M46 54.5L51 61M70 54.5L75 61" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.45} strokeLinecap="round" />
          </G>
        )}

        {config.glasses === 'wayfarer' && (
          <G>
            <Rect x={42} y={51} width={19} height={13} rx={3.5} fill="#0B1322" stroke="#334155" strokeWidth={1.8} />
            <Rect x={67} y={51} width={19} height={13} rx={3.5} fill="#0B1322" stroke="#334155" strokeWidth={1.8} />
            <Path d="M61 54.5H67M39 54L42 54.5M86 54.5L89 54" stroke="#0B1322" strokeWidth={2.6} />
            <Path d="M45 53.5L51 61M70 53.5L76 61" stroke="#FFFFFF" strokeWidth={1.8} opacity={0.35} strokeLinecap="round" />
          </G>
        )}

        {config.glasses === 'gold_visor' && (
          <G>
            <Path
              d="M40 50.5H88L85 63.5C82 65 73 65 69 62L64 59L59 62C55 65 46 65 43 63.5Z"
              fill={`url(#${goldId})`}
              opacity={0.9}
              stroke="#FEF08A"
              strokeWidth={1.8}
            />
            <Path d="M46 53L56 61M69 53L79 61" stroke="#FFFFFF" strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />
          </G>
        )}

        {config.glasses === 'hearts_shades' && (
          <G>
            <Path
              d="M52 65C45 60 42 55 45 51.5C47.5 49 50.8 50.8 52 53C53.2 50.8 56.5 49 59 51.5C62 55 59 60 52 65Z"
              fill="rgba(244, 63, 94, 0.82)"
              stroke="#FFF1F2"
              strokeWidth={1.8}
            />
            <Path
              d="M76 65C69 60 66 55 69 51.5C71.5 49 74.8 50.8 76 53C77.2 50.8 80.5 49 83 51.5C86 55 83 60 76 65Z"
              fill="rgba(244, 63, 94, 0.82)"
              stroke="#FFF1F2"
              strokeWidth={1.8}
            />
            <Path d="M60 55H68" stroke="#FFF1F2" strokeWidth={2} />
          </G>
        )}

        {config.glasses === 'pixel_boss' && (
          <G>
            {/* 8-bit Deal-With-It pixel shades */}
            <Rect x={39} y={51} width={50} height={4} fill="#090D16" />
            <Rect x={42} y={55} width={19} height={6} fill="#090D16" />
            <Rect x={45} y={61} width={13} height={3} fill="#090D16" />
            <Rect x={67} y={55} width={19} height={6} fill="#090D16" />
            <Rect x={70} y={61} width={13} height={3} fill="#090D16" />
            {/* Iconic white pixel glints */}
            <Rect x={45} y={55} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={48.5} y={58} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={70} y={55} width={3.5} height={3} fill="#FFFFFF" />
            <Rect x={73.5} y={58} width={3.5} height={3} fill="#FFFFFF" />
          </G>
        )}

        {config.glasses === 'star_party' && (
          <G>
            <Path
              d="M52 47L55 53.5L62 54.5L57 59L58.2 66L52 62.5L45.8 66L47 59L42 54.5L49 53.5Z"
              fill="rgba(232, 121, 249, 0.78)"
              stroke="#FEF08A"
              strokeWidth={1.9}
              strokeLinejoin="round"
            />
            <Path
              d="M76 47L79 53.5L86 54.5L81 59L82.2 66L76 62.5L69.8 66L71 59L66 54.5L73 53.5Z"
              fill="rgba(232, 121, 249, 0.78)"
              stroke="#FEF08A"
              strokeWidth={1.9}
              strokeLinejoin="round"
            />
            <Path d="M60.5 56H67.5" stroke="#FEF08A" strokeWidth={2.2} />
          </G>
        )}

        {config.glasses === 'monocle' && (
          <G>
            <Circle
              cx={75}
              cy={57}
              r={9.5}
              fill="rgba(224, 242, 254, 0.2)"
              stroke={`url(#${goldId})`}
              strokeWidth={2.4}
            />
            <Path
              d="M71 52.5L75 56.5"
              stroke="#FFFFFF"
              strokeWidth={1.6}
              opacity={0.55}
              strokeLinecap="round"
            />
            {/* Delicate dangling gold chain */}
            <Path
              d="M84.5 58C87.5 67 86 78 82 90"
              stroke={`url(#${goldId})`}
              strokeWidth={1.4}
              strokeDasharray="2 2"
              fill="none"
            />
          </G>
        )}

        {/* ===== LAYER 9: HATS & HEADPIECES ===== */}
        {hat === 'headband' && (
          <G>
            <Path
              d="M38 45C44 27 84 27 90 45"
              stroke={`url(#${goldId})`}
              strokeWidth={3.2}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={50} cy={33.5} r={2.4} fill="#FFFDF9" />
            <Circle cx={57} cy={31.2} r={2.6} fill="#FFFDF9" />
            <Circle cx={64} cy={30.5} r={2.8} fill="#FFFDF9" />
            <Circle cx={71} cy={31.2} r={2.6} fill="#FFFDF9" />
            <Circle cx={78} cy={33.5} r={2.4} fill="#FFFDF9" />
          </G>
        )}

        {hat === 'cap' && (
          <G>
            <Path d="M36 44C36 26 48 18 64 18C80 18 92 26 92 44Z" fill={outfitCol} />
            <Path d="M33 43C48 38 80 38 99 45C95 49 78 48 64 47C48 47 36 47 33 43Z" fill="#0F172A" />
            <Circle cx={64} cy={31} r={4.2} fill={`url(#${goldId})`} />
          </G>
        )}

        {hat === 'beanie' && (
          <G>
            <Path d="M36 44C36 24 48 16 64 16C80 16 92 24 92 44Z" fill={outfitCol} />
            <Rect x={35} y={36} width={58} height={11} rx={5.5} fill="#0F172A" opacity={0.35} />
            <Rect x={35} y={36} width={58} height={10} rx={5} fill={outfitCol} stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} />
            <Path d="M46 37V45M55 37V45M64 37V45M73 37V45M82 37V45" stroke="rgba(0,0,0,0.22)" strokeWidth={1.6} />
          </G>
        )}

        {hat === 'beret' && (
          <G>
            <Path d="M34 40C32 24 54 16 74 19C90 21 97 30 92 41C79 36 52 36 34 40Z" fill="#991B1B" />
            <Path d="M62 18L65 13" stroke="#7F1D1D" strokeWidth={2.6} strokeLinecap="round" />
            <Path d="M44 26C56 22 72 22 82 26" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" fill="none" />
          </G>
        )}

        {hat === 'panama' && (
          <G>
            {/* Cream woven Panama crown */}
            <Path d="M42 40L47 21C52 17 76 17 81 21L86 40Z" fill="#F6ECD5" />
            {/* Dark silk band */}
            <Path d="M43 34H85L86 39H42Z" fill="#1E293B" />
            {/* Curved wide brim */}
            <Ellipse cx={64} cy={40} rx={36} ry={6.8} fill="#EFE1C0" stroke="#C8B288" strokeWidth={1.3} />
          </G>
        )}

        {hat === 'vueltiao' && (
          <G>
            {/* Iconic Caribbean woven crown */}
            <Path d="M41 40L47 20C53 16 75 16 81 20L87 40Z" fill="#F5ECD7" />
            {/* Geometric black-and-cream woven band */}
            <Path d="M43 32H85L86.5 39H41.5Z" fill="#111827" />
            <Path
              d="M46 35.5L51 33L56 35.5L61 33L66 35.5L71 33L76 35.5L81 33"
              stroke="#F5ECD7"
              strokeWidth={1.8}
              fill="none"
            />
            <Ellipse cx={64} cy={40} rx={37} ry={6.8} fill="#F5ECD7" stroke="#111827" strokeWidth={2.2} />
          </G>
        )}

        {hat === 'crown' && (
          <G>
            <Path
              d="M43 36L40 16L54 25L64 11L74 25L88 16L85 36Z"
              fill={`url(#${goldId})`}
              stroke="#FEF08A"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <Rect x={43} y={33} width={42} height={5} rx={2.5} fill="#B45309" />
            <Circle cx={64} cy={27} r={3.2} fill="#10B981" stroke="#FEF08A" strokeWidth={1} />
            <Circle cx={51} cy={29} r={2.2} fill="#F43F5E" />
            <Circle cx={77} cy={29} r={2.2} fill="#38BDF8" />
          </G>
        )}

        {hat === 'hibiscus' && (
          <G>
            {/* Lush tropical hibiscus flower + emerald leaves tucked at temple */}
            <Ellipse cx={84} cy={41} rx={7} ry={3.5} fill="#10B981" transform="rotate(-24 84 41)" />
            <Ellipse cx={93} cy={48} rx={6.5} ry={3.2} fill="#059669" transform="rotate(28 93 48)" />
            <Circle cx={88} cy={40} r={5.4} fill="#FB7185" />
            <Circle cx={94} cy={44} r={5.4} fill="#F43F5E" />
            <Circle cx={91} cy={50} r={5.2} fill="#FB7185" />
            <Circle cx={84} cy={49} r={5.2} fill="#F43F5E" />
            <Circle cx={82.5} cy={43.5} r={5.2} fill="#FDA4AF" />
            <Circle cx={88} cy={45.5} r={3.2} fill="#FEF08A" />
          </G>
        )}

        {hat === 'bandana' && (
          <G>
            {/* Knotted Caribbean pirate/street bandana */}
            <Path
              d="M36 45C37 26 49 18 64 18C79 18 91 26 92 45C80 39 48 39 36 45Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth={1.4}
            />
            <Path d="M41 37C54 33 74 33 87 37" stroke="#FEF08A" strokeWidth={2.2} strokeDasharray="4 4" fill="none" />
            {/* Side knot tails */}
            <Path d="M89 39L100 35L97 44Z" fill="#B91C1C" />
            <Path d="M90 42L101 47L94 50Z" fill="#DC2626" />
          </G>
        )}

        {hat === 'dj_phones' && (
          <G>
            {/* Over-ear neon cyan DJ headphones */}
            <Path
              d="M34 56C34 25 46 16 64 16C82 16 94 25 94 56"
              stroke="#1E293B"
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M37 46C40 26 50 18 64 18C78 18 88 26 91 46"
              stroke="#38BDF8"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Rect x={29} y={50} width={10} height={22} rx={5} fill="#0F172A" stroke="#38BDF8" strokeWidth={2} />
            <Rect x={89} y={50} width={10} height={22} rx={5} fill="#0F172A" stroke="#38BDF8" strokeWidth={2} />
          </G>
        )}

        {hat === 'chef' && (
          <G>
            {/* Classic puffy white chef toque ("Cocinando la tranca") */}
            <Circle cx={48} cy={22} r={11} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} />
            <Circle cx={64} cy={17} r={13} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} />
            <Circle cx={80} cy={22} r={11} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.2} />
            <Rect x={42} y={26} width={44} height={15} rx={4} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
            <Path d="M43 36H85" stroke="#E2E8F0" strokeWidth={2} />
          </G>
        )}

        {hat === 'captain' && (
          <G>
            {/* White Caribbean yacht captain cap with gold anchor & navy visor */}
            <Path
              d="M36 33C42 18 86 18 92 33L86 41H42Z"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth={1.3}
            />
            <Rect x={41} y={34} width={46} height={7} rx={2} fill="#0F172A" />
            <Path d="M42 36H86" stroke={`url(#${goldId})`} strokeWidth={1.6} />
            <Path d="M35 41C48 37 80 37 93 41C85 47 43 47 35 41Z" fill="#0F172A" />
            {/* Gold emblem */}
            <Circle cx={64} cy={27.5} r={4.2} fill={`url(#${goldId})`} />
            <Circle cx={64} cy={27.5} r={1.8} fill="#0F172A" />
          </G>
        )}
      </G>

      {/* Outer collectible frame ring */}
      {showFrameRing && (
        <>
          <Circle
            cx={64}
            cy={64}
            r={60}
            stroke={frame.ringColor}
            strokeWidth={4.2}
            fill="none"
          />
          <Circle
            cx={64}
            cy={64}
            r={56.2}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1}
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}
