import {
  ROLES,
  STATUSES,
  TRANSITIONS,
  canTransition,
  isOverdue,
  validateAttachment,
  MAX_FILES,
} from "/shared/core.js";

const $ = (selector) => document.querySelector(selector);
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const date = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
const badge = (status) =>
  `<span class="badge ${escape(status)}">${escape(STATUSES[status] || status)}</span>`;
const slaLabel = (days) => `${days} ${days === 1 ? "dia útil" : "dias úteis"}`;
const errorSlot = '<p class="form-error error" role="alert"></p>';
const fileInput =
  '<label>Documentos (PDF, PNG ou JPG)<input type="file" name="attachments" accept=".pdf,.png,.jpg,.jpeg" multiple><span class="hint">Até 5 arquivos por envio, com até 5 MB cada. Somente pessoas autorizadas podem baixá-los.</span></label>';

class SDASAApp {
  constructor() {
    this.user = null;
    this.requests = [];
    this.services = [];
    this.notifications = [];
    this.screen = "home";
    this.request = null;
    this.filter = { search: "", status: "", overdue: false };
    this.viewVersion = 0;
    this.initializing = true;
    this.resetToken = new URLSearchParams(location.search).get("reset");
    if (this.resetToken) history.replaceState(null, "", "/");
    document.addEventListener("click", (event) => this.click(event));
    document.addEventListener("submit", (event) => this.submit(event));
    this.init();
  }
  async api(path, method = "GET", body) {
    const userAtStart = this.user?.id;
    let response;
    try {
      response = await fetch(`/api${path}`, {
        method,
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error(
        "Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.",
      );
    }
    const data = await response.json();
    if (!response.ok) {
      if (
        response.status === 401 &&
        this.user &&
        this.user.id === userAtStart
      ) {
        this.clearSession();
        this.header();
      }
      throw new Error(data.error || "Não foi possível concluir a operação.");
    }
    return data;
  }
  clearSession() {
    this.user = null;
    this.requests = [];
    this.notifications = [];
    this.request = null;
    this.selectedService = null;
  }
  async init() {
    try {
      this.services = await this.api("/services");
      try {
        this.user = await this.api("/me");
      } catch {
        this.user = null;
      }
      await this.go(
        this.resetToken ? "reset" : this.user ? "dashboard" : "home",
      );
      this.initializing = false;
      setInterval(() => this.refreshNotifications(), 30000);
    } catch (error) {
      $("#main").innerHTML =
        `<div class="panel"><h1>Não foi possível iniciar</h1><p class="error">${escape(error.message)}</p><button data-action="reload">Tentar novamente</button></div>`;
    }
  }
  toast(message) {
    $("#toast").textContent = message;
    $("#toast").hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      $("#toast").hidden = true;
    }, 5000);
  }
  async refreshNotifications() {
    if (!this.user) return;
    const userId = this.user.id;
    try {
      const notifications = await this.api("/notifications");
      if (this.user?.id === userId) {
        this.notifications = notifications;
        const count = notifications.filter((n) => !n.read).length;
        const indicator = $("#notification-count");
        if (indicator) {
          indicator.textContent = String(count);
          indicator.hidden = count === 0;
        }
      }
    } catch {
      /* Next user action reports the network failure. */
    }
  }
  header() {
    const count = this.notifications.filter((n) => !n.read).length;
    const navigation = this.user
      ? [
          ["dashboard", "Solicitações"],
          ...(this.user.role === "student"
            ? [["new", "Nova solicitação"]]
            : []),
          ["notifications", "Notificações"],
          ...(["secretary", "manager", "admin"].includes(this.user.role)
            ? [["reports", "Indicadores"]]
            : []),
          ...(this.user.role === "admin" ? [["admin", "Administração"]] : []),
        ]
      : [];
    $("#header").innerHTML =
      `<div class="header-inner"><a class="brand" href="/" data-screen="home"><span class="brand-icon" aria-hidden="true">S</span><span>SDASA<small>Atendimento e solicitações acadêmicas</small></span></a><div class="header-user">${this.user ? `<div><strong>${escape(this.user.name)}</strong><small>${escape(ROLES[this.user.role])}</small></div><button data-action="logout" class="small">Sair</button>` : '<button data-screen="login" class="small">Entrar</button><button data-screen="register" class="primary small">Criar conta</button>'}</div></div>${navigation.length ? `<nav aria-label="Navegação principal">${navigation.map(([screen, label]) => `<button data-screen="${screen}" class="${this.screen === screen ? "active" : "quiet"}" ${this.screen === screen ? 'aria-current="page"' : ""}>${label}${screen === "notifications" ? ` <span id="notification-count" class="unread-count" ${count ? "" : "hidden"}>${count}</span>` : ""}</button>`).join("")}</nav>` : ""}`;
  }
  async go(screen, id) {
    $("#toast").hidden = true;
    clearTimeout(this.toastTimer);
    if (
      !this.user &&
      !["home", "login", "register", "forgot", "reset"].includes(screen)
    )
      screen = "login";
    const version = ++this.viewVersion;
    this.screen = screen;
    this.header();
    $("#main").innerHTML = '<p class="loading" role="status">Carregando…</p>';
    try {
      let html;
      if (screen === "home") html = this.home();
      else if (["login", "register", "forgot", "reset"].includes(screen))
        html = this.auth(screen);
      else if (screen === "dashboard") {
        this.requests = await this.api("/requests");
        html = this.dashboard();
      } else if (screen === "new") {
        this.services = await this.api("/services");
        this.selectedService = id || null;
        html = this.newRequest();
      } else if (screen === "detail" || screen === "confirmation") {
        this.request = await this.api(`/requests/${id}`);
        if (["secretary", "admin"].includes(this.user.role))
          this.staff = await this.api("/staff");
        html = screen === "detail" ? this.detail() : this.confirmation();
      } else if (screen === "notifications") {
        this.notifications = await this.api("/notifications");
        html = this.notificationView();
      } else if (screen === "reports") {
        html = this.reportView(await this.fetchReport());
      } else if (screen === "admin") {
        [
          this.adminServices,
          this.users,
          this.holidays,
          this.metrics,
          this.audit,
        ] = await Promise.all(
          [
            "/admin/services",
            "/admin/users",
            "/admin/holidays",
            "/admin/metrics",
            "/admin/audit",
          ].map((p) => this.api(p)),
        );
        html = this.admin();
      }
      if (version !== this.viewVersion) return;
      $("#main").innerHTML = html || this.home();
      this.header();
      if (!this.initializing) $("#main").focus();
      if (this.user) this.refreshNotifications();
    } catch (error) {
      if (version === this.viewVersion)
        $("#main").innerHTML =
          `<div class="panel"><h1>Não foi possível carregar</h1><p class="error" role="alert">${escape(error.message)}</p><button data-screen="${this.user ? "dashboard" : "login"}">${this.user ? "Voltar às solicitações" : "Entrar"}</button></div>`;
    }
  }
  home() {
    return `<section class="hero"><div class="eyebrow">Sua vida acadêmica, mais simples</div><h1>Seu atendimento acadêmico em um só lugar.</h1><p>Abra solicitações, envie documentos e acompanhe cada etapa. Mais clareza sobre prazos e uma conversa direta com a instituição.</p><button data-screen="${this.user ? "dashboard" : "login"}" class="button primary">${this.user ? "Acessar meu painel" : "Entrar no portal"}</button>${this.user ? "" : '<button data-screen="register" class="button secondary">Criar minha conta</button>'}</section><div class="grid"><section class="card"><h2>Acompanhe pelo protocolo</h2><p>Consulte o status e o histórico de cada pedido, sempre que precisar.</p></section><section class="card"><h2>Conheça os prazos</h2><p>Veja o prazo em dias úteis antes de enviar sua solicitação.</p></section><section class="card"><h2>Converse com a instituição</h2><p>Mensagens e documentos ficam organizados junto ao atendimento.</p></section></div><section class="panel"><h2>Serviços disponíveis</h2><div class="grid">${this.services.map((s) => `<article class="service"><h3>${escape(s.title)}</h3><p>${escape(s.description)}</p><small>Até ${slaLabel(s.slaDays)}</small></article>`).join("")}</div></section>`;
  }
  auth(screen) {
    const title = {
      login: "Bem-vindo de volta",
      register: "Crie sua conta",
      forgot: "Recuperar acesso",
      reset: "Defina sua nova senha",
    }[screen];
    return `<section class="panel auth"><div class="eyebrow">Portal acadêmico</div><h1>${title}</h1><p class="muted">${screen === "register" ? "O cadastro cria um perfil de aluno. A instituição administra os demais acessos." : "Acesse suas solicitações com segurança."}</p><form data-form="${screen}">${screen === "register" ? '<label>Nome completo<input name="name" autocomplete="name" required maxlength="100"></label><label>RA<input name="ra" maxlength="50"></label><label>Curso<input name="course" maxlength="150"></label>' : ""}${screen !== "reset" ? '<label>E-mail<input name="email" type="email" autocomplete="username" required maxlength="254"></label>' : ""}${screen !== "forgot" ? `<label>Senha<input name="password" type="password" autocomplete="${screen === "login" ? "current-password" : "new-password"}" required minlength="12" maxlength="128" aria-describedby="password-help"></label><p id="password-help" class="hint">Use pelo menos 12 caracteres.</p>` : ""}${errorSlot}<button class="primary" type="submit">${{ login: "Entrar", register: "Criar conta", forgot: "Enviar instruções", reset: "Salvar nova senha" }[screen]}</button></form><div class="actions">${screen === "login" ? '<button class="quiet small" data-screen="forgot">Esqueci minha senha</button><button class="quiet small" data-screen="register">Criar conta</button>' : '<button class="quiet small" data-screen="login">Voltar para o login</button>'}</div></section>`;
  }
  dashboard() {
    const filtered = this.requests.filter(
      (r) =>
        (!this.filter.status || r.status === this.filter.status) &&
        (!this.filter.overdue || isOverdue(r)) &&
        `${r.id} ${r.serviceTitle} ${r.userName}`
          .toLowerCase()
          .includes(this.filter.search.toLowerCase()),
    );
    const metrics = [
      ["Solicitações", this.requests.length],
      [
        "Aguardando triagem",
        this.requests.filter((r) => r.status === "pending").length,
      ],
      [
        "Em análise",
        this.requests.filter((r) => r.status === "in_progress").length,
      ],
      ["Em atraso", this.requests.filter((r) => isOverdue(r)).length],
    ];
    return `<div class="toolbar"><div><div class="eyebrow">${escape(ROLES[this.user.role])}</div><h1>${this.user.role === "student" ? "Minhas solicitações" : "Central de atendimento"}</h1><p class="muted">Acompanhe demandas, prazos e próximos passos.</p></div><div class="actions"><button data-screen="dashboard">Atualizar</button>${this.user.role === "student" ? '<button data-screen="new" class="primary">+ Nova solicitação</button>' : ""}</div></div>${this.user.role === "manager" ? '<p class="note">Seu perfil consulta resultados consolidados na aba Indicadores.</p>' : ""}<div class="stats">${metrics.map(([label, number]) => `<div class="stat"><span>${label}</span><strong>${number}</strong></div>`).join("")}</div><section class="panel"><form class="filters" data-form="filters"><label>Buscar<input name="search" value="${escape(this.filter.search)}" placeholder="Protocolo, serviço ou nome"></label><label>Status<select name="status"><option value="">Todos</option>${Object.entries(
      STATUSES,
    )
      .map(
        ([id, title]) =>
          `<option value="${id}" ${this.filter.status === id ? "selected" : ""}>${title}</option>`,
      )
      .join(
        "",
      )}</select></label><label class="check"><input type="checkbox" name="overdue" ${this.filter.overdue ? "checked" : ""}>Somente atrasadas</label><button type="submit">Filtrar</button></form><div class="table-wrap"><table><thead><tr><th>Protocolo / Serviço</th><th>Solicitante</th><th>Prazo</th><th>Status</th><th>Ação</th></tr></thead><tbody>${filtered.map((r) => `<tr><td><span class="protocol">${escape(r.id)}</span><small>${escape(r.serviceTitle)}</small></td><td>${escape(r.userName)}</td><td>${date(r.estimatedDate)}${isOverdue(r) ? '<small><span class="badge overdue">Prazo vencido</span></small>' : ""}</td><td>${badge(r.status)}</td><td><button class="small" data-screen="detail" data-id="${escape(r.id)}">Detalhes</button></td></tr>`).join("")}</tbody></table>${filtered.length ? "" : '<p class="empty">Nenhuma solicitação encontrada.</p>'}</div></section>`;
  }
  newRequest() {
    if (this.user.role !== "student")
      return '<p class="error">A abertura de solicitações é exclusiva para alunos.</p>';
    const service = this.services.find((s) => s.id === this.selectedService);
    return `<h1>Nova solicitação</h1><p class="muted">Escolha o serviço e confira os documentos necessários.</p><div class="grid">${this.services.map((s) => `<article class="card service ${s.id === this.selectedService ? "selected-service" : ""}"><div class="eyebrow">${escape(s.category)}</div><h2>${escape(s.title)}</h2><p>${escape(s.description)}</p><small>Prazo: até ${slaLabel(s.slaDays)}</small><button data-action="select-service" data-id="${escape(s.id)}" aria-pressed="${s.id === this.selectedService}">${s.id === this.selectedService ? "Selecionado" : "Selecionar"}</button></article>`).join("")}</div>${service ? `<section class="panel" id="request-form"><h2>${escape(service.title)}</h2><p class="note">${escape(service.requiredDocs || "Nenhum documento adicional obrigatório.")}</p><form data-form="new-request"><label>Descreva sua solicitação<textarea name="description" required maxlength="5000" rows="5"></textarea></label>${fileInput}${service.attachmentRequired ? '<p class="hint">É obrigatório anexar pelo menos um documento.</p>' : ""}${errorSlot}<div class="actions"><button type="submit" class="primary">Enviar solicitação</button><button type="button" data-screen="dashboard">Cancelar</button></div></form></section>` : ""}`;
  }
  confirmation() {
    const r = this.request;
    return `<section class="panel receipt"><div class="success no-print">Solicitação registrada com sucesso.</div><div class="eyebrow">Comprovante de solicitação · SDASA</div><h1>${escape(r.serviceTitle)}</h1><p class="protocol">${escape(r.id)}</p><dl><div><dt>Solicitante</dt><dd>${escape(r.userName)}</dd></div><div><dt>Data de abertura</dt><dd>${date(r.createdAt)}</dd></div><div><dt>Status atual</dt><dd>${escape(STATUSES[r.status])}</dd></div><div><dt>Previsão de atendimento</dt><dd>${date(r.estimatedDate)}</dd></div></dl><p class="detail-text">${escape(r.description)}</p><p class="hint">Este comprovante registra o envio da solicitação; não substitui o documento acadêmico solicitado.</p><div class="actions no-print"><button class="primary" data-screen="detail" data-id="${escape(r.id)}">Acompanhar solicitação</button><button data-action="print">Imprimir comprovante</button></div></section>`;
  }
  detail() {
    const r = this.request,
      staff = ["secretary", "admin"].includes(this.user.role),
      closed = ["concluded", "rejected"].includes(r.status);
    const transitions = TRANSITIONS[r.status].filter((next) =>
      canTransition(this.user, r, next),
    );
    return `<div class="toolbar"><div><button class="quiet small" data-screen="dashboard">← Voltar às solicitações</button><h1>${escape(r.serviceTitle)}</h1><span class="protocol">${escape(r.id)}</span> ${badge(r.status)}</div><div class="actions"><button data-screen="detail" data-id="${escape(r.id)}">Atualizar</button><button data-screen="confirmation" data-id="${escape(r.id)}">Comprovante</button></div></div><div class="split"><div><section class="panel"><h2>Dados da solicitação</h2><p><strong>${escape(r.userName)}</strong> · ${escape(r.userRa || "RA não informado")}</p><p class="muted">Abertura: ${date(r.createdAt)}<br>Prazo: ${date(r.estimatedDate)} ${isOverdue(r) ? '<span class="badge overdue">Prazo vencido</span>' : ""}</p><p class="detail-text">${escape(r.description)}</p><h3>Documentos</h3><ul class="file-list">${r.attachments.map((f) => `<li><a href="/api/attachments/${escape(f.id)}" download>${escape(f.name)}</a> <span class="hint">(${Math.ceil(f.size / 1024)} KB)</span></li>`).join("") || '<li class="muted">Nenhum documento anexado.</li>'}</ul></section><section class="panel"><h2>Conversa do atendimento</h2>${r.messages.map((m) => `<article class="message"><strong>${escape(m.author)}</strong><small>${date(m.created_at)}</small><p class="detail-text">${escape(m.body)}</p></article>`).join("") || '<p class="muted">Ainda não há mensagens.</p>'}${closed ? '<p class="hint">Atendimento encerrado. A conversa permanece disponível para consulta.</p>' : `<form data-form="message"><label>Nova mensagem<textarea name="body" required maxlength="5000"></textarea></label>${errorSlot}<button type="submit" class="primary">Enviar mensagem</button></form>`}</section></div><div>${staff && !closed ? `<section class="panel"><h2>Responsável pelo atendimento</h2><form data-form="assign"><label>Encaminhar para<select name="assigneeId"><option value="">Sem responsável</option>${(this.staff || []).map((u) => `<option value="${escape(u.id)}" ${r.assigneeId === u.id ? "selected" : ""}>${escape(u.name)} (${escape(ROLES[u.role])})</option>`).join("")}</select></label>${errorSlot}<button type="submit">Salvar encaminhamento</button></form></section>` : ""}${transitions.length ? `<section class="panel"><h2>${this.user.role === "student" ? "Enviar complementação" : "Atualizar atendimento"}</h2><form data-form="status"><label>Próximo status<select name="status">${transitions.map((s) => `<option value="${s}">${STATUSES[s]}</option>`).join("")}</select></label><label>${this.user.role === "student" ? "Complementação" : "Parecer"}<textarea name="notes" required maxlength="5000"></textarea></label>${fileInput}${errorSlot}<button type="submit" class="primary">Salvar atualização</button></form></section>` : ""}<section class="panel"><h2>Histórico de atendimento</h2><ol class="timeline">${r.timeline
      .map(
        (e) =>
          `<li><strong>${escape(e.title)}</strong><small>${date(e.created_at)} · ${escape(e.actor)}</small><p class="detail-text">${escape(e.description)}</p></li>`,
      )
      .reverse()
      .join("")}</ol></section></div></div>`;
  }
  notificationView() {
    return `<div class="toolbar"><h1>Notificações</h1><button data-action="read-notifications">Marcar como lidas</button></div><section class="panel">${this.notifications.map((n) => `<article class="notification ${n.read ? "" : "unread"}"><p>${escape(n.message)}</p><small>${date(n.createdAt)} · ${escape(n.requestId)}</small><button class="quiet small" data-screen="detail" data-id="${escape(n.requestId)}">Ver solicitação</button></article>`).join("") || '<p class="empty">Nenhuma notificação por enquanto.</p>'}</section>`;
  }
  async fetchReport() {
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    this.period ||= { from: `${today.slice(0, 7)}-01`, to: today };
    return this.api(`/reports?from=${this.period.from}&to=${this.period.to}`);
  }
  reportView(r) {
    const metrics = [
      ["Solicitações abertas", r.total],
      ["Concluídas", r.concluded],
      ["Em atraso", r.overdue],
      ["Aguardando aluno", r.awaitingStudent],
      ["Prazo cumprido", r.slaPercent === null ? "—" : `${r.slaPercent}%`],
      [
        "Tempo médio até encerramento",
        r.averageHours === null ? "—" : `${r.averageHours} h`,
      ],
    ];
    return `<h1>Indicadores de atendimento</h1><p class="muted">Dados das solicitações abertas no período selecionado.</p><section class="panel"><form class="filters" data-form="report"><label>De<input name="from" type="date" value="${this.period.from}" required></label><label>Até<input name="to" type="date" value="${this.period.to}" required></label><button type="submit">Consultar</button>${errorSlot}</form></section><div class="stats">${metrics.map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div><p class="hint">Prazo cumprido e tempo médio consideram atendimentos encerrados, incluindo indeferimentos. O prazo continua contando durante a complementação.</p><section class="panel"><h2>Volume por serviço</h2><table><thead><tr><th>Serviço</th><th>Solicitações</th></tr></thead><tbody>${r.byService.map((s) => `<tr><td>${escape(s.title)}</td><td>${s.count}</td></tr>`).join("")}</tbody></table>${r.total ? "" : '<p class="empty">Sem registros neste período.</p>'}</section>`;
  }
  serviceForm(s = {}) {
    return `<form data-form="service" data-id="${escape(s.id || "")}"><label>Nome do serviço<input name="title" value="${escape(s.title || "")}" required maxlength="120"></label><label>Categoria<input name="category" value="${escape(s.category || "")}" required maxlength="80"></label><label>Descrição<textarea name="description" required maxlength="1000">${escape(s.description || "")}</textarea></label><label>Prazo em dias úteis<input name="slaDays" type="number" min="1" max="365" value="${s.slaDays || 1}" required></label><label>Documentos necessários<textarea name="requiredDocs" maxlength="1000">${escape(s.requiredDocs || "")}</textarea></label><label class="check"><input type="checkbox" name="attachmentRequired" ${s.attachmentRequired ? "checked" : ""}>Exigir anexo</label><label class="check"><input type="checkbox" name="active" ${s.active !== false ? "checked" : ""}>Serviço ativo</label>${errorSlot}<button type="submit" class="primary">Salvar serviço</button></form>`;
  }
  admin() {
    return `<h1>Administração</h1><p class="muted">Gerencie acessos, serviços e calendário institucional.</p><section class="panel"><h2>Usuários e perfis</h2>${this.users
      .map(
        (u) =>
          `<form data-form="user" data-id="${escape(u.id)}" class="admin-user"><div><strong>${escape(u.name)}</strong><small class="hint break"> ${escape(u.email)}</small></div><label><span class="hint">Perfil</span><select name="role" ${u.id === this.user.id ? "disabled" : ""}>${Object.entries(
            ROLES,
          )
            .map(
              ([id, name]) =>
                `<option value="${id}" ${u.role === id ? "selected" : ""}>${name}</option>`,
            )
            .join(
              "",
            )}</select></label><label class="check"><input name="active" type="checkbox" ${u.active ? "checked" : ""} ${u.id === this.user.id ? "disabled" : ""}>Ativo</label><button type="submit" ${u.id === this.user.id ? "disabled" : ""}>Salvar</button>${errorSlot}</form>`,
      )
      .join(
        "",
      )}</section><div class="split"><section class="panel"><h2>Catálogo de serviços</h2><details><summary>+ Adicionar serviço</summary>${this.serviceForm()}</details>${this.adminServices.map((s) => `<details><summary>${escape(s.title)} ${s.active ? "" : "(inativo)"}</summary>${this.serviceForm(s)}</details>`).join("")}</section><div><section class="panel"><h2>Feriados e dias sem expediente</h2><p class="hint">Uma data por linha, no formato AAAA-MM-DD. Alterações valem para novos pedidos; prazos já registrados são preservados.</p><form data-form="holidays"><label>Datas<textarea name="holidays" rows="7">${escape(this.holidays.join("\n"))}</textarea></label>${errorSlot}<button type="submit">Salvar calendário</button></form></section><section class="panel"><h2>Operação</h2><p>Requisições: ${this.metrics.requests}<br>Erros do servidor: ${this.metrics.errors}<br>Tempo médio: ${this.metrics.averageMs} ms<br>Banco: ${(this.metrics.databaseBytes / 1024 / 1024).toFixed(2)} MB<br>Memória: ${(this.metrics.memoryBytes / 1024 / 1024).toFixed(1)} MB</p><p class="hint">Métricas do processo desde ${date(this.metrics.startedAt)}.</p></section></div></div><section class="panel"><h2>Últimas alterações administrativas</h2>${this.audit.map((a) => `<p>${date(a.created_at)} · ${escape(a.actor)} · ${escape(a.action)}</p>`).join("") || '<p class="muted">Nenhuma alteração registrada.</p>'}</section>`;
  }
  async attachments(form) {
    const files = Array.from(form.elements.attachments?.files || []);
    if (files.length > MAX_FILES)
      throw new Error("Selecione no máximo 5 arquivos por envio.");
    return Promise.all(
      files.map(async (f) => {
        validateAttachment(f);
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = () =>
            reject(new Error("Não foi possível ler o arquivo."));
          reader.readAsDataURL(f);
        });
        return { name: f.name, type: f.type, content };
      }),
    );
  }
  async click(event) {
    const target = event.target.closest("[data-screen], [data-action]");
    if (!target) return;
    event.preventDefault();
    try {
      if (target.dataset.screen) {
        await this.go(target.dataset.screen, target.dataset.id);
        return;
      }
      switch (target.dataset.action) {
        case "reload":
          location.reload();
          break;
        case "logout":
          await this.api("/auth/logout", "POST", {});
          this.clearSession();
          await this.go("home");
          break;
        case "print":
          window.print();
          break;
        case "select-service":
          this.selectedService = target.dataset.id;
          $("#main").innerHTML = this.newRequest();
          $("#request-form").scrollIntoView({ behavior: "smooth" });
          $("#request-form textarea").focus();
          break;
        case "read-notifications":
          await this.api("/notifications/read", "POST", {
            ids: this.notifications
              .filter((n) => !n.read)
              .slice(0, 500)
              .map((n) => n.id),
          });
          await this.go("notifications");
          break;
      }
    } catch (error) {
      this.toast(error.message);
    }
  }
  async submit(event) {
    const form = event.target.closest("[data-form]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.busy) return;
    const button = form.querySelector('button[type="submit"]');
    const error = form.querySelector(".form-error");
    if (error) error.textContent = "";
    if (button) button.disabled = true;
    form.dataset.busy = "true";
    const input = Object.fromEntries(new FormData(form));
    try {
      switch (form.dataset.form) {
        case "login":
          this.user = (await this.api("/auth/login", "POST", input)).user;
          this.filter = { search: "", status: "", overdue: false };
          await this.go("dashboard");
          break;
        case "register": {
          const result = await this.api("/auth/register", "POST", input);
          await this.go("login");
          this.toast(result.message);
          break;
        }
        case "forgot": {
          const result = await this.api("/auth/forgot", "POST", input);
          this.toast(result.message);
          break;
        }
        case "reset": {
          const result = await this.api("/auth/reset", "POST", {
            ...input,
            token: this.resetToken,
          });
          this.resetToken = null;
          this.clearSession();
          await this.go("login");
          this.toast(result.message);
          break;
        }
        case "filters":
          this.filter = { ...input, overdue: Boolean(input.overdue) };
          $("#main").innerHTML = this.dashboard();
          break;
        case "new-request": {
          const r = await this.api("/requests", "POST", {
            serviceId: this.selectedService,
            description: input.description,
            attachments: await this.attachments(form),
          });
          await this.go("confirmation", r.id);
          break;
        }
        case "message":
          await this.api(
            `/requests/${this.request.id}/messages`,
            "POST",
            input,
          );
          await this.go("detail", this.request.id);
          this.toast("Mensagem enviada.");
          break;
        case "assign":
          await this.api(`/requests/${this.request.id}/assignment`, "POST", {
            assigneeId: input.assigneeId,
            version: this.request.version,
          });
          await this.go("detail", this.request.id);
          this.toast("Responsável atualizado.");
          break;
        case "status":
          await this.api(`/requests/${this.request.id}/status`, "POST", {
            status: input.status,
            notes: input.notes,
            version: this.request.version,
            attachments: await this.attachments(form),
          });
          await this.go("detail", this.request.id);
          this.toast("Atendimento atualizado.");
          break;
        case "report":
          this.period = input;
          $("#main").innerHTML = this.reportView(await this.fetchReport());
          break;
        case "service":
          await this.api("/admin/services", "POST", {
            ...input,
            id: form.dataset.id || undefined,
            slaDays: Number(input.slaDays),
            active: Boolean(input.active),
            attachmentRequired: Boolean(input.attachmentRequired),
          });
          await this.go("admin");
          this.toast("Serviço salvo.");
          break;
        case "holidays":
          await this.api("/admin/holidays", "PUT", {
            holidays: input.holidays.split(/\s+/).filter(Boolean),
          });
          await this.go("admin");
          this.toast("Calendário salvo.");
          break;
        case "user":
          await this.api(`/admin/users/${form.dataset.id}`, "PATCH", {
            role: input.role,
            active: Boolean(input.active),
          });
          await this.go("admin");
          this.toast(
            "Permissões atualizadas. As sessões anteriores foram encerradas.",
          );
          break;
      }
    } catch (failure) {
      if (error) {
        error.textContent = failure.message;
        error.setAttribute("tabindex", "-1");
        error.focus();
      } else this.toast(failure.message);
    } finally {
      delete form.dataset.busy;
      if (button) button.disabled = false;
    }
  }
}
new SDASAApp();
