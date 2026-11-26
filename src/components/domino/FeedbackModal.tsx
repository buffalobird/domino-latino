import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CLUB } from '@/constants/tokens';
import { trackEvent } from '@/lib/analytics';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { hapticLight, hapticSuccess } from '@/utils/feedback';
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
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Ayúdanos a mejorar</Text>
              <Text style={styles.subtitle}>
                Tu mensaje llega directo al equipo de Dominó Latino
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={styles.closeBtn}
            >
              <CloseIcon size={18} color={CLUB.textPrimary} />
            </Pressable>
          </View>

          {sent ? (
            <View style={styles.sentBox}>
              <Text style={styles.sentTitle}>¡Gracias por tu comentario!</Text>
              <Text style={styles.sentSub}>
                Lo revisaremos pronto para seguir puliendo el juego.
              </Text>
              <Pressable onPress={handleClose} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Listo</Text>
              </Pressable>
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
                      style={[styles.catPill, active && styles.catPillActive]}
                    >
                      <Text
                        style={[styles.catText, active && styles.catTextActive]}
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
                placeholderTextColor={CLUB.textMuted}
                multiline
                maxLength={MAX_LENGTH}
                textAlignVertical="top"
                style={styles.input}
              />

              <View style={styles.metaRow}>
                <Text style={styles.hintText}>
                  {trimmed.length < MIN_LENGTH
                    ? `Mínimo ${MIN_LENGTH} caracteres`
                    : 'Listo para enviar'}
                </Text>
                <Text style={styles.counterText}>
                  {message.length}/{MAX_LENGTH}
                </Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  !canSubmit && styles.primaryBtnDisabled,
                  pressed && canSubmit && { opacity: 0.9 },
                ]}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={CLUB.textInk} />
                ) : (
                  <Text style={styles.primaryBtnText}>Enviar comentario</Text>
                )}
              </Pressable>
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
    backgroundColor: 'rgba(6, 12, 24, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 18,
    gap: 12,
    boxShadow: '0px 14px 32px rgba(0, 0, 0, 0.6)',
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
    color: CLUB.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catRow: {
    flexDirection: 'row',
    gap: 6,
  },
  catPill: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: CLUB.surfaceCardLight,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catPillActive: {
    backgroundColor: 'rgba(245, 196, 81, 0.16)',
    borderColor: CLUB.gold,
  },
  catText: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  catTextActive: {
    color: CLUB.gold,
  },
  input: {
    minHeight: 112,
    maxHeight: 160,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    padding: 12,
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  hintText: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  counterText: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
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
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    color: CLUB.textInk,
    fontSize: 15,
    fontWeight: '900',
  },
  sentBox: {
    gap: 10,
    paddingVertical: 8,
  },
  sentTitle: {
    color: CLUB.emerald,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  sentSub: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
});
