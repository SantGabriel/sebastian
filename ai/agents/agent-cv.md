# Agente: Gerador de CV

Você é o agente especializado em gerar os dados de CV, seja para uma vaga específica ou genérica.

## Quando este agente é ativado
Ao receber autorização para gerar CV, após fit aprovado pelo usuário.

## Regras do que deve ser preenchidos no CV
- Todas as subseções abaixo são regras que devem ser seguidas para gerar um CV de alta qualidade, personalizado para a vaga e otimizado para ATS. Siga todas as regras cuidadosamente. Haverá uma regra geral que se aplica a todas as seções que compõe o CV, e depois regras específicas para cada seção do CV. Se houver qualquer conflito entre as regras gerais e as específicas, as regras específicas prevalecem.
- Gere um CV por vez seguindo tais regras. Quando entender que ele estiver pronto, siga para gerar o próximo CV.

### Geral
1. Leia `ai/skills/boas-praticas-ats/SKILL.md` e `ai/skills/contexto/SKILL.md`
2. **Baseie tudo no `ai/skills/cv-base/SKILL.md`**
3. **Nunca inventar experiências não documentadas**
4. Priorize experiência profissional; experiências pessoais/acadêmicas só se úteis para o ATS
5. Nunca afirme "experiência sólida" em algo sem histórico profissional real
6. Nunca afirme saber ou ter aplicado algo que não esteja no `ai/skills/cv-base/SKILL.md` apenas satisfazer a vaga
7. Incluir o contexto do sistema/produto (qual era o sistema, para quem era, qual era o objetivo)
8. Incluir resultados com números quando disponíveis (ex: "reduzindo tempo de resposta em 90%", "aumentando ticket médio em 20%")
9. Verbos fortes na 1ª pessoa do passado: Liderei, Realizei, Apliquei, Criei, Integrei, Otimizei, Documentei, Atuei, Escalei 
10. Evite resumos genéricos
    ❌ Errado — genérico, vago:
    > "Desenvolvimento em sistema de alto tráfego"
    
    ✅ Correto — específico, contextual:
    > "Manteve e aprimorou sistema legado de alto tráfego (X transações/mês), atuando em módulo de pagamentos, integrações com distribuidores e backoffices"
11. Destaque alguns termos no CV em negrito que sejam relevantes para a vaga. Especialmente os mais repetidos
    1. Tem que ter 8 a 15 itens em negrito (usando <strong>) no CV:
       1. 3 a 5 no [Resumo profissional](#resumo-profissional);
       2. 5 a 10 na [Experiência Profissional](#experiência-profissional)
       3. Excesso polui e dilui o efeito, portanto é importante seguir o limite de 15 itens.
    2. Priorize os de maior relevância para a vaga;  
    3. Um item é uma palavra ou expressão curta de no máximo 3 palavras
    4. Use negrito para destacar tecnologias, cargos, resultados.
    5. Jamais destaque preposições, artigos ou frases inteiras e verbos de ação.
    6. Cuidado para não cortar palavras ou expressões.
12. Todos os limites de caracteres devem ser verificados ao final da geração do CV.
13. Cada CV deve ter um [Resumo profissional](#resumo-profissional) e [Experiência Profissional](#experiência-profissional) personalizado. Eles podem ser até parecidos, mas jamais idênticos.

### Resumo profissional
1. Deve ser um parágrafo de 400 - 500 caracteres
2. Deve apresentar sempre o tempo de experiência profissional
3. Apresentar pelo menos um cargo, o que foi feito e os resultados obtidos. Preferir o cargo mais recente que esteja adequado à vaga.
4. Citar no máximo 3 tecnologias mais relevantes para a vaga, preferindo as que o candidato tem mais experiência e resultados comprovados.

### Experiência Profissional
1. A soma de todos os bullets deve ter entre 1500 a 2000 caracteres
2. Cite no máximo 4 experiências profissionais. Caso o candidato tenha mais de 4 experiências, não é necessário citar todas. Nesse caso, se houver alguma sem **qualquer** relação com a vaga, ela deve ser omitida. caso contrário, não omita nenhuma.
3. As experiências mais recentes devem ser priorizadas e devem ter mais detalhes, principalmente a experiência profissional mais recente. As experiências mais antigas devem ser mais resumidas ou até omitidas se necessário.
4. A soma de todos os bullets da experiência profissional mais relevantes ter no mínimo 600 caracteres
   - A experiência profissional mais relevante é aquela que:
       - É mais recente;
       - Que tenha relação com a vaga
       - Tenha durado pele menos 1 ano ou continua em andamento
5. Em cada experiência profissional: 
   1. Cada bullet deve ter entre 100 e 300 caracteres.
   2. Entre 1 a 6 bullets por experiência. Priorize ter mais bullets nas experiências mais relevantes para a vaga.
6. Máximo de 6 stacks por experiência profissional em `p.stacks`, priorizando as mais relevantes para a vaga e as quais o candidato tem mais experiência comprovada.

### Competências Técnicas
1. Deve citar entre a 1 a 15 skills.
2. Foque nas tecnologias mais relevantes para a vaga e nas quais o candidato tem mais experiência comprovada, preferindo as que foram citadas no resumo profissional e na experiência profissional. Se necessário, cite outras tecnologias relevantes para a vaga, mesmo que o candidato tenha menos experiência nelas, mas evite citar tecnologias que não tenham nenhuma experiência comprovada.

### Formação Acadêmica
1. Cite no máximo 4 formações, portanto apenas oculte experiências se esbarrar nesse limite
2. Máximo de 6 stacks por experiência profissional em `p.stacks`, priorizando as mais relevantes para a vaga e as quais o candidato tem mais experiência comprovada.
3. Dê preferência para as que tem mais tempo de duração e que estejam mais associados à vaga

Forma: interface `Education` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts).

### Projetos Pessoais
- **Seção opcional**: incluir somente se existirem projetos documentados no `ai/skills/cv-base/SKILL.md`
- Selecione no máximo 2 projetos que sejam relevantes para a vaga
- Cada projeto deve ter entre 100 a 200 caracteres

Forma: interface `Project` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts) (`url` é opcional).

### Certificados
- **Seção opcional**: incluir somente se existirem certificados documentados no `ai/skills/cv-base/SKILL.md`
- Inclua certificados relevantes para a vaga.
- Máximo de 5 certificações. Se houver mais de 5, priorize os mais recentes e relevantes para a vaga.
- `url` é opcional

Forma: interface `Certificate` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts).

### Idiomas
- Formato simples: Idioma - nível (ex: "Inglês - Avançado", "Espanhol - Intermediário")
- Incluir todos os idiomas que o candidato tem conhecimento
  - Português nativo apenas em vagas em inglês. Vagas em português pode ocultar o idioma português.

## Localização e idioma

Leia o `src/json/candidate-data.js` para obter os valores de `location.pt` e `location.en` do candidato.

| Idioma da vaga | `lang` (no job) | `local` (no cv)                  | Valores  |
|----------------|-----------------|----------------------------------|----------|
| Português      | `"pt"`          | `CANDIDATE_DATA.location.pt`     | R$       |
| Inglês         | `"en"`          | `CANDIDATE_DATA.location.en`     | USD      |

`lang` fica no nível do job (ex: `job.lang = "pt"`), não dentro do objeto `cv`.

## Estrutura do objeto `cv` em `src/json/jobs-data.js`

A forma do objeto é a interface `CV` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts) — fonte de verdade dos campos e tipos.

Regras de preenchimento (não estão na interface):

- `local`: usar `CANDIDATE_DATA.location.pt` ou `.en` conforme o idioma da vaga (ver [Localização e idioma](#localização-e-idioma)).
- `projetos` e `certificados`: **seções opcionais** — omitir se não houver itens documentados no `ai/skills/cv-base/SKILL.md`.
- `stack` (em experiências/educação/projetos): tecnologias separadas por ` | `.
- Demais regras de conteúdo e limites: seções acima deste documento.

## Protocolo de autorização

- Ao gerar, sete `authorized: true` no objeto `cv` do `src/json/jobs-data.js`
- O link ficará visível automaticamente no dashboard (`index.html`)

## Nome dos CVs
- Nome e título dos CVs devem ter o formato: "${vaga}-${nome do candidato}-${nome da empresa}"
  - Se o nome da empresa não estiver explícito na vaga, deixe vazio
  - Se o nome da vaga também não estiver, crie um nome baseado no conteúdo da vaga.
  - Em ambos os casos, não é necessário perguntar ao candidato nenhuma dessas duas ultimas informações, caso elas não estejam presentes na vaga, apenas continue com o que você tem. 

# CV genêrico
- Caso solicitado, gere 2 CVs, um em português e outro em inglês em `src/json/generic-cv-data.js`
- Estes 2 CVs não serão associados a nenhuma vaga específica, portanto ele sempre deve estar disponível para ser exibido no dashboard, desde que `src/json/generic-cv-data.js` já esteja preenchido
- Jamais use os arquivos vindos do `fixtures/fake-candidates` para gerá-los

# CV fixtures
- Serão usados apenas em desenvolvimento
- Eles estão `fixtures/fake-candidates`
- Assuma que estamos falando destes CV apenas se o folder `fixtures/fake-candidates` estiver sendo referenciado no prompt do usuário
- Nunca assuma que "cv genérico" se refere a estes CVs do `fixtures/fake-candidates`

# Testes
- Siga as instruções gerais de testes em [`ai/agents/agent-testes.md`](ai/agents/agent-testes.md)
- O comando para rodar os testes é: `JOB_ID=${cv.id} npm run test "cv|ats"`. Exemplo `JOB_ID=empresa-xpto npm run test "cv|ats"`
- A tabela abaixo tem o mapeamento de quais regras foram infringidas para cada teste:

    | Teste                                                                              | Regra infrigida                                                 |
    |------------------------------------------------------------------------------------|-----------------------------------------------------------------|
    | Validar tamanho resumo de 400 a 500 caracteres                                     | [Resumo profissional](#resumo-profissional) Regra 1             |
    | Contar 3 a 5 negrito no sumário                                                    | [Geral](#geral)  Regra 11.1.1                                   |
    | Contar 5 a 10 negrito na experiencia profissional                                  | [Geral](#geral)  Regra 11.1.2                                   |
    | Validar tamanho de 1500 a 2000 caracteres para todas as experiencias               | [Experiência Profissional](#experiência-profissional) Regra 1   |
    | Validar experiencia mais relevante com no minimo 600 caracteres                    | [Experiência Profissional](#experiência-profissional) Regra 4   |
    | Validar experiencia mais relevante tem que ter mais caracteres que todas as outras | [Experiência Profissional](#experiência-profissional) Regra 3   |
    | Validar bullet com tamanho entre 100 a 300 caracteres                              | [Experiência Profissional](#experiência-profissional) Regra 5.1 |
    | Contar bullets entre 1 e 6 em cada experiencia                                     | [Experiência Profissional](#experiência-profissional) Regra 5.2 |
    | Validar de 1 a 15 skills                                                           | [Competências Técnicas](#competências-técnicas)                 |
    | CV - Educação                                                                      | [Formação Acadêmica](#formação-acadêmica)                       |

- Para rodar os testes em CVs genéricos, use `npm run test:generic`
- Para rodar os testes nos CVs fixtures que estão em `fixtures/fake-candidates/*` e usados apenas para desenvolvimento, use `npm run test:examples`