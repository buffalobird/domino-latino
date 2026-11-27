-- Phase 1 Cosmetic Economy: Modular Avatar + Collectible Tile Styles + Prestige Tables
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS avatar_config jsonb NOT NULL DEFAULT '{"skinTone":"triguena","hair":"classic","hairColor":"#1A2232","eyeStyle":"natural","facial":"none","outfit":"guayabera","outfitColor":"#0EA5E9","glasses":"none","hat":"none","frame":"noche"}'::jsonb,
  ADD COLUMN IF NOT EXISTS unlocked_cosmetics text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS equipped_tile_style text NOT NULL DEFAULT 'marfil';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_avatar_config_size_chk'
  ) THEN
    ALTER TABLE public.user_progress
      ADD CONSTRAINT user_progress_avatar_config_size_chk
      CHECK (jsonb_typeof(avatar_config) = 'object' AND octet_length(avatar_config::text) <= 2048);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_equipped_tile_style_chk'
  ) THEN
    ALTER TABLE public.user_progress
      ADD CONSTRAINT user_progress_equipped_tile_style_chk
      CHECK (equipped_tile_style IN ('marfil', 'perla', 'jade', 'caoba_crema', 'ebano_oro', 'diamante'));
  END IF;
END $$;

-- Update srv_unlock_or_equip_theme to support all 5 table themes (long-tail ladder up to 15,000 chips)
CREATE OR REPLACE FUNCTION public.srv_unlock_or_equip_theme(
  p_user_id uuid,
  p_theme text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

  SELECT * INTO v_row
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_PROGRESS_NOT_FOUND';
  END IF;

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
      'club_chips', v_row.club_chips
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

  INSERT INTO public.chip_ledger (user_id, delta, balance_after, reason, ref_id)
  VALUES (p_user_id, -v_cost, v_new_balance, 'theme_unlock', p_theme);

  RETURN jsonb_build_object(
    'unlocked', true,
    'equipped', p_theme,
    'cost', v_cost,
    'club_chips', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.srv_unlock_or_equip_theme(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.srv_unlock_or_equip_theme(uuid, text) TO service_role;

-- Atomic server-only RPC for unlocking avatar accessories, frames, and collectible tile styles
CREATE OR REPLACE FUNCTION public.srv_unlock_cosmetic(
  p_user_id uuid,
  p_item_key text,
  p_cost integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

  SELECT * INTO v_row
  FROM public.user_progress
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_PROGRESS_NOT_FOUND';
  END IF;

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
    INSERT INTO public.chip_ledger (user_id, delta, balance_after, reason, ref_id)
    VALUES (p_user_id, -p_cost, v_new_balance, 'cosmetic_unlock', p_item_key);
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
