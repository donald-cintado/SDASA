# Atividade 6 — Planejamento e quadro da Sprint

## Objetivo e capacidade

**Sprint 1: consolidar o fluxo seguro de abertura, acompanhamento e triagem de solicitações.** Ao final, aluno e secretaria devem demonstrar o atendimento inicial com protocolo, prazo e anexos privados.

Duração proposta: **duas semanas (10 dias úteis)**, com início e término a registrar na reunião de planejamento. Capacidade inicial proposta: **21 Story Points**, a validar pela equipe; não há velocidade histórica que comprove essa capacidade. Trata-se de uma Sprint de evolução e validação sobre a aplicação existente: revisar o código, corrigir lacunas e demonstrar critérios faz parte do trabalho.

O [Product Backlog](BACKLOG.md) define as histórias e os critérios completos. Contas de demonstração e catálogo já existentes são pré-condições, sem necessidade de concluir HU01 ou HU11 nesta Sprint.

## Sprint Backlog selecionado

| História                 |   SP   | Trabalho da Sprint                                                  | Dependência / evidência esperada                                                             |
| :----------------------- | :----: | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------- |
| HU02 — Entrar e sair     |   3    | Revisar autenticação, sessão e logout; corrigir falhas encontradas. | Contas sintéticas; demonstrar login válido/inválido e revogação após saída.                  |
| HU03 — Abrir solicitação |   5    | Revisar validações, persistência, protocolo e confirmação.          | HU02, catálogo ativo e integração com HU12; demonstrar abertura e recusa de dados inválidos. |
| HU04 — Acompanhar status |   3    | Revisar lista, detalhes, estado vazio e isolamento por titular.     | HU02 e HU03; demonstrar consulta própria e recusa de consulta alheia.                        |
| HU07 — Triar e atualizar |   5    | Revisar fluxo administrativo, histórico e conflito de versão.       | HU03 e contas de secretaria; demonstrar atualização válida e transição indevida recusada.    |
| HU12 — Anexos privados   |   5    | Revisar envio, limites e autorização de download.                   | HU02 e integração com HU03; demonstrar arquivo válido, inválido e download sem permissão.    |
| **Total**                | **21** | **Cinco histórias selecionadas.**                                   | **Aceite conforme DoD do backlog.**                                                          |

## Quadro de acompanhamento

**Backlog → A Fazer → Em Desenvolvimento → Teste → Concluído**

Estado inicial do planejamento, sem alegação de execução ou aceite. As cinco histórias escolhidas estão em **A Fazer**; as demais permanecem no **Backlog**.

| Backlog                     | A Fazer                  | Em Desenvolvimento | Teste | Concluído |
| :-------------------------- | :----------------------- | :----------------- | :---- | :-------- |
| HU01 — Cadastro             | HU02 — Entrar e sair     | —                  | —     | —         |
| HU05 — Histórico            | HU03 — Abrir solicitação | —                  | —     | —         |
| HU06 — Notificações         | HU04 — Acompanhar status | —                  | —     | —         |
| HU08 — Prazos               | HU07 — Triar e atualizar | —                  | —     | —         |
| HU09 — Mensagens            | HU12 — Anexos privados   | —                  | —     | —         |
| HU10 — Indicadores          | —                        | —                  | —     | —         |
| HU11 — Catálogo e feriados  | —                        | —                  | —     | —         |
| HU13 — Recuperação de senha | —                        | —                  | —     | —         |
| HU14 — Perfis e contas      | —                        | —                  | —     | —         |
| HU15 — Parecer do professor | —                        | —                  | —     | —         |
| HU16 — Complementação       | —                        | —                  | —     | —         |
| HU17 — Backup e restauração | —                        | —                  | —     | —         |
| HU18 — Direitos do titular  | —                        | —                  | —     | —         |
| HU19 — Retenção             | —                        | —                  | —     | —         |
| HU20 — Eventos de segurança | —                        | —                  | —     | —         |

Cada história deve aparecer em apenas uma coluna. Ao movê-la, registrar responsável, data, impedimentos e link de PR ou evidência. Uma falha em Teste devolve a história para Em Desenvolvimento. Concluído exige todos os critérios e a Definition of Done; existência prévia de código não basta.

## Organização da equipe e cerimônias

- **Product Owner — Prof.ª Erika Miranda:** revisar prioridades e aceitar o incremento na Sprint Review.
- **Scrum Master — Donald Cintado Cabezas:** facilitar planejamento, Daily de até 15 minutos e remoção de impedimentos.
- **Negócios — Ana Beatriz Cruz da Silva:** conferir regras e cenários de atendimento.
- **Arquitetura — Maria Luiza Dias Silva Tavares:** revisar dependências e decisões técnicas.
- **Dev/DevOps — Allan Vinícius Cabeggi Alvarenga:** implementar ajustes e registrar PRs e CI.
- **Segurança — Stephanny Crepalde Costa:** revisar permissões, anexos e riscos.
- **Qualidade — Júlio César Benício Inácio:** validar critérios e registrar resultados.

São responsabilidades propostas a partir dos papéis do projeto. No primeiro dia, realizar Planning e confirmar capacidade. A cada dia, revisar progresso e impedimentos. No último dia, realizar Review com o fluxo aluno/secretaria e Retrospectiva com uma ação de melhoria e responsável. Replanejar itens incompletos sem marcá-los como concluídos.

## Evidências previstas

Usar dados sintéticos e registrar os resultados dos testes pertinentes de [VALIDACAO.md](VALIDACAO.md), a demonstração dos cinco itens e a decisão de aceite. A entrega esperada é um incremento verificável; este quadro não afirma que os testes ou a Review desta Sprint já aconteceram.
