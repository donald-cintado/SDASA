# Backlog oficial do SDASA

Histórias e critérios preservados da main (commit a352967). São referência de planejamento e aceite, não comprovação de implementação. Para o comportamento atual, consulte [API.md](API.md) e [VALIDACAO.md](VALIDACAO.md). A implementação atual autentica por e-mail; menções a CPF permanecem como requisito a avaliar.

## 4. 📋 Backlog Inicial Estruturado (Conforme Seção 6.6)

O backlog reúne as necessidades que deverão ser desenvolvidas e priorizadas pela equipe. Para o SDASA, o backlog inicial está organizado em histórias de usuário, permitindo transformar as necessidades identificadas nas etapas anteriores em funcionalidades implementáveis:

### 4.1 Tabela Oficial do Backlog do Produto (Seção 6.6)

| ID | História de usuário | Prioridade | Critério principal |
|:---:|:---|:---:|:---|
| **US01** | Como aluno, quero criar uma conta para acessar o sistema. | **Alta** | Cadastro realizado com dados válidos. |
| **US02** | Como usuário, quero realizar login para acessar minhas solicitações. | **Alta** | Autenticação validada. |
| **US03** | Como aluno, quero abrir uma solicitação acadêmica. | **Alta** | Solicitação registrada com protocolo. |
| **US04** | Como aluno, quero acompanhar o status da solicitação. | **Alta** | Status exibido de forma clara. |
| **US05** | Como aluno, quero consultar meu histórico. | **Média** | Solicitações anteriores disponíveis. |
| **US06** | Como usuário, quero receber notificações sobre alterações. | **Média** | Atualizações comunicadas ao usuário. |
| **US07** | Como secretaria, quero administrar as solicitações. | **Alta** | Demandas organizadas para atendimento. |
| **US08** | Como secretaria, quero controlar prazos e pendências. | **Alta** | Prazos e pendências identificáveis. |
| **US09** | Como instituição, quero manter comunicação com o usuário. | **Média** | Mensagens vinculadas à solicitação. |
| **US10** | Como gestor, quero visualizar indicadores de atendimento. | **Baixa** | Relatórios básicos disponíveis. |

---

### 4.2 Detalhamento Ágil das Histórias de Usuário (Critérios Gherkin & BDD)

#### 🔹 US01: Cadastro de Conta de Usuário
- **Como:** Aluno universitário
- **Quero:** Criar uma conta informando meus dados acadêmicos (Nome, E-mail institucional, CPF, RA, Curso)
- **Para que:** Eu possa acessar os serviços do sistema digital de atendimento.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Cadastro bem-sucedido com dados válidos
    Dado que estou no formulário de criação de conta
    Quando preencho todos os campos obrigatórios com formato correto
    E confirmo o envio do cadastro
    Então o sistema deve criar a conta e permitir meu login imediato.
  ```

#### 🔹 US02: Autenticação de Usuário (Login)
- **Como:** Usuário cadastrado (Aluno, Professor, Secretaria, Gestor)
- **Quero:** Realizar login informando e-mail/CPF e senha
- **Para que:** Eu acesse minhas solicitações e ferramentas autorizadas com segurança.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Autenticação com credenciais válidas
    Dado que informo credenciais corretas cadastradas
    Quando clico em "Entrar"
    Então sou direcionado ao ambiente correspondente ao meu perfil de acesso.
  ```

#### 🔹 US03: Abertura de Solicitação Acadêmica
- **Como:** Aluno
- **Quero:** Registrar uma nova demanda acadêmica escolhendo o tipo de serviço, informando descrição e anexando arquivos
- **Para que:** A secretaria receba meu pedido e inicie a tramitação com protocolo oficial.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Abertura de solicitação com geração de protocolo
    Dado que preenchi o formulário de solicitação com tipo e descrição válidos
    Quando submeto o requerimento
    Então o sistema deve gerar um número de protocolo único no formato "SDASA-2026-XXXX"
    E registrar o prazo estimado (SLA) de atendimento.
  ```

#### 🔹 US04: Acompanhamento de Status
- **Como:** Aluno
- **Quero:** Acompanhar a situação corrente da minha solicitação em tempo real
- **Para que:** Eu saiba a fase exata de tramitação sem necessidade de comparecimento presencial.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Exibição clara de status
    Dado que possuo solicitações ativas
    Quando acesso o painel principal
    Então vejo o status atualizado de cada demanda com badges visuais distintas.
  ```

#### 🔹 US05: Consulta de Histórico
- **Como:** Aluno
- **Quero:** Consultar todas as solicitações anteriores já finalizadas ou canceladas
- **Para que:** Eu mantenha controle comprobatório dos documentos e pedidos que já protocolei.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Acesso ao histórico completo
    Dado que solicito a exibição de solicitações anteriores
    Quando filtro por demandas concluídas
    Então visualizo a data de emissão, histórico de tramitação e parecer oficial.
  ```

#### 🔹 US06: Notificações de Alteração
- **Como:** Usuário
- **Quero:** Receber avisos no sistema sempre que houver atualização em uma solicitação
- **Para que:** Eu seja informado proativamente de deferimentos, pendências ou conclusões.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Notificação de atualização
    Dado que a secretaria despachou uma solicitação minha
    Quando o status muda para "Em Tramitação" ou "Concluído"
    Então recebo um alerta no sino de notificações com os detalhes da mudança.
  ```

#### 🔹 US07: Gestão e Administração de Solicitações
- **Como:** Secretaria acadêmica
- **Quero:** Visualizar, filtrar, analisar e despachar as demandas protocoladas
- **Para que:** O setor mantenha a organização e o fluxo ordenado de atendimento escolar.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Despacho administrativo
    Dado que estou logado com o perfil Secretaria
    Quando analiso uma demanda e emito o parecer com alteração de status
    Então a solicitação é atualizada e a resposta fica registrada na timeline.
  ```

#### 🔹 US08: Controle de Prazos e Pendências
- **Como:** Secretaria acadêmica
- **Quero:** Identificar solicitações com prazos de SLA próximos do vencimento ou pendências de documentos
- **Para que:** O atendimento ocorra dentro dos prazos regulamentares sem atrasos.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Identificação de prazos críticos
    Dado que existem solicitações na fila da secretaria
    Quando acesso o painel de controle
    Então o sistema destaca visualmente os prazos limites e alertas de pendência.
  ```

#### 🔹 US09: Comunicação Vinculada à Solicitação
- **Como:** Instituição (Secretaria / Docentes) e Usuário (Aluno)
- **Quero:** Trocar mensagens e esclarecimentos diretamente vinculados ao protocolo da solicitação
- **Para que:** Todo o diálogo permaneça registrado no histórico formal do processo acadêmico.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Envio de mensagem na solicitação
    Dado que abro os detalhes de uma solicitação com dúvidas ou orientações
    Quando envio uma mensagem no canal da solicitação
    Então o texto é associado ao protocolo e visível para as partes autorizadas.
  ```

#### 🔹 US10: Indicadores e Relatórios Gerenciais
- **Como:** Gestor acadêmico
- **Quero:** Visualizar indicadores de atendimento, volume de demandas e taxa de cumprimento de prazos
- **Para que:** A gestão acompanhe a eficiência dos processos e tome decisões estratégicas.
- **Critérios de Aceitação (Gherkin):**
  ```gherkin
  Cenário: Visualização de relatórios básicos
    Dado que estou autenticado como Gestor
    Quando acesso o painel gerencial
    Então visualizo as métricas consolidadas de SLA, solicitações por tipo e tempo médio.
  ```

---

### 4.3 Definições Formais de Governança Ágil (DoR e DoD)

#### 📝 Definition of Ready (DoR) — Quando uma história pode entrar na Sprint:
1. A User Story possui o formato padrão (*Como / Quero / Para que*).
2. Os Critérios de Aceitação estão redigidos em formato Gherkin e foram aprovados pela PO (Prof.ª Erika Miranda).
3. As dependências técnicas foram validadas pelo Arquiteto de Software (Maria Luiza Dias Silva Tavares).
4. O alinhamento de negócio e indicadores foi validado pela Analista de Negócios (Ana Beatriz Cruz da Silva).
5. A estimativa em Story Points e facilitação foi organizada pelo Scrum Master (Donald Cintado Cabezas).
6. O impacto em segurança da informação e privacidade (LGPD) foi avaliado pela Security Officer (Stephanny Crepalde Costa).

#### ✅ Definition of Done (DoD) — Quando uma história pode ser considerada pronta:
1. O código foi desenvolvido pelo time de Dev/DevOps (Allan Vinícius Cabeggi Alvarenga) e atende a 100% dos critérios.
2. Não há erros no console do navegador nem falhas de sintaxe/lint estático.
3. Testes unitários automatizados foram implementados e validados pelo Analista de QA (Júlio César Benício Inácio) com 100% de sucesso (`npm test`).
4. O código foi revisado por pelo menos um colega via Pull Request (Peer Review).
5. O pipeline de CI/CD foi executado no GitHub Actions com status **Success (Verde)**.
6. A funcionalidade foi validada no ambiente de homologação (`develop`) ou demonstrada à PO.

---
