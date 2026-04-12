(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;
  const engine = app.Engine;
  const technical = app.Technical;
  let compChart = null;

  function get(id) {
    return document.getElementById(id);
  }

  function fmt(value, decimals) {
    const places = typeof decimals === "number" ? decimals : 2;
    return Number(value).toFixed(places).replace(".", ",");
  }

  function familyLabel(family) {
    if (technical && technical.familyLabel) return technical.familyLabel(family);
    return family === "laminado" ? "Laminado" : "Monolítico";
  }

  function governingLabel(governing) {
    if (technical && technical.governingLabel) return technical.governingLabel(governing);
    return governing === "resistencia" ? "resistência" : "flecha";
  }

  function heatLabel(eps3) {
    if (technical && technical.heatLabel) return technical.heatLabel(eps3);
    return engine.gtLabel(eps3);
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

  function normalizedSupportMode(apoio) {
    return apoio === "2" ? "2altura" : apoio;
  }

  function supportPreviewLabel(apoio) {
    const support = normalizedSupportMode(apoio);
    const labels = {
      "4": "4 lados apoiados",
      "2largura": "2 lados com laterais apoiadas",
      "2altura": "2 lados com topo e base apoiados",
      "3menor": "3 lados com largura livre",
      "3maior": "3 lados com altura livre"
    };
    return labels[support] || "Apoio não definido";
  }

  function supportsFor(apoio) {
    // 4       — todas as bordas apoiadas
    // 2       — topo e base (2 lados opostos)
    // 3menor  — largura (borda horizontal) livre: laterais + base, topo livre
    // 3maior  — altura (borda vertical) livre: topo + base + esquerda, direita livre
    const support = normalizedSupportMode(apoio);
    return {
      top: support === "4" || support === "2altura" || support === "3maior",
      bottom: support === "4" || support === "2altura" || support === "3menor" || support === "3maior",
      left: support === "4" || support === "2largura" || support === "3menor" || support === "3maior",
      right: support === "4" || support === "2largura" || support === "3menor"
    };
  }

  function totalGlassThickness(inputs) {
    return (inputs.panes || []).reduce(function (sum, pane) {
      return sum + Number(pane.h || 0);
    }, 0);
  }

  function visualDepth(totalThickness, size) {
    const thickness = Math.max(3, Number(totalThickness) || 10);
    if (size === "thumb") {
      return Math.max(6, Math.min(11, 5 + thickness * 0.18));
    }
    return Math.max(14, Math.min(24, 11 + thickness * 0.42));
  }

  // Layer recipe: blue F1 / yellow PVB / teal F2 for laminated, single
  // blue slab for monolítico. Ratios are visual proxies (not to scale)
  // so the PVB strip stays readable even when the panes are thick.
  function panelLayers(inputs, palette) {
    const tone = palette || {};
    const f1Top = tone.f1Top || "#2e537a";
    const f1Right = tone.f1Right || "#3e7fae";
    const ilTop = tone.ilTop || "rgba(232,196,96,0.55)";
    const ilRight = tone.ilRight || "rgba(232,196,96,0.72)";
    const f2Top = tone.f2Top || "#1f6356";
    const f2Right = tone.f2Right || "#2c8b78";
    const monoTop = tone.monoTop || f1Top;
    const monoRight = tone.monoRight || f1Right;

    if (!inputs || inputs.family !== "laminado" || !Array.isArray(inputs.panes) || inputs.panes.length < 2) {
      return [{ ratio: 1, fillTop: monoTop, fillRight: monoRight }];
    }
    const h1 = Math.max(1, Number(inputs.panes[0].h) || 6);
    const h2 = Math.max(1, Number(inputs.panes[1].h) || 6);
    const il = 1.6; // PVB visual proxy in mm
    const total = h1 + il + h2;
    return [
      { ratio: h1 / total, fillTop: f1Top, fillRight: f1Right },
      { ratio: il / total, fillTop: ilTop, fillRight: ilRight },
      { ratio: h2 / total, fillTop: f2Top, fillRight: f2Right }
    ];
  }

  // Dimetric projection — depth axis goes upper-right (~20° tilt).
  // Visible faces: top + right (layered along Z) + front (glass).
  // We compute true 3D vertices and project them, so the layer slices
  // line up exactly across the top and right faces.
  function buildIsoPanel(opts) {
    const x = opts.x;
    const y = opts.y;
    const w = opts.w;
    const h = opts.h;
    const d = Math.max(0, opts.depth || 12);
    const cosA = 0.94;
    const sinA = 0.34;
    const dx = d * cosA;
    const dy = -d * sinA;

    const sup = opts.supports || {};
    const layers = Array.isArray(opts.layers) && opts.layers.length
      ? opts.layers
      : [{ ratio: 1, fillTop: opts.sideTopFill || "rgba(60,110,140,0.78)", fillRight: opts.sideRightFill || "rgba(75,140,180,0.82)" }];
    const sumRatio = layers.reduce(function (s, l) { return s + (l.ratio || 0); }, 0) || 1;

    const glassFill = opts.glassFill || "url(#panelGlassFill)";
    const glassStroke = opts.glassStroke || "rgba(220,245,255,0.7)";
    const sideStroke = opts.sideStroke || "rgba(176,219,255,0.4)";
    const dashColor = opts.dashColor || "#ff5566";
    const dashWidth = opts.dashWidth || 2.6;
    const dashArray = opts.dashArray || "5 3.5";
    const showShine = opts.showShine !== false;

    const ftl = [x, y];
    const ftr = [x + w, y];
    const fbr = [x + w, y + h];
    const fbl = [x, y + h];
    const btr = [x + w + dx, y + dy];
    const bbr = [x + w + dx, y + h + dy];
    const btl = [x + dx, y + dy];

    let svg = "";

    // Top + right side, sliced by depth into layered parallelograms.
    let cursor = 0;
    layers.forEach(function (layer) {
      const t0 = cursor;
      const t1 = Math.min(1, cursor + (layer.ratio || 0) / sumRatio);
      cursor = t1;
      const ox0 = t0 * dx;
      const oy0 = t0 * dy;
      const ox1 = t1 * dx;
      const oy1 = t1 * dy;

      // Top face slice (between depth t0 and t1).
      svg += `<path d="M${ftl[0] + ox0} ${ftl[1] + oy0} L${ftr[0] + ox0} ${ftr[1] + oy0} L${ftr[0] + ox1} ${ftr[1] + oy1} L${ftl[0] + ox1} ${ftl[1] + oy1} Z" fill="${layer.fillTop}" stroke="${sideStroke}" stroke-width="0.55"/>`;
      // Right face slice.
      svg += `<path d="M${ftr[0] + ox0} ${ftr[1] + oy0} L${fbr[0] + ox0} ${fbr[1] + oy0} L${fbr[0] + ox1} ${fbr[1] + oy1} L${ftr[0] + ox1} ${ftr[1] + oy1} Z" fill="${layer.fillRight}" stroke="${sideStroke}" stroke-width="0.55"/>`;
    });

    // Front glass face.
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glassFill}" stroke="${glassStroke}" stroke-width="1.05"/>`;

    // Minimalist // shine in the upper-right of the front face.
    if (showShine) {
      const sLen = Math.min(w, h) * 0.13;
      const sx = x + w * 0.74;
      const sy = y + h * 0.18;
      svg += `<line x1="${sx}" y1="${sy}" x2="${sx + sLen * 0.55}" y2="${sy - sLen}" stroke="rgba(255,255,255,0.32)" stroke-width="1.4" stroke-linecap="round"/>`;
      svg += `<line x1="${sx + sLen * 0.5}" y1="${sy + sLen * 0.05}" x2="${sx + sLen * 1.05}" y2="${sy - sLen * 0.95}" stroke="rgba(255,255,255,0.2)" stroke-width="1.1" stroke-linecap="round"/>`;
    }

    // Dashed support indicators along the visible edges.
    const dashAttr = `stroke="${dashColor}" stroke-width="${dashWidth}" stroke-dasharray="${dashArray}" stroke-linecap="round" fill="none"`;
    function edge(p1, p2) {
      return `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" ${dashAttr}/>`;
    }
    if (sup.top) { svg += edge(ftl, ftr); svg += edge(btl, btr); }
    if (sup.bottom) { svg += edge(fbl, fbr); }
    if (sup.left) { svg += edge(ftl, fbl); }
    if (sup.right) { svg += edge(ftr, fbr); svg += edge(btr, bbr); }
    return svg;
  }

  function buildPanelPreviewSvg(inputs) {
    const widthMM = Math.max(200, Number(inputs.wMM) || 1200);
    const heightMM = Math.max(200, Number(inputs.hMM) || 2400);
    const ratio = widthMM / heightMM;
    const svgW = 360;
    const svgH = 320;
    // Reserve room for the height dimension on the LEFT and the width
    // dimension on the BOTTOM, plus headroom on the upper-right for the
    // dimetric depth axis.
    const areaW = 152;
    const areaH = 168;
    let panelW;
    let panelH;
    if (ratio > areaW / areaH) {
      panelW = areaW;
      panelH = areaW / ratio;
    } else {
      panelH = areaH;
      panelW = areaH * ratio;
    }

    // Slight bias to the left so the upper-right depth slab does not
    // collide with the inner stage frame.
    const cx = svgW * 0.49;
    const cy = svgH * 0.54;
    const x = cx - panelW / 2;
    const y = cy - panelH / 2;
    const x2 = x + panelW;
    const y2 = y + panelH;
    const support = supportsFor(inputs.apoio);
    const depth = visualDepth(totalGlassThickness(inputs), "preview");
    const layers = panelLayers(inputs);

    return `
      <defs>
        <linearGradient id="panelGlassFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#67d8ff" stop-opacity="0.82"/>
          <stop offset="100%" stop-color="#1c9fe3" stop-opacity="0.78"/>
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="336" height="296" rx="22" fill="rgba(8,12,16,0.5)" stroke="rgba(255,255,255,0.06)"/>

      ${buildIsoPanel({ x: x, y: y, w: panelW, h: panelH, depth: depth, supports: support, layers: layers })}

      <line x1="${x - 20}" y1="${y}" x2="${x - 20}" y2="${y2}" stroke="#d9506f" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="${x - 28}" y1="${y}" x2="${x - 12}" y2="${y}" stroke="#d9506f" stroke-width="1.4"/>
      <line x1="${x - 28}" y1="${y2}" x2="${x - 12}" y2="${y2}" stroke="#d9506f" stroke-width="1.4"/>
      <text x="${x - 10}" y="${(y + y2) / 2 + 4}" text-anchor="start" font-family="DM Mono, monospace" font-size="11" fill="#ffb4be">${fmt(heightMM, 0)} mm</text>

      <line x1="${x}" y1="${y2 + 22}" x2="${x2}" y2="${y2 + 22}" stroke="#d9506f" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="${x}" y1="${y2 + 14}" x2="${x}" y2="${y2 + 30}" stroke="#d9506f" stroke-width="1.4"/>
      <line x1="${x2}" y1="${y2 + 14}" x2="${x2}" y2="${y2 + 30}" stroke="#d9506f" stroke-width="1.4"/>
      <text x="${(x + x2) / 2}" y="${y2 + 38}" text-anchor="middle" font-family="DM Mono, monospace" font-size="11" fill="#ffb4be">${fmt(widthMM, 0)} mm</text>
    `;
  }

  function buildSupportThumbSvg(apoio, inputs) {
    const supports = supportsFor(apoio);
    const vw = 92;
    const vh = 100;
    const w = 38;
    const h = 64;
    const x = (vw - w) / 2 - 3;
    const y = (vh - h) / 2 + 2;
    const thickness = totalGlassThickness(inputs || { panes: [{ h: 6 }, { h: 6 }] });
    const layers = panelLayers(inputs || { family: "laminado", panes: [{ h: 6 }, { h: 6 }] }, {
      f1Top: "#2a4f6d",
      f1Right: "#3a78a0",
      ilTop: "rgba(232,196,96,0.6)",
      ilRight: "rgba(232,196,96,0.78)",
      f2Top: "#1d5a4d",
      f2Right: "#287d6c",
      monoTop: "#2a4f6d",
      monoRight: "#3a78a0"
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" aria-hidden="true">
      ${buildIsoPanel({
        x: x,
        y: y,
        w: w,
        h: h,
        depth: visualDepth(thickness, "thumb"),
        supports: supports,
        layers: layers,
        glassFill: "#3aa6d4",
        glassStroke: "rgba(220,245,255,0.7)",
        dashWidth: 2.2,
        dashArray: "3.5 2.5",
        showShine: false
      })}
    </svg>`;
  }

  function renderSupportThumbs(inputs) {
    const family = inputs && inputs.family ? inputs.family : "laminado";
    const signature = `${family}:${totalGlassThickness(inputs || { panes: [{ h: 6 }, { h: 6 }] })}`;
    document.querySelectorAll(".panel-support-pill").forEach(function (pill) {
      if (pill.dataset.thumbReady === signature) return;
      const apoio = pill.dataset.apoioPreview;
      const label = pill.dataset.label || (pill.textContent || "").trim();
      pill.dataset.label = label;
      pill.innerHTML = buildSupportThumbSvg(apoio, inputs) + `<div class="panel-support-pill-label">${label}</div>`;
      pill.dataset.thumbReady = signature;
    });
  }

  function renderPanelPreview(inputs, technicalResult) {
    const summary = get("panelPreviewSummary");
    const pressureChip = get("panelPreviewPressure");
    const svg = get("panelPreviewSvg");
    const widthValue = get("panelWidthValue");
    const heightValue = get("panelHeightValue");
    const pressure = technicalResult && technicalResult.pressure
      ? technicalResult.pressure
      : (technical && technical.buildPressureTechnical
        ? technical.buildPressureTechnical(inputs.pressureMeta, inputs.Pv)
        : null);
    if (!summary || !pressureChip || !svg || !widthValue || !heightValue) return;

    renderSupportThumbs(inputs);
    summary.textContent = `${supportPreviewLabel(inputs.apoio)} · ${familyLabel(inputs.family)}`;
    pressureChip.textContent = pressure && pressure.pe ? `Pe ${fmt(pressure.pe, 0)} Pa` : "Pe —";
    widthValue.textContent = `${fmt(inputs.wMM, 0)} mm`;
    heightValue.textContent = `${fmt(inputs.hMM, 0)} mm`;
    svg.innerHTML = buildPanelPreviewSvg(inputs);

    document.querySelectorAll(".panel-support-pill").forEach((button) => {
      button.classList.toggle("active", button.dataset.apoioPreview === inputs.apoio);
    });
  }

  function unusedSyncDisclaimerLegacy(accepted, showWarning) {
    const checkbox = get("disclaimerAccept");
    const status = get("disclaimerStatus");
    const reportButton = get("btnRelatorio");
    if (!status || !reportButton) return;

    if (checkbox && checkbox.checked !== accepted) {
      checkbox.checked = accepted;
    }

    reportButton.disabled = !accepted;
    if (accepted) {
      status.textContent = "Aceite registrado. A geração do relatório PDF está liberada.";
      status.style.color = "#57dca8";
      return;
    }

    status.textContent = showWarning
      ? "Marque o aceite para gerar o relatório PDF."
      : "Marque o aceite para liberar a geração do relatório PDF.";
    status.style.color = showWarning ? "#ff7d7d" : "#f4b64a";
  }

  function renderLockedState() {
    const issueList = get("validationIssues");
    const assumptionsList = get("validationAssumptions");
    const detailTable = get("detailTable");
    const chartSummary = get("chartSummary");
    const minConfig = get("minConfig");
    const chartCanvas = get("compChart");
    const statusCard = get("statusCard");

    if (statusCard) statusCard.className = "status fail";
    if (get("statusIcon")) get("statusIcon").textContent = "!";
    if (get("statusTitle")) get("statusTitle").textContent = "Aceite necessário para liberar o cálculo";
    if (get("statusReason")) get("statusReason").textContent = "Os campos podem ser preenchidos, mas o resultado técnico só aparece após o aceite.";
    if (get("statusSub")) get("statusSub").textContent = "Assim a calculadora permanece orientativa e vinculada às limitações declaradas.";
    if (get("statusFactConfig")) get("statusFactConfig").textContent = "Aguardando aceite";
    if (get("statusFactMinimum")) get("statusFactMinimum").textContent = "Aguardando aceite";
    if (get("statusFactSummary")) get("statusFactSummary").textContent = "Resultado técnico bloqueado";

    [
      ["mE1", "—"], ["mER", "—"], ["mEF", "—"], ["mF", "—"],
      ["mE1Sub", "Aguardando aceite."], ["mERSub", "Aguardando aceite."],
      ["mEFSub", "Aguardando aceite."], ["mFSub", "Aguardando aceite."]
    ].forEach(function (pair) {
      const node = get(pair[0]);
      if (node) node.textContent = pair[1];
    });

    ["mE1Card", "mERCard", "mEFCard", "mFCard"].forEach(function (id) {
      const node = get(id);
      if (node) node.className = "metric c-warn";
    });

    if (issueList) {
      issueList.innerHTML = `
        <div class="validation-item warn">
          <strong>Cálculo técnico bloqueado até o aceite</strong>
          <span>Preencha os dados normalmente. O resultado estrutural, o memorial e o comparativo serão liberados quando o termo for aceito.</span>
        </div>
      `;
    }
    if (assumptionsList) {
      assumptionsList.innerHTML = `
        <div class="validation-item">
          <strong>Uso orientativo</strong>
          <span>A calculadora permanece em modo de preparação enquanto o aceite não for confirmado.</span>
        </div>
      `;
    }
    if (detailTable) {
      detailTable.innerHTML = `
        <tr>
          <td class="dk">Status</td>
          <td class="dv"><span>Aceite pendente para liberar o memorial de cálculo.</span></td>
        </tr>
      `;
    }
    if (chartSummary) chartSummary.innerHTML = `<span class="chart-chip">Comparativo bloqueado até o aceite</span>`;
    if (minConfig) minConfig.innerHTML = `<span style="font-size:13px;color:var(--warn);">Aceite o termo para visualizar a espessura mínima que atende.</span>`;
    if (chartCanvas && chartCanvas.parentElement) chartCanvas.parentElement.style.display = "none";
    if (get("thumbDown")) get("thumbDown").style.display = "none";
    if (get("thumbUp")) get("thumbUp").style.display = "none";
  }

  function syncDisclaimer(accepted, showWarning) {
    const checkbox = get("disclaimerAccept");
    const status = get("disclaimerStatus");
    const reportButton = get("btnRelatorio");
    if (!status || !reportButton) return;

    if (checkbox && checkbox.checked !== accepted) {
      checkbox.checked = accepted;
    }

    reportButton.disabled = !accepted;
    var card = checkbox ? checkbox.closest(".disclaimer-card") || checkbox.closest(".card") : null;
    if (card) {
      card.classList.toggle("accepted", accepted);
    }
    if (accepted) {
      status.textContent = "Aceite registrado. O cálculo técnico e o relatório PDF estão liberados.";
      status.style.color = "#57dca8";
      return;
    }

    status.textContent = showWarning
      ? "Marque o aceite para liberar o cálculo técnico e o relatório."
      : "Marque o aceite para liberar o cálculo técnico e o relatório.";
    status.style.color = showWarning ? "#ff7d7d" : "#f4b64a";
  }

  function renderPressureContext(inputs, pressureTechnical) {
    const summary = get("pressureSummary");
    const help = get("pressureHelp");
    const autoBox = get("pressureAutoBox");
    const manualBox = get("pressureManualBox");
    if (!summary || !help || !autoBox || !manualBox) return;

    const pressure = pressureTechnical || (technical && technical.buildPressureTechnical
      ? technical.buildPressureTechnical(inputs.pressureMeta, inputs.Pv)
      : null);

    autoBox.style.display = pressure && pressure.mode === "manual" ? "none" : "";
    manualBox.style.display = pressure && pressure.mode === "manual" ? "" : "none";
    summary.textContent = pressure ? pressure.summaryText : "Seleção normativa indisponível";
    help.textContent = pressure ? pressure.helpText : "Escolha UF, cidade e pavimentos para calcular a pressão automaticamente.";
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

  function renderStatus(inputs, result, technicalResult) {
    const currentConfig = inputs.family === "laminado"
      ? `${inputs.panes[0].h}+${inputs.panes[1].h} mm`
      : `${inputs.panes[0].h} mm`;
    const status = technicalResult && technicalResult.status
      ? technicalResult.status
      : {
          title: result.ok
            ? (result.okF === null ? "Atende em resistência; flecha a definir" : "Composição atende")
            : "Composição não atende",
          reason: result.governing === "resistencia"
            ? "Governado por resistência"
            : "Governado por flecha",
          quickSummary: result.ok
            ? (result.okF === null ? "Resistência ok; falta critério de flecha" : "Resistência e flecha dentro do limite")
            : (result.governing === "resistencia" ? "Falha por resistência" : "Falha por flecha"),
          subText: [
            `${familyLabel(inputs.family)} · ${inputs.wMM} x ${inputs.hMM} mm`,
            `eR = ${fmt(result.eR)} mm (min. ${fmt(result.e1c)} mm)`,
            `${fmt(result.uR * 100, 0)}% da demanda de resistência`,
            result.fLim !== null
              ? `f = ${fmt(result.f)} mm para limite ${fmt(result.fLim)} mm`
              : `f = ${fmt(result.f)} mm com limite a definir em projeto`,
            result.fLim !== null
              ? `${fmt((result.uF || 0) * 100, 0)}% da demanda de flecha`
              : null,
            `critério governante: ${governingLabel(result.governing)}`
          ].filter(Boolean).join(" · ")
        };

    get("statusCard").className = `status ${result.ok ? "ok" : "fail"}`;
    get("statusIcon").textContent = result.ok ? "✓" : "✕";
    get("statusTitle").textContent = status.title;
    get("statusReason").textContent = status.reason;
    get("statusSub").textContent = status.subText;
    get("statusFactConfig").textContent = technicalResult && technicalResult.compositionLabel
      ? technicalResult.compositionLabel
      : currentConfig;
    get("statusFactSummary").textContent = status.quickSummary;
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

  function renderMemorial(inputs, result, assumptions, technicalResult) {
    const pressure = technicalResult && technicalResult.pressure
      ? technicalResult.pressure
      : (technical && technical.buildPressureTechnical
        ? technical.buildPressureTechnical(inputs.pressureMeta, inputs.Pv)
        : null);
    const rows = [
      ["Versão da calculadora", constants.APP_META.version],
      ["Norma de referência", constants.APP_META.normRef],
      ["Método da pressão", pressure && pressure.mode === "auto" ? "Automático (NBR 10821)" : "Manual"],
      ["Pe - pressão de ensaio", `${inputs.Pv} Pa`],
      ["P = 1,5 x Pe", `${result.P.toFixed(0)} Pa`],
      ["Dimensões (largura x altura)", `${inputs.wMM} x ${inputs.hMM} mm`],
      ["Área S = L x l", `${fmt(result.S, 4)} m²`],
      ["Espessura de referência e1", `${fmt(result.e1)} mm`],
      ["Limite mínimo e1 x c", `${fmt(result.e1c)} mm`]
    ];

    if (pressure && pressure.mode === "auto" && inputs.pressureMeta && inputs.pressureMeta.context) {
      rows.push([pressure.detailPrimaryLabel, pressure.detailPrimaryValue]);
      rows.push(["Isopleta básica", `${inputs.pressureMeta.context.isopleta} m/s`]);
      rows.push([pressure.detailSecondaryLabel, pressure.detailSecondaryValue]);
      rows.push(["Faixa de pavimentos", `Até ${inputs.pressureMeta.context.pavimentos}`]);
    } else if (pressure && pressure.mode === "manual") {
      rows.push([pressure.detailPrimaryLabel, pressure.detailPrimaryValue]);
      rows.push([pressure.detailSecondaryLabel, pressure.detailSecondaryValue]);
    }

    if (inputs.family === "laminado") {
      rows.push(["eps2 (Tab. 4 - 2 vidros)", fmt(result.eps2 || 1.3, 2)]);
      rows.push([`eps3 - ${heatLabel(result.eps3vals[0])}`, fmt(result.eps3vals[0], 2)]);
      rows.push(["Soma das folhas", `${inputs.panes.map((pane) => pane.h).join(" + ")} = ${inputs.panes.reduce((sum, pane) => sum + pane.h, 0)} mm`]);
    } else {
      rows.push([`eps3 - ${heatLabel(result.eps3vals[0])}`, fmt(result.eps3vals[0], 2)]);
      rows.push(["Espessura nominal", `${inputs.panes[0].h} mm`]);
    }

    rows.push(["Verificação eR >= e1 x c", `${fmt(result.eR)} >= ${fmt(result.e1c)} mm`, result.okR, result.uR]);
    rows.push(["eF - esp. equivalente de flecha", `${fmt(result.eF)} mm`]);
    rows.push(["b - vão de referência", `${fmt(result.b * 1000, 0)} mm`]);
    const alphaSourceLabel = result.apoio === "4"
      ? "alfa - coef. de deformação (Tab. 6)"
      : result.apoio === "3menor" || result.apoio === "3maior"
      ? "alfa - coef. de deformação (Tab. 7)"
      : "alfa - coef. de deformação (constante para 2 lados)";
    rows.push([alphaSourceLabel, fmt(result.alpha, 5)]);
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
    if (get("thumbDown")) get("thumbDown").style.display = "";
    if (get("thumbUp")) get("thumbUp").style.display = "";
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
    renderPanelPreview,
    renderSupportThumbs,
    renderLockedState,
    syncDisclaimer,
    renderChart,
    renderMemorial,
    renderMetrics,
    renderStatus,
    renderValidation,
    updateCross,
    updateInfoApoio
  };
}());
