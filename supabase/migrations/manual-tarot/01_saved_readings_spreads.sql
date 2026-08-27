-- Ejecutar manualmente después de confirmar que public.saved_tarot_readings existe.
-- Este archivo no ha sido aplicado remotamente por el agente.
-- Amplía la compatibilidad del diario con las claves que ya usa el código local.

DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  IF to_regclass('public.saved_tarot_readings') IS NULL THEN
    RAISE EXCEPTION 'No existe public.saved_tarot_readings; verifica primero la migración base de cuenta.';
  END IF;

  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.saved_tarot_readings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%spread_type%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.saved_tarot_readings DROP CONSTRAINT %I',
      constraint_row.conname
    );
  END LOOP;
END $$;

ALTER TABLE public.saved_tarot_readings
  ADD CONSTRAINT saved_tarot_readings_spread_type_check
  CHECK (
    spread_type IN (
      'daily',
      'yes_no',
      'three_cards',
      'decision',
      'past_present_future'
    )
  );
