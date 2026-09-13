# SDASA — Sistema Digital de Atendimento e Solicitações Acadêmicas

**Projeto Integrador — Módulo 1: Da Ideia ao Produto (2026)**  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Disciplina:** Tópicos Avançados em Sistemas de Informação II  
**Orientação:** Prof.ª Erika Miranda

---

## 📖 Sobre o Projeto

O **SDASA** é uma solução digital concebida para centralizar, desburocratizar e agilizar o fluxo de solicitações acadêmicas entre estudantes, docentes e secretaria da instituição de ensino. O sistema substitui atendimentos presenciais fragmentados e múltiplos canais dispersos por uma plataforma unificada com acompanhamento em tempo real, controle de prazos (SLA) e transparência de status.

---

## 🖥️ Telas do Protótipo (Mapeamento Conforme Seção 5.4)

| Nº | Tela | Elementos Principais | Objetivo |
|:---:|:---|:---|:---|
| **1** | **Tela Inicial** | Logo institucional, apresentação da plataforma, benefícios, botões "Entrar" e "Criar Conta". | Apresentar a plataforma aos usuários. |
| **2** | **Login** | E-mail/CPF, senha, botão "Entrar", "Esqueci minha senha", atalhos de perfil (Aluno, Secretaria, Professor). | Permitir a autenticação segura do usuário. |
| **3** | **Tela Principal (Dashboard)** | Menu superior/lateral, resumo de métricas por status, botão em destaque **"Nova Solicitação"**, tabela de histórico e central de notificações. | Centralizar as informações e solicitações ativas. |
| **4** | **Nova Solicitação** | Catálogo de tipos de atendimento (Declaração, Histórico, Justificativa, etc.), campo de descrição detalhada, upload de anexos e botão de envio. | Registrar uma nova demanda acadêmica. |
| **5** | **Resultado / Confirmação** | Número de protocolo oficial gerado dinamicamente (`#SDASA-2026-XXXX`), data/hora, status inicial, prazo estimado, botão para acompanhar e imprimir comprovante. | Confirmar envio e permitir acompanhamento formal. |

---

## 🧪 Roteiro de Teste de Usabilidade (Seção 5.5)

O protótipo conta com um **Widget Flutuante de Guia de Teste** no canto inferior direito que acompanha e valida interativamente cada passo da avaliação:

1. **Acessar a tela inicial** — Apresentação da proposta de valor e serviços disponíveis.
2. **Realizar o login** — Autenticação com a persona principal (**Mariana Oliveira**).
3. **Localizar "Nova Solicitação"** — Clique no botão de destaque no painel principal.
4. **Selecionar o tipo de atendimento** — Escolha entre os 7 serviços acadêmicos parametrizados.
5. **Preencher a descrição** — Detalhamento do pedido e anexos opcionais.
6. **Enviar a solicitação** — Submissão do formulário com validação de dados.
7. **Identificar o protocolo gerado** — Visualização do código único de rastreamento e prazo estimado.
8. **Verificar o status** — Acompanhamento no painel, linha do tempo detalhada e recebimento de notificações.

---

## 👥 Perfis Simulados para Apresentação

- 🎓 **Mariana Oliveira (Aluno / Persona Principal):** Estudante de ADS (4º Semestre), com dores de deslocamento e falta de previsibilidade de prazos.
- 🏛️ **Carlos Eduardo Santos (Secretaria Acadêmica):** Permite testar a visão administrativa de triagem, despacho de solicitações, alteração de status e emissão de pareceres oficiais.
- 👩‍🏫 **Prof.ª Erika Miranda (Corpo Docente):** Visão de coordenação e pareceres acadêmicos.

---

## 🚀 Como Executar o Protótipo

Não é necessária nenhuma instalação de dependências ou servidores complexos:

1. Abra o arquivo **`index.html`** diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
2. Para executar via servidor local rápido (opcional):
   ```bash
   # Com Python 3
   python -m http.server 8080
   
   # Ou com Node.js (npx)
   npx serve .
   ```
3. Acesse `http://localhost:8080` no navegador.

---

## 📂 Estrutura de Arquivos

```
SDASA/
├── index.html        # Estrutura completa das 5 telas, modais e componentes
├── css/
│   └── style.css     # Estilos complementares, animações, badges e regras de impressão
├── js/
│   ├── mock-data.js  # Base de dados simulada (usuários, catálogo de serviços e histórico)
│   └── app.js        # Lógica de controle, roteamento de telas, persistência e testes
└── README.md         # Documentação e manual de uso do protótipo
```

---

## 🛠️ Engenharia de Software & DevOps (Atividade 4)

Este projeto adota práticas avançadas de **DevOps** para transformar o protótipo em um produto digital entregue continuamente com estabilidade e previsibilidade.

Para a documentação completa dos 8 pilares avaliados na **Atividade 4**, acesse o documento mestre:
👉 **[DEVOPS.md](DEVOPS.md)**

### Resumo da Esteira DevOps Implementada:
- **Repositório Git & Branches:** Modelo baseado em Gitflow/GitHub Flow com branches `main` (produção protegida) e `develop` (homologação contínua).
- **Estratégia de Commits:** Padrão rigoroso **Conventional Commits 1.0.0** (`feat:`, `fix:`, `docs:`, `test:`, `ci:`).
- **Backlog Inicial:** 4 Épicos e 8 User Stories detalhadas no formato padrão ágil com critérios de aceitação em Gherkin e estimativas em Story Points.
- **Processo de Testes:** Suíte de testes unitários automatizados com Node.js nativo cobrindo regras de negócio críticas (SLA, protocolos e RBAC).
- **CI/CD Pipeline:** Workflow automatizado no GitHub Actions (`.github/workflows/ci-cd.yml`) com validação de sintaxe, bateria de testes, auditoria de segurança e deploy contínuo no GitHub Pages.
- **Monitoramento & Observabilidade:** Aplicação dos 4 Sinais Dourados (SRE), rastreamento de erros com Sentry e métricas de SLA.

### 🧪 Executando os Testes Automatizados Localmente:
```bash
npm test
```

---

## 👥 Equipe do Projeto Integrador (Módulo 1)

- **Prof.ª Erika Miranda** — *Product Owner / Docente Orientadora* (`eefmiranda@gmail.com`)
- **Ana Beatriz Cruz da Silva** — *Scrum Master*
- **Donald Cintado Cabezas** — *Analista de Negócios*
- **Stephanny Crepalde Costa** — *Arquiteto de Software*
- **Júlio César Benício Inácio** — *Dev / DevOps*
- **Maria Luiza Dias Silva Tavares** — *Security Officer*
- **Allan Vinícius Cabeggi Alvarenga** — *Analista de Qualidade e Sustentabilidade*
