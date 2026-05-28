/**
 * Patrono — Personal Cash Flow Control System
 * Self-contained SPA with localStorage persistence
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // CONSTANTS
  // ──────────────────────────────────────────────
  const STORAGE_KEY = 'fluxocaixa_v2';
  const BACKUP_SNAPSHOTS_KEY = 'fluxocaixa_backups_v1';
  const AUTH_KEY = 'fluxocaixa_auth_v1';
  const PATRIMONIO_KEY = 'fluxocaixa_patrimonio_v1';
  const SESSION_KEY = 'fluxocaixa_session';
  const LAST_ACTIVITY_KEY = 'fluxocaixa_last_activity';
  const RECOVERY_EMAIL = 'contato.nikotaylor@gmail.com';
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;        // 15 minutos sem atividade
  const IDLE_CHECK_INTERVAL_MS = 30 * 1000;      // verifica a cada 30s
  const PER_PAGE = 20;

  const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const ACCOUNT_LABELS = {
    corrente:'Conta Corrente', poupanca:'Poupança',
    cartao:'Cartão de Crédito', dinheiro:'Dinheiro',
    investimento:'Investimento', outro:'Outro'
  };

  const PALETTE = [
    '#FF6B2B','#00A8E8','#00D4A3','#FF4757','#845EF7',
    '#FFD43B','#FF922B','#51CF66','#FF6B8A','#20C997',
    '#4DABF7','#CC5DE8','#FFA94D','#A9E34B','#74C0FC'
  ];

  const EMOJIS = ['🍔','🚗','🏠','💊','📚','🎮','👗','💳','📦','💰',
    '💻','📈','💵','✈️','🎵','🏋️','🐾','🎁','🔧','🛒',
    '☕','🍕','🍺','💡','📱','🎓','🏦','🎯','🛡️','⚡'];

  const INVEST_CAT_IDS = new Set(['resgate', 'aplicacao']);

  // ──────────────────────────────────────────────
  // THEME CONSTANTS
  // ──────────────────────────────────────────────
  const THEME_KEY = 'fluxocaixa_theme_v1';

  const THEME_VARS = [
    { section: 'Fundos', vars: [
      { key: '--black-void', label: 'Fundo principal' },
      { key: '--black-deep', label: 'Sidebar / Topbar' },
      { key: '--black-card', label: 'Cards' },
      { key: '--black-border', label: 'Bordas' },
    ]},
    { section: 'Destaque', vars: [
      { key: '--orange', label: 'Cor principal' },
    ]},
    { section: 'Semântico', vars: [
      { key: '--income', label: 'Receitas' },
      { key: '--expense', label: 'Despesas' },
    ]},
    { section: 'Texto', vars: [
      { key: '--text-primary', label: 'Texto principal' },
      { key: '--text-secondary', label: 'Texto secundário' },
    ]},
  ];

  const THEME_PRESETS = {
    contrast: {
      '--black-void':'#0A0A0A','--black-deep':'#111111','--black-main':'#0D0D0D',
      '--black-card':'#1A1A1A','--black-hover':'#242424','--black-border':'#2E2E2E','--black-line':'#3D3D3D',
      '--orange':'#FF6500','--orange-light':'#FF8534','--orange-dark':'#CC5200',
      '--orange-glow':'rgba(255,101,0,0.18)','--orange-glow-soft':'rgba(255,101,0,0.08)',
      '--blue':'#5C9ECC','--blue-light':'#7DB8E0','--blue-dark':'#3F7DA8','--blue-deep':'#0D1520',
      '--blue-glow':'rgba(92,158,204,0.18)','--blue-glow-soft':'rgba(92,158,204,0.08)',
      '--income':'#00E676','--income-soft':'rgba(0,230,118,0.12)',
      '--expense':'#FF1744','--expense-soft':'rgba(255,23,68,0.12)','--warning':'#FFC400',
      '--text-primary':'#F0F0F0','--text-secondary':'#999999','--text-muted':'#555555','--text-white':'#FFFFFF',
      '--grad-orange':'linear-gradient(135deg,#FF6500,#FF8534)','--grad-blue':'linear-gradient(135deg,#3F7DA8,#5C9ECC)',
      '--grad-cinema':'linear-gradient(135deg,#FF6500 0%,#CC5200 50%,#111111 100%)',
      '--grad-card-border':'linear-gradient(135deg,rgba(255,101,0,0.35),rgba(92,158,204,0.15))',
    },
    warm: {
      '--black-void':'#211D1A','--black-deep':'#32373D','--black-main':'#2F2A25',
      '--black-card':'#3F3C3A','--black-hover':'#4A4744','--black-border':'#4D4A48','--black-line':'#605D5C',
      '--orange':'#D6421B','--orange-light':'#E05A30','--orange-dark':'#B83515',
      '--orange-glow':'rgba(214,66,27,0.18)','--orange-glow-soft':'rgba(214,66,27,0.08)',
      '--blue':'#6B8FAB','--blue-light':'#8AAFC8','--blue-dark':'#4E7090','--blue-deep':'#252E38',
      '--blue-glow':'rgba(107,143,171,0.18)','--blue-glow-soft':'rgba(107,143,171,0.08)',
      '--income':'#00D4A3','--income-soft':'rgba(0,212,163,0.12)',
      '--expense':'#FF4757','--expense-soft':'rgba(255,71,87,0.12)','--warning':'#FFC107',
      '--text-primary':'#C5C0BB','--text-secondary':'#A5ABAF','--text-muted':'#605D5C','--text-white':'#F0EDE8',
      '--grad-orange':'linear-gradient(135deg,#D6421B,#E05A30)','--grad-blue':'linear-gradient(135deg,#4E7090,#6B8FAB)',
      '--grad-cinema':'linear-gradient(135deg,#D6421B 0%,#B83515 50%,#32373D 100%)',
      '--grad-card-border':'linear-gradient(135deg,rgba(214,66,27,0.35),rgba(107,143,171,0.15))',
    },
    ocean: {
      '--black-void':'#070D14','--black-deep':'#0D1620','--black-main':'#0A1019',
      '--black-card':'#121D2A','--black-hover':'#1A2840','--black-border':'#1F3048','--black-line':'#2A3F58',
      '--orange':'#00B4D8','--orange-light':'#48CAE4','--orange-dark':'#0096B7',
      '--orange-glow':'rgba(0,180,216,0.18)','--orange-glow-soft':'rgba(0,180,216,0.08)',
      '--blue':'#5C9ECC','--blue-light':'#7DB8E0','--blue-dark':'#3F7DA8','--blue-deep':'#0D1520',
      '--blue-glow':'rgba(92,158,204,0.18)','--blue-glow-soft':'rgba(92,158,204,0.08)',
      '--income':'#06D6A0','--income-soft':'rgba(6,214,160,0.12)',
      '--expense':'#EF476F','--expense-soft':'rgba(239,71,111,0.12)','--warning':'#FFC400',
      '--text-primary':'#E8F4F8','--text-secondary':'#7FA4B8','--text-muted':'#3D6880','--text-white':'#FFFFFF',
      '--grad-orange':'linear-gradient(135deg,#00B4D8,#48CAE4)','--grad-blue':'linear-gradient(135deg,#3F7DA8,#5C9ECC)',
      '--grad-cinema':'linear-gradient(135deg,#00B4D8 0%,#0096B7 50%,#0D1620 100%)',
      '--grad-card-border':'linear-gradient(135deg,rgba(0,180,216,0.35),rgba(6,214,160,0.15))',
    },
    midnight: {
      '--black-void':'#0C0A14','--black-deep':'#13102A','--black-main':'#0C0A14',
      '--black-card':'#1A1830','--black-hover':'#232048','--black-border':'#2B2850','--black-line':'#3A3860',
      '--orange':'#9D4EDD','--orange-light':'#B76EF8','--orange-dark':'#7B2FBE',
      '--orange-glow':'rgba(157,78,221,0.18)','--orange-glow-soft':'rgba(157,78,221,0.08)',
      '--blue':'#5C9ECC','--blue-light':'#7DB8E0','--blue-dark':'#3F7DA8','--blue-deep':'#0D1520',
      '--blue-glow':'rgba(92,158,204,0.18)','--blue-glow-soft':'rgba(92,158,204,0.08)',
      '--income':'#06D6A0','--income-soft':'rgba(6,214,160,0.12)',
      '--expense':'#FF6B8A','--expense-soft':'rgba(255,107,138,0.12)','--warning':'#FFC400',
      '--text-primary':'#EDE8FF','--text-secondary':'#9090C0','--text-muted':'#4A4870','--text-white':'#FFFFFF',
      '--grad-orange':'linear-gradient(135deg,#9D4EDD,#B76EF8)','--grad-blue':'linear-gradient(135deg,#3F7DA8,#5C9ECC)',
      '--grad-cinema':'linear-gradient(135deg,#9D4EDD 0%,#7B2FBE 50%,#13102A 100%)',
      '--grad-card-border':'linear-gradient(135deg,rgba(157,78,221,0.35),rgba(6,214,160,0.15))',
    },
  };

  const DEFAULT_CATEGORIES = [
    { id:'alimentacao',  name:'Alimentação',   icon:'🍔', color:'#FF6B2B', type:'expense', budget:0, keywords:'mercado,supermercado,padaria,restaurante,lanche,ifood,rappi,uber eats,almoço,jantar,pizza,açougue,hortifruti,feira' },
    { id:'transporte',   name:'Transporte',    icon:'🚗', color:'#00A8E8', type:'expense', budget:0, keywords:'uber,99,gasolina,combustível,posto,ônibus,metrô,estacionamento,pedágio,táxi,passagem' },
    { id:'moradia',      name:'Moradia',       icon:'🏠', color:'#845EF7', type:'expense', budget:0, keywords:'aluguel,condomínio,iptu,luz,água,energia,internet,telefone,gás,enel,sabesp,claro,vivo,tim,oi' },
    { id:'saude',        name:'Saúde',         icon:'💊', color:'#51CF66', type:'expense', budget:0, keywords:'farmácia,drogaria,médico,consulta,hospital,clínica,exame,plano de saúde,dental,academia,gym' },
    { id:'educacao',     name:'Educação',      icon:'📚', color:'#FFD43B', type:'expense', budget:0, keywords:'escola,faculdade,curso,livro,material,mensalidade,universidade,udemy,alura,coursera' },
    { id:'lazer',        name:'Lazer',         icon:'🎮', color:'#FF6B8A', type:'expense', budget:0, keywords:'netflix,spotify,cinema,teatro,show,jogo,playstation,xbox,steam,amazon prime,disney' },
    { id:'vestuario',    name:'Vestuário',     icon:'👗', color:'#FF922B', type:'expense', budget:0, keywords:'roupa,calçado,sapato,camisa,calça,vestido,moda,zara,h&m,renner,c&a,marisa' },
    { id:'viagem',       name:'Viagem',        icon:'✈️', color:'#4DABF7', type:'expense', budget:0, keywords:'hotel,passagem,aéreo,airbnb,booking,hospedagem,viagem,turismo' },
    { id:'financeiro',   name:'Financeiro',    icon:'💳', color:'#20C997', type:'expense', budget:0, keywords:'tarifa,anuidade,empréstimo,financiamento,parcela,juros,seguro,previdência' },
    { id:'outros_exp',   name:'Outros',        icon:'📦', color:'#868E96', type:'expense', budget:0, keywords:'' },
    { id:'salario',      name:'Salário',       icon:'💰', color:'#51CF66', type:'income',  budget:0, keywords:'salário,salario,ordenado,pagamento,holerite,vencimento,remuneração,pró-labore' },
    { id:'freelance',    name:'Freelance',     icon:'💻', color:'#00A8E8', type:'income',  budget:0, keywords:'freelance,freela,projeto,consultoria,serviço prestado' },
    { id:'investimentos',name:'Investimentos', icon:'📈', color:'#FFD43B', type:'income',  budget:0, keywords:'dividendo,rendimento,juros recebidos,investimento,ação,tesouro,fii,cdb,rendimento poupança' },
    { id:'outros_rec',   name:'Outras Receitas',icon:'💵',color:'#845EF7', type:'income',  budget:0, keywords:'pix recebido,transferência recebida,doação,presente,reembolso' },
    { id:'resgate',   name:'Resgate',   icon:'🏦', color:'#20C997', type:'income',  budget:0, keywords:'resgate,retirada investimento,saque fundo,retirada fundo,resgate cdb,resgate tesouro' },
    { id:'aplicacao', name:'Aplicação', icon:'💹', color:'#CC5DE8', type:'expense', budget:0, keywords:'aplicação,aplicacao,aporte,compra ações,compra fii,tesouro direto,cdb aplicação,investimento enviado' },
  ];

  const LIQUIDITY_LABELS  = { liquid:'Líquido', semi:'Semi-líquido', physical:'Físico', business:'Negócios' };
  const LIQUIDITY_COLORS  = { liquid:'#00D4A3', semi:'#00A8E8', physical:'#FF922B', business:'#845EF7' };

  const DEFAULT_ASSETS = [
    { id:'pat_saldo',    name:'Saldo em Conta',       icon:'💳', color:'#00D4A3', liquidity:'liquid',   autoSync:true,  history:[] },
    { id:'pat_reserva',  name:'Reserva de Emergência',icon:'🛡️', color:'#00A8E8', liquidity:'semi',     autoSync:false, history:[] },
    { id:'pat_imovel',   name:'Imóvel',               icon:'🏠', color:'#845EF7', liquidity:'physical', autoSync:false, history:[] },
    { id:'pat_carro',    name:'Carro',                icon:'🚗', color:'#FF922B', liquidity:'physical', autoSync:false, history:[] },
    { id:'pat_empresa',  name:'Empresa',              icon:'🏢', color:'#FFD43B', liquidity:'physical', autoSync:false, history:[] },
    { id:'pat_negocios', name:'Negócios',             icon:'💼', color:'#845EF7', liquidity:'business', autoSync:false, history:[] },
  ];

  // ──────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────
  let backupsDirHandle = null;

  let state = {
    transactions: [],
    categories: [],
    importHistory: [],
    columnLearnings: {},
    currentSection: 'dashboard',
    viewMonth: new Date(),
    dashPeriod: 'month',
    dashCustomFrom: '',
    dashCustomTo: '',
    dashHideInvest: false,
    budgetPeriod: 'month',
    budgetCustomFrom: '',
    budgetCustomTo: '',
    budgetHideInvest: false,
    sortCol: 'date',
    sortDir: 'desc',
    filters: { type:'', category:'', dateFrom:'', dateTo:'', search:'' },
    page: 1,
    editingTxId: null,
    editingCatId: null,
    editingAssetUpdateId: null,
    editingAssetEditId: null,
    patrimonio: { assets: [] },
    importRawData: null,
    importHeaders: [],
    importQueue: [],
    importQueueIdx: 0,
    reportPeriod: '6m',         // string como dashboard: month / 3m / 6m / 12m / custom
    reportCustomFrom: '',
    reportCustomTo: '',
    faturaMonth: new Date().toISOString().slice(0,7),  // YYYY-MM — mês exibido na aba Faturas
    catFilter: 'all',
    charts: {},
    confirmCallback: null,
  };

  // ──────────────────────────────────────────────
  // STORAGE
  // ──────────────────────────────────────────────
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions: state.transactions,
      categories: state.categories,
      importHistory: state.importHistory,
      columnLearnings: state.columnLearnings,
    }));
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      state.transactions    = d.transactions    || [];
      state.categories      = d.categories      || JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      state.importHistory   = d.importHistory   || [];
      state.columnLearnings = d.columnLearnings || {};
    } else {
      state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    }
    // Migração: garante que as categorias de investimento existam para usuários existentes
    ['resgate', 'aplicacao'].forEach(id => {
      if (!state.categories.find(c => c.id === id)) {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === id);
        if (cat) state.categories.push(JSON.parse(JSON.stringify(cat)));
      }
    });
  }

  function savePatrimonio() {
    localStorage.setItem(PATRIMONIO_KEY, JSON.stringify(state.patrimonio));
  }

  function loadPatrimonio() {
    try {
      const raw = localStorage.getItem(PATRIMONIO_KEY);
      if (raw) {
        state.patrimonio = JSON.parse(raw);
      } else {
        state.patrimonio = { assets: JSON.parse(JSON.stringify(DEFAULT_ASSETS)) };
      }
      // Migração: garante que os ativos padrão existam
      DEFAULT_ASSETS.forEach(def => {
        if (!state.patrimonio.assets.find(a => a.id === def.id)) {
          state.patrimonio.assets.push(JSON.parse(JSON.stringify(def)));
        }
      });
      // Migração: renomeia liquidez 'illiquid' → 'physical' (mudança visual: Ilíquido → Físico)
      // Migração: o ativo pat_negocios passa a usar a liquidez 'business' (criada depois)
      let migrated = false;
      state.patrimonio.assets.forEach(a => {
        if (a.liquidity === 'illiquid') { a.liquidity = 'physical'; migrated = true; }
        if (a.id === 'pat_negocios' && a.liquidity !== 'business') {
          a.liquidity = 'business';
          a.color     = '#845EF7';
          migrated    = true;
        }
      });
      if (migrated) savePatrimonio();
    } catch(e) {
      state.patrimonio = { assets: JSON.parse(JSON.stringify(DEFAULT_ASSETS)) };
    }
  }

  // ──────────────────────────────────────────────
  // THEME
  // ──────────────────────────────────────────────
  function applyTheme(vars) {
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) applyTheme(JSON.parse(saved));
    } catch(e) {}
  }

  function deriveThemeVars(base) {
    const out = { ...base };
    const h2r = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const clamp = x => Math.max(0, Math.min(255, Math.round(x)));
    const hex = (r,g,b) => '#' + [r,g,b].map(x => clamp(x).toString(16).padStart(2,'0')).join('');
    if (out['--orange']?.startsWith('#')) {
      const [r,g,b] = h2r(out['--orange']);
      if (!out['--orange-light']) out['--orange-light'] = hex(r+30,g+15,b);
      if (!out['--orange-dark'])  out['--orange-dark']  = hex(r-30,g-15,b);
      out['--orange-glow'] = `rgba(${r},${g},${b},0.18)`;
      out['--orange-glow-soft'] = `rgba(${r},${g},${b},0.08)`;
      out['--grad-orange'] = `linear-gradient(135deg,${out['--orange']},${out['--orange-light']})`;
      out['--grad-cinema'] = `linear-gradient(135deg,${out['--orange']} 0%,${out['--orange-dark']} 50%,${out['--black-deep']||'#111'} 100%)`;
    }
    ['--income','--expense'].forEach(k => {
      if (out[k]?.startsWith('#')) {
        const [r,g,b] = h2r(out[k]);
        out[k + '-soft'] = `rgba(${r},${g},${b},0.12)`;
      }
    });
    if (out['--black-void']) out['--black-main'] = out['--black-void'];
    if (out['--black-card']?.startsWith('#') && !out['--black-hover']) {
      const [r,g,b] = h2r(out['--black-card']);
      out['--black-hover'] = hex(r+10,g+10,b+10);
    }
    if (out['--black-border']?.startsWith('#') && !out['--black-line']) {
      const [r,g,b] = h2r(out['--black-border']);
      out['--black-line'] = hex(r+15,g+15,b+15);
    }
    return out;
  }

  // ──────────────────────────────────────────────
  // UTILS
  // ──────────────────────────────────────────────
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function fmtBRL(val) {
    return 'R$ ' + Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });
  }

  function fmtDate(iso) {
    const [y,m,d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function isoToday() { return new Date().toISOString().slice(0,10); }

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
  }

  function monthLabel(date) {
    return `${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`;
  }

  function getCat(id) { return state.categories.find(c => c.id === id) || null; }

  function txsInMonth(year, month) {
    return state.transactions.filter(t => {
      const [y,m] = t.date.split('-').map(Number);
      return y === year && m === month;
    });
  }

  function totals(txs) {
    let income = 0, expense = 0;
    txs.forEach(t => { t.type === 'income' ? (income += t.amount) : (expense += t.amount); });
    return { income, expense, net: income - expense };
  }

  // ──────────────────────────────────────────────
  // COLUMN NAME NORMALIZATION
  // ──────────────────────────────────────────────
  function normalizeColName(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim().replace(/\s+/g, ' ');
  }

  // ──────────────────────────────────────────────
  // INVEST FILTER
  // ──────────────────────────────────────────────
  function getInvestCatSet() {
    const ids = new Set(INVEST_CAT_IDS);
    state.categories.forEach(c => {
      const n = c.name.toLowerCase();
      if (n === 'resgate' || n === 'aplicação' || n === 'aplicacao') ids.add(c.id);
    });
    return ids;
  }

  function applyInvestFilter(txs) {
    if (!state.dashHideInvest) return txs;
    const ids = getInvestCatSet();
    return txs.filter(t => !ids.has(t.category));
  }

  // ──────────────────────────────────────────────
  // AUTO-CATEGORIZATION
  // ──────────────────────────────────────────────
  function autoCateg(description) {
    const desc = description.toLowerCase();
    for (const cat of state.categories) {
      if (!cat.keywords) continue;
      const kws = cat.keywords.split(',').map(k => k.trim()).filter(Boolean);
      if (kws.some(k => desc.includes(k.toLowerCase()))) return cat.id;
    }
    return '';
  }

  // ──────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────
  function goTo(section) {
    state.currentSection = section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const sec = document.getElementById(`section-${section}`);
    if (sec) sec.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (nav) nav.classList.add('active');
    const titles = {
      dashboard:'Dashboard', transactions:'Transações', import:'Importar',
      categories:'Categorias', budget:'Orçamento', reports:'Relatórios',
      faturas:'Faturas', patrimonio:'Patrimônio'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;
    renderSection(section);
  }

  function renderSection(s) {
    if (s === 'dashboard')    renderDashboard();
    else if (s === 'transactions') renderTransactions();
    else if (s === 'categories')   renderCategories();
    else if (s === 'budget')       renderBudget();
    else if (s === 'reports')      renderReports();
    else if (s === 'faturas')      renderFaturas();
    else if (s === 'import')       { renderImportHistory(); renderLearnedColumns(); renderImportQueue(); }
    else if (s === 'patrimonio')   renderPatrimonio();
    else if (s === 'admin')        { renderAdmin(); renderBackupPanel(); }
  }

  function renderAdmin() {
    // Dados vêm do Supabase (_currentUser) — fallback para localStorage antigo
    const supaUser  = _currentUser;
    const userEl    = document.getElementById('adminUserName');
    const emailEl   = document.getElementById('adminUserEmail');
    const createdEl = document.getElementById('adminUserCreated');

    if (supaUser) {
      if (userEl)    userEl.textContent  = supaUser.user_metadata?.username || supaUser.email?.split('@')[0] || '—';
      if (emailEl)   emailEl.textContent = supaUser.email || '—';
      if (createdEl) {
        const d = supaUser.created_at ? new Date(supaUser.created_at) : null;
        createdEl.textContent = d ? d.toLocaleDateString('pt-BR') : '—';
      }
    } else {
      // Legacy: dados do localStorage (migração)
      const auth = loadAuth();
      if (!auth) return;
      if (userEl)    userEl.textContent    = auth.user || '—';
      if (emailEl)   emailEl.textContent   = auth.email || '—';
      if (createdEl) {
        const d = auth.createdAt ? new Date(auth.createdAt) : null;
        createdEl.textContent = d ? d.toLocaleDateString('pt-BR') : '—';
      }
    }
  }

  // ──────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────
  const PERIOD_CONFIG = {
    month: { months: 1, label: () => monthLabel(state.viewMonth) },
    '3m':  { months: 3, label: () => { const s = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()-2, 1); return `${MONTHS_PT[s.getMonth()].slice(0,3)} — ${MONTHS_PT[state.viewMonth.getMonth()].slice(0,3)} ${state.viewMonth.getFullYear()}`; } },
    '6m':  { months: 6, label: () => { const s = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()-5, 1); return `${MONTHS_PT[s.getMonth()].slice(0,3)} ${s.getFullYear()} — ${MONTHS_PT[state.viewMonth.getMonth()].slice(0,3)} ${state.viewMonth.getFullYear()}`; } },
    '12m': { months: 12,label: () => { const s = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()-11, 1); return `${MONTHS_PT[s.getMonth()].slice(0,3)} ${s.getFullYear()} — ${MONTHS_PT[state.viewMonth.getMonth()].slice(0,3)} ${state.viewMonth.getFullYear()}`; } },
  };

  function getDashTxs() {
    let txs;
    if (state.dashPeriod === 'custom') {
      const from = state.dashCustomFrom;
      const to   = state.dashCustomTo;
      txs = state.transactions.filter(t => {
        if (from && t.date < from) return false;
        if (to   && t.date > to)   return false;
        return true;
      });
    } else {
      const cfg = PERIOD_CONFIG[state.dashPeriod] || PERIOD_CONFIG.month;
      const n = cfg.months;
      const vm = state.viewMonth;
      if (n === 1) {
        txs = txsInMonth(vm.getFullYear(), vm.getMonth() + 1);
      } else {
        const start = new Date(vm.getFullYear(), vm.getMonth() - n + 1, 1);
        const endISO = `${vm.getFullYear()}-${String(vm.getMonth()+1).padStart(2,'0')}-31`;
        const startISO = start.toISOString().slice(0, 7) + '-01';
        txs = state.transactions.filter(t => t.date >= startISO && t.date <= endISO);
      }
    }
    return applyInvestFilter(txs);
  }

  function getPeriodMonths() {
    if (state.dashPeriod === 'custom') {
      if (state.dashCustomFrom && state.dashCustomTo) {
        const ms = new Date(state.dashCustomTo) - new Date(state.dashCustomFrom);
        return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24 * 30)));
      }
      return 1;
    }
    return (PERIOD_CONFIG[state.dashPeriod] || PERIOD_CONFIG.month).months;
  }

  // ── Budget period helpers ──
  function getBudgetTxs() {
    let txs;
    if (state.budgetPeriod === 'custom') {
      const from = state.budgetCustomFrom;
      const to   = state.budgetCustomTo;
      txs = state.transactions.filter(t => {
        if (from && t.date < from) return false;
        if (to   && t.date > to)   return false;
        return true;
      });
    } else {
      const cfg = PERIOD_CONFIG[state.budgetPeriod] || PERIOD_CONFIG.month;
      const n = cfg.months;
      const vm = state.viewMonth;
      if (n === 1) {
        txs = txsInMonth(vm.getFullYear(), vm.getMonth() + 1);
      } else {
        const start = new Date(vm.getFullYear(), vm.getMonth() - n + 1, 1);
        const endISO = `${vm.getFullYear()}-${String(vm.getMonth()+1).padStart(2,'0')}-31`;
        const startISO = start.toISOString().slice(0, 7) + '-01';
        txs = state.transactions.filter(t => t.date >= startISO && t.date <= endISO);
      }
    }
    if (state.budgetHideInvest) {
      const ids = getInvestCatSet();
      txs = txs.filter(t => !ids.has(t.category));
    }
    return txs;
  }

  function getBudgetPeriodMonths() {
    if (state.budgetPeriod === 'custom') {
      if (state.budgetCustomFrom && state.budgetCustomTo) {
        const ms = new Date(state.budgetCustomTo) - new Date(state.budgetCustomFrom);
        return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24 * 30)));
      }
      return 1;
    }
    return (PERIOD_CONFIG[state.budgetPeriod] || PERIOD_CONFIG.month).months;
  }

  function getBudgetPeriodLabel() {
    if (state.budgetPeriod === 'custom') {
      const from = state.budgetCustomFrom;
      const to   = state.budgetCustomTo;
      if (from && to)   return `${fmtDate(from)} até ${fmtDate(to)}`;
      if (from)         return `A partir de ${fmtDate(from)}`;
      if (to)           return `Até ${fmtDate(to)}`;
      return 'Todo o período';
    }
    const cfg = PERIOD_CONFIG[state.budgetPeriod] || PERIOD_CONFIG.month;
    return cfg.label();
  }

  // ──────────────────────────────────────────────
  // PATRIMÔNIO — HELPERS
  // ──────────────────────────────────────────────
  function getAssetCurrentValue(asset) {
    if (asset.autoSync) {
      const { income, expense } = totals(state.transactions);
      return Math.max(0, income - expense);
    }
    if (!asset.history || !asset.history.length) return 0;
    return asset.history[asset.history.length - 1].value;
  }

  function getAssetLastUpdate(asset) {
    if (asset.autoSync) return asset.history.length ? asset.history[asset.history.length - 1].date : null;
    if (!asset.history || !asset.history.length) return null;
    return asset.history[asset.history.length - 1].date;
  }

  function getAssetPrevValue(asset) {
    if (asset.autoSync || !asset.history || asset.history.length < 2) return null;
    return asset.history[asset.history.length - 2].value;
  }

  function autoSnapshotSaldo(date) {
    const saldo = state.patrimonio.assets.find(a => a.id === 'pat_saldo');
    if (!saldo) return;
    const { income, expense } = totals(state.transactions);
    const val = Math.max(0, income - expense);
    const d = date || isoToday();
    saldo.history = saldo.history.filter(h => h.date !== d);
    saldo.history.push({ date: d, value: val, note: 'auto' });
    saldo.history.sort((a, b) => a.date.localeCompare(b.date));
  }

  // ──────────────────────────────────────────────
  // PATRIMÔNIO — RENDER
  // ──────────────────────────────────────────────
  function renderPatrimonio() {
    const assets = state.patrimonio.assets;
    let totalLiquid = 0, totalSemi = 0, totalPhysical = 0, totalBusiness = 0;
    assets.forEach(a => {
      const v = getAssetCurrentValue(a);
      if      (a.liquidity === 'liquid')    totalLiquid   += v;
      else if (a.liquidity === 'semi')      totalSemi     += v;
      else if (a.liquidity === 'business')  totalBusiness += v;
      else                                  totalPhysical += v;
    });
    const grandTotal = totalLiquid + totalSemi + totalPhysical + totalBusiness;

    // Total
    document.getElementById('patTotalValue').textContent = fmtBRL(grandTotal);

    // Liquidity groups
    const liqEl = document.getElementById('patLiqGroups');
    liqEl.innerHTML = [
      { key:'liquid',   label:'Líquido',       val: totalLiquid },
      { key:'semi',     label:'Semi-líquido',   val: totalSemi },
      { key:'physical', label:'Físico',         val: totalPhysical },
      { key:'business', label:'Negócios',       val: totalBusiness },
    ].map(g => `<div class="pat-liq-group">
      <span class="pat-liq-dot" style="background:${LIQUIDITY_COLORS[g.key]}"></span>
      <span class="pat-liq-label">${g.label}</span>
      <span class="pat-liq-val">${fmtBRL(g.val)}</span>
      <span class="pat-liq-pct">${grandTotal > 0 ? (g.val/grandTotal*100).toFixed(1) + '%' : '0%'}</span>
    </div>`).join('');

    // Liquidity bar
    const barEl = document.getElementById('patLiqBar');
    if (grandTotal > 0) {
      const pL = +(totalLiquid   / grandTotal * 100).toFixed(2);
      const pS = +(totalSemi     / grandTotal * 100).toFixed(2);
      const pP = +(totalPhysical / grandTotal * 100).toFixed(2);
      const pB = +(100 - pL - pS - pP).toFixed(2);
      barEl.innerHTML =
        (totalLiquid   > 0 ? `<div class="pat-liq-seg liquid"   style="width:${pL}%"></div>` : '') +
        (totalSemi     > 0 ? `<div class="pat-liq-seg semi"     style="width:${pS}%"></div>` : '') +
        (totalPhysical > 0 ? `<div class="pat-liq-seg physical" style="width:${pP}%"></div>` : '') +
        (totalBusiness > 0 ? `<div class="pat-liq-seg business" style="width:${pB}%"></div>` : '');
    } else {
      barEl.innerHTML = `<div class="pat-liq-seg empty" style="width:100%"></div>`;
    }

    renderPatCompositionChart(assets, grandTotal);

    // Asset cards
    const grid = document.getElementById('patAssetsGrid');
    grid.innerHTML = assets.map(a => {
      const val  = getAssetCurrentValue(a);
      const prev = getAssetPrevValue(a);
      const lastDate = getAssetLastUpdate(a);
      const pct  = grandTotal > 0 ? (val / grandTotal * 100).toFixed(1) : '0.0';
      const liqColor = LIQUIDITY_COLORS[a.liquidity] || '#868E96';
      const liqLabel = LIQUIDITY_LABELS[a.liquidity] || a.liquidity;

      let changeHtml = '';
      if (prev !== null) {
        const diff    = val - prev;
        const diffPct = prev > 0 ? (diff / prev * 100).toFixed(1) : '0.0';
        const cls     = diff >= 0 ? 'income' : 'expense';
        const sign    = diff >= 0 ? '+' : '';
        changeHtml = `<div class="pat-card-change ${cls}">
          ${sign}${fmtBRL(Math.abs(diff))} (${sign}${diffPct}%) desde registro anterior
        </div>`;
      }

      const canDelete = !a.autoSync;

      return `<div class="pat-asset-card">
        <div class="pat-card-header">
          <div class="pat-card-icon" style="background:${a.color}22">${a.icon}</div>
          <div class="pat-card-title-wrap">
            <div class="pat-card-name">${esc(a.name)}</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <span class="pat-liq-badge" style="background:${liqColor}22;color:${liqColor}">${liqLabel}</span>
              ${a.autoSync ? `<span class="pat-sync-badge"><i class="fas fa-link"></i> auto</span>` : ''}
            </div>
          </div>
          ${!a.autoSync ? `<button class="btn-icon" onclick="FC.editAsset('${a.id}')" title="Editar ativo"><i class="fas fa-pen"></i></button>` : ''}
          ${canDelete ? `<button class="btn-icon delete" onclick="FC.deleteAsset('${a.id}')" title="Excluir ativo"><i class="fas fa-trash"></i></button>` : ''}
        </div>

        <div class="pat-card-value">${fmtBRL(val)}</div>
        ${changeHtml}

        <div class="pat-card-pct-bar">
          <div class="pat-card-pct-fill" style="background:${a.color};width:${Math.min(parseFloat(pct), 100)}%"></div>
        </div>
        <div class="pat-card-meta">
          <span>${pct}% do patrimônio</span>
          <span>${lastDate ? 'Atualizado ' + fmtDate(lastDate) : 'Sem registros'}</span>
        </div>

        <div class="pat-card-actions">
          ${a.autoSync
            ? `<button class="btn-outline pat-snapshot-btn" onclick="FC.snapshotSaldo()">
                <i class="fas fa-camera"></i> Registrar snapshot
              </button>`
            : `<button class="btn-primary" onclick="FC.updateAsset('${a.id}')">
                <i class="fas fa-pen-to-square"></i> Atualizar valor
              </button>`
          }
        </div>
      </div>`;
    }).join('');
  }

  function renderPatCompositionChart(assets, grandTotal) {
    destroyChart('patComposition');
    const canvas = document.getElementById('patCompositionChart');
    const legend = document.getElementById('patCompositionLegend');
    if (!canvas) return;

    const data   = assets.map(a => getAssetCurrentValue(a));
    const labels = assets.map(a => a.name);
    const colors = assets.map(a => a.color);

    if (!grandTotal) {
      canvas.style.display = 'none';
      let msg = canvas.parentElement.querySelector('.no-data-msg');
      if (!msg) { msg = document.createElement('div'); msg.className = 'no-data-msg'; canvas.parentElement.appendChild(msg); }
      msg.style.cssText = 'display:flex;align-items:center;justify-content:center;height:180px;color:var(--text-muted);font-size:13px';
      msg.textContent = 'Nenhum ativo registrado ainda';
      legend.innerHTML = '';
      return;
    }
    canvas.style.display = '';
    const oldMsg = canvas.parentElement.querySelector('.no-data-msg');
    if (oldMsg) oldMsg.style.display = 'none';

    state.charts.patComposition = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }] },
      options: {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.label}: ${fmtBRL(ctx.raw)} (${(ctx.raw/grandTotal*100).toFixed(1)}%)` }
          }
        }
      }
    });

    legend.innerHTML = assets.map((a, i) => {
      const pct = grandTotal > 0 ? (data[i]/grandTotal*100).toFixed(1) : '0.0';
      return `<div class="donut-legend-item">
        <div class="donut-legend-dot" style="background:${a.color}"></div>
        <span class="donut-legend-label">${esc(a.name)}</span>
        <span class="donut-legend-val">${pct}%</span>
      </div>`;
    }).join('');
  }

  // ──────────────────────────────────────────────
  // PATRIMÔNIO — MODAIS
  // ──────────────────────────────────────────────
  function openAssetUpdateModal(assetId) {
    state.editingAssetUpdateId = assetId;
    const asset = state.patrimonio.assets.find(a => a.id === assetId);
    if (!asset) return;
    const cur = getAssetCurrentValue(asset);
    document.getElementById('assetUpdateTitle').textContent = `Atualizar — ${asset.name}`;
    document.getElementById('assetUpdateValue').value = cur > 0 ? cur : '';
    document.getElementById('assetUpdateNote').value  = '';
    showModal('assetUpdateModal');
  }

  function saveAssetUpdate() {
    const assetId = state.editingAssetUpdateId;
    const asset   = state.patrimonio.assets.find(a => a.id === assetId);
    if (!asset) return;
    const value = parseFloat(document.getElementById('assetUpdateValue').value);
    if (isNaN(value) || value < 0) { toast('Informe um valor válido', 'error'); return; }
    const note  = document.getElementById('assetUpdateNote').value.trim();
    const today = isoToday();

    // Remove entrada do mesmo dia para não duplicar
    asset.history = asset.history.filter(h => h.date !== today);
    asset.history.push({ date: today, value, note });
    asset.history.sort((a, b) => a.date.localeCompare(b.date));

    // Auto-snapshot do saldo junto
    autoSnapshotSaldo(today);

    savePatrimonio();
    hideModal('assetUpdateModal');
    renderPatrimonio();
    toast(`${asset.name} atualizado para ${fmtBRL(value)}`, 'success');
  }

  function openAssetEditModal(assetId) {
    state.editingAssetEditId = assetId || null;
    const asset = assetId ? state.patrimonio.assets.find(a => a.id === assetId) : null;
    document.getElementById('assetEditTitle').textContent = asset ? `Editar — ${asset.name}` : 'Novo Ativo';

    document.getElementById('assetEditName').value      = asset ? asset.name : '';
    document.getElementById('assetEditLiquidity').value = asset ? asset.liquidity : 'physical';
    document.getElementById('assetEditValue').value     = '';

    // Mostra campo de valor inicial só na criação
    const valueWrap = document.getElementById('assetEditValueWrap');
    valueWrap.style.display = asset ? 'none' : '';

    // Emoji picker
    const ep     = document.getElementById('assetEmojiPicker');
    const selIcon = asset ? asset.icon : EMOJIS[0];
    document.getElementById('assetIconInput').value = selIcon;
    ep.innerHTML  = EMOJIS.map(e =>
      `<div class="emoji-opt ${e===selIcon?'selected':''}" data-emoji="${e}" onclick="selectAssetEmoji(this,'${e}')">${e}</div>`
    ).join('');

    // Color picker
    const cp       = document.getElementById('assetColorPicker');
    const selColor = asset ? asset.color : PALETTE[0];
    cp.innerHTML   = PALETTE.map(c =>
      `<div class="color-opt ${c===selColor?'selected':''}" data-color="${c}" style="background:${c}" onclick="selectColor(this,'${c}')"></div>`
    ).join('');
    cp.dataset.selected = selColor;

    showModal('assetEditModal');
  }

  window.selectAssetEmoji = function(el, emoji) {
    document.querySelectorAll('#assetEmojiPicker .emoji-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('assetIconInput').value = emoji;
  };

  function saveAssetEdit() {
    const name      = document.getElementById('assetEditName').value.trim();
    const liquidity = document.getElementById('assetEditLiquidity').value;
    const icon      = document.getElementById('assetIconInput').value || '💎';
    const color     = document.getElementById('assetColorPicker').dataset.selected || PALETTE[0];
    if (!name) { toast('Informe o nome do ativo', 'error'); return; }

    if (state.editingAssetEditId) {
      // Editar existente (apenas metadados)
      const asset = state.patrimonio.assets.find(a => a.id === state.editingAssetEditId);
      if (asset) { asset.name = name; asset.liquidity = liquidity; asset.icon = icon; asset.color = color; }
      toast('Ativo atualizado', 'success');
    } else {
      // Criar novo
      const initVal = parseFloat(document.getElementById('assetEditValue').value) || 0;
      const today   = isoToday();
      const newAsset = {
        id: uid(),
        name, icon, color, liquidity,
        autoSync: false,
        history: initVal > 0 ? [{ date: today, value: initVal, note: 'valor inicial' }] : [],
      };
      state.patrimonio.assets.push(newAsset);
      if (initVal > 0) autoSnapshotSaldo(today);
      toast(`${name} adicionado`, 'success');
    }

    savePatrimonio();
    hideModal('assetEditModal');
    renderPatrimonio();
  }

  function renderDashboard() {
    const periodTxs = getDashTxs();
    const { income, expense, net } = totals(periodTxs);
    const allFiltered = applyInvestFilter(state.transactions);
    const allTotals = totals(allFiltered);
    const balance = allTotals.income - allTotals.expense;

    // Period label
    let periodStr;
    if (state.dashPeriod === 'custom') {
      const from = state.dashCustomFrom;
      const to   = state.dashCustomTo;
      if (from && to)   periodStr = `${fmtDate(from)} até ${fmtDate(to)}`;
      else if (from)    periodStr = `A partir de ${fmtDate(from)}`;
      else if (to)      periodStr = `Até ${fmtDate(to)}`;
      else              periodStr = 'Todo o período';
    } else {
      const cfg = PERIOD_CONFIG[state.dashPeriod] || PERIOD_CONFIG.month;
      periodStr = cfg.label();
    }
    const labelEl = document.getElementById('dashPeriodLabel');
    if (labelEl) labelEl.textContent = periodStr;

    // Card labels adapt to period
    const periodSuffix = state.dashPeriod === 'month' ? 'do Mês' : `(${periodStr})`;
    document.querySelector('.card-income .card-label').textContent  = `Receitas ${periodSuffix}`;
    document.querySelector('.card-expense .card-label').textContent = `Despesas ${periodSuffix}`;
    document.querySelector('.card-savings .card-label').textContent = `Resultado ${periodSuffix}`;

    document.getElementById('totalBalance').textContent = fmtBRL(balance);
    document.getElementById('balanceSub').textContent = state.dashHideInvest
      ? `sem resgates/aplicações · ${allFiltered.length} tx`
      : `acumulado de ${state.transactions.length} transações`;
    document.getElementById('monthIncome').textContent = fmtBRL(income);
    document.getElementById('incomeSub').textContent = `${periodTxs.filter(t=>t.type==='income').length} lançamentos`;
    document.getElementById('monthExpense').textContent = fmtBRL(expense);
    document.getElementById('expenseSub').textContent = `${periodTxs.filter(t=>t.type==='expense').length} lançamentos`;
    document.getElementById('monthResult').textContent = fmtBRL(net);
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;
    document.getElementById('savingsRate').textContent = `${rate}% de economia`;

    renderCashflowChart();
    renderCategoryChart(periodTxs);
    renderIncomeCategoryChart(periodTxs);
    renderRecentList();
    renderBudgetMini(getDashTxs());
  }

  function renderRecentList() {
    const el = document.getElementById('recentList');
    const recent = [...applyInvestFilter(state.transactions)].sort((a,b) => b.date.localeCompare(a.date)).slice(0,8);
    if (!recent.length) {
      el.innerHTML = '<div class="empty-state" style="padding:30px 20px"><i class="fas fa-receipt"></i><p>Sem transações</p></div>';
      return;
    }
    el.innerHTML = recent.map(t => {
      const cat = getCat(t.category);
      const icon = cat ? cat.icon : '📦';
      const color = cat ? cat.color : '#868E96';
      return `<div class="mini-tx">
        <div class="mini-tx-icon" style="background:${color}22">${icon}</div>
        <div class="mini-tx-info">
          <div class="mini-tx-desc">${esc(t.description)}</div>
          <div class="mini-tx-meta">${fmtDate(t.date)} · ${cat ? esc(cat.name) : '—'}</div>
        </div>
        <div class="mini-tx-amt ${t.type}">${t.type==='expense'?'−':'+'}${fmtBRL(t.amount)}</div>
      </div>`;
    }).join('');
  }

  function renderBudgetMini(txs) {
    const el = document.getElementById('budgetMiniList');
    const catsWithBudget = state.categories.filter(c => c.budget > 0 && c.type !== 'income');
    if (!catsWithBudget.length) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:20px">Nenhum orçamento definido</div>';
      return;
    }
    const months = getPeriodMonths();
    el.innerHTML = catsWithBudget.slice(0,5).map(cat => {
      const spent = txs.filter(t => t.category === cat.id && t.type === 'expense').reduce((s,t) => s+t.amount, 0);
      const budget = cat.budget * months;
      const pct = Math.min(Math.round((spent / budget) * 100), 100);
      const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
      return `<div class="budget-mini-item ${cls}">
        <div class="bmi-top">
          <span class="bmi-name">${cat.icon} ${esc(cat.name)}</span>
          <span class="bmi-pct">${pct}%</span>
        </div>
        <div class="bmi-amounts"><strong>${fmtBRL(spent)}</strong><span class="bmi-sep">de</span><span>${fmtBRL(budget)}</span></div>
        <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
  }

  // ──────────────────────────────────────────────
  // CHARTS
  // ──────────────────────────────────────────────
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101020',
        titleColor: '#EEEEF8',
        bodyColor: '#8888AA',
        borderColor: 'rgba(255,107,43,0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    }
  };

  Chart.defaults.color = '#555566';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;

  function destroyChart(key) {
    if (state.charts[key]) { state.charts[key].destroy(); delete state.charts[key]; }
  }

  function renderCashflowChart() {
    destroyChart('cashflow');
    const canvas = document.getElementById('cashflowChart');
    if (!canvas) return;

    const labels = [], incomes = [], expenses = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth() - i, 1);
      labels.push(MONTHS_PT[d.getMonth()].slice(0,3) + ' ' + String(d.getFullYear()).slice(2));
      const txs = applyInvestFilter(txsInMonth(d.getFullYear(), d.getMonth() + 1));
      const t = totals(txs);
      incomes.push(t.income);
      expenses.push(t.expense);
    }

    state.charts.cashflow = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: incomes,
            borderColor: '#00D4A3',
            backgroundColor: 'rgba(0,212,163,0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#00D4A3',
            pointRadius: 3,
          },
          {
            label: 'Despesas',
            data: expenses,
            borderColor: '#FF4757',
            backgroundColor: 'rgba(255,71,87,0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#FF4757',
            pointRadius: 3,
          }
        ]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtBRL(ctx.raw)}` }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556A' } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#55556A', callback: v => 'R$ ' + v.toLocaleString('pt-BR') } }
        }
      }
    });
  }

  function renderCategoryChart(monthTxs) {
    destroyChart('catChart');
    const canvas = document.getElementById('categoryChart');
    const legend = document.getElementById('categoryChartLegend');
    if (!canvas) return;

    const expTxs = monthTxs.filter(t => {
      if (t.type !== 'expense') return false;
      const cat = getCat(t.category);
      if (cat && cat.type === 'income') return false;
      return true;
    });
    const catMap = {};
    expTxs.forEach(t => {
      const k = t.category || 'outros_exp';
      catMap[k] = (catMap[k] || 0) + t.amount;
    });

    const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0,8);
    const labels = sorted.map(([k]) => { const c = getCat(k); return c ? c.name : 'Outros'; });
    const data = sorted.map(([,v]) => v);
    const colors = sorted.map(([k]) => { const c = getCat(k); return c ? c.color : '#868E96'; });
    const total = data.reduce((s,v) => s+v, 0);

    if (!data.length) {
      canvas.style.display = 'none';
      let msg = canvas.parentElement.querySelector('.no-data-msg');
      if (!msg) { msg = document.createElement('div'); msg.className = 'no-data-msg'; canvas.parentElement.appendChild(msg); }
      msg.style.cssText = 'display:flex;align-items:center;justify-content:center;height:180px;color:var(--text-muted);font-size:13px';
      msg.textContent = 'Sem despesas no mês';
      legend.innerHTML = '';
      return;
    }

    canvas.style.display = '';
    const oldMsg = canvas.parentElement.querySelector('.no-data-msg');
    if (oldMsg) oldMsg.style.display = 'none';

    state.charts.catChart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }] },
      options: {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${fmtBRL(ctx.raw)} (${Math.round(ctx.raw/total*100)}%)`
            }
          }
        }
      }
    });

    legend.innerHTML = sorted.map(([k,v], i) => `
      <div class="donut-legend-item">
        <div class="donut-legend-dot" style="background:${colors[i]}"></div>
        <span class="donut-legend-label">${labels[i]}</span>
        <span class="donut-legend-val">${Math.round(v/total*100)}%</span>
      </div>`).join('');
  }

  function renderIncomeCategoryChart(monthTxs) {
    destroyChart('incomeCatChart');
    const canvas = document.getElementById('incomeCatChart');
    const legend = document.getElementById('incomeCatChartLegend');
    if (!canvas) return;

    const incTxs = monthTxs.filter(t => {
      if (t.type !== 'income') return false;
      if (t.category === 'resgate') return false;
      const cat = getCat(t.category);
      if (cat && cat.type === 'expense') return false;
      return true;
    });
    const catMap = {};
    incTxs.forEach(t => {
      const k = t.category || 'outros_rec';
      catMap[k] = (catMap[k] || 0) + t.amount;
    });

    const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0,8);
    const labels = sorted.map(([k]) => { const c = getCat(k); return c ? c.name : 'Outros'; });
    const data = sorted.map(([,v]) => v);
    const colors = sorted.map(([k]) => { const c = getCat(k); return c ? c.color : '#868E96'; });
    const total = data.reduce((s,v) => s+v, 0);

    if (!data.length) {
      canvas.style.display = 'none';
      let msg = canvas.parentElement.querySelector('.no-data-msg');
      if (!msg) { msg = document.createElement('div'); msg.className = 'no-data-msg'; canvas.parentElement.appendChild(msg); }
      msg.style.cssText = 'display:flex;align-items:center;justify-content:center;height:180px;color:var(--text-muted);font-size:13px';
      msg.textContent = 'Sem receitas no mês';
      legend.innerHTML = '';
      return;
    }

    canvas.style.display = '';
    const oldMsg = canvas.parentElement.querySelector('.no-data-msg');
    if (oldMsg) oldMsg.style.display = 'none';

    state.charts.incomeCatChart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'transparent', borderWidth: 0, hoverOffset: 6 }] },
      options: {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            ...chartDefaults.plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${fmtBRL(ctx.raw)} (${Math.round(ctx.raw/total*100)}%)`
            }
          }
        }
      }
    });

    legend.innerHTML = sorted.map(([k,v], i) => `
      <div class="donut-legend-item">
        <div class="donut-legend-dot" style="background:${colors[i]}"></div>
        <span class="donut-legend-label">${labels[i]}</span>
        <span class="donut-legend-val">${Math.round(v/total*100)}%</span>
      </div>`).join('');
  }

  // ──────────────────────────────────────────────
  // TRANSACTIONS
  // ──────────────────────────────────────────────
  function normalizeDesc(desc) {
    return String(desc).toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function buildPaginationHTML(pages, current) {
    if (pages <= 1) return '';
    const nums = new Set([1, pages, current, current - 1, current + 1]);
    const visible = [...nums].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);

    let html = `<button class="pg-btn pg-arrow" ${current === 1 ? 'disabled' : `data-page="${current - 1}"`} aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>`;
    let prev = 0;
    visible.forEach(n => {
      if (n - prev > 1) html += `<span class="pg-ellipsis">…</span>`;
      html += `<button class="pg-btn ${n === current ? 'active' : ''}" data-page="${n}">${n}</button>`;
      prev = n;
    });
    html += `<button class="pg-btn pg-arrow" ${current === pages ? 'disabled' : `data-page="${current + 1}"`} aria-label="Próxima"><i class="fas fa-chevron-right"></i></button>`;
    return html;
  }

  function autoCategorizeCurrentPage() {
    const txs = getFilteredTxs();
    const pages = Math.max(1, Math.ceil(txs.length / PER_PAGE));
    const page  = Math.min(state.page, pages);
    const slice = txs.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    if (!slice.length) return;

    const pageIds = new Set(slice.map(t => t.id));

    // Constrói mapa: descNormalizada → { catId → quantidade } a partir das outras páginas
    const freq = {};
    state.transactions.forEach(t => {
      if (pageIds.has(t.id) || !t.category) return;
      const key = normalizeDesc(t.description);
      if (!freq[key]) freq[key] = {};
      freq[key][t.category] = (freq[key][t.category] || 0) + 1;
    });

    // Pega a categoria mais frequente por descrição
    const lookup = {};
    Object.entries(freq).forEach(([key, counts]) => {
      lookup[key] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    });

    // Aplica às transações da página atual
    let updated = 0;
    state.transactions.forEach(t => {
      if (!pageIds.has(t.id)) return;
      const match = lookup[normalizeDesc(t.description)];
      if (match && match !== t.category) {
        t.category = match;
        updated++;
      }
    });

    if (updated) {
      save();
      renderTransactions();
      toast(`${updated} transaç${updated === 1 ? 'ão categorizada' : 'ões categorizadas'} com base nas demais páginas`, 'success');
    } else {
      toast('Nenhuma correspondência nova encontrada nas outras páginas', 'info');
    }
  }

  function getFilteredTxs() {
    let txs = [...state.transactions];
    const f = state.filters;
    if (f.type)     txs = txs.filter(t => t.type === f.type);
    if (f.category) txs = txs.filter(t => t.category === f.category);
    if (f.dateFrom) txs = txs.filter(t => t.date >= f.dateFrom);
    if (f.dateTo)   txs = txs.filter(t => t.date <= f.dateTo);
    if (f.search)   txs = txs.filter(t => t.description.toLowerCase().includes(f.search.toLowerCase()));

    txs.sort((a,b) => {
      let va = a[state.sortCol], vb = b[state.sortCol];
      if (state.sortCol === 'amount') { va = a.amount; vb = b.amount; }
      if (state.sortCol === 'category') {
        const ca = getCat(a.category); const cb = getCat(b.category);
        va = ca ? ca.name : ''; vb = cb ? cb.name : '';
      }
      if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return txs;
  }

  function renderTransactions() {
    const txs = getFilteredTxs();
    const total = txs.length;
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    state.page = Math.min(state.page, pages);
    const slice = txs.slice((state.page-1)*PER_PAGE, state.page*PER_PAGE);

    const body = document.getElementById('txBody');
    const empty = document.getElementById('txEmpty');
    const table = document.getElementById('txTable');

    if (!slice.length) {
      table.classList.add('hidden');
      empty.classList.remove('hidden');
    } else {
      table.classList.remove('hidden');
      empty.classList.add('hidden');
      body.innerHTML = slice.map(t => {
        const cat = getCat(t.category);
        const catHtml = cat
          ? `<span class="cat-badge" style="background:${cat.color}22;color:${cat.color}">${cat.icon} ${esc(cat.name)}</span>`
          : `<span class="text-muted">—</span>`;
        const sign = t.type === 'expense' ? '−' : '+';
        return `<tr>
          <td>${fmtDate(t.date)}</td>
          <td><div style="font-weight:500">${esc(t.description)}</div>${t.notes?`<div style="font-size:11px;color:var(--text-muted)">${esc(t.notes)}</div>`:''}</td>
          <td class="cat-cell" data-txid="${t.id}">${catHtml}</td>
          <td><span class="account-chip">${ACCOUNT_LABELS[t.account]||t.account}</span></td>
          <td><span class="tx-amount ${t.type}">${sign}${fmtBRL(t.amount)}</span></td>
          <td class="col-actions">
            <button class="btn-icon edit" onclick="FC.editTx('${t.id}')" title="Editar"><i class="fas fa-pen"></i></button>
            <button class="btn-icon delete" onclick="FC.deleteTx('${t.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
      }).join('');
    }

    const countLabel = `${total} transaç${total !== 1 ? 'ões' : 'ão'}`;
    document.getElementById('txCount').textContent = countLabel;
    const topCount = document.getElementById('txCountTop');
    if (topCount) topCount.textContent = countLabel;

    // Pagination — top + bottom
    const pgHTML = buildPaginationHTML(pages, state.page);
    ['txPagination', 'txPaginationTop'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = pgHTML;
      el.querySelectorAll('button.pg-btn[data-page]').forEach(btn => {
        btn.onclick = () => { state.page = parseInt(btn.dataset.page, 10); renderTransactions(); };
      });
    });

    // Update sort headers
    document.querySelectorAll('#txTable th.sortable').forEach(th => {
      th.classList.remove('sort-asc','sort-desc');
      if (th.dataset.col === state.sortCol)
        th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    });

    // Populate category filter
    const sel = document.getElementById('filterCategory');
    const curVal = sel.value;
    sel.innerHTML = '<option value="">Todas as categorias</option>' +
      state.categories.map(c => `<option value="${c.id}" ${curVal===c.id?'selected':''}>${c.icon} ${esc(c.name)}</option>`).join('');
    if (curVal) sel.value = curVal;
  }

  // ──────────────────────────────────────────────
  // TRANSACTION MODAL
  // ──────────────────────────────────────────────
  function openTxModal(id) {
    state.editingTxId = id || null;
    const tx = id ? state.transactions.find(t => t.id === id) : null;
    document.getElementById('txModalTitle').textContent = tx ? 'Editar Transação' : 'Nova Transação';

    const type = tx ? tx.type : 'expense';
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === type);
    });

    document.getElementById('txDesc').value  = tx ? tx.description : '';
    document.getElementById('txAmt').value   = tx ? tx.amount : '';
    document.getElementById('txDate').value  = tx ? tx.date : isoToday();
    document.getElementById('txNotes').value = tx ? (tx.notes||'') : '';
    document.getElementById('txAcc').value   = tx ? (tx.account||'corrente') : 'corrente';

    // Populate category select
    const catSel = document.getElementById('txCat');
    catSel.innerHTML = '<option value="">Sem categoria</option>' +
      state.categories.map(c => `<option value="${c.id}" ${tx&&tx.category===c.id?'selected':''}>${c.icon} ${esc(c.name)}</option>`).join('');
    if (tx && tx.category) catSel.value = tx.category;

    showModal('txModal');
  }

  function saveTx() {
    const type = document.querySelector('.type-btn.active')?.dataset.type || 'expense';
    const desc = document.getElementById('txDesc').value.trim();
    const amt  = parseFloat(document.getElementById('txAmt').value);
    const date = document.getElementById('txDate').value;
    const cat  = document.getElementById('txCat').value;
    const acc  = document.getElementById('txAcc').value;
    const notes= document.getElementById('txNotes').value.trim();

    if (!desc) { toast('Informe a descrição', 'error'); return; }
    if (!amt || amt <= 0) { toast('Informe um valor válido', 'error'); return; }
    if (!date) { toast('Informe a data', 'error'); return; }

    if (state.editingTxId) {
      const idx = state.transactions.findIndex(t => t.id === state.editingTxId);
      if (idx >= 0) state.transactions[idx] = { ...state.transactions[idx], type, description:desc, amount:amt, date, category:cat, account:acc, notes };
      toast('Transação atualizada', 'success');
    } else {
      state.transactions.push({ id:uid(), type, description:desc, amount:amt, date, category:cat, account:acc, notes });
      toast('Transação adicionada', 'success');
    }

    save();
    hideModal('txModal');
    renderSection(state.currentSection);
  }

  window.FC = {
    editTx(id) { openTxModal(id); },
    deleteTx(id) {
      confirm('Excluir transação?', 'Essa ação não pode ser desfeita.', () => {
        state.transactions = state.transactions.filter(t => t.id !== id);
        save();
        toast('Transação excluída', 'warning');
        renderSection(state.currentSection);
      });
    },
    deleteLearnedCol(norm) {
      delete state.columnLearnings[norm];
      save();
      renderLearnedColumns();
      toast('Padrão removido', 'warning');
    },
    deleteSnapshot(idx) {
      confirm('Excluir backup?', 'Esse snapshot será removido permanentemente.', async () => {
        const snaps = loadSnapshotList();
        snaps.splice(idx, 1);
        localStorage.setItem(BACKUP_SNAPSHOTS_KEY, JSON.stringify(snaps));
        await renderBackupPanel();
        toast('Backup excluído', 'warning');
      });
    },
    deleteFolderBackup(fileName) {
      confirm('Excluir arquivo?', `"${fileName}" será removido da pasta. Essa ação não pode ser desfeita.`, async () => {
        try {
          await backupsDirHandle.removeEntry(fileName);
          await renderBackupPanel();
          toast('Arquivo excluído', 'warning');
        } catch(e) {
          toast('Erro ao excluir: ' + e.message, 'error');
        }
      });
    },
    restoreSnapshot(idx) {
      const snaps = loadSnapshotList();
      const snap = snaps[idx];
      if (!snap) return;
      const d = new Date(snap.date);
      const label = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} às ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
      confirm(
        'Restaurar backup?',
        `Backup de ${label} com ${snap.txCount} transações. Os dados atuais serão substituídos.`,
        () => {
          try { importBackupData(snap.data); }
          catch(e) { toast('Erro ao restaurar: ' + e.message, 'error'); }
        }
      );
    },
    restoreFolderBackup(fileName) { restoreFolderBackup(fileName); },
    changeImportBatchAccount(batchId, newAccount) {
      if (!newAccount) return;
      const count = state.transactions.filter(t => t.batchId === batchId).length;
      const accLabel = ACCOUNT_LABELS[newAccount] || newAccount;
      confirm(
        'Trocar conta do lote?',
        `As ${count} transação(ões) desta importação serão atribuídas a "${accLabel}".`,
        () => {
          state.transactions.forEach(t => { if (t.batchId === batchId) t.account = newAccount; });
          const hist = state.importHistory.find(h => h.batchId === batchId);
          if (hist) hist.account = newAccount;
          save();
          toast(`${count} transações → ${accLabel}`, 'success');
          renderImportHistory();
          renderSection(state.currentSection);
        }
      );
    },
    deleteImport(batchId) {
      const hist = state.importHistory.find(h => h.batchId === batchId);
      const txCount = state.transactions.filter(t => t.batchId === batchId).length;
      const name = hist ? hist.name : 'importação';
      confirm(
        'Excluir importação?',
        `Isso removerá "${name}" e ${txCount} transação(ões) vinculada(s). Transações editadas manualmente serão preservadas se você desmarcar abaixo.`,
        () => {
          state.transactions = state.transactions.filter(t => t.batchId !== batchId);
          state.importHistory = state.importHistory.filter(h => h.batchId !== batchId);
          save();
          toast(`Importação excluída (${txCount} transações removidas)`, 'warning');
          renderImportHistory();
        }
      );
    },
    editCat(id) { openCatModal(id); },
    updateAsset(id) { openAssetUpdateModal(id); },
    editAsset(id)   { openAssetEditModal(id); },
    deleteAsset(id) {
      const asset = state.patrimonio.assets.find(a => a.id === id);
      if (!asset) return;
      confirm('Excluir ativo?', `"${asset.name}" e todo o histórico de valores será removido.`, () => {
        state.patrimonio.assets = state.patrimonio.assets.filter(a => a.id !== id);
        savePatrimonio();
        renderPatrimonio();
        toast('Ativo excluído', 'warning');
      });
    },
    snapshotSaldo() {
      const saldo = state.patrimonio.assets.find(a => a.id === 'pat_saldo');
      if (!saldo) return;
      const { income, expense } = totals(state.transactions);
      const today = isoToday();
      saldo.history = saldo.history.filter(h => h.date !== today);
      saldo.history.push({ date: today, value: Math.max(0, income - expense), note: 'snapshot manual' });
      saldo.history.sort((a, b) => a.date.localeCompare(b.date));
      savePatrimonio();
      renderPatrimonio();
      toast('Saldo registrado no histórico!', 'success');
    },
    deleteCat(id) {
      confirm('Excluir categoria?', 'As transações vinculadas perderão a categoria.', () => {
        state.categories = state.categories.filter(c => c.id !== id);
        save();
        toast('Categoria excluída', 'warning');
        renderCategories();
      });
    },
    setBudget(id)  { startInlineBudgetEdit(id); },
    saveBudget(id) { saveBudgetForCat(id); },
  };

  // ──────────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────────
  function renderCategories() {
    const grid = document.getElementById('catGrid');
    let cats = state.categories;
    if (state.catFilter !== 'all') cats = cats.filter(c => c.type === state.catFilter || c.type === 'both');

    if (!cats.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-tags"></i><p>Nenhuma categoria</p></div>';
      return;
    }

    const vm = state.viewMonth;
    const monthTxs = txsInMonth(vm.getFullYear(), vm.getMonth()+1);

    grid.innerHTML = cats.map(cat => {
      const spent = monthTxs.filter(t => t.category === cat.id).reduce((s,t) => s+t.amount, 0);
      const count = monthTxs.filter(t => t.category === cat.id).length;
      const typeBadge = { expense:'Despesa', income:'Receita', both:'Ambos' }[cat.type];
      const kw = cat.keywords ? cat.keywords.split(',').slice(0,3).join(', ') : '';
      return `<div class="cat-card">
        <div class="cat-card-icon" style="background:${cat.color}22;font-size:24px">${cat.icon}</div>
        <div class="cat-card-info">
          <div class="cat-card-name">${esc(cat.name)}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
            <span class="cat-type-badge ${cat.type}">${typeBadge}</span>
            ${cat.budget > 0 ? `<span style="font-size:10px;color:var(--text-muted)">orç. ${fmtBRL(cat.budget)}</span>` : ''}
          </div>
          <div class="cat-card-stats" style="color:var(--text-muted)">
            ${count} transações · ${fmtBRL(spent)} este mês
          </div>
          ${kw ? `<div class="cat-card-kw">${esc(kw)}...</div>` : ''}
        </div>
        <div class="cat-card-actions">
          <button class="btn-icon edit" onclick="FC.editCat('${cat.id}')" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete" onclick="FC.deleteCat('${cat.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  function openCatModal(id) {
    state.editingCatId = id || null;
    const cat = id ? getCat(id) : null;

    document.getElementById('catModalTitle').textContent = cat ? 'Editar Categoria' : 'Nova Categoria';
    document.getElementById('catName').value    = cat ? cat.name : '';
    document.getElementById('catType').value    = cat ? cat.type : 'expense';
    document.getElementById('catBudget').value  = cat && cat.budget > 0 ? cat.budget : '';
    document.getElementById('catKeywords').value= cat ? (cat.keywords||'') : '';

    // Emoji picker
    const ep = document.getElementById('emojiPicker');
    const selIcon = cat ? cat.icon : EMOJIS[0];
    document.getElementById('catIconInput').value = selIcon;
    ep.innerHTML = EMOJIS.map(e => `<div class="emoji-opt ${e===selIcon?'selected':''}" data-emoji="${e}" onclick="selectEmoji(this,'${e}')">${e}</div>`).join('');

    // Color picker
    const cp = document.getElementById('colorPicker');
    const selColor = cat ? cat.color : PALETTE[0];
    cp.innerHTML = PALETTE.map(c => `<div class="color-opt ${c===selColor?'selected':''}" data-color="${c}" style="background:${c}" onclick="selectColor(this,'${c}')"></div>`).join('');
    cp.dataset.selected = selColor;

    showModal('catModal');
  }

  window.selectEmoji = function(el, emoji) {
    document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('catIconInput').value = emoji;
  };

  window.selectColor = function(el, color) {
    document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    el.closest('.color-picker').dataset.selected = color;
  };

  function saveCat() {
    const name    = document.getElementById('catName').value.trim();
    const type    = document.getElementById('catType').value;
    const budget  = parseFloat(document.getElementById('catBudget').value) || 0;
    const keywords= document.getElementById('catKeywords').value.trim();
    const icon    = document.getElementById('catIconInput').value || '📦';
    const color   = document.getElementById('colorPicker').dataset.selected || PALETTE[0];

    if (!name) { toast('Informe o nome da categoria', 'error'); return; }

    if (state.editingCatId) {
      const idx = state.categories.findIndex(c => c.id === state.editingCatId);
      if (idx >= 0) state.categories[idx] = { ...state.categories[idx], name, type, budget, keywords, icon, color };
      toast('Categoria atualizada', 'success');
    } else {
      state.categories.push({ id: uid(), name, type, budget, keywords, icon, color });
      toast('Categoria criada', 'success');
    }

    save();
    hideModal('catModal');
    renderCategories();
  }

  // ──────────────────────────────────────────────
  // BUDGET
  // ──────────────────────────────────────────────
  function renderBudget() {
    const budgetTxs = getBudgetTxs();
    const months = getBudgetPeriodMonths();
    // Mostra TODAS as categorias de despesa (não só as com orçamento)
    const allExpenseCats = state.categories.filter(c => c.type !== 'income');

    // Atualiza rótulo do período
    const labelEl = document.getElementById('budgetPeriodLabel');
    if (labelEl) labelEl.textContent = getBudgetPeriodLabel();

    const totalBudgeted = allExpenseCats.reduce((s,c) => s + (c.budget || 0) * months, 0);
    let totalSpent = 0;

    const grid = document.getElementById('budgetCards');
    const empty = document.getElementById('budgetEmpty');

    if (!allExpenseCats.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      document.getElementById('budgetTotal').textContent = fmtBRL(0);
      document.getElementById('budgetSpent').textContent = fmtBRL(0);
      document.getElementById('budgetAvail').textContent = fmtBRL(0);
      return;
    }

    empty.classList.add('hidden');

    // Ordenação: primeiro com orçamento (maior limite primeiro), depois sem orçamento (por gasto desc)
    const withBudget = allExpenseCats.filter(c => c.budget > 0).sort((a,b) => b.budget - a.budget);
    const withoutBudget = allExpenseCats.filter(c => !c.budget || c.budget <= 0).map(c => {
      const sp = budgetTxs.filter(t => t.category === c.id && t.type === 'expense').reduce((s,t) => s+t.amount, 0);
      return { cat: c, spent: sp };
    }).sort((a, b) => b.spent - a.spent).map(o => o.cat);
    const ordered = [...withBudget, ...withoutBudget];

    grid.innerHTML = ordered.map(cat => {
      const spent = budgetTxs.filter(t => t.category===cat.id && t.type==='expense').reduce((s,t)=>s+t.amount,0);
      totalSpent += spent;
      const hasBudget = cat.budget > 0;

      if (!hasBudget) {
        // Card sem orçamento — mostra gasto e botão para definir limite
        return `<div class="budget-card no-budget" data-cat="${cat.id}">
          <div class="bc-header">
            <span class="bc-icon">${cat.icon}</span>
            <span class="bc-name">${esc(cat.name)}</span>
            <span class="bc-pct">Sem limite</span>
          </div>
          <div class="bc-progress">
            <div class="progress-bar"><div class="progress-fill ok" style="width:0%"></div></div>
          </div>
          <div class="bc-amounts">
            <span class="spent">${fmtBRL(spent)} gastos${months > 1 ? ' no período' : ' neste mês'}</span>
            <button class="bc-set-limit" onclick="FC.setBudget('${cat.id}')"><i class="fas fa-plus"></i> Definir limite</button>
          </div>
        </div>`;
      }

      const budget = cat.budget * months;
      const pct = Math.round((spent/budget)*100);
      const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
      const barPct = Math.min(pct, 100);
      return `<div class="budget-card ${pct>=100?'over-budget':''}" data-cat="${cat.id}">
        <div class="bc-header">
          <span class="bc-icon">${cat.icon}</span>
          <span class="bc-name">${esc(cat.name)}</span>
          <span class="bc-pct ${cls}">${pct}%</span>
        </div>
        <div class="bc-progress">
          <div class="progress-bar"><div class="progress-fill ${cls}" style="width:${barPct}%"></div></div>
        </div>
        <div class="bc-amounts">
          <span class="spent">${fmtBRL(spent)} gastos</span>
          <span class="budget-limit editable" onclick="FC.setBudget('${cat.id}')" title="Clique para alterar o limite">limite ${fmtBRL(budget)}</span>
        </div>
        ${pct>=100?`<div style="font-size:11px;color:var(--expense);margin-top:8px;font-weight:700">⚠ Orçamento excedido em ${fmtBRL(spent-budget)}</div>`:''}
      </div>`;
    }).join('');

    document.getElementById('budgetTotal').textContent = fmtBRL(totalBudgeted);
    document.getElementById('budgetSpent').textContent = fmtBRL(totalSpent);
    document.getElementById('budgetAvail').textContent = fmtBRL(Math.max(0, totalBudgeted - totalSpent));
  }

  function startInlineBudgetEdit(catId) {
    const cat = getCat(catId);
    if (!cat) return;
    const card = document.querySelector(`.budget-card[data-cat="${catId}"]`);
    if (!card) return;
    const amounts = card.querySelector('.bc-amounts');
    if (!amounts) return;
    const current = cat.budget > 0 ? cat.budget : '';
    const months = getBudgetPeriodMonths();
    // Substitui a 2ª coluna por um input
    amounts.innerHTML = `
      <span class="spent">${fmtBRL(state.transactions
        .filter(t => t.category === catId && t.type === 'expense')
        .reduce((s,t) => s+t.amount, 0))} gastos (todos)</span>
      <span class="bc-inline-edit">
        <input type="number" step="0.01" min="0" placeholder="0,00" value="${current}" id="bcInlineInput_${catId}" autofocus>
        <button type="button" onclick="FC.saveBudget('${catId}')" title="Salvar"><i class="fas fa-check"></i></button>
        <button type="button" class="cancel" onclick="renderBudget()" title="Cancelar"><i class="fas fa-times"></i></button>
      </span>`;
    const inp = document.getElementById(`bcInlineInput_${catId}`);
    inp.focus();
    inp.select();
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); window.FC.saveBudget(catId); }
      if (e.key === 'Escape') { e.preventDefault(); renderBudget(); }
    });
    // Mantém o months no escopo só pra avisar (var não usada mas evita warning)
    void months;
  }

  function saveBudgetForCat(catId) {
    const inp = document.getElementById(`bcInlineInput_${catId}`);
    if (!inp) return;
    const val = parseFloat(inp.value);
    const cat = state.categories.find(c => c.id === catId);
    if (!cat) return;
    cat.budget = isNaN(val) || val < 0 ? 0 : val;
    save();
    toast(cat.budget > 0 ? `Limite de ${cat.name} definido em ${fmtBRL(cat.budget)}/mês` : `Limite de ${cat.name} removido`, 'success');
    renderBudget();
  }
  // Exporta no namespace global para os botões inline
  window.renderBudget = renderBudget;

  // ──────────────────────────────────────────────
  // REPORTS
  // ──────────────────────────────────────────────

  /* Determina a janela do relatório: data inicial, data final e nº de meses.
   * Trata os 5 períodos do dashboard: month / 3m / 6m / 12m / custom. */
  function getReportWindow() {
    if (state.reportPeriod === 'custom') {
      const from = state.reportCustomFrom;
      const to   = state.reportCustomTo;
      if (from && to) {
        const fd = new Date(from + 'T00:00:00');
        const td = new Date(to   + 'T00:00:00');
        const start = new Date(fd.getFullYear(), fd.getMonth(), 1);
        const end   = new Date(td.getFullYear(), td.getMonth(), 1);
        const months = (end.getFullYear()-start.getFullYear())*12 + (end.getMonth()-start.getMonth()) + 1;
        return { start, end, months: Math.max(1, months) };
      }
      // sem range definido → cai pro mês atual
      const vm = state.viewMonth;
      const start = new Date(vm.getFullYear(), vm.getMonth(), 1);
      return { start, end: start, months: 1 };
    }
    const cfg = PERIOD_CONFIG[state.reportPeriod] || PERIOD_CONFIG['6m'];
    const n = cfg.months;
    const vm = state.viewMonth;
    const end   = new Date(vm.getFullYear(), vm.getMonth(), 1);
    const start = new Date(vm.getFullYear(), vm.getMonth() - n + 1, 1);
    return { start, end, months: n };
  }

  function getReportPeriodLabel() {
    if (state.reportPeriod === 'custom') {
      const from = state.reportCustomFrom;
      const to   = state.reportCustomTo;
      if (from && to)   return `${fmtDate(from)} até ${fmtDate(to)}`;
      if (from)         return `A partir de ${fmtDate(from)}`;
      if (to)           return `Até ${fmtDate(to)}`;
      return 'Todo o período';
    }
    const cfg = PERIOD_CONFIG[state.reportPeriod] || PERIOD_CONFIG['6m'];
    return cfg.label();
  }

  function renderReports() {
    const win = getReportWindow();
    const n = win.months;
    const labels = [], incData = [], expData = [], balData = [];
    let runBal = 0;

    // Atualiza label do período
    const labelEl = document.getElementById('reportPeriodLabel');
    if (labelEl) labelEl.textContent = getReportPeriodLabel();

    // Saldo acumulado antes do início da janela
    const windowStartISO = win.start.toISOString().slice(0,7);
    state.transactions.forEach(t => {
      if (t.date < windowStartISO) {
        runBal += t.type === 'income' ? t.amount : -t.amount;
      }
    });

    // Itera mês a mês da janela (do início até o fim)
    for (let i = 0; i < n; i++) {
      const d = new Date(win.start.getFullYear(), win.start.getMonth() + i, 1);
      labels.push(`${MONTHS_PT[d.getMonth()].slice(0,3)}${n > 12 ? '/' + String(d.getFullYear()).slice(2) : ''}`);
      const txs = txsInMonth(d.getFullYear(), d.getMonth()+1);
      const t = totals(txs);
      incData.push(t.income);
      expData.push(t.expense);
      runBal += t.net;
      balData.push(runBal);
    }

    // Chart 1: Income vs Expense bar
    destroyChart('rptIncExp');
    destroyChart('rptPayment');
    const c1 = document.getElementById('rptIncExpChart');
    if (c1) state.charts.rptIncExp = new Chart(c1, {
      type: 'bar',
      data: { labels, datasets: [
        { label:'Receitas', data:incData, backgroundColor:'rgba(0,212,163,0.7)', borderRadius:4 },
        { label:'Despesas', data:expData, backgroundColor:'rgba(255,71,87,0.7)',  borderRadius:4 },
      ]},
      options: {
        ...chartDefaults,
        plugins: { ...chartDefaults.plugins, legend: { display:true, labels:{ color:'#8888AA', boxWidth:12 } },
          tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmtBRL(ctx.raw)}` } }
        },
        scales: {
          x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#55556A'} },
          y: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#55556A', callback:v=>'R$'+v.toLocaleString('pt-BR')} }
        }
      }
    });

    // Chart 2: Distribution donut — agora considera toda a janela do período
    destroyChart('rptDist');
    const c2 = document.getElementById('rptDistChart');
    const expTxs = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(win.start.getFullYear(), win.start.getMonth() + i, 1);
      expTxs.push(...txsInMonth(d.getFullYear(), d.getMonth()+1).filter(t => t.type === 'expense'));
    }
    const catMap = {};
    expTxs.forEach(t => { const k=t.category||'outros_exp'; catMap[k]=(catMap[k]||0)+t.amount; });
    const sorted2 = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
    if (c2) state.charts.rptDist = new Chart(c2, {
      type: 'doughnut',
      data: { labels: sorted2.map(([k])=>{const c=getCat(k);return c?c.name:'Outros';}),
        datasets:[{ data:sorted2.map(([,v])=>v), backgroundColor:sorted2.map(([k])=>{const c=getCat(k);return c?c.color:'#868E96';}), borderColor:'transparent' }]
      },
      options: { ...chartDefaults, cutout:'65%', plugins: { ...chartDefaults.plugins,
        tooltip:{ ...chartDefaults.plugins.tooltip, callbacks:{ label:ctx=>` ${ctx.label}: ${fmtBRL(ctx.raw)}` }}
      }}
    });

    // Chart 3: Balance evolution
    destroyChart('rptBalance');
    const c3 = document.getElementById('rptBalanceChart');
    if (c3) state.charts.rptBalance = new Chart(c3, {
      type: 'line',
      data: { labels, datasets:[{ label:'Saldo', data:balData, borderColor:'#FF6B2B',
        backgroundColor:'rgba(255,107,43,0.08)', fill:true, tension:0.4, borderWidth:2,
        pointBackgroundColor:'#FF6B2B', pointRadius:3 }]
      },
      options: { ...chartDefaults,
        plugins:{ ...chartDefaults.plugins, tooltip:{ ...chartDefaults.plugins.tooltip, callbacks:{ label:ctx=>` Saldo: ${fmtBRL(ctx.raw)}` }}},
        scales:{ x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55556A'}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55556A',callback:v=>'R$'+v.toLocaleString('pt-BR')}} }
      }
    });

    // Chart 4: Top categories trend
    destroyChart('rptCatTrend');
    const c4 = document.getElementById('rptCatTrendChart');
    const topCats = Object.entries(
      state.transactions.filter(t=>t.type==='expense').reduce((acc,t)=>{ const k=t.category||'outros_exp'; acc[k]=(acc[k]||0)+t.amount; return acc; },{})
    ).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k);

    const datasets = topCats.map(catId => {
      const cat = getCat(catId);
      const vals = [];
      // Itera mês a mês da janela definida pelo período
      for (let i = 0; i < n; i++) {
        const d = new Date(win.start.getFullYear(), win.start.getMonth() + i, 1);
        vals.push(txsInMonth(d.getFullYear(),d.getMonth()+1).filter(t=>t.category===catId&&t.type==='expense').reduce((s,t)=>s+t.amount,0));
      }
      return { label:cat?cat.name:catId, data:vals, borderColor:cat?cat.color:'#868E96', backgroundColor:'transparent', tension:0.4, borderWidth:2, pointRadius:3 };
    });

    if (c4) state.charts.rptCatTrend = new Chart(c4, {
      type:'line', data:{ labels, datasets },
      options:{ ...chartDefaults, plugins:{ ...chartDefaults.plugins, legend:{display:true,labels:{color:'#8888AA',boxWidth:12}},
        tooltip:{ ...chartDefaults.plugins.tooltip, callbacks:{label:ctx=>` ${ctx.dataset.label}: ${fmtBRL(ctx.raw)}`}}},
        scales:{ x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55556A'}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55556A',callback:v=>'R$'+v.toLocaleString('pt-BR')}} }
      }
    });

    // Chart 5: Débito vs Crédito — todas as despesas da janela
    destroyChart('rptPayment');
    const allExpTxs = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(win.start.getFullYear(), win.start.getMonth() + i, 1);
      allExpTxs.push(...txsInMonth(d.getFullYear(), d.getMonth()+1).filter(t => t.type === 'expense'));
    }

    // Agrupa por conta (account key)
    const accMap = {};
    allExpTxs.forEach(t => {
      const k = t.account || 'outro';
      accMap[k] = (accMap[k] || 0) + t.amount;
    });

    const totalDebit  = Object.entries(accMap).filter(([k]) => k !== 'cartao').reduce((s,[,v]) => s+v, 0);
    const totalCredit = accMap['cartao'] || 0;
    const totalPay    = totalDebit + totalCredit;

    // Atualiza os cards de stats
    const debitAmtEl  = document.getElementById('rptDebitAmt');
    const creditAmtEl = document.getElementById('rptCreditAmt');
    const debitPctEl  = document.getElementById('rptDebitPct');
    const creditPctEl = document.getElementById('rptCreditPct');
    if (debitAmtEl)  debitAmtEl.textContent  = fmtBRL(totalDebit);
    if (creditAmtEl) creditAmtEl.textContent = fmtBRL(totalCredit);
    if (debitPctEl)  debitPctEl.textContent  = totalPay > 0 ? `${(totalDebit/totalPay*100).toFixed(1)}% do total` : '—';
    if (creditPctEl) creditPctEl.textContent = totalPay > 0 ? `${(totalCredit/totalPay*100).toFixed(1)}% do total` : '—';

    // Donut: Débito vs Crédito
    const c5 = document.getElementById('rptPaymentChart');
    if (c5 && totalPay > 0) {
      state.charts.rptPayment = new Chart(c5, {
        type: 'doughnut',
        data: { labels:['Débito / Espécie','Cartão de Crédito'], datasets:[{
          data:[totalDebit, totalCredit],
          backgroundColor:['#00D4A3','#FF6500'],
          borderColor:'transparent', borderWidth:0, hoverOffset:5
        }]},
        options:{ ...chartDefaults, cutout:'68%', plugins:{ ...chartDefaults.plugins,
          legend:{display:false},
          tooltip:{ ...chartDefaults.plugins.tooltip, callbacks:{ label:ctx=>` ${ctx.label}: ${fmtBRL(ctx.raw)}` }}
        }}
      });
    }

    // Breakdown por conta (barra lateral)
    const ACCOUNT_COLORS = { corrente:'#00D4A3', poupanca:'#00A8E8', dinheiro:'#FFD43B', investimento:'#845EF7', outro:'#868E96', cartao:'#FF6500' };
    const breakdownEl = document.getElementById('rptPayBreakdown');
    if (breakdownEl) {
      const sorted = Object.entries(accMap).sort((a,b)=>b[1]-a[1]);
      breakdownEl.innerHTML = sorted.map(([k,v]) => {
        const label = ACCOUNT_LABELS[k] || k;
        const color = ACCOUNT_COLORS[k] || '#868E96';
        const pct   = totalPay > 0 ? (v/totalPay*100).toFixed(1) : '0.0';
        return `<div class="rpt-pay-bk-row">
          <span class="rpt-pay-bk-dot" style="background:${color}"></span>
          <span class="rpt-pay-bk-label">${label}</span>
          <span class="rpt-pay-bk-val">${fmtBRL(v)}</span>
          <span class="rpt-pay-bk-pct">${pct}%</span>
        </div>`;
      }).join('');
    }
  }

  // ──────────────────────────────────────────────
  // FATURAS
  // ──────────────────────────────────────────────
  function renderFaturas() {
    const [year, month] = state.faturaMonth.split('-').map(Number);

    // Transações do cartão de crédito no mês selecionado
    const txs = txsInMonth(year, month)
      .filter(t => t.account === 'cartao' && t.type === 'expense')
      .sort((a, b) => b.date.localeCompare(a.date));

    const total = txs.reduce((s, t) => s + t.amount, 0);

    // ── Rótulo do mês ──
    const d = new Date(year, month - 1, 1);
    const labelEl = document.getElementById('fatMonthLabel');
    if (labelEl) labelEl.textContent = `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;

    // ── Badge status: Aberta = mês atual ou futuro, Fechada = mês passado ──
    const now   = new Date();
    const isPast = d < new Date(now.getFullYear(), now.getMonth(), 1);
    const badge  = document.getElementById('fatStatusBadge');
    if (badge) {
      badge.textContent  = isPast ? 'Fechada' : 'Aberta';
      badge.className    = `fat-status-badge ${isPast ? 'closed' : 'open'}`;
    }

    // ── Botão "próximo" desabilitado quando já estamos no mês atual ou além ──
    const nextBtn = document.getElementById('fatNextBtn');
    const curYM   = now.toISOString().slice(0, 7);
    if (nextBtn) nextBtn.disabled = state.faturaMonth >= curYM;

    // ── Cards de resumo ──
    const catMap  = {};
    const descMap = {};
    txs.forEach(t => {
      const k = t.category || '__sem_cat';
      catMap[k]  = (catMap[k]  || 0) + t.amount;
      descMap[t.description] = (descMap[t.description] || 0) + t.amount;
    });

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('fatTotal',  fmtBRL(total));
    setText('fatCount',  txs.length);

    const topCatEntry  = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    const topDescEntry = Object.entries(descMap).sort((a, b) => b[1] - a[1])[0];
    const topCat = topCatEntry ? getCat(topCatEntry[0]) : null;
    setText('fatTopCat',  topCat ? topCat.name : '—');
    setText('fatTopDesc', topDescEntry ? topDescEntry[0] : '—');

    // ── Visibilidade: empty state vs. conteúdo ──
    const emptyEl   = document.getElementById('fatEmptyState');
    const chartsRow = document.getElementById('fatChartsRow');
    const summaryEl = document.getElementById('fatSummaryGrid');
    if (txs.length === 0) {
      if (emptyEl)   emptyEl.classList.remove('hidden');
      if (chartsRow) chartsRow.classList.add('hidden');
      if (summaryEl) summaryEl.style.opacity = '0.35';
    } else {
      if (emptyEl)   emptyEl.classList.add('hidden');
      if (chartsRow) chartsRow.classList.remove('hidden');
      if (summaryEl) summaryEl.style.opacity = '1';
    }

    // ── Badge de contagem ──
    const countBadge = document.getElementById('fatTxCountBadge');
    if (countBadge) countBadge.textContent = txs.length ? `${txs.length} lançamento${txs.length > 1 ? 's' : ''}` : '';

    // ── Gráfico de donut por categoria ──
    destroyChart('fatCat');
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const catLabels  = sortedCats.map(([k]) => { const c = getCat(k); return c ? c.name : 'Sem categoria'; });
    const catData    = sortedCats.map(([, v]) => v);
    const catColors  = sortedCats.map(([k]) => { const c = getCat(k); return c ? c.color : '#555'; });

    const c = document.getElementById('fatCatChart');
    if (c && txs.length > 0) {
      state.charts.fatCat = new Chart(c, {
        type: 'doughnut',
        data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors, borderColor: 'transparent', borderWidth: 0, hoverOffset: 5 }] },
        options: {
          ...chartDefaults, cutout: '65%',
          plugins: { ...chartDefaults.plugins,
            tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.label}: ${fmtBRL(ctx.raw)}` } }
          }
        }
      });
    }

    // ── Legenda de categorias ──
    const legendEl = document.getElementById('fatCatLegend');
    if (legendEl) {
      legendEl.innerHTML = sortedCats.map(([k, v]) => {
        const cat   = getCat(k);
        const name  = cat ? cat.name : 'Sem categoria';
        const color = cat ? cat.color : '#555';
        const pct   = total > 0 ? (v / total * 100).toFixed(1) : '0.0';
        return `<div class="fat-legend-item">
          <span class="fat-legend-dot" style="background:${color}"></span>
          <span class="fat-legend-name">${esc(name)}</span>
          <span class="fat-legend-pct">${pct}%</span>
          <span class="fat-legend-val">${fmtBRL(v)}</span>
        </div>`;
      }).join('');
    }

    // ── Lista de transações ──
    const listEl = document.getElementById('fatTxList');
    if (listEl) {
      listEl.innerHTML = txs.length === 0 ? '' : txs.map(t => {
        const cat     = getCat(t.category);
        const catName = cat ? cat.name : '—';
        const color   = cat ? cat.color : '#555';
        const dateStr = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
        return `<div class="fat-tx-item">
          <span class="fat-tx-date">${dateStr}</span>
          <div class="fat-tx-info">
            <div class="fat-tx-desc">${esc(t.description)}</div>
            <div class="fat-tx-cat" style="color:${color}">${esc(catName)}</div>
          </div>
          <span class="fat-tx-amount">${fmtBRL(t.amount)}</span>
        </div>`;
      }).join('');
    }

    // Sempre renderiza o comparativo ao entrar na aba
    renderFatCompare();
  }

  // ──────────────────────────────────────────────
  // COMPARATIVO MENSAL (Faturas)
  // ──────────────────────────────────────────────
  function renderFatCompare() {
    const tableEl = document.getElementById('fatCompareTable');
    if (!tableEl) return;

    const period  = parseInt(document.getElementById('fatComparePeriod')?.value  || '6');
    const accFilt = document.getElementById('fatCompareAccount')?.value || 'cartao';

    // Monta array dos últimos N meses (mais antigo → mais recente)
    const now    = new Date();
    const months = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: `${MONTHS_PT[d.getMonth()].slice(0,3)}/${String(d.getFullYear()).slice(2)}`,
      });
    }

    // Constrói matriz catId → [valorMes0, valorMes1, ...]
    const matrix = {};
    months.forEach((m, mi) => {
      txsInMonth(m.year, m.month)
        .filter(t => t.type === 'expense' && (accFilt === 'all' || t.account === accFilt))
        .forEach(t => {
          const k = t.category || '__outros';
          if (!matrix[k]) matrix[k] = months.map(() => 0);
          matrix[k][mi] += t.amount;
        });
    });

    // Remove categorias sem nenhum gasto
    const rows = Object.entries(matrix).filter(([, v]) => v.some(x => x > 0));
    if (!rows.length) {
      const label = accFilt === 'cartao' ? 'cartão de crédito' : 'nenhuma conta';
      tableEl.innerHTML = `<div class="fat-compare-empty">Sem gastos registrados no ${label} nos últimos ${period} meses.</div>`;
      return;
    }

    // Ordena por total desc
    rows.sort((a, b) => b[1].reduce((s, v) => s + v, 0) - a[1].reduce((s, v) => s + v, 0));

    // Total por coluna e geral
    const colTotals = months.map((_, mi) => rows.reduce((s, [, v]) => s + v[mi], 0));
    const grandTotal = colTotals.reduce((s, v) => s + v, 0);

    // Valor máximo de célula (para escala de calor)
    const maxCell = Math.max(...rows.flatMap(([, v]) => v), 1);

    // ── Renderiza tabela ──
    tableEl.innerHTML = `
      <div class="fat-cmp-scroll">
        <table class="fat-cmp-tbl">
          <thead>
            <tr>
              <th class="fat-cmp-cat-col">Categoria</th>
              ${months.map(m => `<th class="fat-cmp-mon-col">${m.label}</th>`).join('')}
              <th class="fat-cmp-total-col">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(([k, vals]) => {
              const cat   = getCat(k);
              const name  = cat ? cat.name  : 'Sem categoria';
              const color = cat ? cat.color : '#868E96';
              const rowTotal = vals.reduce((s, v) => s + v, 0);
              return `<tr>
                <td class="fat-cmp-cat-cell">
                  <span class="fat-cmp-dot" style="background:${color}"></span>
                  <span>${esc(name)}</span>
                </td>
                ${vals.map(v => {
                  const heat = v > 0 ? (0.08 + (v / maxCell) * 0.42).toFixed(2) : 0;
                  const bg   = v > 0 ? `rgba(255,101,0,${heat})` : '';
                  const cls  = v > 0 ? 'fat-cmp-cell has-val' : 'fat-cmp-cell empty';
                  return `<td class="${cls}" style="${bg ? `background:${bg}` : ''}">
                    ${v > 0 ? fmtBRL(v) : '<span class="fat-cmp-dash">—</span>'}
                  </td>`;
                }).join('')}
                <td class="fat-cmp-row-total">${fmtBRL(rowTotal)}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="fat-cmp-foot">
              <td>Total</td>
              ${colTotals.map(v => `<td>${fmtBRL(v)}</td>`).join('')}
              <td>${fmtBRL(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }

  // ──────────────────────────────────────────────
  // IMPORT
  // ──────────────────────────────────────────────
  function renderImportHistory() {
    const el = document.getElementById('importHistory');
    if (!state.importHistory.length) {
      el.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>Nenhuma importação realizada</p></div>';
      return;
    }
    el.innerHTML = state.importHistory.slice().reverse().map(h => {
      const remaining = h.batchId
        ? state.transactions.filter(t => t.batchId === h.batchId).length
        : null;
      const countLabel = remaining !== null
        ? `${remaining} de ${h.count} transações ativas`
        : `${h.count} transações importadas`;
      const canDelete = h.batchId;
      const accKey    = h.account || 'corrente';
      const accLabel  = ACCOUNT_LABELS[accKey] || accKey;
      const accIcon   = accKey === 'cartao' ? 'fa-credit-card' : 'fa-building-columns';
      return `<div class="history-item">
        <i class="fas fa-file-alt"></i>
        <div class="h-info">
          <span class="h-name">${esc(h.name)}</span>
          <span class="h-meta">${countLabel} · ${fmtDate(h.date)}</span>
        </div>
        <span class="h-acc-chip" title="Conta de origem">
          <i class="fas ${accIcon}"></i> ${accLabel}
        </span>
        ${canDelete ? `
        <select class="h-acc-change" onchange="FC.changeImportBatchAccount('${h.batchId}', this.value)" title="Trocar conta de todo o lote">
          <option value="">Trocar conta…</option>
          <option value="corrente">Conta Corrente</option>
          <option value="cartao">Cartão de Crédito</option>
          <option value="poupanca">Poupança</option>
          <option value="dinheiro">Dinheiro / Espécie</option>
          <option value="investimento">Investimento</option>
          <option value="outro">Outro</option>
        </select>
        <button class="btn-icon delete" onclick="FC.deleteImport('${h.batchId}')" title="Excluir esta importação e suas transações"><i class="fas fa-trash"></i></button>` : ''}
      </div>`;
    }).join('');
  }

  function handleSingleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    document.getElementById('importFileName').textContent = file.name;

    if (ext === 'csv') parseCSV(file);
    else if (['xlsx','xls'].includes(ext)) parseXLSX(file);
    else if (['ofx','qfx'].includes(ext)) parseOFX(file);
    else {
      toast('Formato não suportado: ' + file.name, 'error');
      if (state.importQueue.length && state.importQueueIdx < state.importQueue.length) {
        state.importQueue[state.importQueueIdx].status = 'error';
        state.importQueueIdx++;
        renderImportQueue();
        processNextInQueue();
      }
    }
  }

  function handleFileSelect(files) {
    const fileArr = Array.from(files instanceof FileList ? files : [files]);
    if (!fileArr.length) return;
    if (fileArr.length === 1) {
      state.importQueue = [];
      state.importQueueIdx = 0;
      renderImportQueue();
      handleSingleFile(fileArr[0]);
      return;
    }
    // Multiple files: build queue and process sequentially
    state.importQueue = fileArr.map(f => ({ file: f, name: f.name, status: 'pending', added: 0 }));
    state.importQueueIdx = 0;
    renderImportQueue();
    document.getElementById('dropzone').classList.add('hidden');
    processNextInQueue();
  }

  function parseCSV(file) {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete(results) {
        if (!results.data.length) { toast('Arquivo CSV vazio ou inválido', 'error'); return; }
        showImportPreview(results.data);
      },
      error(e) { toast('Erro ao ler CSV: ' + e.message, 'error'); }
    });
  }

  function parseXLSX(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type:'array', cellDates:true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header:1, raw:false, dateNF:'yyyy-mm-dd' });
        if (!data.length) { toast('Planilha vazia', 'error'); return; }
        showImportPreview(data);
      } catch(err) { toast('Erro ao ler XLSX: ' + err.message, 'error'); }
    };
    reader.readAsArrayBuffer(file);
  }

  function parseOFX(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result;
      const rows = [['Data','Valor','Descrição','ID']];
      const txRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
      let m;
      while ((m = txRegex.exec(content)) !== null) {
        const block = m[1];
        const get = tag => { const r = new RegExp(`<${tag}>([^<\n\r]+)`, 'i'); const mm = r.exec(block); return mm ? mm[1].trim() : ''; };
        const dtRaw = get('DTPOSTED').replace(/^(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
        rows.push([dtRaw, get('TRNAMT'), get('MEMO')||get('NAME'), get('FITID')]);
      }
      if (rows.length <= 1) { toast('Nenhuma transação encontrada no OFX', 'error'); return; }
      showImportPreview(rows);
    };
    reader.readAsText(file, 'latin1');
  }

  function showImportPreview(data) {
    state.importRawData = data;
    const headers = data[0].map(String);
    state.importHeaders = headers;

    document.getElementById('importRowCount').textContent = `${data.length - 1} linhas detectadas`;
    document.getElementById('importPreview').classList.remove('hidden');
    document.getElementById('dropzone').classList.add('hidden');

    // Column mapping
    const fields = [
      { key:'date',        label:'Data *' },
      { key:'description', label:'Descrição *' },
      { key:'amount',      label:'Valor *' },
      { key:'type',        label:'Tipo (Débito/Crédito)' },
      { key:'notes',       label:'Observações' },
    ];

    const grid = document.getElementById('mappingGrid');
    grid.innerHTML = fields.map(f => {
      const guessed = guessColumn(headers, f.key);
      return `<div class="mapping-field">
        <label>${f.label}</label>
        <select id="map_${f.key}">
          <option value="">— não mapear —</option>
          ${headers.map((h,i) => `<option value="${i}" ${i===guessed?'selected':''}>${esc(h)}</option>`).join('')}
        </select>
      </div>`;
    }).join('');

    // Preview table
    const preview = data.slice(1, 6);
    const pt = document.getElementById('previewTable');
    pt.innerHTML = `<div class="preview-table"><table>
      <tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>
      ${preview.map(row=>`<tr>${headers.map((_,i)=>`<td>${esc(row[i]||'')}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
    document.getElementById('previewCount').textContent = `(${data.length-1} linhas)`;
  }

  function guessColumn(headers, field) {
    // 1. Check learned column names first (exact normalized match)
    for (let i = 0; i < headers.length; i++) {
      if (state.columnLearnings[normalizeColName(headers[i])] === field) return i;
    }
    // 2. Fall back to hardcoded keyword matching
    const maps = {
      date:        ['data','date','dt','dia','competência','vencimento','lancamento','lançamento','data mov','data lançamento','data transação'],
      description: ['descrição','descricao','description','memo','histórico','historico','detail','nome','estabelecimento','beneficiário','fornecedor'],
      amount:      ['valor','value','amount','quantia','montante','vlr','vl','total','debit','credit','débito','crédito','val.','vl.'],
      type:        ['tipo','type','natureza','dc','d/c','débito/crédito','lançamento'],
      notes:       ['observação','observacão','observacao','obs','notas','notes','complemento','referência','numero doc','n. doc'],
    };
    const kws = maps[field] || [];
    const idx = headers.findIndex(h => kws.some(k => h.toLowerCase().includes(k)));
    return idx >= 0 ? idx : -1;
  }

  function confirmImport() {
    const data = state.importRawData;
    if (!data) return;

    const getMapIdx = key => { const el = document.getElementById(`map_${key}`); if (!el) return -1; const v = el.value; return v !== '' ? parseInt(v) : -1; };
    const iDate  = getMapIdx('date');
    const iDesc  = getMapIdx('description');
    const iAmt   = getMapIdx('amount');
    const iType  = getMapIdx('type');
    const iNotes = getMapIdx('notes');

    if (iDate < 0 || iDesc < 0 || iAmt < 0) {
      toast('Mapeie pelo menos Data, Descrição e Valor', 'error');
      return;
    }

    // Learn column name → field mappings for future imports
    const learnMap = { date: iDate, description: iDesc, amount: iAmt, type: iType, notes: iNotes };
    Object.entries(learnMap).forEach(([field, colIdx]) => {
      if (colIdx >= 0 && state.importHeaders[colIdx]) {
        const norm = normalizeColName(state.importHeaders[colIdx]);
        if (norm) state.columnLearnings[norm] = field;
      }
    });

    const skipDup   = document.getElementById('optSkipDup').checked;
    const autoC     = document.getElementById('optAutoCateg').checked;
    const invertSign= document.getElementById('optInvertSign').checked;
    const existingIds = new Set(state.transactions.map(t => t.description + t.date + t.amount));
    const batchId = uid();

    let added = 0, skipped = 0;

    data.slice(1).forEach(row => {
      const rawDate  = String(row[iDate]||'').trim();
      const rawDesc  = String(row[iDesc]||'').trim();
      const rawAmt   = String(row[iAmt]||'').replace(/[^\d,.\-]/g,'').replace(',','.').trim();

      if (!rawDate || !rawDesc || !rawAmt) return;

      const dateIso = parseDate(rawDate);
      if (!dateIso) return;

      let amt = parseFloat(rawAmt);
      if (isNaN(amt)) return;
      if (invertSign) amt = -amt;

      let txType = 'expense';
      if (iType >= 0) {
        const t = String(row[iType]||'').toLowerCase();
        if (t.includes('c') || t.includes('cred') || t.includes('entrada') || t.includes('receita')) txType = 'income';
      } else {
        txType = amt >= 0 ? 'income' : 'expense';
      }

      amt = Math.abs(amt);
      const key = rawDesc + dateIso + amt;
      if (skipDup && existingIds.has(key)) { skipped++; return; }

      const catId = autoC ? autoCateg(rawDesc) : '';
      const rawNotes = iNotes >= 0 ? String(row[iNotes]||'').trim() : '';
      const importAcc = document.getElementById('importAccount')?.value || 'corrente';
      state.transactions.push({ id:uid(), batchId, type:txType, description:rawDesc, amount:amt, date:dateIso, category:catId, account:importAcc, notes:rawNotes });
      existingIds.add(key);
      added++;
    });

    const fname      = document.getElementById('importFileName').textContent;
    const importAcc2 = document.getElementById('importAccount')?.value || 'corrente';
    state.importHistory.push({ name:fname, count:added, date:isoToday(), batchId, account: importAcc2 });
    save();

    if (state.importQueue.length) {
      // Queue mode: track result, advance to next file
      state.importQueue[state.importQueueIdx].status = 'done';
      state.importQueue[state.importQueueIdx].added = added;
      state.importQueueIdx++;
      const skipMsg = skipped > 0 ? `, ${skipped} ignoradas` : '';
      toast(`+${added} de "${fname}"${skipMsg}`, 'success');
      resetPreviewState();
      renderImportQueue();
      processNextInQueue();
    } else {
      toast(`${added} transações importadas${skipped>0?`, ${skipped} ignoradas (duplicadas)`:''}.`, 'success');
      resetPreviewState();
      document.getElementById('dropzone').classList.remove('hidden');
      renderImportHistory();
      if (added > 0) goTo('transactions');
    }
  }

  function parseDate(raw) {
    raw = raw.trim();
    // dd/mm/yyyy or dd-mm-yyyy
    let m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    // yyyy-mm-dd
    m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    // yyyy/mm/dd
    m = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    // mm/dd/yyyy
    m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    // yyyymmdd
    m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    return null;
  }

  function resetPreviewState() {
    state.importRawData = null;
    state.importHeaders = [];
    document.getElementById('importPreview').classList.add('hidden');
    document.getElementById('fileInput').value = '';
  }

  function cancelImport() {
    resetPreviewState();
    if (state.importQueue.length && state.importQueueIdx < state.importQueue.length) {
      // Queue mode: skip current file
      state.importQueue[state.importQueueIdx].status = 'error';
      state.importQueueIdx++;
      renderImportQueue();
      processNextInQueue();
    } else {
      state.importQueue = [];
      state.importQueueIdx = 0;
      renderImportQueue();
      document.getElementById('dropzone').classList.remove('hidden');
    }
  }

  function cancelEntireQueue() {
    resetPreviewState();
    state.importQueue = [];
    state.importQueueIdx = 0;
    renderImportQueue();
    document.getElementById('dropzone').classList.remove('hidden');
    const cancelBtn = document.getElementById('cancelImportBtn');
    if (cancelBtn) cancelBtn.textContent = 'Cancelar';
  }

  function processNextInQueue() {
    const q = state.importQueue;
    if (state.importQueueIdx >= q.length) {
      // All files processed
      const totalAdded = q.reduce((s, f) => s + (f.added || 0), 0);
      const doneCount = q.filter(f => f.status === 'done').length;
      const errCount  = q.filter(f => f.status === 'error').length;
      renderImportHistory();
      let msg = `Lote concluído: ${totalAdded} transações de ${doneCount} arquivo(s)`;
      if (errCount > 0) msg += `, ${errCount} não importado(s)`;
      toast(totalAdded > 0 ? msg + '.' : 'Nenhuma transação importada.', totalAdded > 0 ? 'success' : 'warning');
      state.importQueue = [];
      state.importQueueIdx = 0;
      renderImportQueue();
      document.getElementById('dropzone').classList.remove('hidden');
      const cancelBtn = document.getElementById('cancelImportBtn');
      if (cancelBtn) cancelBtn.textContent = 'Cancelar';
      if (totalAdded > 0) goTo('transactions');
      return;
    }
    const item = q[state.importQueueIdx];
    item.status = 'processing';
    renderImportQueue();
    document.getElementById('dropzone').classList.add('hidden');
    document.getElementById('importPreview').classList.add('hidden');
    const cancelBtn = document.getElementById('cancelImportBtn');
    if (cancelBtn) cancelBtn.innerHTML = '<i class="fas fa-forward-step"></i> Pular Arquivo';
    handleSingleFile(item.file);
  }

  function renderImportQueue() {
    const panel = document.getElementById('importQueuePanel');
    if (!panel) return;
    const q = state.importQueue;
    if (!q.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    const done   = q.filter(f => f.status === 'done').length;
    const errors = q.filter(f => f.status === 'error').length;
    const iconMap = {
      pending:    '<i class="fas fa-clock"></i>',
      processing: '<i class="fas fa-spinner fa-spin"></i>',
      done:       '<i class="fas fa-check-circle"></i>',
      error:      '<i class="fas fa-times-circle"></i>',
    };

    panel.innerHTML = `
      <div class="queue-header">
        <div class="queue-header-left">
          <i class="fas fa-layer-group"></i>
          <span>Importação em lote — <strong>${done}/${q.length}</strong> concluído(s)</span>
          ${errors > 0 ? `<span class="queue-errors-badge">${errors} erro(s)</span>` : ''}
        </div>
        <button class="btn-icon delete" id="cancelQueueBtn" title="Cancelar lote"><i class="fas fa-times"></i></button>
      </div>
      <div class="queue-list">
        ${q.map((item, i) => `
          <div class="queue-item queue-${item.status}${i === state.importQueueIdx ? ' queue-current' : ''}">
            <span class="queue-item-icon">${iconMap[item.status]}</span>
            <span class="queue-item-name">${esc(item.name)}</span>
            ${item.status === 'done'  ? `<span class="queue-item-count">+${item.added}</span>` : ''}
            ${item.status === 'error' ? `<span class="queue-item-count error">erro</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('cancelQueueBtn')?.addEventListener('click', cancelEntireQueue);
  }

  // ──────────────────────────────────────────────
  // INDEXED DB (directory handle persistence)
  // ──────────────────────────────────────────────
  function openIDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('fluxocaixa_idb', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('handles');
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbSet(key, val) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(val, key);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  }
  async function idbGet(key) {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => rej(req.error);
    });
  }

  async function initBackupsDirHandle() {
    try {
      const handle = await idbGet('backupsDir');
      if (!handle) return;
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') { backupsDirHandle = handle; return; }
      const req = await handle.requestPermission({ mode: 'readwrite' });
      if (req === 'granted') backupsDirHandle = handle;
    } catch(e) {}
  }

  async function connectBackupsFolder() {
    if (!window.showDirectoryPicker) {
      toast('Navegador não suporta acesso a pastas. Use Chrome ou Edge.', 'error'); return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await idbSet('backupsDir', handle);
      backupsDirHandle = handle;
      await renderBackupPanel();
      toast(`Pasta "${handle.name}" conectada!`, 'success');
    } catch(e) {
      if (e.name !== 'AbortError') toast('Erro ao conectar pasta', 'error');
    }
  }

  async function listFolderBackups() {
    if (!backupsDirHandle) return [];
    const files = [];
    try {
      for await (const [name, handle] of backupsDirHandle.entries()) {
        if (handle.kind === 'file' && name.endsWith('.json')) {
          const file = await handle.getFile();
          files.push({ name, lastModified: file.lastModified });
        }
      }
      files.sort((a, b) => b.lastModified - a.lastModified);
    } catch(e) {}
    return files;
  }

  async function restoreFolderBackup(fileName) {
    if (!backupsDirHandle) return;
    try {
      const fh = await backupsDirHandle.getFileHandle(fileName);
      const file = await fh.getFile();
      const backup = JSON.parse(await file.text());
      const txCount = (backup.transactions || []).length;
      const catCount = (backup.categories || []).length;
      confirm(
        'Restaurar backup?',
        `"${fileName}" · ${txCount} transações, ${catCount} categorias. Os dados atuais serão substituídos.`,
        () => { try { importBackupData(backup); } catch(e) { toast('Erro: ' + e.message, 'error'); } }
      );
    } catch(e) {
      toast('Erro ao ler backup: ' + e.message, 'error');
    }
  }

  // ──────────────────────────────────────────────
  // BACKUP JSON
  // ──────────────────────────────────────────────
  function loadSnapshotList() {
    try { return JSON.parse(localStorage.getItem(BACKUP_SNAPSHOTS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveSnapshot(backupData) {
    const snap = {
      id: uid(),
      date: new Date().toISOString(),
      txCount: state.transactions.length,
      catCount: state.categories.length,
      data: backupData,
    };
    let snaps = loadSnapshotList();
    snaps.unshift(snap);
    if (snaps.length > 5) snaps = snaps.slice(0, 5);
    localStorage.setItem(BACKUP_SNAPSHOTS_KEY, JSON.stringify(snaps));
  }

  let backupListExpanded = false;

  async function renderBackupPanel() {
    const list = document.getElementById('backupPanelList');
    if (!list) return;
    if (!backupsDirHandle) await initBackupsDirHandle();
    const snaps = loadSnapshotList();
    const folderFiles = await listFolderBackups();
    const totalCount = snaps.length + folderFiles.length;

    let html = '';

    // Topo: conectar pasta ou header da pasta
    if (backupsDirHandle) {
      html += `<div class="backup-folder-header">
        <i class="fas fa-folder"></i>
        <span class="backup-folder-name">${backupsDirHandle.name}</span>
        <span class="backup-folder-count">${folderFiles.length}</span>
      </div>`;
    } else {
      html += `<button class="btn-sidebar-action backup-connect-folder" id="connectFolderBtn">
        <i class="fas fa-folder-plus"></i><span>Conectar pasta de backups</span>
      </button>`;
    }

    // Toggle colapsável
    if (totalCount > 0) {
      html += `<button type="button" class="backup-toggle" id="backupToggleBtn" aria-expanded="${backupListExpanded}">
        <i class="fas fa-clock-rotate-left"></i>
        <span class="backup-toggle-label">${totalCount} backup${totalCount !== 1 ? 's' : ''} disponíve${totalCount !== 1 ? 'is' : 'l'}</span>
        <i class="fas fa-chevron-${backupListExpanded ? 'up' : 'down'} backup-toggle-caret"></i>
      </button>`;

      // Conteúdo colapsável
      html += `<div class="backup-collapsible ${backupListExpanded ? '' : 'hidden'}" id="backupCollapsible">`;

      // Arquivos da pasta
      if (backupsDirHandle && folderFiles.length) {
        html += folderFiles.map(f => {
          const d = new Date(f.lastModified);
          const label = f.name.replace('fluxocaixa_backup_','').replace('.json','');
          const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          return `<div class="backup-snap-item" onclick="FC.restoreFolderBackup('${f.name}')">
            <div class="snap-info">
              <span class="snap-date">${label}</span>
              <span class="snap-meta">${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} · ${time}</span>
            </div>
            <div class="snap-actions">
              <i class="fas fa-rotate-left snap-restore-icon" title="Restaurar"></i>
              <i class="fas fa-trash snap-delete-icon" onclick="event.stopPropagation();FC.deleteFolderBackup('${f.name}')" title="Excluir"></i>
            </div>
          </div>`;
        }).join('');
        if (snaps.length) html += `<div class="backup-section-sep"><span>Snapshots rápidos</span></div>`;
      }

      // Snapshots
      html += snaps.map((s, i) => {
        const d = new Date(s.date);
        const dd = d.getDate().toString().padStart(2,'0');
        const mm = (d.getMonth()+1).toString().padStart(2,'0');
        const hh = d.getHours().toString().padStart(2,'0');
        const min = d.getMinutes().toString().padStart(2,'0');
        return `<div class="backup-snap-item" onclick="FC.restoreSnapshot(${i})">
          <div class="snap-info">
            <span class="snap-date">${dd}/${mm} às ${hh}:${min}</span>
            <span class="snap-meta">${s.txCount} tx · ${s.catCount} cat.</span>
          </div>
          <div class="snap-actions">
            <i class="fas fa-rotate-left snap-restore-icon" title="Restaurar"></i>
            <i class="fas fa-trash snap-delete-icon" onclick="event.stopPropagation();FC.deleteSnapshot(${i})" title="Excluir"></i>
          </div>
        </div>`;
      }).join('');

      html += `</div>`; // fecha backup-collapsible
    } else if (!backupsDirHandle) {
      html += `<div class="backup-empty">Nenhum backup.<br>Clique em "Exportar JSON".</div>`;
    } else {
      html += `<div class="backup-empty">Nenhum arquivo na pasta.</div>`;
    }

    // Importar arquivo (sempre visível)
    html += `<button class="btn-sidebar-action backup-import-file" id="importBackupFileBtn">
      <i class="fas fa-folder-open"></i><span>Importar arquivo...</span>
    </button>`;

    list.innerHTML = html;
    document.getElementById('importBackupFileBtn')?.addEventListener('click', () => {
      document.getElementById('backupFileInput').click();
    });
    document.getElementById('connectFolderBtn')?.addEventListener('click', connectBackupsFolder);
    document.getElementById('backupToggleBtn')?.addEventListener('click', () => {
      backupListExpanded = !backupListExpanded;
      const c = document.getElementById('backupCollapsible');
      const btn = document.getElementById('backupToggleBtn');
      const caret = btn?.querySelector('.backup-toggle-caret');
      if (c) c.classList.toggle('hidden', !backupListExpanded);
      if (btn) btn.setAttribute('aria-expanded', backupListExpanded);
      if (caret) {
        caret.classList.toggle('fa-chevron-up', backupListExpanded);
        caret.classList.toggle('fa-chevron-down', !backupListExpanded);
      }
    });
  }

  function importBackupData(backup) {
    if (!Array.isArray(backup.transactions)) throw new Error('Campo "transactions" ausente ou inválido');
    state.transactions    = backup.transactions;
    state.categories      = backup.categories      || JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    state.importHistory   = backup.importHistory   || [];
    state.columnLearnings = backup.columnLearnings || {};
    if (backup.patrimonio) { state.patrimonio = backup.patrimonio; savePatrimonio(); }
    save();
    toast(`Backup restaurado: ${backup.transactions.length} transações`, 'success');
    renderSection(state.currentSection);
  }

  async function exportBackupJSON() {
    const backup = {
      version: 3,
      exportDate: new Date().toISOString(),
      // v3: incluir credenciais (hash SHA-256) para permitir migração entre dispositivos
      auth: loadAuth(),
      transactions: state.transactions,
      categories: state.categories,
      importHistory: state.importHistory,
      columnLearnings: state.columnLearnings,
      patrimonio: state.patrimonio,
    };
    saveSnapshot(backup);
    const filename = `fluxocaixa_backup_${isoToday()}.json`;
    const jsonStr = JSON.stringify(backup, null, 2);
    if (backupsDirHandle) {
      try {
        const perm = await backupsDirHandle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted') await backupsDirHandle.requestPermission({ mode: 'readwrite' });
        const fh = await backupsDirHandle.getFileHandle(filename, { create: true });
        const w = await fh.createWritable();
        await w.write(jsonStr);
        await w.close();
        await renderBackupPanel();
        toast(`Backup salvo em "${backupsDirHandle.name}"!`, 'success');
        return;
      } catch(e) { /* fall through */ }
    }
    downloadFile(jsonStr, filename, 'application/json');
    await renderBackupPanel();
    toast('Backup exportado!', 'success');
  }

  function importBackupJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const backup = JSON.parse(e.target.result);
        const txCount  = (backup.transactions  || []).length;
        const catCount = (backup.categories    || []).length;
        confirm(
          'Restaurar backup?',
          `Serão restauradas ${txCount} transações e ${catCount} categorias. Os dados atuais serão substituídos.`,
          () => importBackupData(backup)
        );
      } catch (err) {
        toast('Arquivo inválido: ' + err.message, 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  // ──────────────────────────────────────────────
  // LEARNED COLUMNS
  // ──────────────────────────────────────────────
  function renderLearnedColumns() {
    const el = document.getElementById('learnedList');
    if (!el) return;
    const fieldLabels = { date:'Data', description:'Descrição', amount:'Valor', type:'Tipo', notes:'Observações' };
    const entries = Object.entries(state.columnLearnings);
    if (!entries.length) {
      el.innerHTML = '<div class="empty-state" style="padding:24px 20px"><i class="fas fa-graduation-cap"></i><p>Nenhum padrão aprendido ainda</p><span>Importe um extrato e mapeie as colunas — o sistema aprende automaticamente</span></div>';
      return;
    }
    el.innerHTML = `<table class="learned-table">
      <thead><tr><th>Nome da Coluna (normalizado)</th><th>Mapeado para</th><th></th></tr></thead>
      <tbody>
        ${entries.map(([norm, field]) => `<tr>
          <td><span class="col-name-chip">${esc(norm)}</span></td>
          <td><span class="col-field-chip">${fieldLabels[field] || field}</span></td>
          <td><button class="btn-icon delete" onclick="FC.deleteLearnedCol('${norm.replace(/'/g,"\\'")}')" title="Remover padrão"><i class="fas fa-times"></i></button></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  // ──────────────────────────────────────────────
  // EXPORT
  // ──────────────────────────────────────────────
  function exportCSV(txs, filename) {
    const headers = ['Data','Tipo','Descrição','Categoria','Conta','Valor','Observações'];
    const rows = txs.map(t => {
      const cat = getCat(t.category);
      return [t.date, t.type==='income'?'Receita':'Despesa', t.description,
        cat?cat.name:'', ACCOUNT_LABELS[t.account]||t.account,
        (t.type==='expense'?'-':'')+t.amount.toFixed(2), t.notes||''];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob(['﻿'+content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ──────────────────────────────────────────────
  // SAMPLE DATA
  // ──────────────────────────────────────────────
  function loadSampleData() {
    confirm('Carregar dados de exemplo?', 'Isso adicionará transações de demonstração dos últimos 3 meses.', () => {
      const now = new Date();
      const samples = [];
      for (let mo = 0; mo < 3; mo++) {
        const y = now.getFullYear(), m = now.getMonth() - mo;
        const yy = m < 0 ? y - 1 : y;
        const mm = ((m % 12) + 12) % 12 + 1;
        const d = (n) => `${yy}-${String(mm).padStart(2,'0')}-${String(n).padStart(2,'0')}`;

        samples.push(
          { id:uid(), type:'income',  description:'Salário',               amount:8500, date:d(5),  category:'salario',      account:'corrente', notes:'' },
          { id:uid(), type:'income',  description:'Freelance - Projeto Web',amount:2000, date:d(12), category:'freelance',    account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Aluguel',                amount:1800, date:d(1),  category:'moradia',      account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Supermercado Extra',     amount:620,  date:d(8),  category:'alimentacao',  account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'iFood',                  amount:89,   date:d(14), category:'alimentacao',  account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Uber',                   amount:45,   date:d(10), category:'transporte',   account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Plano de Saúde',        amount:380,  date:d(5),  category:'saude',        account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Netflix',                amount:45,   date:d(3),  category:'lazer',        account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Spotify',               amount:22,   date:d(3),  category:'lazer',        account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Conta de Luz - Enel',  amount:180,  date:d(15), category:'moradia',      account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Internet - Vivo',       amount:120,  date:d(5),  category:'moradia',      account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Academia',              amount:99,   date:d(2),  category:'saude',        account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Farmácia',              amount:76,   date:d(18), category:'saude',        account:'cartao',   notes:'' },
          { id:uid(), type:'expense', description:'Gasolina',              amount:220,  date:d(20), category:'transporte',   account:'corrente', notes:'' },
          { id:uid(), type:'expense', description:'Roupa - Renner',        amount:280,  date:d(22), category:'vestuario',    account:'cartao',   notes:'' },
          { id:uid(), type:'income',  description:'Rendimento Tesouro',    amount:130,  date:d(25), category:'investimentos', account:'investimento', notes:'' },
        );
      }
      state.transactions = [...state.transactions, ...samples];
      save();
      toast(`${samples.length} transações de exemplo adicionadas!`, 'success');
      renderSection(state.currentSection);
    });
  }

  // ──────────────────────────────────────────────
  // MODAL & CONFIRM HELPERS
  // ──────────────────────────────────────────────
  function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function hideModal(id) { document.getElementById(id).classList.add('hidden'); }

  function confirm(title, msg, cb) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent   = msg;
    state.confirmCallback = cb;
    showModal('confirmModal');
  }

  // ──────────────────────────────────────────────
  // TOAST
  // ──────────────────────────────────────────────
  function toast(msg, type = 'info') {
    const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i><span>${esc(msg)}</span>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => { el.classList.add('toast-out'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  // ──────────────────────────────────────────────
  // XSS ESCAPE
  // ──────────────────────────────────────────────
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ──────────────────────────────────────────────
  // EVENT LISTENERS
  // ──────────────────────────────────────────────
  function bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => goTo(el.dataset.section));
    });
    document.querySelectorAll('.btn-link[data-section]').forEach(el => {
      el.addEventListener('click', () => goTo(el.dataset.section));
    });

    // ── Faturas: comparativo — atualiza tabela ao mudar filtro ──
    document.getElementById('fatComparePeriod')?.addEventListener('change', renderFatCompare);
    document.getElementById('fatCompareAccount')?.addEventListener('change', renderFatCompare);

    // ── Faturas: navegação de mês ──
    document.getElementById('fatPrevBtn')?.addEventListener('click', () => {
      const [y, m] = state.faturaMonth.split('-').map(Number);
      const prev   = new Date(y, m - 2, 1);  // m-1 = mês atual, m-2 = mês anterior
      state.faturaMonth = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;
      renderFaturas();
    });
    document.getElementById('fatNextBtn')?.addEventListener('click', () => {
      const [y, m] = state.faturaMonth.split('-').map(Number);
      const next   = new Date(y, m, 1);  // m = próximo mês (0-indexed: mês atual = m-1, próximo = m)
      state.faturaMonth = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
      renderFaturas();
    });

    // Sidebar toggle (mobile) — com backdrop e fechamento por nav
    const _sidebar = document.getElementById('sidebar');
    const _sidebarBd = document.getElementById('sidebarBackdrop');

    function openSidebar()  { _sidebar.classList.add('open');    _sidebarBd?.classList.add('visible'); }
    function closeSidebar() { _sidebar.classList.remove('open'); _sidebarBd?.classList.remove('visible'); }

    document.getElementById('sidebarToggle').addEventListener('click', () => {
      _sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    _sidebarBd?.addEventListener('click', closeSidebar);

    // Fecha a sidebar ao navegar em telas pequenas
    document.querySelectorAll('.nav-item[data-section]').forEach(el => {
      el.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    // Month nav (one handler shared by all section selectors)
    document.querySelectorAll('.section-prev-month').forEach(btn => {
      btn.addEventListener('click', () => {
        state.viewMonth = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()-1, 1);
        updateMonthLabel();
        renderSection(state.currentSection);
      });
    });
    document.querySelectorAll('.section-next-month').forEach(btn => {
      btn.addEventListener('click', () => {
        state.viewMonth = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()+1, 1);
        updateMonthLabel();
        renderSection(state.currentSection);
      });
    });

    // Add transaction
    document.getElementById('addTransactionBtn').addEventListener('click', () => openTxModal(null));
    document.getElementById('closeTxModal').addEventListener('click', () => hideModal('txModal'));
    document.getElementById('cancelTxBtn').addEventListener('click', () => hideModal('txModal'));
    document.getElementById('saveTxBtn').addEventListener('click', saveTx);

    // Type toggle in modal
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Transaction filters
    document.getElementById('searchTransactions').addEventListener('input', e => {
      state.filters.search = e.target.value; state.page = 1; renderTransactions();
    });
    document.getElementById('filterType').addEventListener('change', e => {
      state.filters.type = e.target.value; state.page = 1; renderTransactions();
    });
    document.getElementById('filterCategory').addEventListener('change', e => {
      state.filters.category = e.target.value; state.page = 1; renderTransactions();
    });
    document.getElementById('filterDateFrom').addEventListener('change', e => {
      state.filters.dateFrom = e.target.value; state.page = 1; renderTransactions();
    });
    document.getElementById('filterDateTo').addEventListener('change', e => {
      state.filters.dateTo = e.target.value; state.page = 1; renderTransactions();
    });

    // Sort
    document.querySelectorAll('#txTable th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        if (state.sortCol === th.dataset.col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortCol = th.dataset.col; state.sortDir = 'asc'; }
        renderTransactions();
      });
    });

    // Inline category edit
    document.getElementById('txBody').addEventListener('click', e => {
      const cell = e.target.closest('.cat-cell');
      if (!cell || cell.querySelector('select')) return;
      const txId = cell.dataset.txid;
      const tx = state.transactions.find(t => t.id === txId);
      if (!tx) return;
      const cats = state.categories.filter(c => c.type === tx.type || c.type === 'both');
      const sel = document.createElement('select');
      sel.className = 'cat-inline-select';
      sel.innerHTML = `<option value="">— sem categoria —</option>` +
        cats.map(c => `<option value="${c.id}"${c.id === tx.category ? ' selected' : ''}>${c.icon} ${esc(c.name)}</option>`).join('');
      cell.innerHTML = '';
      cell.appendChild(sel);
      sel.focus();
      let committed = false;
      sel.addEventListener('change', () => {
        committed = true;
        tx.category = sel.value;
        save();
        renderTransactions();
      });
      sel.addEventListener('keydown', e => { if (e.key === 'Escape') { committed = true; renderTransactions(); } });
      sel.addEventListener('blur', () => { if (!committed) renderTransactions(); });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => location.reload());

    // Export
    document.getElementById('exportTxBtn').addEventListener('click', () => {
      exportCSV(getFilteredTxs(), `transacoes_${monthKey(state.viewMonth)}.csv`);
    });
    document.getElementById('autoCatPageBtn').addEventListener('click', autoCategorizeCurrentPage);
    document.getElementById('exportDataBtn').addEventListener('click', () => {
      exportCSV(state.transactions, 'patrono_completo.csv');
    });
    document.getElementById('exportBackupBtn').addEventListener('click', exportBackupJSON);
    document.getElementById('backupFileInput').addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) { importBackupJSON(f); e.target.value = ''; }
    });

    // Theme editor
    document.getElementById('openThemeBtn').addEventListener('click', openThemeEditor);
    document.getElementById('themeCloseBtn').addEventListener('click', closeThemeEditor);
    document.getElementById('themeOverlay').addEventListener('click', closeThemeEditor);
    document.getElementById('themeSaveBtn').addEventListener('click', saveCurrentTheme);
    document.getElementById('themeResetBtn').addEventListener('click', () => {
      localStorage.removeItem(THEME_KEY);
      applyPreset('contrast');
      toast('Tema resetado', 'success');
    });
    document.querySelectorAll('.theme-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    document.getElementById('clearLearnedBtn').addEventListener('click', () => {
      if (!Object.keys(state.columnLearnings).length) return;
      confirm('Limpar colunas aprendidas?', 'O sistema perderá os padrões de reconhecimento automático de colunas.', () => {
        state.columnLearnings = {};
        save();
        renderLearnedColumns();
        toast('Colunas aprendidas removidas', 'warning');
      });
    });
    document.getElementById('exportReportBtn').addEventListener('click', () => {
      exportCSV(state.transactions, `relatorio_${monthKey(state.viewMonth)}.csv`);
    });

    // Categories
    document.getElementById('addCatBtn').addEventListener('click', () => openCatModal(null));
    document.getElementById('closeCatModal').addEventListener('click', () => hideModal('catModal'));
    document.getElementById('cancelCatBtn').addEventListener('click', () => hideModal('catModal'));
    document.getElementById('saveCatBtn').addEventListener('click', saveCat);

    document.querySelectorAll('#catFilterTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#catFilterTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.catFilter = btn.dataset.filter;
        renderCategories();
      });
    });

    // Import
    const dz = document.getElementById('dropzone');
    const fi = document.getElementById('fileInput');
    document.getElementById('selectFileBtn').addEventListener('click', () => fi.click());
    fi.addEventListener('change', e => { if (e.target.files.length) handleFileSelect(e.target.files); });

    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('drag-over');
      const files = e.dataTransfer.files; if (files.length) handleFileSelect(files);
    });

    document.getElementById('removeFileBtn').addEventListener('click', cancelImport);
    document.getElementById('cancelImportBtn').addEventListener('click', cancelImport);
    document.getElementById('confirmImportBtn').addEventListener('click', confirmImport);

    // Dashboard period
    document.querySelectorAll('#dashPeriodTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#dashPeriodTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.dashPeriod = btn.dataset.period;
        document.getElementById('dashCustomRange').classList.toggle('hidden', state.dashPeriod !== 'custom');
        renderDashboard();
      });
    });
    document.getElementById('dashCustomFrom').addEventListener('change', e => {
      state.dashCustomFrom = e.target.value;
      if (state.dashPeriod === 'custom') renderDashboard();
    });
    document.getElementById('dashCustomTo').addEventListener('change', e => {
      state.dashCustomTo = e.target.value;
      if (state.dashPeriod === 'custom') renderDashboard();
    });
    document.getElementById('dashHideInvest').addEventListener('change', e => {
      state.dashHideInvest = e.target.checked;
      renderDashboard();
    });

    // Reports period — mesmo sistema do dashboard (month/3m/6m/12m/custom)
    document.querySelectorAll('#reportPeriodTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#reportPeriodTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.reportPeriod = btn.dataset.period;
        document.getElementById('reportCustomRange').classList.toggle('hidden', state.reportPeriod !== 'custom');
        renderReports();
      });
    });
    document.getElementById('reportCustomFrom')?.addEventListener('change', e => {
      state.reportCustomFrom = e.target.value;
      if (state.reportPeriod === 'custom') renderReports();
    });
    document.getElementById('reportCustomTo')?.addEventListener('change', e => {
      state.reportCustomTo = e.target.value;
      if (state.reportPeriod === 'custom') renderReports();
    });

    // Budget period
    document.querySelectorAll('#budgetPeriodTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#budgetPeriodTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.budgetPeriod = btn.dataset.period;
        document.getElementById('budgetCustomRange').classList.toggle('hidden', state.budgetPeriod !== 'custom');
        renderBudget();
      });
    });
    document.getElementById('budgetCustomFrom').addEventListener('change', e => {
      state.budgetCustomFrom = e.target.value;
      if (state.budgetPeriod === 'custom') renderBudget();
    });
    document.getElementById('budgetCustomTo').addEventListener('change', e => {
      state.budgetCustomTo = e.target.value;
      if (state.budgetPeriod === 'custom') renderBudget();
    });
    document.getElementById('budgetHideInvest').addEventListener('change', e => {
      state.budgetHideInvest = e.target.checked;
      renderBudget();
    });


    // Patrimônio
    document.getElementById('addAssetBtn')?.addEventListener('click', () => openAssetEditModal(null));
    document.getElementById('closeAssetUpdateModal')?.addEventListener('click', () => hideModal('assetUpdateModal'));
    document.getElementById('cancelAssetUpdateBtn')?.addEventListener('click', () => hideModal('assetUpdateModal'));
    document.getElementById('saveAssetUpdateBtn')?.addEventListener('click', saveAssetUpdate);
    document.getElementById('closeAssetEditModal')?.addEventListener('click', () => hideModal('assetEditModal'));
    document.getElementById('cancelAssetEditBtn')?.addEventListener('click', () => hideModal('assetEditModal'));
    document.getElementById('saveAssetEditBtn')?.addEventListener('click', saveAssetEdit);

    // Clear all
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      confirm('Apagar todos os dados?', 'Todas as transações e categorias personalizadas serão removidas. Essa ação não pode ser desfeita!', () => {
        state.transactions = [];
        state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.importHistory = [];
        save();
        toast('Dados apagados', 'warning');
        renderSection(state.currentSection);
      });
    });

    // Confirm modal
    document.getElementById('confirmCancelBtn').addEventListener('click', () => {
      state.confirmCallback = null; hideModal('confirmModal');
    });
    document.getElementById('confirmOkBtn').addEventListener('click', () => {
      if (state.confirmCallback) state.confirmCallback();
      state.confirmCallback = null;
      hideModal('confirmModal');
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay && overlay.id !== 'confirmModal') hideModal(overlay.id);
      });
    });
  }

  function updateMonthLabel() {
    document.querySelectorAll('.section-month-label').forEach(el => {
      el.textContent = monthLabel(state.viewMonth);
    });
  }

  // ──────────────────────────────────────────────
  // TOOLTIPS
  // ──────────────────────────────────────────────
  function initTooltips() {
    const tip = document.createElement('div');
    tip.id = 'globalTooltip';
    document.body.appendChild(tip);

    document.addEventListener('mouseover', e => {
      const btn = e.target.closest('.info-btn');
      if (!btn || !btn.dataset.tip) return;
      tip.textContent = btn.dataset.tip;
      tip.style.display = 'block';
      requestAnimationFrame(() => {
        positionTip(btn, tip);
        tip.style.opacity = '1';
      });
    });

    document.addEventListener('mouseout', e => {
      const btn = e.target.closest('.info-btn');
      if (!btn) return;
      tip.style.opacity = '0';
      setTimeout(() => { if (tip.style.opacity === '0') tip.style.display = 'none'; }, 150);
    });
  }

  function positionTip(btn, tip) {
    const rect = btn.getBoundingClientRect();
    const tipW = tip.offsetWidth || 260;
    const tipH = tip.offsetHeight || 60;
    let left = rect.left + rect.width / 2 - tipW / 2;
    let top  = rect.top - tipH - 10;
    if (left < 8) left = 8;
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
    if (top < 8) top = rect.bottom + 10;
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }

  // ──────────────────────────────────────────────
  // THEME EDITOR
  // ──────────────────────────────────────────────
  function openThemeEditor() {
    document.getElementById('themeModal').classList.remove('hidden');
    renderThemeEditor();
  }

  function closeThemeEditor() {
    document.getElementById('themeModal').classList.add('hidden');
  }

  function renderThemeEditor() {
    const container = document.getElementById('themeColorRows');
    if (!container) return;
    const style = getComputedStyle(document.documentElement);
    container.innerHTML = THEME_VARS.map(section => `
      <div class="theme-section">
        <div class="theme-section-title">${section.section}</div>
        ${section.vars.map(v => {
          const raw = style.getPropertyValue(v.key).trim();
          const hexVal = raw.startsWith('#') ? raw : '#888888';
          return `<div class="theme-color-row">
            <div class="theme-color-swatch" style="background:${hexVal}">
              <input type="color" value="${hexVal}" data-var="${v.key}" class="theme-color-pick">
            </div>
            <span class="theme-color-label">${v.label}</span>
            <input type="text" class="theme-color-value" value="${hexVal}" data-var="${v.key}" maxlength="7">
          </div>`;
        }).join('')}
      </div>`).join('');
    container.querySelectorAll('.theme-color-pick').forEach(inp => {
      inp.addEventListener('input', e => {
        const k = e.target.dataset.var, v = e.target.value;
        e.target.closest('.theme-color-swatch').style.background = v;
        const tx = container.querySelector(`.theme-color-value[data-var="${k}"]`);
        if (tx) tx.value = v;
        document.documentElement.style.setProperty(k, v);
      });
    });
    container.querySelectorAll('.theme-color-value').forEach(inp => {
      inp.addEventListener('change', e => {
        const k = e.target.dataset.var, v = e.target.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
          const sw = container.querySelector(`.theme-color-pick[data-var="${k}"]`);
          if (sw) { sw.value = v; sw.closest('.theme-color-swatch').style.background = v; }
          document.documentElement.style.setProperty(k, v);
        }
      });
    });
  }

  function applyPreset(name) {
    const preset = THEME_PRESETS[name];
    if (!preset) return;
    applyTheme(preset);
    renderThemeEditor();
    document.querySelectorAll('.theme-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  }

  function saveCurrentTheme() {
    const userVars = {};
    document.querySelectorAll('.theme-color-pick').forEach(inp => {
      userVars[inp.dataset.var] = inp.value;
    });
    const allVars = deriveThemeVars(userVars);
    localStorage.setItem(THEME_KEY, JSON.stringify(allVars));
    applyTheme(allVars);
    toast('Tema salvo!', 'success');
    closeThemeEditor();
  }

  // ──────────────────────────────────────────────
  // AUTH — Supabase
  // ──────────────────────────────────────────────

  // Referência global ao cliente Supabase (declarado em supabase/client.js)
  const sb = window._supabase;

  // Usuário logado no momento
  let _currentUser = null;

  // Mantém compatibilidade: SHA-256 ainda usado para hashes locais se necessário
  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Legacy helpers — mantidos para compatibilidade com backups antigos
  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
    catch { return null; }
  }
  function saveAuth(creds) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(creds));
  }

  function showAuthForm(which) {
    document.querySelectorAll('#authScreen .auth-form').forEach(f => f.classList.add('hidden'));
    document.getElementById(which).classList.remove('hidden');
    document.querySelectorAll('#authScreen .auth-error, #authScreen .auth-success').forEach(e => e.classList.add('hidden'));
  }

  function showAuthError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function showAuthSuccess(id, msg) {
    const el = document.getElementById(id);
    el.innerHTML = msg;
    el.classList.remove('hidden');
  }

  function showApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }

  function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }

  // ── Idle / auto-lock ──
  let idleCheckTimer = null;
  let activityListenersAttached = false;

  function recordActivity() {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  function isSessionExpired() {
    const last = parseInt(sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    if (!last) return false;
    return (Date.now() - last) > IDLE_TIMEOUT_MS;
  }

  function attachActivityListeners() {
    if (activityListenersAttached) return;
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
      document.addEventListener(evt, recordActivity, { passive: true, capture: true });
    });
    activityListenersAttached = true;
  }

  function startIdleWatcher() {
    recordActivity();
    attachActivityListeners();
    if (idleCheckTimer) clearInterval(idleCheckTimer);
    idleCheckTimer = setInterval(() => {
      if (isSessionExpired()) {
        autoLockDueToIdle();
      }
    }, IDLE_CHECK_INTERVAL_MS);
  }

  function stopIdleWatcher() {
    if (idleCheckTimer) { clearInterval(idleCheckTimer); idleCheckTimer = null; }
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  }

  function autoLockDueToIdle() {
    stopIdleWatcher();
    doLogout();
    if (typeof toast === 'function') {
      toast('Sessão bloqueada por inatividade (15 min). Entre novamente.', 'warning');
    }
  }

  async function doLogout() {
    stopIdleWatcher();
    await sb.auth.signOut();
    _currentUser = null;
    // onAuthStateChange cuida de chamar showAuthScreen()
  }

  // ── Troca de senha (painel Admin) — via Supabase ──
  async function handleChangePwd(e) {
    e.preventDefault();
    const newPwd     = document.getElementById('cpNewPwd').value;
    const confirmPwd = document.getElementById('cpConfirmPwd').value;
    const msgEl      = document.getElementById('changePwdMsg');

    function showChangePwdMsg(type, text) {
      msgEl.className = `change-pwd-msg ${type}`;
      msgEl.textContent = text;
    }

    if (newPwd.length < 6) {
      showChangePwdMsg('error', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      showChangePwdMsg('error', 'As senhas não conferem.');
      return;
    }

    showChangePwdMsg('info', 'Salvando...');
    const { error } = await sb.auth.updateUser({ password: newPwd });

    if (error) {
      showChangePwdMsg('error', 'Erro ao trocar senha: ' + error.message);
      return;
    }

    showChangePwdMsg('success', 'Senha alterada com sucesso!');
    document.getElementById('changePwdForm').reset();
    setTimeout(() => {
      document.getElementById('changePwdForm').classList.add('hidden');
      msgEl.classList.add('hidden');
      msgEl.className = 'change-pwd-msg hidden';
    }, 2200);
  }

  // ── Login via Supabase ──
  async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authLoginEmail').value.trim();
    const pwd   = document.getElementById('authLoginPwd').value;
    const btn   = e.target.querySelector('[type=submit]');

    document.getElementById('authLoginError').classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

    const { error } = await sb.auth.signInWithPassword({ email, password: pwd });

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Entrar';

    if (error) {
      showAuthError('authLoginError',
        error.message.includes('Invalid login') || error.message.includes('invalid')
          ? 'Email ou senha incorretos.'
          : error.message
      );
    }
    // Se ok, onAuthStateChange chama initApp() automaticamente
  }

  // ── Criar conta via Supabase ──
  async function handleCreateSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('authCreateUser').value.trim();
    const email    = document.getElementById('authCreateEmail').value.trim();
    const pwd      = document.getElementById('authCreatePwd').value;
    const pwd2     = document.getElementById('authCreatePwd2').value;
    const lgpd     = document.getElementById('authLgpdConsent').checked;
    const btn      = e.target.querySelector('[type=submit]');

    document.getElementById('authCreateError').classList.add('hidden');
    document.getElementById('authCreateSuccess').classList.add('hidden');

    if (!username)        { showAuthError('authCreateError', 'Informe um nome de usuário.'); return; }
    if (!lgpd)            { showAuthError('authCreateError', 'Você precisa aceitar os termos LGPD para continuar.'); return; }
    if (pwd.length < 6)   { showAuthError('authCreateError', 'A senha deve ter pelo menos 6 caracteres.'); return; }
    if (pwd !== pwd2)     { showAuthError('authCreateError', 'As senhas não conferem.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';

    const { error } = await sb.auth.signUp({
      email,
      password: pwd,
      options: {
        data: { username, lgpd_consent: true }
      }
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Criar conta';

    if (error) {
      showAuthError('authCreateError', error.message);
    } else {
      showAuthSuccess('authCreateSuccess',
        '<i class="fas fa-envelope"></i> Conta criada! Verifique seu email para confirmar o cadastro e depois faça login.'
      );
      e.target.reset();
    }
  }

  // ── Recuperação de senha via Supabase (envia email real) ──
  async function handleRecoverSubmit(e) {
    e.preventDefault();
    const email  = document.getElementById('authRecoverEmail').value.trim();
    const btn    = document.getElementById('authRecoverSubmit');

    document.getElementById('authRecoverError').classList.add('hidden');
    document.getElementById('authRecoverSuccess').classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://taylormind.github.io/patrimonium/'
    });

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar link de recuperação';

    if (error) {
      showAuthError('authRecoverError', 'Erro ao enviar email. Verifique o endereço informado.');
    } else {
      showAuthSuccess('authRecoverSuccess',
        `<i class="fas fa-check-circle"></i> Email enviado para <strong>${email}</strong>!<br>Clique no link recebido para definir uma nova senha.`
      );
    }
  }

  function setAuthTab(tab) {
    // tab: 'login' | 'create'
    document.querySelectorAll('#authTabs .auth-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    showAuthForm(tab === 'create' ? 'authCreateForm' : 'authLoginForm');
    document.getElementById('authTabs').classList.remove('hidden');
  }

  // ── Restore from backup (na própria tela de login, sem precisar estar logado) ──
  function showAuthRestoreMsg(type, html) {
    const el = document.getElementById('authRestoreMsg');
    if (!el) return;
    el.className = `auth-restore-msg ${type}`;
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  async function handleAuthRestore(file) {
    if (!file) return;
    showAuthRestoreMsg('success', '<i class="fas fa-spinner fa-spin"></i> Lendo backup...');
    try {
      const text = await file.text();
      let backup;
      try { backup = JSON.parse(text); }
      catch { throw new Error('Arquivo não é um JSON válido.'); }

      if (!backup || typeof backup !== 'object') throw new Error('Estrutura do backup inválida.');
      if (!Array.isArray(backup.transactions)) throw new Error('Backup sem transações — arquivo incompleto.');

      // Se o backup é v3+ ele inclui auth; v2 ou anterior não inclui
      if (!backup.auth || !backup.auth.user || !backup.auth.pwd) {
        showAuthRestoreMsg('error',
          'Este backup é antigo e não contém as credenciais.<br>' +
          '<b>Como migrar:</b> 1) crie uma conta nova aqui na aba "Criar conta"; ' +
          '2) entre no app; 3) restaure o backup pela tela Administração.'
        );
        return;
      }

      // Restaura tudo direto no localStorage (não precisa do app inicializado)
      const txCount = backup.transactions.length;
      const userName = backup.auth.user;

      localStorage.setItem(AUTH_KEY, JSON.stringify(backup.auth));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        transactions:    backup.transactions,
        categories:      backup.categories      || [],
        importHistory:   backup.importHistory   || [],
        columnLearnings: backup.columnLearnings || {},
      }));
      if (backup.patrimonio) {
        localStorage.setItem(PATRIMONIO_KEY, JSON.stringify(backup.patrimonio));
      }

      showAuthRestoreMsg('success',
        `<i class="fas fa-check-circle"></i> <b>Conta "${esc(userName)}" restaurada</b> com ${txCount} transações.<br>` +
        'Recarregando para entrar...'
      );

      // Inicia sessão automaticamente e recarrega
      sessionStorage.setItem(SESSION_KEY, '1');
      setTimeout(() => location.reload(), 1400);
    } catch (e) {
      showAuthRestoreMsg('error', `<i class="fas fa-triangle-exclamation"></i> ${esc(e.message)}`);
    }
  }

  function bindAuthEvents() {
    document.getElementById('authLoginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('authCreateForm').addEventListener('submit', handleCreateSubmit);
    document.getElementById('authRecoverForm').addEventListener('submit', handleRecoverSubmit);
    // Tabs: choose login or create account
    document.querySelectorAll('#authTabs .auth-tab').forEach(btn => {
      btn.addEventListener('click', () => setAuthTab(btn.dataset.tab));
    });
    document.getElementById('authForgotBtn').addEventListener('click', () => {
      showAuthForm('authRecoverForm');
      document.getElementById('authTabs').classList.add('hidden');
      document.getElementById('authRecoverNewPwdWrap').classList.add('hidden');
      document.getElementById('authRecoverSubmit').innerHTML = '<i class="fas fa-paper-plane"></i> Enviar instruções';
      document.getElementById('authRecoverEmail').value = '';
      document.getElementById('authRecoverNewPwd').value = '';
    });
    document.getElementById('authBackToLoginBtn').addEventListener('click', () => {
      setAuthTab('login');
    });
    // Toggle de visibilidade de senha em todos os campos
    document.querySelectorAll('.auth-pwd-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        const icon = btn.querySelector('i');
        const showing = target.type === 'text';
        target.type = showing ? 'password' : 'text';
        icon.classList.toggle('fa-eye', showing);
        icon.classList.toggle('fa-eye-slash', !showing);
      });
    });
    // Restore backup direto da tela de login (migração entre dispositivos)
    const restoreBtn  = document.getElementById('authRestoreBtn');
    const restoreFile = document.getElementById('authRestoreFile');
    if (restoreBtn && restoreFile) {
      restoreBtn.addEventListener('click', () => restoreFile.click());
      restoreFile.addEventListener('change', e => {
        const f = e.target.files && e.target.files[0];
        if (f) handleAuthRestore(f);
        e.target.value = ''; // permite re-selecionar o mesmo arquivo
      });
    }
    // Ao trocar para aba "Criar conta", limpa a mensagem de ajuda
    document.querySelectorAll('#authTabs .auth-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('authNoAccountHelp')?.classList.add('hidden');
      });
    });
  }

  // ──────────────────────────────────────────────
  // AI INSIGHTS CHAT — local rule-based engine (offline, sem API)
  // ──────────────────────────────────────────────
  const CHAT_GREETING = `Olá! Sou seu assistente de insights financeiros. Pergunte coisas como:<br>
    <em>"Quanto gastei em alimentação este mês?"</em><br>
    <em>"Qual a média mensal de receitas?"</em><br>
    <em>"Quanto foi gasto em Uber?"</em>`;

  const CHAT_DEFAULT_SUGGESTIONS = [
    'Quanto gastei este mês?',
    'Média mensal de receitas',
    'Maior despesa do ano',
    'Saldo total',
    'Top 5 categorias de gasto',
  ];

  function chatNormalize(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[?!.,;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ── Detecta intenção ──
  function detectIntent(text) {
    if (/\b(media|medio|mensal mente|media mensal)\b/.test(text)) return 'avg_monthly';
    if (/\b(quantas|quantos|numero de|qtd|quantidade)\b/.test(text)) return 'count';
    if (/\b(maior|mais cara|mais caro|maior gasto|maior despesa|maior receita|top|ranking)\b/.test(text)) {
      if (/\btop\s*\d/.test(text) || /\branking|categorias?\b/.test(text)) return 'top';
      return 'max';
    }
    if (/\b(menor|mais barato|mais barata|minimo|minima)\b/.test(text)) return 'min';
    if (/\b(saldo|resultado|liquido|sobra|sobrou|balanco)\b/.test(text)) return 'balance';
    if (/\b(lista|liste|mostre|mostra|todas|todos)\b/.test(text)) return 'list';
    // default: sum (quanto, total, gastou, gastei...)
    return 'sum';
  }

  // ── Detecta tipo (income/expense) ──
  function detectType(text) {
    if (/\b(ganh|recebi|recebid|entrou|entrad|receit|salario|renda|provent)/.test(text)) return 'income';
    if (/\b(gast|despes|pag|sai|saida|comprei|comprado|debit)/.test(text)) return 'expense';
    return null;
  }

  // ── Detecta período → {from, to, label} ou null ──
  function detectPeriod(text) {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth();

    // este mês / neste mes
    if (/\b(este|esse|neste|deste|atual)\s+mes\b/.test(text) || /\bmes atual\b/.test(text)) {
      return periodRange(new Date(y, m, 1), new Date(y, m+1, 0), `${MONTHS_PT[m]} ${y}`);
    }
    // mês passado / último mês
    if (/\b(mes passado|ultimo mes|mes anterior)\b/.test(text)) {
      const d = new Date(y, m-1, 1);
      return periodRange(d, new Date(y, m, 0), `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`);
    }
    // este ano
    if (/\b(este|esse|neste|deste)\s+ano\b/.test(text) || /\bano atual\b/.test(text)) {
      return periodRange(new Date(y, 0, 1), new Date(y, 11, 31), `${y}`);
    }
    // ano passado
    if (/\b(ano passado|ultimo ano)\b/.test(text)) {
      return periodRange(new Date(y-1, 0, 1), new Date(y-1, 11, 31), `${y-1}`);
    }
    // últimos N meses
    const lastN = text.match(/ultimos?\s+(\d+)\s+meses?/);
    if (lastN) {
      const n = parseInt(lastN[1], 10);
      const start = new Date(y, m - (n - 1), 1);
      return periodRange(start, new Date(y, m+1, 0), `últimos ${n} meses`);
    }
    // mês específico (com ou sem ano)
    const monthMatch = text.match(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de)?\s*(\d{4})?\b/);
    if (monthMatch) {
      const monthIdx = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'].indexOf(monthMatch[1]);
      const year = monthMatch[2] ? parseInt(monthMatch[2], 10) : y;
      return periodRange(new Date(year, monthIdx, 1), new Date(year, monthIdx+1, 0), `${MONTHS_PT[monthIdx]} ${year}`);
    }
    // ano específico
    const yearMatch = text.match(/\bem\s+(\d{4})\b|\bno\s+ano\s+de\s+(\d{4})\b|\bdurante\s+(\d{4})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1] || yearMatch[2] || yearMatch[3], 10);
      return periodRange(new Date(year, 0, 1), new Date(year, 11, 31), `${year}`);
    }
    return null; // sem período → todo o histórico
  }

  function periodRange(from, to, label) {
    return {
      from: from.toISOString().slice(0, 10),
      to:   to.toISOString().slice(0, 10),
      label
    };
  }

  // ── Detecta categoria por nome ──
  function detectCategory(text) {
    let best = null, bestLen = 0;
    state.categories.forEach(c => {
      const norm = chatNormalize(c.name);
      if (norm && text.includes(norm) && norm.length > bestLen) {
        best = c; bestLen = norm.length;
      }
    });
    return best;
  }

  // ── Detecta palavra-chave (busca em descrição) ──
  // Remove palavras já consumidas e procura termo significativo
  const CHAT_STOPWORDS = new Set([
    'quanto','quantos','quantas','foi','gastei','gastou','gasto','gasta','gastas','gastos','gastando',
    'ganhei','ganhou','ganho','ganhos','recebi','recebido','recebeu','recebido',
    'em','de','do','da','dos','das','no','na','nos','nas','com','para','pra','o','a','os','as','um','uma',
    'que','meu','minha','meus','minhas','seu','sua','meus','minhas',
    'total','soma','somar','media','medio','medias','medios','mensal','mensais','mensalmente',
    'mes','meses','ano','anos','esse','este','neste','deste','passado','ultimo','ultima','ultimos','ultimas','anterior','atual',
    'janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro',
    'qual','quais','onde','quando','como','meu','minha',
    'lista','liste','mostre','mostra','todas','todos','sao','foi','fui','sou','tem','tenho','teve',
    'maior','menor','mais','menos','caro','cara','barato','barata','top','ranking','primeira','primeiro','ultima','ultimo',
    'despesa','despesas','receita','receitas','saldo','resultado','liquido','sobra','sobrou','balanco',
    'categoria','categorias','transacao','transacoes','valor','valores','dinheiro','reais','grana',
    'durante','desde','ate','entre','ao','aos','sobre','por',
    'gera','geral','geralmente','sempre','nunca','tudo','nada',
    'sim','nao','talvez','pode','poderia','ser','tive','tinha',
    'eu','voce','ele','ela','nos','eles','elas',
    'patrono','app','sistema','plataforma',
  ]);

  function detectKeyword(text, category) {
    const tokens = text.split(/\s+/).filter(t => t.length >= 3 && !CHAT_STOPWORDS.has(t) && !/^\d+$/.test(t));
    if (!tokens.length) return null;
    // Remove tokens que pertencem ao nome da categoria detectada
    let remaining = tokens;
    if (category) {
      const catTokens = chatNormalize(category.name).split(/\s+/);
      remaining = tokens.filter(t => !catTokens.includes(t));
    }
    if (!remaining.length) return null;
    // Retorna o token mais longo (mais específico)
    return remaining.sort((a,b) => b.length - a.length)[0];
  }

  // ── Executa a query ──
  function chatExecute(text) {
    const norm = chatNormalize(text);
    const intent = detectIntent(norm);
    const period = detectPeriod(norm);
    const type   = detectType(norm);
    const cat    = detectCategory(norm);
    const kw     = detectKeyword(norm, cat);

    let txs = state.transactions.slice();
    let filterLabel = [];

    if (period) {
      txs = txs.filter(t => t.date >= period.from && t.date <= period.to);
      filterLabel.push(`em <strong>${period.label}</strong>`);
    }
    if (type) {
      txs = txs.filter(t => t.type === type);
      filterLabel.push(type === 'income' ? 'de <strong>receitas</strong>' : 'de <strong>despesas</strong>');
    }
    if (cat) {
      txs = txs.filter(t => t.category === cat.id);
      filterLabel.push(`na categoria <strong>${cat.name}</strong>`);
    }
    if (kw) {
      txs = txs.filter(t => (t.description || '').toLowerCase().includes(kw));
      filterLabel.push(`contendo <strong>"${kw}"</strong>`);
    }

    const ctxLabel = filterLabel.length ? ' ' + filterLabel.join(' ') : '';

    if (intent === 'balance') {
      const t = totals(state.transactions);
      return {
        answer: `<i class="fas fa-wallet chat-msg-icon"></i> Seu saldo total acumulado é <strong>${fmtBRL(t.net)}</strong> (receitas ${fmtBRL(t.income)} − despesas ${fmtBRL(t.expense)}).`,
        followups: ['Saldo este mês', 'Maior despesa do ano', 'Média mensal de receitas']
      };
    }

    if (!txs.length) {
      return {
        answer: `<i class="fas fa-circle-question chat-msg-icon"></i> Não encontrei transações${ctxLabel}. Tente reformular ou ampliar o período.`,
        followups: CHAT_DEFAULT_SUGGESTIONS
      };
    }

    if (intent === 'count') {
      return {
        answer: `<i class="fas fa-list-ol chat-msg-icon"></i> Encontrei <strong>${txs.length}</strong> transações${ctxLabel}.`,
        followups: ['Soma total', 'Lista detalhada']
      };
    }

    if (intent === 'avg_monthly') {
      const monthsSet = new Set(txs.map(t => t.date.slice(0,7)));
      const monthsCount = Math.max(1, monthsSet.size);
      const sumVal = txs.reduce((s,t) => s + t.amount, 0);
      const avg = sumVal / monthsCount;
      return {
        answer: `<i class="fas fa-chart-line chat-msg-icon"></i> Média mensal${ctxLabel}: <strong>${fmtBRL(avg)}</strong><br><em>(${fmtBRL(sumVal)} ÷ ${monthsCount} ${monthsCount === 1 ? 'mês' : 'meses'} com movimento)</em>`,
        followups: ['Soma total', 'Maior valor', 'Comparar com mês anterior']
      };
    }

    if (intent === 'max') {
      const top = [...txs].sort((a,b) => b.amount - a.amount)[0];
      const catName = top.category ? (getCat(top.category)?.name || top.category) : 'sem categoria';
      return {
        answer: `<i class="fas fa-arrow-up chat-msg-icon"></i> Maior valor${ctxLabel}: <strong>${fmtBRL(top.amount)}</strong> — ${esc(top.description || 'sem descrição')} <em>(${catName} · ${fmtDate(top.date)})</em>`,
        followups: ['Top 5 categorias', 'Soma total', 'Menor valor']
      };
    }

    if (intent === 'min') {
      const bot = [...txs].sort((a,b) => a.amount - b.amount)[0];
      const catName = bot.category ? (getCat(bot.category)?.name || bot.category) : 'sem categoria';
      return {
        answer: `<i class="fas fa-arrow-down chat-msg-icon"></i> Menor valor${ctxLabel}: <strong>${fmtBRL(bot.amount)}</strong> — ${esc(bot.description || 'sem descrição')} <em>(${catName} · ${fmtDate(bot.date)})</em>`,
        followups: ['Maior valor', 'Soma total']
      };
    }

    if (intent === 'top') {
      // Top categorias por valor (despesa por padrão)
      const t = type || 'expense';
      const filtered = txs.filter(tx => tx.type === t);
      const byCat = {};
      filtered.forEach(tx => {
        const k = tx.category || 'sem_cat';
        byCat[k] = (byCat[k] || 0) + tx.amount;
      });
      const n = parseInt((norm.match(/top\s*(\d+)/) || [])[1] || '5', 10);
      const top = Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0, n);
      if (!top.length) return { answer: 'Sem dados para ranking.', followups: CHAT_DEFAULT_SUGGESTIONS };
      const listHtml = top.map(([k, v]) => {
        const c = getCat(k);
        return `<div class="chat-list-item"><span>${c ? c.icon + ' ' + esc(c.name) : 'Sem categoria'}</span><span class="chat-list-amt">${fmtBRL(v)}</span></div>`;
      }).join('');
      return {
        answer: `<i class="fas fa-ranking-star chat-msg-icon"></i> Top ${top.length} categorias${ctxLabel || ' de despesas'}:<div class="chat-list">${listHtml}</div>`,
        followups: ['Soma total', 'Maior despesa', 'Média mensal']
      };
    }

    if (intent === 'list') {
      const sorted = [...txs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8);
      const listHtml = sorted.map(tx => {
        const c = getCat(tx.category);
        return `<div class="chat-list-item"><span>${fmtDate(tx.date)} · ${esc(tx.description || 'sem descrição').slice(0,28)}${c ? ' <em>('+esc(c.name)+')</em>' : ''}</span><span class="chat-list-amt">${tx.type === 'expense' ? '−' : '+'}${fmtBRL(tx.amount)}</span></div>`;
      }).join('');
      return {
        answer: `<i class="fas fa-list chat-msg-icon"></i> Últimas ${sorted.length}${ctxLabel ? ' ' + ctxLabel.replace(/^\s*/, '') : ''} (de ${txs.length} no total):<div class="chat-list">${listHtml}</div>`,
        followups: ['Soma total', 'Maior valor']
      };
    }

    // intent === 'sum' (default)
    const t = totals(txs);
    let main, detail = '';
    if (type === 'income') { main = t.income; }
    else if (type === 'expense') { main = t.expense; }
    else {
      // Sem tipo: mostra os 3 (entradas, saídas, saldo)
      main = t.net;
      detail = `<br><em>Receitas: ${fmtBRL(t.income)} · Despesas: ${fmtBRL(t.expense)}</em>`;
    }
    const icon = type === 'income' ? 'fa-arrow-trend-up' : type === 'expense' ? 'fa-arrow-trend-down' : 'fa-equals';
    const action = type === 'income' ? 'Entrou' : type === 'expense' ? 'Foi gasto' : 'Saldo líquido';
    return {
      answer: `<i class="fas ${icon} chat-msg-icon"></i> ${action}${ctxLabel}: <strong>${fmtBRL(main)}</strong> <em>(${txs.length} ${txs.length === 1 ? 'transação' : 'transações'})</em>${detail}`,
      followups: type === 'expense' ? ['Maior despesa', 'Top 5 categorias', 'Média mensal'] :
                 type === 'income'  ? ['Maior receita', 'Média mensal de receitas'] :
                                      ['Saldo total', 'Maior despesa', 'Maior receita']
    };
  }

  // ── UI handlers ──
  let chatOpened = false;

  function chatOpenPanel() {
    document.getElementById('chatBackdrop').classList.remove('hidden');
    document.getElementById('chatPanel').classList.remove('hidden');
    requestAnimationFrame(() => {
      document.getElementById('chatBackdrop').classList.add('visible');
      document.getElementById('chatPanel').classList.add('visible');
    });
    document.getElementById('chatPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('chatFab').classList.add('open');

    if (!chatOpened) {
      chatOpened = true;
      chatAddMessage('bot', CHAT_GREETING);
      chatRenderSuggestions(CHAT_DEFAULT_SUGGESTIONS);
    }
    // Foca o input após a animação. Em mobile evitamos focar automaticamente
    // para não abrir o teclado sem o usuário ter pedido (melhora UX no iPhone).
    if (window.innerWidth > 640) {
      setTimeout(() => document.getElementById('chatInput')?.focus(), 320);
    }
  }

  function chatClosePanel() {
    document.getElementById('chatBackdrop').classList.remove('visible');
    document.getElementById('chatPanel').classList.remove('visible');
    setTimeout(() => {
      document.getElementById('chatBackdrop').classList.add('hidden');
      document.getElementById('chatPanel').classList.add('hidden');
    }, 280);
    document.getElementById('chatPanel').setAttribute('aria-hidden', 'true');
    document.getElementById('chatFab').classList.remove('open');
  }

  function chatAddMessage(role, html) {
    const wrap = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = html;
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
    return div;
  }

  function chatRenderSuggestions(list) {
    const el = document.getElementById('chatSuggestions');
    el.innerHTML = list.slice(0, 6).map(s => `<button type="button" class="chat-suggestion">${esc(s)}</button>`).join('');
    el.querySelectorAll('.chat-suggestion').forEach(b => {
      b.addEventListener('click', () => {
        document.getElementById('chatInput').value = b.textContent;
        chatSubmit();
      });
    });
  }

  function chatSubmit() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    chatAddMessage('user', esc(text));
    input.value = '';
    // typing indicator
    const typing = chatAddMessage('bot typing', '<span></span><span></span><span></span>');
    setTimeout(() => {
      try {
        const result = chatExecute(text);
        typing.remove();
        chatAddMessage('bot', result.answer);
        chatRenderSuggestions(result.followups || CHAT_DEFAULT_SUGGESTIONS);
      } catch (e) {
        typing.remove();
        chatAddMessage('bot', `<i class="fas fa-triangle-exclamation chat-msg-icon"></i> Ops, não consegui interpretar. Erro: ${esc(e.message)}`);
      }
    }, 320 + Math.random() * 200);
  }

  function bindChatEvents() {
    const fab = document.getElementById('chatFab');
    const close = document.getElementById('chatCloseBtn');
    const backdrop = document.getElementById('chatBackdrop');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    if (!fab || !close || !form) return;
    fab.classList.remove('hidden');
    fab.addEventListener('click', () => {
      if (document.getElementById('chatPanel').classList.contains('visible')) chatClosePanel();
      else chatOpenPanel();
    });
    close.addEventListener('click', chatClosePanel);
    backdrop.addEventListener('click', chatClosePanel);
    form.addEventListener('submit', e => { e.preventDefault(); chatSubmit(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('chatPanel').classList.contains('visible')) chatClosePanel();
    });

    // iOS fix: rola o input para dentro da viewport quando o teclado abre.
    // Em iPhones sem suporte a dvh (< iOS 15.4), o teclado pode cobrir o campo.
    if (input) {
      input.addEventListener('focus', () => {
        // Aguarda o teclado abrir (~300ms) antes de rolar
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
      });

      // Quando o teclado fecha (blur), rola as mensagens para o final
      input.addEventListener('blur', () => {
        setTimeout(() => {
          const msgs = document.getElementById('chatMessages');
          if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }, 200);
      });
    }
  }

  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────
  let appInitialized = false;
  function init() {
    load();
    loadPatrimonio();
    loadTheme();
    updateMonthLabel();
    bindEvents();
    initTooltips();
    bindChatEvents();
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      confirm('Sair do app?', 'Você precisará entrar novamente.', doLogout);
    });

    // ── Trocar senha (Admin) ──
    document.getElementById('changePwdBtn')?.addEventListener('click', () => {
      const form = document.getElementById('changePwdForm');
      form.classList.toggle('hidden');
      if (!form.classList.contains('hidden')) {
        document.getElementById('cpOldPwd').focus();
      } else {
        form.reset();
        const msg = document.getElementById('changePwdMsg');
        msg.classList.add('hidden');
        msg.className = 'change-pwd-msg hidden';
      }
    });

    document.getElementById('cancelPwdBtn')?.addEventListener('click', () => {
      const form = document.getElementById('changePwdForm');
      form.classList.add('hidden');
      form.reset();
      const msg = document.getElementById('changePwdMsg');
      msg.classList.add('hidden');
      msg.className = 'change-pwd-msg hidden';
    });

    document.getElementById('changePwdForm')?.addEventListener('submit', handleChangePwd);

    goTo('dashboard');
  }

  function initApp() {
    showApp();
    if (!appInitialized) { init(); appInitialized = true; }
  }

  function initAuth() {
    bindAuthEvents();

    // Escuta mudanças de autenticação do Supabase (login, logout, refresh de token)
    sb.auth.onAuthStateChange((event, session) => {
      if (session) {
        _currentUser = session.user;
        // Se era redirecionamento de reset de senha, o evento é PASSWORD_RECOVERY
        if (event === 'PASSWORD_RECOVERY') {
          // Usuário chegou pelo link de email — mostra tela de nova senha
          showApp();
          if (!appInitialized) { init(); appInitialized = true; }
          goTo('admin');
          // Abre automaticamente o formulário de troca de senha
          setTimeout(() => {
            document.getElementById('changePwdBtn')?.click();
          }, 500);
          return;
        }
        startIdleWatcher();
        initApp();
      } else {
        _currentUser = null;
        stopIdleWatcher();
        showAuthScreen();
        setAuthTab('login');
      }
    });

    // Verifica sessão já existente (ex: usuário reabriu a aba)
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        showAuthScreen();
        setAuthTab('login');
      }
      // Se há sessão, onAuthStateChange já vai disparar com o evento INITIAL_SESSION
    });
  }

  document.addEventListener('DOMContentLoaded', initAuth);
})();
