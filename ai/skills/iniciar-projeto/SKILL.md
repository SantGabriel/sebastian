---
name: iniciar-projeto
description: Aqui vamos iniciar o projeto com os dados básicos do candidato como nome, contato e endereço
---

# Gatilho
Inicie essa skill se **qualquer um** dos arquivos da tabela abaixo não existir ou pendente.

| Arquivo                        | Copiar de                             | Vazio/pendente quando                         |
|--------------------------------|---------------------------------------|-----------------------------------------------|
| `src/json/candidate-data.js`   | `src/json/candidate-data.js.example`  | não existe OU conteúdo idêntico ao `.example` |
| `ai/skills/cv-base/SKILL.md`   | `ai/skills/cv-base/SKILL.md.example`  | não existe OU conteúdo idêntico ao `.example` |
| `ai/skills/contexto/SKILL.md`  | `ai/skills/contexto/SKILL.md.example` | não existe                                    |
| `src/json/generic-cv-data.js`  | `src/json/generic-cv-data.js.example` | não existe                                    |
| `src/json/jobs-data.js`        | `src/json/jobs-data.js.example`       | não existe                                    |
| `vagas.txt`                    | `vagas.txt.example`                   | não existe                                    |
| `entrevista.md`                | `entrevista.md.example`               | não existe                                    |
| `db/sebastian.db`              | `npx prisma migrate deploy`           | não existe                                    |

## Passo 1 — Copiar somente o que falta
Rode o comando inteiro abaixo para criar os arquivos que faltam

```bash
[ -f src/json/candidate-data.js ] || cp src/json/candidate-data.js.example src/json/candidate-data.js
[ -f src/json/generic-cv-data.js ] || cp src/json/generic-cv-data.js.example src/json/generic-cv-data.js
[ -f src/json/jobs-data.js ] || cp src/json/jobs-data.js.example src/json/jobs-data.js
[ -f vagas.txt ] || cp vagas.txt.example vagas.txt
[ -f entrevista.md ] || cp entrevista.md.example entrevista.md
[ -f ai/skills/cv-base/SKILL.md ] || cp ai/skills/cv-base/SKILL.md.example ai/skills/cv-base/SKILL.md
[ -f ai/skills/contexto/SKILL.md ] || cp ai/skills/contexto/SKILL.md.example ai/skills/contexto/SKILL.md
[ -f db/sebastian.db ] || npx prisma migrate deploy
```

## Passo 2 — Preencher somente o que está pendente
Pergunte ao candidato **apenas** sobre os arquivos marcados como pendentes no diagnóstico. Não repita perguntas sobre o que já está preenchido.

### candidate-data.js
1. Pergunte os dados que faltam:
   - Nome
   - País do candidato
   - Cidade e estado/provincia/distrito: cidade - UF
     - Mostrar Exemplo: Belo Horizonte - MG
   - Email
   - Link do LinkedIn (opcional)
   - Link do portfólio — site pessoal ou repositório como GitHub/GitLab (opcional)
   - Código de telefone do país (opcional)
     - Informar que Brasil é +55
   - Telefone de contato (opcional)
     - Mostrar Exemplo: 11 99999-9999

2. Com esses dados, preencha o `src/json/candidate-data.js`:
   - `name`: nome do candidato
   - `phoneCountryCode`: código do país (ex: +55)
   - `phone`: número do telefone
   - `email`: email do candidato
   - `linkedin`: link do LinkedIn
   - `portfolio`: link do portfólio (pode ser site pessoal ou GitHub/GitLab)
   - Em `location`
     - `pt`: cidade - estado
     - `en`: city - country

### [CV base](../cv-base/SKILL.md)
- Peça o candidato para preencher o [CV base](../cv-base/SKILL.md).
- Oriente ele a ler o [README.md - ai/skills/cv-base/SKILL.md](../../../README.md#aiskillscv-baseskillmd)