export const ROLES = {
  student: "Aluno(a)",
  secretary: "Secretaria",
  professor: "Professor(a)",
  manager: "Gestor(a)",
  admin: "Administrador(a)",
};
export const STATUSES = {
  pending: "Aguardando triagem",
  in_progress: "Em análise",
  awaiting_student: "Aguardando complementação",
  concluded: "Concluído",
  rejected: "Indeferido",
};
export const TRANSITIONS = {
  pending: ["in_progress"],
  in_progress: ["awaiting_student", "concluded", "rejected"],
  awaiting_student: ["in_progress"],
  concluded: [],
  rejected: [],
};
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_FILES = 5;
export function assert(condition, message, status = 400) {
  if (!condition) throw Object.assign(new Error(message), { status });
}
export function text(value, label, max = 5000, min = 1) {
  assert(
    typeof value === "string" &&
      value.trim().length >= min &&
      value.trim().length <= max,
    `${label}: informe entre ${min} e ${max} caracteres.`,
  );
  return value.trim();
}
export function validDay(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function businessDate(base, days, holidays = []) {
  assert(
    Number.isInteger(days) && days >= 1 && days <= 365,
    "Prazo deve ser de 1 a 365 dias úteis.",
  );
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date(base));
  const date = new Date(`${day}T12:00:00Z`);
  for (let count = 0; count < days;) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (
      ![0, 6].includes(date.getUTCDay()) &&
      !holidays.includes(date.toISOString().slice(0, 10))
    )
      count++;
  }
  return `${date.toISOString().slice(0, 10)}T18:00:00-03:00`;
}
export function canRead(user, request) {
  return Boolean(
    user &&
    (["secretary", "admin"].includes(user.role) ||
      (user.role === "student" && request.userId === user.id) ||
      (user.role === "professor" && request.assigneeId === user.id)),
  );
}
export function canTransition(user, request, next) {
  if (!canRead(user, request) || !TRANSITIONS[request.status]?.includes(next))
    return false;
  if (["secretary", "admin"].includes(user.role)) return true;
  return (
    user.role === "student" &&
    request.status === "awaiting_student" &&
    next === "in_progress"
  );
}
export function isOverdue(request, now = new Date()) {
  return (
    !["concluded", "rejected"].includes(request.status) &&
    new Date(request.estimatedDate) < now
  );
}
export function validateAttachment(file) {
  text(file.name, "Nome do arquivo", 180);
  assert(
    Number.isInteger(file.size) && file.size > 0 && file.size <= MAX_FILE_SIZE,
    "Cada arquivo deve ter até 5 MB e não pode estar vazio.",
  );
  assert(
    ["application/pdf", "image/png", "image/jpeg"].includes(file.type),
    "Aceitamos apenas PDF, PNG e JPG.",
  );
}
