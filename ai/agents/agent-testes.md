# Agente de Testes — Auditoria, Relatório e Correção

Responsável pela auditoria automatizada de qualidade dos documentos gerados (fit, CV, CL).

# Gatilho

O agente de testes é acionado **após a geração de todos os documentos solicitados** (fit, CV, CL).

# LIMITES INEGOCIÁVEIS

- **NUNCA siga para a [Fase 3](#fase-3--correção) sem autorização do usuário solicitada na [Fase 2](#fase-2--relatório-ao-usuário)**
- **Máximo 1 rodada de correção por ativação deste agente, SEMPRE com autorização. Isso significa que a autorização está revogada após finalizar a Fase 3 e deve ser solicitada novamente**
- **NUNCA rode testes novamente após correção sem autorização explícita do usuário**
- Se o usuário não responder "sim" ou "pode corrigir", o fluxo **TERMINOU**

## Visão geral

Os testes são métricas consultivas — passar em todos não implica documento perfeito, e reprovar não implica documento ruim. Eles cobrem apenas regras quantitativas; problemas de qualidade fora do escopo dos testes devem ser levados ao usuário junto ao relatório.

## Agentes/skills com testes

| Agente/skill                                                                        |
|-------------------------------------------------------------------------------------|
| [ai/agents/agent-cv.md](agent-cv.md#testes)                                         |
| [ai/agents/agent-cl.md](agent-cl.md#testes)                                         |
| [ai/agents/agent-fit.md](agent-fit.md#testes)                                       |
| [ai/skills/boas-praticas-ats/SKILL.md](../skills/boas-praticas-ats/SKILL.md#testes) |

---

## Fase 1 — Auditoria (automática)

Após gerar todos os documentos solicitados:

1. Rode os testes de **todos** os documentos gerados em uma única chamada via Bash — é leitura pura e `JOB_ID` já suporta múltiplos jobs (`test/utils/utils.js`, função `selectJobs`): `npx jest "cv|cl|ats"` sem `JOB_ID` roda todos os jobs de uma vez; para restringir a algumas vagas, `JOB_ID` aceita lista separada por vírgula (ex: `JOB_ID=id1,id2 npx jest "cv|cl|ats"`).
2. Salve os resultados brutos em `.tmp/audit-<timestamp>.txt`.
3. **Não faça nenhuma correção ainda se autorização.** É muito caro fazer correções automáticas sem autorização do usuário, pois podem gerar problemas de qualidade e inconsistências. Apenas rode os testes e salve os resultados.
4. A autorização do usuário para correção é valida para **APENAS UMA** rodada de correção/iteração. Se houver falhas novamente, você deve pedir autorização novamente. Isso significa que você não pode ficar em loop.
5. Os testes são métricas consultivas, não são metas a serem seguidas, portanto, passar em todos os testes não implicam em um documento perfeito.
6. Os testes abrangem apenas algumas das regras quantitativas, portanto mesmo que o documento passe em todos os testes, ele ainda pode ter problemas de qualidade que não são capturados pelos testes.
7. Você pode gerar outros bash para testar outras regras, porém eles não devem ser persistidos. Se precisar, gere-os no `.tmp` aqui no root, mas apague-os depois

## Fase 2 — Relatório ao usuário
Está fase nunca é feita paralelamente. Ela é executada para todas as vagas testadas de uma vez, portanto só pode começar quando a Fase 1 tiver terminado
Após a auditoria, apresente ao usuário:

- **Se todos os testes passaram:** Apenas diga "Feito" e encerre (pule para o fim)
- **Se houve falhas:** apresente um relatório, no exato formato como o do exemplo abaixo:

---
Os seguintes documentos apresentaram falhas nos testes automatizados:

| Vaga   | Documento | Teste                                          | Descrição da falha                                         |
|--------|-----------|------------------------------------------------|------------------------------------------------------------|
| Vaga X | CV        | Validar tamanho resumo de 400 a 500 caracteres | Possui apenas 300 caracteres                               |
| Vaga X | CV        | Caracteres proibidos                           | Caracteres proibidos encontrados: emDash                   |
| Vaga Y | fit       | Score coerente com os tipos de gap             | Score deveria ser 7 ao invés de 5                          |
| Vaga Z | CL        | Entre 2 a 3 parágrafos                         | Tem apenas 1 parágrafo                                     |
| Vaga Z | CL        | Termos em Português sem acentuação             | Algumas palavras parecem estar sem acentuação: programacao |
---

**PARE AQUI.** Não prossiga para correção sem uma nova resposta do usuário.
Sua ÚNICA saída agora é a tabela de falhas + a pergunta abaixo:

> "Deseja que eu faça uma rodada de correção automática para esses documentos?"

**AGUARDE a resposta do usuário.** Se não receber resposta, NÃO execute nada.

## Fase 3 — Correção

- Se o usuário **não aceitar**: encerre o fluxo
- Se o usuário **aceitar**:
  1. Leia o relatório de auditoria salvo em `.tmp/` e identifique quais regras foram infringidas
  2. Corrija cada documento sequencialmente, alterando o mínimo possível o conteúdo original sem infringir as demais regras. Escreva cada correção em `src/json/jobs-data.js` imediatamente após corrigir o documento
  3. A partir daqui sua autorização está revogada. Para uma nova etapa de correção, precisa solicitar autorização novamente.
  4. Volte para a Fase 1