# HiperCalc MVP 2026

## Visao do produto

O HiperCalc sera uma plataforma web de apoio ao dimensionamento tecnico de esquadrias, fachadas e vidros, com foco em calculo rastreavel, memoria de calculo e produtividade operacional.

O produto nao sera vendido como "IA que calcula". O nucleo de valor sera:

- motor de calculo deterministico
- validacao de entradas
- rastreabilidade por norma e versao
- relatorios tecnicos consistentes
- assistencia por IA apenas como camada de apoio

## Problema que vamos resolver

O processo atual exige consulta dispersa a normas, tabelas, catalogos e memoria manual. Isso gera:

- retrabalho na entrada de dados
- dificuldade de justificativa tecnica
- baixa padronizacao dos relatorios
- risco operacional ao consolidar informacoes de varias fontes

## Publico-alvo inicial

- engenheiros
- calculistas
- projetistas de esquadrias e fachadas
- consultores tecnicos
- fabricantes com equipe tecnica interna

## Recorte do MVP

O MVP do HiperCalc sera um produto web com os seguintes blocos:

1. Cadastro de projeto
2. Calculo de pressao de vento
3. Calculo estrutural de perfis
4. Calculo e selecao de vidro
5. Relatorio tecnico e memoria de calculo
6. Biblioteca tecnica com normas, notas e procedimentos
7. Banco inicial de perfis e materiais
8. Busca inteligente na base tecnica
9. Entrada assistida por IA para pre-preenchimento de campos

## O que fica fora do MVP

- comunidade de usuarios
- noticias editoriais dentro do produto
- hub de parceiros
- consultoria sob demanda dentro da plataforma
- emissao de ART integrada
- app mobile nativo completo
- promessas de aprendizado de maquina para alterar algoritmos de calculo

## Papel da IA no produto

A IA podera:

- extrair dados de imagens, PDFs e catalogos
- sugerir preenchimento de campos
- localizar trechos relevantes em normas e documentos internos
- responder perguntas com base na documentacao cadastrada
- ajudar na montagem textual de relatorios

A IA nao podera:

- inventar formula
- substituir regra normativa
- aprovar calculo sem criterio deterministico
- ocultar a origem das respostas

## Principios de arquitetura

- cada calculadora tera motor proprio, independente da interface
- formulas e constantes ficarao versionadas por norma
- relatorios serao gerados a partir do snapshot do calculo
- validacoes operacionais ficam junto do fluxo de entrada
- recursos de IA ficam em camada separada do motor tecnico

## Criterios de sucesso do MVP

- reduzir tempo de calculo e documentacao
- melhorar a clareza da memoria de calculo
- permitir revisao tecnica mais rapida
- manter rastreabilidade das hipoteses adotadas
- suportar expansao para novos modulos sem reescrever a base

## Riscos principais

- escopo grande demais no inicio
- regras de negocio incompletas
- falta de casos reais para validacao
- base de perfis desatualizada
- dependencia excessiva de IA em tarefas que exigem determinismo

## Decisao de produto

O HiperCalc comecara como plataforma tecnica web. O objetivo da primeira fase nao e criar um "super app", e sim um produto confiavel que resolva calculo, memoria e consulta tecnica com qualidade suficiente para uso profissional.
