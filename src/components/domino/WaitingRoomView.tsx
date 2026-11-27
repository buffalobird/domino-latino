import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { sanitizeAvatarConfig } from '@/constants/avatarCatalog';
import { CLUB } from '@/constants/tokens';
import { OnlineRoomRow } from '@/lib/onlineService';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { GlossyButton } from './GlossyButton';
import { GlobeIcon, LockIcon, PlusIcon, ShareIcon } from './Icons';

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
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
        message: `¡Únete a mi mesa de Dominó Latino! Código de sala: ${room.code} (${modeLabel} · ${room.target_score} pts)`,
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
        err instanceof Error ? err.message : 'No se pudo iniciar la mesa con Bots.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient
      colors={[CLUB.roomBgTop, CLUB.roomBgMid, '#091A21', CLUB.roomBgBottom]}
      locations={[0, 0.35, 0.72, 1]}
      style={styles.root}
    >
      <View style={styles.card}>
        <View style={styles.kickerRow}>
          {room.is_private ? (
            <LockIcon size={12} color={CLUB.gold} />
          ) : (
            <GlobeIcon size={12} color={CLUB.gold} />
          )}
          <Text style={styles.kicker}>
            {room.is_private ? 'SALA PRIVADA' : 'MESA PÚBLICA'} · {modeLabel.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headline}>
          La mesa te espera ({seats.length}/{room.max_players})
        </Text>
        <Text style={styles.sub}>
          Meta {room.target_score} pts ·{' '}
          {room.buy_in === 0 ? 'Mesa amistosa gratis' : `Salón ${room.buy_in} fichas`}
        </Text>

        {/* Shareable 6-character code */}
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>CÓDIGO DE MESA</Text>
          <Text style={styles.codeValue}>{room.code}</Text>
          <GlossyButton
            title="Compartir código con amigos"
            variant="cobalt"
            compact
            icon={<ShareIcon size={15} color="#FFFFFF" />}
            onPress={handleShareCode}
            style={{ width: '100%', marginTop: 4 }}
          />
        </View>

        {/* Live Seated Roster */}
        <View style={styles.seatsGrid}>
          {slots.map((occupant, idx) => (
            <View key={idx} style={styles.seatCard}>
              {occupant ? (
                <AvatarIllustration
                  isBot={occupant.is_bot}
                  accentColor={idx % 2 === 0 ? CLUB.emerald : CLUB.gold}
                  size={46}
                  avatarConfig={
                    !occupant.is_bot && occupant.avatar_config
                      ? sanitizeAvatarConfig(occupant.avatar_config)
                      : undefined
                  }
                />
              ) : (
                <View style={styles.emptyCircle}>
                  <PlusIcon size={20} color={CLUB.gold} />
                </View>
              )}
              <Text style={styles.seatLabel} numberOfLines={1}>
                {occupant ? occupant.display_name : 'Esperando...'}
              </Text>
            </View>
          ))}
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {isPaidSalon && (
          <View style={styles.salonNotice}>
            <Text style={styles.salonNoticeTitle}>
              Salón de {room.buy_in.toLocaleString('es-ES')} fichas · Solo jugadores reales
            </Text>
            <Text style={styles.salonNoticeBody}>
              Las fichas de entrada solo se descuentan cuando todos los asientos se llenan con humanos.
            </Text>
          </View>
        )}

        {isHost && !isPaidSalon && (
          <GlossyButton
            title="Rellenar vacíos con Bots y jugar ya"
            variant="emerald"
            loading={busy}
            onPress={() => handleFillBots(false)}
            style={{ width: '100%' }}
          />
        )}

        {isHost && isPaidSalon && (
          <GlossyButton
            title="Jugar gratis con Bots"
            subtitle="Convierte esta mesa a amistosa (0 fichas · sin cobro)"
            variant="cobalt"
            loading={busy}
            onPress={() => handleFillBots(true)}
            style={{ width: '100%' }}
          />
        )}

        <GlossyButton
          title="Salir de la mesa"
          variant="glass"
          compact
          onPress={onLeave}
          style={{ width: '100%' }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: CLUB.glassBgStrong,
    borderRadius: 24,
    borderWidth: 1.25,
    borderColor: CLUB.glassBorder,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 18px 44px rgba(0, 0, 0, 0.65)',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kicker: {
    color: CLUB.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  headline: {
    color: CLUB.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    color: CLUB.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  codeBox: {
    width: '100%',
    backgroundColor: 'rgba(34, 27, 16, 0.66)',
    borderRadius: 18,
    borderWidth: 1.25,
    borderColor: 'rgba(245, 196, 81, 0.72)',
    padding: 14,
    alignItems: 'center',
    gap: 6,
    boxShadow: '0px 0px 20px rgba(245, 196, 81, 0.22)',
  },
  codeLabel: {
    color: CLUB.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  codeValue: {
    color: CLUB.gold,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
    fontVariant: ['tabular-nums'],
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: CLUB.cyan,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  shareBtnText: {
    color: CLUB.cyan,
    fontSize: 13,
    fontWeight: '800',
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginVertical: 4,
  },
  seatCard: {
    width: '46%',
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  emptyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: CLUB.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatLabel: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  startBotsBtn: {
    width: '100%',
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBotsText: {
    color: CLUB.textInk,
    fontSize: 15,
    fontWeight: '900',
  },
  leaveBtn: {
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtnText: {
    color: '#FDA4AF',
    fontSize: 14,
    fontWeight: '800',
  },
  salonNotice: {
    width: '100%',
    backgroundColor: 'rgba(245, 196, 81, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  salonNoticeTitle: {
    color: CLUB.gold,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  salonNoticeBody: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderWidth: 1,
    borderColor: CLUB.coral,
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
