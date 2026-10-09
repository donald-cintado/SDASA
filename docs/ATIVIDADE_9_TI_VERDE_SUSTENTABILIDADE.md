# Atividade 9 — TI Verde: Plano de Sustentabilidade (Módulo 3)
## SDASA — Sistema Digital de Atendimento e Solicitações Acadêmicas

**Disciplina:** Tópicos Avançados em Sistemas de Informação II  
**Orientação:** Prof.ª Erika Miranda (Product Owner)  
**Ano:** 2026  
**Repositório Oficial:** [https://github.com/donald-cintado/SDASA](https://github.com/donald-cintado/SDASA)

---

## 👥 1. Equipe e Responsabilidades em TI Verde

| Integrante | Papel no Projeto | Atribuição no Plano de Sustentabilidade |
|:---|:---|:---|
| **Prof.ª Erika Miranda** | *Product Owner* | Validação institucional das metas de redução de emissões e aprovação da política verde. |
| **Donald Cintado Cabezas** | *Scrum Master* | Incorporar histórias técnicas de sustentabilidade e eficiência no Product Backlog. |
| **Ana Beatriz Cruz da Silva** | *Analista de Negócios* | Mapeamento dos ciclos de vida dos dados e políticas de retenção sustentável de processos. |
| **Stephanny Crepalde Costa** | *Arquiteto de Software* | Desenho de arquitetura ecoeficiente, modulação leve e dimensionamento de infraestrutura. |
| **Júlio César Benício Inácio** | *Dev / DevOps* | Automação do desligamento de ambientes ociosos, testes de consumo e esteira CI/CD limpa. |
| **Maria Luiza Dias Silva Tavares** | *Security Officer* | Diretrizes de sanitização segura de dados no descarte eletrônico e conformidade LGPD. |
| **Allan Vinícius Cabeggi Alvarenga** | *Analista de Qualidade e Sustentabilidade* | Medição da linha de base, apuração dos indicadores ($kgCO_2e$, $kWh$), testes de eficiência e auditoria de e-lixo. |

---

## 🎯 2. Apresentação e Continuidade do Projeto SDASA

Esta atividade corresponde ao **Módulo 3** do Projeto Integrador SDASA e consolida a evolução do sistema:
- **Módulo 1 & 2:** Definição do problema, protótipo centrado no usuário e especificação de requisitos.
- **Atividade 6:** Abordagem Scrum, Product Backlog e fluxo de entregas ágeis.
- **Atividade 7:** Segurança da Informação, mitigação de riscos e governança LGPD.
- **Atividade 8:** Central de Serviços (ITIL), catálogo de suporte e acordos de nível de serviço (SLA).

### Desafio Proposto:
Apresentar um plano técnico e operacional capaz de **reduzir em no mínimo 20% o impacto ambiental e a pegada de carbono** associada à infraestrutura de TI que suporta o SDASA em um ciclo de 6 meses de execução e estabilização.

---

## 📐 3. Objetivo, Escopo e Método de Medição

### 3.1 Meta Central
- **Redução $\ge 20\%$** na estimativa mensal de emissões operacionais de carbono ($\text{kgCO}_2\text{e/mês}$) da infraestrutura de TI atribuível ao SDASA em relação à linha de base apurada antes das intervenções.

### 3.2 Indicador Central e Fórmula de Cálculo
$$\text{Redução (\%)} = \left[ \frac{\text{Emissões da Linha de Base} - \text{Emissões Pós-Ações}}{\text{Emissões da Linha de Base}} \right] \times 100 \ge 20\%$$

*Exemplo Ilustrativo:* Em uma linha de base estimada de $100\text{ kgCO}_2\text{e/mês}$, a meta é atingir $80\text{ kgCO}_2\text{e/mês}$ ou menos.

### 3.3 Indicadores Complementares
- **Consumo de Energia Elétrica:** $\text{kWh/mês}$ total da infraestrutura de servidores e rede.
- **Armazenamento Efetivo:** Volume real em gigabytes ($\text{GB}$) ocupado no banco e arquivos anexos.
- **Intensidade por Atendimento:** $\text{kWh por 1.000 solicitações acadêmicas}$ processadas.
- **Rastreabilidade de Resíduos Eletrônicos:** Percentual de equipamentos obsoletos destinados com laudo formal de descarte sustentável e sanitização de dados.
- **Disponibilidade e Desempenho:** Garantia de que a otimização de recursos não degradará os SLAs operacionais (ITIL / Atividade 8).

### 3.4 Procedimento de Definição da Linha de Base (5 Etapas)
1. **Inventariar:** Mapear servidores físicos, instâncias cloud, banco de dados, storage e estações de atendimento.
2. **Medir:** Registrar o consumo energético durante 30 dias contínuos ou obter relatórios de faturamento do provedor de nuvem.
3. **Calcular Emissões:** Aplicar fatores oficiais de emissão da matriz energética brasileira (SIN / MCTI) ou relatórios de emissões do provedor de nuvem.
4. **Normalizar por Carga:** Registrar o volume total de chamados e solicitações no período para comparação proporcional justa.
5. **Aferição Recorrente:** Repetir a medição mensalmente e confrontar os resultados consolidados ao final de 6 meses.

---

## 🌿 4. Análise dos Nove Aspectos Exigidos

| Aspecto Analisado | Diagnóstico no Cenário do SDASA | Medida Proposta de TI Verde |
|:---|:---|:---|
| **1. Servidores** | Servidores dedicados ou instâncias superdimensionadas consomem energia contínua mesmo com baixa taxa de uso. | Adotar dimensionamento correto (*right-sizing*); migrar instâncias ociosas para containers leves de consumo proporcional. |
| **2. Armazenamento** | Acúmulo de anexos acadêmicos redundantes, logs sem expiração e histórico sem política de retenção aumentam o disco. | Aplicar política de retenção alinhada à LGPD (Atividade 7), eliminar arquivos duplicados e compactar arquivos arquivados. |
| **3. Computadores** | Terminais da secretaria acadêmica e laboratórios ligados 24 horas sem suspensão de energia. | Configurar políticas de gerenciamento de energia nos sistemas operacionais (suspensão automática após 15 min e desligamento ao fim do expediente). |
| **4. Data Center** | Consumo excessivo de climatização (PUE elevado) e servidores locais com baixa eficiência energética. | Consolidar cargas de trabalho; priorizar data centers com certificação de sustentabilidade e menor índice de PUE (*Power Usage Effectiveness*). |
| **5. Cloud** | Ambientes de homologação e testes rodando continuamente em finais de semana e madrugadas. | Implementar automação (*cron*) para desligar ambientes não produtivos fora do expediente comercial e utilizar instâncias elásticas. |
| **6. Energia** | Consumo elétrico contínuo sem aproveitamento de tarifas horárias ou monitoramento de eficiência. | Medir mensalmente o consumo em kWh, desligar periféricos ociosos e priorizar fontes de energia renovável quando aplicável. |
| **7. Equipamentos Obsoletos** | Descarte prematuro de computadores e servidores que poderiam ter vida útil estendida. | Promover manutenção preventiva, upgrades de memória/SSD e reuso de equipamentos antes de compras desnecessárias. |
| **8. Descarte Eletrônico** | Lixo eletrônico descartado sem controle ambiental ou com risco de vazamento de dados confidenciais. | Homologar empresas recicladoras credenciadas, obter certificados de destinação ambiental e realizar sanitização criptográfica prévia dos discos. |
| **9. Eficiência do Software** | Algoritmos ineficientes, excesso de requisições de rede (polling agressivo) e processamento redundante aumentam o uso de CPU. | Otimizar consultas de banco de dados, implementar paginação, cache de dados estáticos e notificações direcionadas por evento. |

---

## 📋 5. Plano de Ação — Os Cinco Problemas do Enunciado

| Problema Identificado | Ação Proposta | Indicador de Medição | Meta Mensurável (6 Meses) |
|:---|:---|:---|:---|
| **1. Alto Consumo Energético** | Habilitar suspensão automática em estações; desligar instâncias de teste/homologação fora do expediente comercial; redimensionar servidores. | $\text{kWh/mês}$ de operação do SDASA; $\text{kWh / 1.000 solicitações}$. | **Reduzir em $\ge 20\%$** o consumo operacional medido em 6 meses, preservando a disponibilidade. |
| **2. Equipamentos Antigos** | Realizar inventário completo de hardware; priorizar manutenção e upgrades pontuais; substituir apenas com estudo de ganho energético comprovado. | \% de equipamentos inventariados e avaliados para reuso/reparo; vida útil média estendida. | **Inventariar 100%** dos ativos em 60 dias e avaliar viabilidade de reuso antes de 100% das aquisições. |
| **3. Armazenamento Excessivo** | Aplicar expiração automática de sessões e resets no banco; purgar anexos temporários orfãos; compactar arquivos de solicitações finalizadas há mais de 1 ano. | $\text{GB}$ de armazenamento efetivo ocupado; $\text{GB por 1.000 atendimentos}$. | **Reduzir em $\ge 25\%$** o armazenamento redundante e desnecessário em 6 meses, mantendo dados legais. |
| **4. Descarte Inadequado** | Estabelecer fluxo formal de descarte com sanitização segura de discos (DoD 5220.22-M ou sobrescrita segura) e envio exclusivo para recicladoras certificadas. | \% de dispositivos descartados com certificado de destinação e laudo de sanitização. | **Garantir 100%** de rastreabilidade, laudos ambientais e sanitização em todo hardware descartado. |
| **5. Baixa Eficiência do Software** | Criar índices no banco relacional; otimizar payloads JSON; eliminar consultas repetidas; limitar tamanho de arquivos (máx 5 MB) e adotar processamento sob demanda. | Tempo médio de resposta p95 (ms); consumo de CPU por requisição; bytes transferidos por chamada. | **Reduzir em $\ge 20\%$** o processamento e tráfego de rede por 1.000 solicitações em 6 meses. |

---

## 💡 6. Desafio Extra: Estratégias de Desenvolvimento de Software Sustentável (*Green Software*)

O projeto SDASA adota na prática **7 estratégias de eficiência computacional e arquitetural**:

1. **Consultas Eficientes e Estrutura Relacional Enxuta:**
   - Uso de SQLite nativo no Node.js com transações atômicas agrupadas, evitando servidores de banco de dados separados ociosos para cargas moderadas e economizando CPU/rede.
2. **Paginação e Carga sob Demanda:**
   - As telas do portal carregam dados resumidos em listagens e buscam anexos e histórico completo apenas quando o chamado específico é aberto pelo usuário.
3. **Controle Estrito de Tamanho de Anexos:**
   - Limite máximo de 5 MB por arquivo e 20 anexos por chamado, com validação instantânea no servidor impedindo transferências desnecessárias de arquivos gigantes.
4. **Arquitetura Leve sem Dependências Externas (Zero CDN Bloat):**
   - Frontend desenvolvido em JavaScript e CSS locais enxutos, sem frameworks pesados de múltiplos megabytes no carregamento da página.
5. **Processamento Orientado a Eventos:**
   - Notificações de mudança de status geradas diretamente na transação do chamado, substituindo loops pesados de varredura no banco.
6. **Ambientes Não Produtivos Desligáveis:**
   - O projeto possui scripts para execução pontual de demonstração e testes (`npm test`, `npm run start:demo`), não exigindo instâncias de homologação ativas 24 horas por dia.
7. **Testes Automatizados Rápidos e Eficientes:**
   - Bateria completa de 13 testes unitários e de integração roda em menos de 2,5 segundos, consumindo mínimo de energia e CPU nas esteiras de integração contínua (CI/CD).

---

## 📊 7. Painel de Indicadores de Sustentabilidade

| Indicador | Unidade | Linha de Base (Mês 1) | Meta (Mês 6) | Frequência de Aferição |
|:---|:---:|:---:|:---:|:---:|
| **Emissões Operacionais de Carbono** | $\text{kgCO}_2\text{e/mês}$ | Apuração inicial de 30 dias | $\ge 20\%$ de redução | Mensal |
| **Consumo Energético Total** | $\text{kWh/mês}$ | Medição inicial da infraestrutura | $\ge 20\%$ de redução | Mensal |
| **Intensidade Energética** | $\text{kWh / 1.000 chamados}$ | Consumo dividido por volume | $\ge 20\%$ de redução | Mensal |
| **Armazenamento de Dados** | $\text{GB}$ ocupados | Inventário de banco e anexos | $\ge 25\%$ de redução de redundâncias | Mensal |
| **Conformidade de Descarte Eletrônico** | $\%$ | Situação anterior | $100\%$ rastreado e certificado | Por descarte |
| **Disponibilidade Operacional (SLA ITIL)** | $\%$ | $99,5\%$ | Manter $\ge 99,5\%$ (sem degradação) | Semanal |

---

## 🗓️ 8. Cronograma de Implantação (Ciclo de 6 Meses)

| Período | Ações Principais | Responsáveis |
|:---|:---|:---|
| **Mês 1** | Inventário detalhado de servidores, consumos, base de dados e emissões; consolidação da Linha de Base oficial. | Júlio César (DevOps) + Allan Vinícius (Qualidade/Sustentabilidade) |
| **Mês 2** | Configuração de perfis de energia nos computadores de atendimento e automação de desligamento de instâncias não produtivas. | Stephanny Crepalde (Arquiteta) + Júlio César (DevOps) |
| **Mês 3** | Aplicação das regras de retenção de logs e anexos da LGPD; eliminação de arquivos órfãos e compactação de histórico. | Ana Beatriz (Negócios) + Maria Luiza (Security Officer) |
| **Mês 4** | Otimização das rotas do backend, índices de banco de dados, compressão HTTP e testes de eficiência computacional. | Júlio César (DevOps) + Allan Vinícius (Qualidade/Sustentabilidade) |
| **Mês 5** | Formalização de parcerias com recicladoras de e-lixo, protocolo de sanitização segura e implantação do dashboard de emissões. | Donald Cintado (Scrum Master) + Allan Vinícius (Sustentabilidade) |
| **Mês 6** | Aferição final dos indicadores, comparação com a Linha de Base, validação da meta de 20% de redução e relatório para a PO. | Equipe SDASA + Prof.ª Erika Miranda (Product Owner) |

---

## 🔗 9. Relação com as Atividades Anteriores do Projeto Integrador

- **Scrum (Atividade 6):** As melhorias de sustentabilidade entram no Product Backlog como User Stories técnicas e itens de débito técnico verde, sendo estimadas e planejadas nas Sprints.
- **Segurança da Informação e LGPD (Atividade 7):** As rotinas de limpeza de dados respeitam os prazos legais de guarda e retenção de documentos educacionais, enquanto o descarte de máquinas exige sanitização certificada para evitar vazamentos de dados pessoais.
- **Central de Serviços ITIL (Atividade 8):** O Service Desk monitora incidentes de desempenho garantindo que as ações de economia de energia não comprometam os SLAs e tempos de resposta dos chamados.
- **DevOps (Atividade 4):** A esteira de CI/CD automatizada valida sintaxe e testes de regressão em segundos, garantindo entregas ecológicas e confiáveis.

---

## 🏁 10. Conclusão

O **Plano de TI Verde do SDASA** comprova que a sustentabilidade pode ser integrada de forma pragmática e mensurável ao ciclo de vida do software e à infraestrutura acadêmica. Ao tratar os 9 aspectos fundamentais, estabelecer metas claras para os 5 problemas de infraestrutura e implementar estratégias de *Green Software*, o projeto garante a meta de **redução de pelo menos 20% no impacto ambiental**, mantendo total segurança, alta disponibilidade e excelência no atendimento aos estudantes.
