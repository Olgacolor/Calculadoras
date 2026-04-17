(function () {
  const app = window.VidroApp = window.VidroApp || {};
  const technical = app.Technical;

  const state = {
    family: "laminado",
    pressureMode: "auto",
    snapshot: null,
    disclaimerAccepted: false
  };

  function resolveAutoPressure() {
    if (!window.NBR10821) return null;
    return window.NBR10821.resolve({
      uf: app.UI.get("windState").value,
      city: app.UI.get("windCity").value,
      floors: Number(app.UI.get("buildingFloors").value)
    });
  }

  function readInputs() {
    const pressureMeta = state.pressureMode === "auto"
      ? { mode: "auto", context: resolveAutoPressure() }
      : { mode: "manual", context: null };

    const autoPe = pressureMeta.context ? pressureMeta.context.pe : null;

    return {
      wMM: Number(app.UI.get("width").value),
      hMM: Number(app.UI.get("height").value),
      Pv: state.pressureMode === "auto" ? autoPe : Number(app.UI.get("pv").value),
      apoio: app.UI.get("apoio").value,
      family: state.family,
      pressureMeta: pressureMeta,
      panes: state.family === "laminado"
        ? (function () {
          var gt = Number(app.UI.get("gtLam").value);
          return [
            { h: Number(app.UI.get("h1").value), eps3: gt },
            { h: Number(app.UI.get("h2").value), eps3: gt }
          ];
        })()
        : [
          { h: Number(app.UI.get("monoH").value), eps3: Number(app.UI.get("monoGt").value) }
        ]
    };
  }

  function syncNormalizedInputs(inputs) {
    app.UI.get("width").value = inputs.wMM;
    app.UI.get("height").value = inputs.hMM;
    if (state.pressureMode === "manual") {
      app.UI.get("pv").value = inputs.Pv;
    }
    app.UI.get("apoio").value = inputs.apoio;

    if (inputs.family === "laminado") {
      app.UI.get("h1").value = inputs.panes[0].h;
      app.UI.get("h2").value = inputs.panes[1].h;
      app.UI.get("gtLam").value = inputs.panes[0].eps3.toFixed(2);
    } else {
      app.UI.get("monoH").value = inputs.panes[0].h;
      app.UI.get("monoGt").value = inputs.panes[0].eps3.toFixed(2);
    }
  }

  function buildPreviewInputs(rawInputs) {
    return {
      wMM: Number.isFinite(rawInputs.wMM) && rawInputs.wMM > 0 ? rawInputs.wMM : 1200,
      hMM: Number.isFinite(rawInputs.hMM) && rawInputs.hMM > 0 ? rawInputs.hMM : 2400,
      Pv: Number.isFinite(rawInputs.Pv) && rawInputs.Pv > 0 ? rawInputs.Pv : 0,
      apoio: rawInputs.apoio || "4",
      family: rawInputs.family,
      pressureMeta: rawInputs.pressureMeta,
      panes: rawInputs.panes
    };
  }

  function calculateAndRender() {
    const rawInputs = readInputs();
    const previewInputs = buildPreviewInputs(rawInputs);

    app.UI.updateInfoApoio(previewInputs.apoio);
    app.UI.renderPressureContext(previewInputs);
    app.UI.renderPanelPreview(previewInputs, null);
    app.UI.updateCross(previewInputs);

    if (!state.disclaimerAccepted) {
      app.UI.renderLockedState();
      state.snapshot = null;
      return null;
    }

    if (rawInputs.pressureMeta.mode === "auto" && (!Number.isFinite(rawInputs.Pv) || rawInputs.Pv <= 0)) {
      app.UI.renderValidation([{
        tone: "warn",
        title: "Pressão de vento indisponível",
        body: "A resolução automática não encontrou dados para a cidade selecionada. Escolha outra cidade ou use pressão manual."
      }], []);
      state.snapshot = null;
      return null;
    }

    const fallbackValidation = technical && technical.evaluate ? null : app.Engine.validateInputs(rawInputs);
    const evaluation = technical && technical.evaluate
      ? technical.evaluate(rawInputs)
      : {
          normalized: fallbackValidation.normalized,
          result: app.Engine.calcNBR(fallbackValidation.normalized),
          validation: fallbackValidation,
          issues: fallbackValidation.issues,
          assumptions: fallbackValidation.assumptions,
          technical: null
        };
    const validation = evaluation.validation;
    const inputs = evaluation.normalized;
    inputs.pressureMeta = rawInputs.pressureMeta;
    const result = evaluation.result;
    const technicalResult = evaluation.technical || null;

    syncNormalizedInputs(inputs);
    app.UI.updateInfoApoio(inputs.apoio);
    app.UI.renderPressureContext(inputs, technicalResult && technicalResult.pressure);
    app.UI.renderPanelPreview(inputs, technicalResult);
    app.UI.updateCross(inputs);
    app.UI.renderValidation(validation.issues, validation.assumptions);
    app.UI.renderStatus(inputs, result, technicalResult);
    app.UI.renderMetrics(inputs, result);
    app.UI.renderMemorial(inputs, result, validation.assumptions, technicalResult);
    app.UI.renderChart(inputs, result);

    state.snapshot = {
      inputs: inputs,
      result: result,
      assumptions: validation.assumptions,
      issues: validation.issues,
      technical: technicalResult
    };

    return state.snapshot;
  }

  function setFamily(nextFamily) {
    state.family = nextFamily === "monolitico" ? "monolitico" : "laminado";
    app.UI.get("blockLam").style.display = state.family === "laminado" ? "" : "none";
    app.UI.get("blockMono").style.display = state.family === "monolitico" ? "" : "none";
    app.UI.get("familySeg").querySelectorAll("button").forEach((button) => {
      button.classList.toggle("active", button.dataset.fam === state.family);
    });
  }

  function setPressureMode(nextMode) {
    state.pressureMode = nextMode === "manual" ? "manual" : "auto";
    app.UI.get("pressureModeSeg").querySelectorAll("button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === state.pressureMode);
    });
    app.UI.get("pressureAutoBox").style.display = state.pressureMode === "auto" ? "" : "none";
    app.UI.get("pressureManualBox").style.display = state.pressureMode === "manual" ? "" : "none";
  }

  function populatePressureFields() {
    if (!window.NBR10821) return;
    const states = window.NBR10821.getStates();
    const stateSelect = app.UI.get("windState");
    const citySelect = app.UI.get("windCity");
    const preferredUf = states.some((item) => item.uf === "SP") ? "SP" : (states[0] ? states[0].uf : "");

    stateSelect.innerHTML = states.map((item) => `<option value="${item.uf}">${item.uf} - ${item.estado}</option>`).join("");
    stateSelect.value = preferredUf;

    function renderCities() {
      const cities = window.NBR10821.getCities(stateSelect.value);
      citySelect.innerHTML = cities.map((item) => `<option value="${item.cidade}">${item.cidade}</option>`).join("");
      const preferredCity = cities.some((item) => item.cidade === "São Paulo") ? "São Paulo" : (cities[0] ? cities[0].cidade : "");
      citySelect.value = preferredCity;
    }

    renderCities();
    stateSelect.addEventListener("change", function () {
      renderCities();
      calculateAndRender();
    });
  }

  function bindEvents() {
    app.UI.get("familySeg").querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", function () {
        setFamily(button.dataset.fam);
        calculateAndRender();
      });
    });

    app.UI.get("presets").querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", function () {
        app.UI.get("presets").querySelectorAll("button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const values = button.dataset.p.split(",");
        app.UI.get("h1").value = Number(values[0]);
        app.UI.get("h2").value = Number(values[1]);
        calculateAndRender();
      });
    });

    app.UI.get("pressureModeSeg").querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", function () {
        setPressureMode(button.dataset.mode);
        calculateAndRender();
      });
    });

    let pvDebounce = null;
    const debouncedRender = () => {
      if (pvDebounce) clearTimeout(pvDebounce);
      pvDebounce = setTimeout(calculateAndRender, 250);
    };

    ["width", "height", "pv", "apoio", "h1", "h2", "gtLam", "monoH", "monoGt"].forEach((id) => {
      const element = app.UI.get(id);
      if (!element) return;
      element.addEventListener("change", calculateAndRender);
      if (element.tagName === "INPUT") {
        // Pv é digitado livremente — debounce evita recálculo a cada tecla.
        element.addEventListener("input", id === "pv" ? debouncedRender : calculateAndRender);
      }
    });

    ["windCity", "buildingFloors"].forEach((id) => {
      const element = app.UI.get(id);
      if (!element) return;
      element.addEventListener("change", calculateAndRender);
    });

    const disclaimerAccept = app.UI.get("disclaimerAccept");
    if (disclaimerAccept) {
      disclaimerAccept.addEventListener("change", function () {
        state.disclaimerAccepted = Boolean(disclaimerAccept.checked);
        app.UI.syncDisclaimer(state.disclaimerAccepted);
        calculateAndRender();
      });
    }

    document.querySelectorAll("[data-adjust]").forEach((button) => {
      button.addEventListener("click", function () {
        const widthInput = app.UI.get("width");
        const heightInput = app.UI.get("height");
        const currentWidth = Number(widthInput.value || 1200);
        const currentHeight = Number(heightInput.value || 2400);
        const step = 50;

        if (button.dataset.adjust === "width-minus") widthInput.value = Math.max(200, currentWidth - step);
        if (button.dataset.adjust === "width-plus") widthInput.value = Math.min(6000, currentWidth + step);
        if (button.dataset.adjust === "height-minus") heightInput.value = Math.max(200, currentHeight - step);
        if (button.dataset.adjust === "height-plus") heightInput.value = Math.min(6000, currentHeight + step);
        calculateAndRender();
      });
    });

    // Inputs editáveis de dimensão (espelhados nos hidden #width / #height)
    [["panelWidthValue", "width"], ["panelHeightValue", "height"]].forEach(([visibleId, hiddenId]) => {
      const visible = document.getElementById(visibleId);
      const hidden = app.UI.get(hiddenId);
      if (!visible || !hidden) return;
      const sync = () => {
        const value = Number(visible.value);
        if (!Number.isFinite(value)) return;
        hidden.value = Math.min(6000, Math.max(200, value));
        debouncedRender();
      };
      visible.addEventListener("input", sync);
      visible.addEventListener("change", () => {
        const clamped = Math.min(6000, Math.max(200, Number(visible.value) || 200));
        visible.value = clamped;
        hidden.value = clamped;
        calculateAndRender();
      });
    });

    document.querySelectorAll("[data-apoio-preview]").forEach((button) => {
      button.addEventListener("click", function () {
        app.UI.get("apoio").value = button.dataset.apoioPreview;
        calculateAndRender();
      });
    });

    app.UI.get("btnRelatorio").addEventListener("click", function () {
      if (!state.disclaimerAccepted) {
        app.UI.syncDisclaimer(false, true);
        return;
      }
      app.Report.gerarRelatorio();
    });
    app.UI.get("btnPrintReport").addEventListener("click", app.Report.executarAcaoPrincipal);
    app.UI.get("btnCloseReport").addEventListener("click", app.Report.fecharRelatorio);
    const btnShareReport = app.UI.get("btnShareReport");
    if (btnShareReport) {
      if (navigator.share) btnShareReport.style.display = "";
      btnShareReport.addEventListener("click", app.Report.compartilharRelatorio);
    }
  }

  app.Controller = {
    calculateAndRender: calculateAndRender,
    getSnapshot: function () {
      return state.snapshot || calculateAndRender();
    }
  };

  setFamily("laminado");
  setPressureMode("auto");
  populatePressureFields();
  app.UI.renderSupportThumbs();
  bindEvents();
  app.Report.syncPrimaryActionLabel();
  app.UI.syncDisclaimer(false);
  calculateAndRender();
}());
