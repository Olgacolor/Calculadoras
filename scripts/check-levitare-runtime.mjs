import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "apps", "Levitare", "index.html");
const html = fs.readFileSync(appPath, "utf8");

function assertNoBrokenText(label, value) {
  const text = String(value || "");
  if (/\bundefined\b|\bnull\b|\[object Object\]/i.test(text)) {
    throw new Error(`${label} gerou texto quebrado: ${text}`);
  }
}

class ClassList {
  constructor() {
    this.items = new Set();
  }

  add(...names) {
    names.filter(Boolean).forEach((name) => this.items.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.items.delete(name));
  }

  toggle(name, force) {
    if (force === true) {
      this.items.add(name);
      return true;
    }
    if (force === false) {
      this.items.delete(name);
      return false;
    }
    if (this.items.has(name)) {
      this.items.delete(name);
      return false;
    }
    this.items.add(name);
    return true;
  }

  contains(name) {
    return this.items.has(name);
  }
}

class Element {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.value = "";
    this.textContent = "";
    this._innerHTML = "";
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.listeners = {};
    this.classList = new ClassList();
    this.parentElement = null;
  }

  set innerHTML(value) {
    this._innerHTML = String(value || "");
    this.children = [];

    for (const match of this._innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
      const button = createElementFromTag("button", match[1], match[2]);
      button.parentElement = this;
      this.children.push(button);
      document._all.push(button);
    }

    const options = [...this._innerHTML.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)]
      .map((match) => {
        const valueMatch = match[1].match(/value="([^"]*)"/);
        return valueMatch ? valueMatch[1] : match[2].trim();
      });

    if (options.length && !options.includes(this.value)) this.value = options[0];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  addEventListener(type, callback) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(callback);
  }

  dispatchEvent(event) {
    (this.listeners[event.type] || []).forEach((callback) => callback(event));
  }

  click() {
    this.dispatchEvent({ type: "click", target: this });
  }

  querySelectorAll(selector) {
    if (!selector.startsWith(".")) return [];
    const className = selector.slice(1);
    return this.children.filter((child) => child.classList.contains(className));
  }

  querySelector(selector) {
    if (selector === "span:last-child") return this;
    return null;
  }

  closest(selector) {
    if (!selector.startsWith(".")) return null;
    const className = selector.slice(1);
    return this.classList.contains(className) ? this : null;
  }

  scrollIntoView() {}
}

function createElementFromTag(tagName, attrText = "", content = "") {
  const element = new Element(tagName);
  const idMatch = attrText.match(/id="([^"]*)"/);
  if (idMatch) element.id = idMatch[1];
  const valueMatch = attrText.match(/value="([^"]*)"/);
  if (valueMatch) element.value = valueMatch[1];
  const classMatch = attrText.match(/class="([^"]*)"/);
  if (classMatch) classMatch[1].split(/\s+/).forEach((name) => element.classList.add(name));
  for (const dataMatch of attrText.matchAll(/data-([a-zA-Z0-9-]+)="([^"]+)"/g)) {
    const key = dataMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    element.dataset[key] = dataMatch[2];
  }
  element.textContent = content.replace(/<[^>]+>/g, "").trim();
  return element;
}

const elements = new Map();
const document = {
  _all: [],
  body: new Element("body"),
  createElement(tagName) {
    return new Element(tagName);
  },
  getElementById(id) {
    return elements.get(id) || null;
  },
  querySelectorAll(selector) {
    if (!selector.startsWith(".")) return [];
    const className = selector.slice(1);
    return this._all.filter((element) => element.classList.contains(className));
  }
};

for (const match of html.matchAll(/<([a-zA-Z0-9]+)\b([^>]*)\bid="([^"]+)"([^>]*)>/g)) {
  const element = createElementFromTag(match[1], `${match[2]} id="${match[3]}" ${match[4]}`);
  elements.set(element.id, element);
  document._all.push(element);
}

for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
  document._all.push(createElementFromTag("button", match[1], match[2]));
}

const context = {
  console,
  document,
  window: {},
  setTimeout,
  Math,
  Number,
  Date,
  String,
  Array,
  Object,
  RegExp,
  parseInt,
  parseFloat
};
context.window = context;

for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  const sourcePath = path.resolve(path.dirname(appPath), match[1]);
  vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), context, { filename: sourcePath });
}

for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  vm.runInNewContext(match[1], context, { filename: "apps/Levitare/index.html:inline" });
}

const calcButton = elements.get("calcButton");
if (!calcButton || !calcButton.listeners.click || !calcButton.listeners.click.length) {
  throw new Error("Botão Calcular custo não recebeu listener de clique.");
}

calcButton.click();

const resultsVisible = elements.get("results").classList.contains("visible");
const errorVisible = elements.get("errorBanner").classList.contains("visible");

if (!resultsVisible && !errorVisible) {
  throw new Error("Clique em Calcular custo não exibiu resultado nem erro.");
}

assertNoBrokenText("Ajuda da norma", elements.get("glassNormHelp").textContent);
assertNoBrokenText("Observacoes do resultado", elements.get("observations").innerHTML);

elements.get("largura").value = "5000";
elements.get("altura").value = "3200";
elements.get("folhas").value = "4";
elements.get("espessuraManual").value = "19";
document.querySelectorAll(".seg-btn").find((button) => button.dataset.mode === "manual").click();
calcButton.click();

if (!elements.get("errorBanner").classList.contains("visible")) {
  throw new Error("Cenário bloqueado não exibiu alerta crítico.");
}

const solverHtml = elements.get("errorText").innerHTML;
if (!solverHtml.includes("prioridade arquitetônica")) {
  throw new Error("Solver não informa a prioridade arquitetônica no alerta.");
}
const bestMatch = solverHtml.match(/Melhor solução sugerida[\s\S]*?<span>([\s\S]*?)<\/span>/);
if (!bestMatch) {
  throw new Error("Solver não renderizou a melhor solução sugerida.");
}
if (/\b(5|6|7|8|9|10|11|12) planos\b/.test(bestMatch[1])) {
  throw new Error(`Solver priorizou aumento de planos em vez de menor impacto visual: ${bestMatch[1]}`);
}
const solverOptions = [...solverHtml.matchAll(/<strong>(?:Melhor solução sugerida|Alternativa \d+)<\/strong>\s*<span>([\s\S]*?)<\/span>/g)]
  .map((match) => match[1]);
const heightOnlyOptions = solverOptions.filter((option) => /altura \d/.test(option) && !/folhas|planos/.test(option));
if (heightOnlyOptions.length > 1) {
  throw new Error(`Solver repetiu alternativas equivalentes de redução de altura: ${heightOnlyOptions.join(" | ")}`);
}

const solverButton = document.querySelectorAll(".solver-apply")[1] || document.querySelectorAll(".solver-apply")[0];
if (!solverButton) {
  throw new Error("Cenário bloqueado não gerou botão para aplicar alternativa.");
}

elements.get("errorBanner").dispatchEvent({ type: "click", target: solverButton });

if (elements.get("folhas").value === "4" && elements.get("altura").value === "3200") {
  throw new Error(`Aplicar alternativa não alterou campos. Botão: ${JSON.stringify(solverButton.dataset)} Classes: ${[...solverButton.classList.items].join(",")}`);
}

if (!elements.get("results").classList.contains("visible")) {
  throw new Error(`Aplicar alternativa do solver não recalculou o resultado. Erro visível: ${elements.get("errorBanner").classList.contains("visible")} Texto: ${elements.get("errorText").textContent || elements.get("errorText").innerHTML}`);
}

assertNoBrokenText("Resultado apos alternativa", elements.get("observations").innerHTML);

if (/normative\.floors|\.floors\}/.test(html)) {
  throw new Error("Levitare ainda referencia normative.floors; use normative.pavimentos.");
}

console.log("Runtime Levitare OK: carregamento, cálculo e aplicação de alternativa executados.");
