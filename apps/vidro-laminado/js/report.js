(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;
  const engine = app.Engine;

  function rrow(key, value, status) {
    const badge = status === true
      ? '<span class="rp-badge-ok">ATENDE</span>'
      : status === false
      ? '<span class="rp-badge-fail">NAO ATENDE</span>'
      : "";
    return `<tr><td class="rp-k">${key}</td><td class="rp-v">${badge}${value}</td></tr>`;
  }

  function rsection(title) {
    return `<tr><td colspan="2" class="rp-section">${title}</td></tr>`;
  }

  function gerarRelatorio() {
    const snapshot = app.Controller.getSnapshot();
    const inputs = snapshot.inputs;
    const result = snapshot.result;
    const assumptions = snapshot.assumptions;
    const obra = (app.UI.get("obra").value || "").trim();
    const resp = (app.UI.get("resp").value || "").trim();
    const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const composicao = inputs.family === "laminado"
      ? `Laminado ${inputs.panes[0].h}+${inputs.panes[1].h} mm (${engine.gtLabel(inputs.panes[0].eps3)} + ${engine.gtLabel(inputs.panes[1].eps3)})`
      : `Monolitico ${inputs.panes[0].h} mm (${engine.gtLabel(inputs.panes[0].eps3)})`;

    const eFLabel = inputs.family === "laminado"
      ? `(${inputs.panes.map((pane) => pane.h).join("+")} mm) / eps2 ${result.eps2.toFixed(2)} = ${result.eF.toFixed(2)} mm`
      : `${inputs.panes[0].h} mm`;

    const eRFormula = inputs.family === "laminado"
      ? `(${inputs.panes.map((pane) => pane.h).join("+")} mm) / (0,9 x eps2 ${result.eps2.toFixed(2)} x MAX(eps3) ${result.maxEps3.toFixed(2)}) = ${result.eR.toFixed(2)} mm`
      : `${inputs.panes[0].h} mm / eps3 ${result.maxEps3.toFixed(2)} = ${result.eR.toFixed(2)} mm`;

    const alphaRatio = result.apoio === "4"
      ? result.lM / result.LM
      : result.apoio === "3menor"
      ? result.LM / result.lM
      : result.apoio === "3maior"
      ? result.lM / result.LM
      : null;

    const title = result.ok
      ? "Composicao aprovada"
      : result.okF === null && result.okR
      ? "Composicao aprovada em resistencia"
      : "Composicao reprovada";

    app.UI.get("reportContent").innerHTML = `
      <div class="rp-header">
        <div>
          <img src="../../assets/olgacolor-logo.png" alt="Olgacolor" class="rp-logo">
          <div class="rp-title">Memorial de Calculo de Vidro</div>
          <div class="rp-sub">${constants.APP_META.normRef} · versao ${constants.APP_META.version}</div>
        </div>
        <div class="rp-meta">
          Data: ${data}<br>
          ${resp ? `Responsavel: ${resp}<br>` : ""}
          Norma: ${constants.APP_META.normRef}<br>
          Fator c = 1,0
        </div>
      </div>
      ${obra ? `<div class="rp-obra">Obra / Projeto: ${obra}</div>` : ""}
      <div class="rp-summary">
        <div class="rp-summary-card">
          <div class="rp-summary-k">Resultado</div>
          <div class="rp-summary-v">${title}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Composicao analisada</div>
          <div class="rp-summary-v">${composicao}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Criterio governante</div>
          <div class="rp-summary-v">${result.governing}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Leitura rapida</div>
          <div class="rp-summary-v">eR ${result.okR ? "ok" : "nao ok"} · ${result.fLim !== null ? `f ${result.okF ? "ok" : "nao ok"}` : "f depende do projeto"}</div>
        </div>
      </div>
      <table class="rp-table">
        ${rsection("Dados do painel")}
        ${rrow("Dimensoes (largura x altura)", `${inputs.wMM} x ${inputs.hMM} mm`)}
        ${rrow("Area S", `${app.UI.fmt(result.S, 4)} m²`)}
        ${rrow("Condicao de apoio", constants.APOIO_LABEL[inputs.apoio])}
        ${rrow("Pe - pressao de ensaio", `${inputs.Pv} Pa`)}
        ${rrow("P = 1,5 x Pe", `${result.P.toFixed(0)} Pa`)}
        ${rsection("Composicao")}
        ${rrow("Tipo", composicao)}
        ${inputs.family === "laminado" ? rrow("eps2 (Tab. 4 - 2 vidros)", result.eps2.toFixed(2)) : ""}
        ${inputs.family === "laminado"
          ? rrow(`eps3 F1 - ${engine.gtLabel(result.eps3vals[0])}`, result.eps3vals[0].toFixed(2))
          : rrow(`eps3 - ${engine.gtLabel(result.eps3vals[0])}`, result.eps3vals[0].toFixed(2))}
        ${inputs.family === "laminado" ? rrow(`eps3 F2 - ${engine.gtLabel(result.eps3vals[1])}`, result.eps3vals[1].toFixed(2)) : ""}
        ${inputs.family === "laminado" ? rrow("MAX(eps3)", result.maxEps3.toFixed(2)) : ""}
        ${rsection("Verificacao da resistencia")}
        ${rrow("Espessura de referencia e1", `${result.e1.toFixed(2)} mm`)}
        ${rrow("Limite minimo e1 x c", `${result.e1c.toFixed(2)} mm`)}
        ${rrow(`eR = ${eRFormula}`, `${result.eR.toFixed(2)} mm`, result.okR)}
        ${rsection("Verificacao da flecha")}
        ${rrow(`eF = ${eFLabel}`, `${result.eF.toFixed(2)} mm`)}
        ${rrow("b - vao de referencia", `${app.UI.fmt(result.b * 1000, 0)} mm`)}
        ${rrow(`alfa (Tab. ${result.apoio === "4" ? "6" : "7"}${alphaRatio !== null ? ` - razao ${alphaRatio.toFixed(3)}` : ""})`, result.alpha.toFixed(5))}
        ${rrow("Flecha f = alfa x Pe x b^4 / eF^3", `${result.f.toFixed(2)} mm`, result.okF)}
        ${rrow("Limite de flecha", result.fLim !== null ? `${result.fLim.toFixed(2)} mm` : "a definir em projeto (§ 4.7.7.3)")}
        ${rsection("Hipoteses e rastreabilidade")}
        ${rrow("Versao da calculadora", constants.APP_META.version)}
        ${rrow("Criterio governante", result.governing)}
        ${assumptions.map((assumption, index) => rrow(`Hipotese ${index + 1}`, assumption)).join("")}
      </table>
      <div class="rp-result ${result.ok ? "ok" : "fail"}">
        <div class="rp-result-icon">${result.ok ? "✓" : "✕"}</div>
        <div>
          <div class="rp-result-title">${title}</div>
          <div class="rp-result-sub">
            Resistencia: eR = ${result.eR.toFixed(2)} mm ${result.okR ? ">=" : "<"} ${result.e1c.toFixed(2)} mm (${(result.uR * 100).toFixed(0)}% da demanda)
            &nbsp;·&nbsp;
            Flecha: f = ${result.f.toFixed(2)} mm ${result.fLim !== null ? (result.okF ? "<=" : ">") : "com"} ${result.fLim !== null ? `${result.fLim.toFixed(2)} mm` : "limite a definir"}${result.fLim !== null ? ` (${((result.uF || 0) * 100).toFixed(0)}%)` : ""}
          </div>
        </div>
      </div>
      <div class="rp-norma">
        ${constants.APP_META.normRef} · Formulas principais: §§ 4.7.3, 4.7.6.3, 4.7.7.2 e 4.7.7.5 · Tabelas 4, 6 e 7
      </div>`;

    document.title = obra ? `${obra} - ${constants.APP_META.normRef}` : `Memorial de Calculo - ${constants.APP_META.normRef}`;
    app.UI.get("reportOverlay").classList.add("active");
    window.scrollTo(0, 0);
  }

  function fecharRelatorio() {
    document.title = `${constants.APP_META.shortName} · ${constants.APP_META.normRef}`;
    app.UI.get("reportOverlay").classList.remove("active");
  }

  function imprimirRelatorio() {
    window.print();
  }

  app.Report = {
    fecharRelatorio,
    gerarRelatorio,
    imprimirRelatorio
  };
}());
