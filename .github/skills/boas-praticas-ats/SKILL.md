---
name: boas-praticas-ats
description: Boas práticas genéricas para otimização de currículos em sistemas ATS
---

# Boas Práticas ATS — Genéricas

## Caracteres permitidos e proibidos

### Permitidos
- Acentuacao portuguesa: ã, ê, ç, ó, ú, etc. → ATS modernos suportam UTF-8
- Hifen simples: -
- Barra: /
- Pipe: |

### Proibidos (quebram parsing do ATS)
- Emojis: 📍 ✉️ 🔗 🇧🇷 🇬🇧 🇩🇪 etc. → substituir por icones do Font Awesome ou texto puro
- Tracos especiais: en-dash (–) e em-dash (—) → usar apenas o hifen simples (-)
- Setas: → → usar "->" ou apenas "-"
- Ponto mediano: · → usar "|" ou "-"

## Datas
- Nao abreviar meses: "Mai/2024" → "Maio 2024"
- Nao usar tracos especiais entre datas: "Mai/2024 – Jul/2025" → "Maio 2024 - Julho 2025"
- Anos sozinhos sao aceitos: "2016 - 2022"

## Icones no HTML
- Importar Font Awesome via CDN para usar icones sem emojis:
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  ```
- Exemplos de substituicao:
  - 📍 → `<i class="fa-solid fa-location-dot"></i>`
  - ✉️ → `<i class="fa-solid fa-envelope"></i>`
  - 🔗 LinkedIn → `<i class="fa-brands fa-linkedin"></i>`

## Secao de Educacao
- ATS nao pontua nota, monitoria, TCC ou disciplinas cursadas
- Incluir apenas: curso, instituicao e periodo
- Detalhes academicos extras so se forem diferenciais claros para a vaga

## Localizacao / Remoto
- Nao misturar cidade e modalidade no mesmo campo
- Separar cidade em um elemento e disponibilidade remoto em outro

## CSS e estilos
- O ATS le o texto bruto do HTML, ignorando CSS
- Cores, bordas, fontes e layouts nao interferem na leitura
- O que importa e a estrutura semantica: h1, h2, h3, ul, li, p

## Idioma e moeda
- Entender em que idioma está a vaga (inglês ou português)
- Se a vaga é em português, citar valores apenas em R$; caso contrário, em USD