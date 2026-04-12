(function () {
  window.VidroApp = window.VidroApp || {};

  window.VidroApp.Constants = {
    APP_META: {
      appName: "Calculadora de Espessura de Vidro",
      shortName: "Vidro",
      normRef: "ABNT NBR 7199:2025",
      version: "2026.04.09"
    },
    TAB6: [
      [0.10, 2.1143], [0.20, 2.1000], [0.30, 2.1000], [0.40, 1.8714],
      [0.50, 1.6429], [0.60, 1.4143], [0.70, 1.1857], [0.80, 0.9714],
      [0.90, 0.8000], [1.00, 0.6571]
    ],
    TAB7: [
      [0.300, 0.68571], [0.333, 0.73143], [0.350, 0.80000], [0.400, 0.91429],
      [0.500, 1.14286], [0.667, 1.51429], [0.700, 1.56286], [0.800, 1.71000],
      [0.900, 1.85714], [1.000, 2.00000], [1.100, 2.05714], [1.200, 2.11429],
      [1.300, 2.17143], [1.400, 2.22857], [1.500, 2.28571], [1.750, 2.31429],
      [2.000, 2.35714], [3.000, 2.37143], [4.000, 2.38571], [5.000, 2.38571]
    ],
    GT_LABEL: {
      "1.00": "Recozido (float)",
      "0.61": "Temperado",
      "0.80": "Termoendurecido"
    },
    APOIO_LABEL: {
      "4": "4 lados (perimetro)",
      "2largura": "2 lados - laterais apoiadas",
      "2altura": "2 lados - topo e base apoiados",
      "3menor": "3 lados - largura livre",
      "3maior": "3 lados - altura livre",
      "2": "2 lados - topo e base apoiados"
    },
    SUPPORT_INFO: {
      "4": "<span>4 lados:</span> e1 = raiz(S x P / 100) se L/l <= 2,5; ou e1 = l x raiz(P) / 6,3 se L/l > 2,5. Limite de flecha: l/60 com cap de 30 mm.",
      "2largura": "<span>2 lados, laterais apoiadas:</span> os apoios estao nas bordas verticais e o vao entre apoios e a largura. e1 = vao x raiz(P) / 6,3 e alfa = 2,1143. O limite de flecha deve ser definido em projeto.",
      "2altura": "<span>2 lados, topo e base apoiados:</span> os apoios estao nas bordas horizontais e o vao entre apoios e a altura. e1 = vao x raiz(P) / 6,3 e alfa = 2,1143. O limite de flecha deve ser definido em projeto.",
      "3menor": "<span>3 lados, largura livre:</span> a borda sem apoio é a horizontal. e1 = l x raiz(P) / 6,3. b = l (borda livre). Limite de flecha: l/100 com cap de 50 mm.",
      "3maior": "<span>3 lados, altura livre:</span> a borda sem apoio é a vertical. e1 = raiz(L x 3 x l x P / 100) se L/l <= 7,5; ou 3 x l x raiz(P) / 6,3 se L/l > 7,5. b = L (borda livre). Limite: L/100 com cap de 50 mm.",
      "2": "<span>2 lados, topo e base apoiados:</span> os apoios estao nas bordas horizontais e o vao entre apoios e a altura. e1 = vao x raiz(P) / 6,3 e alfa = 2,1143. O limite de flecha deve ser definido em projeto."
    },
    CONFIGS_LAM: [
      { h1: 3, h2: 3 }, { h1: 4, h2: 4 }, { h1: 4, h2: 5 }, { h1: 5, h2: 5 },
      { h1: 6, h2: 4 }, { h1: 6, h2: 5 }, { h1: 6, h2: 6 }, { h1: 8, h2: 4 },
      { h1: 8, h2: 6 }, { h1: 8, h2: 8 }, { h1: 10, h2: 6 }, { h1: 10, h2: 8 },
      { h1: 10, h2: 10 }, { h1: 12, h2: 8 }, { h1: 12, h2: 10 }, { h1: 12, h2: 12 }
    ],
    CONFIGS_MONO: [3, 4, 5, 6, 8, 10, 12, 15, 19]
  };
}());
