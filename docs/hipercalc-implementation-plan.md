# HiperCalc - plano de implementacao inicial

## Fundacao existente

O repositorio `Calculadoras` ja possui uma base util para o HiperCalc:

- app web sem build obrigatorio
- separacao entre motor, UI e relatorio no modulo `vidro-laminado`
- validacao operacional na interface
- memorial de calculo baseado em snapshot

Essa estrutura deve ser preservada e generalizada.

## Direcao tecnica

Vamos evoluir o repositorio como uma suite de calculadoras tecnicas, em vez de tentar construir uma plataforma monolitica logo de inicio.

Arquitetura alvo:

- `apps/pressao-vento/`
- `apps/perfil-estrutural/`
- `apps/vidro-laminado/`
- `shared/` para utilitarios comuns
- `docs/` para regras, premissas e roadmap

Cada modulo deve conter:

- `index.html`
- `js/constants.js`
- `js/engine.js`
- `js/ui.js`
- `js/report.js`
- `js/app.js`

## Ordem recomendada de desenvolvimento

1. Endurecer a base do repositiorio atual
2. Implementar calculadora de pressao de vento
3. Integrar a calculadora de vidro ao fluxo de pressao
4. Implementar calculadora de perfil estrutural
5. Criar biblioteca tecnica pesquisavel
6. Adicionar camada assistiva de IA

## Fase 1 - endurecimento da base

Objetivo:
Preparar a base para crescimento e confiabilidade.

Entregas:

- padronizar estrutura dos apps
- criar utilitarios compartilhados para formatacao e validacao
- documentar versoes e referencias normativas
- criar casos de teste para motores de calculo
- remover ou isolar arquivos historicos que confundem a manutencao

## Fase 2 - pressao de vento

Objetivo:
Criar a primeira entrada do fluxo tecnico do projeto.

Entregas:

- formulario guiado
- validacao de dados climaticos e geometricos
- resultado com rastreabilidade
- memoria de calculo exportavel
- saida pronta para alimentar modulos seguintes

## Fase 3 - vidro

Objetivo:
Conectar a pressao calculada ao dimensionamento de vidro.

Entregas:

- receber pressao diretamente do modulo anterior
- manter entrada manual como alternativa
- ampliar memorial de calculo com origem dos dados
- comparar configuracoes padrao com criterio governante

## Fase 4 - perfil estrutural

Objetivo:
Dimensionar perfis com base nas cargas e nos limites adotados.

Entregas:

- entrada de geometria e perfis
- validacao de liga, tempera e propriedades
- comparativo entre opcoes
- relatorio tecnico compatvel com o restante da suite

## Fase 5 - documentacao e IA assistiva

Objetivo:
Adicionar produtividade sem contaminar o motor tecnico.

Entregas:

- biblioteca tecnica com normas e notas
- busca semantica em documentos
- assistente tecnico com resposta citando fonte
- OCR para extracao assistida de dados
- preenchimento sugerido com confirmacao humana

## Regras de implementacao

- o motor tecnico sempre vence a camada de IA
- toda resposta assistida deve apontar origem ou status de inferencia
- nenhuma formula pode depender de modelo generativo
- mudancas normativas precisam ficar versionadas
- cada modulo deve poder operar sozinho

## Proximas entregas sugeridas

1. Criar uma pagina inicial do HiperCalc dentro do repositorio
2. Estruturar o app `pressao-vento`
3. Definir o conjunto minimo de entradas e saidas do modulo
4. Criar os primeiros testes de referencia para o motor
