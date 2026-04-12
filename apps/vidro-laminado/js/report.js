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

  function buildShareText(snapshot) {
    const inputs = snapshot.inputs;
    const result = snapshot.result;
    const technicalResult = snapshot.technical || null;
    const pressure = technicalResult && technicalResult.pressure ? technicalResult.pressure : null;
    const obra = (app.UI.get("obra").value || "").trim();
    const resp = (app.UI.get("resp").value || "").trim();
    const apoioLabel = constants.APOIO_LABEL[inputs.apoio] || inputs.apoio;
    const title = technicalResult && technicalResult.status
      ? technicalResult.status.title
      : (result.ok ? "Composição aprovada" : "Composição em revisão");

    return [
      "Memorial orientativo de cálculo de vidro",
      obra ? `Obra: ${obra}` : null,
      resp ? `Responsável técnico: ${resp}` : null,
      `Norma: ${constants.APP_META.normRef}`,
      `Resultado: ${title}`,
      `Painel: ${fmt(inputs.wMM, 0)} x ${fmt(inputs.hMM, 0)} mm`,
      `Apoio: ${apoioLabel}`,
      `Pe: ${inputs.Pv} Pa${pressure && pressure.mode === "auto" ? " (automática)" : " (manual)"}`,
      `eR: ${fmt(result.eR, 2)} mm | e1·c: ${fmt(result.e1c, 2)} mm`,
      `Flecha: ${fmt(result.f, 2)} mm${result.fLim !== null ? ` | limite ${fmt(result.fLim, 2)} mm` : " | limite a definir em projeto"}`,
      `Critério governante: ${technicalResult ? technicalResult.criterionLabel : governingLabel(result.governing)}`,
      "Resultado orientativo. A especificação final depende da validação técnica do responsável pelo projeto."
    ].filter(Boolean).join("\n");
  }

  function syncPrimaryActionLabel() {
    const button = app.UI.get("btnPrintReport");
    if (!button) return;
    button.textContent = isMobileSharePreferred() ? "Compartilhar PDF" : "Imprimir / PDF";
  }

  function latin1Bytes(text) {
    const bytes = [];
    const source = String(text || "");
    for (let index = 0; index < source.length; index += 1) {
      const code = source.charCodeAt(index);
      bytes.push(code <= 255 ? code : 63);
    }
    return bytes;
  }

  function pdfUtf16Hex(text) {
    let hex = "FEFF";
    const source = String(text || "").replace(/\r/g, "").replace(/\n/g, " ");
    for (let index = 0; index < source.length; index += 1) {
      const code = source.charCodeAt(index);
      hex += code.toString(16).padStart(4, "0").toUpperCase();
    }
    return `<${hex}>`;
  }

  function buildPdfBlob(snapshot) {
    const inputs = snapshot.inputs;
    const result = snapshot.result;
    const technicalResult = snapshot.technical || null;
    const pressure = technicalResult && technicalResult.pressure ? technicalResult.pressure : null;
    const obra = (app.UI.get("obra").value || "").trim();
    const resp = (app.UI.get("resp").value || "").trim();
    const apoioLabel = constants.APOIO_LABEL[inputs.apoio] || inputs.apoio;
    const title = technicalResult && technicalResult.status
      ? technicalResult.status.title
      : (result.ok ? "Composição aprovada" : "Composição em revisão");
    const pressureLabel = pressure && pressure.mode === "auto" ? "Automática" : "Manual";
    const criterionLabel = technicalResult ? technicalResult.criterionLabel : governingLabel(result.governing);
    const assumptions = (snapshot.assumptions || []).slice(0, 3);

    const lines = [
      { text: "Memorial de Cálculo de Vidro", size: 16, x: 50, y: 790 },
      { text: constants.APP_META.normRef, size: 10, x: 50, y: 772 },
      obra ? { text: `Obra / Projeto: ${obra}`, size: 11, x: 50, y: 748 } : null,
      resp ? { text: `Responsável técnico: ${resp}`, size: 11, x: 50, y: obra ? 732 : 748 } : null,
      { text: `Resultado: ${title}`, size: 12, x: 50, y: obra || resp ? 708 : 724 },
      { text: `Painel: ${fmt(inputs.wMM, 0)} x ${fmt(inputs.hMM, 0)} mm`, size: 11, x: 50, y: obra || resp ? 686 : 702 },
      { text: `Apoio: ${apoioLabel}`, size: 11, x: 50, y: obra || resp ? 670 : 686 },
      { text: `Pe: ${inputs.Pv} Pa (${pressureLabel})`, size: 11, x: 50, y: obra || resp ? 654 : 670 },
      { text: `Resistência: eR ${fmt(result.eR, 2)} mm | e1·c ${fmt(result.e1c, 2)} mm`, size: 11, x: 50, y: obra || resp ? 628 : 644 },
      { text: `Flecha: ${fmt(result.f, 2)} mm${result.fLim !== null ? ` | limite ${fmt(result.fLim, 2)} mm` : " | limite a definir em projeto"}`, size: 11, x: 50, y: obra || resp ? 612 : 628 },
      { text: `Critério governante: ${criterionLabel}`, size: 11, x: 50, y: obra || resp ? 596 : 612 },
      { text: "Premissas principais:", size: 11, x: 50, y: obra || resp ? 566 : 582 },
      ...assumptions.map(function (item, offset) {
        return { text: `- ${item}`, size: 10, x: 62, y: (obra || resp ? 548 : 564) - offset * 16 };
      }),
      { text: "Uso orientativo. A especificação final depende da validação técnica do responsável pelo projeto.", size: 10, x: 50, y: 120 },
      { text: `Versão ${constants.APP_META.version}`, size: 9, x: 50, y: 96 }
    ].filter(Boolean);

    const streamLines = [
      "BT",
      "/F1 16 Tf",
      "0 0 0 rg"
    ];

    lines.forEach(function (line) {
      streamLines.push(`/F1 ${line.size} Tf`);
      streamLines.push(`1 0 0 1 ${line.x} ${line.y} Tm`);
      streamLines.push(`${pdfUtf16Hex(line.text)} Tj`);
    });
    streamLines.push("ET");

    const stream = streamLines.join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
      `<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}\nendstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach(function (object, index) {
      offsets.push(latin1Bytes(pdf).length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = latin1Bytes(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach(function (offset) {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([new Uint8Array(latin1Bytes(pdf))], { type: "application/pdf" });
  }

  // ── Light-theme dimetric panel sketch for print ───────────────────
  function supportsForReport(apoio) {
    const s = apoio === "2" ? "2altura" : (apoio || "4");
    return {
      top:    s === "4" || s === "2altura" || s === "3maior",
      bottom: s === "4" || s === "2altura" || s === "3menor" || s === "3maior",
      left:   s === "4" || s === "2largura" || s === "3menor" || s === "3maior",
      right:  s === "4" || s === "2largura" || s === "3menor"
    };
  }

  function buildLightPanelSvg(wMM, hMM, apoio) {
    const ratio = Math.max(200, wMM) / Math.max(200, hMM);
    const svgW = 152;
    const svgH = 136;
    const areaW = 58;
    const areaH = 84;
    let panelW, panelH;
    if (ratio > areaW / areaH) { panelW = areaW; panelH = areaW / ratio; }
    else                        { panelH = areaH; panelW = areaH * ratio; }

    // Bias toward center-left so the right-side depth doesn't crowd the frame.
    const cx = svgW * 0.46;
    const cy = svgH * 0.54;
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

    const sup = supportsForReport(apoio);
    const da  = `stroke="#dc2626" stroke-width="1.3" stroke-dasharray="4 2.5" stroke-linecap="round" fill="none"`;
    function edge(p1, p2) {
      return `<line x1="${p1[0].toFixed(2)}" y1="${p1[1].toFixed(2)}" x2="${p2[0].toFixed(2)}" y2="${p2[1].toFixed(2)}" ${da}/>`;
    }

    // Glass depth layers (subtle for print: F1 blue / PVB yellow / F2 green).
    const layers = [
      { t0: 0,    t1: 0.46, topFill: "#c7d9f0",  rightFill: "#b0c8e0" },
      { t0: 0.46, t1: 0.54, topFill: "#f5e7a0",  rightFill: "#ecdfa0" },
      { t0: 0.54, t1: 1,    topFill: "#b5ddc8",   rightFill: "#9ecbb5" }
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
    const dimX = x - 12;
    s += `<line x1="${dimX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${dimX.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b7280" stroke-width="0.8" stroke-linecap="round"/>`;
    s += `<line x1="${(dimX - 5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(dimX + 5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<line x1="${(dimX - 5).toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(dimX + 5).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<text x="${(dimX - 7).toFixed(1)}" y="${((y + y2) / 2 + 3).toFixed(1)}" text-anchor="end" font-family="DM Mono,monospace" font-size="8" fill="#374151">${fmt(hMM, 0)} mm</text>`;

    // Width dim on BOTTOM.
    const dimY = y2 + 11;
    s += `<line x1="${x.toFixed(1)}" y1="${dimY.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${dimY.toFixed(1)}" stroke="#6b7280" stroke-width="0.8" stroke-linecap="round"/>`;
    s += `<line x1="${x.toFixed(1)}" y1="${(dimY - 5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(dimY + 5).toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<line x1="${x2.toFixed(1)}" y1="${(dimY - 5).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${(dimY + 5).toFixed(1)}" stroke="#6b7280" stroke-width="0.8"/>`;
    s += `<text x="${((x + x2) / 2).toFixed(1)}" y="${(dimY + 12).toFixed(1)}" text-anchor="middle" font-family="DM Mono,monospace" font-size="8" fill="#374151">${fmt(wMM, 0)} mm</text>`;

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
          </table>

          <div class="rp-block-title" style="margin-top:10px">Composição</div>
          ${buildLaminateStack(inputs, result)}
        </div>

        <div style="display:flex;flex-direction:column;align-items:center">
          <div class="rp-sketch-wrap">
            ${buildLightPanelSvg(inputs.wMM, inputs.hMM, inputs.apoio)}
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

  function openBlobFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
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

    const shareText = buildShareText(snapshot);
    const shareTitle = (app.UI.get("obra").value || "").trim() || "Memorial de cálculo de vidro";
    const pdfBlob = buildPdfBlob(snapshot);
    const pdfName = buildPdfFileName();
    const pdfFile = new File([pdfBlob], pdfName, {
      type: "application/pdf",
      lastModified: Date.now()
    });

    if (navigator.share) {
      try {
        if (!navigator.canShare || navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: shareTitle,
            files: [pdfFile]
          });
          return;
        }

        await navigator.share({
          title: shareTitle,
          text: shareText
        });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    openBlobFile(pdfBlob, pdfName);
  }

  function executarAcaoPrincipal() {
    if (isMobileSharePreferred()) {
      return compartilharRelatorio();
    }
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
