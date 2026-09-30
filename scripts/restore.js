import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, copyFileSync, constants } from "node:fs";
import { resolve, join } from "node:path";
const source = process.argv[2],
  directory = process.argv[3];
if (!source || !directory)
  throw new Error(
    "Uso: npm run restore -- caminho/backup.sqlite novo-diretorio",
  );
const destination = resolve(directory);
if (existsSync(destination))
  throw new Error(
    "Informe um diretório novo. A restauração não sobrescreve dados existentes.",
  );
const db = new DatabaseSync(resolve(source), { readOnly: true });
try {
  if (db.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
    throw new Error("Backup inválido.");
  if (!db.prepare("SELECT name FROM sqlite_master WHERE name='requests'").get())
    throw new Error("Não é um banco SDASA.");
} finally {
  db.close();
}
mkdirSync(destination, { recursive: true });
copyFileSync(
  resolve(source),
  join(destination, "sdasa.sqlite"),
  constants.COPYFILE_EXCL,
);
console.log(
  "Backup restaurado em um novo diretório. Configure SDASA_DATA_DIR e reinicie o servidor.",
);
