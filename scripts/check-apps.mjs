import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const htmlFiles = [
  "apps/Levitare/index.html",
  "apps/vidro-laminado/index.html"
];

const scriptFiles = [
  "assets/nbr10821/index.js",
  "apps/vidro-laminado/js/app.js",
  "apps/vidro-laminado/js/constants.js",
  "apps/vidro-laminado/js/engine.js",
  "apps/vidro-laminado/js/report.js",
  "apps/vidro-laminado/js/ui.js"
];

const findings = [];

function isExternal(ref) {
  return /^(https?:|data:|mailto:|tel:|#)/i.test(ref);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

for (const relativePath of htmlFiles) {
  const absolutePath = path.join(rootDir, relativePath);
  const html = await fs.readFile(absolutePath, "utf8");
  const baseDir = path.dirname(absolutePath);
  const refs = html.matchAll(/<(?:script|link|img)[^>]+(?:src|href)=["']([^"']+)["']/g);

  for (const match of refs) {
    const ref = match[1];
    if (isExternal(ref)) continue;
    const target = path.resolve(baseDir, ref);
    if (!(await exists(target))) {
      findings.push(`${relativePath}: referência inexistente -> ${ref}`);
    }
  }

  if (relativePath.includes("Levitare") && !html.includes("../../assets/nbr10821/index.js")) {
    findings.push(`${relativePath}: módulo compartilhado NBR 10821 não encontrado no HTML`);
  }

  if (relativePath.includes("vidro-laminado") && !html.includes("../../assets/nbr10821/index.js")) {
    findings.push(`${relativePath}: módulo compartilhado NBR 10821 não encontrado no HTML`);
  }
}

for (const relativePath of scriptFiles) {
  const absolutePath = path.join(rootDir, relativePath);
  const source = await fs.readFile(absolutePath, "utf8");
  try {
    new Function(source);
  } catch (error) {
    findings.push(`${relativePath}: erro de sintaxe -> ${error.message}`);
  }
}

if (findings.length) {
  console.error("Foram encontrados problemas nos apps:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("Check dos apps concluído sem referências quebradas ou erros de sintaxe.");
