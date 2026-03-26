# Calculadoras Técnicas — Olgacolor Alumínio

Ferramentas de cálculo para projetos de fachadas, esquadrias e envolvente de edificações.  
Baseadas em **NBR 7199**, **NBR 6123**, **NBR 10821** e **ASTM E1300**.

Acesse: **[olgacolor.github.io/calculadoras](https://olgacolor.github.io/calculadoras)**

---

## Apps disponíveis

| App | Normas | Status |
|-----|--------|--------|
| [Vidro Laminado](apps/vidro-laminado/) | NBR 7199 · ASTM E1300 App. X9 | ✅ Live |
| Pressão de Vento | NBR 6123 · NBR 10821 | 🔧 Em desenvolvimento |
| Perfil Estrutural | NBR 10821 · AA ADM | 🔧 Em desenvolvimento |
| Desempenho Térmico | NBR 15575 · ISO 10077 | 🔧 Em desenvolvimento |
| Estanqueidade | NBR 10821 · AAMA 502 | 🔧 Em desenvolvimento |

---

## Estrutura do repositório

```
olgacolor-calculadoras/
│
├── index.html                  ← Hub principal com lista de apps
│
├── apps/
│   ├── vidro-laminado/
│   │   └── index.html          ← Calculadora de espessura de vidro laminado
│   │
│   ├── pressao-vento/          ← (em desenvolvimento)
│   │   └── index.html
│   │
│   ├── perfil-estrutural/      ← (em desenvolvimento)
│   │   └── index.html
│   │
│   └── ...
│
└── README.md
```

---

## Vidro Laminado — metodologia

**Norma base:** NBR 7199:2016 + ASTM E1300-16 Appendix X9

**Modelo de espessura efetiva (Wölfel-Bennison):**
- `h_ef,w` para deflexão
- `h_ef,σ1` e `h_ef,σ2` para tensão em cada folha independentemente

**Coeficiente de transferência de cisalhamento Γ:**
- PVB: calculado via G(T, duração) — tabela Eastman/Saflex, âncora 10,9 MPa @ 20°C / 3s
- SGP (SentryGlas): Γ = 0,90 fixo

**Critérios NBR 7199:**
- Pressão de ensaio para deflexão
- 1,5 × pressão de ensaio para tensão
- Limite de deflexão: L/60 com cap absoluto de 25 mm

---

## Como usar localmente

Abra qualquer `index.html` diretamente no browser — não precisa de servidor.  
Todos os apps são arquivos HTML únicos, sem dependências locais.

---

## Como publicar no GitHub Pages

1. Acesse **Settings → Pages** no repositório
2. Source: `Deploy from a branch`
3. Branch: `main` · Pasta: `/ (root)`
4. Salvar — em ~1 minuto o site estará em `https://[usuario].github.io/calculadoras`

---

## Desenvolvimento

Desenvolvido pela Engenharia de Produto da Olgacolor Alumínio.  
Dúvidas técnicas: contato via issues do repositório.
