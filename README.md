# Calculadoras Tecnicas - Olgacolor Aluminio

Ferramentas de calculo para projetos de fachadas, esquadrias e envolvente de edificacoes.

Acesso publicado: [olgacolor.github.io/calculadoras](https://olgacolor.github.io/calculadoras)

## Apps disponiveis

| App | Referencia principal | Status |
| --- | --- | --- |
| [Vidro Laminado](apps/vidro-laminado/) | ABNT NBR 7199:2025 | Ativo |
| Pressao de Vento | NBR 6123 / NBR 10821 | Em desenvolvimento |
| Perfil Estrutural | NBR 10821 / AA ADM | Em desenvolvimento |
| Desempenho Termico | NBR 15575 / ISO 10077 | Em desenvolvimento |
| Estanqueidade | NBR 10821 / AAMA 502 | Em desenvolvimento |

## Estrutura do repositorio

```text
Calculadoras/
|-- index.html
|-- README.md
`-- apps/
    `-- vidro-laminado/
        |-- index.html
        |-- assets/
        `-- js/
            |-- app.js
            |-- constants.js
            |-- engine.js
            |-- report.js
            `-- ui.js
```

## Vidro Laminado - o que o app implementa hoje

- Verificacao de resistencia e flecha conforme ABNT NBR 7199:2025.
- Modos de composicao para vidro laminado e monolitico.
- Tabelas internas para coeficiente alfa e fator eps2.
- Memorial de calculo com rastreabilidade basica, hipoteses adotadas e versao da calculadora.
- Comparativo grafico entre configuracoes padrao de espessura.

## Melhorias implementadas nesta rodada

- Separacao da regra de negocio, UI, grafico e relatorio em arquivos JS locais.
- Validacoes operacionais na interface com alertas e hipoteses do calculo.
- Remocao do acoplamento principal da UI ao estado global anterior.
- Relatorio com versao da calculadora e secoes de rastreabilidade.
- Ajuste no comparativo para nao tratar flecha de 2 apoios como criterio fechado quando o limite depende do projeto.

## Como usar localmente

- Abra `apps/vidro-laminado/index.html` no navegador.
- O app funciona sem processo de build.
- Para a experiencia completa, o navegador precisa conseguir carregar Google Fonts e Chart.js via CDN.

## Observacoes

- Ainda existem arquivos historicos na pasta do app (`index.old.html`, `index (48).html`) que nao fazem parte da versao principal.
- Se o objetivo for endurecer a confianca tecnica do produto, o proximo passo recomendado e criar uma bateria de casos de teste para as formulas.
