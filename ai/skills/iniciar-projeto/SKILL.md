---
name: iniciar-projeto
description: Aqui vamos iniciar o projeto com os dados básicos do candidato como nome, contato e endereço
---

# Gatilho
Inicie essa skill se o [candidate-data.js](../../../src/json/candidate-data.js) não existir ou estiver vazio.

Se o arquivo não existir ou estiver vazio, rode os comandos abaixo:
```bash
cp src/json/candidate-data.js.example src/json/candidate-data.js
cp src/json/generic-cv-data.js.example src/json/generic-cv-data.js
cp src/json/jobs-data.js.example src/json/jobs-data.js
cp vagas.txt.example vagas.txt
cp insights.md.example insights.md
cp ai/skills/cv-base/SKILL.md.example ai/skills/cv-base/SKILL.md
cp ai/skills/contexto/SKILL.md.example ai/skills/contexto/SKILL.md
```

1. Pergunte ao candidato:
   - Nome
   - País do candidato
   - Cidade e estado/provincia/distrito: cidade - UF
     - Mostrar Exemplo: Belo Horizonte - MG
   - Email
   - Link do LinkedIn
   - Telefone de contato com código do país
     - Informar que Brasil é +55
     - Mostrar Exemplo: +55 11 99999-9999

2. Com esses dados, preencha o `src/json/candidate-data.js`
   - `name`: nome do candidato
   - `phoneCountryCode`: código do país (ex: +55)
   - `phone`: número do telefone
   - `email`: email do candidato
   - `linkedin.url`: link do LinkedIn
   - Em location
     - pt: cidade - estado
     - en: city - country

3. Peça o candidato para preencher o [CV base](../cv-base/SKILL.md).
4. Oriente ele a ler o [README.md - ai/skills/cv-base/SKILL.md](../../../README.md#aiskillscv-baseskillmd)