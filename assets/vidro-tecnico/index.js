(function () {
  const app = window.VidroApp = window.VidroApp || {};

  function getConstants() {
    return app.Constants || {};
  }

  function getEngine() {
    return app.Engine || {};
  }

  function formatNumber(value, decimals = 0) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function heatLabel(eps3) {
    const constants = getConstants();
    const key = Number(eps3).toFixed(2);
    return constants.GT_LABEL && constants.GT_LABEL[key]
      ? constants.GT_LABEL[key]
      : `eps3 = ${eps3}`;
  }

  function familyLabel(family) {
    return family === "monolitico" ? "Monolítico" : "Laminado";
  }

  function governingLabel(governing) {
    return governing === "resistencia" ? "resistência" : "flecha";
  }

  function resolvePressureMeta(rawInputs) {
    if (rawInputs && rawInputs.pressureMeta) return rawInputs.pressureMeta;

    const normative = rawInputs && rawInputs.normative ? rawInputs.normative : null;
    const mode = rawInputs && rawInputs.pressureMode === "manual"
      ? "manual"
      : (normative && normative.source === "manual" ? "manual" : "auto");

    return {
      mode,
      context: mode === "auto" ? normative : null
    };
  }

  function buildPressureTechnical(pressureMeta, explicitPe) {
    const meta = pressureMeta || {};
    const mode = meta.mode === "manual" ? "manual" : "auto";
    const context = meta.context || null;
    const peValue = Number.isFinite(Number(explicitPe))
      ? Number(explicitPe)
      : (context && Number.isFinite(Number(context.pe)) ? Number(context.pe) : null);

    if (mode === "manual") {
      const pressureText = peValue !== null
        ? `Pressão manual • Pe ${formatNumber(peValue, 0)} Pa`
        : "Pressão manual";
      return {
        mode,
        pe: peValue,
        ps: null,
        pa: null,
        city: null,
        uf: null,
        region: null,
        isopleta: null,
        pavimentos: null,
        chipText: pressureText,
        summaryText: peValue !== null ? `Pe manual = ${formatNumber(peValue, 0)} Pa` : "Pressão manual",
        helpText: "Pressão informada manualmente pelo usuário, consultor ou projeto.",
        detailPrimaryLabel: "Origem da pressão",
        detailPrimaryValue: "Informada manualmente",
        detailSecondaryLabel: "Enquadramento normativo",
        detailSecondaryValue: "Definido manualmente",
        noteText: peValue !== null
          ? `Pressão informada manualmente: Pe ${formatNumber(peValue, 0)} Pa.`
          : "Pressão informada manualmente.",
        reportText: pressureText
      };
    }

    if (context && Number.isFinite(Number(context.pe))) {
      return {
        mode: "auto",
        pe: Number(context.pe),
        ps: Number.isFinite(Number(context.ps)) ? Number(context.ps) : null,
        pa: Number.isFinite(Number(context.pa)) ? Number(context.pa) : null,
        city: context.cidade,
        uf: context.uf,
        region: context.region,
        isopleta: context.isopleta,
        pavimentos: context.pavimentos,
        chipText: `${context.cidade}/${context.uf} • ${context.isopleta} m/s • Região ${context.region} • Pe ${formatNumber(context.pe, 0)} Pa`,
        summaryText: `${context.cidade}/${context.uf} • ${context.isopleta} m/s • Região ${context.region} • Pe ${formatNumber(context.pe, 0)} Pa`,
        helpText: `Tabela 1 da NBR 10821 para até ${context.pavimentos} pavimentos. Ps de referência ${formatNumber(context.ps, 0)} Pa e Pa ${formatNumber(context.pa, 0)} Pa.`,
        detailPrimaryLabel: "Cidade de referência",
        detailPrimaryValue: `${context.cidade}/${context.uf}`,
        detailSecondaryLabel: "Região NBR",
        detailSecondaryValue: `${context.region} (${context.isopleta} m/s)`,
        noteText: `Enquadramento normativo: ${context.cidade}/${context.uf}, isopleta ${context.isopleta} m/s, região ${context.region}, até ${context.pavimentos} pavimentos.`,
        reportText: `${context.cidade}/${context.uf} · isopleta ${context.isopleta} m/s · Região ${context.region} · até ${context.pavimentos} pavimentos`
      };
    }

    return {
      mode: "auto",
      pe: peValue,
      ps: null,
      pa: null,
      city: null,
      uf: null,
      region: null,
      isopleta: null,
      pavimentos: null,
      chipText: peValue !== null ? `Pe ${formatNumber(peValue, 0)} Pa` : "Pressão indisponível",
      summaryText: peValue !== null ? `Pe ${formatNumber(peValue, 0)} Pa` : "Pressão indisponível",
      helpText: "Escolha UF, cidade e pavimentos para calcular a pressão automaticamente.",
      detailPrimaryLabel: "Cidade de referência",
      detailPrimaryValue: "Não definida",
      detailSecondaryLabel: "Região NBR",
      detailSecondaryValue: "Não definida",
      noteText: "Enquadramento normativo indisponível.",
      reportText: peValue !== null ? `Pe ${formatNumber(peValue, 0)} Pa` : "Pressão indisponível"
    };
  }

  function buildCompositionLabel(inputs) {
    if (inputs.family === "laminado") {
      return `${familyLabel(inputs.family)} ${inputs.panes[0].h}+${inputs.panes[1].h} mm (${heatLabel(inputs.panes[0].eps3)} + ${heatLabel(inputs.panes[1].eps3)})`;
    }
    return `${familyLabel(inputs.family)} ${inputs.panes[0].h} mm (${heatLabel(inputs.panes[0].eps3)})`;
  }

  function buildStatusSummary(inputs, result) {
    const title = result.ok
      ? (result.okF === null ? "Atende em resistência; flecha a definir" : "Composição atende")
      : "Composição não atende";

    const quickSummary = result.ok
      ? (result.okF === null ? "Resistência ok; falta critério de flecha" : "Resistência e flecha dentro do limite")
      : (result.governing === "resistencia" ? "Falha por resistência" : "Falha por flecha");

    const parts = [
      `${familyLabel(inputs.family)} · ${inputs.wMM} x ${inputs.hMM} mm`,
      `eR = ${formatNumber(result.eR, 2)} mm (min. ${formatNumber(result.e1c, 2)} mm)`,
      `${formatNumber(result.uR * 100, 0)}% da demanda de resistência`
    ];

    if (result.fLim !== null) {
      parts.push(`f = ${formatNumber(result.f, 2)} mm para limite ${formatNumber(result.fLim, 2)} mm`);
      parts.push(`${formatNumber((result.uF || 0) * 100, 0)}% da demanda de flecha`);
    } else {
      parts.push(`f = ${formatNumber(result.f, 2)} mm com limite a definir em projeto`);
    }

    parts.push(`critério governante: ${governingLabel(result.governing)}`);

    return {
      title,
      reason: `Governado por ${governingLabel(result.governing)}`,
      quickSummary,
      subText: parts.join(" · ")
    };
  }

  function buildManualThicknessComparison(manualThickness, suggestedThickness) {
    const manual = Number(manualThickness);
    const suggested = Number(suggestedThickness);

    if (!Number.isFinite(suggested) || suggested <= 0) {
      return {
        tone: "warn",
        text: "Sem referência automática carregada."
      };
    }

    if (manual < suggested) {
      return {
        tone: "bad",
        text: `Atende com ${suggested} mm; manual ficou em ${manual} mm`
      };
    }

    if (manual === suggested) {
      return {
        tone: "ok",
        text: `Atende com ${suggested} mm; manual está alinhado`
      };
    }

    return {
      tone: "ok",
      text: `Atende com ${suggested} mm; manual está em ${manual} mm`
    };
  }

  function buildTechnicalResult(inputs, result, validation) {
    const pressureMeta = resolvePressureMeta(inputs);
    const pressure = buildPressureTechnical(pressureMeta, inputs.Pv);

    return {
      pressure,
      familyLabel: familyLabel(inputs.family),
      compositionLabel: buildCompositionLabel(inputs),
      criterionLabel: governingLabel(result.governing),
      heatLabel: heatLabel(result.maxEps3),
      heatLabels: (inputs.panes || []).map((pane) => heatLabel(pane.eps3)),
      status: buildStatusSummary(inputs, result),
      issues: validation ? validation.issues : [],
      assumptions: validation ? validation.assumptions : []
    };
  }

  function evaluate(rawInputs) {
    const engine = getEngine();
    if (!engine.validateInputs || !engine.calcNBR) {
      throw new Error("VidroApp.Technical.evaluate requer VidroApp.Engine carregado.");
    }

    const validation = engine.validateInputs(rawInputs);
    const normalized = validation.normalized;
    normalized.pressureMeta = resolvePressureMeta(rawInputs);

    const result = engine.calcNBR(normalized);
    const technical = buildTechnicalResult(normalized, result, validation);

    return {
      normalized,
      result,
      validation,
      issues: validation.issues,
      assumptions: validation.assumptions,
      technical
    };
  }

  app.Technical = {
    buildCompositionLabel,
    buildManualThicknessComparison,
    buildPressureTechnical,
    buildStatusSummary,
    buildTechnicalResult,
    evaluate,
    familyLabel,
    formatNumber,
    governingLabel,
    heatLabel,
    resolvePressureMeta
  };
}());
