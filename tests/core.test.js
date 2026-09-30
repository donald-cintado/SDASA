import test from "node:test";
import assert from "node:assert/strict";
import {
  businessDate,
  canRead,
  canTransition,
  isOverdue,
  validateAttachment,
  validDay,
} from "../shared/core.js";

test("dias úteis excluem finais de semana, feriados e respeitam São Paulo", () => {
  assert.equal(
    businessDate("2026-09-25T10:00:00-03:00", 1),
    "2026-09-28T18:00:00-03:00",
  );
  assert.equal(
    businessDate("2026-09-25T10:00:00-03:00", 1, ["2026-09-28"]),
    "2026-09-29T18:00:00-03:00",
  );
  assert.equal(
    businessDate("2026-12-31T10:00:00-03:00", 1, ["2027-01-01"]),
    "2027-01-04T18:00:00-03:00",
  );
  assert.equal(
    businessDate("2026-09-26T01:00:00Z", 1),
    "2026-09-28T18:00:00-03:00",
  );
  assert.throws(() => businessDate(new Date(), 0));
  assert.throws(() => businessDate(new Date(), 1.5));
});
test("perfis, propriedade, atribuição e estados finais usam as regras reais", () => {
  const request = { userId: "a", assigneeId: "p", status: "pending" };
  assert.equal(canRead({ id: "a", role: "student" }, request), true);
  assert.equal(canRead({ id: "b", role: "student" }, request), false);
  assert.equal(canRead({ id: "p", role: "professor" }, request), true);
  assert.equal(canRead({ id: "q", role: "professor" }, request), false);
  assert.equal(canRead({ id: "m", role: "manager" }, request), false);
  assert.equal(
    canTransition({ id: "a", role: "student" }, request, "in_progress"),
    false,
  );
  assert.equal(
    canTransition({ id: "s", role: "secretary" }, request, "in_progress"),
    true,
  );
  assert.equal(
    canTransition({ id: "s", role: "secretary" }, request, "concluded"),
    false,
  );
  request.status = "awaiting_student";
  assert.equal(
    canTransition({ id: "a", role: "student" }, request, "in_progress"),
    true,
  );
  request.status = "concluded";
  assert.equal(
    canTransition({ id: "s", role: "secretary" }, request, "in_progress"),
    false,
  );
});
test("datas inválidas, anexos grandes e vazios são rejeitados", () => {
  assert.equal(validDay("2026-02-30"), false);
  assert.equal(validDay("2028-02-29"), true);
  assert.throws(() =>
    validateAttachment({ name: "x.pdf", size: 0, type: "application/pdf" }),
  );
  assert.throws(() =>
    validateAttachment({
      name: "x.pdf",
      size: 5 * 1024 * 1024 + 1,
      type: "application/pdf",
    }),
  );
  assert.throws(() =>
    validateAttachment({ name: "x.html", size: 20, type: "text/html" }),
  );
  assert.doesNotThrow(() =>
    validateAttachment({ name: "x.pdf", size: 1024, type: "application/pdf" }),
  );
});
test("encerramentos não aparecem como atraso ativo", () => {
  const request = {
    status: "in_progress",
    estimatedDate: "2026-09-25T18:00:00-03:00",
  };
  assert.equal(isOverdue(request, new Date("2026-09-25T20:59:59Z")), false);
  assert.equal(isOverdue(request, new Date("2026-09-26T00:00:00Z")), true);
  assert.equal(isOverdue({ ...request, status: "concluded" }), false);
});
