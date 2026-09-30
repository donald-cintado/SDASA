# Validação do SDASA

## Evidências automatizadas

Ambiente de referência: Windows, Node.js 24.21.0 e Microsoft Edge em modo headless. Testes usam bancos temporários, separados do banco de demonstração e do banco de uso real.

Resultado da execução local desta implementação: **lint aprovado; 13/13 testes unitários/HTTP/operação aprovados; 2/2 cenários de navegador aprovados; verificação de arquivos privados e `git diff --check` sem falhas**. O fluxo no navegador foi validado novamente após os ajustes de acessibilidade e atualização das notificações. As capturas de desktop e celular foram geradas em `test-results`.

| Comando                          | O que verifica                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                   | ESLint, sintaxe JS, estrutura HTML de entrada e configuração JSON                                                                              |
| `npm test`                       | 13 testes com regras reais, HTTP, permissões, tramitação, rollback, anexos, recuperação, indicadores, reinício e scripts de backup/restauração |
| `npm run test:e2e`               | 2 cenários no navegador: fluxo entre cinco perfis e cadastro/mobile/teclado/falha de envio                                                     |
| `node scripts/security-check.js` | Arquivos privados e padrões de chave privada nos arquivos versionados                                                                          |

O relatório final de navegador é gerado em `playwright-report/index.html`; traces de falha e capturas ficam em `test-results`. A validação local não equivale a execução no GitHub Actions nem a homologação institucional.

Coberturas relevantes:

- Cadastro não permite definir perfil privilegiado; credenciais inválidas são rejeitadas; saída, inativação e troca de senha revogam sessões.
- Origem externa é recusada em mutações; arquivos internos não são publicados pelo servidor estático.
- Aluno não acessa dados/anexos de outro aluno; professor só acessa demandas atribuídas; gestor recebe agregados.
- Protocolo único em aberturas concorrentes; falha no evento provoca rollback do pedido e dos anexos.
- Arquivos sem assinatura compatível, acima do limite ou em quantidade excessiva são recusados.
- Estados finais, transições inválidas e versões desatualizadas são bloqueados.
- Notificações e leitura são isoladas por destinatário; conversa fica vinculada ao pedido.
- Recuperação usa token de uso único, expiração e hash no banco; respostas não confirmam existência da conta.
- Dias úteis respeitam final de semana, feriado, virada de ano e fuso; métricas respeitam o período de abertura em São Paulo.
- Reinício completo do servidor preserva sessão, protocolo e bytes do arquivo; backup e restauração mantêm integridade e recusam sobrescrita.
- Navegador percorre atendimento com sessões independentes, faz download, trata texto semelhante a HTML como texto e mantém formulário após erro de gravação.
- Layout móvel testado em 390 × 844, sem rolagem horizontal da página; link para pular ao conteúdo acessível pelo teclado.

## Roteiro de usabilidade do documento integrador

**Ainda requer participantes reais.** O antigo checklist automático não serve como evidência de compreensão do usuário. Aplicar preferencialmente sem conduzir o participante pelos botões, registrando assistência necessária.

| Etapa | Tarefa                         | Evidência a registrar                            |
| ----- | ------------------------------ | ------------------------------------------------ |
| 1     | Acessar a tela inicial         | Compreendeu o propósito?                         |
| 2     | Realizar login                 | Localizou acesso e entendeu erros?               |
| 3     | Localizar Nova Solicitação     | Encontrou sem ajuda?                             |
| 4     | Selecionar tipo de atendimento | Entendeu serviço, prazo e documentos?            |
| 5     | Preencher descrição            | Entendeu campos e anexos?                        |
| 6     | Enviar solicitação             | Entendeu sucesso ou falha?                       |
| 7     | Identificar protocolo          | Conseguiu encontrá-lo e explicar sua finalidade? |
| 8     | Verificar status               | Entendeu situação, prazo e próximo passo?        |

Ficha por participante: identificador anônimo, perfil, dispositivo, data, tempo por tarefa, sucesso sem ajuda/com ajuda/falha, dificuldade observada, frase relevante e proposta de melhoria. Não registrar credenciais nem documentos pessoais nas evidências.

Complementar com secretaria (triagem/encaminhamento), professor (parecer), gestor (interpretação do período) e administrador (configuração). Transformar dificuldades em itens de backlog com reprodução e critério de aceite. Ainda não há resultados humanos nem aprovação da docente registrados.

## Itens que dependem do ambiente de destino

- Hospedagem com Node, volume persistente e HTTPS; build/execução do Dockerfile no destino.
- Provedor real de e-mail e teste de recebimento em caixa externa.
- Monitor externo, destinatários de alertas e retenção dos logs.
- Agendamento e armazenamento externo dos backups.
- Avaliação de carga, paginação para volumes grandes, análise de malware nos anexos e política de retenção institucional.
- Proteção de branches, revisão do PR e execução remota do workflow.

Esses itens não devem ser apresentados como implantados ou aprovados somente pela presença dos arquivos de configuração.
