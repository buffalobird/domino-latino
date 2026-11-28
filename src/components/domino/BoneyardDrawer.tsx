import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { getTileStyle, TileStyleId } from '@/constants/tileStyles';
import { CLUB, FONT } from '@/constants/tokens';
import { CloseIcon } from './Icons';

interface BoneyardDrawerProps {
  visible: boolean;
  handNumber: number;
  boneyardCount: number;
  leftEnd: number | null;
  rightEnd: number | null;
  canDraw: boolean;
  tileStyleId?: TileStyleId;
  onDrawIndex: (index: number) => void;
  onClose: () => void;
}

const INITIAL_SLOTS = 14;

function PorcelainBackWatermark({
  strokeColor,
  fillColor,
}: {
  strokeColor: string;
  fillColor: string;
}) {
  return (
    <Svg width={36} height={64} viewBox="0 0 36 64" fill="none">
      <Rect
        x={2}
        y={2}
        width={32}
        height={60}
        rx={6}
        stroke={strokeColor}
        strokeWidth={1}
        opacity={0.78}
      />
      <Path
        d="M18 17L26 32L18 47L10 32L18 17Z"
        stroke={strokeColor}
        strokeWidth={1.1}
        fill={fillColor}
      />
      <Path
        d="M18 24L22.5 32L18 40L13.5 32L18 24Z"
        stroke={strokeColor}
        strokeWidth={0.9}
      />
    </Svg>
  );
}

/**
 * Physical mahogany side-drawer boneyard ("Pozo") that slides smoothly from the left rail
 * with authentic porcelain domino backs matched to the player's equipped tile set.
 */
export function BoneyardDrawer({
  visible,
  handNumber,
  boneyardCount,
  leftEnd,
  rightEnd,
  canDraw,
  tileStyleId = 'marfil',
  onDrawIndex,
  onClose,
}: BoneyardDrawerProps) {
  const tileStyle = getTileStyle(tileStyleId);
  const slideX = useSharedValue(-230);

  useEffect(() => {
    if (visible) {
      slideX.value = -230;
      slideX.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      slideX.value = -230;
    }
  }, [visible, slideX]);

  const drawerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const [removedByHand, setRemovedByHand] = useState<{
    hand: number;
    removed: number[];
  }>({ hand: handNumber, removed: [] });

  const removedSet = new Set(
    removedByHand.hand === handNumber ? removedByHand.removed : []
  );

  const occupied: boolean[] = Array.from(
    { length: INITIAL_SLOTS },
    (_, i) => !removedSet.has(i)
  );
  let currentTrue = occupied.filter(Boolean).length;
  for (let i = INITIAL_SLOTS - 1; i >= 0 && currentTrue > boneyardCount; i--) {
    if (occupied[i]) {
      occupied[i] = false;
      currentTrue--;
    }
  }

  const handleTapSlot = (slotIdx: number) => {
    if (!canDraw || !occupied[slotIdx]) return;
    let compactIndex = 0;
    for (let i = 0; i < slotIdx; i++) {
      if (occupied[i]) compactIndex++;
    }
    setRemovedByHand((prev) => ({
      hand: handNumber,
      removed: prev.hand === handNumber ? [...prev.removed, slotIdx] : [slotIdx],
    }));
    onDrawIndex(compactIndex);
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.drawerOuter, drawerAnimStyle]}>
          <LinearGradient
            colors={[CLUB.woodMid, '#5D3014', CLUB.woodDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.9 }}
            style={styles.drawer}
          >
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>POZO · {boneyardCount}</Text>
                {leftEnd !== null && rightEnd !== null ? (
                  <Text style={styles.sub}>
                    Buscas: {leftEnd === rightEnd ? leftEnd : `${leftEnd} ó ${rightEnd}`}
                  </Text>
                ) : (
                  <Text style={styles.sub}>Toca una ficha</Text>
                )}
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar pozo"
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.8 }]}
              >
                <CloseIcon size={17} color="#FFFDF7" />
              </Pressable>
            </View>

            {boneyardCount === 0 ? (
              <Text style={styles.empty}>Pozo vacío</Text>
            ) : (
              <ScrollView
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
              >
                {occupied.map((isPresent, slotIdx) =>
                  isPresent ? (
                    <Pressable
                      key={slotIdx}
                      disabled={!canDraw}
                      onPress={() => handleTapSlot(slotIdx)}
                      accessibilityRole="button"
                      accessibilityLabel={`Robar ficha ${slotIdx + 1}`}
                      style={({ pressed }) => [
                        styles.backTileWrap,
                        !canDraw && styles.backTileDisabled,
                        pressed &&
                          canDraw && {
                            transform: [{ scale: 0.94 }, { translateY: 2 }],
                          },
                      ]}
                    >
                      <LinearGradient
                        colors={tileStyle.backGradient}
                        locations={[0, 0.55, 1]}
                        start={{ x: 0.1, y: 0 }}
                        end={{ x: 0.9, y: 1 }}
                        style={[
                          styles.backTile,
                          {
                            borderColor: tileStyle.backBorderColor,
                            borderBottomColor: tileStyle.backLipColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.backSpecular,
                            { borderTopColor: tileStyle.specularColor },
                          ]}
                          pointerEvents="none"
                        />
                        <PorcelainBackWatermark
                          strokeColor={tileStyle.backFiligreeStroke}
                          fillColor={tileStyle.backFiligreeFill}
                        />
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <View key={slotIdx} style={styles.emptySlot} />
                  )
                )}
              </ScrollView>
            )}
          </LinearGradient>
        </Animated.View>

        <Pressable style={styles.dismissArea} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 13, 18, 0.62)',
  },
  drawerOuter: {
    width: 224,
    height: '100%',
  },
  drawer: {
    flex: 1,
    borderRightWidth: 3,
    borderRightColor: 'rgba(245, 204, 102, 0.36)',
    paddingTop: 54,
    paddingHorizontal: 14,
    paddingBottom: 24,
    boxShadow: '10px 0px 28px rgba(0, 0, 0, 0.62)',
  },
  dismissArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(26, 12, 5, 0.72)',
    paddingLeft: 13,
    paddingRight: 6,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.42)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: FONT.display,
    color: CLUB.gold,
    fontSize: 15.5,
    letterSpacing: 0.6,
    fontVariant: ['tabular-nums'],
  },
  sub: {
    fontFamily: FONT.bold,
    color: '#EAD7B7',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 248, 230, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: FONT.display,
    color: CLUB.goldSoft,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    justifyContent: 'center',
    paddingBottom: 28,
  },
  backTileWrap: {
    borderRadius: 11,
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.45)',
  },
  backTile: {
    width: 50,
    height: 82,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#DFD2BC',
    borderBottomWidth: 5,
    borderBottomColor: '#B5A287',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backSpecular: {
    position: 'absolute',
    top: 0.5,
    left: 2,
    right: 2,
    height: '42%',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 9,
  },
  backTileDisabled: {
    opacity: 0.48,
  },
  emptySlot: {
    width: 50,
    height: 82,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 7, 2, 0.34)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 224, 178, 0.18)',
  },
});
