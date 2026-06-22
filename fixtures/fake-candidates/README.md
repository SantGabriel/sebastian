# Fixtures — CVs de Exemplo

Dados fictícios usados para desenvolvimento e testes. **Não versionar** os arquivos `*.fixture.js` (gitignore).

## Estrutura

```
example-N/
├── cv-base.input.md        # Input: CV base do candidato (commitar)
├── cv.fixture.js           # Output: CVs gerados (gitignore)
└── candidate.fixture.js    # Output: dados pessoais (gitignore)
```

## Como gerar

1. Crie o diretório `example-N/` com um `cv-base.input.md` seguindo o formato do `ai/skills/cv-base/SKILL.md`
2. Execute `npm run test:examples` para validar
3. Os arquivos `*.fixture.js` devem ser criados manualmente seguindo o schema abaixo

## Schema

### cv.fixture.js

```js
export const CV_FIXTURE = [
  {
    id: "generico",          // ID do CV (usado na URL)
    empresa: "CV Genérico",
    vaga: "Título da Vaga",
    lang: "pt",              // "pt" ou "en"
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "Cidade - UF",
      titulo: "Cargo | Subtítulo",
      subtitulo: "Tech 1 | Tech 2 | Tech 3",
      resumo: "Parágrafo com <strong>negrito</strong>.",
      experiencias: [
        {
          cargo: "Cargo - Nível",
          empresa: "Empresa",
          url: "https://...",
          inicio: "Mês AAAA",
          fim: "Mês AAAA",
          stack: "Tech 1 | Tech 2",
          bullets: ["bullet 1", "bullet 2"]
        }
      ],
      skills: ["Tech 1", "Tech 2"],
      educacao: [
        { curso: "Curso", inst: "Instituição", periodo: "AAAA - AAAA", stack: "Tech1 | Tech2" }
      ],
      idiomas: ["Inglês - B2"]
    }
  },
  {
    id: "generico-en",
    // ... mesmo formato, lang: "en"
  }
];
```

### candidate.fixture.js

```js
export const CANDIDATE_FIXTURE = {
  name: "Nome Completo",
  phoneCountryCode: "+55",
  phone: "DDD 9XXXX-XXXX",
  email: "email@example.com",
  linkedin: "https://www.linkedin.com/in/perfil",
  location: {
    pt: "Cidade - UF",
    en: "Cidade - Country"
  }
};
```
