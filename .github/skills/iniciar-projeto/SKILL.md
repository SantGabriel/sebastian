---
name: iniciar-projeto
description: Aqui vamos iniciar o projeto com os dados básicos do candidato como nome, contato e endereço
---

# Gatilho
Inicie esse agente se o `../../../candidate-data.js` estiver vazio.

# Pergunte ao candidato:
- Nome
- País do candidato
- Se for brasil: 
  - Cidade e estado no formato: cidade - UF
  - Cidade e estado/provincia/distrito
- Email
- Link do LinkedIn
- Telefone de contato

# Com esses dados, preencha o candidate-data.js
- Em location
  - pt: cidade - estado
  - en: city - country