import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const filesToCheck = [
  "README.md",
  "apps/Levitare/index.html",
  "apps/vidro-laminado/index.html",
  "apps/vidro-laminado/js/app.js",
  "apps/vidro-laminado/js/constants.js",
  "apps/vidro-laminado/js/report.js",
  "apps/vidro-laminado/js/ui.js",
  "assets/nbr10821/index.js"
];

const suspiciousPatterns = [
  { label: "mojibake Ã + latin1", regex: /Ã[\u00A1-\u00BF]/g },
  { label: "mojibake Â + latin1", regex: /Â[\u00A1-\u00BF]/g },
  { label: "mojibake smart punctuation", regex: /â[\u0080-\u00BF]/g },
  { label: "replacement char", regex: /\uFFFD/g }
];

const findings = [];

for (const relativePath of filesToCheck) {
  const absolutePath = path.join(rootDir, relativePath);
  const text = await fs.readFile(absolutePath, "utf8");

  for (const pattern of suspiciousPatterns) {
    const matches = [...text.matchAll(pattern.regex)];
    for (const match of matches) {
      const before = text.slice(0, match.index);
      const line = before.split("\n").length;
      findings.push(`${relativePath}:${line} -> ${pattern.label}`);
    }
  }
}

if (findings.length) {
  console.error("Foram encontrados textos suspeitos:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("Check de textos concluído sem mojibake detectado.");
