import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { sanitizeAvatarConfig } from '@/constants/avatarCatalog';
import { FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { OnlineRoomRow } from '@/lib/onlineService';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { GlossyButton } from './GlossyButton';
import { ChevronLeftIcon, GlobeIcon, LockIcon, PlusIcon, ShareIcon } from './Icons';

interface WaitingRoomViewProps {
  room: OnlineRoomRow;
  isHost: boolean;
  onStartWithBots: (convertToFree?: boolean) => Promise<void>;
  onLeave: () => Promise<void>;
}

export function WaitingRoomView({
  room,
  isHost,
  onStartWithBots,
  onLeave,
}: WaitingRoomViewProps) {
  const { palette } = usePalette();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 950 }),
        withTiming(1, { duration: 950 })
      ),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const seats = room.room_players ?? [];
  const slots = Array.from({ length: room.max_players }, (_, i) =>
    seats.find((s) => s.seat === i)
  );
  const isPaidSalon = room.buy_in > 0;

  const modeLabel =
    room.mode === '1v1'
      ? '1 contra 1'
      : room.mode === '2v2'
      ? '2 contra 2'
      : '4 todos contra todos';

  const handleShareCode = async () => {
    hapticLight();
    try {
      await Share.share({
        message: `¡Únete a mi mesa de Dominó Latino! Código de sala: ${room.code} (${modeLabel} · A ${room.target_score} pts)`,
      });
    } catch {
      // User cancelled share sheet
    }
  };

  const handleFillBots = async (convertToFree = false) => {
    setErrorMsg(null);
    setBusy(true);
    try {
      hapticSnap();
      await onStartWithBots(convertToFree);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo iniciar la mesa.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.5, 1]}
      style={styles.root}
    >
      {/* Clean top back escape */}
      <View style={styles.topEscapeRow}>
        <Pressable
          onPress={() => {
            hapticLight();
            onLeave();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.78 }]}
        >
          <ChevronLeftIcon size={18} color={palette.textPrimary} />
          <Text style={[styles.backText, { color: palette.textPrimary }]}>
            Salir al lobby
          </Text>
        </Pressable>
      </View>

      <View style={styles.centerWrap}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.modalBg,
              borderColor: palette.modalBorder,
            },
          ]}
        >
          <View style={styles.kickerRow}>
            {room.is_private ? (
              <LockIcon size={12} color={palette.brandAccent} />
            ) : (
              <GlobeIcon size={12} color={palette.brandAccent} />
            )}
            <Text style={[styles.kicker, { color: palette.brandAccent }]}>
              {room.is_private ? 'SALA PRIVADA' : 'MESA PÚBLICA'} ·{' '}
              {modeLabel.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.headline, { color: palette.textPrimary }]}>
            La mesa está servida ({seats.length}/{room.max_players})
          </Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>
            Meta {room.target_score} pts ·{' '}
            {room.buy_in === 0
              ? 'Partida amistosa'
              : `Salón ${room.buy_in} fichas`}
          </Text>

          {/* Shareable 6-character code */}
          <View
            style={[
              styles.codeBox,
              {
                backgroundColor: palette.modalCardBg,
                borderColor: palette.borderWarm,
                borderBottomColor: palette.modalCardLip,
              },
            ]}
          >
            <Text style={[styles.codeLabel, { color: palette.textMuted }]}>
              CÓDIGO DE INVITACIÓN
            </Text>
            <Text style={[styles.codeValue, { color: palette.brandAccent }]}>
              {room.code}
            </Text>
            <GlossyButton
              title="Compartir código con amigos"
              variant="cobalt"
              compact
              icon={<ShareIcon size={15} color="#FFFFFF" />}
              onPress={handleShareCode}
              style={{ width: '100%', marginTop: 4 }}
            />
          </View>

          {/* Live Seated Roster — tapping any empty chair shares invite code! */}
          <View style={styles.seatsGrid}>
            {slots.map((occupant, idx) =>
              occupant ? (
                <View
                  key={idx}
                  style={[
                    styles.seatCard,
                    {
                      backgroundColor: palette.modalCardBg,
                      borderColor: palette.modalCardBorder,
                      borderBottomColor: palette.modalCardLip,
                    },
                  ]}
                >
                  <AvatarIllustration
                    isBot={occupant.is_bot}
                    seatHint={idx}
                    accentColor={idx % 2 === 0 ? palette.accent : palette.brandAccent}
                    size={46}
                    avatarConfig={
                      !occupant.is_bot && occupant.avatar_config
                        ? sanitizeAvatarConfig(occupant.avatar_config)
                        : undefined
                    }
                  />
                  <Text
                    style={[styles.seatLabel, { color: palette.textPrimary }]}
                    numberOfLines={1}
                  >
                    {occupant.display_name}
                  </Text>
                </View>
              ) : (
                <Pressable
                  key={idx}
                  onPress={handleShareCode}
                  accessibilityRole="button"
                  accessibilityLabel="Invitar amigo a este asiento"
                  style={({ pressed }) => [
                    styles.seatCard,
                    {
                      backgroundColor: palette.modalCardBg,
                      borderColor: palette.modalCardBorder,
                      borderBottomColor: palette.modalCardLip,
                    },
                    pressed && { opacity: 0.85, transform: [{ translateY: 1 }] },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.emptyCircle,
                      { borderColor: palette.brandAccent },
                      pulseStyle,
                    ]}
                  >
                    <PlusIcon size={19} color={palette.brandAccent} />
                  </Animated.View>
                  <Text
                    style={[styles.seatLabelMuted, { color: palette.textSecondary }]}
                    numberOfLines={1}
                  >
                    Invitar...
                  </Text>
                </Pressable>
              )
            )}
          </View>

          {errorMsg && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: palette.dangerBg,
                  borderColor: palette.dangerBorder,
                },
              ]}
            >
              <Text style={[styles.errorText, { color: palette.dangerText }]}>
                {errorMsg}
              </Text>
            </View>
          )}

          {isPaidSalon && (
            <View
              style={[
                styles.salonNotice,
                {
                  backgroundColor: palette.winnerCardBg,
                  borderColor: palette.winnerCardBorder,
                },
              ]}
            >
              <Text
                style={[styles.salonNoticeTitle, { color: palette.winnerText }]}
              >
                Salón de {room.buy_in.toLocaleString('es-ES')} fichas · Solo humanos
              </Text>
              <Text
                style={[styles.salonNoticeBody, { color: palette.textSecondary }]}
              >
                Las fichas solo se descuentan cuando todos los asientos se llenan con jugadores reales.
              </Text>
            </View>
          )}

          {isHost && !isPaidSalon && (
            <GlossyButton
              title="Completar mesa con el Club y jugar ya"
              variant="emerald"
              loading={busy}
              onPress={() => handleFillBots(false)}
              style={{ width: '100%' }}
            />
          )}

          {isHost && isPaidSalon && (
            <GlossyButton
              title="Jugar amistosa ahora (0 fichas)"
              subtitle="Completa asientos vacíos con rivales del Club sin cobro"
              variant="cobalt"
              loading={busy}
              onPress={() => handleFillBots(true)}
              style={{ width: '100%' }}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topEscapeRow: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 6,
  },
  backText: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.45)',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kicker: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 0.9,
  },
  headline: {
    fontFamily: FONT.display,
    fontSize: 22,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT.semi,
    fontSize: 13,
  },
  codeBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    padding: 14,
    alignItems: 'center',
    gap: 5,
  },
  codeLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  codeValue: {
    fontFamily: FONT.display,
    fontSize: 32,
    letterSpacing: 5,
    fontVariant: ['tabular-nums'],
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginVertical: 2,
  },
  seatCard: {
    width: '46.5%',
    borderRadius: 16,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  emptyCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.75,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  seatLabelMuted: {
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  salonNotice: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  salonNoticeTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
    textAlign: 'center',
  },
  salonNoticeBody: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});
