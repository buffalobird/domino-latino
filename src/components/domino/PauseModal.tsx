import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CLUB } from '@/constants/tokens';
import { SortMode } from '@/engine/types';
import { GlossyButton } from './GlossyButton';
import {
  CloseIcon,
  HistoryIcon,
  MessageIcon,
  SoundOffIcon,
  SoundOnIcon,
} from './Icons';

export type BotSpeed = 'fast' | 'normal' | 'relaxed';

interface PauseModalProps {
  visible: boolean;
  handNumber: number;
  targetScore: number;
  sortMode: SortMode;
  soundEnabled: boolean;
  botSpeed: BotSpeed;
  onResume: () => void;
  onOpenHistory: () => void;
  onToggleSort: () => void;
  onToggleSound: () => void;
  onCycleBotSpeed: () => void;
  onOpenFeedback: () => void;
  onRestartMatch: () => void;
  onExitToHome: () => void;
}

/**
 * In-game Pause menu overlay replacing native Alert.alert (Audit U14 + F3).
 * Houses secondary controls (Orden, Historial, Sonido, Nueva partida, Salir)
 * so the table itself stays 100% clean and text-free.
 */
export function PauseModal({
  visible,
  handNumber,
  targetScore,
  sortMode,
  soundEnabled,
  botSpeed,
  onResume,
  onOpenHistory,
  onToggleSort,
  onToggleSound,
  onCycleBotSpeed,
  onOpenFeedback,
  onRestartMatch,
  onExitToHome,
}: PauseModalProps) {
  const speedLabel =
    botSpeed === 'fast'
      ? 'Rápido'
      : botSpeed === 'relaxed'
      ? 'Relajado'
      : 'Humano';
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onResume}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Pausa</Text>
              <Text style={styles.subtitle}>
                Mano #{handNumber} · Meta {targetScore} pts
              </Text>
            </View>
            <Pressable
              onPress={onResume}
              accessibilityRole="button"
              accessibilityLabel="Seguir jugando"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          <GlossyButton
            title="Seguir jugando"
            variant="emerald"
            onPress={onResume}
          />

          <View style={styles.utilityRow}>
            <Pressable onPress={onToggleSort} style={styles.utilityBtn}>
              <Text style={styles.utilityLabel}>Orden</Text>
              <Text style={styles.utilityValue}>
                {sortMode === 'value' ? 'Por valor' : 'Dobles'}
              </Text>
            </Pressable>

            <Pressable onPress={onCycleBotSpeed} style={styles.utilityBtn}>
              <Text style={styles.utilityLabel}>Ritmo Bot</Text>
              <Text style={styles.utilityValue}>{speedLabel}</Text>
            </Pressable>

            <Pressable onPress={onToggleSound} style={styles.utilityBtn}>
              {soundEnabled ? (
                <SoundOnIcon size={18} color={CLUB.emerald} />
              ) : (
                <SoundOffIcon size={18} color={CLUB.textMuted} />
              )}
              <Text style={styles.utilityValue}>
                {soundEnabled ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={onOpenHistory} style={styles.secondaryBtn}>
            <HistoryIcon size={18} color={CLUB.textPrimary} />
            <Text style={styles.secondaryBtnText}>Historial de la mano</Text>
          </Pressable>

          <Pressable onPress={onOpenFeedback} style={styles.secondaryBtn}>
            <MessageIcon size={16} color={CLUB.textSecondary} />
            <Text style={styles.secondaryBtnText}>Enviar sugerencia o fallo</Text>
          </Pressable>

          <Pressable onPress={onRestartMatch} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Nueva partida (mismo modo)</Text>
          </Pressable>

          <Pressable onPress={onExitToHome} style={styles.dangerBtn}>
            <Text style={styles.dangerBtnText}>Salir y cambiar modo</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 12, 24, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(14, 28, 52, 0.96)',
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: 'rgba(148, 190, 255, 0.26)',
    padding: 18,
    gap: 10,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.72)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: CLUB.textInk,
    fontSize: 16,
    fontWeight: '900',
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  utilityBtn: {
    flex: 1,
    minHeight: 52,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 8,
  },
  utilityLabel: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  utilityValue: {
    color: CLUB.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  dangerBtn: {
    minHeight: 46,
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    color: '#FDA4AF',
    fontSize: 14,
    fontWeight: '800',
  },
});
