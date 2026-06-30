# Agente de Testes — Auditoria, Relatório e Correção

Responsável pela auditoria automatizada de qualidade dos documentos gerados (fit, CV, CL).

## Visão geral

Os testes são métricas consultivas — passar em todos não implica documento perfeito, e reprovar não implica documento ruim. Eles cobrem apenas regras quantitativas; problemas de qualidade fora do escopo dos testes devem ser levados ao usuário junto ao relatório.

## Agentes/skills com testes

| Agente/skill                                                                        |
|-------------------------------------------------------------------------------------|
| [ai/agents/agent-cv.md](ai/agents/agent-cv.md#testes)                               |
| [ai/agents/agent-cl.md](ai/agents/agent-cl.md#testes)                               |
| [ai/agents/agent-fit.md](ai/agents/agent-fit.md#testes)                             |
| [ai/skills/boas-praticas-ats/SKILL.md](ai/skills/boas-praticas-ats/SKILL.md#testes) |

---

## Fase 1 — Auditoria (automática)

Após gerar todos os documentos solicitados:

1. Rode os testes de **todos** os documentos gerados, usando os comandos definidos em cada agente/skill acima
2. Salve os resultados brutos em `.tmp/audit-<timestamp>.txt`
3. **Não faça nenhuma correção ainda se autorização.** É muito caro fazer correções automáticas sem autorização do usuário, pois podem gerar problemas de qualidade e inconsistências. Apenas rode os testes e salve os resultados.
4. A autorização do usuário para correção é valida para **APENAS UMA** rodada de correção/iteração. Se houver falhas novamente, você deve pedir autorização novamente. Isso significa que você não pode ficar em loop. 
5. Os testes são métricas consultivas, não são metas a serem seguidas, portanto, passar em todos os testes não implicam em um documento perfeito.
6. Os testes abrangem apenas algumas das regras quantitativas, portanto mesmo que o documento passe em todos os testes, ele ainda pode ter problemas de qualidade que não são capturados pelos testes.
7. Você pode gerar outros bash para testar outras regras, porém eles não devem ser persistidos. Se precisar, gere-os em um `/tmp`

## Fase 2 — Relatório ao usuário

Após a auditoria, apresente ao usuário:

- **Se todos os testes passaram:** Apenas diga "Feito"
- **Se houve falhas:** apresente um relatório. Segue um exemplo:
  Os seguintes documentos apresentaram falhas nos testes automatizados:

| Vaga   | Documento | Teste                                                  | Descrição da falha                                        |
|--------|-----------|--------------------------------------------------------|-----------------------------------------------------------|
| Vaga X | CV        | Validar tamanho resumo de 400 a 500 caracteres         | Possui apenas 300 cacteres                                |
| Vaga X | CV        | Caracteres proibidos                                   | Carcateres proibidos encontrados: emDash                  |
| Vaga Y | fit       | Score coerente com os tipos de gap                     | Score deveria ser 7 ao em vez de 5                        |
| Vaga Z | CL        | Entre 2 a 3 parágrafos                                 | Tem apenas 1 parágrafo                                    |
| Vaga Z | CL        | Termos em Português sem acentuação                     | Algumas palvras parecem estar sem acentuação: programacao |

  Ao final do relatório, pergunte:
  > "Deseja que eu faça uma rodada de correção automática para esses documentos?"

## Fase 3 — Correção (somente se o usuário autorizar)

- Se o usuário **não aceitar**: encerre o fluxo
- Se o usuário **aceitar**:
  1. Leia o relatório de auditoria e identifique quais regras foram infringidas.
  2. Faça correções apenas nos documentos com falha, alterando o mínimo possível o conteúdo original sem infringir as demais regras
  3. Volte para a **[Fase 1](#fase-1--auditoria-automática)**.
