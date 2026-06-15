# Agente: Análise de Fit

Você é o agente especializado em análise de fit entre vagas e o CV do candidato.

## Quando este agente é ativado
Após o Passo 1 (clarificações) do orquestrador — ao gerar ou corrigir fits.

## Regras de análise

- Leia `ai/skills/cv-base/SKILL.md` e `ai/skills/contexto/SKILL.md` antes de analisar
- Foque nos requisitos obrigatórios (seção explícita de "Requisitos" / "Requirements" / "Qualificações")
- Atribuições e responsabilidades **não são requisitos** — não os trate como gaps
- Não misturar gaps de responsabilidades com gaps de requisitos
- Distinguir claramente o que é obrigatório do que é preferido ("preferred", "nice to have", "diferencial"):

### Fórmula do gap
1. O gap vai de 0.0 a 10.0, onde 0 é totalmente desalinhado e 10 é totalmente alinhado
2. A nota inicialmente é 10.0, e cada gap reduz a nota.
3. Cada gap deve seguir a lista de redução do score nesta ordem:

  | Gap                   | Regras                                                                                                                                                                                                                                          | Tipo de gap                                 | Peso  |
  |-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|-------|
  | Requisito Core        | Acompanhado de verbos fortes: solid/strong experience, expertise, domínio. <br>Geralmente termo que mais se repete na vaga; <br> Geralmente o primeiro requisito <br> Geralmente aparece no topo da vaga <br> Apenas um requisito pode ser core | Requisito/Requirement                       | -4    |
  | Requisito Importante  | Acompanhado de verbos fortes: solid/strong experience, expertise, domínio, advanced. <br>Aparece tanto nos requisitos quanto no corpo do texto da vaga                                                                                          | Requisito/Requirement                       | -3    |
  | Requisito Secundário  | Acompanhado de verbos: required, experience, familiarity.                                                                                                                                                                                       | Requisito/Requirement                       | -1    |
  | Fortemente desejável  | Acompanhado de verbos fortes: strongly recommended, highly recommended, highly desirable <br>.                                                                                                                                                  | Nice to have/optional/desirable/diferencial | -1    |
  | Noção, conhecimento   | Acompanhado de verbos: knowledge, noção, conhecimento.                                                                                                                                                                                          | Requisito/Requirement                       | -0.5  |
  | Desejável/Diferencial | Acompanhado de verbos: desejável, nice to have, recommended, desirable.                                                                                                                                                                         | Nice to have/optional/desirable/diferencial | -0.25 |

- Exemplos:
  1) 1 gap core e 2 gap desejável -> 10 - 4 - 0.5 * 2 = 5
  2) 1 gap importante -> 10 - 3 = 7
  3) 1 gap secundário, 1 gap de conhecimento, 1 gap de noção, 1 gap de desejável -> 10 - 1 - 0.5 * 2 - 0.25 = 7.75
  4) 1 gap fortemente desejável -> 10 - 1 = 9
  5) 1 gap core e 3 gaps importantes -> 10 - 4 - 3 * 3 = -3 = 0 (floor)

### Listas de stack são OR, não AND
Quando a vaga lista várias tecnologias numa frase (ex: "PHP, Python, Node.js, Ruby"), interpretar como OR — conhecer qualquer uma qualifica. Só tratar como AND se a vaga descrever uso simultâneo explícito.

### Conhecimento acadêmico e projetos pessoais são válidos
Marcar como gap **apenas** quando a vaga exige explicitamente "experiência profissional". Se a vaga diz "conhecimento", "noções", "familiaridade" ou simplesmente lista uma tecnologia sem qualificar, projetos pessoais e estudos contam como cobertura.

**Exceção — termo "experiência":** Quando a vaga usa a palavra "experiência" (ou "experience") isolada, sem adjetivo, pressupor **sempre** experiência profissional. Acadêmico e projetos pessoais **não** cobrem requisitos com esse termo.

### Nunca assumir gap sem perguntar (Passo 1)
Para toda tecnologia não documentada no CV base presente na vaga, perguntar ao candidato antes de gerar o fit. Nunca assumir ausência de conhecimento.

### Interesse declarado conta
Se a vaga pede "interesse em X" ou "vontade de aprender X", interesse declarado pelo candidato cobre o requisito.

### Score e fit devem ser consistentes
Sempre que qualquer campo do fit for revisado (positivos, negativos, summary), o score também deve ser atualizado para refletir a nova análise.

### Sem negativos = score 10
Se `negativos` é vazio (todos os requisitos obrigatórios atendidos), o score deve ser **10**. Score 9 implica ao menos um gap menor.

### Frameworks similares cobrem requisito sem exigência profissional
Conhecimento acadêmico/pessoal em frameworks similares ao requisito (ex: Angular quando a vaga pede React, Redis quando pede Kafka em contexto de mensageria) é válido quando a vaga não exige explicitamente experiência profissional na tech específica. Só marcar como gap se a alternativa for fundamentalmente diferente e sem equivalência funcional.

### Lista de tech ou similares
Quando é requisito um conceito, indicado uma lista de tecnologias ou similares, se o candidato tem experiência com pelo menos uma das tecnologias listadas ou similares, o requisito é atendido. 
Exemplo 1: "Experiência com bancos de dados relacionais (PostgreSQL, SQL Server ou similares)" — experiência profissional com MySQL cobre o requisito mesmo sem PostgreSQL ou SQL Server.
Exemplo 2: "Containerização (Docker, Kubernetes, etc.)" — experiência profissional com Docker cobre o requisito mesmo sem Kubernetes, desde que "etc." esteja presente.

### Overqualified não é gap
Nunca listar "overqualified", "desalinhamento de nível salarial", "candidato é sênior para vaga júnior" nos negativos. Isso é irrelevante para análise de fit técnico.

### Vagas sem stack específica
Quando os requisitos são genéricos ("domínio de uma ou mais linguagens", "frameworks modernos") sem especificar linguagem ou framework, **não criar gaps** baseados em "o time pode usar X e você não sabe X". Analisar apenas o que está explicitamente requerido. Se não há stack específica, analisar só soft skills e requisitos gerais.

### Tech stack ≠ Requisitos de experiência
Seções chamadas "Tech stack", "Nossa stack", "Stack atual", "Technologies we use" descrevem o que a EMPRESA usa — não o que o candidato precisa trazer. Criar gaps apenas a partir de seções explicitamente de requisitos ("Requirements", "Requisitos", "What we expect", "O que esperamos").

### Lista de gaps e pontos positivos
- A soma de pontos positivos e gaps devem ser igual a 10. Exemplos: 
  - 7 pontos positivos e 3 gaps ou;
  - 10 pontos positivos ou;
  - 5 gaps ou
  - 3 gaps e 5 pontos positivos.

## Estrutura do fit no `src/json/jobs-data.js`

```js
fit = {
  score: 9,                          // 0–10, baseado nos requisitos obrigatórios
  positivos: ["ponto 1", "..."],     // requisitos claramente atendidos
  negativos: ["gap 1", "..."],       // requisitos obrigatórios não atendidos
  summary: "Resumo em 1-2 frases."
}
```

## Campos `modalidade`, `cidadeVaga` e `contratacao`

Ao processar cada vaga, **sempre** inclua os seguintes campos na raiz da entrada:

- `modalidade`: `"Remoto"`, `"Presencial"` ou `"Híbrida"` — extraído do bloco da vaga em `vagas.txt`
- `cidadeVaga`: cidade/UF onde a vaga está localizada (ex: `"São Paulo, SP"`) — **obrigatório** quando `modalidade` for `"Presencial"` ou `"Híbrida"`; omitir ou deixar `""` quando for `"Remoto"`
- `contratacao`: `"CLT"`, `"PJ"` ou `"CLT/PJ"` — extraído do bloco da vaga em `vagas.txt` quando houver menção explícita ao tipo de contratação. **Omitir o campo** se não houver informação clara.

Esses campos são usados pelo dashboard `index.html` para exibir informações da vaga e pelos templates `src/pages/cv.html` e `src/pages/cl.html` para exibir avisos quando a vaga é presencial/híbrida em cidade diferente da localização do candidato.

## Campo `candidatura`

Ao processar cada vaga, verifique se há instrução explícita de candidatura por e-mail.

- **Se candidatura é por e-mail:** inclua o campo `candidatura` com `aviso` (texto legível) e `email` (mailto: link)
- **Se candidatura é por link/formulário externo:** **omita o campo `candidatura`** completamente
- **Se não houver instrução explícita:** **omita o campo `candidatura`** completamente

Exemplos:
```js
// e-mail direto — USAR CAMPO candidatura
candidatura = { aviso: "Candidatura é feito pelo e-mail vaga@empresa.com", email: "mailto:vaga@empresa.com" }
```

## Saída

- Escreva o fit diretamente em `src/json/jobs-data.js`, com `cv.authorized: false` e `cl.authorized: false`
- Sempre incluir `vagaTexto` com o **texto integral e verbatim da vaga** — copie palavra por palavra do `vagas.txt`, sem resumir, parafrasear ou omitir nenhuma seção. NUNCA RESUMA.
- **Não exiba os fits no chat** — o usuário os lê abrindo `index.html`
- Ao terminar, apenas diga: "Fits gerados. Abra http://localhost:3001/index.html para revisar."

## Ao terminar correções de fit

Ao final, siga o protocolo de "Fim do fluxo" em `AGENTS.md`:
- Se o usuário revelou habilidades novas → proponha adição ao `ai/skills/cv-base/SKILL.md`
- Se o usuário identificou erros recorrentes → proponha regra nova neste arquivo
- **Nunca altere `ai/skills/cv-base/SKILL.md` sem autorização explícita**

# Testes
- Aqui será definido os detalhes dos destes para esse agente
- Após gerar todos os fits, rode os testes definidos em `test/fit.test.js` para consultar a qualidade do fit gerado.
- Rode os testes com `JOB_ID=${fit.id} npm test -- test/fit.test.js`. Exemplo `JOB_ID=empresa-xpto npm test -- test/fit.test.js`
- A tabela abaixo tem o mapeamento de quais regras foram infringidas para cada teste:
  
  | Teste                | Regra infrigida                                      |
  |----------------------|------------------------------------------------------|
  | Score entre 0 e 10   | [Fórmula do gap](#fórmula-do-gap) Regra 1            |
  | Sem gaps = score 10  | [Sem negativos = score 10](#sem-negativos--score-10) |
