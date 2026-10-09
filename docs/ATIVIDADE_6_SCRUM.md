# Atividade 6 — Scrum na Prática (Módulo 3)
## SDASA — Sistema Digital de Atendimento e Solicitações Acadêmicas

**Disciplina:** Tópicos Avançados em Sistemas de Informação II  
**Orientação:** Prof.ª Erika Miranda (Product Owner)  
**Ano:** 2026  
**Repositório Oficial:** [https://github.com/donald-cintado/SDASA](https://github.com/donald-cintado/SDASA)

---

## 👥 1. Equipe e Papéis do Scrum no SDASA

Conforme a definição oficial do Módulo 3 — Atividade 6:

| Papel Scrum | Integrante | Responsabilidade no Projeto |
|:---|:---|:---|
| **Product Owner** | **Prof.ª Erika Miranda** | Priorizar o Product Backlog e garantir que o produto gere valor acadêmico. |
| **Scrum Master** | **Donald Cintado Cabezas** | Facilitar o processo Scrum, acompanhar impedimentos e organizar a Sprint. |
| **Analista de Negócios** | **Ana Beatriz Cruz da Silva** | Detalhar necessidades e apoiar a definição das histórias e critérios. |
| **Arquiteto de Software** | **Stephanny Crepalde Costa** | Garantir que as soluções implementadas estejam alinhadas à arquitetura. |
| **Dev / DevOps** | **Júlio César Benício Inácio** | Implementar, testar, versionar e integrar as histórias selecionadas. |
| **Security Officer** | **Maria Luiza Dias Silva Tavares** | Verificar requisitos e riscos de segurança. |
| **Qualidade e Sustentabilidade** | **Allan Vinícius Cabeggi Alvarenga** | Apoiar testes, qualidade e práticas sustentáveis. |

---

## 🎯 2. Objetivo da Atividade

A Atividade 6 transforma o projeto **SDASA** em um **Product Backlog** organizado segundo a abordagem Scrum. As necessidades levantadas nas entrevistas, na persona, no Design Thinking, nos requisitos de software e na proposta inicial foram convertidas em **15 histórias de usuário** priorizadas, estimadas e acompanhadas por critérios objetivos de aceitação.

A estimativa utiliza a escala Fibonacci de **Story Points** (1, 2, 3, 5, 8 e 13), representando complexidade e esforço relativos.

---

## 📋 3. Product Backlog Completo (15 Histórias de Usuário)

Formato padrão: *“Como [tipo de usuário], quero [funcionalidade], para [benefício].”*

| ID | Usuário | História de Usuário | Prioridade | Pts | Critério de Aceitação | Status na Solução |
|:---:|:---|:---|:---:|:---:|:---|:---:|
| **HU01** | Aluno | Como aluno, quero criar uma conta no sistema, para acessar os serviços acadêmicos de forma digital. | Alta | 3 | O cadastro é concluído quando os dados obrigatórios são válidos e a conta é criada. | ✅ Implementado e testado |
| **HU02** | Usuário | Como usuário, quero realizar login, para acessar as funcionalidades de acordo com meu perfil. | Alta | 2 | Com credenciais válidas, o usuário acessa o sistema; com credenciais inválidas, recebe uma mensagem de erro. | ✅ Implementado e testado |
| **HU03** | Aluno | Como aluno, quero visualizar os tipos de serviços acadêmicos disponíveis, para escolher corretamente o tipo de solicitação. | Alta | 2 | O sistema apresenta os serviços disponíveis de forma clara e permite selecionar um deles. | ✅ Implementado e testado |
| **HU04** | Aluno | Como aluno, quero abrir uma solicitação acadêmica, para solicitar atendimento sem precisar comparecer presencialmente. | Alta | 5 | A solicitação é registrada com tipo, descrição, data e protocolo após validação dos dados. | ✅ Implementado e testado |
| **HU05** | Aluno | Como aluno, quero consultar minhas solicitações, para visualizar as demandas que já registrei. | Alta | 3 | O sistema apresenta somente as solicitações permitidas ao usuário, com protocolo e informações básicas. | ✅ Implementado e testado |
| **HU06** | Aluno | Como aluno, quero acompanhar o status da minha solicitação, para saber em que etapa ela está. | Alta | 3 | O status atual e o histórico de alterações ficam disponíveis para consulta. | ✅ Implementado e testado |
| **HU07** | Aluno | Como aluno, quero consultar o histórico das minhas solicitações, para ter registro dos atendimentos realizados. | Média | 3 | O sistema apresenta solicitações anteriores com protocolo, tipo, datas e status final. | ✅ Implementado |
| **HU08** | Aluno | Como aluno, quero receber notificações sobre alterações, para saber quando minha solicitação for atualizada. | Média | 3 | Uma alteração relevante gera uma notificação visível ao usuário. | ✅ Implementado |
| **HU09** | Secretaria | Como funcionário da secretaria, quero administrar as solicitações, para organizar e processar as demandas recebidas. | Alta | 5 | A secretaria autorizada consegue localizar uma solicitação e atualizar seu atendimento. | ✅ Implementado |
| **HU10** | Secretaria | Como funcionário da secretaria, quero controlar prazos e pendências, para evitar atrasos no atendimento. | Alta | 5 | O painel identifica solicitações pendentes e seus respectivos prazos. | ✅ Implementado |
| **HU11** | Usuário / Secretaria | Como usuário e funcionário da secretaria, quero trocar mensagens vinculadas à solicitação, para esclarecer informações sem perder o histórico da demanda. | Média | 5 | As mensagens ficam vinculadas ao protocolo e podem ser consultadas pelos usuários autorizados. | ✅ Implementado |
| **HU12** | Gestor | Como gestor, quero consultar indicadores de atendimento, para avaliar o desempenho do serviço acadêmico. | Média | 5 | O sistema apresenta indicadores básicos por período, status ou tipo de serviço. | ✅ Implementado |
| **HU13** | Administrador | Como administrador, quero gerenciar usuários e permissões, para garantir que cada perfil tenha acesso adequado. | Média | 5 | O administrador consegue criar, editar, ativar/desativar usuários e definir permissões. | ✅ Implementado |
| **HU14** | Aluno | Como aluno, quero anexar documentos à solicitação, para enviar comprovantes necessários ao atendimento. | Média | 3 | O usuário consegue anexar arquivo permitido e o arquivo fica vinculado à solicitação. | ✅ Implementado |
| **HU15** | Usuário | Como usuário, quero recuperar minha senha, para voltar a acessar o sistema quando esquecer minhas credenciais. | Baixa | 3 | O usuário consegue iniciar a recuperação e definir uma nova senha após validação. | ✅ Implementado |

---

## 📊 4. Priorização do Product Backlog

A priorização considera o valor para o usuário, a dependência técnica entre funcionalidades e a necessidade de construir primeiro o fluxo central do SDASA:

| Nível de Prioridade | Critério Adotado | Histórias de Usuário |
|:---:|:---|:---|
| **Alta** | Essenciais para o primeiro fluxo funcional do produto. | **HU01, HU02, HU03, HU04, HU05, HU06, HU09, HU10** |
| **Média** | Importantes para ampliar atendimento, controle e gestão. | **HU07, HU08, HU11, HU12, HU13, HU14** |
| **Baixa** | Funcionalidade de evolução, sem bloquear o fluxo principal. | **HU15** |

---

## 🏃 5. Sprint Selecionada — Sprint 1

### 5.1 Escopo da Sprint 1
Para a Sprint 1 foram selecionadas as **6 histórias essenciais** para entregar o primeiro fluxo funcional ponta a ponta do aluno no SDASA:

| ID | História | Prioridade | Story Points |
|:---:|:---|:---:|:---:|
| **HU01** | Como aluno, quero criar uma conta no sistema, para acessar os serviços acadêmicos de forma digital. | Alta | 3 |
| **HU02** | Como usuário, quero realizar login, para acessar as funcionalidades de acordo com meu perfil. | Alta | 2 |
| **HU03** | Como aluno, quero visualizar os tipos de serviços acadêmicos disponíveis, para escolher corretamente o tipo de solicitação. | Alta | 2 |
| **HU04** | Como aluno, quero abrir uma solicitação acadêmica, para solicitar atendimento sem precisar comparecer presencialmente. | Alta | 5 |
| **HU05** | Como aluno, quero consultar minhas solicitações, para visualizar as demandas que já registrei. | Alta | 3 |
| **HU06** | Como aluno, quero acompanhar o status da minha solicitação, para saber em que etapa ela está. | Alta | 3 |
| **TOTAL** | **6 Histórias de Usuário** | — | **18 Story Points** |

**Total estimado da Sprint 1:** 18 Story Points.

### 5.2 Objetivo da Sprint 1
> *“Entregar uma primeira versão funcional do SDASA na qual um aluno consiga criar sua conta, realizar login, consultar os serviços disponíveis, abrir uma solicitação acadêmica, receber um protocolo, consultar a solicitação registrada e acompanhar seu status.”*

---

## 🏁 6. Definition of Done (DoD) — Definição de Pronto

Para que qualquer história seja considerada **Concluída (Done)**, ela deve atender aos seguintes critérios:
1. **Implementação conforme requisito:** A história foi implementada de acordo com o requisito definido.
2. **Critérios de aceitação verificados:** Todos os critérios de aceitação foram validados com sucesso.
3. **Versionamento Git:** O código foi versionado no Git com commits descritivos (padrão Conventional Commits).
4. **Execução de testes:** A suíte de testes automatizados (`npm test`) foi executada com 100% de sucesso.
5. **Qualidade de código:** Não existem erros críticos conhecidos na funcionalidade nem vulnerabilidades identificadas.
6. **Integração contínua:** A funcionalidade foi revisada e integrada à versão da Sprint (`main`/`develop`).
7. **Documentação atualizada:** A documentação necessária do projeto foi devidamente atualizada.

---

## 📌 7. Quadro Scrum da Sprint 1

Fluxo de trabalho: **Backlog → A Fazer → Em Desenvolvimento → Teste → Concluído**

| Backlog (Próximas Sprints) | A Fazer | Em Desenvolvimento | Teste | Concluído (Sprint 1) |
|:---|:---|:---|:---|:---|
| **HU07** (Histórico) — 3 pts<br>**HU08** (Notificações) — 3 pts<br>**HU09** (Gestão Secretaria) — 5 pts<br>**HU10** (Prazos/Pendências) — 5 pts<br>**HU11** (Mensagens) — 5 pts<br>**HU12** (Indicadores) — 5 pts<br>**HU13** (Administração) — 5 pts<br>**HU14** (Anexos) — 3 pts<br>**HU15** (Recuperar Senha) — 3 pts | — | — | — | **HU01** (Criar conta) — 3 pts<br>**HU02** (Login de usuário) — 2 pts<br>**HU03** (Catálogo de serviços) — 2 pts<br>**HU04** (Abrir solicitação) — 5 pts<br>**HU05** (Consultar pedidos) — 3 pts<br>**HU06** (Acompanhar status) — 3 pts |

*(Nota: Na entrega prática do projeto, as histórias da Sprint 1 já foram completamente implementadas, testadas e integradas, atingindo a coluna Concluído com base na DoD).*

---

## 🔄 8. Fluxo de Movimentação das Histórias

| Etapa | Condição para Entrada | Condição para Saída |
|:---|:---|:---|
| **Backlog** | História ainda não selecionada para a Sprint. | História priorizada e selecionada para o Sprint Backlog. |
| **A Fazer** | História selecionada para a Sprint e pronta para desenvolvimento. | Um integrante da equipe inicia a implementação. |
| **Em Desenvolvimento** | Desenvolvimento técnico em andamento. | Implementação concluída e pronta para validação/testes. |
| **Teste** | Funcionalidade implementada e disponível para validação. | Critérios de aceitação atendidos e testes executados com sucesso. |
| **Concluído** | Testes e critérios de aceitação aprovados conforme a Definition of Done. | História formalmente encerrada na Sprint. |

---

## 🔗 9. Relação com os Artefatos Anteriores

| Artefato Anterior | Relação com a Atividade 6 |
|:---|:---|
| **Entrevistas e Persona** | Identificaram os problemas, necessidades e dores dos estudantes que originaram as histórias de usuário. |
| **Design Thinking** | Definiu a jornada do usuário, a proposta de valor e o fluxo das funcionalidades prioritárias do produto. |
| **Engenharia de Software** | Detalhou a especificação formal de requisitos (RF/RNF), regras de negócio (RN) e casos de uso (UC). |
| **DevOps** | Estabeleceu o ciclo de desenvolvimento, Git, convenção de commits, testes automatizados e esteira de CI/CD. |
| **Product Backlog** | Organiza e prioriza as funcionalidades do produto de maneira contínua e iterativa. |
| **Sprint Backlog** | Seleciona o conjunto de histórias executáveis na iteração corrente com metas claras. |
| **Diagrama de Casos de Uso** | Relaciona os atores do sistema (Aluno, Secretaria, Professor, Gestor, Administrador) às funcionalidades das histórias. |

---

## 💡 10. Evidências Técnicas de Cumprimento no Código

1. **HU01 (Cadastro):** Rota `POST /api/auth/register`, validação de campos obrigatórios, hash seguro com salt, perfil Aluno imutável sem elevação indevida (`server/service.js`, linha 34). Testado em `tests/api.test.js`.
2. **HU02 (Login):** Rota `POST /api/auth/login`, validação de credenciais, geração de sessão com token criptográfico seguro e cookie HttpOnly. Testado em `tests/api.test.js`.
3. **HU03 (Serviços):** Catálogo formal parametrizado (`server/catalog.js`) retornado via `GET /api/catalog` e exibido no painel para seleção direta pelo estudante.
4. **HU04 (Abertura):** Rota `POST /api/requests`, validação de integridade, cálculo de SLA em dias úteis e geração de protocolo no formato `#SDASA-2026-XXXX`. Testado em `tests/api.test.js`.
5. **HU05 (Consulta):** Rota `GET /api/requests`, retorno estritamente restrito às solicitações do próprio aluno logado (proteção contra IDOR e vazamento de dados). Testado em `tests/api.test.js`.
6. **HU06 (Acompanhamento):** Rota `GET /api/requests/:id`, linha do tempo com histórico de status, pareceres e eventos de tramitação acessíveis para acompanhamento. Testado em `tests/api.test.js` e `tests/browser/workflow.spec.js`.
