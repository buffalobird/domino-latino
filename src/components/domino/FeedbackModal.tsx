import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { trackEvent } from '@/lib/analytics';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { hapticLight, hapticSuccess } from '@/utils/feedback';
import { GlossyButton } from './GlossyButton';
import { CloseIcon } from './Icons';

export type FeedbackCategory = 'idea' | 'bug' | 'ux';

const FEEDBACK_COOLDOWN_KEY = 'domino_latino_last_feedback_ts_v1';
const FEEDBACK_COOLDOWN_MS = 60_000;
const MAX_LENGTH = 500;
const MIN_LENGTH = 5;

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'idea', label: 'Sugerencia' },
  { value: 'bug', label: 'Error / Bug' },
  { value: 'ux', label: 'Experiencia' },
];

interface FeedbackModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

/**
 * Independent, always-accessible feedback channel (completely decoupled from
 * App Store / Google Play reviews to stay 100% compliant with anti-review-gating rules).
 */
export function FeedbackModal({ visible, userId, onClose }: FeedbackModalProps) {
  const { palette } = usePalette();
  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const trimmed = message.trim();
  const canSubmit = trimmed.length >= MIN_LENGTH && trimmed.length <= MAX_LENGTH && !busy;

  const handleClose = () => {
    setError(null);
    setSent(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      const lastRaw = await AsyncStorage.getItem(FEEDBACK_COOLDOWN_KEY);
      if (lastRaw) {
        const elapsed = Date.now() - Number.parseInt(lastRaw, 10);
        if (Number.isFinite(elapsed) && elapsed < FEEDBACK_COOLDOWN_MS) {
          setError('Espera un minuto antes de enviar otro comentario.');
          return;
        }
      }
    } catch {
      // Non-fatal
    }

    if (!isSupabaseConfigured) {
      setError('Sin conexión con el servidor en este entorno.');
      return;
    }

    setBusy(true);
    try {
      const { error: insertErr } = await supabase.from('app_feedback').insert({
        user_id: userId,
        category,
        message: trimmed,
        platform: Platform.OS,
        app_version: '1.0.0',
      });

      if (insertErr) {
        setError('No pudimos enviar tu mensaje. Intenta de nuevo.');
        return;
      }

      await AsyncStorage.setItem(FEEDBACK_COOLDOWN_KEY, String(Date.now())).catch(() => {});
      trackEvent('feedback_submitted', { category }, userId);
      hapticSuccess();
      setMessage('');
      setSent(true);
    } catch {
      setError('Error de red al enviar tu comentario.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}
      >
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
            <View style={styles.headerTextCol}>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Ayúdanos a mejorar
              </Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                Tu mensaje llega directo al equipo de Dominó Latino
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
            >
              <CloseIcon size={18} color={palette.textPrimary} />
            </Pressable>
          </View>

          {sent ? (
            <View style={styles.sentBox}>
              <Text style={[styles.sentTitle, { color: palette.positiveText }]}>
                ¡Gracias por tu comentario!
              </Text>
              <Text style={[styles.sentSub, { color: palette.textSecondary }]}>
                Lo revisaremos pronto para seguir puliendo el juego.
              </Text>
              <GlossyButton
                title="Listo"
                variant="emerald"
                onPress={handleClose}
              />
            </View>
          ) : (
            <>
              <View style={styles.catRow}>
                {CATEGORIES.map((c) => {
                  const active = category === c.value;
                  return (
                    <Pressable
                      key={c.value}
                      onPress={() => {
                        hapticLight();
                        setCategory(c.value);
                      }}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: active
                            ? palette.selectedBg
                            : palette.modalCardBg,
                          borderColor: active
                            ? palette.selectedBorder
                            : palette.modalCardBorder,
                          borderBottomColor: active
                            ? palette.selectedLip
                            : palette.modalCardLip,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catText,
                          {
                            color: active
                              ? palette.selectedText
                              : palette.textSecondary,
                          },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={message}
                onChangeText={(t) => {
                  setMessage(t.slice(0, MAX_LENGTH));
                  if (error) setError(null);
                }}
                placeholder="Cuéntanos qué mejorarías o si encontraste algún fallo..."
                placeholderTextColor={palette.textMuted}
                multiline
                maxLength={MAX_LENGTH}
                textAlignVertical="top"
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.modalInputBg,
                    borderColor: palette.modalCardBorder,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <View style={styles.metaRow}>
                <Text style={[styles.hintText, { color: palette.textMuted }]}>
                  {trimmed.length < MIN_LENGTH
                    ? `Mínimo ${MIN_LENGTH} caracteres`
                    : 'Listo para enviar'}
                </Text>
                <Text style={[styles.counterText, { color: palette.textMuted }]}>
                  {message.length}/{MAX_LENGTH}
                </Text>
              </View>

              {error && (
                <Text style={[styles.errorText, { color: palette.dangerText }]}>
                  {error}
                </Text>
              )}

              <GlossyButton
                title="Enviar comentario"
                variant="emerald"
                disabled={!canSubmit}
                loading={busy}
                onPress={handleSubmit}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: 400,
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
    gap: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: FONT.semi,
    fontSize: 12.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catRow: {
    flexDirection: 'row',
    gap: 7,
  },
  catPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1.25,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  input: {
    minHeight: 112,
    maxHeight: 160,
    borderRadius: 15,
    borderWidth: 1.25,
    padding: 12,
    fontFamily: FONT.semi,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  hintText: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  counterText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  sentBox: {
    gap: 10,
    paddingVertical: 8,
  },
  sentTitle: {
    fontFamily: FONT.display,
    fontSize: 19,
    textAlign: 'center',
  },
  sentSub: {
    fontFamily: FONT.semi,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
});
