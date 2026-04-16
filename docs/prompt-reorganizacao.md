# Reorganização — Pressão de Vento

Leia o `CLAUDE.md` na raiz. Reorganize `apps/pressao-vento/index.html` (e `app.js` se existir) conforme abaixo.

O motor de cálculo está correto — não alterar fórmulas, tabelas, dados ou lógica. A mudança é só na estrutura da interface.

---

## Problema atual

O app tem 9 cards antes do resultado. Numeração está quebrada (dois cards "02"). O card de identificação do documento tem 8 campos no topo que bloqueiam o acesso ao cálculo. O cpi tem 5 perguntas sim/não que duplicam o dropdown técnico. O Ce mostra 8 elementos visuais de uma vez. O resultado fica soterrado no final da página.

## Nova estrutura: 3 blocos + resultado

### BLOCO 1 — A obra (dados da edificação e localização)

Um único card agrupando tudo que descreve a obra:

**Linha 1:** UF + Cidade (dropdowns filtrados como já estão)
**Linha 2:** V₀ (input numérico, preenchido pela cidade) + Região NBR 10821 (dropdown 1-5)
**Linha 3:** h (altura) + a (lado maior) + b (lado menor)
**Linha 4:** Forma → Regular / Irregular (seg buttons como já estão)

O aviso sobre V₀ e a nota sobre região ficam como notas compactas abaixo.

Derivados exibidos automaticamente: `h/b`, `a/b`, faixa da Tabela 6.

### BLOCO 2 — Condições (parâmetros normativos)

Um único card com os parâmetros que classificam a condição do vento:

**Linha 1:** Topografia S₁ → Terreno plano (1,0) / Vale (0,9) / Manual (seg buttons, igual ao atual)
**Linha 2:** Categoria de rugosidade (dropdown I a V, igual ao atual)
**Linha 3:** Classe → A / B / C (seg buttons, com nota de que vedações usam A)
**Linha 4:** Grupo estatístico S₃ (dropdown 1-5, igual ao atual)
**Linha 5:** Permeabilidade da edificação (dropdown único com texto descritivo):
  - "Edificação fechada — janelas fixas, sem aberturas relevantes" → cpi = −0,2 ou 0
  - "Aberturas equilibradas em todas as faces" → cpi = −0,3 ou 0
  - "Faces opostas permeáveis — vento perpendicular à face aberta" → cpi = +0,2
  - "Faces opostas permeáveis — vento perpendicular à face fechada" → cpi = −0,3
  - "Abertura dominante na face de barlavento" → cpi = +0,1 a +0,8
  - "Valor manual" → input numérico
**Linha 6:** fv — vizinhança (input numérico, padrão 1,0, como está)

Derivados exibidos: S₂ calculado, S₃*, parâmetros bm/Fr/p.

### BLOCO 3 — Resultado

Exatamente como está hoje, com:
- Cadeia de cálculo (chain display)
- Seção NBR 6123: Vk, q, Pp, Pe, Ps, Pa
- Seção NBR 10821: Pe, Ps, Pa (interpolados pela tabela)
- Pe recomendado (box verde destacado)

### RELATÓRIO — campos de identificação vão para cá

Os campos que estavam no card 01 (cliente, obra, local, responsável, data, revisão, documento, disciplina, observações) são movidos para **dentro do overlay do relatório**. O usuário preenche quando for gerar o PDF, não enquanto está calculando.

Padrão: ao abrir o relatório, os campos aparecem editáveis no topo (como já funciona no vidro-laminado com obra e responsável). Os dados de cálculo vêm embaixo, preenchidos automaticamente.

---

## Modo simplificado / avançado

Manter o toggle, mas com efeito mais drástico:

**Simplificado:**
- Esconde: S₁ (assume 1,0), Classe (assume A), fv (assume 1,0), método Ce (assume automático)
- O usuário vê só: cidade, dimensões, forma, rugosidade, grupo S₃, permeabilidade
- Resultado aparece logo abaixo

**Avançado:**
- Mostra tudo: S₁ manual, seleção de classe, fv editável, Ce manual, cpi manual
- Para uso em memorial técnico completo

---

## Correções técnicas obrigatórias

1. **Numeração dos cards**: remover numeração numérica dos cards — usar títulos descritivos sem número (ex: "A obra", "Condições de vento", "Resultado"). A numeração antiga estava quebrada e não agrega.

2. **Print**: usar iframe-based print conforme padrão de `apps/vidro-laminado/index.html`. Não usar `window.print()`.

3. **Arquivos**: se o app está dividido em index.html + app.js + cidades_v0.js, manter essa estrutura. Se for mais prático consolidar em arquivo único, consolidar. O que importa é que funcione abrindo index.html no browser.

---

## O que NÃO mudar

- Motor de cálculo (fórmulas, tabelas S2, interpolação, Tabela 6, NBR 10821)
- Lista de cidades (cidades_v0.js)
- Paleta visual e tipografia (CSS variables, DM Sans, DM Mono)
- Lógica de pior caso Ce × cpi
- Quatro saídas de pressão (Pp, Pe, Ps, Pa)

---

## Critério de sucesso

O app deve ser utilizável preenchendo no máximo 6-7 campos em modo simplificado antes de ver o resultado:
1. UF/Cidade
2. h, a, b
3. Rugosidade
4. Grupo S₃
5. Permeabilidade

Tudo o resto é derivado automaticamente ou tem default razoável. Campos de memorial só aparecem no relatório.
