-- Sprint 1 Hardening: fix chip_ledger column names in cosmetic RPCs, allow all 5 table themes,
-- prevent daily-claim clock rollback, and add 10-minute cooldown to free refill.

ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_equipped_theme_check;

ALTER TABLE public.user_progress
  ADD CONSTRAINT user_progress_equipped_theme_check
  CHECK (equipped_theme IN ('caribe', 'caoba', 'esmeralda', 'habana_noche', 'casino_oro'));

-- Fix srv_unlock_or_equip_theme (correct chip_ledger columns + SECURITY INVOKER + upsert guard)
CREATE OR REPLACE FUNCTION public.srv_unlock_or_equip_theme(
  p_user_id uuid,
  p_theme text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_row public.user_progress%ROWTYPE;
  v_cost integer;
  v_new_balance integer;
  v_unlocked text[];
BEGIN
  IF p_theme = 'caribe' THEN
    v_cost := 0;
  ELSIF p_theme = 'caoba' THEN
    v_cost := 600;
  ELSIF p_theme = 'esmeralda' THEN
    v_cost := 1200;
  ELSIF p_theme = 'habana_noche' THEN
    v_cost := 4000;
  ELSIF p_theme = 'casino_oro' THEN
    v_cost := 15000;
  ELSE
    RAISE EXCEPTION 'INVALID_THEME';
  END IF;

  INSERT INTO public.user_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_unlocked := COALESCE(v_row.unlocked_themes, ARRAY['caribe']::text[]);
  IF NOT ('caribe' = ANY(v_unlocked)) THEN
    v_unlocked := array_append(v_unlocked, 'caribe');
  END IF;

  IF p_theme = ANY(v_unlocked) THEN
    UPDATE public.user_progress
    SET equipped_theme = p_theme, updated_at = now()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'unlocked', false,
      'equipped', p_theme,
      'club_chips', v_row.club_chips,
      'unlocked_themes', v_unlocked
    );
  END IF;

  IF v_row.club_chips < v_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CHIPS';
  END IF;

  v_new_balance := v_row.club_chips - v_cost;
  v_unlocked := array_append(v_unlocked, p_theme);

  UPDATE public.user_progress
  SET
    club_chips = v_new_balance,
    unlocked_themes = v_unlocked,
    equipped_theme = p_theme,
    updated_at = now()
  WHERE user_id = p_user_id;

  IF v_cost > 0 THEN
    INSERT INTO public.chip_ledger (user_id, delta, reason, reference_id)
    VALUES (p_user_id, -v_cost, 'cosmetic_theme_unlock', p_theme);
  END IF;

  RETURN jsonb_build_object(
    'unlocked', true,
    'equipped', p_theme,
    'cost', v_cost,
    'club_chips', v_new_balance,
    'unlocked_themes', v_unlocked
  );
END;
$$;

REVOKE ALL ON FUNCTION public.srv_unlock_or_equip_theme(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.srv_unlock_or_equip_theme(uuid, text) TO service_role;

-- Fix srv_unlock_cosmetic (correct chip_ledger columns + SECURITY INVOKER + upsert guard)
CREATE OR REPLACE FUNCTION public.srv_unlock_cosmetic(
  p_user_id uuid,
  p_item_key text,
  p_cost integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_row public.user_progress%ROWTYPE;
  v_new_balance integer;
  v_unlocked text[];
BEGIN
  IF p_item_key IS NULL OR length(trim(p_item_key)) = 0 OR length(p_item_key) > 64 THEN
    RAISE EXCEPTION 'INVALID_COSMETIC_KEY';
  END IF;
  IF p_cost IS NULL OR p_cost < 0 OR p_cost > 100000 THEN
    RAISE EXCEPTION 'INVALID_COSMETIC_COST';
  END IF;

  INSERT INTO public.user_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  v_unlocked := COALESCE(v_row.unlocked_cosmetics, '{}'::text[]);

  IF p_item_key = ANY(v_unlocked) THEN
    RETURN jsonb_build_object(
      'unlocked', false,
      'already_owned', true,
      'item_key', p_item_key,
      'club_chips', v_row.club_chips
    );
  END IF;

  IF v_row.club_chips < p_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CHIPS';
  END IF;

  v_new_balance := v_row.club_chips - p_cost;
  v_unlocked := array_append(v_unlocked, p_item_key);

  UPDATE public.user_progress
  SET
    club_chips = v_new_balance,
    unlocked_cosmetics = v_unlocked,
    updated_at = now()
  WHERE user_id = p_user_id;

  IF p_cost > 0 THEN
    INSERT INTO public.chip_ledger (user_id, delta, reason, reference_id)
    VALUES (p_user_id, -p_cost, 'cosmetic_unlock', p_item_key);
  END IF;

  RETURN jsonb_build_object(
    'unlocked', true,
    'already_owned', false,
    'item_key', p_item_key,
    'cost', p_cost,
    'club_chips', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.srv_unlock_cosmetic(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.srv_unlock_cosmetic(uuid, text, integer) TO service_role;

-- Harden srv_claim_daily_reward: reject clock rollback (p_today <= last_daily_claim_date)
CREATE OR REPLACE FUNCTION public.srv_claim_daily_reward(
  p_user_id uuid,
  p_today text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_schedule integer[] := array[100, 150, 200, 300, 400, 500, 1000];
  v_row public.user_progress%ROWTYPE;
  v_day_idx integer;
  v_awarded integer;
  v_next_streak integer;
BEGIN
  INSERT INTO public.user_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_row.last_daily_claim_date IS NOT NULL AND p_today <= v_row.last_daily_claim_date THEN
    RETURN jsonb_build_object(
      'awarded', 0,
      'club_chips', v_row.club_chips,
      'daily_claim_streak', v_row.daily_claim_streak
    );
  END IF;

  v_day_idx := (v_row.daily_claim_streak % 7) + 1;
  v_awarded := v_schedule[v_day_idx];
  v_next_streak := CASE WHEN v_day_idx >= 7 THEN 0 ELSE v_day_idx END;

  UPDATE public.user_progress
  SET club_chips = v_row.club_chips + v_awarded,
      daily_claim_streak = v_next_streak,
      last_daily_claim_date = p_today
  WHERE user_id = p_user_id;

  INSERT INTO public.chip_ledger (user_id, delta, reason, reference_id)
  VALUES (p_user_id, v_awarded, 'daily_reward_7d', p_today);

  RETURN jsonb_build_object(
    'awarded', v_awarded,
    'club_chips', v_row.club_chips + v_awarded,
    'daily_claim_streak', v_next_streak,
    'last_daily_claim_date', p_today
  );
END;
$$;

REVOKE ALL ON FUNCTION public.srv_claim_daily_reward(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.srv_claim_daily_reward(uuid, text) TO service_role;

-- Harden srv_free_refill: require balance < 200 AND 10-minute server cooldown
CREATE OR REPLACE FUNCTION public.srv_free_refill(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_cur integer;
  v_recent_refill boolean;
BEGIN
  INSERT INTO public.user_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT club_chips INTO v_cur
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_cur >= 200 THEN
    RETURN jsonb_build_object('awarded', 0, 'club_chips', v_cur);
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.chip_ledger
    WHERE user_id = p_user_id
      AND reason = 'free_club_refill'
      AND created_at > now() - interval '10 minutes'
  ) INTO v_recent_refill;

  IF v_recent_refill THEN
    RETURN jsonb_build_object('awarded', 0, 'club_chips', v_cur, 'cooldown', true);
  END IF;

  UPDATE public.user_progress
  SET club_chips = v_cur + 300
  WHERE user_id = p_user_id;

  INSERT INTO public.chip_ledger (user_id, delta, reason)
  VALUES (p_user_id, 300, 'free_club_refill');

  RETURN jsonb_build_object('awarded', 300, 'club_chips', v_cur + 300);
END;
$$;

REVOKE ALL ON FUNCTION public.srv_free_refill(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.srv_free_refill(uuid) TO service_role;
