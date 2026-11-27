import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { CloseIcon, StarIcon } from './Icons';

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

/**
 * Physical wooden side-drawer boneyard ("Pozo") matching North Star N8.
 * - Clean header layout (fixes U19: X never overlaps title) and 44x44 close touch target (fixes U18).
 * - `statusBarTranslucent` for edge-to-edge Android modals (fixes T8).
 * - Tracks tapped physical cutouts without effect-driven setState (React Compiler clean).
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
          colors={[CLUB.woodLight, CLUB.woodMid, CLUB.woodDark]}
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
                      styles.backTile,
                      !canDraw && styles.backTileDisabled,
                      pressed && canDraw && { transform: [{ scale: 0.92 }] },
                    ]}
                  >
                    <View style={styles.backTileInner}>
                      <StarIcon size={16} color={CLUB.gold} filled />
                    </View>
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
    backgroundColor: 'rgba(6, 12, 24, 0.62)',
  },
  drawer: {
    width: 214,
    borderRightWidth: 4,
    borderRightColor: CLUB.woodDark,
    paddingTop: 56,
    paddingHorizontal: 14,
    paddingBottom: 24,
    boxShadow: '6px 0px 20px rgba(0, 0, 0, 0.55)',
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
    backgroundColor: CLUB.glassBgStrong,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 28,
  },
  backTile: {
    width: 50,
    height: 82,
    borderRadius: 10,
    backgroundColor: '#7A1B2A',
    borderWidth: 1.5,
    borderColor: '#C96A7A',
    borderBottomWidth: 4,
    borderBottomColor: '#450B14',
    padding: 5,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.45)',
  },
  backTileDisabled: {
    opacity: 0.48,
  },
  backTileInner: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 204, 102, 0.55)',
    backgroundColor: 'rgba(245, 196, 81, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: 50,
    height: 82,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 10, 4, 0.24)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 224, 178, 0.18)',
  },
});
