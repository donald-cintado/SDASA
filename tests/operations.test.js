import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createApp } from "../server/app.js";
import { hashPassword } from "../server/auth.js";
import { Store } from "../server/database.js";

test("reinício completo preserva sessão, pedido e arquivo; scripts restauram sem sobrescrever", async () => {
  const directory = mkdtempSync(join(tmpdir(), "sdasa-ops-"));
  const databaseDirectory = join(directory, "original");
  let app;
  async function start() {
    app = await createApp({ dataDir: databaseDirectory, quiet: true });
    await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
    return `http://localhost:${app.server.address().port}`;
  }
  async function stop() {
    if (!app) return;
    await new Promise((resolve) => app.server.close(resolve));
    app.store.close();
    app = null;
  }
  try {
    let origin = await start();
    const password = "Persistent-test!2026";
    app.store.run(
      "INSERT INTO users(id,email,name,role,password) VALUES (?,?,?,?,?)",
      "aluno",
      "aluno@sdasa.test",
      "Aluno",
      "student",
      await hashPassword(password),
    );
    const login = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ email: "aluno@sdasa.test", password }),
    });
    const cookie = login.headers.get("Set-Cookie").split(";")[0];
    const file = Buffer.from("%PDF-1.4\nArquivo persistente");
    const response = await fetch(`${origin}/api/requests`, {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId: "decl_matricula",
        description: "Persistência após reinício",
        attachments: [
          {
            name: "arquivo.pdf",
            type: "application/pdf",
            content: file.toString("base64"),
          },
        ],
      }),
    });
    assert.equal(response.status, 201);
    const request = await response.json();
    await stop();
    origin = await start();
    const persisted = await fetch(`${origin}/api/requests/${request.id}`, {
      headers: { Cookie: cookie },
    });
    assert.equal(persisted.status, 200);
    assert.equal(
      (await persisted.json()).description,
      "Persistência após reinício",
    );
    const download = await fetch(
      `${origin}/api/attachments/${request.attachments[0].id}`,
      { headers: { Cookie: cookie } },
    );
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), file);
    execFileSync(process.execPath, [resolve("scripts/backup.js")], {
      cwd: directory,
      env: { ...process.env, SDASA_DATA_DIR: databaseDirectory },
    });
    const backup = join(
      directory,
      "backups",
      readdirSync(join(directory, "backups"))[0],
    );
    const destination = join(directory, "restored");
    execFileSync(process.execPath, [
      resolve("scripts/restore.js"),
      backup,
      destination,
    ]);
    const restored = new Store(join(destination, "sdasa.sqlite"));
    try {
      assert.equal(restored.get("SELECT id FROM requests").id, request.id);
      assert.deepEqual(
        Buffer.from(restored.get("SELECT content FROM attachments").content),
        file,
      );
    } finally {
      restored.close();
    }
    assert.throws(() =>
      execFileSync(
        process.execPath,
        [resolve("scripts/restore.js"), backup, destination],
        { stdio: "pipe" },
      ),
    );
  } finally {
    await stop();
    assert.ok(
      resolve(directory).startsWith(resolve(tmpdir())) &&
        directory.includes("sdasa-ops-"),
    );
    rmSync(directory, { recursive: true, force: true });
  }
});

test("indicadores respeitam período de São Paulo e calculam encerramentos reais", async () => {
  const app = await createApp({ dbPath: ":memory:", quiet: true });
  try {
    const hash = await hashPassword("Metrics-test!2026");
    app.store.run(
      "INSERT INTO users(id,email,name,role,password) VALUES (?,?,?,?,?)",
      "a",
      "a@sdasa.test",
      "Aluno",
      "student",
      hash,
    );
    const student = app.store.get("SELECT * FROM users WHERE id=?", "a");
    const first = app.service.create(student, {
      serviceId: "decl_matricula",
      description: "Primeiro",
    });
    const second = app.service.create(student, {
      serviceId: "decl_matricula",
      description: "Segundo",
    });
    const third = app.service.create(student, {
      serviceId: "hist_escolar",
      description: "Fora do período",
    });
    const base = {
      serviceTitle: "Declaração de Matrícula",
      estimatedDate: "2026-09-28T18:00:00-03:00",
    };
    app.store.run(
      "UPDATE requests SET created_at=?,status=?,data=? WHERE id=?",
      "2026-09-28T04:00:00Z",
      "concluded",
      JSON.stringify({ ...base, closedAt: "2026-09-28T05:00:00Z" }),
      first.id,
    );
    app.store.run(
      "UPDATE requests SET created_at=?,status=?,data=? WHERE id=?",
      "2026-09-28T04:00:00Z",
      "rejected",
      JSON.stringify({ ...base, closedAt: "2026-09-29T05:00:00Z" }),
      second.id,
    );
    app.store.run(
      "UPDATE requests SET created_at=? WHERE id=?",
      "2026-09-28T02:59:59Z",
      third.id,
    );
    const report = app.service.report(
      { role: "manager" },
      "2026-09-28",
      "2026-09-28",
    );
    assert.equal(report.total, 2);
    assert.equal(report.concluded, 1);
    assert.equal(report.slaPercent, 50);
    assert.equal(report.averageHours, 13);
    assert.deepEqual(report.byService, [
      { title: "Declaração de Matrícula", count: 2 },
    ]);
    const empty = app.service.report(
      { role: "manager" },
      "2000-01-01",
      "2000-01-01",
    );
    assert.equal(empty.total, 0);
    assert.equal(empty.slaPercent, null);
    assert.equal(empty.averageHours, null);
  } finally {
    app.store.close();
  }
});
