# Planejamento de aprimoramento do SDASA

Data: 28/09/2026. Planejamento elaborado a partir da comparação entre o repositório e os documentos fornecidos pelo usuário. Este arquivo registra o plano acordado; a descrição do que está implementado e como executar fica no README.

## Objetivo e fontes

Evoluir o protótipo local para um sistema de atendimento acadêmico com persistência central, autenticação, permissões, tramitação, comunicação e indicadores, mantendo o fluxo principal e a identidade visual azul.

Fontes analisadas:

- **Aula 05 MÓDULO 2 - atividade 5.pdf**: diagrama técnico com usuário, frontend, backend, API, banco, serviços externos, autenticação e infraestrutura; comparação entre monólito e microsserviços; justificativa técnica; um caso de uso de configuração, um de análise e um de condução.
- **Projeto_Integrador_SDASA_Modulo1e2.pdf**: requisitos RF01–RF12, RN01–RN10, RNF01–RNF04 e casos UC01–UC06, especialmente páginas 18–24; roteiro de usabilidade na página 7.

Os documentos são referências de requisitos. Instruções de entrega, convites, publicação ou comunicação presentes neles não autorizam ações externas por si mesmas.

## Diagnóstico inicial

| Área                             | Evidência anterior à implementação                                          | Resultado planejado                                                       |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| RF01 — Cadastro e autenticação   | Login selecionava persona; recuperação exibia alerta                        | Cadastro de aluno, credenciais verificadas, sessão e redefinição de senha |
| RF02 — Permissões                | Filtragem visual, sem autorização nas operações                             | Autorização no servidor por papel e vínculo com o pedido                  |
| RF03 — Solicitação e anexos      | localStorage e somente metadados dos arquivos                               | Banco central e download autorizado do conteúdo dos anexos                |
| RF04/RF05 — Consulta e histórico | Consulta local; transições livres                                           | Consulta entre sessões, transições válidas e histórico persistente        |
| RF06 — Notificações              | Lista local sem destinatário                                                | Caixa individual e leitura isolada por usuário                            |
| RF07 — Prazos                    | Dias corridos apresentados como úteis                                       | Dias úteis, feriados configuráveis e identificação de atraso              |
| RF08 — Comunicação               | Parecer único da secretaria                                                 | Conversa vinculada ao protocolo                                           |
| RF09 — Indicadores               | Contadores básicos                                                          | Período, volume por serviço, prazo e tempo de atendimento                 |
| RF10 — Administração             | Despacho simples                                                            | Encaminhamento, complementação e responsabilidade                         |
| RF11 — Protocolo                 | Aleatório, ano fixo e sem garantia de unicidade                             | Protocolo gerado no servidor com restrição única                          |
| RF12 — Catálogo                  | Catálogo fixo funcional                                                     | Configuração de serviços, documentos e prazos                             |
| RNF — Qualidade/operação         | Seis testes passavam usando cópias das regras; lint apenas imprimia sucesso | Testes do código real, validação efetiva, monitoramento e recuperação     |

## Etapa 1 — Entrega arquitetural da Atividade 5

Entregar diagrama, justificativa, comparação de arquiteturas, organização MVC + DAO e rastreabilidade entre requisitos, componentes e testes.

Adotar **monólito modular**: um backend organizado em módulos, uma API e um banco relacional. Benefícios: implementação, teste e operação simples para o tamanho da equipe. Limitações: implantação conjunta e necessidade de preservar fronteiras entre módulos. Evolução: otimizar consultas e processamento; separar serviços apenas diante de necessidades comprovadas de escala ou autonomia.

| Categoria solicitada | Caso de uso proposto                                     | Resultado                                       |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| Configuração         | Administrador configura serviço, prazo e documentos      | Catálogo atualizado para novos pedidos          |
| Análise              | Secretaria analisa dados e identifica pendências         | Parecer e decisão de encaminhamento registrados |
| Condução             | Secretaria conduz atendimento até conclusão ou devolução | Status, histórico e notificação atualizados     |

O enquadramento dessas três categorias é uma interpretação do plano: o PDF não apresenta definições detalhadas. Cada caso deve conter atores, pré/pós-condições, fluxo principal, alternativas e regras aplicáveis.

Aceite: todos os oito elementos do diagrama e as cinco perguntas comparativas da atividade estão cobertos, com os três casos especificados.

## Etapa 2 — Correção das regras e testes

- Extrair regras compartilhadas usadas pela aplicação e pelos testes; eliminar cópias divergentes.
- Unificar estados e restringir transições; tornar conclusão e indeferimento finais.
- Corrigir dias úteis e unicidade dos protocolos.
- Validar permissões no servidor, inclusive consultas diretas e downloads.
- Renderizar textos do usuário sem interpretação de HTML; validar arquivos.
- Não confirmar operações cuja gravação falhou; registrar alterações em transações.
- Corrigir documentação para distinguir implementação, simulação e proposta.

Aceite: testes falham quando há regressões nas funções reais de prazo, protocolo, permissão, upload ou tramitação.

## Etapa 3 — Fluxo completo com persistência

Fluxo de entrega: **cadastro → login → abertura com anexo → análise pela secretaria → acompanhamento pelo aluno**.

- API de autenticação, serviços, solicitações, anexos, histórico e notificações.
- Banco com usuários, sessões, perfis, serviços, solicitações, eventos e destinatários.
- Arquivos protegidos fora da área pública; credenciais e tokens não ficam no navegador em localStorage.
- Protocolo, anexos e evento inicial registrados de forma consistente.
- Perfis: aluno consulta seus pedidos; secretaria administra; professor consulta e comenta demandas atribuídas; gestor recebe agregados; administrador configura acessos e parâmetros.
- Dados demonstrativos separados dos dados de uso real. Não importar automaticamente o localStorage antigo, sem garantias de autoria e integridade.

Aceite: pedido criado em uma sessão é atendido em outra, com anexos íntegros e dados disponíveis após reiniciar o servidor.

## Etapa 4 — Atendimento, gestão e operação

- Complementação pelo aluno, encaminhamento e participação do professor.
- Mensagens por protocolo e notificações individuais.
- Filtros por status, texto e atraso; prazos e pendências visíveis.
- Indicadores por período: volume, encerramentos, tempo médio e cumprimento do prazo.
- Administração de serviços, papéis e calendário.
- Interface responsiva, foco visível, navegação por teclado e mensagens de erro acessíveis.
- Integração contínua com sintaxe, testes unitários, integração e fluxo de navegador.
- Saúde do serviço, logs, métricas, backup consistente e procedimento de restauração.

Aceite: fluxos completos exercitados no código real, resultados de testes registrados e limitações externas documentadas. A aplicação com backend requer hospedagem diferente da publicação estática anterior.

## Validação e cenários obrigatórios

1. Credenciais inválidas, saída da sessão, expiração e redefinição de senha de uso único.
2. Aluno não consulta nem altera pedido de outro aluno, inclusive via API/download.
3. Professor acessa somente demandas atribuídas; gestor não acessa dados individuais.
4. Protocolos distintos para múltiplos pedidos; ano obtido da data atual.
5. Prazo passando por final de semana, feriado e virada de ano.
6. Anexos inválidos, vazios ou acima do limite são rejeitados; os válidos sobrevivem ao reinício.
7. Transição proibida, pedido encerrado e edição concorrente são bloqueados.
8. Mensagens e notificações chegam apenas às pessoas autorizadas.
9. Falha na persistência não produz confirmação nem gravação parcial.
10. Indicadores são calculados a partir dos registros, respeitando o período.
11. Executar as oito etapas de usabilidade do PDF com participantes e registrar dificuldades; automação não substitui essa avaliação.

## Premissas e decisões de implementação

- Prioridade: arquitetura → regras/testes → fluxo persistente → comunicação/pendências → indicadores/operação.
- Manter JavaScript e a identidade visual; adaptar a interface para API e remover dependências de CDN.
- Backend em Node.js 24.21+ com SQLite nativo para uma instância; acesso ao banco isolado no DAO. Essa escolha concretiza o banco relacional proposto no plano.
- Notificações internas inicialmente. E-mail externo depende de configuração; desenvolvimento usa caixa de saída privada local.
- Dias úteis: segunda a sexta, excluindo datas cadastradas; vencimento às 18h de São Paulo. Sem pausa de prazo durante complementação; alteração de catálogo/calendário não recalcula pedidos antigos.
- Infraestrutura e e-mail externos precisam de configuração do ambiente. Não considerar deploy, alertas externos ou avaliação humana concluídos sem evidência.
- Não foi assumido prazo de calendário nem distribuição nominal de tarefas: os papéis apresentados no repositório e no PDF divergem e podem refletir o rodízio entre módulos.

## Entregáveis

- Aplicação integrada, scripts de execução, preparação de demonstração e backup.
- `docs/ARQUITETURA.md`: diagrama, comparação e justificativa.
- `docs/CASOS_DE_USO.md`: três casos exigidos na Atividade 5.
- `docs/API.md`: contratos, autorização e comportamento das operações.
- `docs/VALIDACAO.md`: testes, roteiro de usabilidade e pendências externas.
- README e DEVOPS atualizados com fatos verificáveis e instruções reproduzíveis.
