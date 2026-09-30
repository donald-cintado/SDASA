import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { backup } from "node:sqlite";
import { createApp } from "../server/app.js";
import { hashPassword } from "../server/auth.js";
import { Store } from "../server/database.js";

const password = "Test-password!2026";
const pdf = {
  name: "documento.pdf",
  type: "application/pdf",
  content: Buffer.from("%PDF-1.4\nconteudo de teste").toString("base64"),
};
async function fixture(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sdasa-test-"));
  const sent = [];
  const app = await createApp({
    dataDir: dir,
    quiet: true,
    sendReset: async (to, url) => sent.push({ to, url }),
    ...options,
  });
  const hash = await hashPassword(password);
  for (const [id, role] of [
    ["student", "student"],
    ["other", "student"],
    ["secretary", "secretary"],
    ["professor", "professor"],
    ["otherprof", "professor"],
    ["manager", "manager"],
    ["admin", "admin"],
  ]) {
    app.store.run(
      "INSERT INTO users(id,email,name,role,password) VALUES (?,?,?,?,?)",
      id,
      `${id}@sdasa.test`,
      id,
      role,
      hash,
    );
  }
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  const origin = `http://localhost:${app.server.address().port}`;
  const base = `http://127.0.0.1:${app.server.address().port}`;
  async function call(
    path,
    {
      cookie,
      body,
      method = body ? "POST" : "GET",
      requestOrigin = origin,
    } = {},
  ) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Origin: requestOrigin,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = response.headers
      .get("Content-Type")
      ?.includes("application/json")
      ? await response.json()
      : await response.text();
    return {
      status: response.status,
      data,
      headers: response.headers,
      cookie: response.headers.get("Set-Cookie")?.split(";")[0],
    };
  }
  async function login(id) {
    const result = await call("/api/auth/login", {
      body: { email: `${id}@sdasa.test`, password },
    });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    return result.cookie;
  }
  t.after(async () => {
    await new Promise((resolve) => app.server.close(resolve));
    app.store.close();
    assert.ok(
      resolve(dir).startsWith(resolve(tmpdir())) && dir.includes("sdasa-test-"),
    );
    rmSync(dir, { recursive: true, force: true });
  });
  return { ...app, dir, call, login, sent };
}

test("autenticação real, cadastro sem elevação, sessão, logout e CSRF", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.call("/api/requests")).status, 401);
  assert.equal(
    (
      await f.call("/api/auth/login", {
        body: { email: "student@sdasa.test", password: "incorrect-value" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await f.call("/api/auth/login", {
        requestOrigin: "https://attacker.test",
        body: { email: "student@sdasa.test", password },
      })
    ).status,
    403,
  );
  const created = await f.call("/api/auth/register", {
    body: {
      email: "new@sdasa.test",
      name: "New Student",
      password,
      role: "admin",
    },
  });
  assert.equal(created.status, 201);
  assert.equal(
    f.store.get("SELECT role FROM users WHERE email=?", "new@sdasa.test").role,
    "student",
  );
  assert.equal(
    (
      await f.call("/api/auth/register", {
        body: { email: "new@sdasa.test", name: "X", password },
      })
    ).status,
    409,
  );
  const cookie = await f.login("student");
  const me = await f.call("/api/me", { cookie });
  assert.equal(me.data.id, "student");
  assert.equal(me.data.password, undefined);
  await f.call("/api/auth/logout", { cookie, body: {} });
  assert.equal((await f.call("/api/me", { cookie })).status, 401);
});

test("fluxo completo aluno, secretaria e professor com isolamento, anexos e histórico", async (t) => {
  const f = await fixture(t);
  const student = await f.login("student"),
    other = await f.login("other"),
    secretary = await f.login("secretary"),
    professor = await f.login("professor"),
    otherprof = await f.login("otherprof");
  const created = await f.call("/api/requests", {
    cookie: student,
    body: {
      serviceId: "decl_matricula",
      description: "<script>conteúdo literal</script>",
      attachments: [pdf],
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  let r = created.data;
  assert.match(r.id, /^SDASA-\d{4}-\d{6,}$/);
  assert.equal(r.timeline.length, 1);
  assert.equal(
    (await f.call("/api/requests", { cookie: other })).data.length,
    0,
  );
  assert.equal(
    (await f.call(`/api/requests/${r.id}`, { cookie: other })).status,
    404,
  );
  assert.equal(
    (await f.call(`/api/attachments/${r.attachments[0].id}`, { cookie: other }))
      .status,
    404,
  );
  assert.match(
    (
      await f.call(`/api/attachments/${r.attachments[0].id}`, {
        cookie: secretary,
      })
    ).data,
    /^%PDF/,
  );
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/status`, {
        cookie: student,
        body: {
          status: "in_progress",
          notes: "Tentativa indevida",
          version: r.version,
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/status`, {
        cookie: secretary,
        body: {
          status: "concluded",
          notes: "Salto inválido",
          version: r.version,
        },
      })
    ).status,
    403,
  );
  r = (
    await f.call(`/api/requests/${r.id}/status`, {
      cookie: secretary,
      body: {
        status: "in_progress",
        notes: "Triagem iniciada",
        version: r.version,
      },
    })
  ).data;
  const staleVersion = r.version;
  r = (
    await f.call(`/api/requests/${r.id}/assignment`, {
      cookie: secretary,
      body: { assigneeId: "professor", version: r.version },
    })
  ).data;
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/status`, {
        cookie: secretary,
        body: {
          status: "concluded",
          notes: "Edição desatualizada",
          version: staleVersion,
        },
      })
    ).status,
    409,
  );
  assert.equal(
    (await f.call(`/api/requests/${r.id}`, { cookie: professor })).status,
    200,
  );
  assert.equal(
    (await f.call(`/api/requests/${r.id}`, { cookie: otherprof })).status,
    404,
  );
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/status`, {
        cookie: professor,
        body: {
          status: "concluded",
          notes: "Sem permissão",
          version: r.version,
        },
      })
    ).status,
    403,
  );
  const message = await f.call(`/api/requests/${r.id}/messages`, {
    cookie: professor,
    body: { body: "Parecer do docente" },
  });
  assert.equal(message.status, 200);
  assert.equal(message.data.messages[0].body, "Parecer do docente");
  r = (
    await f.call(`/api/requests/${r.id}/status`, {
      cookie: secretary,
      body: {
        status: "awaiting_student",
        notes: "Complemente a informação",
        version: r.version,
      },
    })
  ).data;
  r = (
    await f.call(`/api/requests/${r.id}/status`, {
      cookie: student,
      body: {
        status: "in_progress",
        notes: "Informação complementar",
        version: r.version,
        attachments: [pdf],
      },
    })
  ).data;
  assert.equal(r.attachments.length, 2);
  r = (
    await f.call(`/api/requests/${r.id}/status`, {
      cookie: secretary,
      body: {
        status: "concluded",
        notes: "Atendimento finalizado",
        version: r.version,
      },
    })
  ).data;
  assert.equal(r.status, "concluded");
  assert.ok(r.closedAt);
  assert.equal(r.timeline.length, 7);
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/status`, {
        cookie: secretary,
        body: {
          status: "in_progress",
          notes: "Reabertura",
          version: r.version,
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await f.call(`/api/requests/${r.id}/messages`, {
        cookie: student,
        body: { body: "Mensagem tardia" },
      })
    ).status,
    400,
  );
  const own = await f.call("/api/notifications", { cookie: student });
  assert.ok(own.data.length > 0);
  assert.equal(
    (await f.call("/api/notifications", { cookie: other })).data.length,
    0,
  );
  await f.call("/api/notifications/read", {
    cookie: other,
    body: { ids: own.data.map((n) => n.id) },
  });
  assert.ok(
    (await f.call("/api/notifications", { cookie: student })).data.every(
      (n) => !n.read,
    ),
  );
  await f.call("/api/notifications/read", {
    cookie: student,
    body: { ids: own.data.map((n) => n.id) },
  });
  assert.ok(
    (await f.call("/api/notifications", { cookie: student })).data.every(
      (n) => n.read,
    ),
  );
});

test("validação de arquivo, obrigatoriedade, rollback e protocolo único", async (t) => {
  const f = await fixture(t);
  const cookie = await f.login("student");
  const request = { serviceId: "decl_matricula", description: "Pedido válido" };
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie,
        body: { ...request, serviceId: "just_falta" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie,
        body: {
          ...request,
          attachments: [
            {
              ...pdf,
              content: Buffer.from("arquivo falso").toString("base64"),
            },
          ],
        },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie,
        body: { ...request, attachments: Array(6).fill(pdf) },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie,
        body: {
          ...request,
          attachments: [
            {
              ...pdf,
              content: Buffer.alloc(5 * 1024 * 1024 + 1, 1).toString("base64"),
            },
          ],
        },
      })
    ).status,
    400,
  );
  assert.equal(f.store.get("SELECT COUNT(*) AS count FROM requests").count, 0);
  f.store.db.exec(
    "CREATE TRIGGER fail_event BEFORE INSERT ON events BEGIN SELECT RAISE(ABORT, 'simulated disk failure'); END",
  );
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie,
        body: { ...request, attachments: [pdf] },
      })
    ).status,
    500,
  );
  assert.equal(f.store.get("SELECT COUNT(*) AS count FROM requests").count, 0);
  assert.equal(
    f.store.get("SELECT COUNT(*) AS count FROM attachments").count,
    0,
  );
  f.store.db.exec("DROP TRIGGER fail_event");
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      f.call("/api/requests", { cookie, body: request }),
    ),
  );
  assert.ok(results.every((r) => r.status === 201));
  assert.equal(new Set(results.map((r) => r.data.id)).size, 8);
});

test("persistência em nova conexão e backup consistente com anexos", async (t) => {
  const f = await fixture(t);
  const cookie = await f.login("student");
  const result = await f.call("/api/requests", {
    cookie,
    body: {
      serviceId: "decl_matricula",
      description: "Persistente",
      attachments: [pdf],
    },
  });
  const reopened = new Store(join(f.dir, "sdasa.sqlite"));
  assert.equal(reopened.get("SELECT COUNT(*) AS count FROM requests").count, 1);
  reopened.close();
  const target = join(f.dir, "backup.sqlite");
  await backup(f.store.db, target);
  const restored = new Store(target);
  assert.equal(restored.get("SELECT id FROM requests").id, result.data.id);
  assert.equal(
    Buffer.from(
      restored.get("SELECT content FROM attachments").content,
    ).toString(),
    Buffer.from(pdf.content, "base64").toString(),
  );
  assert.equal(restored.get("PRAGMA integrity_check").integrity_check, "ok");
  restored.close();
});

test("recuperação com token único, revogação de sessão e link expirado", async (t) => {
  const f = await fixture(t),
    cookie = await f.login("student");
  const absent = await f.call("/api/auth/forgot", {
    body: { email: "unknown@sdasa.test" },
  });
  const present = await f.call("/api/auth/forgot", {
    body: { email: "student@sdasa.test" },
  });
  assert.deepEqual(absent.data, present.data);
  assert.equal(f.sent.length, 1);
  const resetToken = new URL(f.sent[0].url).searchParams.get("reset");
  assert.notEqual(f.store.get("SELECT token FROM resets").token, resetToken);
  const body = { token: resetToken, password: "New-password!2026" };
  assert.equal((await f.call("/api/auth/reset", { body })).status, 200);
  assert.equal((await f.call("/api/me", { cookie })).status, 401);
  assert.equal((await f.call("/api/auth/reset", { body })).status, 400);
  assert.equal(
    (
      await f.call("/api/auth/login", {
        body: { email: "student@sdasa.test", password: body.password },
      })
    ).status,
    200,
  );
  await f.call("/api/auth/forgot", { body: { email: "student@sdasa.test" } });
  f.store.run("UPDATE resets SET expires=0");
  assert.equal(
    (
      await f.call("/api/auth/reset", {
        body: {
          ...body,
          token: new URL(f.sent[1].url).searchParams.get("reset"),
        },
      })
    ).status,
    400,
  );
});

test("administração e indicadores com autorização, calendário e revogação", async (t) => {
  const f = await fixture(t),
    admin = await f.login("admin"),
    student = await f.login("student"),
    manager = await f.login("manager");
  assert.equal(
    (await f.call("/api/admin/users", { cookie: student })).status,
    403,
  );
  assert.equal(
    (
      await f.call("/api/reports?from=2026-01-01&to=2026-12-31", {
        cookie: student,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await f.call("/api/admin/holidays", {
        cookie: admin,
        method: "PUT",
        body: { holidays: ["2026-02-30"] },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.call("/api/admin/holidays", {
        cookie: admin,
        method: "PUT",
        body: { holidays: ["2026-12-25"] },
      })
    ).status,
    200,
  );
  const service = (
    await f.call("/api/admin/services", {
      cookie: admin,
      body: {
        title: "Serviço novo",
        category: "Teste",
        description: "Descrição",
        slaDays: 2,
        active: true,
        attachmentRequired: false,
      },
    })
  ).data;
  const r = (
    await f.call("/api/requests", {
      cookie: student,
      body: { serviceId: service.id, description: "Teste" },
    })
  ).data;
  assert.equal(
    (await f.call(`/api/requests/${r.id}`, { cookie: manager })).status,
    404,
  );
  assert.equal(
    (
      await f.call("/api/reports?from=2000-01-01&to=2099-12-31", {
        cookie: manager,
      })
    ).data.total,
    1,
  );
  assert.equal(
    (
      await f.call("/api/reports?from=2026-02-30&to=2026-01-01", {
        cookie: manager,
      })
    ).status,
    400,
  );
  await f.call("/api/admin/services", {
    cookie: admin,
    body: { ...service, active: false },
  });
  assert.equal(
    (
      await f.call("/api/requests", {
        cookie: student,
        body: { serviceId: service.id, description: "Inativo" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.call("/api/admin/users/student", {
        cookie: admin,
        method: "PATCH",
        body: { role: "student", active: false },
      })
    ).status,
    200,
  );
  assert.equal((await f.call("/api/me", { cookie: student })).status, 401);
  assert.ok(
    (await f.call("/api/admin/audit", { cookie: admin })).data.length >= 3,
  );
  assert.equal(
    (
      await f.call("/api/admin/users/admin", {
        cookie: admin,
        method: "PATCH",
        body: { role: "student", active: false },
      })
    ).status,
    400,
  );
});

test("recursos privados não são servidos; origem e cookies protegidos", async (t) => {
  const f = await fixture(t);
  for (const path of [
    "/data/sdasa.sqlite",
    "/.env",
    "/server/app.js",
    "/.git/config",
  ])
    assert.equal((await f.call(path)).status, 404);
  const page = await f.call("/");
  assert.equal(page.status, 200);
  assert.match(
    page.headers.get("Content-Security-Policy"),
    /script-src 'self'/,
  );
  const login = await f.call("/api/auth/login", {
    body: { email: "student@sdasa.test", password },
  });
  assert.match(login.headers.get("Set-Cookie"), /HttpOnly/);
  assert.match(login.headers.get("Set-Cookie"), /SameSite=Strict/);
  assert.equal((await f.call("/api/health")).data.status, "ok");
  for (let i = 0; i < 20; i++)
    await f.call("/api/auth/login", {
      body: { email: "student@sdasa.test", password: "invalid-password" },
    });
  assert.equal(
    (
      await f.call("/api/auth/login", {
        body: { email: "student@sdasa.test", password },
      })
    ).status,
    429,
  );
});
