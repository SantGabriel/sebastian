const { foldAccents } = require('./normalize.js');
const { STOPWORDS_PT } = require('./stopwords-pt.js');
const { STOPWORDS_EN } = require('./stopwords-en.js');
const { TECH_ALIASES } = require('./tech-aliases.js');

const STOPWORDS = new Set([...STOPWORDS_PT, ...STOPWORDS_EN]);

/** Comprimento mínimo de um token para virar termo. */
const MIN_TOKEN_LENGTH = 2;

// Pontuação que fecha frase/cláusula — bigrama nunca atravessa isso, mesmo
// que as duas palavras sobrevivam ao filtro de stopword (senão "...e .NET,
// praticas de..." formaria o bigrama sem sentido "dotnet praticas").
const HARD_BREAK = /[.,;:!?\n]/;

/** Um pedaço devolvido pelo split é palavra quando só tem letra/dígito; o resto é separador. */
function isWordPart(part) {
  return /^[a-z0-9]+$/.test(part);
}

/** O separador entre dois tokens contém pontuação que encerra frase/cláusula. */
function hasHardBreak(separator) {
  return HARD_BREAK.test(separator);
}

function applyAliases(text) {
  let out = text;
  for (const [pattern, replacement] of TECH_ALIASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

// ---------- testes de descarte de token ----------

/** Resto de pontuação ou letra solta — não carrega significado. */
function isTooShort(token) {
  return token.length < MIN_TOKEN_LENGTH;
}

/** Só dígitos ("2024", "10"): não diz nada sobre fit. */
function isPureNumber(token) {
  return /^\d+$/.test(token);
}

/**
 * Está na lista de stopwords — gramaticais + domínio de vagas. A comparação é
 * de string exata (não há stemming), então variação verbal só é descartada se
 * estiver explicitamente na lista: 'atuar' não cobre 'atuando'.
 */
function isStopword(token) {
  return STOPWORDS.has(token);
}

/**
 * Um token só vira termo se passar pelos três testes.
 *
 * A ordem importa para o diagnóstico, não para o resultado: "5" e "e" caem em
 * `isTooShort` antes de chegarem a `isPureNumber`/`isStopword`. Na prática
 * `isPureNumber` só decide sobre números de 2+ dígitos.
 */
function isIndexable(token) {
  return !isTooShort(token) && !isPureNumber(token) && !isStopword(token);
}

// ---------- dobra de plural ----------

/**
 * Regras de dobra, tentadas em ordem. Cada uma diz quando se aplica e qual
 * singular propõe; a proposta só é aceita se já existir no vocabulário.
 * Se uma regra casa mas a proposta é desconhecida, a próxima ainda é tentada.
 */
const PLURAL_RULES = [
  {
    name: 'oes -> ao',
    matches: word => word.endsWith('oes') && word.length > 4,
    singular: word => word.slice(0, -3) + 'ao'
  },
  {
    name: 'res|ses|zes -> r|s|z',
    matches: word => /[rsz]es$/.test(word) && word.length > 4,
    singular: word => word.slice(0, -2)
  },
  {
    name: 's -> (vazio)',
    matches: word => word.endsWith('s') && word.length > 3,
    singular: word => word.slice(0, -1)
  }
];

/** O termo já é conhecido pelo índice (tabela Term). */
function isKnownTerm(word, vocabulary) {
  return vocabulary.has(word);
}

/**
 * Dobra plural em 3 regras simples — só aplica se a forma reduzida já existir
 * no vocabulário conhecido (evita "pandas" virar "panda" por acidente).
 */
function foldPlural(word, vocabulary) {
  if (isKnownTerm(word, vocabulary)) return word;

  for (const rule of PLURAL_RULES) {
    if (!rule.matches(word)) continue;
    const candidate = rule.singular(word);
    if (isKnownTerm(candidate, vocabulary)) return candidate;
  }

  return word;
}

// ---------- bigrama ----------

/**
 * Duas condições independentes, ambas obrigatórias:
 * 1. os dois vizinhos viraram termo (em `survivors`, descartado é `null`);
 * 2. não havia pontuação forte entre eles.
 *
 * É a condição 1 que impede bigrama entre não-vizinhos: se uma stopword estava
 * no meio, ela deixou um `null` ali e o par não se forma.
 */
function canFormBigram(left, right, hardBreakBetween) {
  return Boolean(left) && Boolean(right) && !hardBreakBetween;
}

/**
 * Divide o texto em tokens de palavra preservando, para cada par de tokens
 * vizinhos, se havia uma quebra "dura" de pontuação entre eles no texto
 * original — usado para não deixar bigramas atravessarem frase/cláusula.
 */
function splitWithBreaks(normalized) {
  const parts = normalized.split(/([^a-z0-9]+)/);
  const tokens = [];
  const hardBreakBefore = [];
  let sawHardBreak = false;

  for (const part of parts) {
    if (!part) continue;
    if (isWordPart(part)) {
      if (tokens.length > 0) hardBreakBefore.push(sawHardBreak);
      tokens.push(part);
      sawHardBreak = false;
    } else if (hasHardBreak(part)) {
      sawHardBreak = true;
    }
  }

  return { tokens, hardBreakBefore };
}

/**
 * Quebra um texto em termos (unigramas + bigramas), prontos para indexar.
 * `vocabulary` é o conjunto de termos já conhecidos (ex.: da tabela Term do
 * banco) — usado só para decidir se dobra plural, não para filtrar nada.
 *
 * @param {string} text
 * @param {Set<string>} [vocabulary]
 * @returns {{ text: string, n: 1|2 }[]}
 */
function tokenize(text, vocabulary = new Set()) {
  if (!text) return [];

  let normalized = foldAccents(String(text).toLowerCase());
  normalized = applyAliases(normalized);

  const { tokens: rawTokens, hardBreakBefore } = splitWithBreaks(normalized);

  const survivors = rawTokens.map(raw => (
    isIndexable(raw) ? foldPlural(raw, vocabulary) : null
  ));

  const terms = [];
  for (const s of survivors) {
    if (s) terms.push({ text: s, n: 1 });
  }
  for (let i = 0; i < survivors.length - 1; i++) {
    if (canFormBigram(survivors[i], survivors[i + 1], hardBreakBefore[i])) {
      terms.push({ text: `${survivors[i]} ${survivors[i + 1]}`, n: 2 });
    }
  }

  return terms;
}

/** Agrega termos repetidos num texto único em { text, n, tf }. */
function tokenizeWithFrequency(text, vocabulary = new Set()) {
  const terms = tokenize(text, vocabulary);
  const byKey = new Map();
  for (const t of terms) {
    const key = `${t.n}:${t.text}`;
    const existing = byKey.get(key);
    if (existing) existing.tf += 1;
    else byKey.set(key, { text: t.text, n: t.n, tf: 1 });
  }
  return [...byKey.values()];
}

module.exports = { tokenize, tokenizeWithFrequency };
