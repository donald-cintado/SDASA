# SDASA — Atendimento e Solicitações Acadêmicas

Projeto Integrador de Análise e Desenvolvimento de Sistemas — Módulos 1 e 2. Evolução do protótipo para uma aplicação com frontend JavaScript, API Node.js e banco SQLite persistente.

O sistema permite cadastro/login, abertura com anexos, consulta por protocolo, triagem, encaminhamento ao professor, complementação, mensagens, notificações individuais e indicadores. O administrador configura serviços, perfis e feriados. O visual mantém a identidade azul, com recursos locais, layout responsivo e navegação por teclado.

## Executar uma demonstração

Requisito: **Node.js 24.21 ou superior**. A aplicação usa somente módulos nativos em runtime.

```bash
npm run start:demo
```

Abra **http://localhost:8080**. O comando cria um banco separado em `data/demo/sdasa.sqlite` e cinco contas de teste:

| E-mail                  | Perfil        |
| ----------------------- | ------------- |
| `aluno@sdasa.test`      | Aluno         |
| `secretaria@sdasa.test` | Secretaria    |
| `professor@sdasa.test`  | Professor     |
| `gestor@sdasa.test`     | Gestor        |
| `admin@sdasa.test`      | Administrador |

Senha inicial de todas as contas demonstrativas: **`Demonstracao!2026`**. O comando não redefine contas já existentes. Não há pedidos fictícios pré-carregados: abra um pedido como aluno e use outra sessão/janela privada para atendê-lo como secretaria. A demonstração é recusada quando `NODE_ENV=production`.

**Não abra `index.html` diretamente nem use um servidor apenas estático.** A versão atual precisa da API. Os dados antigos de localStorage não são importados; permanecem no navegador, sem interferir no banco novo.

## Executar com banco próprio

```bash
npm start
```

Por padrão, o banco fica em `data/sdasa.sqlite`; cadastro pela interface cria somente alunos. Para criar o primeiro administrador, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente e execute `npm run create-admin`. O comando recusa e-mails existentes e não modifica contas previamente criadas. Remova a variável de senha após executar.

Exemplo PowerShell com entrada de senha oculta:

```powershell
$env:ADMIN_EMAIL = Read-Host 'E-mail do administrador'
$taskAdminSecret = Read-Host 'Senha com pelo menos 12 caracteres' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $taskAdminSecret).Password
npm run create-admin
Remove-Item Env:ADMIN_PASSWORD
npm start
```

O administrador pode alterar o perfil das contas cadastradas para secretaria, professor ou gestor. Essa alteração encerra as sessões anteriores do usuário. O login usa e-mail; CPF não é coletado. RA e curso são informativos e não são verificados contra um sistema institucional.

## Fluxo de atendimento

1. Aluno cria conta, entra, escolhe serviço, descreve a demanda e anexa documentos quando exigidos.
2. O servidor gera protocolo único, calcula prazo e confirma a gravação.
3. Secretaria abre os detalhes, registra triagem e encaminha um responsável quando necessário.
4. Professor atribuído consulta e envia parecer na conversa; somente secretaria/admin alteram o atendimento administrativo.
5. Secretaria pode pedir complementação; o aluno responde e o pedido volta à análise.
6. Secretaria conclui ou indefere com parecer. O histórico e os documentos continuam disponíveis.
7. Gestor consulta indicadores agregados por período; administrador configura catálogo e calendário.

Prazos contam segunda a sexta, excluindo feriados cadastrados, com vencimento às 18h de São Paulo. Complementação não suspende a contagem. Mudanças de serviço/calendário valem para novos pedidos. Encerrados não são reabertos nesta versão.

Anexos: PDF, PNG e JPG, até 5 MB por arquivo, 5 por operação e 20 por solicitação. O conteúdo fica privado no banco; download exige acesso ao pedido. O comprovante é de envio, não um documento acadêmico assinado.

## Recuperação de senha

Em desenvolvimento, sem integração de e-mail, as mensagens são gravadas em `data/outbox/*.json` (ou `data/demo/outbox` na demonstração). O operador local pode abrir o `resetUrl` para testar o fluxo. Esses arquivos não são servidos pela aplicação nem versionados. O link expira em 30 minutos, só pode ser utilizado uma vez e a redefinição invalida as sessões anteriores.

Para entrega por e-mail, configure `MAIL_WEBHOOK_URL` e opcionalmente `MAIL_WEBHOOK_TOKEN`. O contrato está em [docs/API.md](docs/API.md). Sem essa integração em produção, a entrega de e-mail não funciona e é registrado `mail.failed`; não foi configurado um provedor externo neste repositório.

## Configuração

| Variável             | Padrão / finalidade                                               |
| -------------------- | ----------------------------------------------------------------- |
| `PORT`               | `8080`                                                            |
| `HOST`               | `127.0.0.1`; use `0.0.0.0` apenas quando a hospedagem precisar    |
| `SDASA_DATA_DIR`     | `data`; pasta privada e persistente                               |
| `PUBLIC_ORIGIN`      | Local: `http://localhost:PORT`; obrigatória com HTTPS em produção |
| `NODE_ENV`           | Defina `production` na hospedagem para cookies Secure e HSTS      |
| `MAIL_WEBHOOK_URL`   | Endpoint HTTPS de entrega de e-mail                               |
| `MAIL_WEBHOOK_TOKEN` | Credencial opcional do endpoint                                   |

O servidor não carrega `.env` automaticamente. Use variáveis do ambiente ou `node --env-file=.env server/app.js`. `.env.example` contém apenas exemplos. A URL usada no navegador deve corresponder exatamente à origem configurada; trocar `localhost` por `127.0.0.1` exige ajustar `PUBLIC_ORIGIN`.

## Testar e validar

```bash
npm ci
npm run lint
npm test
npm run test:e2e
```

No Windows, os testes de navegador usam o Edge instalado. Em outros sistemas, execute `npx playwright install chromium` antes de `npm run test:e2e`. É possível configurar `PLAYWRIGHT_CHANNEL`. O servidor de testes usa a porta 8098 e um banco temporário, separado da demonstração. Traces e capturas ficam em `test-results`; o relatório HTML fica em `playwright-report`.

Os testes importam as regras usadas pela aplicação, chamam a API HTTP e percorrem o atendimento no navegador. O roteiro de avaliação humana e os limites das evidências estão em [docs/VALIDACAO.md](docs/VALIDACAO.md).

## Backup e restauração

```bash
npm run backup
npm run restore -- backups/arquivo.sqlite data-restaurada
```

O backup usa a API de snapshot do SQLite, incluindo anexos, e é gravado em `backups/`. A restauração verifica integridade e exige um **diretório que ainda não exista**, para não sobrescrever dados. Pare o servidor, configure `SDASA_DATA_DIR` para a pasta restaurada e reinicie. Para copiar a demonstração, defina antes `SDASA_DATA_DIR=data/demo`.

Backups contêm dados pessoais e documentos: armazene-os em local privado. A automação periódica e a cópia para outro dispositivo são tarefas da hospedagem, não estão executando por este projeto.

## Arquitetura e documentação

- [REQUISITOS.md](REQUISITOS.md): requisitos do Módulo 2 preservados da main.
- [docs/BACKLOG.md](docs/BACKLOG.md): dez histórias oficiais e critérios de aceite.

- [PLANEJAMENTO.md](PLANEJAMENTO.md): diagnóstico, prioridades e critérios acordados.
- [docs/README_ORIGINAL.md](docs/README_ORIGINAL.md): conteúdo do README antigo, preservado como registro do protótipo do Módulo 1.
- [docs/ARQUITETURA.md](docs/ARQUITETURA.md): diagrama, MVC + DAO, monólito × microsserviços e rastreabilidade.
- [docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md): configuração, análise e condução para a Atividade 5.
- [docs/API.md](docs/API.md): contratos, permissões e limites.
- [DEVOPS.md](DEVOPS.md): validação, empacotamento, publicação e operação.
- [docs/VALIDACAO.md](docs/VALIDACAO.md): evidências e roteiro de usabilidade.

```text
server/        API, autenticação, serviços e DAO SQLite
shared/        Regras de negócio usadas no servidor, interface e testes
js/, css/      Frontend local, sem CDN
scripts/       Execução demonstrativa, administração, validação e backup
tests/         Testes unitários, HTTP e navegador
docs/          Arquitetura, contratos e entrega acadêmica
```

## Publicação e limites atuais

O workflow valida e empacota a aplicação completa. **GitHub Pages não executa o backend**; o deploy estático anterior foi substituído por um artefato de entrega. É necessário configurar hospedagem Node, volume persistente, HTTPS e serviço de e-mail. Há um Dockerfile como base para essa configuração, sem implantação externa automática.

A versão usa uma instância, SQLite, anexos em BLOB, métricas e limitação de requisições locais ao processo. Notificações são consultadas a cada 30 segundos. Listas ainda não têm paginação e o dimensionamento de carga não foi medido. Verificação de tipo de arquivo não é análise antivírus. Monitor externo, alertas, avaliação com usuários e política institucional de retenção de dados permanecem para configuração/validação da equipe.

## 👥 Equipe do Projeto Integrador (Módulo 1 & Módulo 2)

Conforme distribuição oficial de papéis da disciplina:

| Integrante | Papel no Projeto | Atribuição Principal |
|:---|:---|:---|
| **Prof.ª Erika Miranda** | *Product Owner* | Priorização das necessidades e do backlog (`eefmiranda@gmail.com`). |
| **Donald Cintado Cabezas** | *Scrum Master* | Organização do trabalho e facilitação da comunicação. |
| **Ana Beatriz Cruz da Silva** | *Analista de Negócios* | Alinhamento da solução aos objetivos e indicadores. |
| **Maria Luiza Dias Silva Tavares** | *Arquiteto de Software* | Decisões arquiteturais e técnicas. |
| **Allan Vinícius Cabeggi Alvarenga** | *Dev/DevOps* | Desenvolvimento, versionamento, automação, Git e testes. |
| **Stephanny Crepalde Costa** | *Security Officer* | Segurança, riscos e proteção das informações. |
| **Júlio César Benício Inácio** | *Analista de Qualidade e Sustentabilidade* | Qualidade, testes e práticas de sustentabilidade. |
