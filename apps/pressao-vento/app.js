const GRUPOS_S3 = [
  { grupo: 1, s3: 1.11 },
  { grupo: 2, s3: 1.06 },
  { grupo: 3, s3: 1.0 },
  { grupo: 4, s3: 0.95 },
  { grupo: 5, s3: 0.83 },
];

const PARAMETROS_S2 = {
  I:   { A: { bm: 1.10, p: 0.060 }, B: { bm: 1.11, p: 0.065 }, C: { bm: 1.12, p: 0.070 } },
  II:  { A: { bm: 1.00, p: 0.085 }, B: { bm: 1.00, p: 0.090 }, C: { bm: 1.00, p: 0.100 } },
  III: { A: { bm: 0.94, p: 0.100 }, B: { bm: 0.94, p: 0.105 }, C: { bm: 0.93, p: 0.115 } },
  IV:  { A: { bm: 0.86, p: 0.120 }, B: { bm: 0.85, p: 0.125 }, C: { bm: 0.84, p: 0.135 } },
  V:   { A: { bm: 0.74, p: 0.150 }, B: { bm: 0.73, p: 0.160 }, C: { bm: 0.71, p: 0.175 } },
};

const FR = { A: 1.0, B: 0.98, C: 0.95 };

const TABELA_S2 = {
  alturas: [5,10,15,20,30,40,50,60,80,100,120,140,160,180,200,250,300,350,400,420,450,500],
  valores: {
    I: {
      A:[1.06,1.10,1.13,1.15,1.17,1.20,1.21,1.22,1.25,1.26,1.28,1.29,1.30,1.31,1.32,1.33,null,null,null,null,null,null],
      B:[1.04,1.09,1.12,1.14,1.17,1.19,1.21,1.22,1.25,1.26,1.28,1.29,1.30,1.31,1.32,1.34,null,null,null,null,null,null],
      C:[1.01,1.06,1.09,1.12,1.15,1.17,1.19,1.21,1.23,1.25,1.27,1.28,1.29,1.30,1.31,1.33,null,null,null,null,null,null],
    },
    II: {
      A:[0.94,1.00,1.04,1.06,1.10,1.13,1.15,1.16,1.19,1.22,1.24,1.25,1.27,1.28,1.29,1.31,null,null,null,null,null,null],
      B:[0.92,0.98,1.02,1.04,1.08,1.11,1.13,1.15,1.18,1.21,1.23,1.24,1.26,1.27,1.28,1.31,null,null,null,null,null,null],
      C:[0.89,0.95,0.99,1.02,1.06,1.09,1.12,1.14,1.17,1.20,1.22,1.24,1.25,1.27,1.28,1.31,null,null,null,null,null,null],
    },
    III: {
      A:[0.88,0.94,0.98,1.01,1.05,1.08,1.10,1.12,1.16,1.18,1.20,1.22,1.24,1.26,1.27,1.30,1.32,1.34,null,null,null,null],
      B:[0.86,0.92,0.96,0.99,1.03,1.07,1.09,1.11,1.15,1.17,1.20,1.22,1.23,1.25,1.26,1.29,1.32,1.34,null,null,null,null],
      C:[0.82,0.88,0.93,0.96,1.00,1.04,1.06,1.09,1.12,1.15,1.18,1.20,1.22,1.23,1.25,1.28,1.31,1.33,null,null,null,null],
    },
    IV: {
      A:[0.79,0.86,0.90,0.93,0.98,1.02,1.04,1.07,1.10,1.13,1.16,1.18,1.20,1.22,1.23,1.27,1.29,1.32,1.34,1.35,null,null],
      B:[0.76,0.83,0.88,0.91,0.96,0.99,1.02,1.04,1.08,1.11,1.14,1.16,1.18,1.20,1.21,1.25,1.27,1.30,1.32,1.33,null,null],
      C:[0.73,0.80,0.84,0.88,0.93,0.96,0.99,1.02,1.06,1.09,1.12,1.14,1.16,1.18,1.20,1.23,1.26,1.29,1.30,1.30,null,null],
    },
    V: {
      A:[0.74,0.74,0.79,0.82,0.87,0.91,0.94,0.97,1.01,1.05,1.07,1.10,1.12,1.14,1.16,1.20,1.23,1.26,1.29,null,1.32,1.34],
      B:[0.72,0.72,0.76,0.80,0.85,0.89,0.93,0.95,1.00,1.03,1.06,1.09,1.11,1.14,1.16,1.20,1.23,1.26,1.29,1.30,1.32,1.34],
      C:[0.67,0.67,0.72,0.76,0.82,0.86,0.89,0.92,0.97,1.01,1.04,1.07,1.10,1.12,1.14,1.18,1.22,1.26,1.29,1.30,1.31,1.34],
    },
  }
};

const TABELA_CE = {
  faixa1: { label: 'h/b ≤ 1/2', valores: { barlavento_0: 0.7, sotavento_0: -0.5, lateral_0: -0.9, barlavento_90: 0.7, sotavento_90: -0.5, lateral_90: -1.0 } },
  faixa2: { label: '1/2 < h/b ≤ 3/2', valores: { barlavento_0: 0.7, sotavento_0: -0.5, lateral_0: -1.1, barlavento_90: 0.7, sotavento_90: -0.6, lateral_90: -1.1 } },
  faixa3: { label: '3/2 < h/b ≤ 6', valores: { barlavento_0: 0.8, sotavento_0: -0.6, lateral_0: -1.2, barlavento_90: 0.8, sotavento_90: -0.6, lateral_90: -1.2 } },
};

// Tabela 6 completa NBR 6123 — cols: [hb_min, hb_max, ab_min, ab_max, A1B1_0, A2B2_0, C_0, D_0, A_90, B_90, C1D1_90, C2D2_90]
const TAB6 = [
  [0,   0.5, 1, 1.5, -0.8, -0.5, +0.7, -0.4, +0.7, -0.4, -0.8, -0.4],
  [0,   0.5, 2,   4, -0.8, -0.4, +0.7, -0.3, +0.7, -0.5, -0.9, -0.5],
  [0.5, 1.5, 1, 1.5, -0.9, -0.5, +0.7, -0.5, +0.7, -0.5, -0.9, -0.5],
  [0.5, 1.5, 2,   4, -0.9, -0.4, +0.7, -0.3, +0.7, -0.6, -0.9, -0.5],
  [1.5,   6, 1, 1.5, -1.0, -0.6, +0.8, -0.6, +0.8, -0.6, -1.0, -0.6],
  [1.5,   6, 2,   4, -1.0, -0.5, +0.8, -0.3, +0.8, -0.6, -1.0, -0.6],
];

const ZONA_LABEL = {
  barlavento_0: 'Barlavento — vento 0°',
  sotavento_0: 'Sotavento — vento 0°',
  lateral_0: 'Lateral — vento 0° (Ce médio)',
  barlavento_90: 'Barlavento — vento 90°',
  sotavento_90: 'Sotavento — vento 90°',
  lateral_90: 'Lateral — vento 90° (Ce médio)',
  manual: 'Manual',
};

const CASOS_CPI = {
  estanque: { label: 'Estanque (janelas fixas)', valores: [-0.2, 0] },
  '4faces': { label: '4 faces igualmente permeáveis', valores: [-0.3, 0] },
  '2faces_perp_permeavel': { label: '2 faces opostas — vento ⊥ face permeável', valores: [0.2] },
  '2faces_perp_impermeavel': { label: '2 faces opostas — vento ⊥ face impermeável', valores: [-0.3] },
  abertura_dominante: { label: 'Abertura dominante na face de barlavento', valores: [0.8] },
  manual: { label: 'Manual', valores: null },
};

const FACE_LABEL = {
  barlavento: 'Barlavento',
  sotavento: 'Sotavento',
  lateral: 'Lateral',
  especial: 'Caso especial',
};

const CE_ORIGIN_LABEL = {
  automatico: 'Automatico',
  manual: 'Manual',
  conservador: 'Conservador',
};

const CPI_ORIGIN_LABEL = {
  automatico: 'Automatico',
  manual: 'Manual',
  conservador: 'Conservador',
};

const NBR10821_TAB1 = {
  regioes: {
    1: [
      { pav: 2, z: 6, pe: 350, ps: 520, pa: 60 },
      { pav: 5, z: 15, pe: 420, ps: 640, pa: 70 },
      { pav: 10, z: 30, pe: 500, ps: 750, pa: 80 },
      { pav: 20, z: 60, pe: 600, ps: 900, pa: 100 },
      { pav: 30, z: 90, pe: 660, ps: 980, pa: 110 },
    ],
    2: [
      { pav: 2, z: 6, pe: 470, ps: 700, pa: 80 },
      { pav: 5, z: 15, pe: 580, ps: 860, pa: 100 },
      { pav: 10, z: 30, pe: 680, ps: 1030, pa: 110 },
      { pav: 20, z: 60, pe: 815, ps: 1220, pa: 140 },
      { pav: 30, z: 90, pe: 890, ps: 1340, pa: 150 },
    ],
    3: [
      { pav: 2, z: 6, pe: 610, ps: 920, pa: 100 },
      { pav: 5, z: 15, pe: 750, ps: 1130, pa: 130 },
      { pav: 10, z: 30, pe: 890, ps: 1340, pa: 150 },
      { pav: 20, z: 60, pe: 1060, ps: 1600, pa: 180 },
      { pav: 30, z: 90, pe: 1170, ps: 1750, pa: 200 },
    ],
    4: [
      { pav: 2, z: 6, pe: 770, ps: 1160, pa: 130 },
      { pav: 5, z: 15, pe: 950, ps: 1430, pa: 160 },
      { pav: 10, z: 30, pe: 1130, ps: 1700, pa: 190 },
      { pav: 20, z: 60, pe: 1350, ps: 2020, pa: 220 },
      { pav: 30, z: 90, pe: 1480, ps: 2210, pa: 250 },
    ],
    5: [
      { pav: 2, z: 6, pe: 950, ps: 1430, pa: 160 },
      { pav: 5, z: 15, pe: 1180, ps: 1760, pa: 200 },
      { pav: 10, z: 30, pe: 1400, ps: 2090, pa: 230 },
      { pav: 20, z: 60, pe: 1660, ps: 2500, pa: 280 },
      { pav: 30, z: 90, pe: 1820, ps: 2730, pa: 300 },
    ],
  }
};

const S = {
  mode: 'avancado',
  cliente: '',
  obra: '',
  local: '',
  responsavel: '',
  dataDoc: new Date().toISOString().slice(0, 10),
  revisao: 'R00',
  documento: '',
  disciplina: '',
  observacoes: '',
  criteriaAccepted: false,
  uf: 'SP',
  cidade: 'São Paulo',
  v0: 40,
  face: 'barlavento',
  direcao: '0',
  forma: 'regular',
  s1: 1.0,
  cat: 'II',
  classe: 'A',
  z: 20,
  a: 40,
  b: 20,
  grupo: 3,
  ceMode: 'auto',
  ceManual: -1.1,
  cpiMode: 'auto',
  cpiCase: 'estanque',
  cpiManual: 0,
  cpiFechada: 'sim',
  cpiAberturas: 'nao',
  cpiDominante: 'nao',
  cpiOpostas: 'nao',
  cpiDirecao: 'nao',
  vizinha: 'nao',
  sViz: 20,
  regiao10821: 3,
  zEqMode: 'auto',
  zEqManual: 20,
};

function fmt(n, dec = 2) {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtSigned(n, dec = 2) {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  const abs = Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (n >= 0 ? '+' : '−') + abs;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeMaybeMojibake(value) {
  if (!value || typeof value !== 'string') return value;
  if (!/[ÃÂâ]/.test(value)) return value;
  try {
    return new TextDecoder('utf-8').decode(Uint8Array.from(value, ch => ch.charCodeAt(0) & 0xff));
  } catch {
    return value;
  }
}

function normalizeCityData(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => ({
    uf: String(item.uf || '').trim(),
    cidade: decodeMaybeMojibake(String(item.cidade || '').trim()),
    v0: Number(item.v0 || 0),
  })).filter(item => item.uf && item.cidade && item.v0);
}

const CITY_DATA = normalizeCityData(typeof CIDADES_V0 !== 'undefined' ? CIDADES_V0 : []);
const CRITERIA_ACCEPT_SESSION_KEY = 'pressao-vento.criteriaAccepted';

function comparePt(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function getUfList() {
  return [...new Set(CITY_DATA.map(item => item.uf))].sort(comparePt);
}

function getCitiesByUf(uf) {
  return CITY_DATA.filter(item => item.uf === uf).slice().sort((a, b) => comparePt(a.cidade, b.cidade));
}

function findCity(uf, cidade) {
  return CITY_DATA.find(item => item.uf === uf && item.cidade === cidade) || null;
}

function inferRegiaoFromV0(v0) {
  const speed = Number(v0) || 0;
  if (speed <= 32.5) return 1;
  if (speed <= 37.5) return 2;
  if (speed <= 42.5) return 3;
  if (speed <= 47.5) return 4;
  return 5;
}

function calcFvFromVizinhanca(s, a, b) {
  const dstar = Math.min(b, 0.5 * Math.sqrt(a * a + b * b));
  if (!dstar) return { dstar: 0, ratio: Infinity, fv: 1.0 };
  const ratio = s / dstar;
  const fv = ratio <= 1.0 ? 1.3 : ratio >= 3.0 ? 1.0 : 1.3 + (1.0 - 1.3) * (ratio - 1.0) / 2.0;
  return { dstar, ratio, fv };
}

function getTab6Zones(hb, ab) {
  const rowIdx = hb > 1.5 ? 4 : hb > 0.5 ? 2 : 0;
  const rowLow  = TAB6[rowIdx];
  const rowHigh = TAB6[rowIdx + 1];
  const t = ab <= 1.5 ? 0 : ab >= 2 ? 1 : (ab - 1.5) / 0.5;
  const v = (i) => rowLow[i] + t * (rowHigh[i] - rowLow[i]);
  // NOTA 3: A3/B3 — a/b=1 → igual A2/B2; a/b≥2 → Ce=−0,2; interpolar
  const A2B2base = rowLow[5];
  const A3B3 = ab >= 2 ? -0.2 : ab <= 1 ? A2B2base : A2B2base + (-0.2 - A2B2base) * (ab - 1);
  return {
    wind0: [
      { id: 'A1B1', zona: 'A1/B1',         ce: v(4),  highSuction: true  },
      { id: 'A2B2', zona: 'A2/B2',         ce: v(5),  highSuction: false },
      { id: 'A3B3', zona: 'A3/B3',         ce: A3B3,  highSuction: false },
      { id: 'C0',   zona: 'C (barlavento)', ce: v(6),  highSuction: false },
      { id: 'D0',   zona: 'D (sotavento)',  ce: v(7),  highSuction: false },
    ],
    wind90: [
      { id: 'C1D1', zona: 'C1/D1',         ce: v(10), highSuction: true  },
      { id: 'C2D2', zona: 'C2/D2',         ce: v(11), highSuction: false },
      { id: 'A90',  zona: 'A (barlavento)', ce: v(8),  highSuction: false },
      { id: 'B90',  zona: 'B (sotavento)',  ce: v(9),  highSuction: false },
    ],
  };
}

function calcS2(cat, classe, z) {
  const alturas = TABELA_S2.alturas;
  const vals = TABELA_S2.valores[cat][classe];
  const zEff = Math.max(z, cat === 'V' ? 10 : 5);
  const valid = [];
  for (let i = 0; i < alturas.length; i += 1) {
    if (vals[i] !== null) valid.push({ h: alturas[i], v: vals[i] });
  }
  if (zEff <= valid[0].h) return valid[0].v;
  if (zEff >= valid[valid.length - 1].h) return valid[valid.length - 1].v;
  for (let i = 0; i < valid.length - 1; i += 1) {
    if (zEff >= valid[i].h && zEff <= valid[i + 1].h) {
      const t = (zEff - valid[i].h) / (valid[i + 1].h - valid[i].h);
      return valid[i].v + t * (valid[i + 1].v - valid[i].v);
    }
  }
  return valid[valid.length - 1].v;
}

function normalizePlanta(a, b, h) {
  const maior = Math.max(a || 0, b || 0);
  const menor = Math.max(0.0001, Math.min(a || 0, b || 0));
  const hb = h / menor;
  const ab = maior / menor;
  let faixa = 'faixa1';
  if (hb > 1.5) faixa = 'faixa3';
  else if (hb > 0.5) faixa = 'faixa2';
  return { aMaior: maior, bMenor: menor, hb, ab, faixa };
}

function inferClasseByDimensions(h, a, b) {
  const governingDimension = Math.max(Number(h) || 0, Number(a) || 0, Number(b) || 0);
  if (governingDimension <= 20) return { classe: 'A', governingDimension };
  if (governingDimension <= 50) return { classe: 'B', governingDimension };
  return { classe: 'C', governingDimension };
}

function resolveZEq() {
  return S.zEqMode === 'manual' ? S.zEqManual : S.z;
}

function interpolateLinear(a, b, t) {
  return a + (b - a) * t;
}

function interpolateNBR10821(regiao, zEq) {
  const rows = NBR10821_TAB1.regioes[regiao] || NBR10821_TAB1.regioes[3];
  if (zEq <= rows[0].z) return { ...rows[0], zEq };
  if (zEq >= rows[rows.length - 1].z) return { ...rows[rows.length - 1], zEq };
  for (let i = 0; i < rows.length - 1; i += 1) {
    const current = rows[i];
    const next = rows[i + 1];
    if (zEq >= current.z && zEq <= next.z) {
      const t = (zEq - current.z) / (next.z - current.z);
      return {
        pav: `${current.pav}–${next.pav}`,
        z: zEq,
        zEq,
        pe: interpolateLinear(current.pe, next.pe, t),
        ps: interpolateLinear(current.ps, next.ps, t),
        pa: interpolateLinear(current.pa, next.pa, t),
      };
    }
  }
  return { ...rows[rows.length - 1], zEq };
}

function getRequiredDocumentFields() {
  return [
    ['Cliente', S.cliente],
    ['Obra / Projeto', S.obra],
    ['Local da obra', S.local],
    ['Cidade', S.cidade],
    ['UF', S.uf],
    ['Responsavel tecnico', S.responsavel],
    ['Data', S.dataDoc],
    ['Revisao', S.revisao],
    ['Numero do documento', S.documento],
  ];
}

function getMissingDocumentFields() {
  return getRequiredDocumentFields().filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
}

function inferCpiScenario() {
  if (S.cpiCase === 'manual') {
    return {
      cpiCase: 'manual',
      values: [S.cpiManual],
      origin: 'manual',
      criterio: 'cpi manual informado pelo usuario.',
    };
  }
  const config = CASOS_CPI[S.cpiCase];
  if (!config || !config.valores) {
    return {
      cpiCase: 'estanque',
      values: CASOS_CPI.estanque.valores,
      origin: 'automatico',
      criterio: 'Configuracao padrao adotada.',
    };
  }
  return {
    cpiCase: S.cpiCase,
    values: config.valores,
    origin: 'automatico',
    criterio: `${config.label}.`,
  };
}

function resolveCeScenario(faixa) {
  if (S.ceMode === 'manual') {
    return {
      ce: S.ceManual,
      zona: 'manual',
      origin: 'manual',
      justificativa: 'Ce manual informado pelo usuario.',
    };
  }

  const valores = TABELA_CE[faixa].valores;
  const dirKey = S.direcao === '90' ? '_90' : '_0';
  const faceKeys = S.face === 'especial'
    ? Object.keys(valores)
    : Object.keys(valores).filter(key => key.startsWith(`${S.face}${dirKey}`) || key.startsWith(`${S.face}_`));

  let candidateKeys = faceKeys.length ? faceKeys : Object.keys(valores);
  let origin = 'automatico';
  let justificativa = 'Ce definido automaticamente para edificio regular.';

  if (S.face === 'especial') {
    origin = 'conservador';
    justificativa = 'Ce conservador adotado por falta de definicao detalhada da face analisada.';
  }
  if (S.forma === 'irregular') {
    origin = 'conservador';
    justificativa = 'Ce conservador adotado por edificacao irregular.';
    candidateKeys = Object.keys(valores).filter(key => key.startsWith(`${S.face}_`));
    if (!candidateKeys.length) candidateKeys = Object.keys(valores);
  }

  const picked = candidateKeys.reduce((best, key) => {
    const current = { key, value: valores[key] };
    if (!best) return current;
    return Math.abs(current.value) > Math.abs(best.value) ? current : best;
  }, null);

  return {
    ce: picked ? picked.value : 0,
    zona: picked ? picked.key : 'manual',
    origin,
    justificativa,
  };
}

function buildFlags(res) {
  const flags = [];
  if (S.forma === 'irregular') flags.push({ tone: 'bad', label: 'Edificacao irregular' });
  if (S.face === 'especial') flags.push({ tone: 'warn', label: 'Pior caso adotado' });
  if (res.ceOrigin === 'manual') flags.push({ tone: 'warn', label: 'Ce manual' });
  if (res.ceOrigin === 'conservador') flags.push({ tone: 'warn', label: 'Ce conservador' });
  if (res.cpiOrigin === 'manual') flags.push({ tone: 'warn', label: 'cpi manual' });
  if (res.cpiOrigin === 'conservador') flags.push({ tone: 'warn', label: 'cpi conservador' });
  flags.push({ tone: 'info', label: 'Modo tecnico completo' });
  if (getMissingDocumentFields().length) flags.push({ tone: 'bad', label: 'Documento incompleto' });
  return flags;
}

function getClasseDimensionNote(res) {
  return `Classe ${res.classeAuto} automatica pela maior dimensao da edificacao (${fmt(res.governingDimension, 1)} m).`;
}

function calculate() {
  if (!S.v0 || !S.s1) return null;

  const { aMaior, bMenor, hb, ab, faixa } = normalizePlanta(S.a, S.b, S.z);
  const classeInfo = inferClasseByDimensions(S.z, aMaior, bMenor);
  const classeAuto = classeInfo.classe;
  const s2 = calcS2(S.cat, classeAuto, S.z);
  const gd = GRUPOS_S3.find(item => item.grupo === S.grupo);
  const s3 = gd.s3;
  const s3s = 0.92 * s3;
  const vk = S.v0 * S.s1 * s2 * s3s;
  const q = 0.613 * vk * vk;
  const zEq = resolveZEq();
  const nbr10821 = interpolateNBR10821(Number(S.regiao10821), zEq);

  // Fator de vizinhança
  let fvInfo = { fv: 1.0, dstar: null, ratio: null };
  if (S.mode === 'avancado' && S.vizinha === 'sim' && S.sViz > 0) {
    fvInfo = calcFvFromVizinhanca(S.sViz, aMaior, bMenor);
  }
  const fv = fvInfo.fv;

  const ceScenario = resolveCeScenario(faixa);
  const cpiScenario = inferCpiScenario();
  const ceCandidates = [{ zona: ceScenario.zona, ce: ceScenario.ce }];
  const cpiCandidates = cpiScenario.values;

  let ceUsed = ceScenario.ce;
  let zonaUsed = ceScenario.zona;
  let cpiUsed = cpiCandidates[0] ?? 0;
  let deltaP = 0;
  let worstAbs = -Infinity;

  ceCandidates.forEach(candidate => {
    cpiCandidates.forEach(cpi => {
      const dp = (candidate.ce - cpi) * q * fv;
      const abs = Math.abs(dp);
      if (abs > worstAbs) {
        worstAbs = abs;
        deltaP = dp;
        ceUsed = candidate.ce;
        zonaUsed = candidate.zona;
        cpiUsed = cpi;
      }
    });
  });

  const pp6123 = Math.abs(deltaP);
  const pe6123 = 1.2 * pp6123;
  const ps6123 = 1.5 * pe6123;
  const pa6123 = 0.2 * pp6123;
  const peFinal = Math.max(pe6123, nbr10821.pe);
  const governs = pe6123 >= nbr10821.pe ? 'NBR 6123' : 'NBR 10821';
  const flags = buildFlags({
    ceOrigin: ceScenario.origin,
    cpiOrigin: cpiScenario.origin,
  });

  return {
    aMaior,
    bMenor,
    classeAuto,
    governingDimension: classeInfo.governingDimension,
    hb,
    ab,
    faixa,
    s2,
    s3,
    s3s,
    vk,
    q,
    ce: ceUsed,
    zona: zonaUsed,
    ceOrigin: ceScenario.origin,
    ceJustificativa: ceScenario.justificativa,
    cpiCase: cpiScenario.cpiCase,
    cpiUsed,
    cpiOrigin: cpiScenario.origin,
    cpiCriterio: cpiScenario.criterio,
    dp: deltaP,
    pp6123,
    pe6123,
    ps6123,
    pa6123,
    nbr10821,
    peFinal,
    governs,
    fvUsed: fv,
    fvInfo,
    zones: getTab6Zones(hb, ab),
    efs: Math.min(0.2 * bMenor, S.z),
    faceLabel: FACE_LABEL[S.face] || 'Face analisada',
    direcaoLabel: S.direcao === '90' ? 'vento a 90 graus' : 'vento a 0 grau',
    formaLabel: S.forma === 'irregular' ? 'Irregular' : 'Regular',
    modeLabel: S.mode === 'avancado' ? 'Avancado' : 'Simplificado',
    flags,
  };
}

function renderZonesTable(res) {
  const { zones, q, fvUsed, cpiUsed, efs } = res;
  const allZones = [...zones.wind0, ...zones.wind90];
  let worstAbs = 0;
  let worstId = '';
  allZones.forEach(z => {
    const dp = Math.abs((z.ce - cpiUsed) * q * fvUsed);
    if (dp > worstAbs) { worstAbs = dp; worstId = z.id; }
  });

  function rows(arr) {
    return arr.map(z => {
      const dp = Math.abs((z.ce - cpiUsed) * q * fvUsed);
      const govern = z.id === worstId;
      const tag = z.highSuction ? '<span class="zone-tag">alta sucção</span>' : '';
      return `<tr class="${govern ? 'zone-govern' : ''}">
        <td>${z.zona} ${tag}</td>
        <td>${fmtSigned(z.ce, 2)}</td>
        <td>${fmt(cpiUsed, 2)}</td>
        <td>${fmt(dp, 0)} Pa${govern ? ' ◀' : ''}</td>
      </tr>`;
    }).join('');
  }

  const tableStyle = 'style="margin-top:8px"';
  return `
    <table class="zone-table">
      <thead>
        <tr><th colspan="4">Vento 0°</th></tr>
        <tr><th>Zona</th><th>Ce</th><th>cpi</th><th>|Δp|</th></tr>
      </thead>
      <tbody>${rows(zones.wind0)}</tbody>
    </table>
    <table class="zone-table" ${tableStyle}>
      <thead>
        <tr><th colspan="4">Vento 90°</th></tr>
        <tr><th>Zona</th><th>Ce</th><th>cpi</th><th>|Δp|</th></tr>
      </thead>
      <tbody>${rows(zones.wind90)}</tbody>
    </table>
    <p class="note" style="margin-top:8px">Esquadrias a menos de <strong>${fmt(efs, 1)} m</strong> da quina do prédio usam cpe médio (zona hachurada = alta sucção). Esquadrias mais afastadas usam Ce da zona geral.</p>`;
}

function setupSeg(id, callback) {
  document.getElementById(id).querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById(id).querySelectorAll('button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      callback(button.dataset.val);
    });
  });
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function toggleByMode() {
  document.querySelectorAll('.advanced-only').forEach(node => {
    node.hidden = false;
  });
  const ceManualRow = document.getElementById('ce-manual-row');
  const cpiManualRow = document.getElementById('cpi-manual-row');
  const vizSRow = document.getElementById('viz-s-row');
  const vizDerivedRow = document.getElementById('viz-derived-row');
  ceManualRow.style.display = S.ceMode === 'manual' ? '' : 'none';
  cpiManualRow.style.display = S.cpiCase === 'manual' ? '' : 'none';
  if (vizSRow) vizSRow.style.display = S.vizinha === 'sim' ? '' : 'none';
  if (vizDerivedRow) vizDerivedRow.style.display = S.vizinha === 'sim' ? '' : 'none';
}

function syncSegment(id, value) {
  const root = document.getElementById(id);
  if (!root) return;
  root.querySelectorAll('button').forEach(button => {
    button.classList.toggle('active', button.dataset.val === value);
  });
}

function renderUfOptions() {
  const select = document.getElementById('sel-uf');
  select.innerHTML = '<option value="">— selecione a UF —</option>';
  getUfList().forEach(uf => {
    const option = document.createElement('option');
    option.value = uf;
    option.textContent = uf;
    if (uf === S.uf) option.selected = true;
    select.appendChild(option);
  });
}

function renderCityOptions() {
  const select = document.getElementById('sel-cidade');
  select.innerHTML = '<option value="">— selecione a cidade —</option>';
  getCitiesByUf(S.uf).forEach(item => {
    const option = document.createElement('option');
    option.value = item.cidade;
    option.textContent = `${item.cidade} (${item.v0} m/s)`;
    if (item.cidade === S.cidade) option.selected = true;
    select.appendChild(option);
  });
}

function updateUI() {
  const res = calculate();
  if (!res) return;
  const { bm, p } = PARAMETROS_S2[S.cat][res.classeAuto];
  const fr = FR[res.classeAuto];

  toggleByMode();

  const missingDoc = getMissingDocumentFields();
  const docWarning = document.getElementById('doc-warning');
  const shapeWarning = document.getElementById('shape-warning');
  if (docWarning) {
    docWarning.classList.toggle('visible', Boolean(missingDoc.length));
    if (missingDoc.length) {
      docWarning.querySelector('span').textContent = `Preencha os campos obrigatorios para o memorial: ${missingDoc.join(', ')}.`;
    }
  }
  shapeWarning.classList.toggle('visible', S.forma === 'irregular');
  const criteriaHint = document.getElementById('criteria-hint');
  if (criteriaHint) {
    criteriaHint.textContent = S.criteriaAccepted
      ? 'Aceite registrado. O Memorial / PDF está liberado.'
      : 'Marque o aceite para liberar o Memorial / PDF.';
    criteriaHint.classList.toggle('ok', Boolean(S.criteriaAccepted));
  }
  const lockWrap = document.getElementById('calc-lock-wrap');
  if (lockWrap) lockWrap.classList.toggle('locked', !S.criteriaAccepted);
  const criteriaInput = document.getElementById('inp-criteria-accept');
  if (criteriaInput) criteriaInput.checked = Boolean(S.criteriaAccepted);
  const reportButton = document.getElementById('btn-report');
  if (reportButton) {
    reportButton.disabled = !S.criteriaAccepted;
    reportButton.title = S.criteriaAccepted ? '' : 'Marque o aceite dos critérios e limitações para liberar o memorial.';
  }

  document.getElementById('sel-cpi').value = res.cpiCase;
  document.getElementById('sel-regiao10821').value = String(S.regiao10821);
  syncSegment('seg-forma', S.forma);
  syncSegment('seg-ce-mode', S.ceMode);
  syncSegment('seg-vizinha', S.vizinha);
  syncSegment('seg-classe', res.classeAuto);

  document.getElementById('disp-s2').textContent = fmt(res.s2, 3);
  document.getElementById('disp-s2-params').textContent = `${getClasseDimensionNote(res)} · bm=${fmt(bm,2)} · Fr=${fmt(fr,2)} · p=${p}`;
  document.getElementById('disp-s3').textContent = fmt(res.s3, 2);
  document.getElementById('disp-s3s').textContent = fmt(res.s3s, 4);
  document.getElementById('disp-hb').textContent = fmt(res.hb, 2);
  document.getElementById('disp-ab').textContent = fmt(res.ab, 2);
  document.getElementById('disp-faixa').textContent = TABELA_CE[res.faixa].label;
  document.getElementById('disp-ce').textContent = fmtSigned(res.ce, 2);
  document.getElementById('disp-ce-zona').textContent = ZONA_LABEL[res.zona] || 'Manual';
  setText('disp-ce-origin', CE_ORIGIN_LABEL[res.ceOrigin] || 'Automatico');
  setText('disp-ce-just', res.ceJustificativa);
  setText('disp-zeq', `${fmt(res.nbr10821.zEq, 1)} m`);
  setText('disp-pe10821', `${fmt(res.nbr10821.pe, 0)} Pa`);
  setText('disp-ps10821', `${fmt(res.nbr10821.ps, 0)} Pa`);
  setText('disp-pa10821', `${fmt(res.nbr10821.pa, 0)} Pa`);
  setText('disp-h-ref', `${fmt(S.z,1)} m`);
  setText('disp-face', res.faceLabel);
  setText('disp-direcao-helper', `Direcao analisada: ${res.direcaoLabel}. Forma: ${res.formaLabel}.`);
  setText('disp-geom', `h = ${fmt(S.z,1)} m | a = ${fmt(res.aMaior,1)} m | b = ${fmt(res.bMenor,1)} m`);
  setText('disp-geom-ratio', `h/b = ${fmt(res.hb,2)} | a/b = ${fmt(res.ab,2)}`);
  setText('disp-cpi-adotado', `${fmt(res.cpiUsed,2)} | ${CASOS_CPI[res.cpiCase]?.label || 'Manual'}`);
  setText('disp-cpi-criterio', `${CPI_ORIGIN_LABEL[res.cpiOrigin] || 'Automatico'}: ${res.cpiCriterio}`);
  setText('disp-mode', 'Modo tecnico completo');

  document.getElementById('disp-vk').textContent = fmt(res.vk, 1);
  document.getElementById('disp-q').textContent = fmt(res.q, 0);
  document.getElementById('disp-pp6123').textContent = fmt(res.pp6123, 0);
  document.getElementById('disp-pe6123').textContent = fmt(res.pe6123, 0);
  document.getElementById('disp-ps6123').textContent = fmt(res.ps6123, 0);
  document.getElementById('disp-pa6123').textContent = fmt(res.pa6123, 0);
  document.getElementById('disp-pe6123-sub').textContent = `|Δp| — ${ZONA_LABEL[res.zona] || 'Manual'} · cpi = ${fmt(res.cpiUsed, 2)}`;
  document.getElementById('disp-pe10821-res').textContent = fmt(res.nbr10821.pe, 0);
  document.getElementById('disp-ps10821-res').textContent = fmt(res.nbr10821.ps, 0);
  document.getElementById('disp-pa10821-res').textContent = fmt(res.nbr10821.pa, 0);
  document.getElementById('disp-pe-final').textContent = fmt(res.peFinal, 0);
  document.getElementById('disp-pe-gov').textContent = `Pe recomendado = máx(${fmt(res.pe6123,0)}, ${fmt(res.nbr10821.pe,0)}) Pa — governa: ${res.governs}`;
  document.getElementById('disp-pe-badge').textContent = res.governs;

  // fv derived display (vizinhança)
  setText('disp-dstar',   res.fvInfo.dstar  !== null ? `${fmt(res.fvInfo.dstar, 1)} m` : '—');
  setText('disp-sdstar',  res.fvInfo.ratio  !== null ? fmt(res.fvInfo.ratio, 2)         : '—');
  setText('disp-fv-calc', fmt(res.fvUsed, 2));

  // Zones table
  const zonesEl = document.getElementById('zones-table-container');
  if (zonesEl) zonesEl.innerHTML = renderZonesTable(res);

  setText('sum-forma', `${res.formaLabel} | ${res.faceLabel}`);
  setText('sum-ce', `${fmtSigned(res.ce,2)} | ${CE_ORIGIN_LABEL[res.ceOrigin]}`);
  setText('sum-cpi', `${fmt(res.cpiUsed,2)} | ${CPI_ORIGIN_LABEL[res.cpiOrigin]}`);
  setText('sum-govern', `${fmt(res.peFinal,0)} Pa | ${res.governs}`);
  const flagsNode = document.getElementById('summary-flags');
  if (flagsNode) flagsNode.innerHTML = res.flags.map(flag => `<span class="flag-pill ${flag.tone}">${flag.label}</span>`).join('');

  const chainText =
    `Vk = V₀ × S₁ × S₂ × S₃*\n` +
    `   = ${fmt(S.v0,1)} × ${fmt(S.s1,2)} × ${fmt(res.s2,3)} × ${fmt(res.s3s,4)}\n` +
    `   = ${fmt(res.vk,2)} m/s\n\n` +
    `q = 0,613 × Vk²\n` +
    `  = 0,613 × ${fmt(res.vk,2)}²\n` +
    `  = ${fmt(res.q,0)} Pa\n\n` +
    `Δp = (Ce − cpi) × q × fv\n` +
    `   = (${fmtSigned(res.ce,2)} − ${fmt(res.cpiUsed,2)}) × ${fmt(res.q,0)} × ${fmt(res.fvUsed,2)}\n` +
    `   = ${fmt(res.dp,0)} Pa\n\n` +
    `Pp = |Δp| = ${fmt(res.pp6123,0)} Pa\n` +
    `Pe = 1,2 × Pp = ${fmt(res.pe6123,0)} Pa\n` +
    `Ps = 1,5 × Pe = ${fmt(res.ps6123,0)} Pa\n` +
    `Pa = 0,2 × Pp = ${fmt(res.pa6123,0)} Pa\n\n` +
    `Ce (${CE_ORIGIN_LABEL[res.ceOrigin]}) = ${fmtSigned(res.ce,2)}\n` +
    `cpi (${CPI_ORIGIN_LABEL[res.cpiOrigin]}) = ${fmt(res.cpiUsed,2)}\n` +
    `Forma = ${res.formaLabel}\n` +
    `Pe final = ${fmt(res.peFinal,0)} Pa`;
  document.getElementById('chain-display').textContent = chainText;
}

function printReport() {
  const res = calculate();
  if (!res) return;
  buildReportBody(res);
  const reportHtml = document.getElementById('report-body').innerHTML;
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '-9999px';
  frame.style.bottom = '0';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatorio - Pressao de Vento</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;padding:12px 14px;font-family:'DM Sans',sans-serif;color:#111827;background:#fff;font-size:11px;line-height:1.28}input,textarea{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#111827;background:transparent;width:100%;padding:0}table{page-break-inside:auto}tr,td{break-inside:avoid}@page{margin:8mm 10mm}</style></head><body>${reportHtml}</body></html>`);
  doc.close();
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 400);
  };
}

function buildReportBody(res) {
  const autoNotes = [
    'Os valores de V0 obtidos por cidade são indicativos e devem ser confirmados no mapa oficial da NBR 6123.',
    'Este relatório depende da correta caracterização da obra e das hipóteses adotadas.',
  ];
  if (S.forma === 'irregular') autoNotes.push('Edificações irregulares podem demandar avaliação específica e coeficientes conservadores ou manuais.');
  if (res.ceOrigin !== 'automatico' || res.cpiOrigin !== 'automatico') autoNotes.push('Coeficientes manuais ou conservadores foram adotados e devem ser validados pelo responsável técnico.');
  autoNotes.push('A região de comparação com a NBR 10821 deve ser confirmada pelo responsável técnico antes da emissão final.');
  if (getMissingDocumentFields().length) autoNotes.push('Memorial emitido com identificacao documental incompleta.');

  document.getElementById('report-body').innerHTML = `
    <div class="rp-header">
      <div>
        <div class="rp-title">MEMORIAL DE CALCULO<br>DETERMINACAO DAS PRESSOES DEVIDO AO VENTO</div>
        <div class="rp-sub">Normas utilizadas: ABNT NBR 6123:2023 e ABNT NBR 10821</div>
      </div>
      <div class="rp-meta">Documento: ${escapeHtml(S.documento)}<br>Revisao: ${escapeHtml(S.revisao)}<br>Data: ${escapeHtml(S.dataDoc)}</div>
    </div>

    <div class="rp-section">Cabecalho</div>
    <table class="rp-table">
      <tr><td class="rp-k">Cliente</td><td class="rp-v">${escapeHtml(S.cliente)}</td></tr>
      <tr><td class="rp-k">Obra / Projeto</td><td class="rp-v">${escapeHtml(S.obra)}</td></tr>
      <tr><td class="rp-k">Local da obra</td><td class="rp-v">${escapeHtml(S.local)}</td></tr>
      <tr><td class="rp-k">Cidade / UF</td><td class="rp-v">${escapeHtml(S.cidade)} / ${escapeHtml(S.uf)}</td></tr>
      <tr><td class="rp-k">Responsavel tecnico</td><td class="rp-v">${escapeHtml(S.responsavel)}</td></tr>
      <tr><td class="rp-k">Disciplina</td><td class="rp-v">${escapeHtml(S.disciplina || 'Nao informada')}</td></tr>
      <tr><td class="rp-k">Observacoes gerais</td><td class="rp-v">${escapeHtml(S.observacoes || 'Sem observacoes adicionais.')}</td></tr>
    </table>

    <div class="rp-section">Identificacao da obra</div>
    <table class="rp-table">
      <tr><td class="rp-k">Face analisada</td><td class="rp-v">${escapeHtml(res.faceLabel)}</td></tr>
      <tr><td class="rp-k">Direcao do vento</td><td class="rp-v">${escapeHtml(res.direcaoLabel)}</td></tr>
      <tr><td class="rp-k">Forma da edificacao</td><td class="rp-v">${escapeHtml(res.formaLabel)}</td></tr>
      <tr><td class="rp-k">Cidade / UF</td><td class="rp-v">${escapeHtml(S.cidade)} / ${escapeHtml(S.uf)}</td></tr>
      <tr><td class="rp-k">Altura h</td><td class="rp-v">${fmt(S.z,1)} m</td></tr>
      <tr><td class="rp-k">Lado maior a</td><td class="rp-v">${fmt(res.aMaior,2)} m</td></tr>
      <tr><td class="rp-k">Lado menor b</td><td class="rp-v">${fmt(res.bMenor,2)} m</td></tr>
    </table>

    <div class="rp-section">Hipoteses adotadas</div>
    <table class="rp-table">
      <tr><td class="rp-k">Modo de calculo</td><td class="rp-v">${escapeHtml(res.modeLabel)}</td></tr>
      <tr><td class="rp-k">Topografia / S1</td><td class="rp-v">${fmt(S.s1,2)}</td></tr>
      <tr><td class="rp-k">Categoria / Classe</td><td class="rp-v">${escapeHtml(S.cat)} / ${escapeHtml(res.classeAuto)} (${escapeHtml(getClasseDimensionNote(res))})</td></tr>
      <tr><td class="rp-k">Grupo estatistico / S3</td><td class="rp-v">${escapeHtml(String(S.grupo))} / ${fmt(res.s3,2)}</td></tr>
      <tr><td class="rp-k">Regiao sugerida de comparacao</td><td class="rp-v">${escapeHtml(String(S.regiao10821))}</td></tr>
      <tr><td class="rp-k">Condicao de permeabilidade</td><td class="rp-v">${escapeHtml(CASOS_CPI[res.cpiCase]?.label || 'Manual')}</td></tr>
      <tr><td class="rp-k">Fator de vizinhanca fv</td><td class="rp-v">${fmt(res.fvUsed,2)}${res.fvInfo.dstar !== null ? ` (d*=${fmt(res.fvInfo.dstar,1)} m, s/d*=${fmt(res.fvInfo.ratio,2)})` : ' (edificacao isolada)'}</td></tr>
      <tr><td class="rp-k">Ce adotado</td><td class="rp-v">${fmtSigned(res.ce,2)} (${escapeHtml(CE_ORIGIN_LABEL[res.ceOrigin])})</td></tr>
      <tr><td class="rp-k">Justificativa do Ce</td><td class="rp-v">${escapeHtml(res.ceJustificativa)}</td></tr>
      <tr><td class="rp-k">cpi adotado</td><td class="rp-v">${fmt(res.cpiUsed,2)} (${escapeHtml(CPI_ORIGIN_LABEL[res.cpiOrigin])})</td></tr>
      <tr><td class="rp-k">Criterio do cpi</td><td class="rp-v">${escapeHtml(res.cpiCriterio)}</td></tr>
    </table>

    <div class="rp-section">Calculo pela NBR 6123</div>
    <table class="rp-table">
      <tr><td class="rp-k">V0</td><td class="rp-v">${fmt(S.v0,0)} m/s</td></tr>
      <tr><td class="rp-k">S1</td><td class="rp-v">${fmt(S.s1,2)}</td></tr>
      <tr><td class="rp-k">S2</td><td class="rp-v">${fmt(res.s2,3)}</td></tr>
      <tr><td class="rp-k">S3 / S3*</td><td class="rp-v">${fmt(res.s3,2)} / ${fmt(res.s3s,4)}</td></tr>
      <tr><td class="rp-k">Vk</td><td class="rp-v">${fmt(res.vk,2)} m/s</td></tr>
      <tr><td class="rp-k">q</td><td class="rp-v">${fmt(res.q,0)} Pa</td></tr>
      <tr><td class="rp-k">Ce</td><td class="rp-v">${fmtSigned(res.ce,2)}</td></tr>
      <tr><td class="rp-k">cpi</td><td class="rp-v">${fmt(res.cpiUsed,2)}</td></tr>
      <tr><td class="rp-k">fv</td><td class="rp-v">${fmt(res.fvUsed,2)}</td></tr>
      <tr><td class="rp-k">Delta p / pressao efetiva</td><td class="rp-v">${fmt(res.dp,0)} Pa</td></tr>
      <tr><td class="rp-k">Pp</td><td class="rp-v">${fmt(res.pp6123,0)} Pa</td></tr>
      <tr><td class="rp-k">Pe</td><td class="rp-v">${fmt(res.pe6123,0)} Pa</td></tr>
      <tr><td class="rp-k">Ps</td><td class="rp-v">${fmt(res.ps6123,0)} Pa</td></tr>
      <tr><td class="rp-k">Pa</td><td class="rp-v">${fmt(res.pa6123,0)} Pa</td></tr>
    </table>

    <div class="rp-section">Comparacao com a NBR 10821</div>
    <table class="rp-table">
      <tr><td class="rp-k">Regiao</td><td class="rp-v">${escapeHtml(String(S.regiao10821))}</td></tr>
      <tr><td class="rp-k">z.eq</td><td class="rp-v">${fmt(res.nbr10821.zEq,1)} m</td></tr>
      <tr><td class="rp-k">Pe 10821</td><td class="rp-v">${fmt(res.nbr10821.pe,0)} Pa</td></tr>
      <tr><td class="rp-k">Ps 10821</td><td class="rp-v">${fmt(res.nbr10821.ps,0)} Pa</td></tr>
      <tr><td class="rp-k">Pa 10821</td><td class="rp-v">${fmt(res.nbr10821.pa,0)} Pa</td></tr>
      <tr><td class="rp-k">Comparacao</td><td class="rp-v">Pe final = max(${fmt(res.pe6123,0)}; ${fmt(res.nbr10821.pe,0)})</td></tr>
    </table>

    <div class="rp-section">Resultado final</div>
    <div class="rp-result-big">
      <div class="rp-result-icon">Pe</div>
      <div>
        <div class="rp-result-title">Pressao de ensaio recomendada = ${fmt(res.peFinal,0)} Pa</div>
        <div class="rp-result-sub">Criterio governante: <strong>${escapeHtml(res.governs)}</strong> | Ce: ${escapeHtml(CE_ORIGIN_LABEL[res.ceOrigin])} | cpi: ${escapeHtml(CPI_ORIGIN_LABEL[res.cpiOrigin])}</div>
      </div>
    </div>
    <div class="rp-section">Observacoes e responsabilidade tecnica</div>
    <table class="rp-table">
      <tr><td class="rp-k">Responsabilidade</td><td class="rp-v">A especificacao final depende da validacao tecnica do responsavel pelo projeto.</td></tr>
    </table>

    <div class="rp-norma">
      ${autoNotes.map(note => `• ${escapeHtml(note)}`).join('<br>')}
    </div>
  `;
}

function openReport() {
  const res = calculate();
  if (!res) {
    alert('Preencha os parâmetros para gerar o relatório.');
    return;
  }
  if (!S.criteriaAccepted) {
    alert('Marque o aceite dos critérios e limitações para liberar o Memorial / PDF.');
    return;
  }
  buildReportBody(res);
  document.getElementById('reportOverlay').classList.add('active');
  document.getElementById('reportOverlay').scrollTop = 0;
}

function init() {
  try {
    S.criteriaAccepted = sessionStorage.getItem(CRITERIA_ACCEPT_SESSION_KEY) === '1';
  } catch (error) {
    S.criteriaAccepted = false;
  }
  renderUfOptions();
  renderCityOptions();

  const city = findCity(S.uf, S.cidade);
  if (city) {
    S.v0 = city.v0;
    S.regiao10821 = inferRegiaoFromV0(city.v0);
    document.getElementById('inp-v0').value = city.v0;
  }

  [
    ['inp-cliente', 'cliente'],
    ['inp-obra', 'obra'],
    ['inp-local', 'local'],
    ['inp-responsavel', 'responsavel'],
    ['inp-data-doc', 'dataDoc'],
    ['inp-revisao', 'revisao'],
    ['inp-documento', 'documento'],
    ['inp-disciplina', 'disciplina'],
    ['inp-observacoes', 'observacoes'],
  ].forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = S[key] || '';
    el.addEventListener('input', event => {
      S[key] = event.target.value;
      updateUI();
    });
  });

  document.getElementById('sel-face').value = S.face;
  document.getElementById('sel-direcao').value = S.direcao;
  document.getElementById('sel-cpi').value = S.cpiCase;

  document.getElementById('sel-uf').addEventListener('change', event => {
    S.uf = event.target.value;
    const firstCity = getCitiesByUf(S.uf)[0] || null;
    S.cidade = firstCity ? firstCity.cidade : '';
    if (firstCity) {
      S.v0 = firstCity.v0;
      S.regiao10821 = inferRegiaoFromV0(firstCity.v0);
      document.getElementById('inp-v0').value = firstCity.v0;
    }
    renderCityOptions();
    updateUI();
  });

  document.getElementById('sel-cidade').addEventListener('change', event => {
    S.cidade = event.target.value;
    const cityData = findCity(S.uf, S.cidade);
    if (cityData) {
      S.v0 = cityData.v0;
      S.regiao10821 = inferRegiaoFromV0(cityData.v0);
      document.getElementById('inp-v0').value = cityData.v0;
    }
    updateUI();
  });

  document.getElementById('inp-v0').addEventListener('input', event => {
    S.v0 = parseFloat(event.target.value) || 0;
    updateUI();
  });

  document.getElementById('sel-face').addEventListener('change', event => {
    S.face = event.target.value;
    updateUI();
  });
  document.getElementById('sel-direcao').addEventListener('change', event => {
    S.direcao = event.target.value;
    updateUI();
  });
  setupSeg('seg-forma', value => {
    S.forma = value;
    updateUI();
  });

  setupSeg('seg-s1', value => {
    document.getElementById('s1-manual-row').style.display = value === 'manual' ? '' : 'none';
    S.s1 = value === 'manual' ? parseFloat(document.getElementById('inp-s1').value) || 1.0 : parseFloat(value);
    updateUI();
  });
  document.getElementById('inp-s1').addEventListener('input', event => {
    S.s1 = parseFloat(event.target.value) || 1.0;
    updateUI();
  });

  document.getElementById('sel-cat').addEventListener('change', event => {
    S.cat = event.target.value;
    updateUI();
  });
  document.getElementById('inp-z').addEventListener('input', event => {
    S.z = parseFloat(event.target.value) || 5;
    updateUI();
  });
  document.getElementById('sel-grupo').addEventListener('change', event => {
    S.grupo = parseInt(event.target.value, 10);
    updateUI();
  });

  document.getElementById('inp-a').addEventListener('input', event => {
    S.a = parseFloat(event.target.value) || 0;
    updateUI();
  });
  document.getElementById('inp-b').addEventListener('input', event => {
    S.b = parseFloat(event.target.value) || 0;
    updateUI();
  });

  setupSeg('seg-ce-mode', value => {
    S.ceMode = value;
    document.getElementById('ce-manual-row').style.display = value === 'manual' ? '' : 'none';
    updateUI();
  });
  document.getElementById('inp-ce').addEventListener('input', event => {
    S.ceManual = parseFloat(event.target.value);
    if (Number.isNaN(S.ceManual)) S.ceManual = 0;
    updateUI();
  });

  document.getElementById('sel-cpi').addEventListener('change', event => {
    S.cpiCase = event.target.value;
    document.getElementById('cpi-manual-row').style.display = event.target.value === 'manual' ? '' : 'none';
    if (event.target.value !== 'manual') S.cpiMode = 'auto';
    updateUI();
  });
  document.getElementById('inp-cpi').addEventListener('input', event => {
    S.cpiManual = parseFloat(event.target.value) || 0;
    updateUI();
  });

  setupSeg('seg-vizinha', value => {
    S.vizinha = value;
    const show = value === 'sim';
    document.getElementById('viz-s-row').style.display = show ? '' : 'none';
    document.getElementById('viz-derived-row').style.display = show ? '' : 'none';
    updateUI();
  });
  document.getElementById('inp-s-viz').addEventListener('input', event => {
    S.sViz = parseFloat(event.target.value) || 0;
    updateUI();
  });

  document.getElementById('sel-regiao10821').addEventListener('change', event => {
    S.regiao10821 = parseInt(event.target.value, 10);
    updateUI();
  });
  const criteriaAccept = document.getElementById('inp-criteria-accept');
  if (criteriaAccept) {
    criteriaAccept.checked = Boolean(S.criteriaAccepted);
    criteriaAccept.addEventListener('change', event => {
      S.criteriaAccepted = event.target.checked;
      try {
        sessionStorage.setItem(CRITERIA_ACCEPT_SESSION_KEY, S.criteriaAccepted ? '1' : '0');
      } catch (error) {
        // no-op
      }
      updateUI();
    });
  }
  document.getElementById('btn-report').addEventListener('click', openReport);
  document.getElementById('btn-close-report').addEventListener('click', () => {
    document.getElementById('reportOverlay').classList.remove('active');
  });
  document.getElementById('btn-print').addEventListener('click', printReport);

  document.getElementById('sel-uf').value = S.uf;
  renderCityOptions();
  document.getElementById('sel-cidade').value = S.cidade;
  document.getElementById('sel-face').value = S.face;
  document.getElementById('sel-direcao').value = S.direcao;
  document.getElementById('sel-cat').value = S.cat;
  document.getElementById('sel-grupo').value = String(S.grupo);
  document.getElementById('inp-z').value = S.z;
  document.getElementById('inp-a').value = S.a;
  document.getElementById('inp-b').value = S.b;
  document.getElementById('sel-regiao10821').value = String(S.regiao10821);
  document.getElementById('sel-cpi').value = S.cpiCase;
  document.getElementById('inp-cpi').value = S.cpiManual;

  updateUI();
}

document.addEventListener('DOMContentLoaded', init);
