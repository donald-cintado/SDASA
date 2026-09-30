import { Store } from "../server/database.js";
import { email, hashPassword } from "../server/auth.js";
import { randomUUID } from "node:crypto";
import { resolve, join } from "node:path";
const address = email(process.env.ADMIN_EMAIL);
const password = await hashPassword(process.env.ADMIN_PASSWORD);
const store = new Store(
  join(resolve(process.env.SDASA_DATA_DIR || "data"), "sdasa.sqlite"),
);
try {
  if (store.get("SELECT id FROM users WHERE email=?", address))
    throw new Error("O e-mail já existe. Nenhuma conta foi alterada.");
  store.run(
    "INSERT INTO users(id,email,name,role,password) VALUES (?,?,?,?,?)",
    randomUUID(),
    address,
    "Administrador",
    "admin",
    password,
  );
  console.log(
    "Administrador criado. Remova ADMIN_PASSWORD do ambiente após executar.",
  );
} finally {
  store.close();
}
