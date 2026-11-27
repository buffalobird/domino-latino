import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { CLUB } from '@/constants/tokens';
import { CloseIcon } from './Icons';

interface BoneyardDrawerProps {
  visible: boolean;
  handNumber: number;
  boneyardCount: number;
  leftEnd: number | null;
  rightEnd: number | null;
  canDraw: boolean;
  onDrawIndex: (index: number) => void;
  onClose: () => void;
}

const INITIAL_SLOTS = 14;

/** Subtle tonal porcelain back engraving (geometric diamond filigree — authentic tournament ivory look) */
function PorcelainBackWatermark() {
  return (
    <Svg width={36} height={64} viewBox="0 0 36 64" fill="none">
      <Rect
        x={2}
        y={2}
        width={32}
        height={60}
        rx={6}
        stroke="#D4C5AA"
        strokeWidth={1}
      />
      <Path
        d="M18 17L26 32L18 47L10 32L18 17Z"
        stroke="#CBB999"
        strokeWidth={1.1}
        fill="rgba(212, 197, 170, 0.14)"
      />
      <Path
        d="M18 24L22.5 32L18 40L13.5 32L18 24Z"
        stroke="#C4B08D"
        strokeWidth={0.9}
      />
    </Svg>
  );
}

/**
 * Physical wooden side-drawer boneyard ("Pozo") with authentic solid porcelain ivory domino backs
 * contrasting sharply against lacquered mahogany wood.
 */
export function BoneyardDrawer({
  visible,
  handNumber,
  boneyardCount,
  leftEnd,
  rightEnd,
  canDraw,
  onDrawIndex,
  onClose,
}: BoneyardDrawerProps) {
  // Store removed visual slots per handNumber
  const [removedByHand, setRemovedByHand] = useState<{
    hand: number;
    removed: number[];
  }>({ hand: handNumber, removed: [] });

  const removedSet = new Set(
    removedByHand.hand === handNumber ? removedByHand.removed : []
  );

  // Derive occupied array cleanly during render (no setState inside useEffect!)
  const occupied: boolean[] = Array.from({ length: INITIAL_SLOTS }, (_, i) => !removedSet.has(i));
  let currentTrue = occupied.filter(Boolean).length;
  // Sync down if Bot drew tiles from boneyard
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
                <Text style={styles.sub}>Elige una ficha</Text>
              )}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar pozo"
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.8 }]}
            >
              <CloseIcon size={18} color="#FFFFFF" />
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
                      pressed && canDraw && { transform: [{ scale: 0.93 }, { translateY: 2 }] },
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#FBF6EC', '#E7DBC3']}
                      locations={[0, 0.55, 1]}
                      start={{ x: 0.1, y: 0 }}
                      end={{ x: 0.9, y: 1 }}
                      style={styles.backTile}
                    >
                      <View style={styles.backSpecular} pointerEvents="none" />
                      <PorcelainBackWatermark />
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <View key={slotIdx} style={styles.emptySlot} />
                )
              )}
            </ScrollView>
          )}
        </LinearGradient>

        <Pressable style={styles.dismissArea} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(6, 12, 24, 0.65)',
  },
  drawer: {
    width: 218,
    borderRightWidth: 3,
    borderRightColor: 'rgba(245, 204, 102, 0.28)',
    paddingTop: 56,
    paddingHorizontal: 14,
    paddingBottom: 24,
    boxShadow: '8px 0px 24px rgba(0, 0, 0, 0.6)',
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
    backgroundColor: 'rgba(10, 20, 38, 0.86)',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: CLUB.gold,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  sub: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: CLUB.goldSoft,
    fontSize: 14,
    fontWeight: '800',
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
    borderColor: 'rgba(255, 224, 178, 0.16)',
  },
});
