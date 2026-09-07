// Normaliza grafias equivalentes de tecnologia ANTES de tirar pontuação —
// aplicado sobre o texto já lowercase+sem-acento, mas ainda com pontuação.
// Ordem importa: padrões mais específicos primeiro (ex.: "asp.net" antes de ".net").
const TECH_ALIASES = [
  [/asp\.net\b/g, 'aspnet'],
  [/\.net\b/g, 'dotnet'],
  [/c#/g, 'csharp'],
  [/c\+\+/g, 'cpp'],
  [/node\.js\b/g, 'nodejs'],
  [/node\s+js\b/g, 'nodejs'],
  [/next\.js\b/g, 'nextjs'],
  [/vue\.js\b/g, 'vuejs'],
  [/react\.js\b/g, 'reactjs'],
  [/ci\s*\/\s*cd\b/g, 'cicd'],
  [/objective-c\b/g, 'objectivec'],
  [/rest\s+api\b/g, 'restapi'],
  [/\bux\/ui\b/g, 'uxui'],
  [/\bui\/ux\b/g, 'uxui']
];

module.exports = { TECH_ALIASES };
