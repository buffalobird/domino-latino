import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

const VALID_MODES = ['1v1', '2v2', '4ffa'] as const;
const VALID_TARGETS = [50, 100, 150, 200, 250, 300] as const;
const VALID_THEMES = ['caribe', 'caoba', 'esmeralda', 'habana_noche', 'casino_oro'] as const;
const VALID_TILE_STYLES = ['marfil', 'perla', 'jade', 'caoba_crema', 'ebano_oro', 'diamante'] as const;

const VALID_BODY_TYPES = ['feminine', 'masculine'];
const VALID_SKIN_TONES = ['marfil', 'claro', 'calido', 'dorado', 'canela', 'bronce', 'cacao', 'ebano'];
const VALID_FACE_SHAPES = ['oval', 'angular', 'soft', 'slim'];
const VALID_EYES = [
  'classic', 'almond', 'bright', 'focused', 'wink',
  'relaxed', 'sleepy', 'sharp', 'closed_calm', 'puppy', 'shocked', 'crazy',
  'goofy_squint', 'skeptic', 'hero_white', 'rock_smoky', 'cat_gold', 'laser_red',
  'hearts', 'star',
];
const VALID_EYE_COLORS = ['#4A2B18', '#1B202C', '#8A5D28', '#1F7A4C', '#1D6FD6', '#64748B'];
const VALID_EYEBROWS = ['natural', 'thick', 'arched', 'straight', 'expressive'];
const VALID_NOSES = ['classic', 'small', 'straight', 'wide', 'defined'];
const VALID_MOUTHS = [
  'smile', 'grin', 'smirk', 'smirk_teeth', 'lips', 'calm', 'laugh',
  'tongue', 'surprised_o', 'grumpy', 'grit',
  'cat_mouth', 'buck_teeth', 'vampire', 'stitched', 'pacifier',
  'gold_tooth', 'daisy', 'wide_villain', 'rose',
];
const VALID_HAIRS = [
  'classic', 'textured_crop', 'messy', 'fade', 'buzz', 'receding', 'bald',
  'spiky', 'spiky_wild', 'curtain', 'shaggy', 'side_sweep', 'wavy_part',
  'bowl_mod', 'slick_tail', 'samurai_bun', 'rocker_long', 'dreads_band',
  'straight_long', 'waves', 'bob', 'ponytail', 'bun', 'curls', 'afro', 'braids', 'pompadour',
];
const VALID_HAIR_COLORS = ['#1C202B', '#2B1E17', '#63412B', '#9C6B3B', '#E0B45A', '#B84A27', '#CBD5E1', '#7E224C', '#0EA5E9'];
const VALID_FACIALS = ['none', 'blush', 'freckles', 'hoops', 'stubble', 'beard', 'mustache', 'goatee', 'dali', 'pirate_beard'];
const VALID_OUTFITS = [
  'tee', 'vneck', 'tank', 'stripes', 'polo', 'blouse', 'sweater',
  'tie_shirt', 'hoodie', 'flannel', 'rock_skull', 'hawaiian_floral',
  'open_shirt', 'suspenders', 'ballet', 'vest_bowtie', 'kimono',
  'jacket', 'pirate', 'winter_fur', 'princess', 'blazer',
  'carnival', 'pharaoh', 'queen', 'royal_tux',
];
const VALID_OUTFIT_COLORS = ['#2563EB', '#F43F5E', '#10B981', '#F8FAFC', '#1E293B', '#8B5CF6', '#F59E0B', '#0D9488', '#EC4899'];
const VALID_GLASSES = ['none', 'round', 'square', 'cat_eye', 'hearts_shades', 'aviator', 'wayfarer', 'pixel_boss', 'star_party', 'monocle', 'gold_visor'];
const VALID_HATS = ['none', 'cap', 'beanie', 'headband', 'flower', 'beret', 'bandana', 'dj_phones', 'chef', 'fedora', 'captain', 'crown'];
const VALID_FRAMES = [
  'studio_cream', 'sky_light', 'mint_fresh', 'lavender', 'peach_sun',
  'pearl_gray', 'neon_glow', 'gold_prestige', 'aurora', 'legend',
];

/** Authoritative server-side price catalog for every paid cosmetic key */
const COSMETIC_PRICES: Record<string, number> = {
  'hair:bun': 150,
  'hair:spiky': 200,
  'hair:afro': 250,
  'hair:wavy_part': 300,
  'hair:braids': 400,
  'hair:spiky_wild': 450,
  'hair:samurai_bun': 550,
  'hair:pompadour': 600,
  'hair:dreads_band': 650,
  'hair:rocker_long': 800,
  'eye:goofy_squint': 150,
  'eye:skeptic': 250,
  'eye:hero_white': 250,
  'eye:rock_smoky': 350,
  'eye:cat_gold': 450,
  'eye:laser_red': 550,
  'eye:hearts': 600,
  'eye:star': 800,
  'mouth:cat_mouth': 150,
  'mouth:buck_teeth': 200,
  'mouth:vampire': 250,
  'mouth:stitched': 300,
  'mouth:pacifier': 350,
  'mouth:gold_tooth': 450,
  'mouth:daisy': 500,
  'mouth:wide_villain': 600,
  'mouth:rose': 750,
  'facial:beard': 180,
  'facial:hoops': 200,
  'facial:mustache': 250,
  'facial:goatee': 350,
  'facial:dali': 450,
  'facial:pirate_beard': 750,
  'outfit:tie_shirt': 250,
  'outfit:hoodie': 300,
  'outfit:flannel': 300,
  'outfit:rock_skull': 350,
  'outfit:hawaiian_floral': 400,
  'outfit:open_shirt': 450,
  'outfit:suspenders': 450,
  'outfit:ballet': 500,
  'outfit:vest_bowtie': 550,
  'outfit:kimono': 700,
  'outfit:jacket': 700,
  'outfit:pirate': 850,
  'outfit:winter_fur': 950,
  'outfit:princess': 1100,
  'outfit:blazer': 1200,
  'outfit:carnival': 1400,
  'outfit:pharaoh': 1800,
  'outfit:queen': 2400,
  'outfit:royal_tux': 6500,
  'glasses:round': 150,
  'glasses:square': 200,
  'glasses:cat_eye': 300,
  'glasses:hearts_shades': 400,
  'glasses:aviator': 550,
  'glasses:wayfarer': 900,
  'glasses:pixel_boss': 1100,
  'glasses:star_party': 1400,
  'glasses:monocle': 2200,
  'glasses:gold_visor': 3500,
  'hat:cap': 200,
  'hat:flower': 300,
  'hat:headband': 350,
  'hat:beanie': 450,
  'hat:bandana': 500,
  'hat:beret': 750,
  'hat:dj_phones': 950,
  'hat:chef': 1200,
  'hat:fedora': 1500,
  'hat:captain': 1800,
  'hat:crown': 12000,
  'frame:peach_sun': 250,
  'frame:pearl_gray': 400,
  'frame:neon_glow': 900,
  'frame:gold_prestige': 4500,
  'frame:aurora': 9000,
  'frame:legend': 22000,
  'tile:perla': 400,
  'tile:jade': 1400,
  'tile:caoba_crema': 3200,
  'tile:ebano_oro': 8500,
  'tile:diamante': 18000,
};

/** Max soft-currency chips earnable from offline/local bot matches per rolling 24h (anti-farming cap) */
const LOCAL_MATCH_DAILY_CHIP_CAP = 600;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function getUtcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveValidatedToday(raw: unknown): string {
  const fallback = getUtcToday();
  if (typeof raw !== 'string' || !DATE_RE.test(raw)) return fallback;
  const parsed = Date.parse(`${raw}T12:00:00Z`);
  if (!Number.isFinite(parsed)) return fallback;
  if (Math.abs(parsed - Date.now()) > 36 * 60 * 60 * 1000) return fallback;
  return raw;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonRes({ error: 'Sesión requerida.' }, 401);
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

    async function fetchProgress() {
      const { data } = await admin
        .from('user_progress')
        .select(
          'daily_date, daily_stars, win_streak, best_streak, total_wins, total_matches, club_chips, xp, level, daily_claim_streak, last_daily_claim_date, equipped_theme, unlocked_themes, equipped_tile_style, avatar_config, unlocked_cosmetics'
        )
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    }

    if (action === 'claim_daily_reward') {
      if (!(await enforceRateLimit('daily_claim', 10, 60))) {
        return jsonRes({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, 429);
      }
      const today = resolveValidatedToday(body.today);
      const { data: result, error } = await admin.rpc('srv_claim_daily_reward', {
        p_user_id: user.id,
        p_today: today,
      });
      if (error) return jsonRes({ error: error.message }, 400);
      const progress = await fetchProgress();
      return jsonRes({ ok: true, result, progress });
    }

    if (action === 'free_refill') {
      if (!(await enforceRateLimit('free_refill', 5, 300))) {
        return jsonRes({ error: 'Demasiados intentos de recarga. Espera unos minutos.' }, 429);
      }
      const { data: result, error } = await admin.rpc('srv_free_refill', {
        p_user_id: user.id,
      });
      if (error) return jsonRes({ error: error.message }, 400);
      const progress = await fetchProgress();
      return jsonRes({ ok: true, result, progress });
    }

    if (action === 'unlock_or_equip_theme') {
      if (!(await enforceRateLimit('theme', 20, 60))) {
        return jsonRes({ error: 'Demasiados cambios de tema. Intenta en un momento.' }, 429);
      }
      const themeId = String(body.themeId ?? '');
      if (!(VALID_THEMES as readonly string[]).includes(themeId)) {
        return jsonRes({ error: 'Tema de mesa inválido.' }, 400);
      }
      const { data: result, error } = await admin.rpc('srv_unlock_or_equip_theme', {
        p_user_id: user.id,
        p_theme: themeId,
      });
      if (error) {
        if (error.message.includes('INSUFFICIENT_CHIPS')) {
          return jsonRes({ error: 'Monedas de club insuficientes para desbloquear este tema.' }, 400);
        }
        return jsonRes({ error: error.message }, 400);
      }
      const progress = await fetchProgress();
      return jsonRes({ ok: true, result, progress });
    }

    if (action === 'unlock_cosmetic') {
      if (!(await enforceRateLimit('cosmetic_unlock', 30, 60))) {
        return jsonRes({ error: 'Demasiadas compras seguidas. Espera unos segundos.' }, 429);
      }
      const itemKey = String(body.itemKey ?? '').trim();
      const cost = COSMETIC_PRICES[itemKey];
      if (typeof cost !== 'number') {
        return jsonRes({ error: 'Artículo cosmético inválido.' }, 400);
      }
      const { data: result, error } = await admin.rpc('srv_unlock_cosmetic', {
        p_user_id: user.id,
        p_item_key: itemKey,
        p_cost: cost,
      });
      if (error) {
        if (error.message.includes('INSUFFICIENT_CHIPS')) {
          return jsonRes({ error: 'Monedas de club insuficientes para este artículo.' }, 400);
        }
        return jsonRes({ error: error.message }, 400);
      }
      const progress = await fetchProgress();
      return jsonRes({ ok: true, result, progress });
    }

    if (action === 'unlock_or_equip_tile_style') {
      if (!(await enforceRateLimit('tile_style', 20, 60))) {
        return jsonRes({ error: 'Demasiados cambios de fichas. Intenta en un momento.' }, 429);
      }
      const tileStyleId = String(body.tileStyleId ?? '');
      if (!(VALID_TILE_STYLES as readonly string[]).includes(tileStyleId)) {
        return jsonRes({ error: 'Estilo de ficha inválido.' }, 400);
      }
      if (tileStyleId !== 'marfil') {
        const itemKey = `tile:${tileStyleId}`;
        const cost = COSMETIC_PRICES[itemKey];
        const { error: unlockErr } = await admin.rpc('srv_unlock_cosmetic', {
          p_user_id: user.id,
          p_item_key: itemKey,
          p_cost: cost,
        });
        if (unlockErr) {
          if (unlockErr.message.includes('INSUFFICIENT_CHIPS')) {
            return jsonRes({ error: 'Monedas de club insuficientes para este juego de fichas.' }, 400);
          }
          return jsonRes({ error: unlockErr.message }, 400);
        }
      }

      await admin
        .from('user_progress')
        .update({ equipped_tile_style: tileStyleId, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      const progress = await fetchProgress();
      return jsonRes({ ok: true, progress });
    }

    if (action === 'save_avatar_config') {
      if (!(await enforceRateLimit('save_avatar', 30, 60))) {
        return jsonRes({ error: 'Demasiados cambios de avatar. Espera un momento.' }, 429);
      }
      const raw = body.avatarConfig;
      if (!raw || typeof raw !== 'object') {
        return jsonRes({ error: 'Configuración de avatar inválida.' }, 400);
      }
      const cfg = raw as Record<string, unknown>;
      const bodyType = String(cfg.bodyType ?? 'masculine');
      const skinTone = String(cfg.skinTone ?? '');
      const faceShape = String(cfg.faceShape ?? 'oval');
      const eyeStyle = String(cfg.eyeStyle ?? '');
      const eyeColor = String(cfg.eyeColor ?? '#4A2B18');
      const eyebrows = String(cfg.eyebrows ?? 'natural');
      const nose = String(cfg.nose ?? 'classic');
      const mouth = String(cfg.mouth ?? 'smile');
      const hair = String(cfg.hair ?? '');
      const hairColor = String(cfg.hairColor ?? '');
      const facial = String(cfg.facial ?? '');
      const outfit = String(cfg.outfit ?? '');
      const outfitColor = String(cfg.outfitColor ?? '');
      const glasses = String(cfg.glasses ?? '');
      const hat = String(cfg.hat ?? '');
      const frame = String(cfg.frame ?? '');

      if (
        !VALID_BODY_TYPES.includes(bodyType) ||
        !VALID_SKIN_TONES.includes(skinTone) ||
        !VALID_FACE_SHAPES.includes(faceShape) ||
        !VALID_EYES.includes(eyeStyle) ||
        !VALID_EYE_COLORS.includes(eyeColor) ||
        !VALID_EYEBROWS.includes(eyebrows) ||
        !VALID_NOSES.includes(nose) ||
        !VALID_MOUTHS.includes(mouth) ||
        !VALID_HAIRS.includes(hair) ||
        !VALID_HAIR_COLORS.includes(hairColor) ||
        !VALID_FACIALS.includes(facial) ||
        !VALID_OUTFITS.includes(outfit) ||
        !VALID_OUTFIT_COLORS.includes(outfitColor) ||
        !VALID_GLASSES.includes(glasses) ||
        !VALID_HATS.includes(hat) ||
        !VALID_FRAMES.includes(frame)
      ) {
        return jsonRes({ error: 'Uno o más elementos del avatar son inválidos.' }, 400);
      }

      const cur = await fetchProgress();
      const owned = new Set<string>(Array.isArray(cur?.unlocked_cosmetics) ? cur.unlocked_cosmetics : []);
      const candidateKeys = [
        `hair:${hair}`,
        `eye:${eyeStyle}`,
        `mouth:${mouth}`,
        `facial:${facial}`,
        `outfit:${outfit}`,
        `glasses:${glasses}`,
        `hat:${hat}`,
        `frame:${frame}`,
      ];
      for (const k of candidateKeys) {
        if (k in COSMETIC_PRICES && !owned.has(k)) {
          return jsonRes({ error: `Debes desbloquear ${k} antes de equiparlo.` }, 400);
        }
      }

      const cleanConfig = {
        bodyType,
        skinTone,
        faceShape,
        eyeStyle,
        eyeColor,
        eyebrows,
        nose,
        mouth,
        hair,
        hairColor,
        facial,
        outfit,
        outfitColor,
        glasses,
        hat,
        frame,
      };

      const { error: updErr } = await admin
        .from('user_progress')
        .update({ avatar_config: cleanConfig, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updErr) return jsonRes({ error: updErr.message }, 400);

      const progress = await fetchProgress();
      return jsonRes({ ok: true, progress });
    }

    if (action === 'record_local_match') {
      if (!(await enforceRateLimit('local_match', 15, 3600))) {
        return jsonRes({ error: 'Límite horario de sincronización de partidas locales alcanzado.' }, 429);
      }

      const clientMatchId =
        typeof body.clientMatchId === 'string' ? body.clientMatchId.trim() : '';
      if (clientMatchId.length < 1 || clientMatchId.length > 120) {
        return jsonRes({ error: 'clientMatchId inválido.' }, 400);
      }

      const mode = String(body.mode ?? '');
      if (!(VALID_MODES as readonly string[]).includes(mode)) {
        return jsonRes({ error: 'Modo de juego inválido.' }, 400);
      }

      const targetScore = Number(body.targetScore);
      if (!(VALID_TARGETS as readonly number[]).includes(targetScore)) {
        return jsonRes({ error: 'Meta de puntos inválida.' }, 400);
      }

      if (typeof body.humanWon !== 'boolean') {
        return jsonRes({ error: 'Resultado humanWon inválido.' }, 400);
      }
      const humanWon = body.humanWon;

      const handsPlayed = Number(body.handsPlayed);
      if (!Number.isInteger(handsPlayed) || handsPlayed < 1 || handsPlayed > 80) {
        return jsonRes({ error: 'Número de manos inválido.' }, 400);
      }

      const expectedScoresLen = mode === '4ffa' ? 4 : 2;
      if (
        !Array.isArray(body.finalScores) ||
        body.finalScores.length !== expectedScoresLen ||
        !body.finalScores.every(
          (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 5000
        )
      ) {
        return jsonRes({ error: 'Marcador final inválido.' }, 400);
      }
      const finalScores = body.finalScores as number[];

      // Basic outcome consistency validation against targetScore
      const maxScore = Math.max(...finalScores);
      if (humanWon) {
        if (finalScores[0] < targetScore || finalScores[0] < maxScore) {
          return jsonRes({ error: 'Marcador final inconsistente con victoria.' }, 400);
        }
      } else {
        const bestOpponent = Math.max(...finalScores.slice(1));
        if (bestOpponent < targetScore) {
          return jsonRes({ error: 'Marcador final inconsistente con resultado.' }, 400);
        }
      }

      let playedAt = new Date().toISOString();
      if (typeof body.playedAt === 'string') {
        const ts = Date.parse(body.playedAt);
        if (Number.isFinite(ts) && ts <= Date.now() + 5 * 60 * 1000) {
          playedAt = new Date(ts).toISOString();
        }
      }

      const today = resolveValidatedToday(body.today);

      const { error: insertErr } = await admin.from('match_history').insert({
        user_id: user.id,
        client_match_id: clientMatchId,
        mode,
        target_score: targetScore,
        human_won: humanWon,
        hands_played: handsPlayed,
        final_scores: finalScores,
        played_at: playedAt,
      });

      if (insertErr) {
        if (insertErr.code === '23505') {
          const progress = await fetchProgress();
          return jsonRes({ ok: true, duplicate: true, progress });
        }
        return jsonRes({ error: insertErr.message }, 400);
      }

      // Rolling 24h anti-farming cap on soft-currency chips earned from offline/local bot matches
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentLocalRows } = await admin
        .from('chip_ledger')
        .select('delta')
        .eq('user_id', user.id)
        .in('reason', ['local_match_win', 'local_match_participation'])
        .gte('created_at', since24h);

      const recentLocalEarned = (recentLocalRows ?? []).reduce(
        (acc, row) => acc + Math.max(0, Number(row.delta ?? 0)),
        0
      );
      const rawChips = humanWon ? 50 : 15;
      const remainingCap = Math.max(0, LOCAL_MATCH_DAILY_CHIP_CAP - recentLocalEarned);
      const chipsEarned = Math.min(rawChips, remainingCap);
      const localChipsCapped = chipsEarned < rawChips;
      const xpEarned = humanWon ? 40 : 15;

      if (chipsEarned > 0) {
        const { error: chipErr } = await admin.rpc('srv_adjust_club_chips', {
          p_user_id: user.id,
          p_delta: chipsEarned,
          p_reason: humanWon ? 'local_match_win' : 'local_match_participation',
          p_ref: clientMatchId,
        });
        if (chipErr) return jsonRes({ error: chipErr.message }, 400);
      }

      const cur = await fetchProgress();
      const baseStars = cur && cur.daily_date === today ? cur.daily_stars : 0;
      const nextXp = (cur?.xp ?? 0) + xpEarned;
      const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);
      const nextStreak = humanWon ? (cur?.win_streak ?? 0) + 1 : 0;

      await admin
        .from('user_progress')
        .update({
          daily_date: today,
          daily_stars: humanWon ? Math.min(3, baseStars + 1) : baseStars,
          win_streak: nextStreak,
          best_streak: Math.max(cur?.best_streak ?? 0, nextStreak),
          total_wins: (cur?.total_wins ?? 0) + (humanWon ? 1 : 0),
          total_matches: (cur?.total_matches ?? 0) + 1,
          xp: nextXp,
          level: nextLevel,
        })
        .eq('user_id', user.id);

      const progress = await fetchProgress();
      return jsonRes({ ok: true, duplicate: false, localChipsCapped, progress });
    }

    if (action === 'delete_account') {
      if (!(await enforceRateLimit('delete_account', 3, 300))) {
        return jsonRes({ error: 'Demasiados intentos. Espera unos minutos.' }, 429);
      }

      const { data: waitingSeats } = await admin
        .from('room_players')
        .select('room_id')
        .eq('user_id', user.id);

      if (waitingSeats && waitingSeats.length > 0) {
        const roomIds = Array.from(new Set(waitingSeats.map((r) => r.room_id)));
        const { data: waitingRooms } = await admin
          .from('game_rooms')
          .select('id, status')
          .in('id', roomIds)
          .eq('status', 'waiting');

        for (const wr of waitingRooms ?? []) {
          await admin.from('room_players').delete().eq('room_id', wr.id).eq('user_id', user.id);
          const { data: rem } = await admin.from('room_players').select('id').eq('room_id', wr.id);
          const count = rem?.length ?? 0;
          if (count === 0) {
            await admin.from('game_rooms').delete().eq('id', wr.id);
          } else {
            await admin.from('game_rooms').update({ player_count: count }).eq('id', wr.id);
          }
        }
      }

      await admin.from('api_rate_limits').delete().eq('user_id', user.id);

      const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
      if (delErr) return jsonRes({ error: delErr.message }, 500);

      return jsonRes({ ok: true });
    }

    return jsonRes({ error: `Acción no soportada: ${action}` }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor.';
    return jsonRes({ error: message }, 400);
  }
});
