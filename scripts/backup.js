import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
const source = join(
  resolve(process.env.SDASA_DATA_DIR || "data"),
  "sdasa.sqlite",
);
if (!existsSync(source))
  throw new Error("Banco não encontrado. Confira SDASA_DATA_DIR.");
const targetDir = resolve("backups");
mkdirSync(targetDir, { recursive: true });
const target = join(
  targetDir,
  `sdasa-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
);
const db = new DatabaseSync(source, { readOnly: true });
try {
  await backup(db, target);
  console.log(`Backup consistente criado: ${target}`);
} finally {
  db.close();
}
