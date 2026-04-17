(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const constants = app.Constants;
  const engine = app.Engine;
  const technical = app.Technical;

  function fmt(value, decimals) {
    const places = typeof decimals === "number" ? decimals : 2;
    return Number(value).toFixed(places).replace(".", ",");
  }

  function governingLabel(governing) {
    if (technical && technical.governingLabel) return technical.governingLabel(governing);
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

  function isMobileSharePreferred() {
    try {
      return window.matchMedia("(max-width: 640px)").matches
        || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    } catch (error) {
      return false;
    }
  }

  function syncPrimaryActionLabel() {
    const button = app.UI.get("btnPrintReport");
    if (!button) return;
    button.textContent = "Imprimir / PDF";
  }

  // ── Light-theme dimetric panel sketch for print ───────────────────
  function buildLightPanelSvg(wMM, hMM, apoio, family) {
    const ratio = Math.max(200, wMM) / Math.max(200, hMM);
    const svgW = 176;
    const svgH = 152;
    const areaW = 62;
    const areaH = 88;
    let panelW, panelH;
    if (ratio > areaW / areaH) { panelW = areaW; panelH = areaW / ratio; }
    else                        { panelH = areaH; panelW = areaH * ratio; }

    // Bias toward center-left so the right-side depth doesn't crowd the frame.
    const cx = svgW * 0.54;
    const cy = svgH * 0.52;
    const x  = cx - panelW / 2;
    const y  = cy - panelH / 2;
    const x2 = x + panelW;
    const y2 = y + panelH;

    // Dimetric depth: upper-right, same angle as screen renderer.
    const d    = 11;
    const cosA = 0.94;
    const sinA = 0.34;
    const dx   = d * cosA;
    const dy   = -d * sinA;

    const ftl = [x,  y];   const ftr = [x2, y];
    const fbl = [x,  y2];  const fbr = [x2, y2];
    const btl = [x  + dx, y  + dy];
    const btr = [x2 + dx, y  + dy];
    const bbr = [x2 + dx, y2 + dy];

    const sup = app.UI.supportsFor(apoio);
    const da  = `stroke="#dc2626" stroke-width="1.3" stroke-dasharray="4 2.5" stroke-linecap="round" fill="none"`;
    function edge(p1, p2) {
      return `<line x1="${p1[0].toFixed(2)}" y1="${p1[1].toFixed(2)}" x2="${p2[0].toFixed(2)}" y2="${p2[1].toFixed(2)}" ${da}/>`;
    }

    // Glass depth layers (monolítico = single blue layer; laminado = F1/PVB/F2).
    const layers = family === "monolitico"
      ? [{ t0: 0, t1: 1, topFill: "#c7d9f0", rightFill: "#b0c8e0" }]
      : [
          { t0: 0,    t1: 0.46, topFill: "#c7d9f0",  rightFill: "#b0c8e0" },
          { t0: 0.46, t1: 0.54, topFill: "#f5e7a0",  rightFill: "#ecdfa0" },
          { t0: 0.54, t1: 1,    topFill: "#b5ddc8",  rightFill: "#9ecbb5" }
        ];

    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">`;

    // Side layer slices (top + right faces).
    layers.forEach(function (layer) {
      const ox0 = layer.t0 * dx; const oy0 = layer.t0 * dy;
      const ox1 = layer.t1 * dx; const oy1 = layer.t1 * dy;
      // Top face slice.
      s += `<path d="M${(x  + ox0).toFixed(2)} ${(y  + oy0).toFixed(2)} L${(x2 + ox0).toFixed(2)} ${(y  + oy0).toFixed(2)} L${(x2 + ox1).toFixed(2)} ${(y  + oy1).toFixed(2)} L${(x  + ox1).toFixed(2)} ${(y  + oy1).toFixed(2)} Z" fill="${layer.topFill}" stroke="#b0bec5" stroke-width="0.5"/>`;
      // Right face slice.
      s += `<path d="M${(x2 + ox0).toFixed(2)} ${(y  + oy0).toFixed(2)} L${(x2 + ox0).toFixed(2)} ${(y2 + oy0).toFixed(2)} L${(x2 + ox1).toFixed(2)} ${(y2 + oy1).toFixed(2)} L${(x2 + ox1).toFixed(2)} ${(y  + oy1).toFixed(2)} Z" fill="${layer.rightFill}" stroke="#b0bec5" stroke-width="0.5"/>`;
    });

    // Glass front face.
    s += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${panelW.toFixed(2)}" height="${panelH.toFixed(2)}" fill="rgba(147,210,255,0.28)" stroke="#60a5fa" stroke-width="1.1"/>`;

    // Subtle // shine.
    const sLen = Math.min(panelW, panelH) * 0.12;
    const sx = x + panelW * 0.72;
    const sy = y + panelH * 0.17;
    s += `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${(sx + sLen * 0.55).toFixed(1)}" y2="${(sy - sLen).toFixed(1)}" stroke="rgba(255,255,255,0.8)" stroke-width="1.2" stroke-linecap="round"/>`;
    s += `<line x1="${(sx + sLen * 0.48).toFixed(1)}" y1="${(sy + sLen * 0.06).toFixed(1)}" x2="${(sx + sLen * 1.03).toFixed(1)}" y2="${(sy - sLen * 0.94).toFixed(1)}" stroke="rgba(255,255,255,0.5)" stroke-width="0.9" stroke-linecap="round"/>`;

    // Support dashes.
    if (sup.top)    { s += edge(ftl, ftr); s += edge(btl, btr); }
    if (sup.bottom) { s += edge(fbl, fbr); }
    if (sup.left)   { s += edge(ftl, fbl); }
    if (sup.right)  { s += edge(ftr, fbr); s += edge(btr, bbr); }

    // Height dim on LEFT.
    const dimX = x - 14;
    s += `<line x1="${dimX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${dimX.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b7280" stroke-width="0.8" stroke-linecap="round"/>`;
    s += `<line x1="${(dimX - 5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(dimX + 5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<line x1="${(dimX - 5).toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(dimX + 5).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<text x="${(dimX - 6).toFixed(1)}" y="${((y + y2) / 2 + 3).toFixed(1)}" text-anchor="end" font-family="DM Mono,monospace" font-size="8" fill="#374151">${fmt(hMM, 0)} mm</text>`;

    // Width dim on BOTTOM.
    const dimY = y2 + 13;
    s += `<line x1="${x.toFixed(1)}" y1="${dimY.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${dimY.toFixed(1)}" stroke="#6b7280" stroke-width="0.8" stroke-linecap="round"/>`;
    s += `<line x1="${x.toFixed(1)}" y1="${(dimY - 5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(dimY + 5).toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<line x1="${x2.toFixed(1)}" y1="${(dimY - 5).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${(dimY + 5).toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<text x="${((x + x2) / 2).toFixed(1)}" y="${(dimY + 14).toFixed(1)}" text-anchor="middle" font-family="DM Mono,monospace" font-size="8" fill="#374151">${fmt(wMM, 0)} mm</text>`;

    s += "</svg>";
    return s;
  }

  // ── Laminate construction stack ───────────────────────────────────
  function buildLaminateStack(inputs, result) {
    function hLabel(eps3) {
      return technical && technical.heatLabel ? technical.heatLabel(eps3) : engine.gtLabel(eps3);
    }
    if (inputs.family !== "laminado" || !Array.isArray(inputs.panes) || inputs.panes.length < 2) {
      const p = inputs.panes[0];
      return `<div class="rp-lam-stack">
        <div class="rp-lam-pane rp-lam-f1">Monolítico · ${hLabel(p.eps3)}<span>${p.h} mm</span></div>
        <div class="rp-lam-total">Espessura nominal: <strong>${p.h} mm</strong></div>
      </div>`;
    }
    const p1 = inputs.panes[0];
    const p2 = inputs.panes[1];
    return `<div class="rp-lam-stack">
      <div class="rp-lam-pane rp-lam-f1">F1 · Exterior<span>${p1.h} mm</span></div>
      <div class="rp-lam-pane rp-lam-pvb">Intercalar PVB<span>0,38 mm</span></div>
      <div class="rp-lam-pane rp-lam-f2">F2 · Interior<span>${p2.h} mm</span></div>
      <div class="rp-lam-total">
        ${hLabel(p1.eps3)} &nbsp;·&nbsp;
        Esp. nominal: <strong>${p1.h + p2.h} mm</strong>
        &nbsp;·&nbsp; ε₂ = <strong>${result.eps2.toFixed(2)}</strong>
        &nbsp;·&nbsp; ε₃ = <strong>${result.eps3vals[0].toFixed(2)}</strong>
      </div>
    </div>`;
  }

  // ── Utilization bar ───────────────────────────────────────────────
  function uBar(ratio, ok) {
    if (ratio === null || ratio === undefined) return "";
    const pct = Math.min(100, (ratio * 100)).toFixed(0);
    const cls  = ok ? "ok" : "fail";
    return `<div class="rp-ubar"><div class="rp-ubar-fill ${cls}" style="width:${pct}%"></div></div>`;
  }

  // ── Main report generator ─────────────────────────────────────────
  function gerarRelatorio() {
    const snapshot      = app.Controller.getSnapshot();
    const inputs        = snapshot.inputs;
    const result        = snapshot.result;
    const assumptions   = snapshot.assumptions;
    const technicalResult = snapshot.technical || (technical && technical.buildTechnicalResult
      ? technical.buildTechnicalResult(inputs, result, { assumptions, issues: snapshot.issues || [] })
      : null);
    const pressure = technicalResult && technicalResult.pressure ? technicalResult.pressure : null;
    const status   = technicalResult && technicalResult.status   ? technicalResult.status   : null;

    const obra = (app.UI.get("obra").value || "").trim();
    const resp = (app.UI.get("resp").value || "").trim();
    const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    // Result state.
    const isOk   = result.ok;
    const isWarn = !result.ok && result.okR && result.okF === null;
    const title  = status ? status.title
      : isOk   ? "Composição aprovada"
      : isWarn ? "Aprovada em resistência — flecha a definir em projeto"
      : "Composição reprovada";

    const resultColor  = isOk ? "#16a34a" : isWarn ? "#d97706" : "#dc2626";
    const resultBg     = isOk ? "#f0fdf4" : isWarn ? "#fffbeb" : "#fef2f2";
    const resultBorder = isOk ? "#bbf7d0" : isWarn ? "#fde68a" : "#fecaca";
    const resultIcon   = isOk ? "✓"       : isWarn ? "~"       : "✕";

    const apoioLabel    = constants.APOIO_LABEL[inputs.apoio] || inputs.apoio;
    const pressureLabel = pressure && pressure.mode === "auto" ? "Automática — ABNT NBR 10821" : "Manual";
    const familyLabel   = inputs.family === "laminado" ? "Laminado" : "Monolítico";
    const panes         = Array.isArray(inputs.panes) ? inputs.panes : [];
    const nominalThickness = panes.reduce(function (sum, pane) {
      return sum + (Number(pane.h) || 0);
    }, 0);
    const compositionLabel = inputs.family === "laminado"
      ? panes.map(function (pane) { return `${pane.h} mm`; }).join(" + ")
      : `${(panes[0] && panes[0].h) || nominalThickness} mm`;
    const originLabel = technicalResult && technicalResult.originLabel ? technicalResult.originLabel : "cálculo automático";
    const issues = (snapshot.issues || []).slice(0, 2);

    // Formula labels.
    const eFLabel = inputs.family === "laminado"
      ? `(${inputs.panes.map(function (p) { return p.h; }).join("+")}) / ε₂ ${result.eps2.toFixed(2)} = ${result.eF.toFixed(2)} mm`
      : `${inputs.panes[0].h} mm`;
    const eRFormula = inputs.family === "laminado"
      ? `(${inputs.panes.map(function (p) { return p.h; }).join("+")}) / (0,9 × ε₂ ${result.eps2.toFixed(2)} × MAX(ε₃) ${result.maxEps3.toFixed(2)}) = ${result.eR.toFixed(2)} mm`
      : `${inputs.panes[0].h} mm / ε₃ ${result.maxEps3.toFixed(2)} = ${result.eR.toFixed(2)} mm`;

    const alphaRatio = result.apoio === "4"      ? result.lM / result.LM
      : result.apoio === "3menor"                ? result.LM / result.lM
      : result.apoio === "3maior"                ? result.lM / result.LM
      : null;
    const alphaLabel = result.apoio === "4"
      ? `α (Tab. 6${alphaRatio !== null ? " · razão " + fmt(alphaRatio, 3) : ""})`
      : result.apoio === "3menor" || result.apoio === "3maior"
      ? `α (Tab. 7${alphaRatio !== null ? " · razão " + fmt(alphaRatio, 3) : ""})`
      : "α (constante — 2 lados)";

    function heatLabel(eps3) {
      return technical && technical.heatLabel ? technical.heatLabel(eps3) : engine.gtLabel(eps3);
    }

    // Utilization.
    const uR    = result.uR  || 0;
    const uF    = result.uF  !== null && result.uF !== undefined ? result.uF : null;
    const vCardR = result.okR ? "ok" : "fail";
    const vCardF = uF === null ? "neutral" : result.okF ? "ok" : "fail";

    app.UI.get("reportContent").innerHTML = `
      <!-- ── Header ── -->
      <div class="rp-header">
        <div>
          <img src="../../assets/olgacolor-logo.png" alt="Olgacolor" class="rp-logo">
          <div class="rp-title">Memorial de Cálculo de Vidro</div>
          <div class="rp-sub">${constants.APP_META.normRef} · v${constants.APP_META.version}</div>
        </div>
        <div class="rp-meta">
          Data: ${data}<br>
          ${resp ? `Responsável: ${resp}<br>` : ""}
          Norma: ${constants.APP_META.normRef}<br>
          Coeficiente c = 1,0
        </div>
      </div>

      ${obra ? `<div class="rp-obra">Obra / Projeto: ${obra}</div>` : ""}

      <div class="rp-summary">
        <div class="rp-summary-card">
          <div class="rp-summary-k">Pressão adotada</div>
          <div class="rp-summary-v">${inputs.Pv} Pa</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Composição</div>
          <div class="rp-summary-v">${familyLabel} · ${compositionLabel}</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Espessura nominal</div>
          <div class="rp-summary-v">${fmt(nominalThickness, 0)} mm</div>
        </div>
        <div class="rp-summary-card">
          <div class="rp-summary-k">Critério governante</div>
          <div class="rp-summary-v">${technicalResult ? technicalResult.criterionLabel : governingLabel(result.governing)}</div>
        </div>
      </div>

      <!-- ── 2-column overview ── -->
      <div class="rp-overview">
        <div>
          <div class="rp-block-title">Dados do Painel</div>
          <table class="rp-info-table">
            <tr><td class="rp-ik">Largura × Altura</td><td class="rp-iv">${fmt(inputs.wMM, 0)} × ${fmt(inputs.hMM, 0)} mm</td></tr>
            <tr><td class="rp-ik">Área S</td><td class="rp-iv">${fmt(result.S, 4)} m²</td></tr>
            <tr><td class="rp-ik">Apoio</td><td class="rp-iv">${apoioLabel}</td></tr>
            <tr><td class="rp-ik">Pe</td><td class="rp-iv">${inputs.Pv} Pa (${pressureLabel.toLowerCase()})</td></tr>
            <tr><td class="rp-ik">P = 1,5 × Pe</td><td class="rp-iv">${result.P.toFixed(0)} Pa</td></tr>
            <tr><td class="rp-ik">Origem adotada</td><td class="rp-iv">${originLabel}</td></tr>
          </table>

          <div class="rp-block-title" style="margin-top:10px">Composição</div>
          ${buildLaminateStack(inputs, result)}
        </div>

        <div style="display:flex;flex-direction:column;align-items:center">
          <div class="rp-sketch-wrap">
            ${buildLightPanelSvg(inputs.wMM, inputs.hMM, inputs.apoio, inputs.family)}
          </div>
          <div class="rp-apoio-label">${apoioLabel}</div>
        </div>
      </div>

      <!-- ── Verification cards with formula details ── -->
      <div class="rp-verify-row">
        <div class="rp-verify-card ${vCardR}">
          <div class="rp-verify-label">Resistência — eR</div>
          <div class="rp-verify-val">${fmt(result.eR, 2)} mm</div>
          <div class="rp-verify-limit">${result.okR ? "≥" : "<"} e1·c = ${fmt(result.e1c, 2)} mm</div>
          ${uBar(uR, result.okR)}
          <div class="rp-verify-pct">${(uR * 100).toFixed(0)}% da demanda</div>
          <div class="rp-verify-detail">
            e1 = ${fmt(result.e1, 2)} mm &nbsp;·&nbsp; eR = ${eRFormula}
          </div>
        </div>
        <div class="rp-verify-card ${vCardF}">
          <div class="rp-verify-label">Flecha — f</div>
          <div class="rp-verify-val">${fmt(result.f, 2)} mm</div>
          <div class="rp-verify-limit">${result.fLim !== null
            ? `${result.okF ? "≤" : ">"} fLim = ${fmt(result.fLim, 2)} mm`
            : "Limite a definir em projeto"}</div>
          ${uBar(uF, result.okF)}
          <div class="rp-verify-pct">${uF !== null ? `${(uF * 100).toFixed(0)}% da demanda` : "§ 4.7.7.3"}</div>
          <div class="rp-verify-detail">
            eF = ${eFLabel} &nbsp;·&nbsp; b = ${fmt(result.b * 1000, 0)} mm<br>
            ${alphaLabel} = ${result.alpha.toFixed(5)}
          </div>
        </div>
      </div>

      <!-- ── Result box ── -->
      <div class="rp-result-big" style="background:${resultBg};border-color:${resultBorder}">
        <div class="rp-result-big-icon" style="background:${resultColor}">${resultIcon}</div>
        <div>
          <div class="rp-result-big-title" style="color:${resultColor}">${title}</div>
          <div class="rp-result-big-sub">
            eR ${fmt(result.eR, 2)} ${result.okR ? "≥" : "<"} ${fmt(result.e1c, 2)} mm (${(uR * 100).toFixed(0)}%)
            &nbsp;·&nbsp;
            f ${fmt(result.f, 2)} ${result.fLim !== null
              ? `${result.okF ? "≤" : ">"} ${fmt(result.fLim, 2)} mm (${((uF || 0) * 100).toFixed(0)}%)`
              : "— limite a definir"}
            &nbsp;·&nbsp; Gov: ${technicalResult ? technicalResult.criterionLabel : governingLabel(result.governing)}
          </div>
        </div>
      </div>

      <div class="rp-overview" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
        <div class="rp-summary-card" style="padding:10px 12px;">
          <div class="rp-summary-k">Leitura técnica</div>
          <div class="rp-result-big-sub" style="margin:0; color:#374151;">
            ${familyLabel} ${compositionLabel} · ${panes[0] ? heatLabel(panes[0].eps3) : "-"}<br>
            ${pressureLabel} · α = ${result.alpha.toFixed(5)} · b = ${fmt(result.b * 1000, 0)} mm
          </div>
        </div>
        <div class="rp-summary-card" style="padding:10px 12px;">
          <div class="rp-summary-k">Hipóteses e ressalvas</div>
          <div class="rp-result-big-sub" style="margin:0; color:#374151;">
            ${assumptions.slice(0, 2).join(" · ")}
            ${issues.length ? `<br>${issues.join(" · ")}` : ""}
          </div>
        </div>
      </div>

      <div class="rp-norma">
        ${assumptions.join(" · ")}
        <br>
        ${constants.APP_META.normRef} · §§ 4.7.3 · 4.7.6.3 · 4.7.7.2 · 4.7.7.5 · Tab. 4, 6, 7
        ${pressure && pressure.mode === "auto" ? " · Pressão via NBR 10821" : ""}
        · v${constants.APP_META.version}
      </div>`;

    syncPrimaryActionLabel();
    document.title = obra
      ? `${obra} — ${constants.APP_META.normRef}`
      : `Memorial de Cálculo — ${constants.APP_META.normRef}`;
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

  function buildPdfFileName() {
    const obra = (app.UI.get("obra").value || "").trim();
    const source = obra || "memorial-calculo-vidro";
    const slug = source
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    return `${slug || "memorial-calculo-vidro"}.pdf`;
  }

  async function buildPdfBlobFromHtml() {
    const element = app.UI.get("reportContent");
    const overlay = app.UI.get("reportOverlay");

    // Temporariamente remove overflow do overlay para html2canvas capturar tudo
    const prevOverflow = overlay.style.overflow;
    const prevPosition = overlay.style.position;
    overlay.style.overflow = "visible";
    overlay.style.position = "absolute";

    let canvas;
    try {
      canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0
      });
    } finally {
      overlay.style.overflow = prevOverflow;
      overlay.style.position = prevPosition;
    }

    const imgData  = canvas.toDataURL("image/jpeg", 0.92);
    const { jsPDF } = window.jspdf;

    // Página com largura A4 e altura proporcional ao conteúdo — sem cortes
    const pdfW = 210;
    const pdfH = Math.ceil((canvas.height / canvas.width) * pdfW);
    const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, pdfH] });

    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);

    return pdf.output("blob");
  }

  function openBlobFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    if (isMobileSharePreferred()) {
      const popup = window.open(url, "_blank", "noopener");
      if (!popup) {
        window.location.href = url;
      }
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 12000);
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 4000);
  }

  async function compartilharRelatorio() {
    const snapshot = app.Controller.getSnapshot();
    if (!snapshot) return;

    const pdfName = buildPdfFileName();
    const shareBtn = app.UI.get("btnShareReport");
    const mainBtn  = app.UI.get("btnPrintReport");
    const busyBtn  = shareBtn && shareBtn.offsetParent !== null ? shareBtn : mainBtn;
    const origText = busyBtn ? busyBtn.textContent : null;

    if (busyBtn) { busyBtn.disabled = true; busyBtn.textContent = "Gerando PDF…"; }

    let pdfBlob;
    try {
      if (!window.html2canvas || !window.jspdf) {
        throw new Error("Bibliotecas de PDF indisponíveis. Verifique a conexão e recarregue a página.");
      }
      pdfBlob = await buildPdfBlobFromHtml();
    } catch (error) {
      if (busyBtn) { busyBtn.disabled = false; busyBtn.textContent = origText; }
      alert(error && error.message ? error.message : "Falha ao gerar PDF.");
      return;
    }

    const pdfFile = new File([pdfBlob], pdfName, {
      type: "application/pdf",
      lastModified: Date.now()
    });

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [pdfFile] }))) {
        await navigator.share({ files: [pdfFile] });
        return;
      }
      openBlobFile(pdfBlob, pdfName);
    } catch (error) {
      if (!error || error.name !== "AbortError") {
        openBlobFile(pdfBlob, pdfName);
      }
    } finally {
      if (busyBtn) { busyBtn.disabled = false; busyBtn.textContent = origText; }
    }
  }

  function executarAcaoPrincipal() {
    return imprimirRelatorio();
  }

  app.Report = {
    compartilharRelatorio,
    executarAcaoPrincipal,
    fecharRelatorio,
    gerarRelatorio,
    imprimirRelatorio,
    syncPrimaryActionLabel
  };
}());
