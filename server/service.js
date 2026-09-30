import { randomUUID } from "node:crypto";
import {
  assert,
  text,
  ROLES,
  STATUSES,
  MAX_FILES,
  businessDate,
  canRead,
  canTransition,
  isOverdue,
  validateAttachment,
  validDay,
} from "../shared/core.js";
import { publicUser } from "./auth.js";

export class Service {
  constructor(store) {
    this.store = store;
  }
  audit(user, action, target) {
    this.store.run(
      "INSERT INTO audit(actor_id,action,target,created_at) VALUES (?,?,?,?)",
      user.id,
      action,
      target,
      new Date().toISOString(),
    );
  }
  services(all = false) {
    return this.store
      .all("SELECT data FROM services")
      .map((r) => JSON.parse(r.data))
      .filter((s) => all || s.active);
  }
  holidays() {
    return JSON.parse(
      this.store.get("SELECT data FROM settings WHERE id=?", "holidays").data,
    );
  }
  row(row) {
    return {
      ...JSON.parse(row.data),
      id: row.id,
      userId: row.user_id,
      assigneeId: row.assignee_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: row.version,
    };
  }
  list(user) {
    if (["secretary", "admin"].includes(user.role))
      return this.store
        .all("SELECT * FROM requests ORDER BY sequence DESC")
        .map((r) => this.row(r));
    if (user.role === "professor")
      return this.store
        .all(
          "SELECT * FROM requests WHERE assignee_id=? ORDER BY sequence DESC",
          user.id,
        )
        .map((r) => this.row(r));
    if (user.role === "student")
      return this.store
        .all(
          "SELECT * FROM requests WHERE user_id=? ORDER BY sequence DESC",
          user.id,
        )
        .map((r) => this.row(r));
    return [];
  }
  request(user, id) {
    const row = this.store.get("SELECT * FROM requests WHERE id=?", id);
    assert(
      row && canRead(user, this.row(row)),
      "Solicitação não encontrada.",
      404,
    );
    return this.row(row);
  }
  details(user, id) {
    const request = this.request(user, id);
    return {
      ...request,
      timeline: this.store.all(
        "SELECT e.*, u.name AS actor FROM events e JOIN users u ON u.id=e.actor_id WHERE request_id=? ORDER BY e.id",
        id,
      ),
      messages: this.store.all(
        "SELECT m.id, m.body, m.created_at, u.name AS author FROM messages m JOIN users u ON u.id=m.user_id WHERE request_id=? ORDER BY m.created_at,m.rowid",
        id,
      ),
      attachments: this.store.all(
        "SELECT id,name,type,size FROM attachments WHERE request_id=?",
        id,
      ),
    };
  }
  files(files = []) {
    assert(
      Array.isArray(files) && files.length <= MAX_FILES,
      "Envie no máximo 5 arquivos por operação.",
    );
    return files.map((file) => {
      assert(file && typeof file === "object", "Arquivo inválido.");
      assert(
        typeof file.content === "string" &&
          /^[A-Za-z0-9+/]*={0,2}$/.test(file.content),
        "Arquivo inválido.",
      );
      const content = Buffer.from(file.content, "base64");
      validateAttachment({ ...file, size: content.length });
      const valid =
        file.type === "application/pdf"
          ? content.subarray(0, 5).toString() === "%PDF-"
          : file.type === "image/png"
            ? content
                .subarray(0, 8)
                .equals(Buffer.from("89504e470d0a1a0a", "hex"))
            : content.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"));
      assert(valid, "O conteúdo do arquivo não corresponde ao tipo informado.");
      const name = [...file.name]
        .map((c) =>
          c.codePointAt(0) < 32 || c === "/" || c === "\\" ? "_" : c,
        )
        .join("");
      return { ...file, name, content, size: content.length, id: randomUUID() };
    });
  }
  saveFiles(id, files) {
    for (const f of files)
      this.store.run(
        "INSERT INTO attachments VALUES (?,?,?,?,?,?)",
        f.id,
        id,
        f.name,
        f.type,
        f.size,
        f.content,
      );
  }
  event(user, id, title, description = "") {
    this.store.run(
      "INSERT INTO events(request_id,actor_id,created_at,title,description) VALUES (?,?,?,?,?)",
      id,
      user.id,
      new Date().toISOString(),
      title,
      description,
    );
  }
  notify(request, actor, message) {
    const ids = new Set([
      request.userId,
      request.assigneeId,
      ...this.store
        .all(
          "SELECT id FROM users WHERE role IN ('secretary','admin') AND active=1",
        )
        .map((u) => u.id),
    ]);
    for (const id of ids)
      if (id && id !== actor.id)
        this.store.run(
          "INSERT INTO notifications VALUES (?,?,?,?,?,0)",
          randomUUID(),
          id,
          request.id,
          message,
          new Date().toISOString(),
        );
  }
  create(user, input) {
    assert(
      user.role === "student",
      "Somente alunos podem abrir solicitações.",
      403,
    );
    const service = this.services().find((s) => s.id === input.serviceId);
    assert(service, "Selecione um serviço disponível.");
    const description = text(input.description, "Descrição");
    const files = this.files(input.attachments);
    assert(
      !service.attachmentRequired || files.length > 0,
      "Este serviço exige documento comprobatório.",
    );
    const now = new Date();
    return this.store.transaction(() => {
      const data = {
        serviceId: service.id,
        serviceTitle: service.title,
        category: service.category,
        description,
        userName: user.name,
        userRa: user.ra,
        course: user.course,
        estimatedDate: businessDate(now, service.slaDays, this.holidays()),
        responseNotes: "",
        closedAt: null,
      };
      const result = this.store.run(
        "INSERT INTO requests(user_id,status,created_at,updated_at,data) VALUES (?,?,?,?,?)",
        user.id,
        "pending",
        now.toISOString(),
        now.toISOString(),
        JSON.stringify(data),
      );
      const year = new Intl.DateTimeFormat("en", {
        year: "numeric",
        timeZone: "America/Sao_Paulo",
      }).format(now);
      const id = `SDASA-${year}-${String(result.lastInsertRowid).padStart(6, "0")}`;
      this.store.run(
        "UPDATE requests SET id=? WHERE sequence=?",
        id,
        result.lastInsertRowid,
      );
      this.saveFiles(id, files);
      this.event(
        user,
        id,
        "Solicitação aberta",
        "Documentos registrados e protocolo emitido.",
      );
      this.notify(
        { id, userId: user.id },
        user,
        "Nova solicitação para triagem.",
      );
      return this.details(user, id);
    });
  }
  update(user, id, input) {
    return this.store.transaction(() => {
      const request = this.request(user, id);
      assert(
        Number.isInteger(input.version) && input.version === request.version,
        "A solicitação foi atualizada. Reabra os detalhes antes de salvar.",
        409,
      );
      const next = input.status;
      assert(
        canTransition(user, request, next),
        "Transição não permitida para este perfil e status.",
        403,
      );
      const notes = text(input.notes, "Parecer ou complementação");
      const files = this.files(input.attachments);
      assert(
        this.store.get(
          "SELECT COUNT(*) AS count FROM attachments WHERE request_id=?",
          id,
        ).count +
          files.length <=
          20,
        "Limite de 20 anexos por solicitação.",
      );
      request.status = next;
      request.responseNotes = notes;
      if (["concluded", "rejected"].includes(next))
        request.closedAt = new Date().toISOString();
      this.store.run(
        "UPDATE requests SET status=?,data=?,updated_at=?,version=version+1 WHERE id=?",
        next,
        JSON.stringify(request),
        new Date().toISOString(),
        id,
      );
      this.saveFiles(id, files);
      this.event(user, id, STATUSES[next], notes);
      this.notify(request, user, `Status atualizado: ${STATUSES[next]}.`);
      return this.details(user, id);
    });
  }
  assign(user, id, input) {
    assert(["secretary", "admin"].includes(user.role), "Acesso negado.", 403);
    return this.store.transaction(() => {
      const request = this.request(user, id);
      assert(
        input.version === request.version,
        "Reabra a solicitação: há uma atualização mais recente.",
        409,
      );
      assert(
        !["concluded", "rejected"].includes(request.status),
        "Solicitação encerrada.",
      );
      const target = input.assigneeId
        ? this.store.get(
            "SELECT * FROM users WHERE id=? AND active=1 AND role IN ('professor','secretary')",
            input.assigneeId,
          )
        : null;
      assert(!input.assigneeId || target, "Responsável inválido.");
      this.store.run(
        "UPDATE requests SET assignee_id=?,updated_at=?,version=version+1 WHERE id=?",
        target?.id || null,
        new Date().toISOString(),
        id,
      );
      this.event(
        user,
        id,
        "Encaminhamento",
        target ? `Responsável: ${target.name}.` : "Responsável removido.",
      );
      this.notify(
        { ...request, assigneeId: target?.id },
        user,
        "Responsável pelo atendimento atualizado.",
      );
      return this.details(user, id);
    });
  }
  message(user, id, input) {
    const request = this.request(user, id);
    assert(
      !["concluded", "rejected"].includes(request.status),
      "Solicitação encerrada; o histórico permanece disponível.",
    );
    const body = text(input.body, "Mensagem");
    this.store.transaction(() => {
      this.store.run(
        "INSERT INTO messages VALUES (?,?,?,?,?)",
        randomUUID(),
        id,
        user.id,
        body,
        new Date().toISOString(),
      );
      this.event(
        user,
        id,
        "Mensagem enviada",
        "Mensagem disponível na conversa desta solicitação.",
      );
      this.notify(request, user, "Nova mensagem na solicitação.");
    });
    return this.details(user, id);
  }
  notifications(user) {
    return this.store.all(
      "SELECT id,request_id AS requestId,message,created_at AS createdAt,read FROM notifications WHERE user_id=? ORDER BY created_at DESC",
      user.id,
    );
  }
  report(user, from, to) {
    assert(
      ["manager", "admin", "secretary"].includes(user.role),
      "Acesso negado.",
      403,
    );
    assert(
      validDay(from) && validDay(to) && from <= to,
      "Informe um período válido.",
    );
    // Compare timestamps numerically: rows may have differing timezone offsets.
    const start = Date.parse(`${from}T00:00:00-03:00`),
      end = Date.parse(`${to}T23:59:59.999-03:00`);
    const requests = this.store
      .all("SELECT * FROM requests")
      .map((r) => this.row(r))
      .filter(
        (r) =>
          Date.parse(r.createdAt) >= start && Date.parse(r.createdAt) <= end,
      );
    const closed = requests.filter((r) => r.closedAt);
    return {
      from,
      to,
      total: requests.length,
      overdue: requests.filter((r) => isOverdue(r)).length,
      awaitingStudent: requests.filter((r) => r.status === "awaiting_student")
        .length,
      concluded: requests.filter((r) => r.status === "concluded").length,
      averageHours: closed.length
        ? Math.round(
            (closed.reduce(
              (n, r) =>
                n +
                (Date.parse(r.closedAt) - Date.parse(r.createdAt)) / 3600000,
              0,
            ) /
              closed.length) *
              10,
          ) / 10
        : null,
      slaPercent: closed.length
        ? Math.round(
            (closed.filter(
              (r) => Date.parse(r.closedAt) <= Date.parse(r.estimatedDate),
            ).length /
              closed.length) *
              100,
          )
        : null,
      byService: Object.entries(
        requests.reduce((map, r) => {
          map[r.serviceTitle] = (map[r.serviceTitle] || 0) + 1;
          return map;
        }, {}),
      ).map(([title, count]) => ({ title, count })),
    };
  }
  saveService(user, input) {
    assert(user.role === "admin", "Acesso negado.", 403);
    const existing =
      input.id && this.services(true).find((s) => s.id === input.id);
    assert(!input.id || existing, "Serviço não encontrado.", 404);
    assert(
      Number.isInteger(input.slaDays) &&
        input.slaDays >= 1 &&
        input.slaDays <= 365,
      "Prazo deve ser de 1 a 365 dias úteis.",
    );
    assert(
      typeof input.active === "boolean" &&
        typeof input.attachmentRequired === "boolean",
      "Parâmetros inválidos.",
    );
    const service = {
      id: existing?.id || randomUUID(),
      title: text(input.title, "Título", 120),
      category: text(input.category, "Categoria", 80),
      description: text(input.description, "Descrição", 1000),
      requiredDocs: text(input.requiredDocs || "", "Documentos", 1000, 0),
      slaDays: input.slaDays,
      active: input.active,
      attachmentRequired: input.attachmentRequired,
    };
    this.store.transaction(() => {
      this.store.run(
        "INSERT INTO services VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
        service.id,
        JSON.stringify(service),
      );
      this.audit(user, "service.saved", service.id);
    });
    return service;
  }
  saveHolidays(user, holidays) {
    assert(user.role === "admin", "Acesso negado.", 403);
    assert(
      Array.isArray(holidays) &&
        holidays.length <= 366 &&
        holidays.every(validDay),
      "Informe datas válidas no formato AAAA-MM-DD.",
    );
    this.store.transaction(() => {
      this.store.run(
        "UPDATE settings SET data=? WHERE id=?",
        JSON.stringify([...new Set(holidays)].sort()),
        "holidays",
      );
      this.audit(user, "holidays.saved", "holidays");
    });
  }
  users(user) {
    assert(user.role === "admin", "Acesso negado.", 403);
    return this.store.all("SELECT * FROM users ORDER BY name").map(publicUser);
  }
  saveUser(user, id, input) {
    assert(user.role === "admin", "Acesso negado.", 403);
    assert(
      Object.hasOwn(ROLES, input.role) && typeof input.active === "boolean",
      "Perfil ou situação inválidos.",
    );
    assert(id !== user.id, "Não altere o próprio acesso nesta tela.");
    assert(
      this.store.get("SELECT id FROM users WHERE id=?", id),
      "Usuário não encontrado.",
      404,
    );
    this.store.transaction(() => {
      this.store.run(
        "UPDATE users SET role=?,active=? WHERE id=?",
        input.role,
        Number(input.active),
        id,
      );
      this.store.run("DELETE FROM sessions WHERE user_id=?", id);
      this.audit(user, "user.permissions.changed", id);
    });
  }
}
