(function () {
  const app = window.VidroApp = window.VidroApp || {};

  const state = {
    family: "laminado",
    snapshot: null
  };

  function readInputs() {
    return {
      wMM: Number(app.UI.get("width").value),
      hMM: Number(app.UI.get("height").value),
      Pv: Number(app.UI.get("pv").value),
      apoio: app.UI.get("apoio").value,
      family: state.family,
      panes: state.family === "laminado"
        ? [
          { h: Number(app.UI.get("h1").value), eps3: Number(app.UI.get("gt1").value) },
          { h: Number(app.UI.get("h2").value), eps3: Number(app.UI.get("gt2").value) }
        ]
        : [
          { h: Number(app.UI.get("monoH").value), eps3: Number(app.UI.get("monoGt").value) }
        ]
    };
  }

  function syncNormalizedInputs(inputs) {
    app.UI.get("width").value = inputs.wMM;
    app.UI.get("height").value = inputs.hMM;
    app.UI.get("pv").value = inputs.Pv;
    app.UI.get("apoio").value = inputs.apoio;

    if (inputs.family === "laminado") {
      app.UI.get("h1").value = inputs.panes[0].h;
      app.UI.get("h2").value = inputs.panes[1].h;
      app.UI.get("gt1").value = inputs.panes[0].eps3.toFixed(2);
      app.UI.get("gt2").value = inputs.panes[1].eps3.toFixed(2);
    } else {
      app.UI.get("monoH").value = inputs.panes[0].h;
      app.UI.get("monoGt").value = inputs.panes[0].eps3.toFixed(2);
    }
  }

  function calculateAndRender() {
    const validation = app.Engine.validateInputs(readInputs());
    const inputs = validation.normalized;
    const result = app.Engine.calcNBR(inputs);

    syncNormalizedInputs(inputs);
    app.UI.updateInfoApoio(inputs.apoio);
    app.UI.updateCross(inputs);
    app.UI.renderValidation(validation.issues, validation.assumptions);
    app.UI.renderStatus(inputs, result);
    app.UI.renderMetrics(inputs, result);
    app.UI.renderMemorial(inputs, result, validation.assumptions);
    app.UI.renderChart(inputs, result);

    state.snapshot = {
      inputs: inputs,
      result: result,
      assumptions: validation.assumptions,
      issues: validation.issues
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

    ["width", "height", "pv", "apoio", "h1", "h2", "gt1", "gt2", "monoH", "monoGt"].forEach((id) => {
      const element = app.UI.get(id);
      if (!element) return;
      element.addEventListener("change", calculateAndRender);
      if (element.tagName === "INPUT") element.addEventListener("input", calculateAndRender);
    });

    app.UI.get("btnRelatorio").addEventListener("click", app.Report.gerarRelatorio);
    app.UI.get("btnPrintReport").addEventListener("click", app.Report.imprimirRelatorio);
    app.UI.get("btnCloseReport").addEventListener("click", app.Report.fecharRelatorio);
  }

  app.Controller = {
    calculateAndRender: calculateAndRender,
    getSnapshot: function () {
      return state.snapshot || calculateAndRender();
    }
  };

  setFamily("laminado");
  bindEvents();
  calculateAndRender();
}());
