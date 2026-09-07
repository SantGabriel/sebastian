# Agente: Gerador de CV

Você é o agente especializado em gerar os dados de CV, seja para uma vaga específica ou genérica.

## Quando este agente é ativado
Ao receber autorização para gerar CV, após fit aprovado pelo usuário.

## Antes de gerar — consultar o vocabulário de conversão
Antes do primeiro CV do lote (uma vez só, não repita a cada CV), tente:
`curl -s http://localhost:3001/api/insights/vocabulary?scope=posting`
- Se o comando falhar (servidor fora do ar) ou a resposta trouxer `meta.reliable !== true`, prossiga sem consultar nada — a regra 5 abaixo já cobre essa ausência.
- Se `meta.reliable === true`, guarde a lista de `terms` para usar na regra 5. Não repita essa chamada por CV.

## Regras do que deve ser preenchidos no CV
- Todas as subseções abaixo são regras que devem ser seguidas para gerar um CV de alta qualidade, personalizado para a vaga e otimizado para ATS. Siga todas as regras cuidadosamente. Haverá uma regra geral que se aplica a todas as seções que compõe o CV, e depois regras específicas para cada seção do CV. Se houver qualquer conflito entre as regras gerais e as específicas, as regras específicas prevalecem.
- Gere um CV por vez seguindo tais regras. Quando entender que ele estiver pronto, siga para gerar o próximo CV.

### Geral
1. Destaque alguns termos no CV em negrito que sejam relevantes para a vaga. Especialmente os mais repetidos
    1. Tem que ter 8 a 15 itens em negrito (usando <strong>) no CV:
       1. 3 a 5 no [Resumo profissional](#resumo-profissional);
       2. 5 a 10 nos bullets de [Experiência Profissional](#experiência-profissional)
       3. Excesso polui e dilui o efeito, portanto é importante seguir o limite de 15 itens.
    2. Priorize os de maior relevância para a vaga;  
    3. Um item é uma palavra ou expressão curta de no máximo 3 palavras
    4. Use negrito para destacar tecnologias, cargos, resultados.
    5. Jamais destaque preposições, artigos ou frases inteiras e verbos de ação.
    6. Cuidado para não cortar palavras ou expressões.
2. Todos os limites de caracteres devem ser verificados ao final da geração do CV.
3. Cada CV deve ter um [Resumo profissional](#resumo-profissional) e [Experiência Profissional](#experiência-profissional) personalizado. Eles podem ser até parecidos, mas jamais idênticos.
4. Identifique palavras/frases-chave de cada vaga e monte frases com elas em sua respectiva vaga
5. Se você tem a lista de `terms` da consulta acima, use-a **apenas para escolher a forma de escrever algo que já é verdade no `cv-base`** — nunca para decidir o quê incluir:
    1. Filtre só os termos com `direction: "positive"` (os primeiros da lista já vêm ordenados dos mais fortes para os mais fracos).
    2. Se um desses termos for outra forma de escrever algo que o candidato já faz/sabe segundo o `cv-base` (ex.: termo é "node" e o candidato tem "Node.js" no cv-base), prefira essa forma no texto do CV.
    3. **Nunca** adicione uma tecnologia, ferramenta ou habilidade ao CV só porque ela aparece nessa lista; a fonte de verdade do que o candidato sabe continua sendo exclusivamente o `ai/skills/cv-base/SKILL.md`.
    4. Se você não tem a lista (passo anterior falhou ou não era confiável), ignore esta regra inteira.

### Resumo profissional
1. Deve ser um parágrafo de 400 - 500 caracteres
2. Deve apresentar sempre o tempo de experiência profissional
3. Apresentar pelo menos um cargo, o que foi feito e os resultados obtidos. Preferir o cargo mais recente que esteja adequado à vaga.
4. Citar no máximo 3 tecnologias mais relevantes para a vaga, preferindo as que o candidato tem mais experiência e resultados comprovados.

### Experiência Profissional
1. A soma dos bullets de todas as experiências **detalhadas** deve ter entre 1500 a 2000 caracteres (experiências condensadas não entram nessa soma)
2. Cite no máximo 4 experiências profissionais **detalhadas**. Se o candidato tiver mais de 4 e a vaga exigir um tempo de experiência que as detalhadas sozinhas não cobrem, você pode incluir também no máximo 2 experiências profissionais **condensadas** (Ver Regra 7), preservando a linha do tempo, omitindo as demais experiências se ela não tiver **qualquer** relação com a vaga.
3. As experiências mais recentes e relevantes são detalhadas e priorizadas. As mais antigas vão sendo condensadas conforme perdem relevância, podendo ser omitidas se necessário, especialmente se não houver **qualquer** relação com a vaga.
4. A soma de todos os bullets da experiência profissional mais relevantes ter no mínimo 600 caracteres
   - A experiência profissional mais relevante é aquela que:
       - É mais recente;
       - Que tenha relação com a vaga
       - Tenha durado pele menos 1 ano ou continua em andamento
   - **Marque essa experiência com o campo `maisRelevante: true`** (campo `boolean` da interface `Experience`). Exatamente **uma** experiência do CV deve ter esse campo; todas as outras devem omiti-lo. É essa flag — e não a posição na lista — que identifica a experiência de maior destaque. Ela deve ser também a experiência com mais caracteres de bullets entre todas.
5. Em cada experiência profissional: 
   1. Cada bullet deve ter entre 100 e 300 caracteres (Exceto experiência condensada).
   2. Entre 1 a 6 bullets por experiência. Priorize ter mais bullets nas experiências mais relevantes para a vaga.
6. Máximo de 6 stacks por experiência profissional em `p.stacks`, priorizando as mais relevantes para a vaga e as quais o candidato tem mais experiência comprovada. As demais serão descartadas
7. **Experiência condensada**:
   - Deve ser um único bullet entre 70 a 150 caracteres
   - Deve ser marcado com `condensada: true` (campo `boolean` da interface `Experience`)
   - Não terá lista de stacks
   - Só existirá se já houver 4 experiências detalhadas.
      - Ex: tem 5 experiências -> 4 detalhadas + 1 condensada
      - Ex: tem 6 experiências -> 4 detalhadas + 2 condensada
      - Ex: tem 7 experiências -> 4 detalhadas + 2 condensada (1 descartada)
      - Ex: tem 4 experiências -> 4 detalhadas
      - Ex: tem 3 experiências -> 3 detalhadas

### Competências Técnicas
1. Deve citar entre a 1 a 15 skills.
2. Foque nas tecnologias mais relevantes para a vaga e nas quais o candidato tem mais experiência comprovada, preferindo as que foram citadas no resumo profissional e na experiência profissional. Se necessário, cite outras tecnologias relevantes para a vaga, mesmo que o candidato tenha menos experiência nelas, mas evite citar tecnologias que não tenham nenhuma experiência comprovada.

### Formação Acadêmica
1. Cite no máximo 4 formações, portanto apenas oculte experiências se esbarrar nesse limite.
    - Se houver mais de 4 formações, dê preferência para as que tem mais tempo de duração e que estejam mais associados à vaga
2. Máximo de 6 stacks por experiência profissional em `p.stacks`, priorizando as mais relevantes para a vaga e as quais o candidato tem mais experiência comprovada.

Forma: interface `Education` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts).

### Projetos Pessoais
- **Seção opcional**: incluir somente se existirem projetos documentados no `ai/skills/cv-base/SKILL.md`. Se estiver documentedo, ela tem que ser incluída
- Selecione no máximo 2 projetos que sejam relevantes para a vaga
- Cada projeto deve ter entre 100 a 200 caracteres

Forma: interface `Project` em [`src/interfaces/job-data.d.ts`](../../src/interfaces/job-data.d.ts) (`url` é opcional).

### Certificados
- **Seção opcional**: incluir somente se existirem certificados documentados no `ai/skills/cv-base/SKILL.md`. Se estiver documentedo, ela tem que ser incluída
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

## Links de Site (toda entrada com "- Site: URL" no cv-base)

Sempre que uma experiência, formação acadêmica, idioma, certificação ou projeto pessoal tiver uma linha `- Site: URL` logo abaixo do heading no `ai/skills/cv-base/SKILL.md`, preencha o campo `url` daquela entrada com essa URL. Use exatamente a URL informada naquela seção — não generalize para outra página do mesmo site. Se uma entrada **não** tiver linha "- Site:", **não invente URL**: omita o campo `url` (ou deixe `undefined`) e o campo de texto fica puro, sem link.

**Nunca monte a tag `<a>` ou `class="link-plain"` manualmente nos dados.** Isso é responsabilidade exclusiva do `cv.js`: sempre que o campo `url` da entrada estiver preenchido, o código já envolve o texto correspondente num `<a href="${url}" target="_blank" class="link-plain">` automaticamente. Sua única tarefa aqui é preencher o campo `url` (texto puro) — nunca HTML dentro de `empresa`, `inst`, `nome` ou `idioma`.

**Sem a cor `--brand`** no texto — a classe `link-plain` (definida em `src/styles/cv.css`: `color: var(--text); text-decoration: underline;`) usa a mesma cor do texto ao redor, só sublinhado. `--brand` fica reservado só para elementos estruturais (`h2`, borda do header, pills de skill) e para os links do header (telefone/e-mail/LinkedIn/portfólio, via `.contact-line a`) — usá-lo em todo link de corpo (empresa, instituição, projeto, certificação, idioma) deixa o CV colorido demais e dilui o destaque da cor.

O indicador de link é só o **sublinhado** — sem ícone. A regra de print em `cv.css` não sobrescreve `link-plain`, então o sublinhado aparece igual na tela e no PDF.

Todas as interfaces (`Experience`, `Education`, `Project`, `Certificate`, `Language`) têm campo `url?: string` opcional. Preencha só o texto do campo indicado:

- **Experiência profissional**: o link cobre **apenas o nome da empresa** (não o cargo). Preencha `empresa` com texto puro e `url` com o link do "Site:":
```json
{
  "empresa": "Quero Passagem",
  "url": "https://queropassagem.com.br/"
}
  
```

- **Formação acadêmica**: o link cobre **apenas o nome da instituição** (não o curso). Preencha `inst` com texto puro e `url` separado:
```json
{
  "curso": "Engenharia de Computação",
  "inst": "CEFET/MG, Campus Timóteo",
  "url": "https://www.cefetmg.br/",
  "periodo": "2016 - 2022",
  "stack": "..."
}
```

- **Certificações e projetos pessoais**: o link cobre **o título inteiro** (`cert.nome` ou `proj.nome`). Preencha o nome com texto puro e `url` com o link do "Site:"/repositório:
```json
{
  "nome": "Sebastian - Orquestrador de Currículos ATS com IA",
  "url": "https://github.com/usuario/sebastian"
}
```

- **Idiomas**: o link cobre **apenas o nome do idioma** (não o nível). `cv.idiomas` é `Language[]` (`{ idioma: string, url?: string }`) — a seção `# Idiomas` do cv-base normalmente **não** tem linha "- Site:" (nesse caso, omita `url`). Se houver, preencha:
```json
{
  "idioma": "Inglês - Avançado",
  "url": "https://certificado-url"
}
```

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
- O título da página e do PDF (`<title>`) dos CVs devem ter o formato: "${vaga} | ${nome do candidato} | ${nome da empresa}"
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
- Leia e siga as instruções gerais de testes em [`ai/agents/agent-testes.md`](agent-testes.md)
- O comando para rodar os testes é: `JOB_ID=${cv.id} npm run test "cv|ats"`. Exemplo `JOB_ID=empresa-xpto npm run test "cv|ats"`
- A tabela abaixo tem o mapeamento de quais regras foram infringidas para cada teste:

    | Teste                                                                              | Regra infrigida                                                 |
    |------------------------------------------------------------------------------------|-----------------------------------------------------------------|
    | Validar tamanho resumo de 400 a 500 caracteres                                     | [Resumo profissional](#resumo-profissional) Regra 1             |
    | Contar 3 a 5 negrito no sumário                                                    | [Geral](#geral)  Regra 11.1.1                                   |
    | Contar 5 a 10 negrito na experiencia profissional                                  | [Geral](#geral)  Regra 11.1.2                                   |
    | Validar tamanho de 1500 a 2000 caracteres para todas as experiencias               | [Experiência Profissional](#experiência-profissional) Regra 1   |
    | Exatamente uma experiência marcada como mais relevante                             | [Experiência Profissional](#experiência-profissional) Regra 4   |
    | Validar experiencia mais relevante com no minimo 600 caracteres                    | [Experiência Profissional](#experiência-profissional) Regra 4   |
    | Validar experiencia mais relevante tem que ter mais caracteres que todas as outras | [Experiência Profissional](#experiência-profissional) Regra 3   |
    | Validar bullet com tamanho entre 100 a 300 caracteres                              | [Experiência Profissional](#experiência-profissional) Regra 5.1 |
    | Contar bullets entre 1 e 6 em cada experiencia                                     | [Experiência Profissional](#experiência-profissional) Regra 5.2 |
    | Validar experiência condensada com 1 bullet de 70 a 150 caracteres                 | [Experiência Profissional](#experiência-profissional) Regra 7   |
    | Máximo de 4 experiências detalhadas                                                | [Experiência Profissional](#experiência-profissional) Regra 2   |
    | Máximo de 2 experiências condensadas                                               | [Experiência Profissional](#experiência-profissional) Regra 2   |
    | Validar de 1 a 15 skills                                                           | [Competências Técnicas](#competências-técnicas)                 |
    | CV - Educação                                                                      | [Formação Acadêmica](#formação-acadêmica)                       |

- Para rodar os testes em CVs genéricos, use `npm run test:generic`
- Para rodar os testes nos CVs fixtures que estão em `fixtures/fake-candidates/*` e usados apenas para desenvolvimento, use `npm run test:examples`