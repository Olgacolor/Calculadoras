import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "assets", "nbr10821", "data.json");
const targetPath = path.join(rootDir, "assets", "nbr10821", "data.js");

const raw = await fs.readFile(sourcePath, "utf8");
const parsed = JSON.parse(raw);

if (!parsed || !Array.isArray(parsed.states) || !parsed.meta) {
  throw new Error("assets/nbr10821/data.json não possui a estrutura esperada.");
}

const banner = "window.NBR10821 = window.NBR10821 || {};\nwindow.NBR10821.data = ";
const output = `${banner}${JSON.stringify(parsed, null, 2)};\n`;

await fs.writeFile(targetPath, output, "utf8");
console.log(`Arquivo gerado: ${targetPath}`);
