# Padrão visual dos apps Olgacolor

Este guia resume a direção visual aplicada primeiro no app Levitare para servir de base aos próximos calculadores.

## Estrutura

- O primeiro bloco editável deve ser sempre **Dados da obra**.
- O fluxo principal deve ser numerado em etapas curtas: obra, configuração, parâmetros técnicos, acabamento e ação.
- Textos institucionais ou explicativos devem ficar em uma coluna lateral ou em blocos compactos, sem competir com o preenchimento.
- O resultado deve separar leitura comercial e leitura técnica.

## Aparência

- Base clara, com sensação de proposta técnica: fundo em tom de papel, cards brancos e bordas suaves.
- Azul Olgacolor como cor principal de ação e destaque técnico.
- Verde apenas para reforço positivo ou apoio secundário.
- Avisos devem usar cores semânticas: azul para informação, amarelo para atenção e vermelho para bloqueio.
- Evitar blocos escuros repetitivos e cards visualmente idênticos.

## Mobile

- Cards em coluna única.
- Botões ocupam largura total.
- Opções de seleção devem ficar empilhadas para evitar escolhas apertadas.
- A tela deve começar pelo preenchimento, não por um hero grande.

## Regras de preservação

- Não alterar IDs usados pelo JavaScript ao migrar o visual.
- Não mover campos para fora do formulário sem validar listeners e testes.
- Rodar `npm run check` antes de publicar qualquer alteração visual.
