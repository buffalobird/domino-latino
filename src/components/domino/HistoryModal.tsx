import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getSeatProfile } from '@/constants/seatProfiles';
import { CLUB } from '@/constants/tokens';
import { GameMode, HistoryEntry } from '@/engine/types';
import { CloseIcon } from './Icons';

interface HistoryModalProps {
  visible: boolean;
  mode: GameMode;
  handNumber: number;
  history: HistoryEntry[];
  onClose: () => void;
}

export function HistoryModal({
  visible,
  mode,
  handNumber,
  history,
  onClose,
}: HistoryModalProps) {
  const formatEntry = (entry: HistoryEntry): string => {
    if (entry.seat < 0) return entry.message;
    const displayName = getSeatProfile(mode, entry.seat).displayName;
    if (entry.type === 'play' && entry.tile) {
      const sideLabel =
        entry.side === 'start'
          ? 'salida'
          : entry.side === 'left'
          ? 'izquierda'
          : 'derecha';
      return `${displayName} jugó ${entry.tile.a}-${entry.tile.b} (${sideLabel})`;
    }
    if (entry.type === 'draw') {
      return `${displayName} robó ficha del pozo`;
    }
    if (entry.type === 'pass') {
      return entry.openEndsAtPass
        ? `${displayName} pasó (${entry.openEndsAtPass[0]} · ${entry.openEndsAtPass[1]})`
        : `${displayName} pasó`;
    }
    return entry.message;
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabHandle} />
          <View style={styles.header}>
            <Text style={styles.title}>Historial · Mano #{handNumber}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar historial"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          {history.length === 0 ? (
            <Text style={styles.empty}>Sin jugadas todavía en esta mano.</Text>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {history.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.row,
                    entry.type === 'pass' && styles.rowPass,
                    entry.type === 'draw' && styles.rowDraw,
                    entry.type === 'redeal' && styles.rowRedeal,
                  ]}
                >
                  <Text style={styles.num}>
                    {entry.moveNumber > 0 ? `#${entry.moveNumber}` : '•'}
                  </Text>
                  <Text style={styles.msg}>{formatEntry(entry)}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 24, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(14, 28, 52, 0.97)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '72%',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1.25,
    borderColor: 'rgba(148, 190, 255, 0.28)',
  },
  grabHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: CLUB.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
    textAlign: 'center',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 6,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CLUB.surfaceCardLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowPass: {
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  rowDraw: {
    backgroundColor: 'rgba(245, 196, 81, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.3)',
  },
  rowRedeal: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  num: {
    color: CLUB.textMuted,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    width: 28,
  },
  msg: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
