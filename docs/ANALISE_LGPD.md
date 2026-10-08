# Atividade 7 — Análise de proteção de dados pessoais

## Escopo e premissas

Análise acadêmica do SDASA baseada nos dados persistidos em [database.js](../server/database.js), nos fluxos de [app.js](../server/app.js) e [service.js](../server/service.js) e nos contratos de [API.md](API.md). Responde às seis perguntas do exercício e orienta medidas futuras. Não declara conformidade integral nem substitui a definição institucional das finalidades e prazos.

Na operação real, considera-se como controladora a instituição que decidir as finalidades do atendimento. Hospedagem e entrega de e-mail poderão atuar como operadores conforme contratação e instruções. A instituição deve identificar os responsáveis, publicar o canal do encarregado e documentar os compartilhamentos; não há designação ou fornecedor de produção comprovado neste repositório.

## 1. Quais dados pessoais serão armazenados?

| Categoria               | Dados e local de armazenamento                                                                                                              | Finalidade                                                                                                                   |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Cadastro                | Nome, e-mail, RA e curso opcionais, identificador interno, perfil e situação ativa em `users`.                                              | Identificar a pessoa e aplicar suas permissões no atendimento.                                                               |
| Autenticação            | Hash de senha com salt em `users`; hashes de tokens, vínculo à conta e expiração em `sessions` e `resets`.                                  | Autenticar e recuperar acesso. Senha em texto puro não é persistida.                                                         |
| Solicitações            | Protocolo, vínculo ao aluno e responsável, descrição, serviço, status, datas, prazo e cópias de dados do solicitante no JSON de `requests`. | Processar o pedido e comprovar sua tramitação.                                                                               |
| Comunicação e histórico | Mensagens, autor, datas, eventos e notificações em `messages`, `events` e `notifications`.                                                  | Orientar o atendimento e manter rastreabilidade.                                                                             |
| Documentos              | Nome, tipo, tamanho e conteúdo dos anexos em `attachments`, vinculados ao pedido.                                                           | Comprovar apenas o necessário ao serviço solicitado.                                                                         |
| Auditoria               | Identificador do ator, ação, alvo e data em `audit`; logs HTTP com rota, resultado e identificador de correlação.                           | Investigar falhas e alterações administrativas. Rotas/identificadores também exigem proteção.                                |
| Cópias e recuperação    | Snapshot SQLite com dados e anexos em `backups/`; mensagens locais de recuperação em `data/outbox` ou diretório configurado.                | Recuperar operação e testar entrega de e-mail. Outbox local contém endereço e link de recuperação e deve permanecer privada. |

Anexos e texto livre **podem conter dados sensíveis**, como um atestado de saúde, mesmo sem campos específicos. A equipe deve avaliar os documentos exigidos por serviço e restringir esse conteúdo. CPF, telefone, endereço e biometria não são campos coletados no cadastro atual; um usuário ainda pode incluí-los indevidamente em texto ou arquivo.

O IP observado na conexão participa da limitação de requisições em memória, sem campo próprio no banco atual. Logs de proxy/hospedagem podem acrescentar IP e outros metadados; devem entrar no inventário quando essa infraestrutura for definida.

## 2. Quais dados são realmente necessários?

Nome, e-mail, credencial protegida e perfil sustentam conta e acesso. O atendimento necessita de tipo de serviço, descrição suficiente, vínculo ao solicitante, protocolo, status, prazo e histórico pertinente. RA e curso só devem ser exigidos quando o serviço justificar a identificação acadêmica; atualmente são opcionais e não são validados contra cadastro institucional.

Coletar documentos somente quando exigidos pelo serviço e orientar o usuário a evitar dados de terceiros, senhas e informações sem relação com o pedido. Revisar duplicação de dados do aluno no JSON de solicitações: a cópia pode servir ao registro histórico, mas deve estar incluída nos fluxos de correção e descarte. Relatórios gerenciais devem permanecer agregados; evitar filtros que permitam identificar uma pessoa em grupos muito pequenos.

A instituição deve registrar finalidade e base legal por operação. Execução de contrato e obrigação legal podem ser hipóteses para atendimento; dados sensíveis exigem análise própria. Consentimento não deve ser escolhido automaticamente. Aplicam-se os princípios de finalidade e necessidade e as hipóteses dos arts. 6º, 7º e 11 da [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

## 3. Quem poderá acessar esses dados?

| Perfil / responsável        | Acesso atual ou regra proposta                                                                                                                                                                              |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aluno                       | Próprios pedidos, mensagens, anexos e notificações. Não acessa solicitações de outros alunos.                                                                                                               |
| Professor                   | Pedidos atribuídos a ele e respectivas mensagens/anexos. Não altera o atendimento administrativo.                                                                                                           |
| Secretaria                  | Pedidos e documentos para processar atendimento; atribuição e atualização de status; indicadores. A versão atual permite consulta ampla à secretaria, sem segmentação por departamento.                     |
| Gestor                      | Indicadores agregados. Não recebe detalhes individuais de solicitações.                                                                                                                                     |
| Administrador               | Usuários, perfis, catálogo, calendário, auditoria e acesso aos pedidos. O privilégio é amplo e deve ser restrito a contas nominativas e revisado.                                                           |
| Operador técnico autorizado | Pode acessar arquivos de banco e backup conforme permissões da infraestrutura. O controle por perfil da aplicação não impede acesso direto ao arquivo SQLite. Proposta: limitar e registrar acesso técnico. |
| Segurança / encarregado     | Papel organizacional, não perfil próprio implementado. Recebe apenas dados e evidências necessários ao caso por procedimento institucional restrito.                                                        |

Serviço externo de e-mail receberá o destinatário e conteúdo necessário à recuperação, se configurado. Definir contrato, localização do processamento e eventual transferência internacional antes da contratação. Não há autorização para distribuir cópias de pedidos ou anexos por canais pessoais.

## 4. Por quanto tempo deverão ser mantidos?

**Tabela de retenção proposta para aprovação institucional.** Os prazos abaixo são escolhas iniciais de projeto, não prazos gerais impostos pela LGPD. A aplicação ainda não executa uma rotina completa de descarte. Obrigações de guarda de documentos acadêmicos e preservação por disputa/incidente precisam ser mapeadas antes de eliminar registros.

| Categoria                               | Prazo ou gatilho proposto                                                                                 | Destinação e situação atual                                                                                                                                                      |
| :-------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cadastro                                | Enquanto houver vínculo ou pedido aberto; revisar até 90 dias após o encerramento de ambos.               | Eliminar ou anonimizar dados dispensáveis, mantendo apenas os que tiverem conservação justificada. Não há exclusão automática atual.                                             |
| Pedidos, mensagens e anexos             | Proposta inicial: 24 meses após encerramento, salvo prazo institucional aplicável à categoria documental. | Validar tabela acadêmica antes de aplicar; eliminar/anonimizar de forma coordenada banco e anexos quando elegíveis. Guarda acadêmica obrigatória pode exigir prazo diferente.    |
| Notificações                            | 90 dias após leitura e encerramento do pedido, considerando o evento mais recente.                        | Excluir avisos redundantes; rotina ainda proposta.                                                                                                                               |
| Sessões                                 | Validade atual de 8 horas; invalidação antecipada por saída, troca de senha, perfil ou inativação.        | Expiração bloqueia uso; há limpeza de sessões vencidas no login. Propor limpeza diária independente de novos logins.                                                             |
| Tokens de recuperação                   | Validade atual de 30 minutos e uso único.                                                                 | Uso/expiração impede recuperação; propor limpeza diária de registros expirados remanescentes.                                                                                    |
| Outbox de desenvolvimento               | Apagar até 24 horas após teste ou expiração do link.                                                      | Usar dados sintéticos; a limpeza não está automatizada.                                                                                                                          |
| Logs operacionais e auditoria rotineira | 180 dias, com revisão da necessidade.                                                                     | Rotacionar e descartar com controle de acesso; prazo operacional proposto. Exceções de investigação devem ser justificadas.                                                      |
| Backups                                 | Cópias diárias com janela móvel proposta de 30 dias.                                                      | Descartar cópias vencidas com segurança; automatização/criptografia dependem da operação. Após restaurar, reaplicar decisões de descarte para não reintroduzir dados eliminados. |
| Registros de incidente                  | Pelo menos 5 anos, conforme norma específica citada no plano de segurança.                                | Guardar registro e evidências necessárias em ambiente restrito, separadamente dos logs de rotina.                                                                                |

O fim da finalidade exige avaliar eliminação e hipóteses legítimas de conservação, conforme arts. 15 e 16 da [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm). Documentar motivo, responsável e revisão das exceções; anonimização deve impedir reidentificação razoável, não apenas retirar o nome.

## 5. Como proteger os dados?

Aplicar os controles e ações do [plano de segurança](PLANO_DE_SEGURANCA.md): hash de senha, autorização no servidor, cookies protegidos, validação de entrada e anexos, cópias privadas, HTTPS em produção, criptografia de volume/backup, revisão de acessos e resposta ao incidente. Diferenciar implementação de configuração: criptografia em repouso, monitor externo, MFA, descarte e canal de direitos ainda precisam de trabalho específico.

O [registro de riscos](MATRIZ_DE_RISCOS.md) prioriza vazamento, senha comprometida, indisponibilidade, acesso indevido e perda. A equipe deve testar isolamento entre alunos e professores e restringir quem opera diretamente o banco. A exigência de medidas de segurança decorre do art. 46 da [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

## 6. Como o usuário poderá exercer seus direitos?

**Fluxo institucional proposto (HU18):** publicar no aviso de privacidade um formulário ou endereço institucional do encarregado, a definir pela instituição. A interface e a API atuais não oferecem módulo específico para pedidos de direitos, correção cadastral ou exclusão; não apresentar este fluxo como já disponível.

1. Titular envia pedido pelo canal publicado e recebe protocolo e orientação.
2. Responsável verifica identidade proporcionalmente ao risco, preferencialmente pelo acesso autenticado ou e-mail já cadastrado; nunca solicita senha e evita cópia de documento sem necessidade.
3. Equipe identifica dados em cadastro, pedidos, mensagens, anexos, logs e cópias, inclusive informações replicadas no JSON.
4. Encarregado coordena resposta, correção ou descarte, preservando dados de terceiros e justificando eventuais hipóteses de conservação.
5. Equipe responde pelo canal verificado e registra decisão, data e execução; se necessário, acompanha a expiração das cópias e comunica operadores envolvidos.

Os direitos incluem confirmação, acesso, correção, informações sobre compartilhamento e, nas hipóteses aplicáveis, anonimização, bloqueio, eliminação, portabilidade e revogação de consentimento. Confirmação/acesso admitem resposta simplificada imediata ou declaração completa em até 15 dias; esse prazo não deve ser generalizado automaticamente aos demais pedidos. Referência: arts. 18 e 19 da [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

## Pendências para operação real

Priorizar HU18 (canal e direitos), HU19 (retenção e descarte) e HU20 (eventos de segurança) no [backlog](BACKLOG.md). A instituição deve aprovar inventário, bases legais, responsáveis e tabela de guarda; Dev/DevOps deve configurar proteção da hospedagem e cópias; Qualidade deve registrar ensaios com dados sintéticos. A análise deve ser revisada quando surgirem novos serviços, campos, integrações ou incidente.
