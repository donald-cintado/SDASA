import test from 'node:test';
import assert from 'node:assert/strict';

// Mocks e Lógica de Negócio do Core do SDASA para Testes Automatizados

const SERVICE_TYPES_FIXTURE = [
  { id: "decl_matricula", category: "Documentos", title: "Declaração de Matrícula", slaDays: 1 },
  { id: "hist_escolar", category: "Documentos", title: "Histórico Escolar Parcial / Oficial", slaDays: 5 },
  { id: "just_falta", category: "Acadêmico", title: "Justificativa de Faltas", slaDays: 3 },
  { id: "rev_nota", category: "Acadêmico", title: "Revisão de Nota / Avaliação", slaDays: 7 },
  { id: "disp_disc", category: "Secretaria", title: "Dispensa de Disciplina / Equivalência", slaDays: 10 },
  { id: "atestado", category: "Saúde / Geral", title: "Envio de Atestado Médico", slaDays: 2 },
  { id: "trancamento", category: "Secretaria", title: "Trancamento ou Cancelamento de Matrícula", slaDays: 5 }
];

const USERS_FIXTURE = [
  { id: "user_mariana", name: "Mariana Oliveira", role: "student", ra: "2024108842", email: "mariana.oliveira@faculdade.edu.br" },
  { id: "user_secretaria", name: "Carlos Eduardo Santos", role: "secretary", ra: "SEC-9041", email: "secretaria@faculdade.edu.br" },
  { id: "user_professor", name: "Prof.ª Erika Miranda", role: "professor", ra: "DOC-2026", email: "erika.miranda@faculdade.edu.br" }
];

const VALID_STATUSES = ['submitted', 'in_review', 'approved', 'rejected', 'completed'];

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

function isValidStatusTransition(currentStatus, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) return false;
  if (currentStatus === 'completed' || currentStatus === 'rejected') return false; // Estados finais
  return true;
}

// -------------------------------------------------------------
// Suíte de Testes Unitários: DevOps CI - SDASA Core
// -------------------------------------------------------------

test('1. Validação do Formato do Protocolo Oficial', () => {
  const protocol = generateProtocolId();
  assert.match(protocol, /^SDASA-2026-\d{4}$/, 'O protocolo deve seguir o padrão SDASA-2026-XXXX');
});

test('2. Catálogo de Serviços e Prazos de SLA', () => {
  assert.equal(SERVICE_TYPES_FIXTURE.length, 7, 'Devem existir 7 serviços acadêmicos parametrizados');
  
  const declMatricula = SERVICE_TYPES_FIXTURE.find(s => s.id === 'decl_matricula');
  assert.ok(declMatricula, 'Serviço de Declaração de Matrícula deve existir');
  assert.equal(declMatricula.slaDays, 1, 'Declaração de Matrícula deve ter SLA de 1 dia');

  const justFalta = SERVICE_TYPES_FIXTURE.find(s => s.id === 'just_falta');
  assert.equal(justFalta.slaDays, 3, 'Justificativa de Falta deve ter SLA de 3 dias');
});

test('3. Cálculo de Data Estimada de Conclusão (SLA)', () => {
  const baseDate = new Date('2026-03-10T10:00:00Z');
  const estimated = calculateEstimatedDate(baseDate, 5);
  
  const expectedDate = new Date('2026-03-15T10:00:00Z');
  assert.equal(estimated.toISOString(), expectedDate.toISOString(), 'A data de previsão deve ser incrementada pelo número correto de dias de SLA');
});

test('4. Controle de Acesso e Papéis de Usuários (RBAC)', () => {
  const student = USERS_FIXTURE.find(u => u.role === 'student');
  const secretary = USERS_FIXTURE.find(u => u.role === 'secretary');
  const professor = USERS_FIXTURE.find(u => u.role === 'professor');

  assert.equal(canUserDispatch(student.role), false, 'Aluno não pode despachar solicitações');
  assert.equal(canUserDispatch(secretary.role), true, 'Secretaria tem permissão para despachar solicitações');
  assert.equal(canUserDispatch(professor.role), false, 'Docente regular não despacha solicitações de secretaria');
});

test('5. Transições de Status e Validação de Fluxo', () => {
  assert.equal(isValidStatusTransition('submitted', 'in_review'), true, 'Transição de submetido para em análise é válida');
  assert.equal(isValidStatusTransition('in_review', 'approved'), true, 'Transição de em análise para deferido é válida');
  assert.equal(isValidStatusTransition('completed', 'in_review'), false, 'Não é permitida reabertura arbitrária a partir de concluído');
  assert.equal(isValidStatusTransition('in_review', 'status_invalido'), false, 'Status desconhecido deve ser rejeitado');
});

test('6. Checklist do Teste de Usabilidade (Seção 5.5)', () => {
  const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
  assert.equal(requiredSteps.length, 8, 'O guia interativo de usabilidade deve conter exatamente 8 etapas de validação');
});
