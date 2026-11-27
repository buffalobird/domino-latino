import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { TileStyleId } from '@/constants/tileStyles';
import { CLUB } from '@/constants/tokens';
import { PlacedTile, PlaySide, Tile } from '@/engine/types';
import { DominoTile } from './DominoTile';

export interface DropZoneTarget {
  side: PlaySide;
  pageX: number;
  pageY: number;
}

export interface BoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoardCanvasProps {
  chain: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  activeTile: Tile | null;
  validSides: PlaySide[];
  hoverSide: PlaySide | null;
  numPlayers: number;
  themeId?: TableThemeId;
  tileStyleId?: TileStyleId;
  onSelectSide: (side: PlaySide) => void;
  onDropZonesMeasured?: (zones: DropZoneTarget[], boardRect: BoardRect) => void;
}

interface PositionedTile {
  placed: PlacedTile;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: 'horizontal' | 'vertical';
  pipA: number;
  pipB: number;
}

interface PositionedGhost {
  side: PlaySide;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: 'horizontal' | 'vertical';
  pipA: number;
  pipB: number;
}

const BASE_UNIT = 32;
const GAP = 2;
const TURN_EXTRA_CLEARANCE = 6; // Prevents adjacent doubles on consecutive rows from ever touching

/**
 * Heavy porcelain tile placement feel (fixes user feedback #2: "rebota demasiado"):
 * - ZERO rubbery spring wobble! Uses a crisp, fast ease-out-cubic deceleration (`150ms`)
 *   that feels like a dense ivory/porcelain domino settling dead-solid onto felt.
 * - Human tiles settle right in place (`scale 1.04 → 1.0`, no fake jump from bottom).
 * - Bot tiles glide cleanly 26px from their top-arc direction and stop decisively.
 */
function AnimatedPlacedTile({
  isLatest,
  playedBy,
  numPlayers,
  children,
}: {
  isLatest: boolean;
  playedBy: number;
  numPlayers: number;
  children: React.ReactNode;
}) {
  const getStartOffset = (): { x: number; y: number } => {
    if (playedBy === 0) return { x: 0, y: 0 }; // Dropped right on target — no fake jump!
    if (numPlayers === 2) return { x: 14, y: -26 }; // Top-right Bot
    if (playedBy === 1) return { x: -24, y: -22 }; // Top-left Oeste
    if (playedBy === 2) return { x: 0, y: -26 }; // Top-center Compa
    return { x: 24, y: -22 }; // Top-right Este
  };

  const start = getStartOffset();
  const tx = useSharedValue(isLatest ? start.x : 0);
  const ty = useSharedValue(isLatest ? start.y : 0);
  const scale = useSharedValue(isLatest ? 1.05 : 1);
  const opacity = useSharedValue(isLatest ? 0.72 : 1);

  useEffect(() => {
    if (!isLatest) return;
    const settleCfg = {
      duration: playedBy === 0 ? 110 : 175,
      easing: Easing.out(Easing.cubic),
    };
    tx.value = withTiming(0, settleCfg);
    ty.value = withTiming(0, settleCfg);
    scale.value = withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(1, { duration: 95 });
  }, [isLatest, playedBy, tx, ty, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

/**
 * Bi-directional connected snake layout:
 * - Anchors at opening tile (`order === 1`) centered at (0, 0).
 * - Right arm snakes DOWN with 90° vertical connectors.
 * - Left arm snakes UP with 90° vertical connectors.
 * - Extra row clearance guarantees zero overlap even with adjacent doubles.
 */
function computeBidirectionalSnakeLayout(
  chain: PlacedTile[],
  leftEnd: number | null,
  rightEnd: number | null,
  activeTile: Tile | null,
  containerW: number,
  containerH: number
): {
  tiles: PositionedTile[];
  leftGhost: PositionedGhost | null;
  rightGhost: PositionedGhost | null;
  scale: number;
  offsetX: number;
  offsetY: number;
} {
  if (chain.length === 0 || containerW <= 0 || containerH <= 0) {
    return {
      tiles: [],
      leftGhost: null,
      rightGhost: null,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const anchorIdx = Math.max(
    0,
    chain.findIndex((p) => p.order === 1)
  );
  // Adapt wrap span to the real board aspect ratio so portrait & landscape both look balanced
  const maxSpan = Math.max(260, Math.min(480, containerW * 0.9));
  const halfSpan = maxSpan / 2;

  const placedMap = new Map<number, PositionedTile>();

  const anchor = chain[anchorIdx];
  const anchorOrient: 'horizontal' | 'vertical' = anchor.isDouble
    ? 'vertical'
    : 'horizontal';
  const aw = anchorOrient === 'horizontal' ? BASE_UNIT * 2 : BASE_UNIT;
  const ah = anchorOrient === 'horizontal' ? BASE_UNIT : BASE_UNIT * 2;
  const anchorPos: PositionedTile = {
    placed: anchor,
    x: -aw / 2,
    y: -ah / 2,
    w: aw,
    h: ah,
    orientation: anchorOrient,
    pipA: anchor.leftPip,
    pipB: anchor.rightPip,
  };
  placedMap.set(anchorIdx, anchorPos);

  // Right arm (anchor+1 .. end) -> snakes DOWN
  let rDir: 1 | -1 = 1;
  let rCenterY = 0;
  let rCursorX = anchorPos.x + anchorPos.w;
  let rJustTurned = false;
  let rLastPos = anchorPos;

  for (let i = anchorIdx + 1; i < chain.length; i++) {
    const placed = chain[i];
    const orient: 'horizontal' | 'vertical' = placed.isDouble ? 'vertical' : 'horizontal';
    const w = orient === 'horizontal' ? BASE_UNIT * 2 : BASE_UNIT;
    const h = orient === 'horizontal' ? BASE_UNIT : BASE_UNIT * 2;

    const nextEdgeX = rDir === 1 ? rCursorX + GAP + w : rCursorX - GAP - w;
    const exceeds = !rJustTurned && Math.abs(nextEdgeX) > halfSpan;

    if (exceeds) {
      const vw = BASE_UNIT;
      const vh = BASE_UNIT * 2;
      const vx = rDir === 1 ? rLastPos.x + rLastPos.w - vw : rLastPos.x;
      const vy = rLastPos.y + rLastPos.h + GAP;
      const pos: PositionedTile = {
        placed,
        x: vx,
        y: vy,
        w: vw,
        h: vh,
        orientation: 'vertical',
        pipA: placed.leftPip,
        pipB: placed.rightPip,
      };
      placedMap.set(i, pos);
      rLastPos = pos;
      rDir = rDir === 1 ? -1 : 1;
      rCenterY = vy + vh - BASE_UNIT / 2 + TURN_EXTRA_CLEARANCE;
      rCursorX = rDir === -1 ? vx : vx + vw;
      rJustTurned = true;
      continue;
    }

    rJustTurned = false;
    const x = rDir === 1 ? rCursorX + GAP : rCursorX - GAP - w;
    rCursorX = rDir === 1 ? x + w : x;
    const y = rCenterY - h / 2;
    const pipA = rDir === 1 || placed.isDouble ? placed.leftPip : placed.rightPip;
    const pipB = rDir === 1 || placed.isDouble ? placed.rightPip : placed.leftPip;

    const pos: PositionedTile = {
      placed,
      x,
      y,
      w,
      h,
      orientation: orient,
      pipA,
      pipB,
    };
    placedMap.set(i, pos);
    rLastPos = pos;
  }

  // Left arm (anchor-1 .. 0) -> snakes UP
  let lDir: -1 | 1 = -1;
  let lCenterY = 0;
  let lCursorX = anchorPos.x;
  let lJustTurned = false;
  let lLastPos = anchorPos;

  for (let i = anchorIdx - 1; i >= 0; i--) {
    const placed = chain[i];
    const orient: 'horizontal' | 'vertical' = placed.isDouble ? 'vertical' : 'horizontal';
    const w = orient === 'horizontal' ? BASE_UNIT * 2 : BASE_UNIT;
    const h = orient === 'horizontal' ? BASE_UNIT : BASE_UNIT * 2;

    const nextEdgeX = lDir === -1 ? lCursorX - GAP - w : lCursorX + GAP + w;
    const exceeds = !lJustTurned && Math.abs(nextEdgeX) > halfSpan;

    if (exceeds) {
      const vw = BASE_UNIT;
      const vh = BASE_UNIT * 2;
      const vx = lDir === -1 ? lLastPos.x : lLastPos.x + lLastPos.w - vw;
      const vy = lLastPos.y - GAP - vh;
      const pos: PositionedTile = {
        placed,
        x: vx,
        y: vy,
        w: vw,
        h: vh,
        orientation: 'vertical',
        pipA: placed.leftPip,
        pipB: placed.rightPip,
      };
      placedMap.set(i, pos);
      lLastPos = pos;
      lDir = lDir === -1 ? 1 : -1;
      lCenterY = vy + BASE_UNIT / 2 - TURN_EXTRA_CLEARANCE;
      lCursorX = lDir === 1 ? vx + vw : vx;
      lJustTurned = true;
      continue;
    }

    lJustTurned = false;
    const x = lDir === -1 ? lCursorX - GAP - w : lCursorX + GAP;
    lCursorX = lDir === -1 ? x : x + w;
    const y = lCenterY - h / 2;
    const pipA = lDir === -1 || placed.isDouble ? placed.leftPip : placed.rightPip;
    const pipB = lDir === -1 || placed.isDouble ? placed.rightPip : placed.leftPip;

    const pos: PositionedTile = {
      placed,
      x,
      y,
      w,
      h,
      orientation: orient,
      pipA,
      pipB,
    };
    placedMap.set(i, pos);
    lLastPos = pos;
  }

  const tiles = chain.map((_, idx) => placedMap.get(idx)!);

  // Ghost previews
  const ghostDouble = activeTile ? activeTile.a === activeTile.b : false;
  const ghostOrient: 'horizontal' | 'vertical' = ghostDouble ? 'vertical' : 'horizontal';
  const gw = ghostOrient === 'horizontal' ? BASE_UNIT * 2 : BASE_UNIT;
  const gh = ghostOrient === 'horizontal' ? BASE_UNIT : BASE_UNIT * 2;

  const rMatch = rightEnd ?? 0;
  const rOther =
    activeTile && (activeTile.a === rMatch || activeTile.b === rMatch)
      ? activeTile.a === rMatch
        ? activeTile.b
        : activeTile.a
      : rMatch;
  const rNextEdge = rDir === 1 ? rCursorX + GAP + gw : rCursorX - GAP - gw;
  const rWouldTurn = !rJustTurned && Math.abs(rNextEdge) > halfSpan;

  const rightGhost: PositionedGhost = rWouldTurn
    ? {
        side: 'right',
        x: rDir === 1 ? rLastPos.x + rLastPos.w - BASE_UNIT : rLastPos.x,
        y: rLastPos.y + rLastPos.h + GAP,
        w: BASE_UNIT,
        h: BASE_UNIT * 2,
        orientation: 'vertical',
        pipA: rMatch,
        pipB: rOther,
      }
    : {
        side: 'right',
        x: rDir === 1 ? rCursorX + GAP : rCursorX - GAP - gw,
        y: rCenterY - gh / 2,
        w: gw,
        h: gh,
        orientation: ghostOrient,
        pipA: rDir === 1 || ghostDouble ? rMatch : rOther,
        pipB: rDir === 1 || ghostDouble ? rOther : rMatch,
      };

  const lMatch = leftEnd ?? 0;
  const lOther =
    activeTile && (activeTile.a === lMatch || activeTile.b === lMatch)
      ? activeTile.a === lMatch
        ? activeTile.b
        : activeTile.a
      : lMatch;
  const lNextEdge = lDir === -1 ? lCursorX - GAP - gw : lCursorX + GAP + gw;
  const lWouldTurn = !lJustTurned && Math.abs(lNextEdge) > halfSpan;

  const leftGhost: PositionedGhost = lWouldTurn
    ? {
        side: 'left',
        x: lDir === -1 ? lLastPos.x : lLastPos.x + lLastPos.w - BASE_UNIT,
        y: lLastPos.y - GAP - BASE_UNIT * 2,
        w: BASE_UNIT,
        h: BASE_UNIT * 2,
        orientation: 'vertical',
        pipA: lOther,
        pipB: lMatch,
      }
    : {
        side: 'left',
        x: lDir === -1 ? lCursorX - GAP - gw : lCursorX + GAP,
        y: lCenterY - gh / 2,
        w: gw,
        h: gh,
        orientation: ghostOrient,
        pipA: lDir === -1 || ghostDouble ? lOther : lMatch,
        pipB: lDir === -1 || ghostDouble ? lMatch : lOther,
      };

  let minX = Math.min(leftGhost.x, rightGhost.x);
  let maxX = Math.max(leftGhost.x + leftGhost.w, rightGhost.x + rightGhost.w);
  let minY = Math.min(leftGhost.y, rightGhost.y);
  let maxY = Math.max(leftGhost.y + leftGhost.h, rightGhost.y + rightGhost.h);

  for (const t of tiles) {
    minX = Math.min(minX, t.x);
    maxX = Math.max(maxX, t.x + t.w);
    minY = Math.min(minY, t.y);
    maxY = Math.max(maxY, t.y + t.h);
  }

  const bboxW = Math.max(1, maxX - minX);
  const bboxH = Math.max(1, maxY - minY);
  const padX = 14;
  const padY = 14;
  const availW = Math.max(120, containerW - padX * 2);
  const availH = Math.max(100, containerH - padY * 2);

  const scale = Math.min(1.22, availW / bboxW, availH / bboxH);
  const scaledW = bboxW * scale;
  const scaledH = bboxH * scale;

  const offsetX = (containerW - scaledW) / 2 - minX * scale;
  const offsetY = (containerH - scaledH) / 2 - minY * scale;

  return { tiles, leftGhost, rightGhost, scale, offsetX, offsetY };
}

export function BoardCanvas({
  chain,
  leftEnd,
  rightEnd,
  activeTile,
  validSides,
  hoverSide,
  numPlayers,
  themeId = 'caribe',
  tileStyleId = 'marfil',
  onSelectSide,
  onDropZonesMeasured,
}: BoardCanvasProps) {
  const theme = TABLE_THEMES[themeId] ?? TABLE_THEMES.caribe;
  const boardRef = useRef<React.ComponentRef<typeof View>>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [highlightOrder, setHighlightOrder] = useState<number>(0);

  useEffect(() => {
    if (chain.length === 0) {
      setHighlightOrder(0);
      return;
    }
    setHighlightOrder(chain.length);
    const t = setTimeout(() => setHighlightOrder(0), 1900);
    return () => clearTimeout(t);
  }, [chain.length]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.width) > 2 || Math.abs(height - size.height) > 2) {
      setSize({ width, height });
    }
  };

  const layout = useMemo(
    () =>
      computeBidirectionalSnakeLayout(
        chain,
        leftEnd,
        rightEnd,
        activeTile,
        size.width,
        size.height
      ),
    [chain, leftEnd, rightEnd, activeTile, size.width, size.height]
  );

  useEffect(() => {
    if (!onDropZonesMeasured || size.width === 0 || size.height === 0) return;
    const handle = setTimeout(() => {
      boardRef.current?.measureInWindow(
        (bx: number, by: number, bw: number, bh: number) => {
          if (!bw || !bh) return;
          const zones: DropZoneTarget[] = [];
          if (chain.length === 0) {
            zones.push({ side: 'start', pageX: bx + bw / 2, pageY: by + bh / 2 });
          } else {
            if (layout.leftGhost) {
              zones.push({
                side: 'left',
                pageX:
                  bx +
                  layout.offsetX +
                  (layout.leftGhost.x + layout.leftGhost.w / 2) * layout.scale,
                pageY:
                  by +
                  layout.offsetY +
                  (layout.leftGhost.y + layout.leftGhost.h / 2) * layout.scale,
              });
            }
            if (layout.rightGhost) {
              zones.push({
                side: 'right',
                pageX:
                  bx +
                  layout.offsetX +
                  (layout.rightGhost.x + layout.rightGhost.w / 2) * layout.scale,
                pageY:
                  by +
                  layout.offsetY +
                  (layout.rightGhost.y + layout.rightGhost.h / 2) * layout.scale,
              });
            }
          }
          onDropZonesMeasured(zones, { x: bx, y: by, width: bw, height: bh });
        }
      );
    }, 25);
    return () => clearTimeout(handle);
  }, [chain.length, layout, size.width, size.height, onDropZonesMeasured]);

  const latestOrder = chain.length;
  const canPlaceStart = validSides.includes('start');
  const canPlaceLeft = validSides.includes('left');
  const canPlaceRight = validSides.includes('right');

  return (
    <LinearGradient
      colors={[theme.woodLight, theme.woodMid, theme.woodDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.woodFrame}
    >
      <View ref={boardRef} style={styles.feltClip} onLayout={handleLayout}>
        <LinearGradient
          colors={[theme.feltCenter, theme.feltEdge]}
          start={{ x: 0.5, y: 0.35 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.feltGradient}
        >
          <View
            style={[styles.feltInnerRing, { borderColor: theme.feltInlay }]}
            pointerEvents="none"
          >
            {/* 4 brushed-brass parlor corner pins */}
            <View style={[styles.cornerPin, styles.pinTL]} />
            <View style={[styles.cornerPin, styles.pinTR]} />
            <View style={[styles.cornerPin, styles.pinBL]} />
            <View style={[styles.cornerPin, styles.pinBR]} />
          </View>

          {chain.length === 0 ? (
            <View style={styles.emptyCenter}>
              {canPlaceStart && activeTile ? (
                <Pressable
                  onPress={() => onSelectSide('start')}
                  hitSlop={16}
                  style={({ pressed }) => [
                    styles.startGhostTarget,
                    hoverSide === 'start' && styles.startGhostTargetActive,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <DominoTile
                    a={activeTile.a}
                    b={activeTile.b}
                    orientation={activeTile.a === activeTile.b ? 'vertical' : 'horizontal'}
                    unit={36}
                    ghost
                    ghostActive={hoverSide === 'start'}
                  />
                </Pressable>
              ) : (
                <View style={styles.centerMedallion} pointerEvents="none">
                  <Svg width={56} height={56} viewBox="0 0 64 64" opacity={0.22}>
                    <Circle
                      cx={32}
                      cy={32}
                      r={29}
                      stroke="#F5C451"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <Rect
                      x={21}
                      y={12}
                      width={22}
                      height={40}
                      rx={5}
                      stroke="#FCE39C"
                      strokeWidth={1.6}
                      fill="none"
                    />
                    <Line
                      x1={24}
                      y1={32}
                      x2={40}
                      y2={32}
                      stroke="#FCE39C"
                      strokeWidth={1.4}
                    />
                    <Circle cx={32} cy={32} r={2} fill="#F5C451" />
                    <Circle cx={27} cy={18} r={1.8} fill="#FCE39C" />
                    <Circle cx={37} cy={18} r={1.8} fill="#FCE39C" />
                    <Circle cx={27} cy={25} r={1.8} fill="#FCE39C" />
                    <Circle cx={37} cy={25} r={1.8} fill="#FCE39C" />
                    <Circle cx={27} cy={39} r={1.8} fill="#FCE39C" />
                    <Circle cx={37} cy={39} r={1.8} fill="#FCE39C" />
                    <Circle cx={27} cy={46} r={1.8} fill="#FCE39C" />
                    <Circle cx={37} cy={46} r={1.8} fill="#FCE39C" />
                  </Svg>
                </View>
              )}
            </View>
          ) : (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {layout.tiles.map((item) => {
                const isLatest = item.placed.order === latestOrder;
                return (
                  <View
                    key={item.placed.tile.id}
                    style={{
                      position: 'absolute',
                      left: layout.offsetX + item.x * layout.scale,
                      top: layout.offsetY + item.y * layout.scale,
                      width: item.w * layout.scale,
                      height: item.h * layout.scale,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AnimatedPlacedTile
                      isLatest={isLatest}
                      playedBy={item.placed.playedBy}
                      numPlayers={numPlayers}
                    >
                      <DominoTile
                        a={item.pipA}
                        b={item.pipB}
                        orientation={item.orientation}
                        unit={BASE_UNIT * layout.scale}
                        highlighted={item.placed.order === highlightOrder}
                        tileStyleId={tileStyleId}
                      />
                    </AnimatedPlacedTile>
                  </View>
                );
              })}

              {canPlaceLeft && layout.leftGhost && (
                <Pressable
                  onPress={() => onSelectSide('left')}
                  hitSlop={14}
                  accessibilityRole="button"
                  accessibilityLabel={`Colocar en extremo izquierdo ${leftEnd}`}
                  style={{
                    position: 'absolute',
                    left: layout.offsetX + layout.leftGhost.x * layout.scale - 8,
                    top: layout.offsetY + layout.leftGhost.y * layout.scale - 8,
                    padding: 8,
                    zIndex: 25,
                  }}
                >
                  <DominoTile
                    a={layout.leftGhost.pipA}
                    b={layout.leftGhost.pipB}
                    orientation={layout.leftGhost.orientation}
                    unit={BASE_UNIT * layout.scale}
                    ghost
                    ghostActive={hoverSide === 'left'}
                  />
                </Pressable>
              )}

              {canPlaceRight && layout.rightGhost && (
                <Pressable
                  onPress={() => onSelectSide('right')}
                  hitSlop={14}
                  accessibilityRole="button"
                  accessibilityLabel={`Colocar en extremo derecho ${rightEnd}`}
                  style={{
                    position: 'absolute',
                    left: layout.offsetX + layout.rightGhost.x * layout.scale - 8,
                    top: layout.offsetY + layout.rightGhost.y * layout.scale - 8,
                    padding: 8,
                    zIndex: 25,
                  }}
                >
                  <DominoTile
                    a={layout.rightGhost.pipA}
                    b={layout.rightGhost.pipB}
                    orientation={layout.rightGhost.orientation}
                    unit={BASE_UNIT * layout.scale}
                    ghost
                    ghostActive={hoverSide === 'right'}
                  />
                </Pressable>
              )}
            </View>
          )}
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  woodFrame: {
    flex: 1,
    borderRadius: 22,
    padding: 5,
    borderWidth: 1,
    borderColor: CLUB.woodHighlight,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
  },
  feltClip: {
    flex: 1,
    borderRadius: 17,
    overflow: 'hidden',
  },
  feltGradient: {
    flex: 1,
    position: 'relative',
  },
  feltInnerRing: {
    position: 'absolute',
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CLUB.feltLine,
  },
  cornerPin: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(245, 204, 102, 0.38)',
  },
  pinTL: { top: 5, left: 5 },
  pinTR: { top: 5, right: 5 },
  pinBL: { bottom: 5, left: 5 },
  pinBR: { bottom: 5, right: 5 },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMedallion: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(245, 214, 138, 0.14)',
    backgroundColor: 'rgba(255, 245, 224, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGhostTarget: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: CLUB.ghostBorder,
  },
  startGhostTargetActive: {
    backgroundColor: 'rgba(245, 196, 81, 0.2)',
    borderColor: CLUB.gold,
    borderStyle: 'solid',
  },
});
