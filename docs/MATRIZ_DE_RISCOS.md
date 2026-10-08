# Atividade 7 — Matriz de riscos do SDASA

## Cenário e identificação

**Cenário do exercício:** um funcionário relata que uma pessoa não autorizada acessou informações do sistema. O relato inicia uma investigação; não comprova a origem, o volume de dados expostos nem uma vulnerabilidade específica. Não foi constatado um incidente real nesta entrega.

| Elemento solicitado   | Aplicação ao cenário                                                                                                                                                                                  |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ativo**             | Dados pessoais de alunos e funcionários, solicitações, mensagens, anexos, credenciais, sessões, banco SQLite e backups.                                                                               |
| **Ameaça**            | Pessoa externa ou interna usando credencial roubada, sessão exposta ou permissão inadequada para consultar informações.                                                                               |
| **Vulnerabilidade**   | Hipóteses a investigar: senha compartilhada, sessão em computador sem bloqueio, conta com privilégio excessivo, cópia do banco exposta ou falha de autorização. Não são falhas confirmadas no código. |
| **Risco**             | Consulta, cópia ou alteração de dados por pessoa sem autorização, com possibilidade de vazamento.                                                                                                     |
| **Impacto**           | Exposição de documentos e vida acadêmica, fraude, prejuízo ao titular, perda de confiança e interrupção do atendimento.                                                                               |
| **Probabilidade**     | Alta (3) para acesso indevido no cenário relatado; estimativa qualitativa para priorizar a investigação, sem taxa estatística ou confirmação forense.                                                 |
| **Medida preventiva** | Contas individuais, menor privilégio, revisão de acessos, proteção de sessões, autorização em cada pedido/anexo e treinamento contra phishing.                                                        |
| **Medida corretiva**  | Preservar evidências, revogar sessões e acessos suspeitos, corrigir a causa comprovada, avaliar dados atingidos e executar a comunicação aplicável.                                                   |

## Escala e classificação

Horizonte de avaliação: próxima implantação e operação do SDASA. As notas são estimativas da equipe para o exercício, considerando controles conhecidos e lacunas de operação; não equivalem a uma auditoria ou medição de frequência.

**Probabilidade:** Baixa (1) = exige condições pouco prováveis; Média (2) = plausível durante a operação; Alta (3) = favorecida pelo cenário ou por exposição frequente. **Impacto:** Baixo (1) = efeito local reversível; Médio (2) = interrupção limitada ou retrabalho significativo; Alto (3) = exposição pessoal, perda relevante ou paralisação do atendimento.

**Pontuação = probabilidade × impacto.** Classificação: **Baixo (1–2), Médio (3–4), Alto (6–9)**.

| Probabilidade / Impacto | Baixo (1) | Médio (2) | Alto (3)  |
| :---------------------- | :-------: | :-------: | :-------: |
| Baixa (1)               | 1 — Baixo | 2 — Baixo | 3 — Médio |
| Média (2)               | 2 — Baixo | 4 — Médio | 6 — Alto  |
| Alta (3)                | 3 — Médio | 6 — Alto  | 9 — Alto  |

## Matriz de risco preenchida

| Risco                    | Probabilidade                                                           | Impacto                                                             | Classificação | Tratamento                                                                                                                                                                                                                                                                     |
| :----------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------ | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R01 — Vazamento de dados | Média (2): anexos e cópias podem ser expostos fora da aplicação.        | Alto (3): documentos podem revelar informações pessoais e de saúde. | **Alto — 6**  | **Mitigar.** Prevenir com autorização de download, cópias privadas e criptografia de volume/backup; corrigir removendo a exposição, preservando evidências e avaliando titulares afetados. Responsável: Segurança + Dev/DevOps.                                                |
| R02 — Senha comprometida | Média (2): phishing e reutilização de senhas continuam possíveis.       | Alto (3): invasor assume permissões da vítima.                      | **Alto — 6**  | **Mitigar.** Contas individuais, hash com salt, limitação de tentativas e treinamento; propor MFA para contas privilegiadas. Em suspeita, inativar a conta quando necessário, revogar sessões e redefinir credencial por canal seguro. Responsável: Administrador + Segurança. |
| R03 — Indisponibilidade  | Média (2): uma instância e monitoramento externo ainda não configurado. | Médio (2): atendimento interrompido e prazos prejudicados.          | **Médio — 4** | **Mitigar.** Monitorar saúde e espaço em disco, configurar alertas e limitar carga no proxy; recuperar serviço, validar integridade e divulgar orientação operacional. Responsável: Dev/DevOps.                                                                                |
| R04 — Acesso indevido    | Alta (3): é o evento relatado no exercício, ainda sob apuração.         | Alto (3): leitura ou alteração fora das atribuições.                | **Alto — 9**  | **Mitigar com prioridade imediata.** Revisar perfis e testar isolamento; preservar logs, bloquear acesso suspeito, revogar sessões e corrigir a causa identificada. Responsável: Segurança + Administrador.                                                                    |
| R05 — Perda de dados     | Média (2): cópias periódicas externas não estão automatizadas.          | Alto (3): perda de pedidos, anexos e rastreabilidade.               | **Alto — 6**  | **Mitigar.** Agendar backups privados externos e ensaiar restauração; após falha, preservar a base afetada, restaurar cópia íntegra em pasta nova e reconciliar pedidos posteriores. Responsável: Dev/DevOps + Qualidade.                                                      |

## Plano de acompanhamento

| Riscos        | Ação prioritária                                              | Prazo proposto                                                                | Evidência para reavaliação                                                        |
| :------------ | :------------------------------------------------------------ | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| R04, R01, R02 | Investigar o relato, conter o acesso e delimitar exposição.   | Imediatamente após ciência; registrar horários no incidente.                  | Linha do tempo, sessões revogadas, decisão sobre comunicação e teste da correção. |
| R01, R02, R04 | Revisar contas, acesso a anexos, armazenamento e treinamento. | Antes de disponibilizar dados reais; revisão mensal e após mudança de função. | Matriz de acesso aprovada e testes negativos por perfil.                          |
| R03, R05      | Agendar cópias e alertas; executar restauração isolada.       | Antes da operação com dados reais; ensaio mensal proposto.                    | Registro do backup, alerta e tempo medido de recuperação.                         |
| Todos         | Recalcular probabilidade e impacto após controles.            | Ao encerrar o incidente e ao final de cada Sprint.                            | Nova versão da matriz com justificativas e responsável.                           |

O risco residual só será classificado após verificar os controles. O plano não presume risco zero nem redução automática da nota. Procedimentos em [PLANO_DE_SEGURANCA.md](PLANO_DE_SEGURANCA.md); inventário e direitos em [ANALISE_LGPD.md](ANALISE_LGPD.md).
