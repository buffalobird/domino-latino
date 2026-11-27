import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
}: {
  value: number;
  size: number;
  ebony?: boolean;
  ghost?: boolean;
}) {
  const pips = PIP_LAYOUTS[value] ?? [];
  const pipSize = Math.max(4, Math.round(size * 0.225));
  const color = ghost
    ? '#0B1622'
    : ebony
    ? EBONY_PIP_COLORS[value] ?? '#F1F5F9'
    : PIP_COLORS[value] ?? '#111827';
  const pad = Math.max(2.5, Math.round(size * 0.165));
  const inner = size - pad * 2;
  const step = inner / 2;
  const showRecess = !ghost && pipSize >= 6;

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
            borderTopWidth: showRecess ? 0.75 : 0,
            borderTopColor: ebony ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.38)',
            borderBottomWidth: showRecess ? 0.6 : 0,
            borderBottomColor: ebony ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.35)',
          }}
        />
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
  onPress,
}: DominoTileProps) {
  const isHorizontal = orientation === 'horizontal';
  const width = isHorizontal ? unit * 2 : unit;
  const height = isHorizontal ? unit : unit * 2;
  const faceSize = unit - 4;
  const radius = Math.max(6, Math.round(unit * 0.2));
  const pinSize = Math.max(4, Math.round(unit * 0.14));

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

  const gradColors: [string, string] = ebony
    ? [CLUB.ebonyTop, CLUB.ebonyBottom]
    : [CLUB.ivoryTop, CLUB.ivoryBottom];

  const tileBody = (
    <LinearGradient
      colors={gradColors}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[
        styles.tile,
        {
          width,
          height,
          flexDirection: isHorizontal ? 'row' : 'column',
          borderRadius: radius,
        },
        ebony && styles.tileEbony,
        playable && styles.tilePlayable,
        selected && styles.tileSelected,
        highlighted && styles.tileHighlighted,
      ]}
    >
      {/* Subtle porcelain top bevel highlight */}
      {!ebony && (
        <View
          pointerEvents="none"
          style={[
            styles.ivorySpecular,
            { borderRadius: Math.max(4, radius - 1.5) },
          ]}
        />
      )}

      <View style={styles.half}>
        <PipFace value={a} size={faceSize} ebony={ebony} />
      </View>

      <View
        style={[
          styles.dividerWrap,
          isHorizontal
            ? { width: 2, height: faceSize * 0.74 }
            : { height: 2, width: faceSize * 0.74 },
        ]}
      >
        <View
          style={[
            styles.dividerLine,
            ebony && { backgroundColor: 'rgba(148, 163, 184, 0.28)' },
          ]}
        />
        {/* Authentic Latin club brushed-brass center pin with specular highlight */}
        {!ebony && (
          <View
            style={[
              styles.brassPin,
              {
                width: pinSize,
                height: pinSize,
                borderRadius: pinSize / 2,
              },
            ]}
          >
            {pinSize >= 5 && <View style={styles.brassPinGlint} />}
          </View>
        )}
      </View>

      <View style={styles.half}>
        <PipFace value={b} size={faceSize} ebony={ebony} />
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
    borderWidth: 1.25,
    borderColor: CLUB.ivoryBorder,
    borderBottomWidth: 3.5,
    borderBottomColor: CLUB.ivoryLip,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.36)',
  },
  ivorySpecular: {
    position: 'absolute',
    top: 0.5,
    right: 1,
    left: 1,
    height: '42%',
    borderTopWidth: 1,
    borderTopColor: CLUB.ivoryInnerRim,
  },
  tileEbony: {
    borderColor: CLUB.ebonyBorder,
    borderBottomColor: CLUB.ebonyLip,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.48)',
  },
  tilePlayable: {
    borderColor: CLUB.gold,
    borderWidth: 1.75,
    borderBottomWidth: 4,
    borderBottomColor: '#C59A38',
    boxShadow: '0px 4px 12px rgba(245, 196, 81, 0.34)',
  },
  tileSelected: {
    borderColor: CLUB.cyan,
    borderWidth: 2.25,
    borderBottomWidth: 4,
    borderBottomColor: '#0284C7',
    transform: [{ translateY: -8 }],
    boxShadow: '0px 10px 18px rgba(56, 189, 248, 0.48)',
  },
  tileHighlighted: {
    borderColor: CLUB.gold,
    borderWidth: 2.25,
    boxShadow: '0px 0px 16px rgba(245, 196, 81, 0.7)',
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
    backgroundColor: '#C5B69D',
    borderRadius: 1,
  },
  brassPin: {
    backgroundColor: CLUB.brassPin,
    borderWidth: 0.75,
    borderColor: CLUB.brassPinEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brassPinGlint: {
    width: 1.8,
    height: 1.8,
    borderRadius: 1,
    backgroundColor: '#FFFBEB',
    transform: [{ translateX: -0.6 }, { translateY: -0.6 }],
  },
});
