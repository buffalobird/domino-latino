import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { sanitizeAvatarConfig } from '@/constants/avatarCatalog';
import { FONT } from '@/constants/tokens';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { GameMode, TargetScore, UI_TARGET_SCORES } from '@/engine/types';
import { TableCompanion } from '@/lib/companionsService';
import {
  createOnlineRoom,
  joinOnlineRoom,
  listOpenPublicRooms,
  OnlineRoomRow,
  quickMatchOnlineRoom,
} from '@/lib/onlineService';
import { hapticLight, hapticSnap } from '@/utils/feedback';
import { AvatarIllustration } from './AvatarIllustration';
import { GlossyButton } from './GlossyButton';
import {
  ChevronLeftIcon,
  ChipIcon,
  GlobeIcon,
  KeyIcon,
  LockIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
} from './Icons';

interface OnlineLobbyViewProps {
  clubChips: number;
  defaultMode: GameMode;
  defaultTargetScore: TargetScore;
  initialTab?: 'public' | 'private';
  companions?: TableCompanion[];
  onEnteredRoom: (room: OnlineRoomRow, mySeat: number) => void;
  onRequestAuth?: () => void;
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
  companions = [],
  onEnteredRoom,
  onRequestAuth,
  onBack,
}: OnlineLobbyViewProps) {
  const { isSignedIn } = useAuth();
  const { palette } = usePalette();
  const [tab, setTab] = useState<'public' | 'private'>(initialTab);
  const [rooms, setRooms] = useState<OnlineRoomRow[]>([]);
  const [modeFilter, setModeFilter] = useState<GameMode | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create Room config
  const [createOpen, setCreateOpen] = useState(initialTab === 'private');
  const [mode, setMode] = useState<GameMode>(defaultMode);
  const [targetScore, setTargetScore] = useState<TargetScore>(
    UI_TARGET_SCORES.includes(defaultTargetScore) ? defaultTargetScore : 100
  );
  const [buyIn, setBuyIn] = useState<number>(0);

  // Join Private Code
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setCreateOpen(initialTab === 'private');
  }, [initialTab]);

  const refreshRooms = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const list = await listOpenPublicRooms(modeFilter);
      setRooms(list);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, modeFilter]);

  useEffect(() => {
    if (!isSignedIn || tab !== 'public') return;
    refreshRooms();
    const poll = setInterval(() => {
      refreshRooms();
    }, 8000);
    return () => clearInterval(poll);
  }, [isSignedIn, tab, refreshRooms]);

  const handleQuickMatch = async () => {
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const targetMode: GameMode = modeFilter === 'all' ? defaultMode : modeFilter;
      const res = await quickMatchOnlineRoom({
        mode: targetMode,
        targetScore: defaultTargetScore,
        buyIn: 0,
      });
      hapticSnap();
      onEnteredRoom(res.room, res.mySeat);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo buscar mesa rápida.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleCreate = async (privateRoom: boolean) => {
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const effectiveBuyIn = privateRoom ? 0 : buyIn;
      const res = await createOnlineRoom({
        mode,
        targetScore,
        isPrivate: privateRoom,
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

  const handleInviteCompanion = async (companion: TableCompanion) => {
    setErrorMsg(null);
    setBusyAction(true);
    try {
      const res = await createOnlineRoom({
        mode: defaultMode,
        targetScore: defaultTargetScore,
        isPrivate: true,
        buyIn: 0,
      });
      hapticSnap();
      onEnteredRoom(res.room, res.mySeat);
      Share.share({
        message: `¡Hola ${companion.companion_name}! Abrí una mesa en Dominó Latino (código: ${res.room.code}). ¿Echamos una partida?`,
      }).catch(() => {});
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo abrir la mesa para invitar.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const pillBase = {
    backgroundColor: palette.surfaceCardAlt,
    borderColor: palette.borderSubtle,
    borderBottomColor: palette.surfaceCardAltLip,
  };
  const pillActiveDyn = {
    backgroundColor: palette.selectedBg,
    borderColor: palette.selectedBorder,
    borderBottomColor: palette.selectedLip,
  };

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: palette.borderSubtle }]}>
        <Pressable
          onPress={() => {
            hapticLight();
            onBack();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.78 }]}
        >
          <ChevronLeftIcon size={18} color={palette.textPrimary} />
          <Text style={[styles.backBtnText, { color: palette.textPrimary }]}>Inicio</Text>
        </Pressable>

        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {tab === 'public' ? 'Salas Online' : 'Con Amigos'}
        </Text>

        <View
          style={[
            styles.chipsPill,
            {
              backgroundColor: palette.chipPillBg,
              borderColor: palette.borderWarm,
            },
          ]}
        >
          <ChipIcon size={14} color={palette.chipIconColor} />
          <Text style={[styles.chipsText, { color: palette.chipPillText }]}>
            {clubChips.toLocaleString('es-ES')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isSignedIn ? (
          <View
            style={[
              styles.authGate,
              {
                backgroundColor: palette.surfaceCard,
                borderColor: palette.borderSubtle,
                borderBottomColor: palette.surfaceCardLip,
              },
            ]}
          >
            <Text style={[styles.gateTitle, { color: palette.textPrimary }]}>
              Entra al Club Online
            </Text>
            <Text style={[styles.gateSub, { color: palette.textSecondary }]}>
              Conéctate en segundos con Apple o Google para jugar en mesas abiertas o crear salas privadas con tus amigos.
            </Text>
            <GlossyButton
              title="Iniciar sesión"
              variant="emerald"
              onPress={() => onRequestAuth?.()}
            />
          </View>
        ) : (
          <>
            {/* Clean 2-Door Segmented Switcher */}
            <View
              style={[
                styles.segmentedWrap,
                {
                  backgroundColor: palette.trayBg,
                  borderColor: palette.trayBorder,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  hapticLight();
                  setTab('public');
                  setCreateOpen(false);
                }}
                style={[
                  styles.segmentTab,
                  tab === 'public' && {
                    backgroundColor: palette.selectedBg,
                    borderBottomColor: palette.selectedLip,
                  },
                ]}
              >
                <GlobeIcon
                  size={15}
                  color={tab === 'public' ? palette.selectedText : palette.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentTabText,
                    {
                      color:
                        tab === 'public' ? palette.selectedText : palette.textSecondary,
                    },
                  ]}
                >
                  Mesas Abiertas
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticLight();
                  setTab('private');
                  setCreateOpen(true);
                }}
                style={[
                  styles.segmentTab,
                  tab === 'private' && {
                    backgroundColor: palette.selectedBg,
                    borderBottomColor: palette.selectedLip,
                  },
                ]}
              >
                <KeyIcon
                  size={15}
                  color={tab === 'private' ? palette.selectedText : palette.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentTabText,
                    {
                      color:
                        tab === 'private' ? palette.selectedText : palette.textSecondary,
                    },
                  ]}
                >
                  Con Amigos
                </Text>
              </Pressable>
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

            {tab === 'private' ? (
              <>
                {/* 1. Join Private Room by 6-char Code */}
                <View
                  style={[
                    styles.tactileCard,
                    {
                      backgroundColor: palette.surfaceCard,
                      borderColor: palette.borderSubtle,
                      borderBottomColor: palette.surfaceCardLip,
                    },
                  ]}
                >
                  <View style={styles.boxLabelRow}>
                    <LockIcon size={14} color={palette.brandAccent} />
                    <Text style={[styles.cardTitleSm, { color: palette.textPrimary }]}>
                      Tengo código de invitación
                    </Text>
                  </View>
                  <View style={styles.codeRow}>
                    <TextInput
                      value={joinCode}
                      onChangeText={setJoinCode}
                      placeholder="Ej. K7M2P9"
                      placeholderTextColor={palette.textMuted}
                      autoCapitalize="characters"
                      maxLength={6}
                      style={[
                        styles.codeInput,
                        {
                          backgroundColor: palette.modalInputBg,
                          borderColor: palette.borderSubtle,
                          color: palette.textPrimary,
                        },
                      ]}
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

                {/* 2. Create Private Table */}
                <View
                  style={[
                    styles.tactileCard,
                    {
                      backgroundColor: palette.surfaceCard,
                      borderColor: palette.borderSubtle,
                      borderBottomColor: palette.surfaceCardLip,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitleSm, { color: palette.textPrimary }]}>
                    Abrir nueva sala privada
                  </Text>
                  <Text style={[styles.cardSubSm, { color: palette.textSecondary }]}>
                    Obtendrás un código de 6 letras para compartir por WhatsApp o mensaje (siempre gratis, 0 fichas).
                  </Text>

                  <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>
                    MODALIDAD
                  </Text>
                  <View style={styles.chipRow}>
                    {(['1v1', '2v2', '4ffa'] as GameMode[]).map((m) => (
                      <Pressable
                        key={m}
                        onPress={() => {
                          hapticLight();
                          setMode(m);
                        }}
                        style={[styles.pill, pillBase, mode === m && pillActiveDyn]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            {
                              color:
                                mode === m ? palette.selectedText : palette.textPrimary,
                            },
                          ]}
                        >
                          {m === '1v1' ? '1 vs 1' : m === '2v2' ? '2 vs 2' : '4 Jug.'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>
                    META DE PUNTOS
                  </Text>
                  <View style={styles.chipRow}>
                    {UI_TARGET_SCORES.map((pts) => (
                      <Pressable
                        key={pts}
                        onPress={() => {
                          hapticLight();
                          setTargetScore(pts);
                        }}
                        style={[
                          styles.pill,
                          pillBase,
                          targetScore === pts && pillActiveDyn,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            {
                              color:
                                targetScore === pts
                                  ? palette.selectedText
                                  : palette.textPrimary,
                            },
                          ]}
                        >
                          {pts}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <GlossyButton
                    title="Crear sala y obtener código"
                    variant="emerald"
                    loading={busyAction}
                    onPress={() => handleCreate(true)}
                    style={{ marginTop: 4 }}
                  />
                </View>

                {/* 3. Intimate Table Companions Circle */}
                {companions.length > 0 && (
                  <View style={styles.companionsSection}>
                    <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                      Tus compañeros de mesa
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.companionsRow}
                    >
                      {companions.map((c) => (
                        <Pressable
                          key={c.companion_user_id}
                          disabled={busyAction}
                          onPress={() => handleInviteCompanion(c)}
                          style={({ pressed }) => [
                            styles.companionPill,
                            {
                              backgroundColor: palette.surfaceCard,
                              borderColor: palette.borderWarm,
                              borderBottomColor: palette.surfaceCardLip,
                            },
                            pressed && { opacity: 0.85 },
                          ]}
                        >
                          <AvatarIllustration
                            isBot={false}
                            accentColor={palette.brandAccent}
                            size={40}
                            avatarConfig={c.companion_avatar ?? undefined}
                          />
                          <Text
                            style={[
                              styles.companionPillName,
                              { color: palette.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {c.companion_name}
                          </Text>
                          <Text
                            style={[
                              styles.companionPillAction,
                              { color: palette.brandAccent },
                            ]}
                          >
                            Invitar
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* PUBLIC TAB: 1-Tap Quick Seat */}
                <GlossyButton
                  title="Sentarme ya"
                  subtitle={`${
                    modeFilter === 'all'
                      ? defaultMode === '1v1'
                        ? '1 vs 1'
                        : defaultMode === '2v2'
                        ? '2 vs 2'
                        : '4 Jug.'
                      : modeFilter === '1v1'
                      ? '1 vs 1'
                      : modeFilter === '2v2'
                      ? '2 vs 2'
                      : '4 Jug.'
                  } · Mesa pública al instante`}
                  variant="emerald"
                  icon={<PlayIcon size={18} color={palette.textOnPrimary} />}
                  loading={busyAction}
                  onPress={handleQuickMatch}
                />

                {/* Collapsible Public Room Creator */}
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setCreateOpen((v) => !v);
                  }}
                  style={[
                    styles.createCardHeader,
                    {
                      backgroundColor: palette.surfaceCard,
                      borderColor: palette.borderAccent,
                      borderBottomColor: palette.surfaceCardLip,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.createIconCircle,
                      { backgroundColor: palette.accent },
                    ]}
                  >
                    <PlusIcon size={20} color={palette.textOnAccent} />
                  </View>
                  <View style={styles.createHeaderText}>
                    <Text style={[styles.createTitle, { color: palette.textPrimary }]}>
                      Abrir mi propia mesa pública
                    </Text>
                    <Text style={[styles.createSub, { color: palette.textSecondary }]}>
                      Elige modalidad, meta y salón de fichas
                    </Text>
                  </View>
                </Pressable>

                {createOpen && (
                  <View
                    style={[
                      styles.tactileCard,
                      {
                        backgroundColor: palette.surfaceCard,
                        borderColor: palette.borderSubtle,
                        borderBottomColor: palette.surfaceCardLip,
                      },
                    ]}
                  >
                    <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>
                      MODALIDAD
                    </Text>
                    <View style={styles.chipRow}>
                      {(['1v1', '2v2', '4ffa'] as GameMode[]).map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => setMode(m)}
                          style={[styles.pill, pillBase, mode === m && pillActiveDyn]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              {
                                color:
                                  mode === m ? palette.selectedText : palette.textPrimary,
                              },
                            ]}
                          >
                            {m === '1v1' ? '1 vs 1' : m === '2v2' ? '2 vs 2' : '4 Jug.'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>
                      META DE PUNTOS
                    </Text>
                    <View style={styles.chipRow}>
                      {UI_TARGET_SCORES.map((pts) => (
                        <Pressable
                          key={pts}
                          onPress={() => setTargetScore(pts)}
                          style={[
                            styles.pill,
                            pillBase,
                            targetScore === pts && pillActiveDyn,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              {
                                color:
                                  targetScore === pts
                                    ? palette.selectedText
                                    : palette.textPrimary,
                              },
                            ]}
                          >
                            {pts}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>
                      ENTRADA DEL SALÓN (FICHAS DE CLUB)
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
                              pillBase,
                              buyIn === s.value && pillActiveDyn,
                              !affordable && { opacity: 0.4 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                {
                                  color:
                                    buyIn === s.value
                                      ? palette.selectedText
                                      : palette.textPrimary,
                                },
                              ]}
                            >
                              {s.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <GlossyButton
                      title="Publicar mesa en el lobby"
                      variant="emerald"
                      loading={busyAction}
                      onPress={() => handleCreate(false)}
                      style={{ marginTop: 4 }}
                    />
                  </View>
                )}

                {/* Open Public Tables List */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                    Mesas esperando jugadores
                  </Text>
                  <Pressable
                    onPress={refreshRooms}
                    style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.75 }]}
                  >
                    <RefreshIcon size={14} color={palette.accent} />
                    <Text style={[styles.refreshText, { color: palette.accent }]}>
                      {loading ? 'Buscando...' : 'Actualizar'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.chipRow}>
                  {(
                    [
                      { id: 'all', label: 'Todas' },
                      { id: '1v1', label: '1 vs 1' },
                      { id: '2v2', label: '2 vs 2' },
                      { id: '4ffa', label: '4 Jug.' },
                    ] as const
                  ).map((f) => {
                    const active = modeFilter === f.id;
                    return (
                      <Pressable
                        key={f.id}
                        onPress={() => {
                          hapticLight();
                          setModeFilter(f.id);
                        }}
                        style={[styles.pill, pillBase, active && pillActiveDyn]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            {
                              color: active ? palette.selectedText : palette.textPrimary,
                            },
                          ]}
                        >
                          {f.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {rooms.length === 0 ? (
                  <View
                    style={[
                      styles.emptyLobby,
                      {
                        backgroundColor: palette.surfaceCard,
                        borderColor: palette.borderSubtle,
                        borderBottomColor: palette.surfaceCardLip,
                      },
                    ]}
                  >
                    <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                      La mesa está lista para ti
                    </Text>
                    <Text style={[styles.emptySub, { color: palette.textSecondary }]}>
                      Toca «Sentarme ya» arriba para abrir mesa al instante — avisaremos apenas llegue alguien o podrás iniciar cuando gustes.
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
                          ? '1 vs 1'
                          : room.mode === '2v2'
                          ? '2 vs 2'
                          : '4 Jug.';

                      return (
                        <View
                          key={room.id}
                          style={[
                            styles.roomCard,
                            {
                              backgroundColor: palette.surfaceCard,
                              borderColor: palette.borderSubtle,
                              borderBottomColor: palette.surfaceCardLip,
                            },
                          ]}
                        >
                          <View style={styles.roomTop}>
                            <Text
                              style={[styles.roomMode, { color: palette.textPrimary }]}
                            >
                              {modeLabel} · A {room.target_score} pts
                            </Text>
                            <View
                              style={[
                                styles.buyInTag,
                                {
                                  borderColor:
                                    room.buy_in > 0
                                      ? palette.brandAccent
                                      : palette.accent,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.buyInTagText,
                                  {
                                    color:
                                      room.buy_in > 0
                                        ? palette.brandAccent
                                        : palette.accent,
                                  },
                                ]}
                              >
                                {room.buy_in === 0
                                  ? 'AMISTOSA'
                                  : `${room.buy_in} FICHAS`}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.seatsRow}>
                            {slots.map((occupant, idx) => (
                              <View key={idx} style={styles.seatSlot}>
                                {occupant ? (
                                  <AvatarIllustration
                                    isBot={occupant.is_bot}
                                    seatHint={idx}
                                    accentColor={
                                      idx % 2 === 0 ? palette.accent : palette.brandAccent
                                    }
                                    size={38}
                                    avatarConfig={
                                      !occupant.is_bot && occupant.avatar_config
                                        ? sanitizeAvatarConfig(occupant.avatar_config)
                                        : undefined
                                    }
                                  />
                                ) : (
                                  <View
                                    style={[
                                      styles.openSeatCircle,
                                      { borderColor: palette.brandAccent },
                                    ]}
                                  >
                                    <PlusIcon size={15} color={palette.brandAccent} />
                                  </View>
                                )}
                                <Text
                                  style={[
                                    styles.seatName,
                                    { color: palette.textSecondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {occupant ? occupant.display_name : 'Libre'}
                                </Text>
                              </View>
                            ))}
                          </View>

                          <GlossyButton
                            title={
                              room.buy_in === 0
                                ? 'Sentarme en esta mesa'
                                : `Entrar · ${room.buy_in} fichas`
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
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 40,
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 14,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 19,
  },
  chipsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipsText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  scrollContent: {
    padding: 16,
    gap: 13,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 36,
  },
  authGate: {
    borderRadius: 22,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 20,
    gap: 12,
    marginTop: 12,
  },
  gateTitle: {
    fontFamily: FONT.display,
    fontSize: 22,
    textAlign: 'center',
  },
  gateSub: {
    fontFamily: FONT.semi,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  segmentedWrap: {
    flexDirection: 'row',
    gap: 6,
    padding: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  segmentTabText: {
    fontFamily: FONT.extraBold,
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  errorText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    textAlign: 'center',
  },
  tactileCard: {
    borderRadius: 20,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 14,
    gap: 10,
  },
  boxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitleSm: {
    fontFamily: FONT.display,
    fontSize: 16.5,
  },
  cardSubSm: {
    fontFamily: FONT.semi,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: -4,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1.25,
    paddingHorizontal: 14,
    fontFamily: FONT.display,
    fontSize: 16,
    letterSpacing: 2.5,
  },
  createCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 13,
  },
  createIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHeaderText: {
    flex: 1,
  },
  createTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 15,
  },
  createSub: {
    fontFamily: FONT.semi,
    fontSize: 12,
    marginTop: 1,
  },
  fieldLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    letterSpacing: 0.9,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 7,
  },
  pill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pillText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: FONT.display,
    fontSize: 16.5,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  refreshText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  emptyLobby: {
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONT.display,
    fontSize: 16.5,
  },
  emptySub: {
    fontFamily: FONT.semi,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  roomsList: {
    gap: 10,
  },
  roomCard: {
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 13,
    gap: 11,
  },
  roomTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomMode: {
    fontFamily: FONT.display,
    fontSize: 15,
  },
  buyInTag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
  },
  buyInTagText: {
    fontFamily: FONT.extraBold,
    fontSize: 10.5,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  seatSlot: {
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  openSeatCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatName: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  companionsSection: {
    gap: 8,
    marginTop: 2,
  },
  companionsRow: {
    gap: 10,
    paddingVertical: 2,
  },
  companionPill: {
    alignItems: 'center',
    width: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 3.5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  companionPillName: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    textAlign: 'center',
  },
  companionPillAction: {
    fontFamily: FONT.extraBold,
    fontSize: 10.5,
  },
});
