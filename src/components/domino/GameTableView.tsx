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
  Easing,
  FadeInDown,
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
import { TABLE_REACTIONS, TableReactionCode } from '@/constants/socialReactions';
import { TABLE_THEMES, TableThemeId } from '@/constants/tableThemes';
import { getTileStyle, TileStyleId } from '@/constants/tileStyles';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { AiDifficulty } from '@/engine/ai';
import {
  canDrawFromBoneyard,
  getLegalMovesForSeat,
  handPipSum,
  sortHand,
} from '@/engine/rules';
import { GameState, PlaySide, SortMode, Tile } from '@/engine/types';
import { hapticLight, hapticSnap, playGameSound } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { BoardCanvas, BoardRect, DropZoneTarget } from './BoardCanvas';
import { BoneyardDrawer } from './BoneyardDrawer';
import { DominoTile } from './DominoTile';
import {
  BoneyardTilesIcon,
  MessageIcon,
  PauseIcon,
  SoundOffIcon,
  SoundOnIcon,
} from './Icons';
import { BotSpeed, PauseModal } from './PauseModal';
import { SeatAvatar } from './SeatAvatar';

export interface HandEndMomentData {
  reason: 'domino' | 'tranca' | 'tranca_tie';
  winnerName: string | null;
  points: number;
  winnerAvatar?: AvatarConfig;
  isWinnerBot: boolean;
  winnerSeatHint?: number;
  accentColor: string;
}

interface GameTableViewProps {
  state: GameState;
  turnSecondsLeft: number | null;
  humanTurnTotalSeconds: number;
  botTimerProgress: number;
  botSpeed: BotSpeed;
  aiDifficulty?: AiDifficulty;
  seatMoods: Record<number, BotMood>;
  seatAvatars?: Record<number, AvatarConfig | undefined>;
  seatIsHuman?: Record<number, boolean>;
  seatNames?: Record<number, string>;
  seatReactions?: Record<number, string | null>;
  handEndMoment?: HandEndMomentData | null;
  themeId?: TableThemeId;
  tileStyleId?: TileStyleId;
  playerAvatarConfig?: AvatarConfig;
  onHumanPlay: (tileId: string, side: PlaySide) => void;
  onHumanDraw: (boneyardIndex?: number) => void;
  onHumanPass: () => void;
  onSendReaction?: (code: TableReactionCode) => void;
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
  index: number;
  handNumber: number;
  unit: number;
  isHumanTurn: boolean;
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
  index,
  handNumber,
  unit,
  isHumanTurn,
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
  const dealOffset = useSharedValue(-14);
  const dealOpacity = useSharedValue(0);

  useEffect(() => {
    dealOffset.value = -14;
    dealOpacity.value = 0;
    const delay = Math.min(index * 32, 240);
    const t = setTimeout(() => {
      dealOffset.value = withTiming(0, {
        duration: 210,
        easing: Easing.out(Easing.cubic),
      });
      dealOpacity.value = withTiming(1, { duration: 180 });
    }, delay);
    return () => clearTimeout(t);
  }, [handNumber, index, dealOffset, dealOpacity]);

  const dealStyle = useAnimatedStyle(() => ({
    opacity: isDraggingThis ? 0.14 : dealOpacity.value,
    transform: [{ translateY: dealOffset.value }],
  }));

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
      <Animated.View style={dealStyle}>
        <DominoTile
          a={tile.a}
          b={tile.b}
          orientation="vertical"
          unit={unit}
          playable={isLegal}
          dimmed={isHumanTurn && !isLegal}
          resting={!isHumanTurn}
          selected={isSelected && !isDraggingThis}
          tileStyleId={tileStyleId}
        />
      </Animated.View>
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
  seatAvatars,
  seatIsHuman,
  seatNames,
  seatReactions,
  handEndMoment = null,
  themeId = 'caribe',
  tileStyleId = 'marfil',
  playerAvatarConfig,
  onHumanPlay,
  onHumanDraw,
  onHumanPass,
  onSendReaction,
  onToggleSort,
  onToggleSound,
  onCycleBotSpeed,
  onCycleAiDifficulty,
  onPauseChange,
  onOpenFeedback,
  onRestartMatch,
  onExitToHome,
}: GameTableViewProps) {
  const { palette } = usePalette();
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape = winW > winH;

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [draggingTile, setDraggingTile] = useState<Tile | null>(null);
  const [hoverSide, setHoverSide] = useState<PlaySide | null>(null);
  const [boneyardOpen, setBoneyardOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
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
  const equippedTileCfg = getTileStyle(tileStyleId);

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
          withTiming(1.08, { duration: 450 }),
          withTiming(1.0, { duration: 450 })
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
      showToast('Tienes jugada en tu mano');
      return;
    }
    hapticLight();
    setBoneyardOpen(true);
  };

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
  const resolveSeatProfile = (seatIdx: number) => {
    const base = getSeatProfile(state.mode, seatIdx);
    const isBot = seatIsHuman ? !seatIsHuman[seatIdx] : base.isBot;
    const displayName =
      seatNames?.[seatIdx] && !seatNames[seatIdx].startsWith('CPU')
        ? seatNames[seatIdx]
        : base.displayName;
    const avatarConfig =
      seatIdx === 0
        ? playerAvatarConfig
        : seatAvatars?.[seatIdx] ?? base.avatarConfig;
    return { profile: { ...base, isBot, displayName }, avatarConfig };
  };
  const humanTimerProgress =
    isHumanTurn && turnSecondsLeft !== null
      ? turnSecondsLeft / humanTurnTotalSeconds
      : 1;

  const handleRackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - rackWidth) > 2) setRackWidth(w);
  };

  const opponent1 = !isFourPlayers ? resolveSeatProfile(1) : null;

  return (
    <LinearGradient
      colors={[palette.tableRoomTop, palette.tableRoomMid, palette.tableRoomBottom]}
      locations={[0, 0.5, 1]}
      style={styles.root}
      onLayout={measureRootOrigin}
    >
      <View ref={rootRef} style={styles.rootInner}>
        {/* Top Row: Controls + Shared 2v2 Team Score (or 1v1 Rival on right) */}
        <View style={styles.topUtilityRow}>
          <View style={styles.cornerControls}>
            <Pressable
              onPress={() => {
                hapticLight();
                setPauseOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Menú de pausa"
              style={({ pressed }) => [
                styles.iconCircle,
                {
                  backgroundColor: palette.hudPillBg,
                  borderColor: palette.hudPillBorder,
                },
                pressed && { opacity: 0.78 },
              ]}
            >
              <PauseIcon size={18} color={palette.hudPillText} />
            </Pressable>

            <Pressable
              onPress={() => {
                hapticLight();
                onToggleSound();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                state.soundEnabled ? 'Silenciar sonido' : 'Activar sonido'
              }
              style={({ pressed }) => [
                styles.iconCircle,
                {
                  backgroundColor: palette.hudPillBg,
                  borderColor: palette.hudPillBorder,
                },
                pressed && { opacity: 0.78 },
              ]}
            >
              {state.soundEnabled ? (
                <SoundOnIcon size={18} color={palette.accent} />
              ) : (
                <SoundOffIcon size={18} color={palette.textMuted} />
              )}
            </Pressable>
          </View>

          {is2v2 && (
            <View
              style={[
                styles.teamScorePill,
                {
                  backgroundColor: palette.hudPillBg,
                  borderColor: palette.hudPillBorder,
                },
              ]}
            >
              <Text style={[styles.teamNosotros, { color: palette.accent }]}>
                NOS {state.scores[0]}
              </Text>
              <Text style={[styles.teamDivider, { color: palette.textMuted }]}>·</Text>
              <Text
                style={[
                  styles.teamRivales,
                  { color: palette.isDark ? CLUB.coral : palette.brandAccent },
                ]}
              >
                RIV {state.scores[1]}
              </Text>
              <Text style={[styles.teamGoal, { color: palette.textMuted }]}>
                /{state.targetScore}
              </Text>
            </View>
          )}

          {!isFourPlayers && opponent1 && (
            <SeatAvatar
              profile={opponent1.profile}
              tileCount={state.players[1].hand.length}
              score={state.scores[1] ?? 0}
              targetScore={state.targetScore}
              isActiveTurn={state.currentTurnSeat === 1}
              timerProgress={botTimerProgress}
              lastAction={state.players[1].lastAction}
              reactionText={seatReactions?.[1] ?? null}
              mood={seatMoods[1] ?? 'idle'}
              avatarConfig={opponent1.avatarConfig}
              layout="horizontal"
              bubbleAnchor="below-right"
            />
          )}
        </View>

        {/* 4-Player Clockwise Opponent Arc ABOVE the table */}
        {isFourPlayers && (
          <View style={styles.fourPlayerArc}>
            {[1, 2, 3].map((seatIdx) => {
              const p = state.players[seatIdx];
              const resolved = resolveSeatProfile(seatIdx);
              const arcAnchor =
                seatIdx === 1
                  ? 'below-left'
                  : seatIdx === 3
                  ? 'below-right'
                  : 'below';
              return (
                <SeatAvatar
                  key={seatIdx}
                  profile={resolved.profile}
                  tileCount={p.hand.length}
                  score={state.scores[p.teamId] ?? 0}
                  targetScore={state.targetScore}
                  showScore={!is2v2}
                  isActiveTurn={state.currentTurnSeat === seatIdx}
                  timerProgress={botTimerProgress}
                  lastAction={p.lastAction}
                  reactionText={seatReactions?.[seatIdx] ?? null}
                  mood={seatMoods[seatIdx] ?? 'idle'}
                  avatarConfig={resolved.avatarConfig}
                  layout="stacked"
                  bubbleAnchor={arcAnchor}
                />
              );
            })}
          </View>
        )}

        {/* 100% FULL-WIDTH Table Board */}
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

          {/* Tactile Porcelain Boneyard ("Pozo") Pill in 1v1 */}
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
                <BoneyardTilesIcon
                  size={25}
                  faceColor={equippedTileCfg.backGradient[1]}
                  strokeColor={equippedTileCfg.backBorderColor}
                  inlayColor={equippedTileCfg.backFiligreeStroke}
                />
                <View style={styles.pozoMetaCol}>
                  <Text
                    style={[
                      styles.pozoLabel,
                      mustDraw && { color: '#231703' },
                    ]}
                  >
                    POZO
                  </Text>
                  <Text
                    style={[
                      styles.pozoCountText,
                      mustDraw && { color: '#231703' },
                    ]}
                  >
                    {state.boneyard.length}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {toastText && (
            <View style={styles.toastWrap} pointerEvents="none">
              <View
                style={[
                  styles.toastPill,
                  {
                    backgroundColor: palette.modalBg,
                    borderColor: palette.brandAccent,
                  },
                ]}
              >
                <Text style={[styles.toastText, { color: palette.textPrimary }]}>
                  {toastText}
                </Text>
              </View>
            </View>
          )}

          {/* Signature Moment Overlay (~0.95s celebration over live board before RoundSummary) */}
          {handEndMoment && (
            <View style={styles.signatureOverlay} pointerEvents="none">
              <View
                style={[
                  styles.signatureCard,
                  {
                    backgroundColor: palette.modalBg,
                    borderColor: palette.winnerCardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.signatureAvatarRing,
                    {
                      borderColor:
                        handEndMoment.reason === 'tranca_tie'
                          ? palette.textSecondary
                          : palette.winnerCardBorder,
                    },
                  ]}
                >
                  <AvatarIllustration
                    isBot={handEndMoment.isWinnerBot}
                    seatHint={handEndMoment.winnerSeatHint ?? 1}
                    accentColor={handEndMoment.accentColor}
                    mood={handEndMoment.reason === 'tranca_tie' ? 'idle' : 'win'}
                    size={56}
                    avatarConfig={handEndMoment.winnerAvatar}
                  />
                </View>
                <Text
                  style={[styles.signatureTitle, { color: palette.winnerText }]}
                >
                  {handEndMoment.reason === 'domino'
                    ? '¡DOMINÓ!'
                    : handEndMoment.reason === 'tranca'
                    ? '¡TRANCA!'
                    : '¡EMPATE!'}
                </Text>
                <Text
                  style={[styles.signatureSub, { color: palette.textPrimary }]}
                >
                  {handEndMoment.reason === 'tranca_tie'
                    ? 'Mano nula · Siguiente reparto'
                    : `${handEndMoment.winnerName ?? 'Ganador'} · +${
                        handEndMoment.points
                      } pts`}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom HUD: Human Seat Avatar + Sobremesa Reactions + Tactical Pip Sum / Pass CTA */}
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
            reactionText={seatReactions?.[0] ?? null}
            mood={seatMoods[0] ?? 'idle'}
            avatarConfig={playerAvatarConfig}
            layout="horizontal"
            bubbleAnchor="above-left"
          />

          {mustPass ? (
            <Pressable
              onPress={onHumanPass}
              style={({ pressed }) => [
                styles.passBtn,
                pressed && { opacity: 0.9, transform: [{ translateY: 1.5 }] },
              ]}
            >
              <Text style={styles.passBtnText}>Pasar turno</Text>
            </Pressable>
          ) : (
            <View style={styles.tacticalChips}>
              {onSendReaction && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setReactionsOpen((v) => !v);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar saludo o reacción de mesa"
                  style={[
                    styles.reactToggleBtn,
                    {
                      backgroundColor: reactionsOpen
                        ? palette.brandAccent
                        : palette.hudPillBg,
                      borderColor: reactionsOpen
                        ? palette.brandAccent
                        : palette.borderWarm,
                    },
                  ]}
                >
                  <MessageIcon
                    size={16}
                    color={
                      reactionsOpen
                        ? palette.isDark
                          ? '#231703'
                          : '#FFFFFF'
                        : palette.brandAccent
                    }
                  />
                </Pressable>
              )}
              <View
                style={[
                  styles.pipSumChip,
                  {
                    backgroundColor: palette.hudPillBg,
                    borderColor: palette.hudPillBorder,
                  },
                ]}
              >
                <Text style={[styles.pipSumText, { color: palette.textSecondary }]}>
                  {myPipSum} pts
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onToggleSort(state.sortMode === 'value' ? 'doubles' : 'value');
                }}
                accessibilityRole="button"
                accessibilityLabel="Cambiar orden de fichas"
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: palette.hudPillBg,
                    borderColor: palette.hudPillBorder,
                  },
                ]}
              >
                <Text style={[styles.sortChipText, { color: palette.hudPillText }]}>
                  {state.sortMode === 'value' ? '1-6' : 'Dobles'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Lacquered Wood Hand Rack — Warm Turn Glow on Top Inlay */}
        <LinearGradient
          colors={[activeTheme.rackTop, activeTheme.rackBottom]}
          style={[
            styles.woodRack,
            isHumanTurn && styles.woodRackActiveTurn,
            isLandscape && styles.woodRackLandscape,
          ]}
          onLayout={handleRackLayout}
        >
          <View
            style={[
              styles.rackTrim,
              isHumanTurn && styles.rackTrimActiveTurn,
            ]}
            pointerEvents="none"
          />
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
                    index={idx}
                    handNumber={state.handNumber}
                    unit={handTileUnit}
                    isHumanTurn={isHumanTurn}
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

        {/* Floating Sobremesa Reactions Popover (NEVER shifts or rescales BoardCanvas!) */}
        {reactionsOpen && onSendReaction && (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setReactionsOpen(false)}
            />
            <Animated.View
              entering={FadeInDown.duration(150)}
              style={[
                styles.reactionPopover,
                {
                  backgroundColor: palette.modalBg,
                  borderColor: palette.modalBorder,
                },
              ]}
            >
              {TABLE_REACTIONS.map((item) => (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    hapticLight();
                    playGameSound('pickup', state.soundEnabled);
                    setReactionsOpen(false);
                    onSendReaction(item.code);
                  }}
                  style={({ pressed }) => [
                    styles.reactionChip,
                    {
                      backgroundColor: palette.modalCardBg,
                      borderColor: palette.modalCardBorder,
                      borderBottomColor: palette.modalCardLip,
                    },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                  ]}
                >
                  <Text
                    style={[styles.reactionChipText, { color: palette.textPrimary }]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}

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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  teamNosotros: {
    fontFamily: FONT.display,
    fontSize: 13.5,
    fontVariant: ['tabular-nums'],
  },
  teamDivider: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
  },
  teamRivales: {
    fontFamily: FONT.display,
    fontSize: 13.5,
    fontVariant: ['tabular-nums'],
  },
  teamGoal: {
    fontFamily: FONT.bold,
    fontSize: 12,
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
    bottom: 10,
    zIndex: 30,
  },
  pozoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 10, 5, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 214, 138, 0.42)',
    borderBottomWidth: 3.5,
    borderBottomColor: '#140802',
    paddingHorizontal: 10,
    paddingVertical: 6,
    boxShadow: '0px 5px 12px rgba(0, 0, 0, 0.42)',
  },
  pozoBtnActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFF8E0',
    borderBottomColor: '#B57C0E',
    boxShadow: '0px 0px 18px rgba(245, 196, 81, 0.72)',
  },
  pozoBtnEmpty: {
    opacity: 0.45,
  },
  pozoMetaCol: {
    alignItems: 'flex-start',
  },
  pozoLabel: {
    fontFamily: FONT.extraBold,
    color: '#D8C7A6',
    fontSize: 8.5,
    letterSpacing: 0.7,
  },
  pozoCountText: {
    fontFamily: FONT.display,
    color: '#FFFDF7',
    fontSize: 14,
    lineHeight: 16,
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
    borderWidth: 1.25,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.35)',
  },
  toastText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  bottomHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 26,
  },
  passBtn: {
    backgroundColor: '#F09624',
    borderRadius: 15,
    borderWidth: 1.25,
    borderColor: '#FDE68A',
    borderBottomWidth: 4,
    borderBottomColor: '#A15A07',
    paddingHorizontal: 18,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passBtnText: {
    fontFamily: FONT.display,
    color: '#231402',
    fontSize: 14.5,
  },
  tacticalChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pipSumChip: {
    borderWidth: 1.25,
    borderRadius: 11,
    paddingHorizontal: 10,
    minHeight: 38,
    justifyContent: 'center',
  },
  pipSumText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  sortChip: {
    borderWidth: 1.25,
    borderRadius: 11,
    paddingHorizontal: 12,
    minHeight: 38,
    justifyContent: 'center',
  },
  sortChipText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  woodRack: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: CLUB.woodHighlight,
    borderBottomWidth: 5,
    borderBottomColor: '#251004',
    paddingTop: 13,
    paddingBottom: 8,
    paddingHorizontal: 8,
    minHeight: 98,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  woodRackActiveTurn: {
    borderColor: 'rgba(255, 224, 130, 0.58)',
  },
  woodRackLandscape: {
    paddingTop: 7,
    paddingBottom: 6,
    minHeight: 76,
  },
  rackTrim: {
    position: 'absolute',
    top: 3,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: 'rgba(255, 224, 178, 0.22)',
    borderRadius: 1,
  },
  rackTrimActiveTurn: {
    backgroundColor: 'rgba(255, 214, 102, 0.72)',
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
  reactToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionPopover: {
    position: 'absolute',
    right: 10,
    bottom: 158,
    width: 304,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 10,
    zIndex: 75,
    boxShadow: '0px 14px 32px rgba(0, 0, 0, 0.52)',
  },
  reactionChip: {
    width: '48.5%',
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  reactionChipText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    textAlign: 'center',
  },
  signatureOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(5, 14, 19, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  signatureCard: {
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderRadius: 26,
    paddingHorizontal: 30,
    paddingVertical: 18,
    boxShadow: '0px 10px 38px rgba(0, 0, 0, 0.48)',
  },
  signatureAvatarRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2.5,
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
  },
  signatureTitle: {
    fontFamily: FONT.display,
    fontSize: 28,
    letterSpacing: 1.4,
  },
  signatureSub: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
});
