(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;

  function interp(table, x) {
    if (x <= table[0][0]) return table[0][1];
    if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
    for (let index = 0; index < table.length - 1; index += 1) {
      const current = table[index];
      const next = table[index + 1];
      if (x >= current[0] && x <= next[0]) {
        const t = (x - current[0]) / (next[0] - current[0]);
        return current[1] + t * (next[1] - current[1]);
      }
    }
    return table[table.length - 1][1];
  }

  function gtLabel(eps3) {
    return constants.GT_LABEL[Number(eps3).toFixed(2)] || `eps3 = ${eps3}`;
  }

  function normalizeNumber(value, fallback, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function normalizeApoio(value) {
    if (value === "2") return "2altura";
    if (value === "4" || value === "2largura" || value === "2altura" || value === "3menor" || value === "3maior") return value;
    return "4";
  }

  function validateInputs(rawInputs) {
    const normalized = {
      family: rawInputs.family === "monolitico" ? "monolitico" : "laminado",
      apoio: normalizeApoio(rawInputs.apoio),
      wMM: normalizeNumber(rawInputs.wMM, 1200, 200, 6000),
      hMM: normalizeNumber(rawInputs.hMM, 2400, 200, 6000),
      Pv: normalizeNumber(rawInputs.Pv, 1000, 50, 6000),
      panes: Array.isArray(rawInputs.panes) ? rawInputs.panes.map((pane) => ({
        h: normalizeNumber(pane.h, 6, 3, 19),
        eps3: normalizeNumber(pane.eps3, 1.0, 0.61, 1.0)
      })) : []
    };

    const issues = [];
    const assumptions = [
      "Fator c adotado como 1,0.",
      "Resistencia verificada com P = 1,5 x Pe.",
      normalized.family === "laminado"
        ? "Laminado calculado com eps2 tabulado para 2 vidros."
        : "Monolitico calculado com espessura nominal para flecha."
    ];

    if (normalized.family === "laminado" && normalized.panes.length < 2) {
      normalized.panes = [{ h: 6, eps3: 1.0 }, { h: 6, eps3: 1.0 }];
      issues.push({
        tone: "bad",
        title: "Composicao restaurada",
        body: "Os dados do laminado estavam incompletos. O app voltou para uma composicao 6+6 recozida para evitar calculo inconsistente."
      });
    }

    if (normalized.family === "monolitico" && normalized.panes.length < 1) {
      normalized.panes = [{ h: 10, eps3: 1.0 }];
    }

    if (rawInputs.wMM !== normalized.wMM || rawInputs.hMM !== normalized.hMM || rawInputs.Pv !== normalized.Pv) {
      issues.push({
        tone: "warn",
        title: "Entradas ajustadas ao intervalo permitido",
        body: "Largura, altura e pressao sao limitadas ao intervalo operacional de 200 a 6000 mm e 50 a 6000 Pa."
      });
    }

    if (normalized.wMM > normalized.hMM) {
      issues.push({
        tone: "warn",
        title: "Orientacao do painel fora do padrao visual",
        body: "A calculadora usa automaticamente o menor vao como l e o maior vao como L. O calculo continua valido, mas vale revisar a forma de entrada para leitura humana."
      });
    }

    if (normalized.Pv >= 3000) {
      issues.push({
        tone: "warn",
        title: "Pressao elevada",
        body: "A solicitacao esta em uma faixa alta para esquadrias usuais. Vale confirmar se a pressao de ensaio informada e mesmo a exigida para o cenario."
      });
    }

    if (normalized.apoio === "2largura" || normalized.apoio === "2altura") {
      issues.push({
        tone: "warn",
        title: "Flecha depende de criterio de projeto",
        body: "Para 2 lados apoiados, a norma exige que o limite de flecha seja definido em projeto. O app calcula a flecha, mas nao fecha o atendimento final por esse criterio."
      });
      assumptions.push("Para 2 apoios, o atendimento final de flecha precisa de validacao complementar do projeto.");
    }

    if (normalized.family === "laminado") {
      assumptions.push("Tipo de vidro único aplicado a ambas as lâminas (F1 = F2).");
      if (normalized.panes[0].h !== normalized.panes[1].h) {
        assumptions.push("Laminado assimétrico: espessuras F1 e F2 diferentes.");
      }
    }

    if (!issues.length) {
      issues.push({
        tone: "ok",
        title: "Entradas consistentes",
        body: "Nao foram detectadas ressalvas operacionais para este conjunto de dados."
      });
    }

    return { normalized, issues, assumptions };
  }

  function calcNBR(inputs) {
    const apoio = inputs.apoio;
    const c = 1.0;
    const widthM = inputs.wMM / 1000;
    const heightM = inputs.hMM / 1000;
    const lM = Math.min(inputs.wMM, inputs.hMM) / 1000;
    const LM = Math.max(inputs.wMM, inputs.hMM) / 1000;
    const S = LM * lM;
    const P = inputs.Pv * 1.5;
    const ratioLL = LM / lM;
    const twoSideSpanM = apoio === "2largura"
      ? widthM
      : apoio === "2altura"
      ? heightM
      : null;

    let e1;
    if (apoio === "4") {
      e1 = ratioLL <= 2.5 ? Math.sqrt(S * P / 100) : lM * Math.sqrt(P) / 6.3;
    } else if (apoio === "3menor") {
      e1 = lM * Math.sqrt(P) / 6.3;
    } else if (apoio === "3maior") {
      e1 = ratioLL <= 7.5 ? Math.sqrt(LM * 3 * lM * P / 100) : 3 * lM * Math.sqrt(P) / 6.3;
    } else if (apoio === "2largura" || apoio === "2altura") {
      e1 = twoSideSpanM * Math.sqrt(P) / 6.3;
    } else {
      e1 = lM * Math.sqrt(P) / 6.3;
    }

    let eR;
    let eF;
    let eps2;
    let eps3vals;
    let maxEps3;
    if (inputs.family === "laminado") {
      const sumH = inputs.panes.reduce((sum, pane) => sum + pane.h, 0);
      eps2 = inputs.panes.length === 2 ? 1.30 : inputs.panes.length === 3 ? 1.50 : 1.60;
      eps3vals = inputs.panes.map((pane) => pane.eps3);
      maxEps3 = Math.max.apply(null, eps3vals);
      eR = sumH / (0.9 * eps2 * maxEps3);
      eF = sumH / eps2;
    } else {
      eps2 = null;
      eps3vals = [inputs.panes[0].eps3];
      maxEps3 = inputs.panes[0].eps3;
      eR = inputs.panes[0].h / inputs.panes[0].eps3;
      eF = inputs.panes[0].h;
    }

    const e1c = e1 * c;
    const okR = eR >= e1c;
    const uR = e1c / eR;

    let alpha;
    let b;
    let fLim;
    if (apoio === "4") {
      alpha = interp(constants.TAB6, lM / LM);
      b = lM;
      fLim = Math.min((lM * 1000) / 60, 30);
    } else if (apoio === "3menor") {
      alpha = interp(constants.TAB7, LM / lM);
      b = lM;
      fLim = Math.min((lM * 1000) / 100, 50);
    } else if (apoio === "3maior") {
      alpha = interp(constants.TAB7, lM / LM);
      b = LM;
      fLim = Math.min((LM * 1000) / 100, 50);
    } else if (apoio === "2largura" || apoio === "2altura") {
      alpha = 2.1143;
      b = twoSideSpanM;
      fLim = null;
    } else {
      alpha = 2.1143;
      b = lM;
      fLim = null;
    }

    const f = alpha * inputs.Pv * Math.pow(b, 4) / Math.pow(eF, 3);
    const okF = fLim !== null ? f <= fLim : null;
    const uF = fLim !== null ? f / fLim : null;
    const governing = uF === null || uR >= uF ? "resistencia" : "flecha";

    return {
      lM, LM, S, P, Pv: inputs.Pv, ratioLL, c, e1, e1c, okR, uR,
      eps2, eps3vals, maxEps3, eR, eF, alpha, b, f, fLim, okF, uF,
      ok: okF === null ? okR : okR && okF,
      apoio: apoio,
      twoSideSpanM,
      family: inputs.family,
      governing
    };
  }

  app.Engine = { calcNBR, gtLabel, validateInputs };
}());
