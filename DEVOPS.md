# Desenvolvimento, entrega e operação do SDASA

## Processo e definição de pronto

Backlog → branch de trabalho → implementação → validação local → pull request/revisão → CI → pacote de entrega → configuração da hospedagem → monitoramento/feedback.

O [planejamento](PLANEJAMENTO.md) e a [rastreabilidade](docs/ARQUITETURA.md) vinculam as entregas aos requisitos dos PDFs. Cada alteração deve registrar problema, comportamento final, teste e limitações. Use commits pequenos com `feat:`, `fix:`, `test:`, `docs:` ou `ci:`. `main` e `develop` são os destinos contemplados pelo workflow; proteção de branches e revisão obrigatória dependem de configuração do repositório remoto e não foram verificadas nesta execução.

Pronto significa: comportamento coberto por testes da implementação real, ausência de falhas de validação, documentação compatível e revisão humana. Sucesso local não comprova execução do GitHub Actions nem validação com usuários.

## Esteira implementada

`.github/workflows/ci-cd.yml` executa em push/PR para main/develop e acionamento manual:

1. Checkout e preparação de Node.js 24.21.
2. `npm ci` com lockfile versionado.
3. `npm run lint`: análise estática e estrutura de entrada.
4. `npm test`: regras, HTTP, persistência, rollback, autorização e backup.
5. Instalação do Chromium de teste e `npm run test:e2e`.
6. Verificação de arquivos privados versionados e `npm audit --audit-level=high`.
7. Upload do relatório de navegador; após sucesso, empacotamento do código necessário para execução.

O pacote exclui `.git`, bancos, outbox, backups, credenciais e resultados de teste. A esteira não publica o frontend isoladamente, pois ele depende da API na mesma origem. Não há segredos de hospedagem nem provedor externo configurados.

## Segurança e dados

- Sessões, permissões e downloads são verificados no servidor; hashes de senha usam scrypt.
- Verificação de origem em mutações, CSP, limite de corpo e de tentativas.
- SQL parametrizado, transações e registro de atores/eventos; concorrência de tramitação por versão.
- Catálogo e calendário alterados não modificam prazos históricos.
- Segredos devem vir do ambiente; dados e outbox ficam em pasta privada ignorada pelo Git.
- Script de demonstração usa banco separado e é bloqueado em produção.

Não se afirma certificação de segurança ou conformidade jurídica automática. Antes de usar documentos institucionais reais, definir retenção, responsáveis, backup protegido e processo de resposta a incidentes; completar análise de arquivos e avaliação de carga conforme o uso pretendido.

## Publicação

Destino necessário: um processo Node.js, volume persistente privado e proxy HTTPS. Configure `NODE_ENV=production`, `PUBLIC_ORIGIN`, `SDASA_DATA_DIR` e integração de e-mail. `HOST=0.0.0.0` é necessário dentro de container; o acesso externo deve passar pelo proxy.

O Dockerfile contém apenas a aplicação e opera com usuário `node`. Montar um volume em `/app/data`; não usar disco efêmero para o banco. O build de imagem e o provedor de hospedagem precisam ser validados no ambiente de destino. O GitHub Pages anteriormente configurado não serve como hospedagem da versão integrada.

Antes de trocar uma versão, fazer snapshot consistente. Esta versão inicial usa esquema 1; alterações futuras exigem scripts de migração versionados. Para voltar código após mudança de esquema, verificar compatibilidade ou restaurar um snapshot em pasta nova; preservar o banco atual antes de qualquer troca.

## Observabilidade e recuperação

| Sinal            | Implementação local                          | A configurar externamente                    |
| ---------------- | -------------------------------------------- | -------------------------------------------- |
| Disponibilidade  | `GET /api/health` consulta o banco           | Monitor periódico e alerta para a equipe     |
| Latência/tráfego | Logs JSON por chamada e métricas de processo | Retenção, percentis e painéis de longo prazo |
| Erros            | 5xx com requestId; evento `mail.failed`      | Alertas e triagem de incidentes              |
| Recursos         | Memória RSS e páginas do banco               | Limites de disco, CPU e alarmes              |
| Atendimento      | Prazos, pendências e agregados do período    | Metas institucionais de serviço              |

Somente administrador consulta `/api/admin/metrics`. Métricas em memória reiniciam com o processo. Logs não incluem senhas, cookies, corpos de documentos ou token de recuperação. O monitor de disponibilidade deve operar fora do processo; um health check local não detecta por si só a indisponibilidade da máquina.

`npm run backup` cria snapshot com a API SQLite; `npm run restore -- arquivo.sqlite pasta-nova` valida integridade e restaura sem sobrescrever dados existentes. Agendar backup, retenção, cópia externa e teste periódico de restauração na hospedagem. Não há agendamento instalado por este repositório.

## Limites da avaliação de usabilidade

Os testes de navegador exercitam fluxos e acessibilidade básica. A atividade acadêmica também pede registrar dificuldades de usuários: seguir [docs/VALIDACAO.md](docs/VALIDACAO.md) e preencher evidências reais, sem marcar participantes ou aprovação da docente ficticiamente.
