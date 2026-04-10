(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;
  const engine = app.Engine;
  let compChart = null;

  function get(id) {
    return document.getElementById(id);
  }

  function fmt(value, decimals) {
    const places = typeof decimals === "number" ? decimals : 2;
    return Number(value).toFixed(places).replace(".", ",");
  }

  function familyLabel(family) {
    return family === "laminado" ? "Laminado" : "Monolítico";
  }

  function governingLabel(governing) {
    return governing === "resistencia" ? "resistência" : "flecha";
  }

  function chip(ok, utilization) {
    if (ok === true) return '<span class="chip chip-ok">ATENDE</span>';
    if (ok === false && utilization !== undefined && utilization <= 1.1) return '<span class="chip chip-warn">NO LIMITE</span>';
    if (ok === false) return '<span class="chip chip-fail">NÃO ATENDE</span>';
    return "";
  }

  function updateInfoApoio(apoio) {
    get("infoApoio").innerHTML = constants.SUPPORT_INFO[apoio] || "";
  }

  function renderPressureContext(inputs) {
    const summary = get("pressureSummary");
    const help = get("pressureHelp");
    const autoBox = get("pressureAutoBox");
    const manualBox = get("pressureManualBox");
    if (!summary || !help || !autoBox || !manualBox) return;

    autoBox.style.display = inputs.pressureMeta && inputs.pressureMeta.mode === "auto" ? "" : "none";
    manualBox.style.display = inputs.pressureMeta && inputs.pressureMeta.mode === "manual" ? "" : "none";

    if (inputs.pressureMeta && inputs.pressureMeta.mode === "auto" && inputs.pressureMeta.context) {
      const context = inputs.pressureMeta.context;
      summary.textContent = `${context.cidade}/${context.uf} • ${context.isopleta} m/s • Região ${context.region} • Pe ${context.pe} Pa`;
      help.textContent = `Tabela 1 da NBR 10821 para até ${context.pavimentos} pavimentos. Ps de referência ${context.ps} Pa e Pa ${context.pa} Pa.`;
      return;
    }

    if (inputs.pressureMeta && inputs.pressureMeta.mode === "manual") {
      summary.textContent = `Pe manual = ${fmt(inputs.Pv, 0)} Pa`;
      help.textContent = "Pressão informada manualmente pelo usuário ou definida em projeto.";
      return;
    }

    summary.textContent = "Seleção normativa indisponível";
    help.textContent = "Escolha UF, cidade e pavimentos para calcular a pressão automaticamente.";
  }

  function updateCross(inputs) {
    if (inputs.family !== "laminado") return;
    const h1 = inputs.panes[0].h;
    const h2 = inputs.panes[1].h;
    const total = h1 + h2;
    const maxHeight = 130;
    const minHeight = 22;
    const part1 = Math.max(minHeight, (h1 / total) * (maxHeight - 16));
    const part2 = Math.max(minHeight, (h2 / total) * (maxHeight - 16));

    get("plyF1").style.height = `${part1}px`;
    get("plyF2").style.height = `${part2}px`;
    get("lF1").textContent = `${h1} mm`;
    get("lF2").textContent = `${h2} mm`;
    get("crossTotal").textContent = `Total vidro: ${total} mm`;
  }

  function renderValidation(issues, assumptions) {
    const issueBlocks = [];
    const assumptionBlocks = [];

    issues.forEach((issue) => {
      issueBlocks.push(`
        <div class="validation-item ${issue.tone}">
          <strong>${issue.title}</strong>
          <span>${issue.body}</span>
        </div>
      `);
    });

    assumptions.forEach((assumption) => {
      assumptionBlocks.push(`
        <div class="validation-item">
          <strong>Hipótese adotada</strong>
          <span>${assumption}</span>
        </div>
      `);
    });

    get("validationIssues").innerHTML = issueBlocks.join("");
    get("validationAssumptions").innerHTML = assumptionBlocks.join("");
  }

  function renderStatus(inputs, result) {
    const currentConfig = inputs.family === "laminado"
      ? `${inputs.panes[0].h}+${inputs.panes[1].h} mm`
      : `${inputs.panes[0].h} mm`;

    get("statusCard").className = `status ${result.ok ? "ok" : "fail"}`;
    get("statusIcon").textContent = result.ok ? "✓" : "✕";
    get("statusTitle").textContent = result.ok
      ? (result.okF === null ? "Atende em resistência; flecha a definir" : "Composição atende")
      : "Composição não atende";
    get("statusReason").textContent = result.governing === "resistencia"
      ? "Governado por resistência"
      : "Governado por flecha";

    const parts = [
      `${familyLabel(inputs.family)} · ${inputs.wMM} x ${inputs.hMM} mm`,
      `eR = ${fmt(result.eR)} mm (min. ${fmt(result.e1c)} mm)`,
      `${fmt(result.uR * 100, 0)}% da demanda de resistência`
    ];

    if (result.fLim !== null) {
      parts.push(`f = ${fmt(result.f)} mm para limite ${fmt(result.fLim)} mm`);
      parts.push(`${fmt((result.uF || 0) * 100, 0)}% da demanda de flecha`);
    } else {
      parts.push(`f = ${fmt(result.f)} mm com limite a definir em projeto`);
    }

    parts.push(`critério governante: ${governingLabel(result.governing)}`);
    get("statusSub").textContent = parts.join(" · ");
    get("statusFactConfig").textContent = currentConfig;
    get("statusFactSummary").textContent = result.ok
      ? (result.okF === null ? "Resistência ok; falta critério de flecha" : "Resistência e flecha dentro do limite")
      : (result.governing === "resistencia" ? "Falha por resistência" : "Falha por flecha");
  }

  function renderMetrics(inputs, result) {
    get("mE1").textContent = fmt(result.e1);
    get("mE1Sub").textContent = `e1 x c = ${fmt(result.e1c)} mm`;
    get("mE1Card").className = "metric c-acc";

    get("mER").textContent = fmt(result.eR);
    get("mERSub").textContent = `${result.okR ? "✓" : "✕"} eR ${result.okR ? ">=" : "<"} ${fmt(result.e1c)} mm · ${fmt(result.uR * 100, 0)}%`;
    get("mERCard").className = `metric ${result.okR ? "c-ok" : result.uR <= 1.1 ? "c-warn" : "c-bad"}`;

    get("mEF").textContent = fmt(result.eF);
    get("mEFSub").textContent = inputs.family === "laminado"
      ? `(${inputs.panes.map((pane) => pane.h).join("+")} mm) / eps2 ${fmt(result.eps2 || 1.3)}`
      : "eF = espessura nominal";
    get("mEFCard").className = "metric c-acc2";

    get("mF").textContent = fmt(result.f);
    get("mFSub").textContent = result.fLim !== null
      ? `${result.okF ? "✓" : "✕"} lim ${fmt(result.fLim)} mm · alfa = ${fmt(result.alpha, 4)}`
      : `alfa = ${fmt(result.alpha, 4)} · limite a definir`;
    get("mFCard").className = `metric ${result.okF === true ? "c-ok" : result.okF === false ? ((result.uF || 0) <= 1.1 ? "c-warn" : "c-bad") : "c-warn"}`;
  }

  function renderMemorial(inputs, result, assumptions) {
    const rows = [
      ["Versão da calculadora", constants.APP_META.version],
      ["Norma de referência", constants.APP_META.normRef],
      ["Método da pressão", inputs.pressureMeta && inputs.pressureMeta.mode === "auto" ? "Automático (NBR 10821)" : "Manual"],
      ["Pe - pressão de ensaio", `${inputs.Pv} Pa`],
      ["P = 1,5 x Pe", `${result.P.toFixed(0)} Pa`],
      ["Dimensões (largura x altura)", `${inputs.wMM} x ${inputs.hMM} mm`],
      ["Área S = L x l", `${fmt(result.S, 4)} m²`],
      ["Espessura de referência e1", `${fmt(result.e1)} mm`],
      ["Limite mínimo e1 x c", `${fmt(result.e1c)} mm`]
    ];

    if (inputs.pressureMeta && inputs.pressureMeta.mode === "auto" && inputs.pressureMeta.context) {
      rows.push(["Cidade de referência", `${inputs.pressureMeta.context.cidade}/${inputs.pressureMeta.context.uf}`]);
      rows.push(["Isopleta básica", `${inputs.pressureMeta.context.isopleta} m/s`]);
      rows.push(["Região normativa", inputs.pressureMeta.context.region]);
      rows.push(["Faixa de pavimentos", `Até ${inputs.pressureMeta.context.pavimentos}`]);
    }

    if (inputs.family === "laminado") {
      rows.push(["eps2 (Tab. 4 - 2 vidros)", fmt(result.eps2 || 1.3, 2)]);
      rows.push([`eps3 F1 - ${engine.gtLabel(result.eps3vals[0])}`, fmt(result.eps3vals[0], 2)]);
      rows.push([`eps3 F2 - ${engine.gtLabel(result.eps3vals[1])}`, fmt(result.eps3vals[1], 2)]);
      rows.push(["MAX(eps3)", fmt(result.maxEps3, 2)]);
      rows.push(["Soma das folhas", `${inputs.panes.map((pane) => pane.h).join(" + ")} = ${inputs.panes.reduce((sum, pane) => sum + pane.h, 0)} mm`]);
    } else {
      rows.push([`eps3 - ${engine.gtLabel(result.eps3vals[0])}`, fmt(result.eps3vals[0], 2)]);
      rows.push(["Espessura nominal", `${inputs.panes[0].h} mm`]);
    }

    rows.push(["Verificação eR >= e1 x c", `${fmt(result.eR)} >= ${fmt(result.e1c)} mm`, result.okR, result.uR]);
    rows.push(["eF - esp. equivalente de flecha", `${fmt(result.eF)} mm`]);
    rows.push(["b - vão de referência", `${fmt(result.b * 1000, 0)} mm`]);
    rows.push([`alfa - coef. de deformação (Tab. ${result.apoio === "4" ? "6" : "7"})`, fmt(result.alpha, 5)]);
    rows.push(["Flecha f", `${fmt(result.f)} mm`, result.okF, result.uF]);
    rows.push(["Critério governante", governingLabel(result.governing)]);
    rows.push(["Limite de flecha", result.fLim !== null ? `${fmt(result.fLim)} mm` : "a definir em projeto (§ 4.7.7.3)"]);

    assumptions.forEach((assumption, index) => {
      rows.push([`Hipótese ${index + 1}`, assumption]);
    });

    get("detailTable").innerHTML = rows.map((row) => `
      <tr>
        <td class="dk">${row[0]}</td>
        <td class="dv">${typeof row[2] !== "undefined" ? `${chip(row[2], row[3])} ` : ""}<span>${row[1]}</span></td>
      </tr>
    `).join("");
  }

  function renderChart(inputs, result) {
    const minConfig = get("minConfig");
    const canvas = get("compChart");
    const chartSummary = get("chartSummary");
    const sortedConfigs = inputs.family === "laminado"
      ? constants.CONFIGS_LAM.slice().sort((left, right) => (left.h1 + left.h2) - (right.h1 + right.h2))
      : constants.CONFIGS_MONO.slice();

    const labels = [];
    const resistances = [];
    const deflections = [];
    const currentFlags = [];
    let minByResistance = null;
    let minByFullCheck = null;

    sortedConfigs.forEach((config) => {
      const label = inputs.family === "laminado" ? `${config.h1}+${config.h2}` : `${config} mm`;
      const sumH = inputs.family === "laminado" ? config.h1 + config.h2 : config;
      const eRConfig = inputs.family === "laminado"
        ? sumH / (0.9 * (result.eps2 || 1) * result.maxEps3)
        : sumH / result.maxEps3;
      const eFConfig = inputs.family === "laminado" ? sumH / (result.eps2 || 1) : sumH;
      const fConfig = result.alpha * inputs.Pv * Math.pow(result.b, 4) / Math.pow(eFConfig, 3);
      const uRConfig = result.e1c / eRConfig;
      const uFConfig = result.fLim !== null ? fConfig / result.fLim : null;

      if (!minByResistance && uRConfig <= 1) minByResistance = { label, uR: uRConfig, uF: uFConfig };
      if (!minByFullCheck && uRConfig <= 1 && (uFConfig === null || uFConfig <= 1)) minByFullCheck = { label, uR: uRConfig, uF: uFConfig };

      labels.push(label);
      resistances.push(Number(uRConfig.toFixed(3)));
      deflections.push(uFConfig === null ? null : Number(uFConfig.toFixed(3)));
      currentFlags.push(inputs.family === "laminado"
        ? config.h1 === inputs.panes[0].h && config.h2 === inputs.panes[1].h
        : config === inputs.panes[0].h);
    });

    if (result.fLim === null) {
      get("statusFactMinimum").textContent = minByResistance ? minByResistance.label : "Não encontrado";
      minConfig.innerHTML = minByResistance
        ? `<span style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mut);">Espessura mínima por resistência</span><br><span style="font-size:15px;font-weight:700;color:var(--warn);">${minByResistance.label}</span><span style="font-size:12px;color:var(--mut);margin-left:8px;">flecha depende do critério de projeto</span>`
        : `<span style="font-size:13px;color:var(--bad);">Nenhuma configuração padrão atende à resistência para estas condições.</span>`;
    } else {
      get("statusFactMinimum").textContent = minByFullCheck ? minByFullCheck.label : "Não encontrado";
      minConfig.innerHTML = minByFullCheck
        ? `<span style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mut);">Espessura mínima que atende</span><br><span style="font-size:15px;font-weight:700;color:var(--ok);">${minByFullCheck.label}${inputs.family === "laminado" ? " mm" : ""}</span><span style="font-size:12px;color:var(--mut);margin-left:8px;">resistência ${fmt(minByFullCheck.uR * 100, 0)}% · flecha ${fmt((minByFullCheck.uF || 0) * 100, 0)}%</span>`
        : `<span style="font-size:13px;color:var(--bad);">Nenhuma configuração padrão atende para estas condições.</span>`;
    }

    chartSummary.innerHTML = [
      `<span class="chart-chip">Atual: ${inputs.family === "laminado" ? `${inputs.panes[0].h}+${inputs.panes[1].h} mm` : `${inputs.panes[0].h} mm`}</span>`,
      `<span class="chart-chip">Critério governante: ${governingLabel(result.governing)}</span>`,
      `<span class="chart-chip">Linha tracejada = 100% do limite</span>`
    ].join("");

    if (typeof window.Chart === "undefined") {
      if (compChart) {
        compChart.destroy();
        compChart = null;
      }
      canvas.parentElement.style.display = "none";
      minConfig.innerHTML += '<br><span style="font-size:12px;color:var(--mut);">Gráfico indisponível: Chart.js não carregou.</span>';
      return;
    }

    canvas.parentElement.style.display = "";
    const resistanceColors = currentFlags.map((flag) => flag ? "rgba(240,192,64,0.9)" : "rgba(91,168,245,0.85)");
    const deflectionColors = currentFlags.map((flag) => flag ? "rgba(240,192,64,0.6)" : "rgba(92,240,200,0.75)");
    const validDeflections = deflections.filter((value) => value !== null);
    const maxY = Math.max(1.5, Math.max.apply(null, resistances.concat(validDeflections.length ? validDeflections : [1]))) + 0.1;

    if (compChart) compChart.destroy();

    compChart = new window.Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          { label: "Util. resistência", data: resistances, backgroundColor: resistanceColors, borderRadius: 4, borderSkipped: false },
          { label: "Util. flecha", data: deflections, backgroundColor: deflectionColors, borderRadius: 4, borderSkipped: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: "#7a90b0", font: { size: 11 }, boxWidth: 10, padding: 14 } },
          tooltip: {
            backgroundColor: "#182337",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            titleColor: "#e8f0ff",
            bodyColor: "#7a90b0",
            callbacks: {
              label: function (context) {
                if (context.raw === null) return `${context.dataset.label}: limite a definir`;
                return `${context.dataset.label}: ${(context.raw * 100).toFixed(0)}%`;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#7a90b0", font: { size: 10 }, maxRotation: 45, autoSkip: false } },
          y: {
            min: 0,
            max: maxY,
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#7a90b0", font: { size: 11 }, callback: function (value) { return Number(value).toFixed(1); } },
            title: { display: true, text: "Utilização (1,0 = limite)", color: "#7a90b0", font: { size: 11 } }
          }
        },
        animation: {
          duration: 200,
          onComplete: function () {
            const yPixel = compChart.scales.y.getPixelForValue(1.0);
            const wrapper = canvas.parentElement;
            get("thumbDown").style.top = `${Math.max(4, yPixel - 30)}px`;
            get("thumbUp").style.top = `${Math.min(wrapper.offsetHeight - 30, yPixel + 8)}px`;
          }
        }
      },
      plugins: [{
        id: "limitLine",
        beforeDraw: function (chart) {
          const y = chart.scales.y.getPixelForValue(1.0);
          chart.ctx.save();
          chart.ctx.setLineDash([5, 4]);
          chart.ctx.strokeStyle = "#f06070";
          chart.ctx.lineWidth = 1.5;
          chart.ctx.beginPath();
          chart.ctx.moveTo(chart.chartArea.left, y);
          chart.ctx.lineTo(chart.chartArea.right, y);
          chart.ctx.stroke();
          chart.ctx.restore();
        }
      }]
    });
  }

  app.UI = {
    get,
    fmt,
    renderPressureContext,
    renderChart,
    renderMemorial,
    renderMetrics,
    renderStatus,
    renderValidation,
    updateCross,
    updateInfoApoio
  };
}());
