/**
 * SDASA - Sistema Digital de Atendimento e Solicitações Acadêmicas
 * Base de Dados Simulada (Mock Data)
 * Projeto Integrador - Módulo 1 (2026)
 */

const INITIAL_USERS = [
  {
    id: "user_mariana",
    name: "Mariana Oliveira",
    role: "student",
    roleLabel: "Aluno(a)",
    email: "mariana.oliveira@faculdade.edu.br",
    cpf: "123.456.789-00",
    ra: "2024108842",
    course: "Análise e Desenvolvimento de Sistemas",
    semester: "4º Semestre - Noturno",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "user_secretaria",
    name: "Carlos Eduardo Santos",
    role: "secretary",
    roleLabel: "Secretaria Acadêmica",
    email: "secretaria@faculdade.edu.br",
    cpf: "987.654.321-11",
    ra: "SEC-9041",
    course: "Atendimento e Registros Escolares",
    semester: "Central de Atendimento",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "user_professor",
    name: "Prof.ª Erika Miranda",
    role: "professor",
    roleLabel: "Docente / Coordenação",
    email: "erika.miranda@faculdade.edu.br",
    cpf: "456.789.123-22",
    ra: "DOC-2026",
    course: "Tópicos Avançados em Sistemas de Informação II",
    semester: "Corpo Docente",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  }
];

const SERVICE_TYPES = [
  {
    id: "decl_matricula",
    category: "Documentos",
    title: "Declaração de Matrícula",
    slaDays: 1,
    description: "Comprovante oficial de vínculo e matrícula ativa no semestre letivo.",
    requiredDocs: "Nenhum documento adicional obrigatório.",
    icon: "file-text",
    badge: "Mais Solicitado"
  },
  {
    id: "hist_escolar",
    category: "Documentos",
    title: "Histórico Escolar Parcial / Oficial",
    slaDays: 3,
    description: "Relação de disciplinas cursadas, notas, frequência e coeficientes de rendimento.",
    requiredDocs: "Documento com foto caso seja versão autenticada.",
    icon: "award",
    badge: null
  },
  {
    id: "just_falta",
    category: "Frequência e Avaliações",
    title: "Justificativa de Faltas / Atestado Médico",
    slaDays: 2,
    description: "Apresentação de atestado médico legal ou declaração de trabalho para abono/exercícios domiciliares.",
    requiredDocs: "Atestado com CID e carimbo CRM ou declaração assinada.",
    icon: "calendar-check",
    badge: "Prioridade"
  },
  {
    id: "rev_prova",
    category: "Frequência e Avaliações",
    title: "Revisão de Prova / Nota de Avaliação",
    slaDays: 5,
    description: "Pedido formal de reavaliação de nota ou questão de avaliação bimestral/semestral.",
    requiredDocs: "Cópia da avaliação ou enunciado com a argumentação técnica.",
    icon: "clipboard-edit",
    badge: null
  },
  {
    id: "trancamento",
    category: "Vida Acadêmica",
    title: "Trancamento de Matrícula / Disciplina",
    slaDays: 4,
    description: "Suspensão temporária dos estudos ou cancelamento de matrícula em componente curricular específico.",
    requiredDocs: "Nada consta da biblioteca e formulário de ciência de prazos.",
    icon: "pause-circle",
    badge: null
  },
  {
    id: "aprov_estudos",
    category: "Vida Acadêmica",
    title: "Aproveitamento de Estudos / Equivalência",
    slaDays: 7,
    description: "Dispensa de disciplinas com base em cursos anteriores de nível superior.",
    requiredDocs: "Ementas oficiais autenticadas e histórico escolar da instituição de origem.",
    icon: "book-open",
    badge: null
  },
  {
    id: "carteirinha",
    category: "Geral",
    title: "2ª Via de Carteirinha Estudantil / Passe",
    slaDays: 3,
    description: "Emissão de novo cartão de acesso ao campus ou declaração para transporte público estudantil (SPTrans/EMTU).",
    requiredDocs: "Comprovante de pagamento de taxa e foto 3x4 recente.",
    icon: "id-card",
    badge: null
  }
];

const INITIAL_REQUESTS = [
  {
    id: "SDASA-2026-0812",
    userId: "user_mariana",
    userName: "Mariana Oliveira",
    userRa: "2024108842",
    course: "Análise e Desenvolvimento de Sistemas",
    serviceId: "decl_matricula",
    serviceTitle: "Declaração de Matrícula",
    category: "Documentos",
    createdAt: "2026-08-28T09:30:00",
    estimatedDate: "2026-08-29T18:00:00",
    status: "concluded", // pending, in_progress, concluded, rejected
    urgency: "Normal",
    description: "Necessito da declaração com previsão de formatura e grade horária atualizada para apresentação no estágio de TI.",
    attachments: [
      { name: "Declaracao_RH_Empresa.pdf", size: "340 KB" }
    ],
    timeline: [
      {
        date: "28/08/2026 às 09:30",
        title: "Solicitação Aberta",
        description: "Demanda registrada com sucesso pelo portal do aluno.",
        actor: "Mariana Oliveira (Aluno)"
      },
      {
        date: "28/08/2026 às 14:10",
        title: "Em Análise pela Secretaria",
        description: "Documentação verificada e encaminhada para emissão digital.",
        actor: "Carlos Eduardo (Secretaria)"
      },
      {
        date: "29/08/2026 às 11:20",
        title: "Concluído com Sucesso",
        description: "Declaração emitida digitalmente com código autenticador de validação.",
        actor: "Secretaria Acadêmica",
        downloadUrl: "#comprovante"
      }
    ],
    responseNotes: "Declaração emitida com assinatura digital ICP-Brasil. Válida por 90 dias."
  },
  {
    id: "SDASA-2026-0845",
    userId: "user_mariana",
    userName: "Mariana Oliveira",
    userRa: "2024108842",
    course: "Análise e Desenvolvimento de Sistemas",
    serviceId: "just_falta",
    serviceTitle: "Justificativa de Faltas / Atestado Médico",
    category: "Frequência e Avaliações",
    createdAt: "2026-08-30T14:15:00",
    estimatedDate: "2026-09-02T18:00:00",
    status: "in_progress",
    urgency: "Alta",
    description: "Apresentação de atestado médico referente aos dias 28 e 29 de agosto, devido a procedimento cirúrgico odontológico de urgência.",
    attachments: [
      { name: "Atestado_Medico_Dr_Lucas.pdf", size: "1.2 MB" }
    ],
    timeline: [
      {
        date: "30/08/2026 às 14:15",
        title: "Solicitação Aberta",
        description: "Atestado enviado pelo portal do aluno.",
        actor: "Mariana Oliveira (Aluno)"
      },
      {
        date: "31/08/2026 às 10:00",
        title: "Em Tramitação",
        description: "Atestado conferido pela secretaria e notificado aos professores das disciplinas do dia.",
        actor: "Carlos Eduardo (Secretaria)"
      }
    ],
    responseNotes: "Em análise pelo corpo docente para registro do abono."
  },
  {
    id: "SDASA-2026-0870",
    userId: "user_mariana",
    userName: "Mariana Oliveira",
    userRa: "2024108842",
    course: "Análise e Desenvolvimento de Sistemas",
    serviceId: "carteirinha",
    serviceTitle: "2ª Via de Carteirinha Estudantil / Passe",
    category: "Geral",
    createdAt: "2026-09-01T08:20:00",
    estimatedDate: "2026-09-04T18:00:00",
    status: "pending",
    urgency: "Normal",
    description: "Perdi meu cartão de acesso às catracas e necessito da 2ª via física e liberação provisória no app.",
    attachments: [
      { name: "Comprovante_Pagamento_Taxa.png", size: "850 KB" }
    ],
    timeline: [
      {
        date: "01/09/2026 às 08:20",
        title: "Solicitação Registrada",
        description: "Aguardando confirmação de compensação bancária e triagem.",
        actor: "Sistema SDASA"
      }
    ],
    responseNotes: "Aguardando triagem na fila de atendimento da Secretaria."
  },
  {
    id: "SDASA-2026-0862",
    userId: "user_pedro",
    userName: "Pedro Henrique Alves",
    userRa: "2023201455",
    course: "Ciência da Computação",
    serviceId: "rev_prova",
    serviceTitle: "Revisão de Prova / Nota de Avaliação",
    category: "Frequência e Avaliações",
    createdAt: "2026-08-31T16:40:00",
    estimatedDate: "2026-09-05T18:00:00",
    status: "pending",
    urgency: "Normal",
    description: "Solicito revisão da questão 3 da P1 de Estrutura de Dados.",
    attachments: [
      { name: "Foto_Resolucao_P1.jpg", size: "2.1 MB" }
    ],
    timeline: [
      {
        date: "31/08/2026 às 16:40",
        title: "Solicitação Aberta",
        description: "Encaminhada para parecer do professor responsável.",
        actor: "Pedro Henrique Alves"
      }
    ],
    responseNotes: "Aguardando parecer do docente."
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif_1",
    title: "Declaração Concluída",
    message: "Sua solicitação #SDASA-2026-0812 (Declaração de Matrícula) foi deferida e o documento está disponível.",
    time: "Ontem às 11:20",
    read: false,
    requestId: "SDASA-2026-0812",
    type: "success"
  },
  {
    id: "notif_2",
    title: "Status Atualizado",
    message: "Sua solicitação #SDASA-2026-0845 (Justificativa de Faltas) mudou para 'Em Tramitação'.",
    time: "Hoje às 10:00",
    read: false,
    requestId: "SDASA-2026-0845",
    type: "info"
  },
  {
    id: "notif_3",
    title: "Período de Rematrícula 2026/2",
    message: "O período de solicitação de ajuste de grade e rematrícula online começará em 15/10.",
    time: "2 dias atrás",
    read: true,
    requestId: null,
    type: "announcement"
  }
];
