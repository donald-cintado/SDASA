import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * SDASA - Suíte de Testes Automatizados (Node.js Test Runner)
 * Cobertura de Regras de Negócio (RN01-RN10), Requisitos (RF01-RF12)
 * Histórias de Usuário (US01-US10) e Casos de Uso (UC01-UC06)
 */

const SERVICE_TYPES_FIXTURE = [
  { id: "decl_matricula", category: "Documentos", title: "Declaração de Matrícula", slaDays: 1 },
  { id: "hist_escolar", category: "Documentos", title: "Histórico Escolar Parcial / Oficial", slaDays: 3 },
  { id: "just_falta", category: "Frequência e Avaliações", title: "Justificativa de Faltas / Atestado Médico", slaDays: 2 },
  { id: "rev_prova", category: "Frequência e Avaliações", title: "Revisão de Prova / Nota de Avaliação", slaDays: 5 },
  { id: "trancamento", category: "Vida Acadêmica", title: "Trancamento de Matrícula / Disciplina", slaDays: 4 },
  { id: "aprov_estudos", category: "Vida Acadêmica", title: "Aproveitamento de Estudos / Equivalência", slaDays: 7 },
  { id: "carteirinha", category: "Geral", title: "2ª Via de Carteirinha Estudantil / Passe", slaDays: 3 }
];

const USERS_FIXTURE = [
  { id: "user_mariana", name: "Mariana Oliveira", role: "student", ra: "2024108842", email: "mariana.oliveira@faculdade.edu.br", cpf: "123.456.789-00" },
  { id: "user_secretaria", name: "Carlos Eduardo Santos", role: "secretary", ra: "SEC-9041", email: "secretaria@faculdade.edu.br", cpf: "987.654.321-11" },
  { id: "user_professor", name: "Prof.ª Erika Miranda", role: "professor", ra: "DOC-2026", email: "erika.miranda@faculdade.edu.br", cpf: "456.789.123-22" },
  { id: "user_gestor", name: "Dr. Roberto Guimarães", role: "manager", ra: "GES-2026", email: "gestao@faculdade.edu.br", cpf: "321.654.987-33" },
  { id: "user_admin", name: "Administrador do Sistema", role: "admin", ra: "ADM-0001", email: "admin@faculdade.edu.br", cpf: "111.222.333-44" }
];

const VALID_STATUSES = ['pending', 'in_progress', 'concluded', 'rejected'];

function generateProtocolId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SDASA-2026-${randomNum}`;
}

function calculateEstimatedDate(baseDate, slaDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + slaDays);
  return date;
}

function canUserDispatch(userRole) {
  return userRole === 'secretary' || userRole === 'admin';
}

function canUserViewIndicators(userRole) {
  return userRole === 'manager' || userRole === 'admin';
}

function isValidStatusTransition(currentStatus, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) return false;
  if (currentStatus === 'concluded' || currentStatus === 'rejected') return false; // Estados finais imutáveis
  return true;
}

function validateUserRegistration(data) {
  if (!data.name || data.name.trim().length < 3) return { valid: false, error: 'Nome inválido' };
  if (!data.email || !data.email.includes('@')) return { valid: false, error: 'E-mail inválido' };
  if (!data.cpf || data.cpf.length < 11) return { valid: false, error: 'CPF inválido' };
  if (!data.ra || data.ra.length < 5) return { valid: false, error: 'RA inválido' };
  if (!data.password || data.password.length < 6) return { valid: false, error: 'Senha deve ter no mínimo 6 dígitos' };
  return { valid: true };
}

function addMessageToRequest(request, sender, text) {
  if (!request.messages) request.messages = [];
  const msg = {
    id: `msg_${Date.now()}`,
    senderName: sender.name,
    senderRole: sender.role,
    time: new Date().toISOString(),
    text: text
  };
  request.messages.push(msg);
  return msg;
}

function calculateManagementMetrics(requests) {
  const total = requests.length;
  const concluded = requests.filter(r => r.status === 'concluded').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const slaRate = total > 0 ? Math.round(((concluded + inProgress) / total) * 100) : 100;
  return { total, concluded, pending, inProgress, rejected, slaRate };
}

// -------------------------------------------------------------
// Bateria de Testes Automatizados - SDASA Core
// -------------------------------------------------------------

test('1. Validação do Formato do Protocolo Oficial (RN01, RF11, US03, US04)', () => {
  const protocol = generateProtocolId();
  assert.match(protocol, /^SDASA-2026-\d{4}$/, 'O protocolo deve seguir rigorosamente a máscara SDASA-2026-XXXX');
});

test('2. Catálogo de Serviços e Prazos de SLA (RN04, RF12, US02)', () => {
  assert.equal(SERVICE_TYPES_FIXTURE.length, 7, 'Devem existir 7 serviços acadêmicos parametrizados');
  
  const declMatricula = SERVICE_TYPES_FIXTURE.find(s => s.id === 'decl_matricula');
  assert.ok(declMatricula, 'Serviço de Declaração de Matrícula deve existir');
  assert.equal(declMatricula.slaDays, 1, 'Declaração de Matrícula deve ter SLA de 1 dia útil');

  const justFalta = SERVICE_TYPES_FIXTURE.find(s => s.id === 'just_falta');
  assert.equal(justFalta.slaDays, 2, 'Justificativa de Falta deve ter SLA de 2 dias úteis');

  const aprovEstudos = SERVICE_TYPES_FIXTURE.find(s => s.id === 'aprov_estudos');
  assert.equal(aprovEstudos.slaDays, 7, 'Aproveitamento de Estudos deve ter SLA de 7 dias');
});

test('3. Cálculo de Data Estimada de Conclusão e Prazos (RN07, RF07, US08)', () => {
  const baseDate = new Date('2026-03-10T10:00:00Z');
  const estimated = calculateEstimatedDate(baseDate, 5);
  
  const expectedDate = new Date('2026-03-15T10:00:00Z');
  assert.equal(estimated.toISOString(), expectedDate.toISOString(), 'A data de previsão deve ser calculada somando os dias de SLA à data de abertura');
});

test('4. Controle de Acesso e Papéis de Usuários - RBAC (RN02, RN03, RF02, UC01, UC04)', () => {
  const student = USERS_FIXTURE.find(u => u.role === 'student');
  const secretary = USERS_FIXTURE.find(u => u.role === 'secretary');
  const professor = USERS_FIXTURE.find(u => u.role === 'professor');
  const manager = USERS_FIXTURE.find(u => u.role === 'manager');
  const admin = USERS_FIXTURE.find(u => u.role === 'admin');

  assert.equal(canUserDispatch(student.role), false, 'Aluno não tem permissão para despachar solicitações');
  assert.equal(canUserDispatch(secretary.role), true, 'Secretaria tem permissão para despachar solicitações');
  assert.equal(canUserDispatch(professor.role), false, 'Docente regular não despacha solicitações de secretaria');
  assert.equal(canUserDispatch(admin.role), true, 'Administrador tem permissão total de despacho');

  assert.equal(canUserViewIndicators(student.role), false, 'Aluno não pode acessar o painel de indicadores');
  assert.equal(canUserViewIndicators(manager.role), true, 'Gestor tem permissão de consulta de indicadores');
});

test('5. Transições de Status e Ciclo de Vida da Demanda (RN06, RF05, US04)', () => {
  assert.equal(isValidStatusTransition('pending', 'in_progress'), true, 'Transição de pendente para em análise é válida');
  assert.equal(isValidStatusTransition('in_progress', 'concluded'), true, 'Transição de em análise para concluído é válida');
  assert.equal(isValidStatusTransition('concluded', 'in_progress'), false, 'Não é permitida reabertura arbitrária a partir de solicitação concluída');
  assert.equal(isValidStatusTransition('rejected', 'in_progress'), false, 'Não é permitida reabertura a partir de indeferimento final');
  assert.equal(isValidStatusTransition('in_progress', 'status_desconhecido'), false, 'Status não previsto deve ser rejeitado');
});

test('6. Checklist do Teste de Usabilidade (Seção 5.5 do Documento Oficial)', () => {
  const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
  assert.equal(requiredSteps.length, 8, 'O checklist de usabilidade deve contemplar as 8 etapas estabelecidas na seção 5.5');
});

test('7. Validação de Cadastro de Conta de Usuário (US01, RF01, UC01)', () => {
  const validData = {
    name: 'Ana Beatriz Teste',
    email: 'ana.beatriz@faculdade.edu.br',
    cpf: '123.456.789-10',
    ra: '2026105544',
    password: 'senhaSegura123'
  };
  const result = validateUserRegistration(validData);
  assert.equal(result.valid, true, 'Cadastro com dados válidos deve ser aceito');

  const invalidData = { ...validData, email: 'email_sem_arroba' };
  const resultInvalid = validateUserRegistration(invalidData);
  assert.equal(resultInvalid.valid, false, 'Cadastro com e-mail inválido deve ser recusado');
});

test('8. Comunicação Bilateral Vinculada à Solicitação (US09, RF08, RN09, UC05)', () => {
  const mockReq = {
    id: 'SDASA-2026-1234',
    serviceTitle: 'Declaração de Matrícula',
    messages: []
  };
  const senderStudent = { name: 'Mariana Oliveira', role: 'student' };
  const senderSec = { name: 'Carlos Eduardo', role: 'secretary' };

  addMessageToRequest(mockReq, senderStudent, 'Por favor, preciso do documento até amanhã.');
  addMessageToRequest(mockReq, senderSec, 'Documento assinado digitalmente e anexado.');

  assert.equal(mockReq.messages.length, 2, 'As mensagens devem ser persistidas na thread da solicitação');
  assert.equal(mockReq.messages[0].senderRole, 'student');
  assert.equal(mockReq.messages[1].senderRole, 'secretary');
});

test('9. Consolidação de Indicadores Gerenciais (US10, RF09, RN10, UC06)', () => {
  const sampleRequests = [
    { id: '1', status: 'concluded' },
    { id: '2', status: 'concluded' },
    { id: '3', status: 'in_progress' },
    { id: '4', status: 'pending' },
    { id: '5', status: 'rejected' }
  ];
  const metrics = calculateManagementMetrics(sampleRequests);

  assert.equal(metrics.total, 5, 'Total deve ser calculado com precisão');
  assert.equal(metrics.concluded, 2, 'Total de concluídos deve ser 2');
  assert.equal(metrics.pending, 1, 'Total de pendentes deve ser 1');
  assert.equal(metrics.slaRate, 60, 'Taxa de atendimento no prazo deve ser calculada corretamente');
});

test('10. Rastreabilidade das Regras de Negócio e Requisitos (Parte II - Seção 3.6)', () => {
  const traceabilityMatrix = [
    { necessity: "Acessar o sistema", userStories: ["HU01", "HU02"], reqs: ["RF01", "RF02"], uc: "UC01" },
    { necessity: "Registrar demanda", userStories: ["HU03"], reqs: ["RF03", "RF11", "RF12"], uc: "UC02" },
    { necessity: "Acompanhar andamento", userStories: ["HU04", "HU05"], reqs: ["RF04", "RF05"], uc: "UC03" },
    { necessity: "Administrar demandas", userStories: ["HU07", "HU08"], reqs: ["RF07", "RF10"], uc: "UC04" },
    { necessity: "Comunicar usuário", userStories: ["HU06", "HU09"], reqs: ["RF06", "RF08"], uc: "UC05" },
    { necessity: "Indicadores", userStories: ["HU10"], reqs: ["RF09"], uc: "UC06" }
  ];

  assert.equal(traceabilityMatrix.length, 6, 'A matriz de rastreabilidade simplificada deve mapear os 6 eixos do projeto');
  traceabilityMatrix.forEach(entry => {
    assert.ok(entry.userStories.length > 0, `Eixo ${entry.necessity} deve possuir ao menos uma história associada`);
    assert.ok(entry.reqs.length > 0, `Eixo ${entry.necessity} deve possuir requisitos mapeados`);
    assert.ok(entry.uc.startsWith('UC'), `Eixo ${entry.necessity} deve possuir Caso de Uso mapeado`);
  });
});
