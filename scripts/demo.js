import { resolve, join } from "node:path";
import { hashPassword } from "../server/auth.js";
import { createApp } from "../server/app.js";
if (process.env.NODE_ENV === "production")
  throw new Error("Demonstração não permitida em produção.");
const dataDir = resolve("data/demo");
const app = await createApp({ dataDir, dbPath: join(dataDir, "sdasa.sqlite") });
const password = "Demonstracao!2026";
const people = [
  ["student", "Mariana Oliveira", "aluno"],
  ["secretary", "Carlos Santos", "secretaria"],
  ["professor", "Erika Miranda", "professor"],
  ["manager", "Gestão Acadêmica", "gestor"],
  ["admin", "Administração", "admin"],
];
const hash = await hashPassword(password);
for (const [role, name, account] of people)
  app.store.run(
    "INSERT OR IGNORE INTO users(id,email,name,role,password,ra,course) VALUES (?,?,?,?,?,?,?)",
    `demo_${role}`,
    `${account}@sdasa.test`,
    name,
    role,
    hash,
    role === "student" ? "2024108842" : "",
    role === "student" ? "Análise e Desenvolvimento de Sistemas" : "",
  );
const port = Number(process.env.PORT || 8080);
app.server.listen(port, "127.0.0.1", () => {
  console.log(`Demonstração local: http://localhost:${port}`);
  console.log(`Contas: ${people.map((p) => `${p[2]}@sdasa.test`).join(", ")}`);
  console.log(`Senha inicial das contas de demonstração: ${password}`);
  console.log(
    "Banco demonstrativo isolado em data/demo. Contas existentes não são redefinidas.",
  );
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    app.server.close(() => {
      app.store.close();
      process.exit(0);
    }),
  );
