import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { getTileStyle, TileStyleId } from '@/constants/tileStyles';
import { CLUB, EBONY_PIP_COLORS, PIP_COLORS } from '@/constants/tokens';

interface DominoTileProps {
  a: number;
  b: number;
  orientation?: 'vertical' | 'horizontal';
  /** Short-side unit in pixels (long side is 2x unit) */
  unit?: number;
  selected?: boolean;
  playable?: boolean;
  /** Sculpted matte obsidian ebony variant for unplayable tiles */
  ebony?: boolean;
  highlighted?: boolean;
  ghost?: boolean;
  ghostActive?: boolean;
  tileStyleId?: TileStyleId;
  onPress?: () => void;
}

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[1, 1]],
  2: [
    [0, 2],
    [2, 0],
  ],
  3: [
    [0, 2],
    [1, 1],
    [2, 0],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

function PipFace({
  value,
  size,
  ebony = false,
  ghost = false,
  pipColors = PIP_COLORS,
  isDarkFace = false,
}: {
  value: number;
  size: number;
  ebony?: boolean;
  ghost?: boolean;
  pipColors?: Record<number, string>;
  isDarkFace?: boolean;
}) {
  const pips = PIP_LAYOUTS[value] ?? [];
  const pipSize = Math.max(4, Math.round(size * 0.23));
  const color = ghost
    ? '#0B1622'
    : ebony
    ? EBONY_PIP_COLORS[value] ?? '#F1F5F9'
    : pipColors[value] ?? '#111827';
  const pad = Math.max(2.5, Math.round(size * 0.17));
  const inner = size - pad * 2;
  const step = inner / 2;
  const showDepth = !ghost && pipSize >= 5.5;
  const glintSize = Math.max(1.5, Math.round(pipSize * 0.28));

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {pips.map(([row, col], idx) => (
        <View
          key={idx}
          style={{
            position: 'absolute',
            width: pipSize,
            height: pipSize,
            borderRadius: pipSize / 2,
            backgroundColor: color,
            opacity: ghost ? 0.62 : 1,
            top: pad + row * step - pipSize / 2,
            left: pad + col * step - pipSize / 2,
            overflow: 'hidden',
            borderTopWidth: showDepth ? 1 : 0,
            borderTopColor: ebony || isDarkFace ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.42)',
            borderBottomWidth: showDepth ? 0.8 : 0,
            borderBottomColor: ebony || isDarkFace ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.65)',
          }}
        >
          {/* Concave drilled-enamel specular glint at bottom-right of each pip */}
          {showDepth && !ebony && !isDarkFace && (
            <View
              style={{
                position: 'absolute',
                width: glintSize,
                height: glintSize,
                borderRadius: glintSize / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.42)',
                right: Math.max(1, Math.round(pipSize * 0.16)),
                bottom: Math.max(1, Math.round(pipSize * 0.14)),
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

export function DominoTile({
  a,
  b,
  orientation = 'vertical',
  unit = 38,
  selected = false,
  playable = false,
  ebony = false,
  highlighted = false,
  ghost = false,
  ghostActive = false,
  tileStyleId = 'marfil',
  onPress,
}: DominoTileProps) {
  const tileStyle = getTileStyle(tileStyleId);
  const isHorizontal = orientation === 'horizontal';
  const width = isHorizontal ? unit * 2 : unit;
  const height = isHorizontal ? unit : unit * 2;
  const faceSize = unit - 4;
  const radius = Math.max(6, Math.round(unit * 0.21));
  const pinSize = Math.max(4.5, Math.round(unit * 0.15));
  const bottomLip = unit >= 30 ? 4.5 : 3;

  if (ghost) {
    return (
      <View
        style={[
          styles.ghostTile,
          {
            width,
            height,
            flexDirection: isHorizontal ? 'row' : 'column',
            borderRadius: radius,
          },
          ghostActive && styles.ghostTileActive,
        ]}
      >
        <View style={styles.half}>
          <PipFace value={a} size={faceSize} ghost />
        </View>
        <View
          style={[
            styles.ghostDivider,
            isHorizontal
              ? { width: 1.5, height: faceSize * 0.65 }
              : { height: 1.5, width: faceSize * 0.65 },
          ]}
        />
        <View style={styles.half}>
          <PipFace value={b} size={faceSize} ghost />
        </View>
      </View>
    );
  }

  const gradColors: [string, string, string] = ebony
    ? ['#223043', '#172231', '#0F1724']
    : tileStyle.faceGradient;

  const tileBody = (
    <LinearGradient
      colors={gradColors}
      locations={[0, 0.52, 1]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={[
        styles.tile,
        {
          width,
          height,
          flexDirection: isHorizontal ? 'row' : 'column',
          borderRadius: radius,
          borderBottomWidth: bottomLip,
          borderColor: tileStyle.borderColor,
          borderBottomColor: tileStyle.bottomLipColor,
        },
        ebony && styles.tileEbony,
        ebony && tileStyle.isDarkFace && { opacity: 0.52 },
        playable &&
          !selected && [
            styles.tilePlayable,
            {
              borderColor: tileStyle.playableBorderColor,
              borderBottomColor: tileStyle.playableLipColor,
            },
          ],
        selected && styles.tileSelected,
        highlighted && styles.tileHighlighted,
      ]}
    >
      {/* Porcelain top-edge specular bevel highlight */}
      {!ebony && (
        <View
          pointerEvents="none"
          style={[
            styles.ivorySpecular,
            {
              borderRadius: Math.max(4, radius - 1.5),
              borderTopColor: tileStyle.specularColor,
            },
          ]}
        />
      )}

      <View style={styles.half}>
        <PipFace
          value={a}
          size={faceSize}
          ebony={ebony}
          pipColors={tileStyle.pipColors}
          isDarkFace={tileStyle.isDarkFace}
        />
      </View>

      {/* Debossed center groove (dark engraved groove + subtle light bottom edge) */}
      <View
        style={[
          styles.dividerWrap,
          isHorizontal
            ? { width: 2.5, height: faceSize * 0.74 }
            : { height: 2.5, width: faceSize * 0.74 },
        ]}
      >
        <View
          style={[
            styles.dividerLine,
            isHorizontal ? styles.dividerVertical : styles.dividerHorizontal,
            !ebony && {
              backgroundColor: tileStyle.dividerColor,
              borderBottomColor: isHorizontal ? 'transparent' : tileStyle.dividerHighlight,
              borderRightColor: isHorizontal ? tileStyle.dividerHighlight : 'transparent',
            },
            ebony && {
              backgroundColor: 'rgba(148, 163, 184, 0.25)',
              borderBottomColor: 'transparent',
              borderRightColor: 'transparent',
            },
          ]}
        />
        {/* Authentic polished metallic spinner pin */}
        {!ebony && (
          <LinearGradient
            colors={tileStyle.spinnerGradient}
            start={{ x: 0.2, y: 0.1 }}
            end={{ x: 0.9, y: 0.95 }}
            style={[
              styles.brassPin,
              {
                width: pinSize,
                height: pinSize,
                borderRadius: pinSize / 2,
                borderColor: tileStyle.spinnerBorder,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.half}>
        <PipFace
          value={b}
          size={faceSize}
          ebony={ebony}
          pipColors={tileStyle.pipColors}
          isDarkFace={tileStyle.isDarkFace}
        />
      </View>
    </LinearGradient>
  );

  if (!onPress) {
    return tileBody;
  }

  return (
    <Pressable
      onPress={ebony ? undefined : onPress}
      disabled={ebony}
      accessibilityRole="button"
      accessibilityLabel={`Ficha ${a} con ${b}${selected ? ', seleccionada' : ''}${
        ebony ? ', no jugable' : ', jugable'
      }`}
      style={({ pressed }) => [pressed && !ebony && { transform: [{ scale: 0.96 }] }]}
    >
      {tileBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#DDD1BC',
    borderBottomColor: '#B5A287',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.38)',
  },
  ivorySpecular: {
    position: 'absolute',
    top: 0.5,
    right: 1,
    left: 1,
    height: '45%',
    borderTopWidth: 1.25,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },
  tileEbony: {
    borderColor: '#31435A',
    borderBottomColor: '#0A1018',
    transform: [{ translateY: 2 }],
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.48)',
  },
  // Pure luminous porcelain lifted subtly on rack — NO thick yellow sticker border!
  tilePlayable: {
    borderColor: '#EBD39A',
    borderBottomColor: '#B89E68',
    transform: [{ translateY: -4 }],
    boxShadow: '0px 7px 14px rgba(245, 196, 81, 0.28)',
  },
  tileSelected: {
    borderColor: '#7DD3FC',
    borderWidth: 1.75,
    borderBottomColor: '#0284C7',
    transform: [{ translateY: -12 }, { scale: 1.04 }],
    boxShadow: '0px 12px 22px rgba(56, 189, 248, 0.48)',
  },
  tileHighlighted: {
    borderColor: CLUB.gold,
    borderWidth: 1.75,
    boxShadow: '0px 0px 16px rgba(245, 196, 81, 0.72)',
  },
  ghostTile: {
    backgroundColor: CLUB.ghostFill,
    borderColor: CLUB.ghostBorder,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
  },
  ghostTileActive: {
    backgroundColor: CLUB.ghostHoverFill,
    borderColor: CLUB.ghostHoverBorder,
    borderStyle: 'solid',
    transform: [{ scale: 1.07 }],
  },
  ghostDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 1,
  },
  half: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#B4A387',
    borderRadius: 1.2,
  },
  dividerHorizontal: {
    borderBottomWidth: 0.75,
    borderBottomColor: 'rgba(255, 255, 255, 0.78)',
  },
  dividerVertical: {
    borderRightWidth: 0.75,
    borderRightColor: 'rgba(255, 255, 255, 0.78)',
  },
  brassPin: {
    borderWidth: 0.75,
    borderColor: '#8A6416',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  },
});
