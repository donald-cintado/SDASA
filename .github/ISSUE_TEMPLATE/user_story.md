---
name: "📖 História de Usuário (User Story)"
description: "Propor uma nova funcionalidade no backlog orientada ao usuário (Aluno, Secretaria, Docente)"
title: "[HISTÓRIA]: "
labels: ["user-story", "backlog"]
assignees: ""
---

### 👤 Persona & Necessidade
- **Como** [aluno(a) | analista da secretaria | professor(a) | coordenador(a)]
- **Quero** [descrever a ação ou funcionalidade desejada de forma clara]
- **Para que** [descrever o valor de negócio, benefício ou problema resolvido]

---

### 📋 Critérios de Aceitação (Gherkin: Dado-Quando-Então)
```gherkin
Cenário 1: [Nome do Cenário Principal]
  Dado que estou autenticado como [perfil]
  E [pré-condição necessária]
  Quando [ação executada pelo usuário]
  Então [resultado esperado pelo sistema]
  E [efeito colateral, e.g., disparo de notificação, protocolo gerado]

Cenário 2: [Tratamento de Exceção ou Validação]
  Dado que [condição com erro ou dado inválido]
  Quando tentar submeter
  Então o sistema deve exibir a mensagem de aviso "[mensagem]"
```

---

### 🎯 Priorização & Estimativa
- **Épico Relacionado:** [Ex: Épico 02 - Catálogo e Solicitações]
- **Prioridade (MoSCoW):** [ ] Must Have | [ ] Should Have | [ ] Could Have | [ ] Won't Have
- **Story Points (Fibonacci):** [1, 2, 3, 5, 8, 13]
- **Responsável / Papel:** [Dev / QA / Security]

---

### ✅ Checklist DoR (Definition of Ready)
- [ ] User Story escrita no formato padrão e compreensível por todos da equipe.
- [ ] Critérios de aceitação definidos e aprovados pelo PO (Prof.ª Erika Miranda).
- [ ] Dependências técnicas e arquiteturais mapeadas (Stephanny Crepalde).
- [ ] Requisitos de segurança e LGPD validados (Maria Luiza).
- [ ] Estimativa em Story Points realizada na Planning (Ana Beatriz).
