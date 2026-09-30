import { test, expect } from "@playwright/test";

async function login(page, role) {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByLabel("E-mail", { exact: true }).fill(`${role}@sdasa.test`);
  await page.getByLabel("Senha", { exact: true }).fill("Demonstracao!2026");
  await page
    .locator('form[data-form="login"]')
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await expect(page.getByRole("navigation")).toBeVisible();
}
test("fluxo entre sessões: anexo, encaminhamento, mensagem, complementação, conclusão e gestão", async ({
  browser,
}) => {
  const contexts = [],
    errors = [];
  async function actor(role) {
    const context = await browser.newContext();
    contexts.push(context);
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await login(page, role);
    return page;
  }
  try {
    const aluno = await actor("aluno");
    await aluno
      .getByRole("navigation")
      .getByRole("button", { name: "Nova solicitação", exact: true })
      .click();
    await aluno
      .locator("article")
      .filter({
        has: aluno.getByRole("heading", {
          name: "Declaração de Matrícula",
          exact: true,
        }),
      })
      .getByRole("button", { name: "Selecionar" })
      .click();
    await aluno
      .getByLabel("Descreva sua solicitação")
      .fill(
        'Preciso de uma declaração. <img src=x onerror="window.injected=true">',
      );
    await aluno
      .getByLabel("Documentos (PDF, PNG ou JPG)")
      .setInputFiles({
        name: "comprovante.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\ncomprovante de teste"),
      });
    await aluno
      .getByRole("button", { name: "Enviar solicitação", exact: true })
      .click();
    await expect(
      aluno.getByText("Solicitação registrada com sucesso."),
    ).toBeVisible();
    const protocol = await aluno.locator(".receipt .protocol").innerText();
    await aluno
      .getByRole("button", { name: "Acompanhar solicitação", exact: true })
      .click();
    await expect(
      aluno.getByRole("link", { name: "comprovante.pdf" }),
    ).toBeVisible();
    const downloadEvent = aluno.waitForEvent("download");
    await aluno.getByRole("link", { name: "comprovante.pdf" }).click();
    expect((await downloadEvent).suggestedFilename()).toBe("comprovante.pdf");
    expect(await aluno.evaluate(() => window.injected)).toBeUndefined();

    const secretaria = await actor("secretaria");
    await secretaria
      .getByRole("row")
      .filter({ hasText: protocol })
      .getByRole("button", { name: "Detalhes" })
      .click();
    await secretaria
      .getByLabel("Parecer", { exact: true })
      .fill("Documentos conferidos.");
    await secretaria
      .getByRole("button", { name: "Salvar atualização" })
      .click();
    await expect(secretaria.locator(".toolbar .badge")).toHaveText(
      "Em análise",
    );
    await secretaria.getByLabel("Encaminhar para").selectOption("professor");
    await secretaria
      .getByRole("button", { name: "Salvar encaminhamento" })
      .click();
    await expect(
      secretaria.getByText("Responsável atualizado.", { exact: true }),
    ).toBeVisible();

    const professor = await actor("professor");
    await professor
      .getByRole("row")
      .filter({ hasText: protocol })
      .getByRole("button", { name: "Detalhes" })
      .click();
    await professor
      .getByLabel("Nova mensagem")
      .fill("Parecer acadêmico favorável.");
    await professor.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(
      professor.getByText("Parecer acadêmico favorável.", { exact: true }),
    ).toBeVisible();
    await expect(
      professor.getByRole("button", { name: "Salvar atualização" }),
    ).toHaveCount(0);

    await secretaria
      .getByLabel("Próximo status")
      .selectOption("awaiting_student");
    await secretaria
      .getByLabel("Parecer", { exact: true })
      .fill("Informe a finalidade da declaração.");
    await secretaria
      .getByRole("button", { name: "Salvar atualização" })
      .click();
    await expect(secretaria.locator(".toolbar .badge")).toHaveText(
      "Aguardando complementação",
    );
    await aluno.getByRole("button", { name: "Atualizar", exact: true }).click();
    await aluno
      .getByLabel("Complementação", { exact: true })
      .fill("Apresentação em estágio.");
    await aluno.getByRole("button", { name: "Salvar atualização" }).click();
    await expect(aluno.locator(".toolbar .badge")).toHaveText("Em análise");
    await secretaria
      .getByRole("button", { name: "Atualizar", exact: true })
      .click();
    await secretaria.getByLabel("Próximo status").selectOption("concluded");
    await secretaria
      .getByLabel("Parecer", { exact: true })
      .fill("Atendimento concluído.");
    await secretaria
      .getByRole("button", { name: "Salvar atualização" })
      .click();
    await expect(secretaria.locator(".toolbar .badge")).toHaveText("Concluído");
    await aluno.reload();
    await aluno
      .getByRole("row")
      .filter({ hasText: protocol })
      .getByRole("button", { name: "Detalhes" })
      .click();
    await expect(aluno.locator(".toolbar .badge")).toHaveText("Concluído");
    await expect(
      aluno.getByText("Parecer acadêmico favorável.", { exact: true }),
    ).toBeVisible();
    await aluno
      .getByRole("navigation")
      .getByRole("button", { name: /Notificações/ })
      .click();
    await expect(
      aluno.getByText("Status atualizado: Concluído.", { exact: true }),
    ).toBeVisible();
    await aluno.getByRole("button", { name: "Marcar como lidas" }).click();
    await expect(aluno.locator(".notification.unread")).toHaveCount(0);

    const gestor = await actor("gestor");
    await gestor
      .getByRole("button", { name: "Indicadores", exact: true })
      .click();
    await expect(
      gestor.getByRole("heading", { name: "Indicadores de atendimento" }),
    ).toBeVisible();
    await expect(
      gestor.getByRole("cell", {
        name: "Declaração de Matrícula",
        exact: true,
      }),
    ).toBeVisible();
    const admin = await actor("admin");
    await admin
      .getByRole("navigation")
      .getByRole("button", { name: "Administração", exact: true })
      .click();
    await admin
      .getByLabel("Datas", { exact: true })
      .fill("2026-12-25\n2027-01-01");
    await admin.getByRole("button", { name: "Salvar calendário" }).click();
    await expect(
      admin.getByRole("textbox", { name: "Datas", exact: true }),
    ).toHaveValue("2026-12-25\n2027-01-01");
    await admin
      .locator("summary")
      .filter({ hasText: "Adicionar serviço" })
      .click();
    const service = admin.locator('form[data-form="service"]').first();
    await service.getByLabel("Nome do serviço").fill("Orientação acadêmica");
    await service.getByLabel("Categoria", { exact: true }).fill("Acadêmico");
    await service
      .getByLabel("Descrição", { exact: true })
      .fill("Atendimento de orientação.");
    await service.getByRole("button", { name: "Salvar serviço" }).click();
    await expect(
      admin.locator("summary").filter({ hasText: "Orientação acadêmica" }),
    ).toBeVisible();
    await aluno.screenshot({
      path: "test-results/notifications-desktop.png",
      fullPage: true,
    });
    expect(errors).toEqual([]);
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});

test("cadastro, teclado, tela mobile e falha de envio sem confirmação falsa", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Seu atendimento acadêmico em um só lugar.",
    }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Ir para o conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page
    .getByRole("button", { name: "Criar minha conta", exact: true })
    .click();
  await page.getByLabel("Nome completo").fill("Aluno Mobile");
  await page
    .getByLabel("E-mail", { exact: true })
    .fill(`mobile-${Date.now()}@sdasa.test`);
  const address = await page.getByLabel("E-mail", { exact: true }).inputValue();
  await page.getByLabel("Senha", { exact: true }).fill("Mobile-password!2026");
  await page
    .locator('form[data-form="register"]')
    .getByRole("button", { name: "Criar conta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bem-vindo de volta" }),
  ).toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill(address);
  await page.getByLabel("Senha", { exact: true }).fill("Mobile-password!2026");
  await page
    .locator('form[data-form="login"]')
    .getByRole("button", { name: "Entrar", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Nova solicitação", exact: true })
    .click();
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Declaração de Matrícula",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Selecionar" })
    .click();
  await page
    .getByLabel("Descreva sua solicitação")
    .fill("Não perder este texto em caso de falha.");
  await page.route("**/api/requests", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Falha temporária de gravação." }),
        })
      : route.continue(),
  );
  await page
    .getByRole("button", { name: "Enviar solicitação", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText(
    "Falha temporária de gravação.",
  );
  await expect(page.getByLabel("Descreva sua solicitação")).toHaveValue(
    "Não perder este texto em caso de falha.",
  );
  await expect(
    page.getByText("Solicitação registrada com sucesso."),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/new-request-mobile.png",
    fullPage: true,
  });
});
