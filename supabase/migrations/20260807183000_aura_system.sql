-- ============================================================
-- MIGRATION: Sistema de Aura & Energy Rings
-- ============================================================

-- Añadir nuevas columnas a la tabla perfiles de forma segura
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS aura_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS aura_theme text DEFAULT 'indigo' CHECK (aura_theme IN ('indigo', 'lunar', 'emerald', 'rose', 'solar', 'pearl')),
  ADD COLUMN IF NOT EXISTS aura_motion_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS aura_visibility text DEFAULT 'public' CHECK (aura_visibility IN ('public', 'connections', 'private')),
  ADD COLUMN IF NOT EXISTS declared_energy text DEFAULT null,
  ADD COLUMN IF NOT EXISTS declared_energy_text text DEFAULT null,
  ADD COLUMN IF NOT EXISTS declared_energy_updated_at timestamptz DEFAULT null;
