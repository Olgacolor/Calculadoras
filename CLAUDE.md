# CLAUDE.md

Diretrizes comportamentais para reduzir erros comuns de LLMs ao escrever código.
Mesclar com instruções específicas do projeto conforme necessário.

**Tradeoff:** Estas diretrizes priorizam cautela sobre velocidade. Para tarefas triviais, use bom senso.

## 1. Pensar Antes de Codificar

**Não assuma. Não esconda dúvidas. Apresente trade-offs.**

Antes de implementar:
- Declare suas premissas explicitamente. Se não tem certeza, pergunte.
- Se existem múltiplas interpretações, apresente-as — não escolha em silêncio.
- Se existe uma abordagem mais simples, diga. Empurre de volta quando for o caso.
- Se algo não está claro, pare. Nomeie o que está confuso. Pergunte.
- Se existe uma norma, referência técnica ou documento-fonte, leia antes de codificar de memória.

## 2. Simplicidade Primeiro

**Mínimo de código que resolve o problema. Nada especulativo.**

- Nenhuma funcionalidade além do que foi pedido.
- Nenhuma abstração para código de uso único.
- Nenhuma "flexibilidade" ou "configurabilidade" que não foi solicitada.
- Nenhum tratamento de erro para cenários impossíveis.
- Se você escreveu 200 linhas e poderia ser 50, reescreva.

Teste mental: "Um engenheiro sênior diria que isso está complicado demais?" Se sim, simplifique.

## 3. Mudanças Cirúrgicas

**Toque apenas no necessário. Limpe apenas a sua própria bagunça.**

Ao editar código existente:
- Não "melhore" código adjacente, comentários ou formatação.
- Não refatore o que não está quebrado.
- Siga o estilo existente, mesmo que você faria diferente.
- Se notar código morto não relacionado, mencione — não delete.

Quando suas mudanças criam órfãos:
- Remova imports/variáveis/funções que AS SUAS mudanças tornaram obsoletas.
- Não remova código morto preexistente sem ser pedido.

O teste: cada linha alterada deve ter rastreabilidade direta ao que foi pedido.

## 4. Execução Orientada a Objetivos

**Defina critérios de sucesso. Itere até verificar.**

Transforme tarefas em objetivos verificáveis:
- "Adicionar validação" → "Definir o que é inválido, implementar, verificar com exemplos"
- "Corrigir o bug" → "Reproduzir o problema, corrigir, confirmar que o output está correto"
- "Refatorar X" → "Garantir que o comportamento é idêntico antes e depois"

Para tarefas de múltiplos passos, declare o plano brevemente:
```
1. [Passo] → verificar: [critério]
2. [Passo] → verificar: [critério]
3. [Passo] → verificar: [critério]
```

Critérios fortes permitem iterar de forma independente. Critérios fracos ("faz funcionar") exigem clarificação constante.

## 5. Consistência e Padrões

**Não invente padrão novo. Siga o que já existe.**

- Se o projeto já tem um estilo de nomenclatura, formatação, ou estrutura, siga-o.
- Se uma fórmula ou método vem de norma técnica, use a referência original — não recite de memória.
- Se o usuário validou um output contra referência externa, não mude o cálculo sem motivo documentado.
- Se uma versão anterior funciona, não reescreva "por melhorias" sem ser pedido.

---

**Estas diretrizes estão funcionando se:** os diffs têm menos mudanças desnecessárias, há menos reescritas por excesso de engenharia, e perguntas de clarificação vêm antes da implementação — não depois dos erros.
