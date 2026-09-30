import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const violations = [];
for (const file of files) {
  if (
    /^(data|backups)\//.test(file) ||
    (/(^|\/)\.env($|\.)/.test(file) && !file.endsWith(".env.example")) ||
    /\.(sqlite|pem|key)$/.test(file)
  )
    violations.push(file);
  try {
    if (
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(
        readFileSync(file, "utf8"),
      )
    )
      violations.push(file);
  } catch {
    /* Deleted files in a local working tree are absent from the final artifact. */
  }
}
if (violations.length)
  throw new Error(
    `Arquivos privados detectados: ${[...new Set(violations)].join(", ")}`,
  );
console.log(
  "Nenhum banco, arquivo de ambiente privado ou chave privada detectado nos arquivos versionados.",
);
