import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
const files = [];
for (const dir of ["server", "shared", "js", "scripts", "tests"]) {
  for (const file of readdirSync(dir, { recursive: true }))
    if (file.endsWith(".js")) files.push(join(dir, file));
}
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
const html = readFileSync("index.html", "utf8");
if (/\bon\w+=|https?:\/\//i.test(html))
  throw new Error("A interface deve usar eventos externos e recursos locais.");
for (const required of [
  'lang="pt-BR"',
  'id="main"',
  'id="header"',
  'id="toast"',
])
  if (!html.includes(required))
    throw new Error(`Estrutura ausente: ${required}`);
JSON.parse(readFileSync("package.json", "utf8"));
if (!readFileSync("css/style.css", "utf8").includes("@media"))
  throw new Error("Estilos responsivos ausentes.");
console.log(
  `Sintaxe validada em ${files.length} arquivos JS; estrutura de entrada e package.json válidos. Isso não substitui lint semântico nem testes de navegador.`,
);
