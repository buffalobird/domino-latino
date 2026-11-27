import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CLUB } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { GameMode, TARGET_SCORES, TargetScore } from '@/engine/types';
import {
  createOnlineRoom,
  joinOnlineRoom,
  listOpenPublicRooms,
  OnlineRoomRow,
} from '@/lib/onlineService';
import { supabase } from '@/lib/supabase';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AccountCard } from './AccountCard';
import { AvatarIllustration } from './AvatarIllustration';
import { GlossyButton } from './GlossyButton';
import {
  ChevronLeftIcon,
  ChipIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
} from './Icons';

interface OnlineLobbyViewProps {
  clubChips: number;
  defaultMode: GameMode;
  defaultTargetScore: TargetScore;
  initialTab?: 'public' | 'private';
  onEnteredRoom: (room: OnlineRoomRow, mySeat: number) => void;
  onBack: () => void;
}

const BUY_IN_SALONS = [
  { value: 0, label: 'Gratis' },
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1.000' },
] as const;

export function OnlineLobbyView({
  clubChips,
  defaultMode,
  defaultTargetScore,
  initialTab = 'public',
  onEnteredRoom,
  onBack,
}: OnlineLobbyViewProps) {
  const { isSignedIn } = useAuth();
  const [rooms, setRooms] = useState<OnlineRoomRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create Room inline config
  const [createOpen, setCreateOpen] = useState(initialTab === 'private');
  const [mode, setMode] = useState<GameMode>(defaultMode);
  const [targetScore, setTargetScore] = useState<TargetScore>(defaultTargetScore);
  const [isPrivate, setIsPrivate] = useState(initialTab === 'private');
  const [buyIn, setBuyIn] = useState<number>(0);

  // Join Private Code
  const [joinCode, setJoinCode] = useState('');

  const refreshRooms = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const list = await listOpenPublicRooms();
      setRooms(list);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Live Realtime Lobby updates whenever rooms or seated players change
  useEffect(() => {
    if (!isSignedIn) return;
    refreshRooms();

    const channel = supabase
      .channel('public-lobby-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms' },
        () => {
          refreshRooms();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players' },
        () => {
          refreshRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, refreshRooms]);

  const handleCreate = async () => {
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const effectiveBuyIn = isPrivate ? 0 : buyIn;
      const res = await createOnlineRoom({
        mode,
        targetScore,
        isPrivate,
        buyIn: effectiveBuyIn,
      });
      hapticSnap();
      onEnteredRoom(res.room, res.mySeat);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo crear la mesa.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleJoinById = async (roomId: string) => {
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const res = await joinOnlineRoom({ roomId });
      hapticSnap();
      onEnteredRoom(res.room, res.mySeat);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo unir a la mesa.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleJoinByCode = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      setErrorMsg('Ingresa un código de sala válido.');
      return;
    }
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const res = await joinOnlineRoom({ code: clean });
      hapticSnap();
      onEnteredRoom(res.room, res.mySeat);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Sala no encontrada.');
    } finally {
      setBusyAction(false);
    }
  };

  return (
    <LinearGradient
      colors={['#071124', '#081327', '#0A1830', '#060E1F']}
      locations={[0, 0.35, 0.72, 1]}
      style={styles.gradient}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            hapticLight();
            onBack();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.78 }]}
        >
          <ChevronLeftIcon size={18} color={CLUB.textPrimary} />
          <Text style={styles.backBtnText}>Volver</Text>
        </Pressable>

        <Text style={styles.title}>Salas Online</Text>

        <View style={styles.chipsPill}>
          <ChipIcon size={14} color={CLUB.gold} />
          <Text style={styles.chipsText}>
            {clubChips.toLocaleString('es-ES')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isSignedIn ? (
          <View style={styles.authGate}>
            <Text style={styles.gateTitle}>Inicia sesión para jugar Online</Text>
            <Text style={styles.gateSub}>
              Conéctate con Google o Apple para sentarte en mesas públicas, crear
              salas privadas con código y guardar tus Fichas de Club.
            </Text>
            <AccountCard />
          </View>
        ) : (
          <>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Join Private Room by 6-char Code */}
            <View style={styles.privateBox}>
              <View style={styles.boxLabelRow}>
                <LockIcon size={13} color={CLUB.violet} />
                <Text style={styles.boxLabel}>Unirse a sala privada con código</Text>
              </View>
              <View style={styles.codeRow}>
                <TextInput
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder="Ej. K7M2P9"
                  placeholderTextColor={CLUB.textMuted}
                  autoCapitalize="characters"
                  maxLength={6}
                  style={styles.codeInput}
                />
                <GlossyButton
                  title="Entrar"
                  variant="cobalt"
                  compact
                  disabled={busyAction}
                  onPress={handleJoinByCode}
                />
              </View>
            </View>

            {/* Big Green "+ CREAR MESA" Card (Reference Screenshot 2) */}
            <Pressable
              onPress={() => {
                hapticLight();
                setCreateOpen((v) => !v);
              }}
              style={styles.createCardHeader}
            >
              <View style={styles.createIconCircle}>
                <PlusIcon size={22} color={CLUB.textInk} />
              </View>
              <View style={styles.createHeaderText}>
                <Text style={styles.createTitle}>Crear tu propia mesa</Text>
                <Text style={styles.createSub}>
                  Elige formato, puntaje y si es pública o privada con amigos
                </Text>
              </View>
            </Pressable>

            {createOpen && (
              <View style={styles.createForm}>
                <Text style={styles.fieldLabel}>Tipo de sala</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    onPress={() => setIsPrivate(false)}
                    style={[styles.pill, !isPrivate && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, !isPrivate && styles.pillTextActive]}>
                      Pública (Lobby)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setIsPrivate(true);
                      setBuyIn(0);
                    }}
                    style={[styles.pill, isPrivate && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, isPrivate && styles.pillTextActive]}>
                      Privada (Amigos)
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.fieldLabel}>Modalidad</Text>
                <View style={styles.chipRow}>
                  {(['1v1', '2v2', '4ffa'] as GameMode[]).map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={[styles.pill, mode === m && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, mode === m && styles.pillTextActive]}>
                        {m === '1v1' ? '1 vs 1' : m === '2v2' ? '2 vs 2' : '4 Todos'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Puntaje objetivo</Text>
                <View style={styles.chipWrapRow}>
                  {TARGET_SCORES.map((pts) => (
                    <Pressable
                      key={pts}
                      onPress={() => setTargetScore(pts)}
                      style={[
                        styles.scoreMini,
                        targetScore === pts && styles.pillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          targetScore === pts && styles.pillTextActive,
                        ]}
                      >
                        {pts}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {!isPrivate ? (
                  <>
                    <Text style={styles.fieldLabel}>
                      Entrada del salón (Fichas de Club)
                    </Text>
                    <View style={styles.chipRow}>
                      {BUY_IN_SALONS.map((s) => {
                        const affordable = clubChips >= s.value;
                        return (
                          <Pressable
                            key={s.value}
                            disabled={!affordable}
                            onPress={() => setBuyIn(s.value)}
                            style={[
                              styles.pill,
                              buyIn === s.value && styles.pillActive,
                              !affordable && { opacity: 0.4 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                buyIn === s.value && styles.pillTextActive,
                              ]}
                            >
                              {s.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <Text style={styles.privateComplianceHint}>
                    Las salas privadas son siempre amistosas (0 fichas de entrada).
                  </Text>
                )}

                <GlossyButton
                  title={isPrivate ? 'Crear sala privada' : 'Abrir mesa en el lobby'}
                  variant={isPrivate ? 'violet' : 'emerald'}
                  loading={busyAction}
                  onPress={handleCreate}
                  style={{ marginTop: 4 }}
                />
              </View>
            )}

            {/* Open Public Tables List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mesas públicas abiertas</Text>
              <Pressable
                onPress={refreshRooms}
                style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.75 }]}
              >
                <RefreshIcon size={14} color={CLUB.cyan} />
                <Text style={styles.refreshText}>
                  {loading ? 'Buscando...' : 'Actualizar'}
                </Text>
              </Pressable>
            </View>

            {rooms.length === 0 ? (
              <View style={styles.emptyLobby}>
                <Text style={styles.emptyTitle}>No hay mesas esperando ahora</Text>
                <Text style={styles.emptySub}>
                  Crea tu propia mesa arriba — puedes invitar amigos o rellenar
                  los asientos vacíos con Bots al instante.
                </Text>
              </View>
            ) : (
              <View style={styles.roomsList}>
                {rooms.map((room) => {
                  const seats = room.room_players ?? [];
                  const slots = Array.from({ length: room.max_players }, (_, i) =>
                    seats.find((s) => s.seat === i)
                  );
                  const modeLabel =
                    room.mode === '1v1'
                      ? '1v1'
                      : room.mode === '2v2'
                      ? '2v2'
                      : '4 Todos';

                  return (
                    <View key={room.id} style={styles.roomCard}>
                      <View style={styles.roomTop}>
                        <Text style={styles.roomMode}>
                          {modeLabel} · {room.target_score} PTS
                        </Text>
                        <View
                          style={[
                            styles.buyInTag,
                            room.buy_in > 0 && { borderColor: CLUB.gold },
                          ]}
                        >
                          <Text
                            style={[
                              styles.buyInTagText,
                              room.buy_in > 0 && { color: CLUB.gold },
                            ]}
                          >
                            {room.buy_in === 0 ? 'GRATIS' : `${room.buy_in} FICHAS`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.seatsRow}>
                        {slots.map((occupant, idx) => (
                          <View key={idx} style={styles.seatSlot}>
                            {occupant ? (
                              <AvatarIllustration
                                isBot={occupant.is_bot}
                                accentColor={idx % 2 === 0 ? CLUB.emerald : CLUB.cyan}
                                size={36}
                              />
                            ) : (
                              <View style={styles.openSeatCircle}>
                                <PlusIcon size={16} color={CLUB.gold} />
                              </View>
                            )}
                            <Text style={styles.seatName} numberOfLines={1}>
                              {occupant ? occupant.display_name : 'Libre'}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <GlossyButton
                        title={
                          room.buy_in === 0
                            ? 'Sentarse (Gratis)'
                            : `Jugar · ${room.buy_in} fichas`
                        }
                        variant={room.buy_in > 0 ? 'gold' : 'emerald'}
                        compact
                        disabled={busyAction}
                        onPress={() => handleJoinById(room.id)}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CLUB.glassBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 40,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  backBtnText: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: CLUB.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: CLUB.surfaceCard,
    borderWidth: 1,
    borderColor: CLUB.borderWarm,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipsText: {
    color: CLUB.gold,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 36,
  },
  authGate: {
    gap: 12,
    paddingTop: 20,
  },
  gateTitle: {
    color: CLUB.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  gateSub: {
    color: CLUB.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderWidth: 1,
    borderColor: CLUB.coral,
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: '#FDA4AF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  privateBox: {
    backgroundColor: 'rgba(22, 42, 72, 0.56)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.22)',
    padding: 13,
    gap: 8,
  },
  boxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boxLabel: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    minHeight: 44,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    paddingHorizontal: 12,
    color: CLUB.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  joinCodeBtn: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: CLUB.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinCodeBtnText: {
    color: CLUB.textInk,
    fontSize: 14,
    fontWeight: '900',
  },
  createCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(46, 209, 138, 0.16)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CLUB.emerald,
    padding: 14,
  },
  createIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CLUB.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHeaderText: {
    flex: 1,
  },
  createTitle: {
    color: CLUB.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  createSub: {
    color: CLUB.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  createForm: {
    backgroundColor: 'rgba(22, 42, 72, 0.56)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.22)',
    padding: 14,
    gap: 10,
  },
  fieldLabel: {
    color: CLUB.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chipWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flex: 1,
    minHeight: 40,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scoreMini: {
    width: '31%',
    minHeight: 38,
    backgroundColor: CLUB.surfaceCardLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#F5C451',
    borderColor: '#FFF2A6',
    boxShadow: '0px 0px 14px rgba(245, 196, 81, 0.45)',
  },
  pillText: {
    color: CLUB.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextActive: {
    color: CLUB.textInk,
  },
  privateComplianceHint: {
    color: CLUB.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  createSubmitBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  createSubmitText: {
    color: CLUB.textInk,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    color: CLUB.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshText: {
    color: CLUB.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyLobby: {
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLUB.glassBorder,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: CLUB.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    color: CLUB.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  roomsList: {
    gap: 10,
  },
  roomCard: {
    backgroundColor: CLUB.surfaceCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CLUB.glassBorder,
    padding: 12,
    gap: 10,
  },
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomMode: {
    color: CLUB.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  buyInTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CLUB.emerald,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  buyInTagText: {
    color: CLUB.emerald,
    fontSize: 11,
    fontWeight: '900',
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  seatSlot: {
    alignItems: 'center',
    gap: 4,
    width: 68,
  },
  openSeatCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: CLUB.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatName: {
    color: CLUB.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  joinRoomBtn: {
    backgroundColor: CLUB.emerald,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: CLUB.emeraldDark,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinRoomText: {
    color: CLUB.textInk,
    fontSize: 14,
    fontWeight: '900',
  },
});
