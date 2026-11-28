import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { AiDifficulty } from '@/engine/ai';
import { SortMode } from '@/engine/types';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { GlossyButton } from './GlossyButton';
import {
  CloseIcon,
  MessageIcon,
  MoonIcon,
  SoundOffIcon,
  SoundOnIcon,
  SunIcon,
} from './Icons';

export type BotSpeed = 'fast' | 'normal' | 'relaxed';

interface PauseModalProps {
  visible: boolean;
  handNumber: number;
  targetScore: number;
  sortMode: SortMode;
  soundEnabled: boolean;
  botSpeed: BotSpeed;
  aiDifficulty?: AiDifficulty;
  onResume: () => void;
  onToggleSort: () => void;
  onToggleSound: () => void;
  onCycleBotSpeed: () => void;
  onCycleAiDifficulty?: () => void;
  onOpenFeedback: () => void;
  onRestartMatch: () => void;
  onExitToHome: () => void;
}

/**
 * In-game Pause menu overlay unified with the Noche de Club / Día Brisa palette system.
 * Houses secondary controls (Ambiente, Orden, Sonido, Ritmo, Nivel CPU, Nueva partida, Salir)
 * so the active table stays 100% focused on the tiles.
 */
export function PauseModal({
  visible,
  handNumber,
  targetScore,
  sortMode,
  soundEnabled,
  botSpeed,
  aiDifficulty = 'normal',
  onResume,
  onToggleSort,
  onToggleSound,
  onCycleBotSpeed,
  onCycleAiDifficulty,
  onOpenFeedback,
  onRestartMatch,
  onExitToHome,
}: PauseModalProps) {
  const { palette, paletteId, cyclePalette } = usePalette();
  const isNoche = paletteId === 'noche_club';

  const speedLabel =
    botSpeed === 'fast'
      ? 'Rápido'
      : botSpeed === 'relaxed'
      ? 'Pausado'
      : 'Natural';
  const speedHint =
    botSpeed === 'fast'
      ? '~0.7s'
      : botSpeed === 'relaxed'
      ? '~3.2s'
      : '~1.7s';
  const difficultyLabel =
    aiDifficulty === 'casual'
      ? 'Relajado'
      : aiDifficulty === 'pro'
      ? 'Maestro'
      : 'Club';

  const tileThemeStyle = {
    backgroundColor: palette.modalCardBg,
    borderColor: palette.modalCardBorder,
    borderBottomColor: palette.modalCardLip,
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onResume}
    >
      <View style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.modalBg,
              borderColor: palette.modalBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Pausa
              </Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                Mano #{handNumber} · Meta {targetScore} pts
              </Text>
            </View>
            <Pressable
              onPress={() => {
                hapticLight();
                onResume();
              }}
              accessibilityRole="button"
              accessibilityLabel="Seguir jugando"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          <GlossyButton
            title="Seguir jugando"
            variant="emerald"
            onPress={onResume}
          />

          <View style={styles.utilityRow}>
            <Pressable
              onPress={() => {
                hapticSnap();
                cyclePalette();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.utilityBtn,
                tileThemeStyle,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.utilityLabel, { color: palette.textMuted }]}>
                Ambiente
              </Text>
              <View style={styles.inlineRow}>
                {isNoche ? (
                  <MoonIcon size={14} color="#FFD166" />
                ) : (
                  <SunIcon size={15} color="#E85741" />
                )}
                <Text style={[styles.utilityValue, { color: palette.textPrimary }]}>
                  {palette.shortLabel}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                hapticLight();
                onToggleSound();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.utilityBtn,
                tileThemeStyle,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.utilityLabel, { color: palette.textMuted }]}>
                Sonido
              </Text>
              <View style={styles.inlineRow}>
                {soundEnabled ? (
                  <SoundOnIcon size={15} color={palette.accent} />
                ) : (
                  <SoundOffIcon size={15} color={palette.textMuted} />
                )}
                <Text style={[styles.utilityValue, { color: palette.textPrimary }]}>
                  {soundEnabled ? 'Activado' : 'Silencio'}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.utilityRow}>
            <Pressable
              onPress={() => {
                hapticLight();
                onToggleSort();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.utilityBtn,
                tileThemeStyle,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.utilityLabel, { color: palette.textMuted }]}>
                Orden
              </Text>
              <Text style={[styles.utilityValue, { color: palette.textPrimary }]}>
                {sortMode === 'value' ? 'Por valor' : 'Dobles'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                hapticLight();
                onCycleBotSpeed();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.utilityBtn,
                tileThemeStyle,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.utilityLabel, { color: palette.textMuted }]}>
                Ritmo · {speedHint}
              </Text>
              <Text style={[styles.utilityValue, { color: palette.textPrimary }]}>
                {speedLabel}
              </Text>
            </Pressable>
          </View>

          {onCycleAiDifficulty && (
            <Pressable
              onPress={() => {
                hapticLight();
                onCycleAiDifficulty();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.secondaryBtn,
                tileThemeStyle,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.utilityLabel, { color: palette.textMuted }]}>
                Nivel de compañeros CPU:
              </Text>
              <Text style={[styles.utilityValue, { color: palette.brandAccent }]}>
                {difficultyLabel}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              hapticLight();
              onOpenFeedback();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryBtn,
              tileThemeStyle,
              pressed && styles.pressed,
            ]}
          >
            <MessageIcon size={16} color={palette.accent} />
            <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>
              Enviar sugerencia o fallo
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticLight();
              onRestartMatch();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryBtn,
              tileThemeStyle,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>
              Nueva partida (mismo modo)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticLight();
              onExitToHome();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.dangerBtn,
              {
                backgroundColor: palette.dangerBg,
                borderColor: palette.dangerBorder,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.dangerBtnText, { color: palette.dangerText }]}>
              Salir a portada
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 18,
    gap: 10,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.55)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  utilityBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  utilityLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  utilityValue: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 7,
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
  },
  dangerBtn: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dangerBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1.5 }],
  },
});
