---
name: iniciar-projeto
description: Aqui vamos iniciar o projeto com os dados básicos do candidato como nome, contato e endereço
---

# Gatilho
Inicie esse agente se o `../../../candidate-data.js` não existir ou estiver vazio.

Se o arquivo não existir, oriente o usuário a rodar os comandos de configuração inicial antes de continuar:
```bash
cp candidate-data.js.example candidate-data.js
cp generic-cv-data.js.example generic-cv-data.js
cp jobs-data.js.example jobs-data.js
cp vagas.txt.example vagas.txt
cp insights.md.example insights.md
cp .github/skills/cv-base/SKILL.md.example .github/skills/cv-base/SKILL.md
cp .github/skills/contexto/SKILL.md.example .github/skills/contexto/SKILL.md
```

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