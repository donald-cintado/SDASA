import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../server/app.js";
import { hashPassword } from "../server/auth.js";
const dir = mkdtempSync(join(tmpdir(), "sdasa-browser-"));
const app = await createApp({ dataDir: dir, quiet: true });
const password = await hashPassword("Demonstracao!2026");
for (const [id, role] of [
  ["aluno", "student"],
  ["secretaria", "secretary"],
  ["professor", "professor"],
  ["gestor", "manager"],
  ["admin", "admin"],
])
  app.store.run(
    "INSERT INTO users(id,email,name,role,password) VALUES (?,?,?,?,?)",
    id,
    `${id}@sdasa.test`,
    id,
    role,
    password,
  );
app.server.listen(8098, "127.0.0.1", () =>
  console.log("Servidor E2E pronto em http://localhost:8098"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    app.server.close(() => {
      app.store.close();
      rmSync(dir, { recursive: true, force: true });
      process.exit(0);
    }),
  );
