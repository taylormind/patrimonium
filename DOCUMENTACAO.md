# Patrono — Documentação Completa do Projeto
> Gerado em: 28/05/2026 | Versão do sistema: `patrono-v8`

---

## 1. Visão Geral

**Patrono** é um sistema de controle financeiro pessoal 100% client-side (roda no navegador sem servidor back-end). Os dados ficam salvos no `localStorage` do próprio dispositivo do usuário. Funciona offline graças ao Service Worker, e pode ser instalado como aplicativo no celular ou desktop (PWA).

- **URL pública:** https://taylormind.github.io/patrimonium/
- **Repositório:** https://github.com/taylormind/patrimonium
- **Pasta local:** `C:\Users\pichau\Desktop\Projetos Claude\FluxoCaixa\`

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Motivo |
|---|---|---|---|
| Marcação | HTML5 | — | Estrutura da SPA |
| Estilo | CSS3 puro | — | Sem framework, controle total |
| Lógica | JavaScript ES2022 | — | IIFE única, sem bundler |
| Gráficos | Chart.js (CDN) | 4.4.1 | Doughnut, bar, line charts |
| Importação CSV | PapaParse (CDN) | 5.4.1 | Parse robusto de CSV |
| Importação XLSX | SheetJS/xlsx (CDN) | 0.18.5 | Leitura de planilhas Excel |
| Ícones | Font Awesome (CDN) | 6.5.0 | Ícones vetoriais |
| Fontes | Google Fonts (CDN) | — | Cormorant Garamond, Montserrat, Inter, Fredoka |
| PWA | Service Worker | — | Cache offline-first |
| Hospedagem | GitHub Pages | — | Gratuito, HTTPS, deploy via push |

---

## 3. Estrutura de Arquivos

```
FluxoCaixa/
├── index.html          ← SPA principal (todo o HTML da aplicação)
├── js/
│   └── app.js          ← Toda a lógica (~4 100+ linhas)
├── css/
│   └── styles.css      ← Todo o CSS (~3 000+ linhas)
├── sw.js               ← Service Worker (cache offline)
├── manifest.json       ← Manifesto PWA (ícones, cores, nome)
├── assets/
│   ├── icon.svg        ← Ícone principal (laranja, "P" estilizado)
│   └── icon-maskable.svg ← Versão maskable para Android
├── .gitignore          ← Exclui backups/ e .claude/ do git
├── DOCUMENTACAO.md     ← Este arquivo
└── backups/            ← ⚠️ NÃO vai ao GitHub (no .gitignore)
    ├── *.json          ← Backups do localStorage
    ├── *.pdf           ← Documentos pessoais
    └── *.csv           ← Extratos bancários originais
```

---

## 4. Chaves do localStorage

| Chave | Conteúdo |
|---|---|
| `fluxocaixa_v2` | Estado principal: transações, categorias, orçamento, histórico de imports |
| `fluxocaixa_auth_v1` | Credenciais: `{ user, pwd (SHA-256), email }` |
| `fluxocaixa_session` | Token de sessão ativa |
| `fluxocaixa_last_activity` | Timestamp da última ação (logout automático 15 min) |
| `fluxocaixa_patrimonio_v1` | Ativos do patrimônio (imóveis, veículos, investimentos…) |
| `fluxocaixa_backups_v1` | Snapshots de backup in-app |
| `fluxocaixa_theme_v1` | Cores customizadas do tema |

---

## 5. Funcionalidades por Aba

### 5.1 Autenticação (`#authScreen`)
- **Login / Criar conta** — duas abas: "Entrar" e "Criar conta"
- **Hash de senha** — `sha256()` nativo via `crypto.subtle.digest`; senha nunca salva em texto puro
- **Trocar senha** — formulário no painel Admin (senha atual → nova → confirmação)
- **Recuperação de conta** — mostra e-mail de recuperação cadastrado
- **Restauração via backup** — usuário pode fazer upload de arquivo `.json` para restaurar conta em novo dispositivo
- **Auto-logout** — 15 minutos de inatividade encerra a sessão
- **Mostrar/ocultar senha** — botão olho em todos os campos de senha

### 5.2 Dashboard (`section-dashboard`)
- Saldo atual (receitas − despesas do mês)
- Cards: Receitas, Despesas, Saldo do mês
- Gráfico de Fluxo de Caixa (barras mensais, 6 meses)
- Mini-orçamento (barras de progresso por categoria)
- Lista de transações recentes
- Gráfico de categorias de despesas (doughnut)
- Gráfico de categorias de receitas (doughnut)

### 5.3 Transações (`section-transactions`)
- Lista paginada (20 por página) com busca e filtros
- Filtros: tipo (receita/despesa/transferência), conta, mês
- Adicionar/editar/excluir transação
- Campos: data, descrição, valor, tipo, conta, categoria, observações
- Contas disponíveis: Conta Corrente, Poupança, Cartão de Crédito, Dinheiro, Investimento, Outro

### 5.4 Categorias (`section-categories`)
- CRUD completo de categorias
- Cada categoria tem: nome, emoji, cor (picker), tipo (despesa/receita/ambas)
- Categorias padrão pré-carregadas (Alimentação, Transporte, Saúde, etc.)
- Categorias especiais protegidas: `resgate`, `aplicacao` (investimentos)

### 5.5 Orçamento (`section-budget`)
- Meta mensal por categoria
- Barra de progresso mostrando gasto vs meta
- Todas as categorias exibidas (não só as 5 maiores)
- Indicador de alerta quando ultrapassa 80% da meta

### 5.6 Relatórios (`section-reports`)
- **Filtro de período:** 1, 3, 6 ou 12 meses
- **Gráfico 1:** Evolução de receitas e despesas (linha)
- **Gráfico 2:** Despesas por categoria (barra horizontal)
- **Gráfico 3:** Sazonalidade — mapa de calor mensal por categoria
- **Gráfico 4:** Orçamento vs Realizado (barra agrupada)
- **Painel Débito vs Crédito:**
  - Total pago no débito (Conta Corrente + Poupança + Dinheiro)
  - Total pago no Cartão de Crédito
  - Percentuais de cada forma
  - Gráfico doughnut Débito/Crédito (verde #00D4A3 / laranja #FF6500)
  - Breakdown detalhado por conta

### 5.7 Faturas (`section-faturas`)
- Visão mensal das transações do **Cartão de Crédito** (`account === 'cartao'`)
- Navegação mês a mês (← →)
- Badge **Aberta** (mês atual/futuro) / **Fechada** (mês passado)
- Cards de resumo: Total da fatura, Nº de transações, Maior categoria, Maior gasto
- Gráfico doughnut por categoria + legenda interativa
- Lista de todas as transações do mês ordenadas por valor
- **Tabela Comparativa Mensal:**
  - Período: 3, 6 ou 12 meses
  - Conta: Cartão de Crédito ou Todas as contas
  - Heatmap laranja: quanto maior o gasto na célula, mais intensa a cor
  - Categorias ordenadas por total desc; linha de totais no rodapé

### 5.8 Patrimônio (`section-patrimônio`)
- CRUD de ativos: Imóvel, Veículo, Investimento, Conta, Físico, Outro
- Total do patrimônio líquido
- Gráfico de composição (doughnut por tipo de ativo)
- Histórico de atualizações de valor por ativo
- Atualização de valor com data e observação

### 5.9 Importação (`section-import`)
- Upload de CSV ou XLSX via drag-and-drop ou botão
- Fila de múltiplos arquivos com processamento sequencial
- **Seletor de conta de origem** (Conta Corrente, Poupança, Cartão de Crédito, etc.)
- Mapeamento inteligente de colunas (aprende de imports anteriores)
- Preview de dados antes de confirmar
- Detecção automática de duplicatas
- Categorização automática por palavras-chave
- **Histórico de Imports:**
  - Chip de conta em cada import
  - **Trocar conta em lote** — altera a conta de todas as transações de um batch
  - Desfazer import inteiro

### 5.10 Backup (`section-backup`)
- Exportar backup JSON completo (localStorage serializado)
- Importar backup (restaura todos os dados)
- Snapshots internos (lista de versões anteriores salvas in-app)
- Dados do backup incluem: transações, categorias, orçamento, patrimônio, histórico de imports, tema

### 5.11 Admin / Conta (`section-admin`)
- Informações da conta (usuário, e-mail)
- **Trocar senha** (campo atual + nova + confirmar)
- Logout
- Editor de tema (cores customizáveis via CSS variables)
- Importar dados de demonstração (sample data)
- Reset completo dos dados

---

## 6. Contas (account types)

| Valor interno | Label exibida | Uso principal |
|---|---|---|
| `corrente` | Conta Corrente | Débito no banco |
| `poupanca` | Poupança | Reservas |
| `cartao` | Cartão de Crédito | **Faturas** filtram por este valor |
| `dinheiro` | Dinheiro | Espécie |
| `investimento` | Investimento | Aplicações |
| `outro` | Outro | Qualquer outra origem |

---

## 7. Service Worker & Cache (sw.js)

```
CACHE_VERSION = 'patrono-v8'
```

**Estratégia:** Cache-first com Stale-While-Revalidate leve.

- **Install:** pré-cacheia todos os assets locais (`index.html`, `css/styles.css`, `js/app.js`, `manifest.json`, ícones)
- **Activate:** remove caches de versões anteriores
- **Fetch:** serve do cache; revalida em background; CDNs (cloudflare, fonts.googleapis) cacheados sob demanda
- **Offline:** requisições de navegação sem cache retornam `index.html`

> ⚠️ **Sempre que modificar `index.html`, `app.js` ou `styles.css`, incremente o `CACHE_VERSION`** (ex: `patrono-v9`) para que os usuários recebam a versão atualizada.

---

## 8. Segurança

| Aspecto | Implementação |
|---|---|
| Senha | Hash SHA-256 via `crypto.subtle`; nunca armazenada em texto puro |
| Sessão | Token aleatório no `sessionStorage`; expira ao fechar aba |
| Inatividade | Auto-logout após 15 min sem ação |
| Dados | Tudo local (localStorage); zero dados enviados a servidor |
| Git | `backups/` e `.claude/` no `.gitignore` — jamais vão ao GitHub |

> ⚠️ **Tokens GitHub usados durante deploys devem ser revogados após o uso em:** https://github.com/settings/tokens

---

## 9. Deploy — GitHub Pages

### Repositório
- **Owner:** taylormind
- **Repo:** patrimonium
- **Branch:** main (raiz)
- **URL pública:** https://taylormind.github.io/patrimonium/
- **HTTPS:** Enforçado automaticamente

### Como fazer um update
```powershell
# Na pasta do projeto:
cd "C:\Users\pichau\Desktop\Projetos Claude\FluxoCaixa"

# 1. Verificar o que mudou
git status
git diff

# 2. Adicionar arquivos modificados (NUNCA use git add . sem verificar antes)
git add index.html js/app.js css/styles.css sw.js manifest.json

# 3. Commit
git commit -m "feat: descrição do que mudou"

# 4. Push (GitHub Pages atualiza em ~1 minuto)
git push
```

> ⚠️ **Atenção ao `git add`:** nunca adicione a pasta `backups/` (contém PDFs, contratos e extratos bancários). O `.gitignore` já protege, mas sempre confirme com `git status` antes.

---

## 10. Histórico de Desenvolvimento (Sessões Claude)

### Sessão 1 — Funcionalidades Base
- [x] Sistema de autenticação com login/senha (SHA-256)
- [x] CRUD de transações (receitas, despesas, transferências)
- [x] CRUD de categorias com emoji e cor
- [x] Dashboard com gráficos de fluxo de caixa
- [x] Sistema de orçamento por categoria
- [x] Patrimônio com ativos e histórico de valores
- [x] Importação de CSV/XLSX com mapeamento de colunas
- [x] Backup e restauração de dados (JSON)
- [x] Editor de tema (cores CSS customizáveis)
- [x] Chat de IA para insights financeiros
- [x] PWA (instalável, offline-first)
- [x] Service Worker com cache-first

### Sessão 2 — Refinamentos UI
- [x] Tela de auth: opção de criar conta vs fazer login
- [x] Logo renomeado para **"Patrono"** com tipografia Cormorant Garamond
- [x] Todas as categorias no Orçamento (não só top 5)
- [x] Patrimônio: "Ilíquido" → "Físico"
- [x] Remoção do painel "Evolução do Patrimônio"
- [x] Migração de conta entre dispositivos via backup
- [x] Fix: auth card com overflow em telas pequenas

### Sessão 3 — Funcionalidades Financeiras Avançadas
- [x] **Trocar senha** — formulário completo no painel Admin
- [x] **Painel Débito vs Crédito** na aba Relatórios
- [x] **Aba Faturas** — visão mensal do cartão de crédito com gráficos e lista
- [x] **Seletor de conta na importação** — define a conta de cada import
- [x] **Troca de conta em lote** — altera a conta de todos os registros de um import
- [x] **Tabela Comparativa Mensal** — heatmap de gastos por categoria ao longo dos meses
- [x] **Deploy no GitHub Pages** — site publicado em https://taylormind.github.io/patrimonium/

---

## 11. Funções Principais (app.js)

| Função | Responsabilidade |
|---|---|
| `save()` | Serializa `state` no localStorage |
| `load()` | Carrega `state` do localStorage |
| `saveAuth(creds)` | Salva credenciais (hash) |
| `loadAuth()` | Carrega credenciais |
| `sha256(text)` | Hash criptográfico via `crypto.subtle` |
| `goTo(section)` | Navega entre abas |
| `renderSection(s)` | Dispatcher — chama o render correto |
| `renderDashboard()` | Renderiza o dashboard completo |
| `renderTransactions()` | Lista paginada de transações com filtros |
| `renderCategories()` | CRUD de categorias |
| `renderBudget()` | Painel de orçamento |
| `renderReports()` | Todos os gráficos de relatório + painel Déb/Créd |
| `renderFaturas()` | Aba de faturas do cartão (mês a mês) |
| `renderFatCompare()` | Tabela comparativa mensal (heatmap) |
| `renderPatrimonio()` | Painel de patrimônio |
| `renderAdmin()` | Painel administrativo / configurações |
| `renderImportHistory()` | Histórico de imports com chip de conta |
| `handleChangePwd(e)` | Valida e salva nova senha |
| `handleLoginSubmit(e)` | Autenticação de login |
| `handleCreateSubmit(e)` | Criação de nova conta |
| `processCSV(data, fname)` | Processa arquivo CSV importado |
| `saveSnapshot()` | Cria snapshot de backup in-app |
| `toast(msg, type)` | Notificação flutuante (success/error/info) |
| `FC.changeImportBatchAccount(batchId, newAccount)` | Troca conta de todas as txs de um import |
| `loadSampleData()` | Carrega dados de demonstração |

---

## 12. Palette de Cores

```css
--orange: #FF6500      /* Cor principal / destaque */
--income: #00D4A3      /* Verde água — receitas */
--expense: #FF4757     /* Vermelho — despesas */
--black-void: #0A0A0A  /* Fundo principal */
--black-deep: #111111  /* Sidebar / Topbar */
--black-card: #1A1A1A  /* Cards */
--black-border: #2A2A2A /* Bordas */
```

---

## 13. Dados Sensíveis — O que NÃO commitar

A pasta `backups/` contém:
- Extratos bancários em CSV (Nubank 2026-01 a 2026-04)
- Backups do localStorage em JSON (dados financeiros completos)
- PDFs de contratos assinados
- Outros documentos pessoais

**Estes arquivos já estão no `.gitignore`** e não foram enviados ao GitHub.

---

## 14. Próximos Passos Sugeridos

- [ ] Filtro por data no painel de Faturas
- [ ] Exportar fatura como PDF
- [ ] Metas financeiras (ex: juntar R$ 10.000 até dezembro)
- [ ] Compartilhar dados entre dispositivos via QR Code
- [ ] Notificações push quando orçamento de categoria está próximo do limite
- [ ] Modo multi-usuário (família)

---

*Documentação gerada automaticamente com base no histórico completo de desenvolvimento do projeto.*
