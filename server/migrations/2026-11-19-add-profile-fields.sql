BEGIN;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS description character varying(300);

ALTER TABLE IF EXISTS public.stores
  ADD COLUMN IF NOT EXISTS schedule character varying(100);

COMMIT;
