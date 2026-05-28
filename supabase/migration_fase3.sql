-- ============================================================
--  PATRONO — Migration Fase 3
--  Adiciona colunas que faltam para o sync do app
--  Execute no SQL Editor do Supabase
-- ============================================================

-- Colunas extras em categories (budget e keywords ficam aqui por simplicidade)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS budget   NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS keywords TEXT          DEFAULT '';

-- Colunas extras em assets (dados visuais do patrimônio)
ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS icon      TEXT DEFAULT '🏦',
  ADD COLUMN IF NOT EXISTS color     TEXT DEFAULT '#4DABF7',
  ADD COLUMN IF NOT EXISTS liquidity TEXT DEFAULT 'liquid';

-- Garante que import_history aceita upsert por batch_id
ALTER TABLE public.import_history
  DROP CONSTRAINT IF EXISTS import_history_batch_id_key;
ALTER TABLE public.import_history
  ADD CONSTRAINT import_history_batch_id_key UNIQUE (batch_id);

-- Confirmação
SELECT 'Migration Fase 3 aplicada com sucesso!' AS status;
