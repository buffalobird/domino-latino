import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { APP_PALETTE_LIST, AppPaletteId } from '@/constants/appPalettes';
import { AvatarConfig } from '@/constants/avatarCatalog';
import { FONT } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { AiDifficulty } from '@/engine/ai';
import { SortMode } from '@/engine/types';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import {
  CheckIcon,
  CloseIcon,
  MessageIcon,
  MoonIcon,
  SoundOffIcon,
  SoundOnIcon,
  SunIcon,
  TableIcon,
  UserSilhouetteIcon,
} from './Icons';
import { ModularAvatar } from './ModularAvatar';
import { BotSpeed } from './PauseModal';

interface SettingsModalProps {
  visible: boolean;
  soundEnabled: boolean;
  botSpeed: BotSpeed;
  aiDifficulty: AiDifficulty;
  sortMode: SortMode;
  avatarConfig: AvatarConfig;
  onToggleSound: () => void;
  onCycleBotSpeed: () => void;
  onCycleAiDifficulty: () => void;
  onToggleSort: () => void;
  onOpenAuth: () => void;
  onOpenThemes: () => void;
  onOpenFeedback: () => void;
  onClose: () => void;
}

export function SettingsModal({
  visible,
  soundEnabled,
  botSpeed,
  aiDifficulty,
  sortMode,
  avatarConfig,
  onToggleSound,
  onCycleBotSpeed,
  onCycleAiDifficulty,
  onToggleSort,
  onOpenAuth,
  onOpenThemes,
  onOpenFeedback,
  onClose,
}: SettingsModalProps) {
  const { user, profile, isSignedIn } = useAuth();
  const { palette, paletteId, setPaletteId } = usePalette();

  const speedLabel =
    botSpeed === 'fast' ? 'Rápido' : botSpeed === 'relaxed' ? 'Pausado' : 'Natural';
  const diffLabel =
    aiDifficulty === 'casual'
      ? 'Relajado'
      : aiDifficulty === 'pro'
      ? 'Maestro'
      : 'Club';
  const accountLabel =
    profile?.displayName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    'Jugador';

  const handleSelectTheme = (id: AppPaletteId) => {
    hapticSnap();
    setPaletteId(id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>Ajustes</Text>
              <Text style={[styles.sub, { color: palette.textSecondary }]}>
                Ambiente, ritmo de mesa y cuenta
              </Text>
            </View>
            <Pressable
              onPress={() => {
                hapticLight();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar ajustes"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* 1. Ambient Master Theme: Noche de Club vs Día Brisa */}
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
              AMBIENTE VISUAL
            </Text>
            <View style={styles.themeRow}>
              {APP_PALETTE_LIST.map((p) => {
                const active = paletteId === p.id;
                const isNoche = p.id === 'noche_club';
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => handleSelectTheme(p.id)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.themeCard,
                      {
                        backgroundColor: palette.modalCardBg,
                        borderColor: active
                          ? palette.brandAccent
                          : palette.modalCardBorder,
                        borderBottomColor: active
                          ? palette.brandAccent
                          : palette.modalCardLip,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.themeTopRow}>
                      <View
                        style={[
                          styles.themeOrb,
                          { backgroundColor: isNoche ? '#0B1D26' : '#F6F1E7' },
                        ]}
                      >
                        {isNoche ? (
                          <MoonIcon size={15} color="#FFD166" />
                        ) : (
                          <SunIcon size={16} color="#E85741" />
                        )}
                      </View>
                      {active && (
                        <View
                          style={[
                            styles.activeTick,
                            { backgroundColor: palette.brandAccent },
                          ]}
                        >
                          <CheckIcon
                            size={11}
                            color={palette.isDark ? '#1F1402' : '#FFFFFF'}
                          />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.themeName, { color: palette.textPrimary }]}>
                      {p.name}
                    </Text>
                    <View style={styles.swatchStrip}>
                      {p.swatches.slice(0, 4).map((hex, i) => (
                        <View
                          key={i}
                          style={[
                            styles.swatchDot,
                            {
                              backgroundColor: hex,
                              borderColor: palette.modalCardBorder,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 2. Gameplay & Audio Controls */}
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
              MESA Y JUGABILIDAD
            </Text>
            <View style={styles.gridRow}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onToggleSound();
                }}
                style={({ pressed }) => [
                  styles.controlTile,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.controlLabel, { color: palette.textMuted }]}>
                  Sonido
                </Text>
                <View style={styles.inlineVal}>
                  {soundEnabled ? (
                    <SoundOnIcon size={16} color={palette.accent} />
                  ) : (
                    <SoundOffIcon size={16} color={palette.textMuted} />
                  )}
                  <Text style={[styles.controlValue, { color: palette.textPrimary }]}>
                    {soundEnabled ? 'Activado' : 'Silencio'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onCycleAiDifficulty();
                }}
                style={({ pressed }) => [
                  styles.controlTile,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.controlLabel, { color: palette.textMuted }]}>
                  Nivel CPU
                </Text>
                <Text style={[styles.controlValue, { color: palette.textPrimary }]}>
                  {diffLabel}
                </Text>
              </Pressable>
            </View>

            <View style={styles.gridRow}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onCycleBotSpeed();
                }}
                style={({ pressed }) => [
                  styles.controlTile,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.controlLabel, { color: palette.textMuted }]}>
                  Ritmo de Mesa
                </Text>
                <Text style={[styles.controlValue, { color: palette.textPrimary }]}>
                  {speedLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onToggleSort();
                }}
                style={({ pressed }) => [
                  styles.controlTile,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.controlLabel, { color: palette.textMuted }]}>
                  Orden de Fichas
                </Text>
                <Text style={[styles.controlValue, { color: palette.textPrimary }]}>
                  {sortMode === 'value' ? 'Por valor' : 'Dobles'}
                </Text>
              </Pressable>
            </View>

            {/* 3. Account & Cloud Progress */}
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
              CUENTA Y ESTILO
            </Text>
            <Pressable
              onPress={() => {
                hapticLight();
                onClose();
                onOpenAuth();
              }}
              style={({ pressed }) => [
                styles.accountRow,
                {
                  backgroundColor: palette.modalCardBg,
                  borderColor: palette.modalCardBorder,
                  borderBottomColor: palette.modalCardLip,
                },
                pressed && styles.pressed,
              ]}
            >
              {isSignedIn ? (
                <ModularAvatar config={avatarConfig} size={40} />
              ) : (
                <View
                  style={[
                    styles.guestCircle,
                    { backgroundColor: palette.accentBg },
                  ]}
                >
                  <UserSilhouetteIcon size={18} color={palette.accent} />
                </View>
              )}
              <View style={styles.accountTextCol}>
                <Text
                  style={[styles.accountTitle, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {isSignedIn ? accountLabel : 'Guardar progreso en la nube'}
                </Text>
                <Text
                  style={[styles.accountSub, { color: palette.textSecondary }]}
                  numberOfLines={1}
                >
                  {isSignedIn
                    ? 'Sincronizado · Gestionar cuenta'
                    : 'Conecta Apple o Google para no perder tus fichas'}
                </Text>
              </View>
              <View
                style={[
                  styles.accountPill,
                  { backgroundColor: palette.selectedBg },
                ]}
              >
                <Text
                  style={[styles.accountPillText, { color: palette.selectedText }]}
                >
                  {isSignedIn ? 'Cuenta' : 'Entrar'}
                </Text>
              </View>
            </Pressable>

            <View style={styles.gridRow}>
              <Pressable
                onPress={() => {
                  hapticLight();
                  onClose();
                  onOpenThemes();
                }}
                style={({ pressed }) => [
                  styles.actionLink,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <TableIcon size={16} color={palette.brandAccent} />
                <Text style={[styles.actionLinkText, { color: palette.textPrimary }]}>
                  Mesas y Fichas
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onClose();
                  onOpenFeedback();
                }}
                style={({ pressed }) => [
                  styles.actionLink,
                  {
                    backgroundColor: palette.modalCardBg,
                    borderColor: palette.modalCardBorder,
                    borderBottomColor: palette.modalCardLip,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <MessageIcon size={16} color={palette.accent} />
                <Text style={[styles.actionLinkText, { color: palette.textPrimary }]}>
                  Sugerencias
                </Text>
              </Pressable>
            </View>
          </ScrollView>
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 18,
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.55)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 22,
  },
  sub: {
    fontFamily: FONT.semi,
    fontSize: 12.5,
    marginTop: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    gap: 10,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    padding: 12,
    gap: 7,
  },
  themeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
  },
  activeTick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  swatchStrip: {
    flexDirection: 'row',
    gap: 5,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 9,
  },
  controlTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 3,
  },
  controlLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  controlValue: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  inlineVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    padding: 11,
  },
  guestCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTextCol: {
    flex: 1,
    gap: 1,
  },
  accountTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 13.5,
  },
  accountSub: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
  },
  accountPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  accountPillText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  actionLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 44,
    borderRadius: 15,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    paddingHorizontal: 10,
  },
  actionLinkText: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ translateY: 1.5 }],
  },
});
