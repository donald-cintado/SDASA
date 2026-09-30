# API do SDASA

Base `/api`, mesma origem da interface. JSON UTF-8; arquivos são retornados como download. POST/PUT/PATCH exigem `Content-Type: application/json` e `Origin` idêntico a `PUBLIC_ORIGIN` (ou `http://localhost:PORT` localmente). Sessão por cookie HttpOnly; não usar tokens em localStorage.

## Autenticação

| Método e caminho      | Entrada                             | Resultado                                                  |
| --------------------- | ----------------------------------- | ---------------------------------------------------------- |
| POST `/auth/register` | `{name,email,password,ra?,course?}` | 201; cria aluno, nunca aceita papel do cliente             |
| POST `/auth/login`    | `{email,password}`                  | `{user}` e cookie de sessão                                |
| POST `/auth/logout`   | `{}`                                | Revoga a sessão atual e limpa cookie                       |
| POST `/auth/forgot`   | `{email}`                           | Mensagem genérica, sem confirmar existência                |
| POST `/auth/reset`    | `{token,password}`                  | Consome token e revoga sessões                             |
| GET `/me`             | —                                   | Usuário público: id, email, name, role, ra, course, active |

Senha de 12–128 caracteres; tokens de redefinição de uso único com validade de 30 minutos; sessão de oito horas. `email` é o identificador de login desta implementação. CPF não é coletado. RA e curso são campos informativos fornecidos no cadastro, não uma integração com o registro institucional.

## Atendimento

| Método e caminho                             | Entrada / resposta                                                                      | Autorização                                         |
| -------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| GET `/services`                              | Lista de serviços ativos                                                                | Público                                             |
| GET `/requests`                              | Solicitações permitidas, sem BLOBs                                                      | Usuário autenticado                                 |
| POST `/requests`                             | `{serviceId,description,attachments?}` → pedido com protocolo                           | Aluno                                               |
| GET `/requests/:id`                          | Pedido + timeline, messages e metadados de attachments                                  | Proprietário, professor atribuído, secretaria/admin |
| POST `/requests/:id/status`                  | `{status,notes,version,attachments?}` → detalhes atualizados                            | Conforme transição e perfil                         |
| POST `/requests/:id/assignment`              | `{assigneeId: string ou null,version}`                                                  | Secretaria/admin                                    |
| POST `/requests/:id/messages`                | `{body}` → detalhes atualizados                                                         | Participante autorizado; pedido não encerrado       |
| GET `/attachments/:id`                       | Conteúdo, MIME e Content-Disposition attachment                                         | Mesma permissão do pedido                           |
| GET `/staff`                                 | `{id,name,role}[]` de professores/secretaria ativos                                     | Secretaria/admin                                    |
| GET `/notifications`                         | `{id,requestId,message,createdAt,read}[]`                                               | Somente destinatário                                |
| POST `/notifications/read`                   | `{ids: string[]}` até 500                                                               | Só altera itens do próprio usuário                  |
| GET `/reports?from=AAAA-MM-DD&to=AAAA-MM-DD` | Total, concluídos, atrasos, pendências, média de horas, % no prazo e volume por serviço | Gestor/secretaria/admin                             |

`attachments` é uma lista de `{name,type,content}`, em que `content` contém base64 sem prefixo de data URL. Limites: 5 arquivos por operação, 5 MB cada, 20 por pedido, JSON total até 36 MiB. Tipos PDF/PNG/JPEG, com assinatura inicial verificada. Os arquivos ficam em BLOB privado no banco, participando da transação; não são URLs públicas.

O servidor define id, autor, datas, status inicial e prazo. `version` é incrementada nas mudanças de status/atribuição e deve ser a versão lida pelo cliente; divergência retorna 409. Mensagens são acréscimos independentes e não alteram a versão da tramitação. Datas retornadas em ISO 8601; apresentação usa São Paulo.

O relatório usa o **período de abertura** do pedido, inclusivo em São Paulo. Tempo médio e cumprimento de prazo consideram encerrados (concluídos ou indeferidos); retornam `null` quando não há amostra. O gestor não recebe solicitações individuais.

## Administração e operação

| Método e caminho         | Contrato                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| GET `/admin/services`    | Todos os serviços, inclusive inativos                                                                           |
| POST `/admin/services`   | `{id?,title,category,description,slaDays,requiredDocs,attachmentRequired,active}`; sem id cria, com id atualiza |
| GET `/admin/holidays`    | Lista de datas                                                                                                  |
| PUT `/admin/holidays`    | `{holidays: string[]}` substitui calendário, máximo de 366 datas                                                |
| GET `/admin/users`       | Usuários sem hashes/tokens                                                                                      |
| PATCH `/admin/users/:id` | `{role,active}`; revoga sessões; não permite alterar o próprio acesso                                           |
| GET `/admin/audit`       | Últimas 100 alterações administrativas                                                                          |
| GET `/admin/metrics`     | Contagem, erros 5xx, latência média, início do processo, memória e tamanho do banco                             |
| GET `/health`            | Público, `{status:"ok"}` após consulta ao banco                                                                 |

Todas as rotas `/admin/*` exigem administrador. Papéis: `student`, `secretary`, `professor`, `manager`, `admin`.

## Erros e limites

Erros JSON: `{error,requestId}`. 400 entrada inválida; 401 sessão ausente/expirada; 403 perfil, origem ou transição não autorizados; 404 inexistente ou pedido sem permissão de leitura; 409 conflito/duplicidade de cadastro; 413 envio excessivo; 415 conteúdo incompatível; 429 limite de tentativas; 500 falha interna com mensagem genérica.

Limitação local por IP: até 300 chamadas de API/minuto e 20 POSTs de autenticação/15 minutos. Contagem fica em memória e reinicia com o processo. Atrás de proxy, o endereço observado será o do proxy; dimensionar limitação no proxy antes de publicar para vários usuários. Não confiar automaticamente em X-Forwarded-For.

Recuperação em produção chama `MAIL_WEBHOOK_URL` via POST HTTPS com `{to,subject,text}` e, se definido, `Authorization: Bearer MAIL_WEBHOOK_TOKEN`; sucesso exige HTTP 2xx. Localmente, sem webhook, grava uma mensagem privada em `SDASA_DATA_DIR/outbox`. Uma falha de envio invalida o token e gera `mail.failed`, sem revelar ao solicitante se a conta existe.
