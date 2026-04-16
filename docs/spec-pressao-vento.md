# Spec — Calculadora de Pressão de Vento NBR 6123:2023

## Objetivo

Calcular a pressão efetiva de vento sobre **elementos de vedação** (esquadrias, vidros, painéis) conforme a NBR 6123:2023, comparar com o mínimo da NBR 10821 Tabela 1, e retornar o maior valor como pressão de ensaio recomendada (Pe).

## Referência de estilo

Usar como base visual e estrutural o app existente em `apps/vidro-laminado/index.html`. Mesmo stack, mesma paleta, mesmo padrão de layout. Não copiar a lógica de cálculo — apenas o padrão visual e de interação.

## Fluxo de cálculo conforme a norma

```
Vk = V0 × S1 × S2 × S3*
q  = 0,613 × Vk²           (N/m², com Vk em m/s)
Δp = (cpe − cpi) × q       (pressão efetiva no elemento)
Pe = |Δp|
```

*Para vedações: S3* = 0,92 × S3 (NOTA da Tabela 4 da NBR 6123:2023)

---

## Parâmetro 1 — V0 (Velocidade básica do vento)

Rajada de 3s, a 10m, Categoria II, recorrência 50 anos. Valores das isopletas da Figura 1 da norma.

Dropdown com cidades + input numérico editável. Nota visível: "V0 deve ser confirmado na Figura 1 da NBR 6123."

### Cidades e valores V0 (m/s)

```javascript
const CIDADES_V0 = [
  // Região Sul
  { uf: "RS", cidade: "Porto Alegre", v0: 45 },
  { uf: "RS", cidade: "Pelotas", v0: 50 },
  { uf: "RS", cidade: "Santa Maria", v0: 50 },
  { uf: "RS", cidade: "Uruguaiana", v0: 55 },
  { uf: "RS", cidade: "Bagé", v0: 50 },
  { uf: "RS", cidade: "Caxias do Sul", v0: 50 },
  { uf: "SC", cidade: "Florianópolis", v0: 45 },
  { uf: "SC", cidade: "Joinville", v0: 45 },
  { uf: "SC", cidade: "Chapecó", v0: 50 },
  { uf: "SC", cidade: "Criciúma", v0: 45 },
  { uf: "PR", cidade: "Curitiba", v0: 45 },
  { uf: "PR", cidade: "Londrina", v0: 45 },
  { uf: "PR", cidade: "Foz do Iguaçu", v0: 50 },
  { uf: "PR", cidade: "Maringá", v0: 45 },
  { uf: "PR", cidade: "Cascavel", v0: 50 },
  // Região Sudeste
  { uf: "SP", cidade: "São Paulo", v0: 40 },
  { uf: "SP", cidade: "Campinas", v0: 40 },
  { uf: "SP", cidade: "Santos", v0: 45 },
  { uf: "SP", cidade: "São José dos Campos", v0: 40 },
  { uf: "SP", cidade: "Ribeirão Preto", v0: 40 },
  { uf: "SP", cidade: "Pirassununga", v0: 40 },
  { uf: "SP", cidade: "Taubaté", v0: 40 },
  { uf: "RJ", cidade: "Rio de Janeiro", v0: 35 },
  { uf: "RJ", cidade: "Niterói", v0: 35 },
  { uf: "MG", cidade: "Belo Horizonte", v0: 35 },
  { uf: "MG", cidade: "Uberlândia", v0: 35 },
  { uf: "MG", cidade: "Juiz de Fora", v0: 35 },
  { uf: "ES", cidade: "Vitória", v0: 35 },
  // Região Centro-Oeste
  { uf: "DF", cidade: "Brasília", v0: 35 },
  { uf: "GO", cidade: "Goiânia", v0: 35 },
  { uf: "GO", cidade: "Anápolis", v0: 35 },
  { uf: "MS", cidade: "Campo Grande", v0: 40 },
  { uf: "MS", cidade: "Ponta Porã", v0: 45 },
  { uf: "MT", cidade: "Cuiabá", v0: 35 },
  // Região Nordeste
  { uf: "BA", cidade: "Salvador", v0: 35 },
  { uf: "BA", cidade: "Caravelas", v0: 30 },
  { uf: "PE", cidade: "Recife", v0: 35 },
  { uf: "CE", cidade: "Fortaleza", v0: 35 },
  { uf: "RN", cidade: "Natal", v0: 35 },
  { uf: "AL", cidade: "Maceió", v0: 35 },
  { uf: "MA", cidade: "São Luís", v0: 35 },
  { uf: "PI", cidade: "Teresina", v0: 35 },
  { uf: "PI", cidade: "Parnaíba", v0: 35 },
  { uf: "SE", cidade: "Aracaju", v0: 35 },
  { uf: "PB", cidade: "João Pessoa", v0: 35 },
  // Região Norte
  { uf: "AM", cidade: "Manaus", v0: 30 },
  { uf: "PA", cidade: "Belém", v0: 35 },
  { uf: "PA", cidade: "Santarém", v0: 30 },
  { uf: "RR", cidade: "Boa Vista", v0: 30 },
  { uf: "AC", cidade: "Rio Branco", v0: 30 },
  { uf: "RO", cidade: "Porto Velho", v0: 30 },
  { uf: "TO", cidade: "Palmas", v0: 30 },
  { uf: "AP", cidade: "Macapá", v0: 30 },
  // Ilhas
  { uf: "PE", cidade: "Fernando de Noronha", v0: 30 },
];
```

**NOTA:** Estes valores são aproximações das isopletas. O app deve exibir aviso para o usuário confirmar V0 na Figura 1 da norma original.

---

## Parâmetro 2 — S1 (Fator topográfico)

Seção 5.2 da NBR 6123:2023.

### Implementação

Três opções rápidas:
- **Terreno plano:** S1 = 1,0
- **Vale protegido:** S1 = 0,9
- **Manual:** input numérico livre

A fórmula da encosta/morro (S1(z) com θt, dt, z) NÃO é automatizada — requer geometria específica. Para quem precisa, usa o input manual.

---

## Parâmetro 3 — S2 (Rugosidade × Classe × Altura)

Seção 5.3 da NBR 6123:2023. Fórmula: `S2 = bm × Fr × (z/10)^p`

### 3a — Categorias de rugosidade (Tabela 1)

```javascript
const PARAMETROS_S2 = {
  I:   { zg: 250, A: { bm: 1.10, p: 0.060 }, B: { bm: 1.11, p: 0.065 }, C: { bm: 1.12, p: 0.070 } },
  II:  { zg: 300, A: { bm: 1.00, p: 0.085 }, B: { bm: 1.00, p: 0.090 }, C: { bm: 1.00, p: 0.100 } },
  III: { zg: 350, A: { bm: 0.94, p: 0.100 }, B: { bm: 0.94, p: 0.105 }, C: { bm: 0.93, p: 0.115 } },
  IV:  { zg: 420, A: { bm: 0.86, p: 0.120 }, B: { bm: 0.85, p: 0.125 }, C: { bm: 0.84, p: 0.135 } },
  V:   { zg: 500, A: { bm: 0.74, p: 0.150 }, B: { bm: 0.73, p: 0.160 }, C: { bm: 0.71, p: 0.175 } },
};
```

Descrições para o dropdown:
- **I:** Superfícies lisas — mar calmo, lagos, rios, pântanos sem vegetação
- **II:** Terrenos abertos — campos de aviação, fazendas sem sebes, zonas costeiras planas
- **III:** Terrenos com obstáculos — sebes, muros, casas baixas e esparsas
- **IV:** Zona florestal, industrial ou urbanizada — cidades pequenas, subúrbios densos
- **V:** Centros de grandes cidades, florestas com árvores altas

### 3b — Fator de rajada Fr (Tabela 2)

```javascript
const FR = { A: 1.00, B: 0.98, C: 0.95 };
```

Classes:
- **A:** maior dimensão ≤ 20 m (t = 3s)
- **B:** maior dimensão 20–50 m (t = 5s)
- **C:** maior dimensão > 50 m (t = 10s)

### Regra para vedações (seção 6.1.1)

"Para o cálculo de elementos de vedação e de suas fixações, deve ser usado o fator S2 correspondente à **Classe A**."

O app deve usar Classe A como padrão para vedações. Permitir seleção manual da classe com nota indicando que vedações devem usar Classe A.

### Regra para altura (seção 5.3.3)

"Para o estudo dos elementos de vedação é recomendado usar o fator S2 correspondente ao **topo da edificação**."

Input: altura da edificação (z). S2 calculado pela fórmula ou interpolado da Tabela 3.

- Para z < 5 m: usar S2 de z = 5 m (Categorias I a IV)
- Para Categoria V: S2 constante até z = 10 m

### Tabela 3 completa — S2 por categoria × classe × altura

```javascript
const TABELA_S2 = {
  alturas: [5, 10, 15, 20, 30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300, 350, 400, 420, 450, 500],
  valores: {
    I: {
      A: [1.06,1.10,1.13,1.15,1.17,1.20,1.21,1.22,1.25,1.26,1.28,1.29,1.30,1.31,1.32,1.33,null,null,null,null,null,null],
      B: [1.04,1.09,1.12,1.14,1.17,1.19,1.21,1.22,1.25,1.26,1.28,1.29,1.30,1.31,1.32,1.34,null,null,null,null,null,null],
      C: [1.01,1.06,1.09,1.12,1.15,1.17,1.19,1.21,1.23,1.25,1.27,1.28,1.29,1.30,1.31,1.33,null,null,null,null,null,null],
    },
    II: {
      A: [0.94,1.00,1.04,1.06,1.10,1.13,1.15,1.16,1.19,1.22,1.24,1.25,1.27,1.28,1.29,1.31,null,null,null,null,null,null],
      B: [0.92,0.98,1.02,1.04,1.08,1.11,1.13,1.15,1.18,1.21,1.23,1.24,1.26,1.27,1.28,1.31,null,null,null,null,null,null],
      C: [0.89,0.95,0.99,1.02,1.06,1.09,1.12,1.14,1.17,1.20,1.22,1.24,1.25,1.27,1.28,1.31,null,null,null,null,null,null],
    },
    III: {
      A: [0.88,0.94,0.98,1.01,1.05,1.08,1.10,1.12,1.16,1.18,1.20,1.22,1.24,1.26,1.27,1.30,1.32,1.34,null,null,null,null],
      B: [0.86,0.92,0.96,0.99,1.03,1.07,1.09,1.11,1.15,1.17,1.20,1.22,1.23,1.25,1.26,1.29,1.32,1.34,null,null,null,null],
      C: [0.82,0.88,0.93,0.96,1.00,1.04,1.06,1.09,1.12,1.15,1.18,1.20,1.22,1.23,1.25,1.28,1.31,1.33,null,null,null,null],
    },
    IV: {
      A: [0.79,0.86,0.90,0.93,0.98,1.02,1.04,1.07,1.10,1.13,1.16,1.18,1.20,1.22,1.23,1.27,1.29,1.32,1.34,1.35,null,null],
      B: [0.76,0.83,0.88,0.91,0.96,0.99,1.02,1.04,1.08,1.11,1.14,1.16,1.18,1.20,1.21,1.25,1.27,1.30,1.32,1.33,null,null],
      C: [0.73,0.80,0.84,0.88,0.93,0.96,0.99,1.02,1.06,1.09,1.12,1.14,1.16,1.18,1.20,1.23,1.26,1.29,1.30,1.30,null,null],
    },
    V: {
      A: [0.74,0.74,0.79,0.82,0.87,0.91,0.94,0.97,1.01,1.05,1.07,1.10,1.12,1.14,1.16,1.20,1.23,1.26,1.29,null,1.32,1.34],
      B: [0.72,0.72,0.76,0.80,0.85,0.89,0.93,0.95,1.00,1.03,1.06,1.09,1.11,1.14,1.16,1.20,1.23,1.26,1.29,1.30,1.32,1.34],
      C: [0.67,0.67,0.72,0.76,0.82,0.86,0.89,0.92,0.97,1.01,1.04,1.07,1.10,1.12,1.14,1.18,1.22,1.26,1.29,1.30,1.31,1.34],
    },
  }
};
```

Para alturas intermediárias, usar **interpolação linear** entre os dois pontos adjacentes da tabela.

---

## Parâmetro 4 — S3 (Fator estatístico)

Seção 5.4, Tabela 4 da NBR 6123:2023.

```javascript
const GRUPOS_S3 = [
  { grupo: 1, s3: 1.11, tp: 100, desc: "Hospitais, quartéis, centrais de controle, pontes" },
  { grupo: 2, s3: 1.06, tp: 75,  desc: "Aglomerações >300 pessoas, escolas, creches" },
  { grupo: 3, s3: 1.00, tp: 50,  desc: "Residências, hotéis, comércio, indústrias" },
  { grupo: 4, s3: 0.95, tp: 37,  desc: "Depósitos, silos (sem ocupação humana)" },
  { grupo: 5, s3: 0.83, tp: 15,  desc: "Temporárias, estruturas em construção (≤2 anos)" },
];
```

### NOTA da Tabela 4 — regime de transição para vedações

"Exclusivamente para o projeto das vedações, se permite que a velocidade característica seja calculada com o fator **(0,92 × S3)**, em vez de S3."

O app deve:
- Exibir S3 do grupo selecionado
- Calcular e exibir S3* = 0,92 × S3 (valor efetivo para vedações)
- Usar S3* no cálculo de Vk

---

## Parâmetro 5 — Ce / cpe (Coeficiente de pressão externa)

Seção 6.1.1, Tabela 6 da NBR 6123:2023. Paredes de edificações de planta retangular a × b (b = menor dimensão).

### Implementação simplificada para vedações

O app oferece:
1. **Dropdown com valores pior-caso por zona**, incluindo o cpe médio (zona de alta sucção)
2. **Input manual** para cenários não tabelados

### Valores Ce — Tabela 6 (pior caso por faixa h/b)

```javascript
const TABELA_CE = {
  // h/b ≤ 1/2
  faixa1: {
    label: "h/b ≤ 1/2",
    valores: {
      "barlavento_0":   +0.7,
      "sotavento_0":    -0.5,  // pior entre -0.4 e -0.5
      "lateral_0":      -0.9,  // cpe médio
      "barlavento_90":  +0.7,
      "sotavento_90":   -0.5,
      "lateral_90":     -1.0,  // cpe médio, pior caso a/b 2-4
    }
  },
  // 1/2 < h/b ≤ 3/2
  faixa2: {
    label: "1/2 < h/b ≤ 3/2",
    valores: {
      "barlavento_0":   +0.7,
      "sotavento_0":    -0.5,
      "lateral_0":      -1.1,
      "barlavento_90":  +0.7,
      "sotavento_90":   -0.6,
      "lateral_90":     -1.1,
    }
  },
  // 3/2 < h/b ≤ 6
  faixa3: {
    label: "3/2 < h/b ≤ 6",
    valores: {
      "barlavento_0":   +0.8,
      "sotavento_0":    -0.6,
      "lateral_0":      -1.2,
      "barlavento_90":  +0.8,
      "sotavento_90":   -0.6,
      "lateral_90":     -1.2,
    }
  },
};
```

**Para vedações, o que importa é o pior caso.** O app deve calcular Δp para todas as combinações de Ce e cpi, e retornar o maior |Δp|.

---

## Parâmetro 6 — cpi (Coeficiente de pressão interna)

Seção 6.3.2 da NBR 6123:2023 — Método simplificado.

```javascript
const CASOS_CPI = [
  {
    id: "estanque",
    label: "Edificação estanque (janelas fixas)",
    valores: [-0.2, 0],
    nota: "Considerar o mais nocivo"
  },
  {
    id: "4faces",
    label: "Quatro faces igualmente permeáveis",
    valores: [-0.3, 0],
    nota: "Considerar o mais nocivo"
  },
  {
    id: "2faces_perp_permeavel",
    label: "2 faces opostas permeáveis — vento ⊥ face permeável",
    valores: [+0.2],
    nota: null
  },
  {
    id: "2faces_perp_impermeavel",
    label: "2 faces opostas permeáveis — vento ⊥ face impermeável",
    valores: [-0.3],
    nota: null
  },
  {
    id: "manual",
    label: "Valor manual",
    valores: null,
    nota: "Para abertura dominante ou casos especiais — consultar 6.3.2.1-c) da norma"
  },
];
```

Quando o caso tem dois valores possíveis (ex: −0,2 ou 0), o app calcula Δp com ambos e usa o que resulta em maior |Δp|.

---

## Parâmetro 7 — fv (Fator de vizinhança)

Seção 6.4 da NBR 6123:2023.

### Implementação V1

Padrão: **fv = 1,0** (edificação isolada). Input manual disponível para ajuste. Nota explicativa: "Para edificações vizinhas com s/d* ≤ 1,0: fv = 1,3. Interpolar linearmente até s/d* = 3,0 onde fv = 1,0."

---

## Parâmetro 8 — NBR 10821 Tabela 1

### Implementação V1

**Input manual** — campo numérico para o usuário informar o valor mínimo de pressão de ensaio conforme NBR 10821 Tabela 1.

Nota: "Será automatizado em versão futura quando os valores da Tabela 1 forem disponibilizados."

---

## Resultado final

```
Δp = (Ce − cpi) × q × fv
Pe_6123 = |Δp|
Pe_10821 = valor informado pelo usuário
Pe = máx(Pe_6123, Pe_10821)
```

Exibir com destaque visual:
- Vk (m/s) com todos os fatores discriminados
- q (Pa) — pressão dinâmica
- |Δp| (Pa) — pressão efetiva
- Pe NBR 6123 (Pa)
- Pe NBR 10821 (Pa)
- **Pe recomendado** = maior dos dois, com indicação de qual norma governa

---

## Stack e design

- HTML standalone, arquivo único, sem framework
- Chart.js via CDN se necessário (cdnjs.cloudflare.com)
- Google Fonts: DM Sans + DM Mono
- Dark theme: `--bg:#0b1220`, `--s1:#121a2b`, `--acc:#5ba8f5`, `--acc2:#5cf0c8`
- Mobile-first, coluna única, max-width 680px
- Inputs min-height 48px, font-size 16px (evita zoom iOS)
- Arquivo de saída: `apps/pressao-vento/index.html`
- Usar como referência visual: `apps/vidro-laminado/index.html`

## Relatório imprimível

Overlay full-screen branco com toolbar sticky ("Imprimir / PDF" + "Fechar"). iframe-based print. Campos obra e responsável técnico. Convenção decimal brasileira (vírgula).
