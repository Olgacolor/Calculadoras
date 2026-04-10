import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function loadNBR10821() {
  const dataScript = await fs.readFile(path.join(rootDir, "assets", "nbr10821", "data.js"), "utf8");
  const moduleScript = await fs.readFile(path.join(rootDir, "assets", "nbr10821", "index.js"), "utf8");

  const context = { window: {} };
  context.window = context;

  vm.runInNewContext(dataScript, context);
  vm.runInNewContext(moduleScript, context);

  return context.NBR10821;
}

async function run(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  }
}

const nbr10821 = await loadNBR10821();

await run("módulo compartilhado expõe a API principal", async () => {
  assert.equal(typeof nbr10821.getStates, "function");
  assert.equal(typeof nbr10821.getCities, "function");
  assert.equal(typeof nbr10821.resolve, "function");
});

await run("lista de estados inclui UF e cidades esperadas", async () => {
  const states = nbr10821.getStates();
  assert.ok(states.length > 20);
  assert.ok(states.some((item) => item.uf === "SP"));
  assert.ok(nbr10821.getCities("SP").some((item) => item.cidade === "São Paulo"));
});

await run("resolve São Paulo/SP para a pressão correta na faixa de 2 pavimentos", async () => {
  const result = nbr10821.resolve({
    uf: "SP",
    city: "São Paulo",
    floors: 2
  });

  assert.equal(result.uf, "SP");
  assert.equal(result.cidade, "São Paulo");
  assert.equal(result.isopleta, 40);
  assert.equal(result.region, "III");
  assert.equal(result.pe, 610);
  assert.equal(result.ps, 915);
  assert.equal(result.pa, 122);
});

await run("resolve faz fallback de cidade inválida para a primeira cidade da UF", async () => {
  const cities = nbr10821.getCities("AC");
  const result = nbr10821.resolve({
    uf: "AC",
    city: "Cidade Inexistente",
    floors: 5
  });

  assert.equal(result.cidade, cities[0].cidade);
  assert.equal(result.uf, "AC");
});

await run("resolve retorna null para faixa de pavimentos não suportada", async () => {
  const result = nbr10821.resolve({
    uf: "SP",
    city: "São Paulo",
    floors: 99
  });

  assert.equal(result, null);
});

if (!process.exitCode) {
  console.log("Todos os testes da NBR 10821 passaram.");
}
