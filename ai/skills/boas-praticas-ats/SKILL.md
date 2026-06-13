---
name: boas-praticas-ats
description: Regras para otimização de currículos em sistemas ATS
---

# Regras ATS

## Caracteres Permitidos
- Acentuacao portuguesa: ã, ê, ç, ó, ú, etc. → ATS modernos suportam UTF-8. Não normalize para ASCII.
- Hifen simples: -
- Barra: /
- Pipe: |

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
- Após geração de todos os CL/CV, rode os testes definidos em `test/ats.test.js` para consultar a qualidade do documento gerado.
- Os testes são métricas consultivas, não são metas a serem seguidas, portanto, passar em todos os testes não implicam em um documento perfeito.
- Os testes abrangem apenas algumas das regras quantitativas, portanto mesmo que o documento passe em todos os testes, ele ainda pode ter problemas de qualidade que não são capturados pelos testes.
- Você deve rodar os testes apenas uma vez. Jamais fique em loop tentando corrigir o documento e rodar os testes várias vezes.
- Você não deve informar ao usuário final sobre os resultados dos testes. Faça tudo em modo silent.
- Rode os testes com `JOB_ID=${cl.id} npm test -- test/ats.test.js`. Exemplo `JOB_ID=empresa-xpto npm test -- test/ats.test.js`
- Você pode gerar outros bash para testar outras regras, porém eles não devem ser persistidos.
- Você não deve informar ao usuário final sobre os resultados dos testes. Faça tudo em modo silent.

| Teste                               | Regra infrigida                                                                                 |
|-------------------------------------|-------------------------------------------------------------------------------------------------|
| Caracteres proibidos                | [Caracteres Proibidos (quebram parsing do ATS)](#caracteres-proibidos-quebram-parsing-do-ats-)  |
| Termos em Português sem acentuação  | [Caracteres Permitidos](#caracteres-permitidos)                                                 |

