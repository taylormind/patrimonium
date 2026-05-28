-- ============================================================
--  PATRONO — Schema Completo do Banco de Dados
--  Execute este arquivo no SQL Editor do Supabase
--  Ordem: rode tudo de uma vez (Ctrl+Enter no editor)
-- ============================================================


-- ============================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. TABELA: profiles
--    Dados extras do usuário (além do auth.users do Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username          TEXT        UNIQUE NOT NULL,
  is_admin          BOOLEAN     DEFAULT FALSE,
  plan              TEXT        DEFAULT 'free',       -- 'free' | 'pro'
  lgpd_consent_at   TIMESTAMPTZ,                      -- quando aceitou os termos
  lgpd_deleted      BOOLEAN     DEFAULT FALSE,        -- soft-delete LGPD
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil público dos usuários. Criado automaticamente no cadastro.';
COMMENT ON COLUMN public.profiles.is_admin IS 'TRUE apenas para o administrador do sistema.';
COMMENT ON COLUMN public.profiles.lgpd_consent_at IS 'Timestamp do aceite dos termos LGPD. NULL = não aceitou.';


-- ============================================================
-- 3. TABELA: categories
--    Categorias de transações (cada usuário tem as suas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT        NOT NULL,
  emoji      TEXT        DEFAULT '📦',
  color      TEXT        DEFAULT '#FF6500',
  type       TEXT        DEFAULT 'both'    CHECK (type IN ('expense','income','both')),
  is_default BOOLEAN     DEFAULT FALSE,    -- categorias padrão do sistema
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Categorias de transações por usuário.';


-- ============================================================
-- 4. TABELA: transactions
--    Todas as movimentações financeiras do usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        DATE        NOT NULL,
  description TEXT        NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  type        TEXT        NOT NULL     CHECK (type IN ('income','expense','transfer')),
  account     TEXT        NOT NULL     CHECK (account IN ('corrente','poupanca','cartao','dinheiro','investimento','outro')),
  category_id UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  notes       TEXT,
  batch_id    UUID,       -- agrupa transações do mesmo import
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Movimentações financeiras. account=cartao aparece na aba Faturas.';
COMMENT ON COLUMN public.transactions.batch_id IS 'UUID compartilhado por todas as transações de um mesmo import em lote.';


-- ============================================================
-- 5. TABELA: budgets
--    Metas de orçamento por categoria e mês
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id   UUID        REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  month         TEXT        NOT NULL,    -- formato 'YYYY-MM'
  limit_amount  NUMERIC(12,2) NOT NULL CHECK (limit_amount >= 0),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category_id, month)  -- uma meta por categoria por mês
);


-- ============================================================
-- 6. TABELA: assets
--    Patrimônio (imóveis, veículos, investimentos, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assets (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT        NOT NULL,
  type          TEXT        NOT NULL     CHECK (type IN ('imovel','veiculo','investimento','conta','fisico','outro')),
  current_value NUMERIC(14,2) DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 7. TABELA: asset_history
--    Histórico de atualizações de valor de cada ativo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.asset_history (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id   UUID        REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value      NUMERIC(14,2) NOT NULL,
  note       TEXT,
  recorded_at DATE       DEFAULT CURRENT_DATE
);


-- ============================================================
-- 8. TABELA: import_history
--    Registro dos imports em lote
-- ============================================================
CREATE TABLE IF NOT EXISTS public.import_history (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  batch_id   UUID        NOT NULL,
  filename   TEXT        NOT NULL,
  account    TEXT        NOT NULL,
  tx_count   INTEGER     DEFAULT 0,
  imported_at DATE       DEFAULT CURRENT_DATE
);


-- ============================================================
-- 9. TABELA: lgpd_requests
--    Solicitações LGPD dos usuários (exclusão, portabilidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lgpd_requests (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT        NOT NULL     CHECK (type IN ('deletion','export','correction')),
  status      TEXT        DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','denied')),
  notes       TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

COMMENT ON TABLE public.lgpd_requests IS 'Solicitações LGPD: exclusão de dados, portabilidade, correção.';


-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
--     Garante que cada usuário veja SOMENTE seus próprios dados
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_requests  ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 11. POLICIES — profiles
-- ============================================================
CREATE POLICY "Usuário vê seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "Admin vê todos os perfis"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- ============================================================
-- 12. POLICIES — categories
-- ============================================================
CREATE POLICY "Usuário gerencia suas categorias"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 13. POLICIES — transactions
-- ============================================================
CREATE POLICY "Usuário gerencia suas transações"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todas as transações (para suporte)
CREATE POLICY "Admin vê todas as transações"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- ============================================================
-- 14. POLICIES — budgets
-- ============================================================
CREATE POLICY "Usuário gerencia seu orçamento"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 15. POLICIES — assets
-- ============================================================
CREATE POLICY "Usuário gerencia seu patrimônio"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 16. POLICIES — asset_history
-- ============================================================
CREATE POLICY "Usuário gerencia histórico de ativos"
  ON public.asset_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 17. POLICIES — import_history
-- ============================================================
CREATE POLICY "Usuário vê seu histórico de imports"
  ON public.import_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 18. POLICIES — lgpd_requests
-- ============================================================
CREATE POLICY "Usuário cria e vê suas solicitações LGPD"
  ON public.lgpd_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin processa todas as solicitações LGPD
CREATE POLICY "Admin gerencia solicitações LGPD"
  ON public.lgpd_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


-- ============================================================
-- 19. TRIGGER: cria perfil automaticamente no cadastro
--     Quando um usuário se registra, o perfil é criado sozinho
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, lgpd_consent_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE
      WHEN (NEW.raw_user_meta_data->>'lgpd_consent')::boolean = TRUE
      THEN NOW()
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 20. TRIGGER: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================
-- 21. VIEW: admin_dashboard
--     Estatísticas gerais para o painel admin
--     (só admin consegue usar — RLS bloqueia outros)
-- ============================================================
CREATE OR REPLACE VIEW public.admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM auth.users)                                    AS total_users,
  (SELECT COUNT(*) FROM public.transactions)                           AS total_transactions,
  (SELECT COUNT(*) FROM public.lgpd_requests WHERE status = 'pending') AS pending_lgpd,
  (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_7d,
  (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_30d;


-- ============================================================
-- FIM DO SCHEMA
-- Execute tudo de uma vez no SQL Editor do Supabase.
-- Depois, marque seu usuário como admin com:
--
--   UPDATE public.profiles
--   SET is_admin = TRUE
--   WHERE username = 'seu_usuario';
--
-- ============================================================
