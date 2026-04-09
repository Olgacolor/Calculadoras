(function () {
  const root = window.NBR10821 = window.NBR10821 || {};
  const cityData = root.data;

  const REGION_BY_ISOPLETA = {
    30: "I",
    35: "II",
    40: "III",
    45: "IV",
    50: "V"
  };

  const PRESSURE_TABLE = {
    2: { I: 350, II: 470, III: 610, IV: 770, V: 950 },
    5: { I: 420, II: 580, III: 750, IV: 950, V: 1180 },
    10: { I: 500, II: 680, III: 890, IV: 1130, V: 1400 },
    20: { I: 600, II: 815, III: 1060, IV: 1350, V: 1660 },
    30: { I: 660, II: 890, III: 1170, IV: 1480, V: 1820 }
  };

  function getStates() {
    return cityData && Array.isArray(cityData.states) ? cityData.states : [];
  }

  function getCities(uf) {
    const state = getStates().find((item) => item.uf === uf) || null;
    return state ? state.cidades : [];
  }

  function resolve(input) {
    if (!input) return null;
    const floors = Number(input.floors);
    const state = getStates().find((item) => item.uf === input.uf) || getStates()[0];
    if (!state) return null;

    const city = state.cidades.find((item) => item.cidade === input.city) || state.cidades[0];
    if (!city) return null;

    const region = REGION_BY_ISOPLETA[Number(city.isopleta)] || "I";
    const pe = PRESSURE_TABLE[floors] && PRESSURE_TABLE[floors][region];
    if (!pe) return null;

    return {
      uf: state.uf,
      estado: state.estado,
      cidade: city.cidade,
      isopleta: Number(city.isopleta),
      pavimentos: floors,
      region: region,
      pe: pe,
      ps: Math.round(pe * 1.5),
      pa: Math.round(pe * 0.2)
    };
  }

  root.tables = {
    REGION_BY_ISOPLETA,
    PRESSURE_TABLE
  };

  root.getStates = getStates;
  root.getCities = getCities;
  root.resolve = resolve;
}());
