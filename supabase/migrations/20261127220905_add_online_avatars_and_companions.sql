-- Real 2.5D avatars in online multiplayer rooms + Locket-style intimate Table Companions circle (max 20)

ALTER TABLE public.room_players
  ADD COLUMN IF NOT EXISTS avatar_config jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'room_players_avatar_config_size_chk'
  ) THEN
    ALTER TABLE public.room_players
      ADD CONSTRAINT room_players_avatar_config_size_chk
      CHECK (
        avatar_config IS NULL
        OR (jsonb_typeof(avatar_config) = 'object' AND octet_length(avatar_config::text) <= 2048)
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.table_companions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_name text NOT NULL CHECK (char_length(companion_name) BETWEEN 1 AND 40),
  companion_avatar jsonb,
  matches_together integer NOT NULL DEFAULT 1 CHECK (matches_together >= 1),
  last_played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, companion_user_id),
  CONSTRAINT table_companions_no_self CHECK (user_id <> companion_user_id),
  CONSTRAINT table_companions_avatar_size_chk CHECK (
    companion_avatar IS NULL
    OR (jsonb_typeof(companion_avatar) = 'object' AND octet_length(companion_avatar::text) <= 2048)
  )
);

CREATE INDEX IF NOT EXISTS table_companions_user_last_idx
  ON public.table_companions (user_id, last_played_at DESC);

REVOKE ALL ON public.table_companions FROM public, anon;
GRANT SELECT ON public.table_companions TO authenticated;
ALTER TABLE public.table_companions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'table_companions'
      AND policyname = 'Users can view own table companions'
  ) THEN
    CREATE POLICY "Users can view own table companions"
      ON public.table_companions FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;
