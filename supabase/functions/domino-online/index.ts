import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

import {
  applyOnlineDraw,
  applyOnlinePass,
  applyOnlinePlay,
  applyTimeoutAutoMove,
  buildSanitizedPublicState,
  dealOnlineHand,
  GameMode,
  PlaySide,
  RoomGameState,
  runBotTurnsUntilHuman,
  SeatAssignment,
  startOnlineMatch,
  TargetScore,
} from './engine.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonRes(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

const VALID_MODES: GameMode[] = ['1v1', '2v2', '4ffa'];
const VALID_TARGETS: TargetScore[] = [50, 100, 150, 200, 250, 300];
const VALID_BUYINS = [0, 100, 500, 1000];
const VALID_SIDES: PlaySide[] = ['left', 'right', 'start'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TILE_ID_RE = /^[0-6]-[0-6]$/;
const ROOM_CODE_RE = /^[A-Z0-9]{6}$/;
const TURN_TIMEOUT_MS = 25_000;
const STALE_WAITING_ROOM_MS = 15 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonRes({ error: 'Sesión requerida para jugar online.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData?.user) {
      return jsonRes({ error: 'Sesión inválida o expirada.' }, 401);
    }
    const user = userData.user;
    const admin = createClient(supabaseUrl, serviceKey);

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return jsonRes({ error: 'Cuerpo JSON inválido.' }, 400);
    }

    const action = String(body?.action ?? '');

    async function enforceRateLimit(bucket: string, maxHits: number, windowSeconds: number) {
      const { data: allowed, error } = await admin.rpc('srv_check_rate_limit', {
        p_user_id: user.id,
        p_bucket: bucket,
        p_max_hits: maxHits,
        p_window_seconds: windowSeconds,
      });
      if (error) {
        throw new Error('Error verificando límite de solicitudes.');
      }
      return Boolean(allowed);
    }

    const { data: profileRow } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();
    const displayName = (profileRow?.display_name || 'Jugador').slice(0, 40);

    async function persistRoomGame(roomId: string, nextState: RoomGameState) {
      let finalState = nextState;

      if (finalState.phase === 'match_over' && !finalState.settled) {
        finalState = { ...finalState, settled: true };
        const humanPlayers = finalState.players.filter((p) => p.isHuman && p.userId);
        // Only distribute chips that were actually escrowed by human players at match start
        const pot =
          typeof finalState.escrowedPool === 'number'
            ? finalState.escrowedPool
            : finalState.buyIn * humanPlayers.length;
        // Divide by full winning team size so a teammate quitting never inflates the remaining player's payout
        const winningTeamSize = finalState.players.filter(
          (p) => p.teamId === finalState.matchWinnerIndex
        ).length;
        const sharePerWinner =
          winningTeamSize > 0 && pot > 0 ? Math.floor(pot / winningTeamSize) : 0;

        for (const hp of humanPlayers) {
          const won = hp.teamId === finalState.matchWinnerIndex;
          const bonusChips = won ? (sharePerWinner > 0 ? sharePerWinner : 50) : 15;
          const xpGain = won ? 45 : 15;

          await admin.rpc('srv_adjust_club_chips', {
            p_user_id: hp.userId!,
            p_delta: bonusChips,
            p_reason: won ? 'online_match_win' : 'online_match_participation',
            p_ref: roomId,
          });

          const { data: prog } = await admin
            .from('user_progress')
            .select('xp, win_streak, best_streak, total_wins, total_matches')
            .eq('user_id', hp.userId!)
            .maybeSingle();

          const curXp = (prog?.xp ?? 0) + xpGain;
          const nextLevel = Math.max(1, Math.floor(curXp / 100) + 1);
          const nextStreak = won ? (prog?.win_streak ?? 0) + 1 : 0;

          await admin
            .from('user_progress')
            .update({
              xp: curXp,
              level: nextLevel,
              win_streak: nextStreak,
              best_streak: Math.max(prog?.best_streak ?? 0, nextStreak),
              total_wins: (prog?.total_wins ?? 0) + (won ? 1 : 0),
              total_matches: (prog?.total_matches ?? 0) + 1,
            })
            .eq('user_id', hp.userId!);
        }
      }

      await admin.from('room_states').upsert(
        { room_id: roomId, full_state: finalState },
        { onConflict: 'room_id' }
      );

      for (const p of finalState.players) {
        if (p.isHuman && p.userId) {
          await admin.from('room_player_hands').upsert(
            {
              room_id: roomId,
              user_id: p.userId,
              seat: p.seat,
              hand: p.hand,
            },
            { onConflict: 'room_id,user_id' }
          );
        }
      }

      const publicState = buildSanitizedPublicState(finalState);
      await admin
        .from('game_rooms')
        .update({
          status: finalState.phase === 'match_over' ? 'finished' : 'playing',
          public_state: publicState,
          turn_started_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      return publicState;
    }

    async function escrowBuyIn(roomId: string, seats: SeatAssignment[], buyIn: number) {
      if (buyIn <= 0) return;
      const deductedUserIds: string[] = [];
      try {
        for (const s of seats) {
          if (s.isBot || !s.userId) continue;
          const { error } = await admin.rpc('srv_adjust_club_chips', {
            p_user_id: s.userId,
            p_delta: -buyIn,
            p_reason: 'online_salon_buy_in',
            p_ref: roomId,
          });
          if (error) {
            if (error.message.includes('INSUFFICIENT_CHIPS')) {
              throw new Error(
                `Uno de los jugadores no tiene suficientes fichas (${buyIn}) para iniciar el salón.`
              );
            }
            throw new Error(error.message);
          }
          deductedUserIds.push(s.userId);
        }
      } catch (err) {
        for (const uid of deductedUserIds) {
          await admin.rpc('srv_adjust_club_chips', {
            p_user_id: uid,
            p_delta: buyIn,
            p_reason: 'online_salon_buy_in_refund',
            p_ref: roomId,
          });
        }
        throw err;
      }
    }

    // Helper: enforce max 1 open waiting room per host + clean stale waiting rooms (>15 min)
    async function cleanupWaitingRoomsForNewHost() {
      const staleCutoff = new Date(Date.now() - STALE_WAITING_ROOM_MS).toISOString();
      await admin
        .from('game_rooms')
        .delete()
        .eq('status', 'waiting')
        .lt('created_at', staleCutoff);

      const { data: myOldRooms } = await admin
        .from('game_rooms')
        .select('id')
        .eq('host_user_id', user.id)
        .eq('status', 'waiting');

      for (const old of myOldRooms ?? []) {
        await admin.from('room_players').delete().eq('room_id', old.id).eq('user_id', user.id);
        const { data: rem } = await admin
          .from('room_players')
          .select('id, user_id, seat')
          .eq('room_id', old.id)
          .order('seat', { ascending: true });
        const count = rem?.length ?? 0;
        if (count === 0) {
          await admin.from('game_rooms').delete().eq('id', old.id);
        } else {
          const nextHost = rem?.find((r) => r.user_id)?.user_id;
          await admin
            .from('game_rooms')
            .update({
              player_count: count,
              ...(nextHost ? { host_user_id: nextHost } : {}),
            })
            .eq('id', old.id);
        }
      }
    }

    async function seatUserInWaitingRoom(room: Record<string, unknown>) {
      const roomId = String(room.id);
      const maxPlayers = Number(room.max_players);
      const buyIn = Number(room.buy_in);

      const { data: existingSeats } = await admin
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('seat', { ascending: true });

      const seatsList = existingSeats ?? [];
      const alreadySeated = seatsList.find((s) => s.user_id === user.id);
      if (alreadySeated) {
        return { room, mySeat: alreadySeated.seat, ok: true };
      }

      if (room.status !== 'waiting' || seatsList.length >= maxPlayers) {
        return { ok: false, error: 'Esta mesa ya está llena o en curso.', status: 400 };
      }

      if (buyIn > 0) {
        const { data: prog } = await admin
          .from('user_progress')
          .select('club_chips')
          .eq('user_id', user.id)
          .maybeSingle();
        if ((prog?.club_chips ?? 1000) < buyIn) {
          return {
            ok: false,
            error: `Necesitas ${buyIn} fichas de club para unirte.`,
            status: 400,
          };
        }
      }

      const takenSeats = new Set(seatsList.map((s) => s.seat));
      let openSeat = 0;
      while (takenSeats.has(openSeat) && openSeat < maxPlayers) openSeat++;

      const { error: seatErr } = await admin.from('room_players').insert({
        room_id: roomId,
        seat: openSeat,
        user_id: user.id,
        display_name: displayName,
        is_bot: false,
      });
      if (seatErr) {
        return { ok: false, error: 'Ese asiento ya fue ocupado. Intenta de nuevo.', status: 409 };
      }

      const newCount = seatsList.length + 1;
      await admin.from('game_rooms').update({ player_count: newCount }).eq('id', roomId);

      if (newCount >= maxPlayers) {
        const allSeats: SeatAssignment[] = [
          ...seatsList.map((s) => ({
            seat: s.seat,
            userId: s.user_id,
            displayName: s.display_name,
            isBot: s.is_bot,
          })),
          { seat: openSeat, userId: user.id, displayName, isBot: false },
        ].sort((a, b) => a.seat - b.seat);

        await escrowBuyIn(roomId, allSeats, buyIn);
        const started = runBotTurnsUntilHuman(
          startOnlineMatch(
            room.mode as GameMode,
            room.target_score as TargetScore,
            allSeats,
            buyIn
          )
        );
        const publicState = await persistRoomGame(roomId, started);
        return {
          ok: true,
          room: { ...room, status: 'playing', player_count: newCount, public_state: publicState },
          mySeat: openSeat,
        };
      }

      return { ok: true, room: { ...room, player_count: newCount }, mySeat: openSeat };
    }

    // ACTION 0: quick_match (Scalable 1-tap matchmaking: joins fullest open public table or creates one)
    if (action === 'quick_match') {
      if (!(await enforceRateLimit('quick_match', 10, 60))) {
        return jsonRes({ error: 'Demasiados intentos seguidos. Espera un momento.' }, 429);
      }

      const mode: GameMode = VALID_MODES.includes(body.mode as GameMode)
        ? (body.mode as GameMode)
        : '1v1';
      const targetScore: TargetScore = VALID_TARGETS.includes(Number(body.targetScore) as TargetScore)
        ? (Number(body.targetScore) as TargetScore)
        : 100;
      const buyIn = VALID_BUYINS.includes(Number(body.buyIn)) ? Number(body.buyIn) : 0;
      const maxPlayers = mode === '1v1' ? 2 : 4;

      if (buyIn > 0) {
        const { data: prog } = await admin
          .from('user_progress')
          .select('club_chips')
          .eq('user_id', user.id)
          .maybeSingle();
        if ((prog?.club_chips ?? 1000) < buyIn) {
          return jsonRes(
            { error: `Necesitas al menos ${buyIn} fichas de club para este salón.` },
            400
          );
        }
      }

      const staleCutoff = new Date(Date.now() - STALE_WAITING_ROOM_MS).toISOString();
      const { data: candidates } = await admin
        .from('game_rooms')
        .select('*')
        .eq('status', 'waiting')
        .eq('is_private', false)
        .eq('mode', mode)
        .eq('buy_in', buyIn)
        .lt('player_count', maxPlayers)
        .gte('created_at', staleCutoff)
        .order('player_count', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5);

      for (const candidate of candidates ?? []) {
        const res = await seatUserInWaitingRoom(candidate);
        if (res.ok) {
          return jsonRes({ room: res.room, mySeat: res.mySeat, matched: true });
        }
      }

      // No matching open table -> create one cleanly (max 1 waiting room per host)
      await cleanupWaitingRoomsForNewHost();
      const code = generateRoomCode();
      const { data: created, error: createErr } = await admin
        .from('game_rooms')
        .insert({
          code,
          host_user_id: user.id,
          mode,
          target_score: targetScore,
          is_private: false,
          buy_in: buyIn,
          status: 'waiting',
          max_players: maxPlayers,
          player_count: 1,
          turn_started_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (createErr || !created) {
        return jsonRes({ error: createErr?.message ?? 'No se pudo abrir mesa rápida.' }, 500);
      }

      await admin.from('room_players').insert({
        room_id: created.id,
        seat: 0,
        user_id: user.id,
        display_name: displayName,
        is_bot: false,
      });

      return jsonRes({ room: created, mySeat: 0, matched: false });
    }

    // ACTION 1: create_room
    if (action === 'create_room') {
      if (!(await enforceRateLimit('create_room', 5, 60))) {
        return jsonRes({ error: 'Creaste demasiadas mesas seguidas. Espera un minuto.' }, 429);
      }

      await cleanupWaitingRoomsForNewHost();

      const mode: GameMode = VALID_MODES.includes(body.mode as GameMode)
        ? (body.mode as GameMode)
        : '1v1';
      const targetScore: TargetScore = VALID_TARGETS.includes(Number(body.targetScore) as TargetScore)
        ? (Number(body.targetScore) as TargetScore)
        : 100;
      const isPrivate = Boolean(body.isPrivate);
      const buyIn = isPrivate
        ? 0
        : VALID_BUYINS.includes(Number(body.buyIn))
        ? Number(body.buyIn)
        : 0;
      const maxPlayers = mode === '1v1' ? 2 : 4;

      if (buyIn > 0) {
        const { data: prog } = await admin
          .from('user_progress')
          .select('club_chips')
          .eq('user_id', user.id)
          .maybeSingle();
        if ((prog?.club_chips ?? 1000) < buyIn) {
          return jsonRes(
            { error: `Necesitas al menos ${buyIn} fichas de club para este salón.` },
            400
          );
        }
      }

      const code = generateRoomCode();
      const { data: room, error: createErr } = await admin
        .from('game_rooms')
        .insert({
          code,
          host_user_id: user.id,
          mode,
          target_score: targetScore,
          is_private: isPrivate,
          buy_in: buyIn,
          status: 'waiting',
          max_players: maxPlayers,
          player_count: 1,
          turn_started_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (createErr || !room) {
        return jsonRes({ error: createErr?.message ?? 'No se pudo crear la mesa.' }, 500);
      }

      await admin.from('room_players').insert({
        room_id: room.id,
        seat: 0,
        user_id: user.id,
        display_name: displayName,
        is_bot: false,
      });

      return jsonRes({ room, mySeat: 0 });
    }

    // ACTION 2: join_room (by roomId or 6-char private code)
    if (action === 'join_room') {
      if (!(await enforceRateLimit('join_room', 15, 60))) {
        return jsonRes({ error: 'Demasiados intentos de unión. Espera un momento.' }, 429);
      }

      const roomIdInput = body.roomId ? String(body.roomId).trim() : null;
      const codeInput = body.code ? String(body.code).trim().toUpperCase() : null;

      if (roomIdInput && !UUID_RE.test(roomIdInput)) {
        return jsonRes({ error: 'ID de mesa inválido.' }, 400);
      }
      if (!roomIdInput && codeInput && !ROOM_CODE_RE.test(codeInput)) {
        return jsonRes({ error: 'Código de mesa inválido (6 caracteres).' }, 400);
      }

      let query = admin.from('game_rooms').select('*');
      if (roomIdInput) query = query.eq('id', roomIdInput);
      else if (codeInput) query = query.eq('code', codeInput);
      else return jsonRes({ error: 'Indica código o mesa.' }, 400);

      const { data: room } = await query.maybeSingle();
      if (!room) return jsonRes({ error: 'Mesa no encontrada.' }, 404);

      const res = await seatUserInWaitingRoom(room);
      if (!res.ok) {
        return jsonRes({ error: res.error }, res.status ?? 400);
      }
      return jsonRes({ room: res.room, mySeat: res.mySeat });
    }

    const roomId = String(body.roomId ?? '').trim();
    if (!UUID_RE.test(roomId)) {
      return jsonRes({ error: 'ID de mesa inválido.' }, 400);
    }

    // ACTION 3: start_with_bots
    // Rule v1: Paid buy-in tables NEVER start with bots unless the host explicitly requests
    // converting the table to a free friendly match (`convertToFree: true`), charging 0 chips.
    if (action === 'start_with_bots') {
      if (!(await enforceRateLimit('start_with_bots', 10, 60))) {
        return jsonRes({ error: 'Demasiadas solicitudes.' }, 429);
      }

      const { data: room } = await admin
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();
      if (!room) return jsonRes({ error: 'Mesa no encontrada.' }, 404);
      if (room.host_user_id !== user.id) {
        return jsonRes({ error: 'Solo el anfitrión puede iniciar con Bots.' }, 403);
      }
      if (room.status !== 'waiting') {
        return jsonRes({ error: 'La mesa ya inició.' }, 400);
      }

      const convertToFree = Boolean(body.convertToFree);
      if (Number(room.buy_in) > 0 && !convertToFree) {
        return jsonRes(
          {
            error:
              'Las mesas con fichas no admiten Bots. Usa «Jugar gratis con Bots» para convertirla en mesa amistosa sin fichas.',
          },
          400
        );
      }

      const { data: existingSeats } = await admin
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('seat', { ascending: true });

      const seatsList = existingSeats ?? [];
      const taken = new Set(seatsList.map((s) => s.seat));
      const botNames = ['Bot', 'Bot Oeste', 'Bot Compa', 'Bot Este'];
      const fullSeats: SeatAssignment[] = seatsList.map((s) => ({
        seat: s.seat,
        userId: s.user_id,
        displayName: s.display_name,
        isBot: s.is_bot,
      }));

      for (let s = 0; s < room.max_players; s++) {
        if (!taken.has(s)) {
          const bName = room.max_players === 2 ? 'Bot' : botNames[s] ?? `Bot ${s}`;
          await admin.from('room_players').insert({
            room_id: roomId,
            seat: s,
            user_id: null,
            display_name: bName,
            is_bot: true,
          });
          fullSeats.push({ seat: s, userId: null, displayName: bName, isBot: true });
        }
      }
      fullSeats.sort((a, b) => a.seat - b.seat);

      const convertedToFree = Number(room.buy_in) > 0;
      const effectiveBuyIn = 0;

      await admin
        .from('game_rooms')
        .update({ player_count: room.max_players, buy_in: effectiveBuyIn })
        .eq('id', roomId);

      const started = runBotTurnsUntilHuman(
        startOnlineMatch(
          room.mode as GameMode,
          room.target_score as TargetScore,
          fullSeats,
          effectiveBuyIn
        )
      );
      const publicState = await persistRoomGame(roomId, started);
      return jsonRes({ ok: true, convertedToFree, publicState });
    }

    // ACTION 4: leave_room
    // Waiting room: removes player (and transfers host if needed).
    // Active match: substitutes leaving human with a Bot so remaining players finish cleanly!
    if (action === 'leave_room') {
      if (!(await enforceRateLimit('leave_room', 20, 60))) {
        return jsonRes({ error: 'Demasiadas solicitudes.' }, 429);
      }

      const { data: room } = await admin
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();
      if (!room) return jsonRes({ ok: true });

      if (room.status === 'waiting') {
        await admin.from('room_players').delete().eq('room_id', roomId).eq('user_id', user.id);
        const { data: remaining } = await admin
          .from('room_players')
          .select('*')
          .eq('room_id', roomId)
          .order('seat', { ascending: true });
        const count = remaining?.length ?? 0;
        if (count === 0) {
          await admin.from('game_rooms').delete().eq('id', roomId);
        } else {
          const nextHost =
            room.host_user_id === user.id
              ? remaining?.find((r) => r.user_id)?.user_id ?? room.host_user_id
              : room.host_user_id;
          await admin
            .from('game_rooms')
            .update({ player_count: count, host_user_id: nextHost })
            .eq('id', roomId);
        }
        return jsonRes({ ok: true });
      }

      if (room.status === 'playing') {
        const { data: stateRow } = await admin
          .from('room_states')
          .select('full_state')
          .eq('room_id', roomId)
          .maybeSingle();

        if (stateRow?.full_state) {
          const fullState = stateRow.full_state as RoomGameState;
          const seatIdx = fullState.players.findIndex((p) => p.isHuman && p.userId === user.id);

          if (seatIdx !== -1) {
            const departing = fullState.players[seatIdx];
            const botDisplayName = `${departing.name.replace(/\s*\(Bot\)$/i, '').slice(0, 22)} (Bot)`;

            const updatedPlayers = fullState.players.map((p, idx) =>
              idx === seatIdx
                ? {
                    ...p,
                    isHuman: false,
                    userId: null,
                    name: botDisplayName,
                    lastAction: 'Sustituido por Bot',
                  }
                : p
            );

            await admin
              .from('room_players')
              .update({ is_bot: true, user_id: null, display_name: botDisplayName })
              .eq('room_id', roomId)
              .eq('seat', departing.seat);

            await admin
              .from('room_player_hands')
              .delete()
              .eq('room_id', roomId)
              .eq('user_id', user.id);

            const remainingHumans = updatedPlayers.filter((p) => p.isHuman && p.userId);
            if (remainingHumans.length === 0) {
              // All humans left -> finish the room cleanly
              await admin
                .from('game_rooms')
                .update({ status: 'finished' })
                .eq('id', roomId);
              return jsonRes({ ok: true, substitutedByBot: true, roomClosed: true });
            }

            let nextState: RoomGameState = {
              ...fullState,
              players: updatedPlayers,
            };
            if (nextState.phase === 'playing') {
              nextState = runBotTurnsUntilHuman(nextState);
            }
            const publicState = await persistRoomGame(roomId, nextState);
            return jsonRes({ ok: true, substitutedByBot: true, publicState });
          }
        }
      }

      return jsonRes({ ok: true });
    }

    if (action === 'claim_timeout') {
      if (!(await enforceRateLimit('claim_timeout', 15, 60))) {
        return jsonRes({ error: 'Demasiadas solicitudes de tiempo.' }, 429);
      }
    } else if (action === 'next_hand' || action === 'rematch') {
      if (!(await enforceRateLimit('room_transition', 20, 60))) {
        return jsonRes({ error: 'Demasiadas solicitudes.' }, 429);
      }
    } else {
      if (!(await enforceRateLimit('room_move', 60, 60))) {
        return jsonRes({ error: 'Demasiadas jugadas por minuto.' }, 429);
      }
    }

    const [{ data: stateRow }, { data: roomMeta }] = await Promise.all([
      admin.from('room_states').select('full_state').eq('room_id', roomId).maybeSingle(),
      admin.from('game_rooms').select('turn_started_at').eq('id', roomId).maybeSingle(),
    ]);

    if (!stateRow?.full_state) {
      return jsonRes({ error: 'Estado de mesa no encontrado.' }, 404);
    }

    const fullState = stateRow.full_state as RoomGameState;
    const myPlayer = fullState.players.find((p) => p.userId === user.id);
    if (!myPlayer) {
      return jsonRes({ error: 'No estás sentado en esta mesa.' }, 403);
    }

    let nextState: RoomGameState;
    if (action === 'play_tile') {
      const tileId = String(body.tileId ?? '');
      const side = String(body.side ?? '') as PlaySide;
      if (!TILE_ID_RE.test(tileId) || !VALID_SIDES.includes(side)) {
        return jsonRes({ error: 'Ficha o lado de jugada inválido.' }, 400);
      }
      nextState = applyOnlinePlay(fullState, myPlayer.seat, tileId, side);
      nextState = runBotTurnsUntilHuman(nextState);
    } else if (action === 'draw_tile') {
      let boneyardIndex: number | undefined = undefined;
      if (body.boneyardIndex !== undefined && body.boneyardIndex !== null) {
        const idx = Number(body.boneyardIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx > 27) {
          return jsonRes({ error: 'Índice de pozo inválido.' }, 400);
        }
        boneyardIndex = idx;
      }
      nextState = applyOnlineDraw(fullState, myPlayer.seat, boneyardIndex);
      nextState = runBotTurnsUntilHuman(nextState);
    } else if (action === 'pass_turn') {
      nextState = applyOnlinePass(fullState, myPlayer.seat);
      nextState = runBotTurnsUntilHuman(nextState);
    } else if (action === 'claim_timeout') {
      if (fullState.phase !== 'playing') {
        return jsonRes({ error: 'La mano no está activa.' }, 400);
      }
      const turnStartedMs = roomMeta?.turn_started_at
        ? Date.parse(roomMeta.turn_started_at)
        : 0;
      if (Date.now() - turnStartedMs < TURN_TIMEOUT_MS) {
        return jsonRes({ error: 'El turno aún no ha expirado.' }, 409);
      }
      nextState = applyTimeoutAutoMove(fullState);
      nextState = runBotTurnsUntilHuman(nextState);
    } else if (action === 'next_hand') {
      if (fullState.phase !== 'round_summary') {
        return jsonRes({ error: 'La mano aún está en curso.' }, 400);
      }
      nextState = runBotTurnsUntilHuman(dealOnlineHand(fullState));
    } else if (action === 'rematch') {
      if (fullState.phase !== 'match_over') {
        return jsonRes({ error: 'La partida aún no termina.' }, 400);
      }
      const seats: SeatAssignment[] = fullState.players.map((p) => ({
        seat: p.seat,
        userId: p.userId ?? null,
        displayName: p.name,
        isBot: !p.isHuman,
      }));
      // Never allow buy-in escrow on a rematch that includes any substitute Bot
      const hasBots = seats.some((s) => s.isBot);
      const effectiveBuyIn = hasBots ? 0 : fullState.buyIn;
      if (hasBots && fullState.buyIn > 0) {
        await admin.from('game_rooms').update({ buy_in: 0 }).eq('id', roomId);
      }
      await escrowBuyIn(roomId, seats, effectiveBuyIn);
      nextState = runBotTurnsUntilHuman(
        startOnlineMatch(fullState.mode, fullState.targetScore, seats, effectiveBuyIn)
      );
    } else {
      return jsonRes({ error: `Acción no soportada: ${action}` }, 400);
    }

    const publicState = await persistRoomGame(roomId, nextState);
    return jsonRes({ ok: true, publicState });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor.';
    return jsonRes({ error: message }, 400);
  }
});
