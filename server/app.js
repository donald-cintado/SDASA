import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { Store } from "./database.js";
import { Service } from "./service.js";
import {
  email,
  hashPassword,
  verifyPassword,
  publicUser,
  token,
  digest,
} from "./auth.js";
import { assert, text } from "../shared/core.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const assets = {
  "/": ["index.html", "text/html"],
  "/index.html": ["index.html", "text/html"],
  "/js/app.js": ["js/app.js", "text/javascript"],
  "/shared/core.js": ["shared/core.js", "text/javascript"],
  "/css/style.css": ["css/style.css", "text/css"],
};
const sessionDuration = 8 * 60 * 60 * 1000;
async function readBody(req) {
  assert(
    req.headers["content-type"]?.split(";")[0] === "application/json",
    "Envie JSON.",
    415,
  );
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    assert(size <= 36 * 1024 * 1024, "Envio excede o limite permitido.", 413);
    chunks.push(chunk);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString());
    assert(
      result && !Array.isArray(result) && typeof result === "object",
      "JSON inválido.",
    );
    return result;
  } catch {
    throw Object.assign(new Error("JSON inválido."), { status: 400 });
  }
}
export async function createApp(options = {}) {
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  const dataDir =
    options.dataDir || resolve(process.env.SDASA_DATA_DIR || "data");
  const store = new Store(options.dbPath || join(dataDir, "sdasa.sqlite"));
  const service = new Service(store);
  const dummyHash = await hashPassword(token());
  const configuredOrigin = options.origin || process.env.PUBLIC_ORIGIN;
  if (production)
    assert(
      configuredOrigin?.startsWith("https://"),
      "PUBLIC_ORIGIN HTTPS é obrigatório em produção.",
    );
  const metrics = {
    requests: 0,
    errors: 0,
    totalMs: 0,
    startedAt: new Date().toISOString(),
  };
  const attempts = new Map();
  function limit(key, max, period) {
    const now = Date.now();
    // Bounded, in-process rate limiting for the single-instance deployment.
    for (const [k, value] of attempts)
      if (value.until <= now) attempts.delete(k);
    const entry = attempts.get(key) || { count: 0, until: now + period };
    assert(
      ++entry.count <= max,
      "Muitas tentativas. Aguarde alguns minutos.",
      429,
    );
    attempts.set(key, entry);
  }
  function cookie(value, expiry = sessionDuration) {
    return `sdasa_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(expiry / 1000)}${production ? "; Secure" : ""}`;
  }
  function session(req) {
    const value = req.headers.cookie
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("sdasa_session="))
      ?.slice(14);
    if (!value) return null;
    return (
      store.get(
        "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1",
        digest(value),
        Date.now(),
      ) || null
    );
  }
  const server = createServer(async (req, res) => {
    const started = performance.now();
    const requestId = randomUUID();
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    res.setHeader("Cache-Control", "no-store");
    if (production)
      res.setHeader("Strict-Transport-Security", "max-age=31536000");
    let path = "";
    const json = (body, status = 200) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, "http://localhost");
      path = url.pathname;
      if (!path.startsWith("/api/")) {
        assert(
          req.method === "GET" || req.method === "HEAD",
          "Método não permitido.",
          405,
        );
        const asset = assets[path];
        assert(asset, "Página não encontrada.", 404);
        res.setHeader("Content-Type", `${asset[1]}; charset=utf-8`);
        res.end(
          req.method === "HEAD"
            ? undefined
            : readFileSync(join(root, asset[0])),
        );
        return;
      }
      limit(`all:${req.socket.remoteAddress}`, 300, 60000);
      const origin =
        configuredOrigin || `http://localhost:${server.address().port}`;
      if (!["GET", "HEAD"].includes(req.method))
        assert(req.headers.origin === origin, "Origem não autorizada.", 403);
      if (path === "/api/health" && req.method === "GET") {
        store.get("SELECT 1");
        json({ status: "ok" });
        return;
      }
      const authRoute = path.startsWith("/api/auth/");
      if (authRoute && req.method === "POST")
        limit(`auth:${req.socket.remoteAddress}`, 20, 15 * 60000);
      const input = ["POST", "PUT", "PATCH"].includes(req.method)
        ? await readBody(req)
        : {};
      if (path === "/api/auth/register" && req.method === "POST") {
        const address = email(input.email),
          name = text(input.name, "Nome", 100),
          password = await hashPassword(input.password);
        assert(
          !store.get("SELECT id FROM users WHERE email=?", address),
          "Não foi possível cadastrar este e-mail.",
          409,
        );
        const id = randomUUID();
        store.run(
          "INSERT INTO users(id,email,name,role,password,ra,course) VALUES (?,?,?,?,?,?,?)",
          id,
          address,
          name,
          "student",
          password,
          text(input.ra || "", "RA", 50, 0),
          text(input.course || "", "Curso", 150, 0),
        );
        json({ message: "Conta criada. Entre com seu e-mail e senha." }, 201);
        return;
      }
      if (path === "/api/auth/login" && req.method === "POST") {
        const address = email(input.email),
          user = store.get("SELECT * FROM users WHERE email=?", address);
        const valid = await verifyPassword(
          input.password,
          user?.password || dummyHash,
        );
        assert(user?.active && valid, "Credenciais inválidas.", 401);
        const value = token();
        store.run("DELETE FROM sessions WHERE expires<?", Date.now());
        store.run(
          "INSERT INTO sessions VALUES (?,?,?)",
          digest(value),
          user.id,
          Date.now() + sessionDuration,
        );
        res.setHeader("Set-Cookie", cookie(value));
        json({ user: publicUser(user) });
        return;
      }
      if (path === "/api/auth/forgot" && req.method === "POST") {
        const address = email(input.email),
          user = store.get(
            "SELECT * FROM users WHERE email=? AND active=1",
            address,
          );
        if (user) {
          const value = token(),
            resetUrl = `${origin}/?reset=${value}`;
          store.transaction(() => {
            store.run(
              "DELETE FROM resets WHERE user_id=? OR expires<?",
              user.id,
              Date.now(),
            );
            store.run(
              "INSERT INTO resets VALUES (?,?,?)",
              digest(value),
              user.id,
              Date.now() + 30 * 60000,
            );
          });
          try {
            if (options.sendReset) await options.sendReset(address, resetUrl);
            else if (process.env.MAIL_WEBHOOK_URL) {
              assert(
                process.env.MAIL_WEBHOOK_URL.startsWith("https://"),
                "Serviço de e-mail exige HTTPS.",
              );
              const result = await fetch(process.env.MAIL_WEBHOOK_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(process.env.MAIL_WEBHOOK_TOKEN
                    ? {
                        Authorization: `Bearer ${process.env.MAIL_WEBHOOK_TOKEN}`,
                      }
                    : {}),
                },
                body: JSON.stringify({
                  to: address,
                  subject: "Redefinição de senha SDASA",
                  text: `Redefina sua senha em até 30 minutos: ${resetUrl}`,
                }),
                signal: AbortSignal.timeout(10000),
              });
              assert(result.ok, "Falha na entrega do e-mail.");
            } else if (!production) {
              mkdirSync(join(dataDir, "outbox"), { recursive: true });
              writeFileSync(
                join(dataDir, "outbox", `${randomUUID()}.json`),
                JSON.stringify({ to: address, resetUrl }, null, 2),
                { mode: 0o600 },
              );
            } else throw new Error("Serviço de e-mail não configurado.");
          } catch {
            store.run("DELETE FROM resets WHERE token=?", digest(value));
            if (!options.quiet)
              console.error(
                JSON.stringify({ event: "mail.failed", requestId }),
              );
          }
        }
        json({
          message:
            "Se houver uma conta ativa, você receberá as instruções de recuperação.",
        });
        return;
      }
      if (path === "/api/auth/reset" && req.method === "POST") {
        const value = text(input.token, "Token", 128);
        const password = await hashPassword(input.password);
        store.transaction(() => {
          const reset = store.get(
            "SELECT * FROM resets WHERE token=? AND expires>?",
            digest(value),
            Date.now(),
          );
          assert(reset, "Link inválido ou expirado.");
          store.run(
            "UPDATE users SET password=? WHERE id=?",
            password,
            reset.user_id,
          );
          store.run("DELETE FROM sessions WHERE user_id=?", reset.user_id);
          store.run("DELETE FROM resets WHERE user_id=?", reset.user_id);
        });
        json({ message: "Senha atualizada. Entre novamente." });
        return;
      }
      if (path === "/api/auth/logout" && req.method === "POST") {
        const value = req.headers.cookie
          ?.split(";")
          .map((s) => s.trim())
          .find((s) => s.startsWith("sdasa_session="))
          ?.slice(14);
        if (value)
          store.run("DELETE FROM sessions WHERE token=?", digest(value));
        res.setHeader("Set-Cookie", cookie("", 0));
        json({ ok: true });
        return;
      }
      if (path === "/api/services" && req.method === "GET") {
        json(service.services());
        return;
      }
      const user = session(req);
      assert(user, "Entre na sua conta para continuar.", 401);
      if (path === "/api/me" && req.method === "GET") {
        json(publicUser(user));
        return;
      }
      if (path === "/api/requests" && req.method === "GET") {
        json(service.list(user));
        return;
      }
      if (path === "/api/requests" && req.method === "POST") {
        json(service.create(user, input), 201);
        return;
      }
      const requestMatch =
        /^\/api\/requests\/([\w-]+)(?:\/(status|assignment|messages))?$/.exec(
          path,
        );
      if (requestMatch) {
        const [, id, action] = requestMatch;
        if (req.method === "GET" && !action) {
          json(service.details(user, id));
          return;
        }
        if (req.method === "POST" && action === "status") {
          json(service.update(user, id, input));
          return;
        }
        if (req.method === "POST" && action === "assignment") {
          json(service.assign(user, id, input));
          return;
        }
        if (req.method === "POST" && action === "messages") {
          json(service.message(user, id, input));
          return;
        }
      }
      const download = /^\/api\/attachments\/([\w-]+)$/.exec(path);
      if (download && req.method === "GET") {
        const file = store.get(
          "SELECT * FROM attachments WHERE id=?",
          download[1],
        );
        assert(file, "Arquivo não encontrado.", 404);
        service.request(user, file.request_id);
        res.setHeader("Content-Type", file.type);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="documento"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, "%27")}`,
        );
        res.end(Buffer.from(file.content));
        return;
      }
      if (path === "/api/notifications" && req.method === "GET") {
        json(service.notifications(user));
        return;
      }
      if (path === "/api/notifications/read" && req.method === "POST") {
        assert(
          Array.isArray(input.ids) &&
            input.ids.length <= 500 &&
            input.ids.every((id) => typeof id === "string"),
          "Notificações inválidas.",
        );
        store.transaction(() => {
          for (const id of input.ids)
            store.run(
              "UPDATE notifications SET read=1 WHERE id=? AND user_id=?",
              id,
              user.id,
            );
        });
        json({ ok: true });
        return;
      }
      if (path === "/api/staff" && req.method === "GET") {
        assert(
          ["secretary", "admin"].includes(user.role),
          "Acesso negado.",
          403,
        );
        json(
          store.all(
            "SELECT id,name,role FROM users WHERE active=1 AND role IN ('professor','secretary') ORDER BY name",
          ),
        );
        return;
      }
      if (path === "/api/reports" && req.method === "GET") {
        json(
          service.report(
            user,
            url.searchParams.get("from"),
            url.searchParams.get("to"),
          ),
        );
        return;
      }
      if (path.startsWith("/api/admin/")) {
        assert(user.role === "admin", "Acesso negado.", 403);
        if (path === "/api/admin/services" && req.method === "GET") {
          json(service.services(true));
          return;
        }
        if (path === "/api/admin/services" && req.method === "POST") {
          json(service.saveService(user, input));
          return;
        }
        if (path === "/api/admin/holidays" && req.method === "GET") {
          json(service.holidays());
          return;
        }
        if (path === "/api/admin/holidays" && req.method === "PUT") {
          service.saveHolidays(user, input.holidays);
          json({ ok: true });
          return;
        }
        if (path === "/api/admin/users" && req.method === "GET") {
          json(service.users(user));
          return;
        }
        const userMatch = /^\/api\/admin\/users\/([\w-]+)$/.exec(path);
        if (userMatch && req.method === "PATCH") {
          service.saveUser(user, userMatch[1], input);
          json({ ok: true });
          return;
        }
        if (path === "/api/admin/metrics" && req.method === "GET") {
          json({
            ...metrics,
            averageMs: metrics.requests
              ? Math.round(metrics.totalMs / metrics.requests)
              : 0,
            databaseBytes:
              Number(store.get("PRAGMA page_count").page_count) *
              Number(store.get("PRAGMA page_size").page_size),
            memoryBytes: process.memoryUsage().rss,
          });
          return;
        }
        if (path === "/api/admin/audit" && req.method === "GET") {
          json(
            store.all(
              "SELECT a.*,u.name AS actor FROM audit a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 100",
            ),
          );
          return;
        }
      }
      assert(false, "Recurso não encontrado.", 404);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) metrics.errors++;
      if (!res.headersSent)
        json(
          {
            error:
              status >= 500
                ? "Não foi possível concluir a operação. Tente novamente."
                : error.message,
            requestId,
          },
          status,
        );
      else res.end();
      if (status >= 500 && !options.quiet)
        console.error(
          JSON.stringify({
            event: "server.error",
            requestId,
            message: error.message,
          }),
        );
    } finally {
      const ms = Math.round(performance.now() - started);
      metrics.requests++;
      metrics.totalMs += ms;
      if (!options.quiet)
        console.log(
          JSON.stringify({
            event: "http",
            requestId,
            method: req.method,
            route: path.replace(/\/SDASA-[\w-]+/g, "/:id"),
            status: res.statusCode,
            ms,
          }),
        );
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return { server, store, service };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const app = await createApp();
  const port = Number(process.env.PORT || 8080);
  app.server.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(`SDASA: http://localhost:${port}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      app.server.close(() => {
        app.store.close();
        process.exit(0);
      }),
    );
}
