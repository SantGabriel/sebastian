---
name: boas-praticas-ats
description: Regras para otimização de currículos em sistemas ATS
---

# Regras ATS
As regras serão aplicadas tanto para CVs quanto para os CLs.

## Caracteres Permitidos
- Acentuação portuguesa: ã, ê, ç, ó, ú, etc. → ATS modernos suportam UTF-8. Não normalize para ASCII.
- Hifen simples: -
- Barra: /
- Pipe: |

### Substituição de caracteres (acentos, etc.)
- Nunca substituir caracteres acentuados em **nomes de atributos/propriedades** de objetos JSON ou interfaces TypeScript.                                                                                                       
- Os atributos são mantidos **sem acento** por convenção (ex: `descricao`, `experiencias`, `educacao`, `contratacao`).                                
- Substituições de acentos devem atingir **apenas valores de string**, usando contextos que excluam chaves de objeto (ex: NUNCA rodar comandos de terminal para substituir como `sed`. Crie um script para isso).

## Caracteres Proibidos (quebram parsing do ATS). 
- Emojis: 📍 ✉️ 🔗 🇧🇷 🇬🇧 🇩🇪 etc => Substituir por ícones do Font Awesome ou texto puro
- Dash: en-dash (–) e em-dash (—) => Usar apenas o hífen simples (-)
- Setas: → => Usar "->" ou apenas "-"
- Ponto mediano: · => usar "|" ou "-"

## Datas
- Não abreviar meses: "Mai/2024" → "Maio 2024"
- Não usar tracos especiais entre datas: "Mai/2024 – Jul/2025" → "Maio 2024 - Julho 2025"
- Anos sozinhos são aceitos: "2016 - 2022"

## Icones no HTML
- Importar Font Awesome via CDN para usar icones sem emojis:
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  ```
- Exemplos de substituicao:
  - 📍 → `<i class="fa-solid fa-location-dot"></i>`
  - ✉️ → `<i class="fa-solid fa-envelope"></i>`
  - 🔗 LinkedIn → `<i class="fa-brands fa-linkedin"></i>`

## CSS e estilos
- O ATS le o texto bruto do HTML, ignorando CSS
- Cores, bordas, fontes e layouts nao interferem na leitura
- O que importa e a estrutura semantica: h1, h2, h3, ul, li, p

## Idioma e moeda
- Entender em que idioma está a vaga (inglês ou português)
- Se a vaga é em português, citar valores apenas em R$; caso contrário, em USD

# Testes
- Aqui será definido os detalhes dos destes para esse agente
- Após geração de todos os CL/CV, rode os testes definidos em `test/ats.test.js` para consultar a qualidade do documento gerado.
- Rode os testes com `JOB_ID=${cl.id} npm test -- test/ats.test.js`. Exemplo `JOB_ID=empresa-xpto npm test -- test/ats.test.js`
- A tabela abaixo tem o mapeamento de quais regras foram infringidas para cada teste:

| Teste                               | Regra infrigida                                                                                 |
|-------------------------------------|-------------------------------------------------------------------------------------------------|
| Caracteres proibidos                | [Caracteres Proibidos (quebram parsing do ATS)](#caracteres-proibidos-quebram-parsing-do-ats-)  |
| Termos em Português sem acentuação  | [Caracteres Permitidos](#caracteres-permitidos)                                                 |

