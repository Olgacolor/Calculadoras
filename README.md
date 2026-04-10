# Calculadoras Técnicas - Olgacolor Alumínio

Ferramentas de cálculo para projetos de fachadas, esquadrias e envolvente de edificações.

Acesso publicado: [olgacolor.github.io/calculadoras](https://olgacolor.github.io/calculadoras)

## Apps disponíveis

| App | Referência principal | Status |
| --- | --- | --- |
| [Vidro Laminado](apps/vidro-laminado/) | ABNT NBR 7199:2025 | Ativo |
| [Levitare](apps/Levitare/) | NBR 10821 / NBR 7199 | Ativo |
| Pressão de Vento | NBR 6123 / NBR 10821 | Em desenvolvimento |
| Perfil Estrutural | NBR 10821 / AA ADM | Em desenvolvimento |
| Desempenho Térmico | NBR 15575 / ISO 10077 | Em desenvolvimento |
| Estanqueidade | NBR 10821 / AAMA 502 | Em desenvolvimento |

## Estrutura do repositório

```text
Calculadoras/
|-- index.html
|-- README.md
|-- package.json
|-- scripts/
|   |-- build-nbr10821.mjs
|   `-- check-textos.mjs
|-- tests/
|   `-- nbr10821.test.mjs
|-- assets/
|   `-- nbr10821/
|       |-- data.json
|       |-- data.js
|       `-- index.js
`-- apps/
    |-- Levitare/
    |   |-- index.html
    |   `-- assets/
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

- Verificação de resistência e flecha conforme ABNT NBR 7199:2025.
- Modos de composição para vidro laminado e monolítico.
- Tabelas internas para coeficiente alfa e fator eps2.
- Memorial de cálculo com rastreabilidade básica, hipóteses adotadas e versão da calculadora.
- Comparativo gráfico entre configurações padrão de espessura.

## Melhorias implementadas nesta rodada

- Separação da regra de negócio, UI, gráfico e relatório em arquivos JS locais.
- Validações operacionais na interface com alertas e hipóteses do cálculo.
- Remoção do acoplamento principal da UI ao estado global anterior.
- Relatório com versão da calculadora e seções de rastreabilidade.
- Ajuste no comparativo para não tratar flecha de 2 apoios como critério fechado quando o limite depende do projeto.

## Infra local

- `npm run build:nbr10821`: regenera `assets/nbr10821/data.js` a partir da base JSON compartilhada.
- `npm run test:nbr10821`: valida a API compartilhada da NBR 10821 com testes automatizados.
- `npm run check:textos`: procura sinais de mojibake nos arquivos principais.
- `npm run check`: roda testes da NBR 10821 e o check de textos em sequência.

## Módulo compartilhado NBR 10821

O repositório agora possui uma camada única para pressão normativa em `assets/nbr10821/`.

- `data.json`: base canônica de estados, cidades e isopletas.
- `data.js`: versão pronta para consumo direto no navegador.
- `index.js`: API compartilhada para apps presentes e futuros.

API disponível no navegador:

- `window.NBR10821.getStates()`
- `window.NBR10821.getCities(uf)`
- `window.NBR10821.resolve({ uf, city, floors })`

## Como usar localmente

- Abra `apps/vidro-laminado/index.html` no navegador.
- O app funciona sem processo de build.
- Para a experiência completa, o navegador precisa conseguir carregar Google Fonts e Chart.js via CDN.

## Observações

- Arquivos históricos e bases duplicadas foram removidos para evitar edição da versão errada.
- Se o objetivo for endurecer a confiança técnica do produto, o próximo passo recomendado é criar uma bateria de casos de teste para as fórmulas.
