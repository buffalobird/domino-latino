import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { BotMood, getSeatProfile } from '@/constants/seatProfiles';
import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { TileStyleId } from '@/constants/tileStyles';
import { CLUB } from '@/constants/tokens';
import { AiDifficulty } from '@/engine/ai';
import {
  canDrawFromBoneyard,
  getLegalMovesForSeat,
  handPipSum,
  sortHand,
} from '@/engine/rules';
import { GameState, PlaySide, SortMode, Tile } from '@/engine/types';
import { hapticLight, hapticSnap, playGameSound } from '@/utils/feedback';
import { BoardCanvas, BoardRect, DropZoneTarget } from './BoardCanvas';
import { BoneyardDrawer } from './BoneyardDrawer';
import { DominoTile } from './DominoTile';
import { HistoryModal } from './HistoryModal';
import { PauseIcon, PlusIcon, SoundOffIcon, SoundOnIcon } from './Icons';
import { BotSpeed, PauseModal } from './PauseModal';
import { SeatAvatar } from './SeatAvatar';

interface GameTableViewProps {
  state: GameState;
  turnSecondsLeft: number | null;
  humanTurnTotalSeconds: number;
  botTimerProgress: number;
  botSpeed: BotSpeed;
  aiDifficulty?: AiDifficulty;
  seatMoods: Record<number, BotMood>;
  themeId?: TableThemeId;
  tileStyleId?: TileStyleId;
  playerAvatarConfig?: AvatarConfig;
  onHumanPlay: (tileId: string, side: PlaySide) => void;
  onHumanDraw: (boneyardIndex?: number) => void;
  onHumanPass: () => void;
  onToggleSort: (sortMode: SortMode) => void;
  onToggleSound: () => void;
  onCycleBotSpeed: () => void;
  onCycleAiDifficulty?: () => void;
  onPauseChange?: (paused: boolean) => void;
  onOpenFeedback: () => void;
  onRestartMatch: () => void;
  onExitToHome: () => void;
}

interface GestureHandTileProps {
  tile: Tile;
  unit: number;
  isLegal: boolean;
  isSelected: boolean;
  isDraggingThis: boolean;
  singleValidSide: PlaySide | null;
  tileStyleId?: TileStyleId;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragActive: SharedValue<number>;
  dragTilt: SharedValue<number>;
  rootOriginX: SharedValue<number>;
  rootOriginY: SharedValue<number>;
  onDragBegin: (tile: Tile) => void;
  onDragHoverCheck: (tileId: string, absX: number, absY: number) => void;
  onDragCommit: (tile: Tile, absX: number, absY: number) => void;
  onSingleTap: (tile: Tile) => void;
  onDoubleTapQuickPlay: (tile: Tile, side: PlaySide) => void;
}

function GestureHandTile({
  tile,
  unit,
  isLegal,
  isSelected,
  isDraggingThis,
  singleValidSide,
  tileStyleId = 'marfil',
  dragX,
  dragY,
  dragActive,
  dragTilt,
  rootOriginX,
  rootOriginY,
  onDragBegin,
  onDragHoverCheck,
  onDragCommit,
  onSingleTap,
  onDoubleTapQuickPlay,
}: GestureHandTileProps) {
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isLegal)
        .minDistance(6)
        .onStart((e) => {
          dragX.value = e.absoluteX - rootOriginX.value;
          dragY.value = e.absoluteY - rootOriginY.value;
          dragTilt.value = 0;
          dragActive.value = 1;
          runOnJS(onDragBegin)(tile);
        })
        .onUpdate((e) => {
          dragX.value = e.absoluteX - rootOriginX.value;
          dragY.value = e.absoluteY - rootOriginY.value;
          dragTilt.value = Math.max(-9, Math.min(9, e.velocityX / 150));
          runOnJS(onDragHoverCheck)(tile.id, e.absoluteX, e.absoluteY);
        })
        .onEnd((e) => {
          dragActive.value = 0;
          dragTilt.value = 0;
          runOnJS(onDragCommit)(tile, e.absoluteX, e.absoluteY);
        })
        .onFinalize(() => {
          dragActive.value = 0;
          dragTilt.value = 0;
        }),
    [
      isLegal,
      tile,
      dragX,
      dragY,
      dragActive,
      dragTilt,
      rootOriginX,
      rootOriginY,
      onDragBegin,
      onDragHoverCheck,
      onDragCommit,
    ]
  );

  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(isLegal && singleValidSide !== null)
        .numberOfTaps(2)
        .maxDuration(240)
        .onEnd(() => {
          if (singleValidSide) {
            runOnJS(onDoubleTapQuickPlay)(tile, singleValidSide);
          }
        }),
    [isLegal, singleValidSide, tile, onDoubleTapQuickPlay]
  );

  const singleTap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(isLegal)
        .numberOfTaps(1)
        .onEnd(() => {
          runOnJS(onSingleTap)(tile);
        }),
    [isLegal, tile, onSingleTap]
  );

  const composed = useMemo(
    () => Gesture.Race(pan, Gesture.Exclusive(doubleTap, singleTap)),
    [pan, doubleTap, singleTap]
  );

  return (
    <GestureDetector gesture={composed}>
      <View style={{ opacity: isDraggingThis ? 0.14 : 1 }}>
        <DominoTile
          a={tile.a}
          b={tile.b}
          orientation="vertical"
          unit={unit}
          playable={isLegal}
          selected={isSelected && !isDraggingThis}
          ebony={!isLegal}
          tileStyleId={tileStyleId}
        />
      </View>
    </GestureDetector>
  );
}

export function GameTableView({
  state,
  turnSecondsLeft,
  humanTurnTotalSeconds,
  botTimerProgress,
  botSpeed,
  aiDifficulty = 'normal',
  seatMoods,
  themeId = 'caribe',
  tileStyleId = 'marfil',
  playerAvatarConfig,
  onHumanPlay,
  onHumanDraw,
  onHumanPass,
  onToggleSort,
  onToggleSound,
  onCycleBotSpeed,
  onCycleAiDifficulty,
  onPauseChange,
  onOpenFeedback,
  onRestartMatch,
  onExitToHome,
}: GameTableViewProps) {
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape = winW > winH;

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [draggingTile, setDraggingTile] = useState<Tile | null>(null);
  const [hoverSide, setHoverSide] = useState<PlaySide | null>(null);
  const [boneyardOpen, setBoneyardOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [rackWidth, setRackWidth] = useState<number>(Math.max(300, winW - 24));

  const rootRef = useRef<React.ComponentRef<typeof View>>(null);
  const dropZonesRef = useRef<DropZoneTarget[]>([]);
  const boardRectRef = useRef<BoardRect | null>(null);
  const hoverSideRef = useRef<PlaySide | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragActive = useSharedValue(0);
  const dragTilt = useSharedValue(0);
  const rootOriginX = useSharedValue(0);
  const rootOriginY = useSharedValue(0);
  const pozoPulse = useSharedValue(1);

  const human = state.players[0];
  const isHumanTurn = state.phase === 'playing' && state.currentTurnSeat === 0;
  const myPipSum = useMemo(() => handPipSum(human.hand), [human.hand]);

  const legalMoves = useMemo(
    () => (isHumanTurn ? getLegalMovesForSeat(state, 0) : []),
    [state, isHumanTurn]
  );

  const legalMovesMap = useMemo(() => {
    const map = new Map<string, PlaySide[]>();
    for (const m of legalMoves) {
      map.set(m.tile.id, m.sides);
    }
    return map;
  }, [legalMoves]);

  const mustDraw = isHumanTurn && canDrawFromBoneyard(state, 0);
  const mustPass =
    isHumanTurn && legalMoves.length === 0 && state.boneyard.length === 0;

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastText(null), 1300);
  }, []);

  useEffect(() => {
    onPauseChange?.(pauseOpen);
    return () => {
      onPauseChange?.(false);
    };
  }, [pauseOpen, onPauseChange]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const measureRootOrigin = useCallback(() => {
    rootRef.current?.measureInWindow((rx: number, ry: number) => {
      rootOriginX.value = rx;
      rootOriginY.value = ry;
    });
  }, [rootOriginX, rootOriginY]);

  useEffect(() => {
    const t = setTimeout(measureRootOrigin, 50);
    return () => clearTimeout(t);
  }, [measureRootOrigin, winW, winH]);

  useEffect(() => {
    if (mustDraw) {
      pozoPulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 420 }),
          withTiming(1.0, { duration: 420 })
        ),
        -1,
        true
      );
    } else {
      pozoPulse.value = withTiming(1, { duration: 160 });
    }
  }, [mustDraw, pozoPulse]);

  const shouldKeepDrawerOpen =
    boneyardOpen && isHumanTurn && legalMoves.length === 0 && state.boneyard.length > 0;
  useEffect(() => {
    if (boneyardOpen && !shouldKeepDrawerOpen) {
      const t = setTimeout(() => setBoneyardOpen(false), 180);
      return () => clearTimeout(t);
    }
  }, [boneyardOpen, shouldKeepDrawerOpen]);

  const effectiveSelectedId =
    isHumanTurn && selectedTileId && legalMovesMap.has(selectedTileId)
      ? selectedTileId
      : null;

  const activeTileId = draggingTile?.id ?? effectiveSelectedId;
  const activeMove = useMemo(
    () => legalMoves.find((m) => m.tile.id === activeTileId) ?? null,
    [legalMoves, activeTileId]
  );

  const sortedHand = useMemo(
    () => sortHand(human.hand, state.sortMode),
    [human.hand, state.sortMode]
  );

  const { handTileUnit, handOverlap } = useMemo(() => {
    const count = Math.max(1, sortedHand.length);
    const maxUnit = isLandscape ? 32 : 40;
    const minUnit = isLandscape ? 24 : 28;
    const usableW = Math.max(240, rackWidth - 16);
    const idealGap = 6;
    const totalNeededAtMax = count * maxUnit + (count - 1) * idealGap;

    if (totalNeededAtMax <= usableW) {
      return { handTileUnit: maxUnit, handOverlap: idealGap };
    }
    const fittedUnit = Math.floor((usableW - (count - 1) * 4) / count);
    if (fittedUnit >= minUnit) {
      return { handTileUnit: fittedUnit, handOverlap: 4 };
    }
    const overlap = Math.floor((usableW - count * minUnit) / Math.max(1, count - 1));
    return { handTileUnit: minUnit, handOverlap: Math.max(-14, overlap) };
  }, [sortedHand.length, rackWidth, isLandscape]);

  const handleDropZonesMeasured = useCallback(
    (zones: DropZoneTarget[], rect: BoardRect) => {
      dropZonesRef.current = zones;
      boardRectRef.current = rect;
    },
    []
  );

  const resolveHoveredSide = useCallback(
    (absX: number, absY: number, validSides: PlaySide[]): PlaySide | null => {
      if (validSides.length === 0) return null;
      const rect = boardRectRef.current;
      const insideBoard =
        rect &&
        absX >= rect.x - 24 &&
        absX <= rect.x + rect.width + 24 &&
        absY >= rect.y - 24 &&
        absY <= rect.y + rect.height + 28;

      if (!insideBoard) return null;
      if (validSides.length === 1) return validSides[0];

      let closest: PlaySide | null = null;
      let minDist = Infinity;
      for (const z of dropZonesRef.current) {
        if (!validSides.includes(z.side)) continue;
        const dist = Math.hypot(absX - z.pageX, absY - z.pageY);
        if (dist < minDist) {
          minDist = dist;
          closest = z.side;
        }
      }
      return closest;
    },
    []
  );

  const handleDragBegin = useCallback(
    (tile: Tile) => {
      hapticLight();
      playGameSound('pickup', state.soundEnabled);
      setDraggingTile(tile);
      setSelectedTileId(tile.id);
      hoverSideRef.current = null;
      setHoverSide(null);
    },
    [state.soundEnabled]
  );

  const handleDragHoverCheck = useCallback(
    (tileId: string, absX: number, absY: number) => {
      const sides = legalMovesMap.get(tileId);
      if (!sides) return;
      const nextSide = resolveHoveredSide(absX, absY, sides);
      if (nextSide !== hoverSideRef.current) {
        hoverSideRef.current = nextSide;
        setHoverSide(nextSide);
        if (nextSide) hapticLight();
      }
    },
    [legalMovesMap, resolveHoveredSide]
  );

  const handleDragCommit = useCallback(
    (tile: Tile, absX: number, absY: number) => {
      const sides = legalMovesMap.get(tile.id) ?? [];
      const side = resolveHoveredSide(absX, absY, sides);
      setDraggingTile(null);
      hoverSideRef.current = null;
      setHoverSide(null);

      if (side) {
        hapticSnap();
        setSelectedTileId(null);
        onHumanPlay(tile.id, side);
      }
    },
    [legalMovesMap, resolveHoveredSide, onHumanPlay]
  );

  const handleSingleTap = useCallback(
    (tile: Tile) => {
      hapticLight();
      playGameSound('pickup', state.soundEnabled);
      setSelectedTileId((prev) => (prev === tile.id ? null : tile.id));
    },
    [state.soundEnabled]
  );

  const handleDoubleTapQuickPlay = useCallback(
    (tile: Tile, side: PlaySide) => {
      hapticSnap();
      setSelectedTileId(null);
      onHumanPlay(tile.id, side);
    },
    [onHumanPlay]
  );

  const handleSelectSide = useCallback(
    (side: PlaySide) => {
      if (!activeMove || !activeMove.sides.includes(side)) return;
      hapticSnap();
      setSelectedTileId(null);
      onHumanPlay(activeMove.tile.id, side);
    },
    [activeMove, onHumanPlay]
  );

  const handlePozoButtonPress = () => {
    if (state.boneyard.length === 0) {
      showToast('Pozo vacío');
      return;
    }
    if (!isHumanTurn) {
      showToast('Espera tu turno');
      return;
    }
    if (!mustDraw) {
      hapticLight();
      showToast('Tienes jugada disponible');
      return;
    }
    hapticLight();
    setBoneyardOpen(true);
  };

  // Lifted 86px above finger so thumb NEVER hides the tile pips while aiming on iPhone/Android
  const floatingTileStyle = useAnimatedStyle(() => ({
    opacity: dragActive.value,
    transform: [
      { translateX: dragX.value - 22 },
      { translateY: dragY.value - 86 },
      { scale: dragActive.value ? 1.1 : 0.92 },
      { rotate: `${dragTilt.value}deg` },
    ],
  }));

  const pozoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pozoPulse.value }],
  }));

  const isFourPlayers = state.players.length === 4;
  const is2v2 = state.mode === '2v2';
  const activeTheme = TABLE_THEMES[themeId] ?? TABLE_THEMES.caribe;

  const humanProfile = getSeatProfile(state.mode, 0);
  const humanTimerProgress =
    isHumanTurn && turnSecondsLeft !== null
      ? turnSecondsLeft / humanTurnTotalSeconds
      : 1;

  const handleRackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - rackWidth) > 2) setRackWidth(w);
  };

  return (
    <LinearGradient
      colors={['#071124', '#081327', '#0A1830', '#060E1F']}
      locations={[0, 0.35, 0.72, 1]}
      style={styles.root}
      onLayout={measureRootOrigin}
    >
      <View ref={rootRef} style={styles.rootInner}>
        {/* Top Row: Controls + Shared 2v2 Team Score (or 1v1 Bot on right) */}
        <View style={styles.topUtilityRow}>
          <View style={styles.cornerControls}>
            <Pressable
              onPress={() => {
                hapticLight();
                setPauseOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Menú de pausa"
              style={({ pressed }) => [styles.iconCircle, pressed && { opacity: 0.78 }]}
            >
              <PauseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>

            <Pressable
              onPress={() => {
                hapticLight();
                onToggleSound();
              }}
              accessibilityRole="button"
              accessibilityLabel={state.soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              style={({ pressed }) => [styles.iconCircle, pressed && { opacity: 0.78 }]}
            >
              {state.soundEnabled ? (
                <SoundOnIcon size={18} color={CLUB.emerald} />
              ) : (
                <SoundOffIcon size={18} color={CLUB.textMuted} />
              )}
            </Pressable>
          </View>

          {is2v2 && (
            <View style={styles.teamScorePill}>
              <Text style={styles.teamNosotros}>
                NOS {state.scores[0]}
              </Text>
              <Text style={styles.teamDivider}>·</Text>
              <Text style={styles.teamRivales}>
                RIV {state.scores[1]}
              </Text>
              <Text style={styles.teamGoal}>/{state.targetScore}</Text>
            </View>
          )}

          {!isFourPlayers && (
            <SeatAvatar
              profile={getSeatProfile(state.mode, 1)}
              tileCount={state.players[1].hand.length}
              score={state.scores[1] ?? 0}
              targetScore={state.targetScore}
              isActiveTurn={state.currentTurnSeat === 1}
              timerProgress={botTimerProgress}
              lastAction={state.players[1].lastAction}
              mood={seatMoods[1] ?? 'idle'}
              layout="horizontal"
              bubbleAnchor="below"
            />
          )}
        </View>

        {/* 4-Player Clockwise Opponent Arc ABOVE the table (Board stays 100% FULL WIDTH!) */}
        {isFourPlayers && (
          <View style={styles.fourPlayerArc}>
            {[1, 2, 3].map((seatIdx) => {
              const p = state.players[seatIdx];
              const prof = getSeatProfile(state.mode, seatIdx);
              return (
                <SeatAvatar
                  key={seatIdx}
                  profile={prof}
                  tileCount={p.hand.length}
                  score={state.scores[p.teamId] ?? 0}
                  targetScore={state.targetScore}
                  showScore={!is2v2}
                  isActiveTurn={state.currentTurnSeat === seatIdx}
                  timerProgress={botTimerProgress}
                  lastAction={p.lastAction}
                  mood={seatMoods[seatIdx] ?? 'idle'}
                  layout="stacked"
                  bubbleAnchor="below"
                />
              );
            })}
          </View>
        )}

        {/* 100% FULL-WIDTH Table Board in ALL modes (1v1, 2v2, 4ffa) */}
        <View style={styles.boardWrap}>
          <BoardCanvas
            chain={state.chain}
            leftEnd={state.leftEnd}
            rightEnd={state.rightEnd}
            activeTile={activeMove?.tile ?? null}
            validSides={activeMove ? activeMove.sides : []}
            hoverSide={hoverSide}
            numPlayers={state.players.length}
            themeId={themeId}
            tileStyleId={tileStyleId}
            onSelectSide={handleSelectSide}
            onDropZonesMeasured={handleDropZonesMeasured}
          />

          {state.mode === '1v1' && (
            <Animated.View style={[styles.pozoWrap, pozoAnimStyle]}>
              <Pressable
                onPress={handlePozoButtonPress}
                accessibilityRole="button"
                accessibilityLabel={`Pozo, ${state.boneyard.length} fichas`}
                style={[
                  styles.pozoBtn,
                  mustDraw && styles.pozoBtnActive,
                  state.boneyard.length === 0 && styles.pozoBtnEmpty,
                ]}
              >
                <PlusIcon size={26} color="#FFFFFF" />
                <View
                  style={[
                    styles.pozoCountBadge,
                    mustDraw && styles.pozoCountBadgeActive,
                  ]}
                >
                  <Text style={styles.pozoCountText}>{state.boneyard.length}</Text>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {toastText && (
            <View style={styles.toastWrap} pointerEvents="none">
              <View style={styles.toastPill}>
                <Text style={styles.toastText}>{toastText}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom HUD: Human Seat Avatar + Compact Tactical Pip Sum / Pass CTA */}
        <View style={styles.bottomHudRow}>
          <SeatAvatar
            profile={humanProfile}
            tileCount={human.hand.length}
            score={state.scores[human.teamId] ?? 0}
            targetScore={state.targetScore}
            showScore={!is2v2}
            isActiveTurn={isHumanTurn}
            timerProgress={humanTimerProgress}
            secondsLeft={turnSecondsLeft}
            lastAction={human.lastAction}
            mood={seatMoods[0] ?? 'idle'}
            avatarConfig={playerAvatarConfig}
            layout="horizontal"
            bubbleAnchor="right"
          />

          {mustPass ? (
            <Pressable
              onPress={onHumanPass}
              style={({ pressed }) => [styles.passBtn, pressed && { opacity: 0.88 }]}
            >
              <Text style={styles.passBtnText}>Pasar</Text>
            </Pressable>
          ) : (
            <View style={styles.tacticalChips}>
              <View style={styles.pipSumChip}>
                <Text style={styles.pipSumText}>{myPipSum} pts</Text>
              </View>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onToggleSort(state.sortMode === 'value' ? 'doubles' : 'value');
                }}
                accessibilityRole="button"
                accessibilityLabel="Cambiar orden de fichas"
                style={styles.sortChip}
              >
                <Text style={styles.sortChipText}>
                  {state.sortMode === 'value' ? '1-6' : 'Dobles'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Lacquered Wood Hand Rack — Theme-matched, auto-compressed, ZERO scroll */}
        <LinearGradient
          colors={[activeTheme.rackTop, activeTheme.rackBottom]}
          style={[styles.woodRack, isLandscape && styles.woodRackLandscape]}
          onLayout={handleRackLayout}
        >
          <View style={styles.rackTrim} pointerEvents="none" />
          <View style={styles.handFlexRow}>
            {sortedHand.map((tile, idx) => {
              const sides = legalMovesMap.get(tile.id);
              const isLegal = Boolean(isHumanTurn && sides && sides.length > 0);
              const singleValidSide = sides && sides.length === 1 ? sides[0] : null;
              return (
                <View
                  key={tile.id}
                  style={{ marginLeft: idx === 0 ? 0 : handOverlap }}
                >
                  <GestureHandTile
                    tile={tile}
                    unit={handTileUnit}
                    isLegal={isLegal}
                    isSelected={effectiveSelectedId === tile.id}
                    isDraggingThis={draggingTile?.id === tile.id}
                    singleValidSide={singleValidSide}
                    tileStyleId={tileStyleId}
                    dragX={dragX}
                    dragY={dragY}
                    dragActive={dragActive}
                    dragTilt={dragTilt}
                    rootOriginX={rootOriginX}
                    rootOriginY={rootOriginY}
                    onDragBegin={handleDragBegin}
                    onDragHoverCheck={handleDragHoverCheck}
                    onDragCommit={handleDragCommit}
                    onSingleTap={handleSingleTap}
                    onDoubleTapQuickPlay={handleDoubleTapQuickPlay}
                  />
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {/* UI-Thread 120Hz Floating Dragged Tile Overlay */}
        <Animated.View
          pointerEvents="none"
          style={[styles.floatingDragTile, floatingTileStyle]}
        >
          {draggingTile && (
            <DominoTile
              a={draggingTile.a}
              b={draggingTile.b}
              orientation="vertical"
              unit={42}
              selected
              tileStyleId={tileStyleId}
            />
          )}
        </Animated.View>

        <BoneyardDrawer
          visible={boneyardOpen}
          handNumber={state.handNumber}
          boneyardCount={state.boneyard.length}
          leftEnd={state.leftEnd}
          rightEnd={state.rightEnd}
          canDraw={mustDraw}
          tileStyleId={tileStyleId}
          onDrawIndex={onHumanDraw}
          onClose={() => setBoneyardOpen(false)}
        />

        <PauseModal
          visible={pauseOpen}
          handNumber={state.handNumber}
          targetScore={state.targetScore}
          sortMode={state.sortMode}
          soundEnabled={state.soundEnabled}
          botSpeed={botSpeed}
          aiDifficulty={aiDifficulty}
          onResume={() => setPauseOpen(false)}
          onOpenHistory={() => {
            setPauseOpen(false);
            setHistoryOpen(true);
          }}
          onToggleSort={() =>
            onToggleSort(state.sortMode === 'value' ? 'doubles' : 'value')
          }
          onToggleSound={onToggleSound}
          onCycleBotSpeed={onCycleBotSpeed}
          onCycleAiDifficulty={onCycleAiDifficulty}
          onOpenFeedback={() => {
            setPauseOpen(false);
            onOpenFeedback();
          }}
          onRestartMatch={() => {
            setPauseOpen(false);
            onRestartMatch();
          }}
          onExitToHome={() => {
            setPauseOpen(false);
            onExitToHome();
          }}
        />

        <HistoryModal
          visible={historyOpen}
          mode={state.mode}
          handNumber={state.handNumber}
          history={state.history}
          onClose={() => setHistoryOpen(false)}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootInner: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 6,
    position: 'relative',
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    zIndex: 30,
  },
  cornerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CLUB.glassBg,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLUB.glassBg,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  teamNosotros: {
    color: CLUB.emerald,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  teamDivider: {
    color: CLUB.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  teamRivales: {
    color: CLUB.coral,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  teamGoal: {
    color: CLUB.textMuted,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  fourPlayerArc: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    zIndex: 28,
  },
  boardWrap: {
    flex: 1,
    minHeight: 180,
    position: 'relative',
    zIndex: 10,
  },
  pozoWrap: {
    position: 'absolute',
    left: 10,
    bottom: 12,
    zIndex: 30,
  },
  pozoBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1D4ED8',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 4,
    borderBottomColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.45)',
  },
  pozoBtnActive: {
    backgroundColor: CLUB.amber,
    borderColor: '#FFFBEB',
    borderBottomColor: CLUB.amberDark,
    boxShadow: '0px 0px 18px rgba(255, 146, 64, 0.75)',
  },
  pozoBtnEmpty: {
    backgroundColor: '#334155',
    borderColor: '#64748B',
    borderBottomColor: '#1E293B',
    opacity: 0.6,
  },
  pozoCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E3A5F',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 218, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pozoCountBadgeActive: {
    backgroundColor: CLUB.coral,
    borderColor: '#FFFFFF',
  },
  pozoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  toastWrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 35,
  },
  toastPill: {
    backgroundColor: CLUB.glassBgStrong,
    borderWidth: 1,
    borderColor: CLUB.gold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  toastText: {
    color: CLUB.goldSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  bottomHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 26,
  },
  passBtn: {
    backgroundColor: '#D97706',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.45)',
    borderBottomWidth: 4,
    borderBottomColor: '#92400E',
    paddingHorizontal: 18,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  tacticalChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pipSumChip: {
    backgroundColor: CLUB.glassBg,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 38,
    justifyContent: 'center',
  },
  pipSumText: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sortChip: {
    backgroundColor: CLUB.glassBg,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 38,
    justifyContent: 'center',
  },
  sortChipText: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  woodRack: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CLUB.woodHighlight,
    borderBottomWidth: 5,
    borderBottomColor: '#251004',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
    minHeight: 96,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  woodRackLandscape: {
    paddingTop: 6,
    paddingBottom: 6,
    minHeight: 74,
  },
  rackTrim: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: 'rgba(255, 224, 178, 0.2)',
    borderRadius: 1,
  },
  handFlexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  floatingDragTile: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 120,
    elevation: 24,
  },
});
