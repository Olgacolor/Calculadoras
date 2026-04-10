(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;
  const engine = app.Engine;

  function governingLabel(governing) {
    return governing === "resistencia" ? "resistência" : "flecha";
  }

  function rrow(key, value, status) {
    const badge = status === true
      ? '<span class="rp-badge-ok">ATENDE</span>'
      : status === false
      ? '<span class="rp-badge-fail">NÃO ATENDE</span>'
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
      : `Monolítico ${inputs.panes[0].h} mm (${engine.gtLabel(inputs.panes[0].eps3)})`;
    const pressureLabel = inputs.pressureMeta && inputs.pressureMeta.mode === "auto"
      ? "Automática (NBR 10821)"
      : "Manual";

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
      ? "Composição aprovada"
      : result.okF === null && result.okR
      ? "Composição aprovada em resistência"
      : "Composição reprovada";

    app.UI.get("reportContent").innerHTML = `
      <div class="rp-header">
        <div>
          <img src="../../assets/olgacolor-logo.png" alt="Olgacolor" class="rp-logo">
          <div class="rp-title">Memorial de Cálculo de Vidro</div>
          <div class="rp-sub">${constants.APP_META.normRef} · versão ${constants.APP_META.version}</div>
        </div>
        <div class="rp-meta">
          Data: ${data}<br>
          ${resp ? `Responsável: ${resp}<br>` : ""}
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
          <div class="rp-summary-k">Composição analisada</div>
          <div class="rp-summary-v">${composicao}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Critério governante</div>
          <div class="rp-summary-v">${governingLabel(result.governing)}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Leitura rápida</div>
          <div class="rp-summary-v">eR ${result.okR ? "ok" : "não ok"} · ${result.fLim !== null ? `f ${result.okF ? "ok" : "não ok"}` : "f depende do projeto"}</div>
        </div>
      </div>
      <table class="rp-table">
        ${rsection("Dados do painel")}
        ${rrow("Dimensões (largura x altura)", `${inputs.wMM} x ${inputs.hMM} mm`)}
        ${rrow("Área S", `${app.UI.fmt(result.S, 4)} m²`)}
        ${rrow("Condição de apoio", constants.APOIO_LABEL[inputs.apoio])}
        ${rrow("Método da pressão", pressureLabel)}
        ${rrow("Pe - pressão de ensaio", `${inputs.Pv} Pa`)}
        ${rrow("P = 1,5 x Pe", `${result.P.toFixed(0)} Pa`)}
        ${inputs.pressureMeta && inputs.pressureMeta.mode === "auto" && inputs.pressureMeta.context ? rrow("Cidade de referência", `${inputs.pressureMeta.context.cidade}/${inputs.pressureMeta.context.uf}`) : ""}
        ${inputs.pressureMeta && inputs.pressureMeta.mode === "auto" && inputs.pressureMeta.context ? rrow("Região normativa", `${inputs.pressureMeta.context.region} (${inputs.pressureMeta.context.isopleta} m/s)`) : ""}
        ${inputs.pressureMeta && inputs.pressureMeta.mode === "auto" && inputs.pressureMeta.context ? rrow("Faixa de pavimentos", `Até ${inputs.pressureMeta.context.pavimentos}`) : ""}
        ${rsection("Composição")}
        ${rrow("Tipo", composicao)}
        ${inputs.family === "laminado" ? rrow("eps2 (Tab. 4 - 2 vidros)", result.eps2.toFixed(2)) : ""}
        ${inputs.family === "laminado"
          ? rrow(`eps3 F1 - ${engine.gtLabel(result.eps3vals[0])}`, result.eps3vals[0].toFixed(2))
          : rrow(`eps3 - ${engine.gtLabel(result.eps3vals[0])}`, result.eps3vals[0].toFixed(2))}
        ${inputs.family === "laminado" ? rrow(`eps3 F2 - ${engine.gtLabel(result.eps3vals[1])}`, result.eps3vals[1].toFixed(2)) : ""}
        ${inputs.family === "laminado" ? rrow("MAX(eps3)", result.maxEps3.toFixed(2)) : ""}
        ${rsection("Verificação da resistência")}
        ${rrow("Espessura de referência e1", `${result.e1.toFixed(2)} mm`)}
        ${rrow("Limite mínimo e1 x c", `${result.e1c.toFixed(2)} mm`)}
        ${rrow(`eR = ${eRFormula}`, `${result.eR.toFixed(2)} mm`, result.okR)}
        ${rsection("Verificação da flecha")}
        ${rrow(`eF = ${eFLabel}`, `${result.eF.toFixed(2)} mm`)}
        ${rrow("b - vão de referência", `${app.UI.fmt(result.b * 1000, 0)} mm`)}
        ${rrow(`alfa (Tab. ${result.apoio === "4" ? "6" : "7"}${alphaRatio !== null ? ` - razão ${alphaRatio.toFixed(3)}` : ""})`, result.alpha.toFixed(5))}
        ${rrow("Flecha f = alfa x Pe x b^4 / eF^3", `${result.f.toFixed(2)} mm`, result.okF)}
        ${rrow("Limite de flecha", result.fLim !== null ? `${result.fLim.toFixed(2)} mm` : "a definir em projeto (§ 4.7.7.3)")}
        ${rsection("Hipóteses e rastreabilidade")}
        ${rrow("Versão da calculadora", constants.APP_META.version)}
        ${rrow("Critério governante", governingLabel(result.governing))}
        ${assumptions.map((assumption, index) => rrow(`Hipótese ${index + 1}`, assumption)).join("")}
      </table>
      <div class="rp-result ${result.ok ? "ok" : "fail"}">
        <div class="rp-result-icon">${result.ok ? "✓" : "✕"}</div>
        <div>
          <div class="rp-result-title">${title}</div>
          <div class="rp-result-sub">
            Resistência: eR = ${result.eR.toFixed(2)} mm ${result.okR ? ">=" : "<"} ${result.e1c.toFixed(2)} mm (${(result.uR * 100).toFixed(0)}% da demanda)
            &nbsp;·&nbsp;
            Flecha: f = ${result.f.toFixed(2)} mm ${result.fLim !== null ? (result.okF ? "<=" : ">") : "com"} ${result.fLim !== null ? `${result.fLim.toFixed(2)} mm` : "limite a definir"}${result.fLim !== null ? ` (${((result.uF || 0) * 100).toFixed(0)}%)` : ""}
          </div>
        </div>
      </div>
      <div class="rp-norma">
        ${constants.APP_META.normRef} · Fórmulas principais: §§ 4.7.3, 4.7.6.3, 4.7.7.2 e 4.7.7.5 · Tabelas 4, 6 e 7
      </div>`;

    document.title = obra ? `${obra} - ${constants.APP_META.normRef}` : `Memorial de Cálculo - ${constants.APP_META.normRef}`;
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
