/**
 * SDASA - Sistema Digital de Atendimento e Solicitações Acadêmicas
 * Aplicação Principal do Protótipo (State, Navegação e Interatividade)
 * Projeto Integrador - Módulo 1 (2026)
 */

// Ícones SVG embutidos para garantir 100% de funcionamento mesmo offline ou sem CDN
const ICONS = {
  checkCircle: `<svg class="w-4 h-4 text-emerald-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  circle: `<svg class="w-4 h-4 text-slate-300 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg>`,
  document: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
  clock: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
};

class SDASAApp {
  constructor() {
    window.app = this; // Garante referência global imediata
    this.currentUser = null;
    this.requests = [];
    this.notifications = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.selectedService = null;
    this.uploadedFiles = [];
    this.lastCreatedRequest = null;
    
    // Checklist do Teste de Usabilidade (Item 5.5 do Documento)
    this.testChecklist = {
      step1: false, // Acessar tela inicial
      step2: false, // Realizar login
      step3: false, // Localizar Nova solicitação
      step4: false, // Selecionar tipo de atendimento
      step5: false, // Preencher descrição
      step6: false, // Enviar solicitação
      step7: false, // Identificar protocolo gerado
      step8: false  // Verificar status
    };

    this.init();
  }

  init() {
    try {
      this.loadState();
      this.setupEventListeners();
      this.renderServicesGrid();
      this.updateUsabilityGuide();
      
      // Inicia na Tela Inicial (Tela 1 do fluxo)
      this.showScreen('home');
      this.markTestStep('step1');

      this.refreshIcons();
    } catch (err) {
      console.error("Erro na inicialização do SDASAApp:", err);
    }
  }

  refreshIcons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (e) {
      console.warn("Lucide icons não inicializado:", e);
    }
  }

  loadState() {
    try {
      const savedRequests = localStorage.getItem('sdasa_requests');
      if (savedRequests) {
        this.requests = JSON.parse(savedRequests);
      } else {
        this.requests = (typeof INITIAL_REQUESTS !== 'undefined') ? [...INITIAL_REQUESTS] : [];
        this.saveRequests();
      }

      const savedNotifications = localStorage.getItem('sdasa_notifications');
      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications);
      } else {
        this.notifications = (typeof INITIAL_NOTIFICATIONS !== 'undefined') ? [...INITIAL_NOTIFICATIONS] : [];
        this.saveNotifications();
      }

      // Usuário padrão: Mariana Oliveira (Persona do documento)
      this.currentUser = (typeof INITIAL_USERS !== 'undefined') ? INITIAL_USERS[0] : {
        id: "user_mariana",
        name: "Mariana Oliveira",
        role: "student",
        roleLabel: "Aluno(a)",
        email: "mariana.oliveira@faculdade.edu.br",
        cpf: "123.456.789-00",
        ra: "2024108842",
        course: "Análise e Desenvolvimento de Sistemas",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      };
    } catch (e) {
      console.error("Erro ao carregar estado:", e);
    }
  }

  saveRequests() {
    try {
      localStorage.setItem('sdasa_requests', JSON.stringify(this.requests));
    } catch (e) {
      console.warn("Falha ao salvar solicitações:", e);
    }
  }

  saveNotifications() {
    try {
      localStorage.setItem('sdasa_notifications', JSON.stringify(this.notifications));
    } catch (e) {
      console.warn("Falha ao salvar notificações:", e);
    }
  }

  resetData() {
    if (confirm('Deseja restaurar os dados originais do protótipo? Todas as novas solicitações de teste serão reiniciadas.')) {
      try {
        localStorage.removeItem('sdasa_requests');
        localStorage.removeItem('sdasa_notifications');
        this.requests = (typeof INITIAL_REQUESTS !== 'undefined') ? [...INITIAL_REQUESTS] : [];
        this.notifications = (typeof INITIAL_NOTIFICATIONS !== 'undefined') ? [...INITIAL_NOTIFICATIONS] : [];
        this.saveRequests();
        this.saveNotifications();
        this.currentUser = (typeof INITIAL_USERS !== 'undefined') ? INITIAL_USERS[0] : null;
        this.testChecklist = {
          step1: true, step2: false, step3: false, step4: false,
          step5: false, step6: false, step7: false, step8: false
        };
        this.updateUsabilityGuide();
        this.showScreen('home');
        this.showToast('Dados do protótipo restaurados para o estado inicial!');
      } catch (e) {
        console.error("Erro ao reiniciar dados:", e);
      }
    }
  }

  // ==========================================
  // Navegação de Telas
  // ==========================================
  showScreen(screenId) {
    try {
      document.querySelectorAll('.screen-view').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
      });

      const targetScreen = document.getElementById(`screen-${screenId}`);
      if (targetScreen) {
        targetScreen.style.display = 'block';
        setTimeout(() => {
          targetScreen.classList.add('active');
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Ações contextuais por tela
      if (screenId === 'home') {
        this.markTestStep('step1');
      } else if (screenId === 'login') {
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (emailInput && this.currentUser) emailInput.value = this.currentUser.email;
        if (passInput) passInput.value = '123456';
      } else if (screenId === 'dashboard') {
        this.renderDashboard();
      } else if (screenId === 'new-request') {
        this.markTestStep('step3');
        this.resetNewRequestForm();
      } else if (screenId === 'confirmation') {
        this.markTestStep('step7');
        this.renderConfirmationScreen();
      }

      this.refreshIcons();
    } catch (e) {
      console.error("Erro em showScreen:", e);
    }
  }

  // ==========================================
  // Autenticação, Perfis e Cadastro (US01, US02, UC01, RF01)
  // ==========================================
  login(userType = 'student') {
    try {
      let roleToFind = userType;
      if (userType === 'secretaria') roleToFind = 'secretary';
      if (userType === 'gestor') roleToFind = 'manager';

      const user = (typeof INITIAL_USERS !== 'undefined') 
        ? (INITIAL_USERS.find(u => u.role === roleToFind || u.id === userType) || INITIAL_USERS[0])
        : this.currentUser;

      this.currentUser = user;
      this.markTestStep('step2');
      this.updateUserUI();
      this.showScreen('dashboard');
      this.showToast(`Bem-vindo(a), ${user.name}! Conectado como ${user.roleLabel}.`);
    } catch (e) {
      console.error("Erro ao realizar login:", e);
      this.showScreen('dashboard');
    }
  }

  switchUser(userType) {
    this.login(userType);
  }

  logout() {
    this.currentUser = (typeof INITIAL_USERS !== 'undefined') ? INITIAL_USERS[0] : null;
    this.showScreen('home');
    this.showToast('Sessão encerrada com sucesso.');
  }

  openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.classList.remove('hidden');
    this.refreshIcons();
  }

  closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.classList.add('hidden');
  }

  handleRegisterSubmit() {
    const name = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const cpf = document.getElementById('reg-cpf')?.value.trim();
    const ra = document.getElementById('reg-ra')?.value.trim();
    const course = document.getElementById('reg-course')?.value;
    const password = document.getElementById('reg-password')?.value;
    const confirm = document.getElementById('reg-password-confirm')?.value;

    if (!name || !email || !cpf || !ra || !password) {
      this.showToast('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirm) {
      this.showToast('As senhas digitadas não conferem.');
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name,
      role: "student",
      roleLabel: "Aluno(a)",
      email: email,
      cpf: cpf,
      ra: ra,
      course: course || "Análise e Desenvolvimento de Sistemas",
      semester: "1º Semestre",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };

    if (typeof INITIAL_USERS !== 'undefined') {
      INITIAL_USERS.push(newUser);
    }

    this.currentUser = newUser;
    this.closeRegisterModal();
    this.markTestStep('step2');
    this.updateUserUI();
    this.showScreen('dashboard');
    this.showToast(`Cadastro realizado com sucesso! Bem-vindo(a), ${name}.`);
  }

  updateUserUI() {
    if (!this.currentUser) return;
    const isSecretary = this.currentUser.role === 'secretary';
    const isGestor = this.currentUser.role === 'manager';
    const isProfessor = this.currentUser.role === 'professor';

    // Atualiza dados no header e sidebar
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = this.currentUser.name);
    document.querySelectorAll('.user-role-display').forEach(el => el.textContent = this.currentUser.roleLabel);
    document.querySelectorAll('.user-course-display').forEach(el => el.textContent = this.currentUser.course);
    document.querySelectorAll('.user-ra-display').forEach(el => el.textContent = this.currentUser.ra);
    document.querySelectorAll('.user-avatar-display').forEach(el => {
      if (this.currentUser.avatar) el.src = this.currentUser.avatar;
    });

    // Banners no dashboard
    const secretaryBanner = document.getElementById('secretary-banner');
    if (secretaryBanner) secretaryBanner.classList.toggle('hidden', !isSecretary);

    const gestorBanner = document.getElementById('gestor-banner');
    if (gestorBanner) gestorBanner.classList.toggle('hidden', !isGestor);

    const professorBanner = document.getElementById('professor-banner');
    if (professorBanner) professorBanner.classList.toggle('hidden', !isProfessor);

    // Cards e visões do dashboard
    const studentStats = document.getElementById('student-stats-cards');
    const secretaryStats = document.getElementById('secretary-stats-cards');
    const gestorStats = document.getElementById('gestor-stats-cards');
    const gestorAnalytics = document.getElementById('gestor-analytics-panel');

    if (studentStats) studentStats.classList.toggle('hidden', isSecretary || isGestor);
    if (secretaryStats) secretaryStats.classList.toggle('hidden', !isSecretary);
    if (gestorStats) gestorStats.classList.toggle('hidden', !isGestor);
    if (gestorAnalytics) gestorAnalytics.classList.toggle('hidden', !isGestor);
  }

  // ==========================================
  // Dashboard, Métricas e Indicadores (US10, RF09, RN10, UC06)
  // ==========================================
  renderDashboard() {
    this.updateUserUI();
    this.renderMetrics();
    if (this.currentUser && this.currentUser.role === 'manager') {
      this.renderGestorDashboard();
    }
    this.renderRequestsTable();
    this.renderNotificationsBadge();
  }

  renderMetrics() {
    if (!this.currentUser) return;
    const isSpecialUser = this.currentUser.role === 'secretary' || this.currentUser.role === 'manager' || this.currentUser.role === 'professor';
    const userRequests = isSpecialUser 
      ? this.requests 
      : this.requests.filter(r => r.userId === this.currentUser.id);

    const total = userRequests.length;
    const pending = userRequests.filter(r => r.status === 'pending').length;
    const inProgress = userRequests.filter(r => r.status === 'in_progress').length;
    const concluded = userRequests.filter(r => r.status === 'concluded').length;

    const countTotal = document.getElementById('count-total');
    const countPending = document.getElementById('count-pending');
    const countInProgress = document.getElementById('count-in-progress');
    const countConcluded = document.getElementById('count-concluded');

    if (countTotal) countTotal.textContent = total;
    if (countPending) countPending.textContent = pending;
    if (countInProgress) countInProgress.textContent = inProgress;
    if (countConcluded) countConcluded.textContent = concluded;

    // Métricas da secretaria
    const secTotal = document.getElementById('sec-count-total');
    const secPending = document.getElementById('sec-count-pending');
    const secInProgress = document.getElementById('sec-count-in-progress');
    const secConcluded = document.getElementById('sec-count-concluded');

    if (secTotal) secTotal.textContent = this.requests.length;
    if (secPending) secPending.textContent = this.requests.filter(r => r.status === 'pending').length;
    if (secInProgress) secInProgress.textContent = this.requests.filter(r => r.status === 'in_progress').length;
    if (secConcluded) secConcluded.textContent = this.requests.filter(r => r.status === 'concluded').length;
  }

  renderGestorDashboard() {
    const total = this.requests.length;
    const concluded = this.requests.filter(r => r.status === 'concluded').length;
    const pending = this.requests.filter(r => r.status === 'pending').length;
    const inProgress = this.requests.filter(r => r.status === 'in_progress').length;
    const rejected = this.requests.filter(r => r.status === 'rejected').length;

    // Cumprimento de SLA: pedidos concluídos ou em tramitação dentro do prazo
    const slaRate = total > 0 ? Math.round(((concluded + inProgress) / total) * 100) : 100;
    const avgDays = "2.1 dias úteis";
    const critical = pending;

    const gesTotal = document.getElementById('ges-count-total');
    const gesSla = document.getElementById('ges-sla-rate');
    const gesAvg = document.getElementById('ges-avg-time');
    const gesCrit = document.getElementById('ges-critical-count');

    if (gesTotal) gesTotal.textContent = total;
    if (gesSla) gesSla.textContent = `${slaRate}%`;
    if (gesAvg) gesAvg.textContent = avgDays;
    if (gesCrit) gesCrit.textContent = critical;

    // Distribuição por Status
    const statusContainer = document.getElementById('ges-status-distribution');
    if (statusContainer) {
      const items = [
        { label: "Concluído / Deferido", count: concluded, color: "bg-emerald-500", text: "text-emerald-700" },
        { label: "Em Análise / Tramitação", count: inProgress, color: "bg-sky-500", text: "text-sky-700" },
        { label: "Aguardando Triagem (Pendente)", count: pending, color: "bg-amber-500", text: "text-amber-700" },
        { label: "Indeferido / Recusado", count: rejected, color: "bg-rose-500", text: "text-rose-700" }
      ];

      statusContainer.innerHTML = items.map(item => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return `
          <div>
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-700">${item.label}</span>
              <span class="font-bold ${item.text}">${item.count} (${pct}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="${item.color} h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Distribuição por Tipo de Serviço Acadêmico
    const serviceContainer = document.getElementById('ges-service-distribution');
    if (serviceContainer) {
      const countsByService = {};
      this.requests.forEach(r => {
        countsByService[r.serviceTitle] = (countsByService[r.serviceTitle] || 0) + 1;
      });

      const serviceEntries = Object.entries(countsByService);
      serviceContainer.innerHTML = serviceEntries.map(([title, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div>
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-semibold text-slate-700 truncate max-w-[220px]">${title}</span>
              <span class="font-bold text-indigo-700">${count} (${pct}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderRequestsTable() {
    const tableBody = document.getElementById('requests-table-body');
    const emptyState = document.getElementById('requests-empty-state');
    if (!tableBody) return;

    const isSpecialRole = this.currentUser && (
      this.currentUser.role === 'secretary' || 
      this.currentUser.role === 'manager' || 
      this.currentUser.role === 'professor' ||
      this.currentUser.role === 'admin'
    );

    let filtered = (!this.currentUser || isSpecialRole)
      ? [...this.requests]
      : this.requests.filter(r => r.userId === this.currentUser.id);

    // Filtro por Status
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.currentFilter);
    }

    // Filtro por Busca
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.id && r.id.toLowerCase().includes(term)) ||
        (r.serviceTitle && r.serviceTitle.toLowerCase().includes(term)) ||
        (r.userName && r.userName.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tableBody.innerHTML = filtered.map(req => {
      const statusMeta = this.getStatusMeta(req.status);
      const createdDateFormatted = this.formatDate(req.createdAt);
      const estimatedDateFormatted = this.formatDate(req.estimatedDate);
      const isSec = this.currentUser && (this.currentUser.role === 'secretary' || this.currentUser.role === 'admin');
      const msgCount = (req.messages && req.messages.length) ? req.messages.length : 0;

      // Alertas de Prazos e Pendências (US08 / RF07 / RN07)
      let slaBadge = '';
      if (req.status === 'pending') {
        slaBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1"><i data-lucide="alert-circle" class="w-2.5 h-2.5"></i> Aguardando Triagem</span>`;
      } else if (req.status === 'in_progress') {
        slaBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 mt-1"><i data-lucide="clock" class="w-2.5 h-2.5"></i> Em Tramitação</span>`;
      }

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
          <td class="py-4 px-4 font-mono font-semibold text-blue-900 text-sm">
            <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100">${req.id}</span>
          </td>
          <td class="py-4 px-4">
            <div class="flex items-center gap-2">
              <span class="font-medium text-slate-800">${req.serviceTitle}</span>
              ${msgCount > 0 ? `
                <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded-full" title="${msgCount} mensagem(ns) vinculada(s)">
                  <i data-lucide="message-square" class="w-2.5 h-2.5"></i> ${msgCount}
                </span>
              ` : ''}
            </div>
            <div class="text-xs text-slate-500">${req.category} • ${req.userName}</div>
          </td>
          <td class="py-4 px-4 text-xs text-slate-600">
            <div>${createdDateFormatted}</div>
            <div class="text-slate-400 text-[11px]">Prev.: ${estimatedDateFormatted}</div>
            ${slaBadge}
          </td>
          <td class="py-4 px-4">
            <span class="status-badge status-badge-${req.status}">
              <span class="w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}"></span>
              ${statusMeta.label}
            </span>
          </td>
          <td class="py-4 px-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="app.openRequestDetails('${req.id}')" 
                      class="inline-flex items-center gap-1 text-xs font-semibold bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                Detalhes
              </button>
              ${isSec ? `
                <button onclick="app.openSecretaryActionsModal('${req.id}')" 
                        class="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  Despachar
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.refreshIcons();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filter) {
        btn.className = "filter-tab-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white shadow-sm transition-all";
      } else {
        btn.className = "filter-tab-btn px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-all";
      }
    });
    this.renderRequestsTable();
  }

  searchRequests(term) {
    this.searchTerm = term;
    this.renderRequestsTable();
  }

  // ==========================================
  // Nova Solicitação (Tela 4)
  // ==========================================
  renderServicesGrid() {
    const grid = document.getElementById('services-selection-grid');
    if (!grid || typeof SERVICE_TYPES === 'undefined') return;

    grid.innerHTML = SERVICE_TYPES.map(service => `
      <div onclick="app.selectService('${service.id}')" 
           id="service-card-${service.id}"
           class="service-card cursor-pointer p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div class="flex items-start justify-between mb-2">
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i data-lucide="${service.icon}" class="w-5 h-5"></i>
            </div>
            ${service.badge ? `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">${service.badge}</span>` : ''}
          </div>
          <h4 class="font-semibold text-slate-800 text-sm mb-1 group-hover:text-blue-700">${service.title}</h4>
          <p class="text-xs text-slate-500 line-clamp-2">${service.description}</p>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span class="flex items-center gap-1 font-medium text-slate-700">
            <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i>
            Prazo: até ${service.slaDays} ${service.slaDays === 1 ? 'dia útil' : 'dias úteis'}
          </span>
          <span class="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Selecionar <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </span>
        </div>
      </div>
    `).join('');

    this.refreshIcons();
  }

  selectService(serviceId) {
    if (typeof SERVICE_TYPES === 'undefined') return;
    const service = SERVICE_TYPES.find(s => s.id === serviceId);
    if (!service) return;

    this.selectedService = service;
    this.markTestStep('step4');

    // Destaca o card selecionado
    document.querySelectorAll('.service-card').forEach(card => {
      card.classList.remove('border-blue-600', 'bg-blue-50/40', 'ring-2', 'ring-blue-500/20');
    });
    const selectedCard = document.getElementById(`service-card-${serviceId}`);
    if (selectedCard) {
      selectedCard.classList.add('border-blue-600', 'bg-blue-50/40', 'ring-2', 'ring-blue-500/20');
    }

    // Mostra a segunda etapa do formulário
    const formSection = document.getElementById('new-request-form-section');
    if (formSection) {
      formSection.classList.remove('hidden');
      formSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Preenche dados do serviço no resumo
    const titleEl = document.getElementById('selected-service-title');
    const catEl = document.getElementById('selected-service-category');
    const slaEl = document.getElementById('selected-service-sla');
    const docsEl = document.getElementById('selected-service-docs');

    if (titleEl) titleEl.textContent = service.title;
    if (catEl) catEl.textContent = service.category;
    if (slaEl) slaEl.textContent = `Prazo médio de atendimento: ${service.slaDays} ${service.slaDays === 1 ? 'dia útil' : 'dias úteis'}`;
    if (docsEl) docsEl.textContent = service.requiredDocs;

    this.refreshIcons();
  }

  handleFileUpload(event) {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const sizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      this.uploadedFiles.push({
        name: file.name,
        size: sizeFormatted
      });
    });

    this.renderUploadedFilesList();
  }

  renderUploadedFilesList() {
    const listContainer = document.getElementById('uploaded-files-list');
    if (!listContainer) return;

    if (this.uploadedFiles.length === 0) {
      listContainer.innerHTML = '';
      return;
    }

    listContainer.innerHTML = this.uploadedFiles.map((file, index) => `
      <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="file-check" class="w-4 h-4 text-blue-600 shrink-0"></i>
          <span class="font-medium text-slate-700 truncate">${file.name}</span>
          <span class="text-slate-400 shrink-0">(${file.size})</span>
        </div>
        <button type="button" onclick="app.removeFile(${index})" class="text-slate-400 hover:text-rose-500 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    this.refreshIcons();
  }

  removeFile(index) {
    this.uploadedFiles.splice(index, 1);
    this.renderUploadedFilesList();
  }

  resetNewRequestForm() {
    this.selectedService = null;
    this.uploadedFiles = [];
    const descField = document.getElementById('request-description');
    if (descField) descField.value = '';
    const formSection = document.getElementById('new-request-form-section');
    if (formSection) formSection.classList.add('hidden');
    document.querySelectorAll('.service-card').forEach(card => {
      card.classList.remove('border-blue-600', 'bg-blue-50/40', 'ring-2', 'ring-blue-500/20');
    });
    this.renderUploadedFilesList();
  }

  submitRequest(event) {
    if (event) event.preventDefault();

    if (!this.selectedService) {
      alert('Por favor, selecione um tipo de serviço antes de enviar.');
      return;
    }

    const descField = document.getElementById('request-description');
    const description = descField ? descField.value.trim() : '';
    if (!description) {
      alert('Por favor, descreva detalhadamente a sua solicitação.');
      return;
    }

    this.markTestStep('step5');
    this.markTestStep('step6');

    // Gera ID de Protocolo Único
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const protocolId = `SDASA-2026-${randomNum}`;

    const now = new Date();
    const estDate = new Date();
    estDate.setDate(now.getDate() + (this.selectedService.slaDays || 3));

    const user = this.currentUser || {
      id: "user_mariana",
      name: "Mariana Oliveira",
      ra: "2024108842",
      course: "Análise e Desenvolvimento de Sistemas"
    };

    const newRequest = {
      id: protocolId,
      userId: user.id,
      userName: user.name,
      userRa: user.ra,
      course: user.course,
      serviceId: this.selectedService.id,
      serviceTitle: this.selectedService.title,
      category: this.selectedService.category,
      createdAt: now.toISOString(),
      estimatedDate: estDate.toISOString(),
      status: "pending",
      urgency: document.getElementById('request-urgency') ? document.getElementById('request-urgency').value : "Normal",
      description: description,
      attachments: [...this.uploadedFiles],
      timeline: [
        {
          date: `${this.formatDate(now.toISOString())} às ${this.formatTime(now)}`,
          title: "Solicitação Aberta",
          description: "Demanda registrada com sucesso pelo portal do aluno.",
          actor: `${user.name} (Aluno)`
        }
      ],
      responseNotes: "Aguardando triagem inicial da Secretaria Acadêmica."
    };

    // Salva no início da lista
    this.requests.unshift(newRequest);
    this.saveRequests();
    this.lastCreatedRequest = newRequest;

    // Adiciona notificação de confirmação
    this.addNotification({
      title: "Solicitação Registrada",
      message: `Sua solicitação ${protocolId} (${newRequest.serviceTitle}) foi enviada com sucesso!`,
      requestId: protocolId,
      type: "info"
    });

    // Direciona para a Tela 5 (Resultado / Confirmação)
    this.showScreen('confirmation');
  }

  // ==========================================
  // Tela de Resultado / Confirmação (Tela 5)
  // ==========================================
  renderConfirmationScreen() {
    const req = this.lastCreatedRequest || this.requests[0];
    if (!req) return;

    const protoEl = document.getElementById('conf-protocol-id');
    const titleEl = document.getElementById('conf-service-title');
    const catEl = document.getElementById('conf-category');
    const createdEl = document.getElementById('conf-created-at');
    const estEl = document.getElementById('conf-estimated-date');
    const studentEl = document.getElementById('conf-student-name');
    const raEl = document.getElementById('conf-student-ra');
    const descEl = document.getElementById('conf-description');
    const attachmentsCount = document.getElementById('conf-attachments-count');

    if (protoEl) protoEl.textContent = req.id;
    if (titleEl) titleEl.textContent = req.serviceTitle;
    if (catEl) catEl.textContent = req.category;
    if (createdEl) createdEl.textContent = `${this.formatDate(req.createdAt)} às ${this.formatTime(new Date(req.createdAt))}`;
    if (estEl) estEl.textContent = this.formatDate(req.estimatedDate);
    if (studentEl) studentEl.textContent = req.userName;
    if (raEl) raEl.textContent = `RA: ${req.userRa}`;
    if (descEl) descEl.textContent = req.description;
    
    if (attachmentsCount) {
      attachmentsCount.textContent = (req.attachments && req.attachments.length > 0)
        ? `${req.attachments.length} arquivo(s) anexado(s)` 
        : 'Nenhum anexo';
    }

    const printBtn = document.getElementById('btn-print-confirmation');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }
  }

  // ==========================================
  // Modal de Detalhes da Solicitação
  // ==========================================
  openRequestDetails(requestId) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    this.markTestStep('step8');

    const statusMeta = this.getStatusMeta(req.status);

    const idEl = document.getElementById('modal-req-id');
    const srvEl = document.getElementById('modal-req-service');
    const catEl = document.getElementById('modal-req-category');
    const stdEl = document.getElementById('modal-req-student');
    const crsEl = document.getElementById('modal-req-course');
    const creEl = document.getElementById('modal-req-created');
    const estEl = document.getElementById('modal-req-estimated');
    const urgEl = document.getElementById('modal-req-urgency');
    const dscEl = document.getElementById('modal-req-desc');
    const notEl = document.getElementById('modal-req-notes');

    if (idEl) idEl.textContent = req.id;
    if (srvEl) srvEl.textContent = req.serviceTitle;
    if (catEl) catEl.textContent = req.category;
    if (stdEl) stdEl.textContent = `${req.userName} (${req.userRa})`;
    if (crsEl) crsEl.textContent = req.course;
    if (creEl) creEl.textContent = this.formatDate(req.createdAt);
    if (estEl) estEl.textContent = this.formatDate(req.estimatedDate);
    if (urgEl) urgEl.textContent = req.urgency || "Normal";
    if (dscEl) dscEl.textContent = req.description;
    if (notEl) notEl.textContent = req.responseNotes || "Nenhum parecer emitido até o momento.";

    // Status Badge no Modal
    const badgeEl = document.getElementById('modal-req-status-badge');
    if (badgeEl) {
      badgeEl.className = `status-badge status-badge-${req.status}`;
      badgeEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}"></span> ${statusMeta.label}`;
    }

    // Anexos
    const attachList = document.getElementById('modal-req-attachments');
    if (attachList) {
      if (!req.attachments || req.attachments.length === 0) {
        attachList.innerHTML = '<span class="text-xs text-slate-400 italic">Nenhum anexo enviado</span>';
      } else {
        attachList.innerHTML = req.attachments.map(a => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
            <i data-lucide="paperclip" class="w-3 h-3 text-blue-600"></i>
            ${a.name} (${a.size})
          </span>
        `).join('');
      }
    }

    // Linha do Tempo (Timeline)
    const timelineContainer = document.getElementById('modal-req-timeline');
    if (timelineContainer) {
      timelineContainer.innerHTML = (req.timeline || []).map((t, index, arr) => `
        <div class="relative pl-6 pb-4 ${index !== arr.length - 1 ? 'border-l-2 border-blue-200' : ''}">
          <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <div class="text-[11px] font-semibold text-blue-700 mb-0.5">${t.date}</div>
          <div class="text-xs font-bold text-slate-800">${t.title}</div>
          <div class="text-xs text-slate-600 mt-0.5">${t.description}</div>
          <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <i data-lucide="user" class="w-2.5 h-2.5"></i> ${t.actor}
          </div>
        </div>
      `).join('');
    }

    // Comunicação Vinculada ao Protocolo (US09 / RF08 / RN09 / UC05)
    this.currentViewingRequestId = requestId;
    this.renderRequestMessages(req);

    // Exibe o modal
    const modal = document.getElementById('request-details-modal');
    if (modal) modal.classList.remove('hidden');

    this.refreshIcons();
  }

  renderRequestMessages(req) {
    const messagesCount = document.getElementById('modal-req-messages-count');
    const container = document.getElementById('modal-req-messages-container');
    if (!container) return;

    const messages = req.messages || [];
    if (messagesCount) {
      messagesCount.textContent = `${messages.length} ${messages.length === 1 ? 'mensagem' : 'mensagens'}`;
    }

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-slate-400 italic">
          Nenhuma mensagem registrada nesta solicitação. Utilize o campo abaixo para iniciar o diálogo institucional.
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => {
      const isSec = msg.senderRole === 'secretary';

      return `
        <div class="p-3 rounded-2xl ${isSec ? 'bg-amber-50/80 border border-amber-200' : 'bg-blue-50/80 border border-blue-200'}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-xs ${isSec ? 'text-amber-900' : 'text-blue-900'} flex items-center gap-1">
              <i data-lucide="${isSec ? 'building-2' : 'user'}" class="w-3.5 h-3.5"></i>
              ${msg.senderName}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">${msg.time}</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">${msg.text}</p>
        </div>
      `;
    }).join('');
  }

  sendCurrentRequestMessage() {
    if (!this.currentViewingRequestId) return;
    const input = document.getElementById('modal-req-message-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const req = this.requests.find(r => r.id === this.currentViewingRequestId);
    if (!req) return;

    if (!req.messages) req.messages = [];

    const now = new Date();
    const formattedTime = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderName: `${this.currentUser ? this.currentUser.name : 'Usuário'} (${this.currentUser ? this.currentUser.roleLabel : 'Participante'})`,
      senderRole: this.currentUser ? this.currentUser.role : 'student',
      time: formattedTime,
      text: text
    };

    req.messages.push(newMsg);
    this.saveRequests();
    input.value = '';
    this.renderRequestMessages(req);
    this.renderRequestsTable();

    // Notificação automática sobre a nova mensagem
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: "Nova Mensagem no Protocolo",
      message: `Mensagem registrada no chamado ${req.id} (${req.serviceTitle}).`,
      time: "Agora",
      read: false,
      requestId: req.id,
      type: "info"
    });
    this.saveNotifications();
    this.renderNotificationsBadge();

    this.showToast('Mensagem enviada com sucesso no canal do protocolo.');
    this.refreshIcons();
  }

  closeRequestDetails() {
    this.currentViewingRequestId = null;
    const modal = document.getElementById('request-details-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ==========================================
  // Despacho da Secretaria (Simulação de Gestão)
  // ==========================================
  openSecretaryActionsModal(requestId) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const idEl = document.getElementById('sec-modal-req-id');
    const titleEl = document.getElementById('sec-modal-req-title');
    const statusSelect = document.getElementById('sec-status-select');
    const notesInput = document.getElementById('sec-notes-input');

    if (idEl) idEl.textContent = req.id;
    if (titleEl) titleEl.textContent = `${req.serviceTitle} - ${req.userName}`;
    if (statusSelect) statusSelect.value = req.status;
    if (notesInput) notesInput.value = req.responseNotes || '';

    const modal = document.getElementById('secretary-action-modal');
    if (modal) {
      modal.setAttribute('data-target-request-id', requestId);
      modal.classList.remove('hidden');
    }
  }

  closeSecretaryActionsModal() {
    const modal = document.getElementById('secretary-action-modal');
    if (modal) modal.classList.add('hidden');
  }

  saveSecretaryAction() {
    const modal = document.getElementById('secretary-action-modal');
    if (!modal) return;
    const requestId = modal.getAttribute('data-target-request-id');
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return;

    const newStatus = document.getElementById('sec-status-select').value;
    const notes = document.getElementById('sec-notes-input').value.trim();

    req.status = newStatus;
    req.responseNotes = notes;

    const now = new Date();
    const statusMeta = this.getStatusMeta(newStatus);

    if (!req.timeline) req.timeline = [];
    req.timeline.push({
      date: `${this.formatDate(now.toISOString())} às ${this.formatTime(now)}`,
      title: `Status alterado para ${statusMeta.label}`,
      description: notes || `Parecer administrativo emitido pela Secretaria Acadêmica.`,
      actor: `${this.currentUser ? this.currentUser.name : 'Secretaria'} (Secretaria)`
    });

    this.saveRequests();

    // Notifica o Aluno
    this.addNotification({
      title: `Solicitação Atualizada (${req.id})`,
      message: `A secretaria alterou o status para "${statusMeta.label}". Parecer: "${notes || 'Sem observações adicionais'}"`,
      requestId: req.id,
      type: newStatus === 'concluded' ? 'success' : (newStatus === 'rejected' ? 'danger' : 'info')
    });

    this.closeSecretaryActionsModal();
    this.renderDashboard();
    this.showToast(`Solicitação ${req.id} despachada com sucesso!`);
  }

  // ==========================================
  // Notificações
  // ==========================================
  addNotification(notif) {
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: notif.title,
      message: notif.message,
      time: 'Agora mesmo',
      read: false,
      requestId: notif.requestId || null,
      type: notif.type || 'info'
    };
    this.notifications.unshift(newNotif);
    this.saveNotifications();
    this.renderNotificationsBadge();
  }

  toggleNotificationsModal() {
    const modal = document.getElementById('notifications-modal');
    if (!modal) return;

    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
      this.renderNotificationsList();
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  renderNotificationsList() {
    const list = document.getElementById('notifications-list-container');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="p-6 text-center text-xs text-slate-400">Nenhuma notificação recente.</div>';
      return;
    }

    list.innerHTML = this.notifications.map(n => `
      <div class="p-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-blue-50/50' : ''}">
        <div class="w-8 h-8 rounded-full ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : (n.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600')} flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="${n.type === 'success' ? 'check-circle' : (n.type === 'danger' ? 'alert-circle' : 'bell')}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between gap-2">
            <h5 class="text-xs font-bold text-slate-800">${n.title}</h5>
            <span class="text-[10px] text-slate-400 shrink-0">${n.time}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">${n.message}</p>
          ${n.requestId ? `
            <button onclick="app.toggleNotificationsModal(); app.openRequestDetails('${n.requestId}')" class="text-[11px] font-semibold text-blue-600 hover:underline mt-1.5 inline-flex items-center gap-1">
              Ver solicitação <i data-lucide="arrow-right" class="w-2.5 h-2.5"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Marca todas como lidas
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.renderNotificationsBadge();

    this.refreshIcons();
  }

  renderNotificationsBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge-count');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  // ==========================================
  // Guia de Teste de Usabilidade (Item 5.5)
  // ==========================================
  markTestStep(stepKey) {
    if (this.testChecklist[stepKey] !== undefined) {
      this.testChecklist[stepKey] = true;
      this.updateUsabilityGuide();
    }
  }

  updateUsabilityGuide() {
    try {
      const completedCount = Object.values(this.testChecklist).filter(Boolean).length;
      const totalCount = Object.keys(this.testChecklist).length;
      const percent = Math.round((completedCount / totalCount) * 100);

      const progressEl = document.getElementById('usability-progress-bar');
      const textEl = document.getElementById('usability-progress-text');
      if (progressEl) progressEl.style.width = `${percent}%`;
      if (textEl) textEl.textContent = `${completedCount}/${totalCount} (${percent}%)`;

      const stepTitles = {
        step1: "1. Acessar a tela inicial",
        step2: "2. Realizar o login",
        step3: "3. Localizar Nova solicitação",
        step4: "4. Selecionar o tipo de atendimento",
        step5: "5. Preencher a descrição",
        step6: "6. Enviar a solicitação",
        step7: "7. Identificar o protocolo gerado",
        step8: "8. Verificar o status"
      };

      // Atualiza os passos de forma 100% segura sem depender de transformações do DOM
      for (const key in this.testChecklist) {
        const itemEl = document.getElementById(`guide-${key}`);
        if (itemEl) {
          const isDone = this.testChecklist[key];
          if (isDone) {
            itemEl.className = "flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded transition-colors";
            itemEl.innerHTML = `
              <span class="text-emerald-600 font-bold shrink-0">✓</span>
              <span>${stepTitles[key]}</span>
            `;
          } else {
            itemEl.className = "flex items-center gap-2 text-xs text-slate-500 px-2 py-1 rounded";
            itemEl.innerHTML = `
              <span class="text-slate-300 font-bold shrink-0">○</span>
              <span>${stepTitles[key]}</span>
            `;
          }
        }
      }
    } catch (e) {
      console.error("Erro em updateUsabilityGuide:", e);
    }
  }

  toggleUsabilityDrawer() {
    const drawer = document.getElementById('usability-drawer-content');
    const icon = document.getElementById('usability-toggle-icon');
    if (drawer) {
      drawer.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    }
  }

  // ==========================================
  // Utilitários & Eventos
  // ==========================================
  getStatusMeta(status) {
    switch (status) {
      case 'pending':
        return { label: 'Aguardando Triagem', dotColor: 'bg-amber-500' };
      case 'in_progress':
        return { label: 'Em Análise / Tramitação', dotColor: 'bg-sky-500' };
      case 'concluded':
        return { label: 'Concluído / Deferido', dotColor: 'bg-emerald-500' };
      case 'rejected':
        return { label: 'Indeferido / Cancelado', dotColor: 'bg-rose-500' };
      default:
        return { label: 'Status Desconhecido', dotColor: 'bg-slate-400' };
    }
  }

  formatDate(isoString) {
    if (!isoString) return '--/--/----';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--/--/----';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatTime(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '--:--';
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const mins = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  showToast(message) {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
      toastMsg.textContent = message;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 3500);
    }
  }

  setupEventListeners() {
    // Intercepta formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.login('student');
      });
    }

    // Intercepta formulário de nova solicitação
    const requestForm = document.getElementById('new-request-form');
    if (requestForm) {
      requestForm.addEventListener('submit', (e) => this.submitRequest(e));
    }

    // Upload de arquivo
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Busca rápida
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchRequests(e.target.value));
    }
  }
}

// Inicializa imediatamente e também no DOMContentLoaded
var app = new SDASAApp();
window.app = app;
document.addEventListener('DOMContentLoaded', () => {
  if (!window.app || !window.app.currentUser) {
    window.app = new SDASAApp();
  }
});
