/**
 * Utilitários para testes
 */

/**
 * Filtra a lista de jobs pelo(s) id(s) em process.env.JOB_ID.
 * JOB_ID aceita um id ou vários separados por vírgula (ex: "id-a,id-b").
 * Sem JOB_ID definido, retorna a lista completa (auditoria geral).
 * @param {Array<Object>} jobList - Lista de jobs (window.JOBS_DATA)
 * @returns {Array<Object>}
 */
function selectJobs(jobList) {
  const ids = (process.env.JOB_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return ids.length ? jobList.filter(job => ids.includes(job.id)) : jobList;
}

/**
 * Igual a `test.each`, mas registra um teste pulado quando a tabela está vazia,
 * evitando o erro "`.each` called with an empty Array of table data" que ocorre
 * ao escopar por JOB_ID e sobrar um sub-filtro sem itens.
 * @param {Array<Object>} rows
 */
function eachOrSkip(rows) {
  if (rows && rows.length) return test.each(rows);
  return (name) => test.skip(String(name).replace(/\$\w+/g, '—'), () => {});
}

/**
 * Calcula o score de fit baseado em gaps
 * @param {number} initialScore - Score inicial (normalmente 10)
 * @param {Array<Object>} gaps - Array de gaps com format {type: string, weight: number}
 * @returns {number} Score final (mínimo 0)
 */
function calculateGapScore(initialScore = 10, gaps = []) {
  let score = initialScore;

  gaps.forEach(gap => {
    score -= gap.weight;
  });

  return Math.max(0, score);
}

/**
 * Valida se o texto tem comprimento entre min e max
 * @param {string} text - Texto a validar
 * @param {number} min - Comprimento mínimo
 * @param {number} max - Comprimento máximo
 * @returns {boolean}
 */
function validateLength(text, min, max) {
  if (!text || typeof text !== 'string') return false;
  const length = text.length;
  return length >= min && length <= max;
}

/**
 * Conta itens em negrito no texto HTML
 * @param {string} html - HTML a analisar
 * @returns {number}
 */
function countBoldItems(html) {
  if (!html || typeof html !== 'string') return 0;
  const matches = html.match(/<strong>.*?<\/strong>/g) || [];
  return matches.length;
}

/**
 * Valida datas no formato "Mês AAAA" ou "AAAA - AAAA"
 * @param {string} date - Data a validar (ex: "Janeiro 2024" ou "2020 - 2023")
 * @returns {boolean}
 */
function validateDateFormat(date) {
  if (!date || typeof date !== 'string') return false;

  // Validar formato "AAAA - AAAA"
  const yearRangePattern = /^\d{4}\s*-\s*\d{4}$/;
  if (yearRangePattern.test(date)) return true;

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const pattern = new RegExp(`^(${meses.join('|')}) \\d{4}$`);
  return pattern.test(date);
}

/**
 * Verifica caracteres proibidos em ATS
 * @param {string} text - Texto a verificar
 * @returns {Object} {valid: boolean, forbiddenChars: Array<string>}
 */
function validateATSCharacters(text) {
  if (!text || typeof text !== 'string') return { valid: true, forbiddenChars: [] };

  const forbidden = {
    emoji: /[\u{1F300}-\u{1F9FF}]/gu,
    emDash: /—/g,
    enDash: /–/g,
    arrow: /→/g,
    middleDot: /·/g,
  };

  const found = [];

  Object.entries(forbidden).forEach(([name, pattern]) => {
    if (pattern.test(text)) {
      found.push(name);
    }
  });

  return {
    valid: found.length === 0,
    forbiddenChars: found,
  };
}

/**
 * Extrai bullets de um texto em formato de lista
 * @param {string} text - Texto contendo bullets
 * @returns {Array<string>}
 */
function extractBullets(text) {
  if (!text || typeof text !== 'string') return [];
  // Suporta múltiplos formatos: "- ", "* ", "• "
  const bulletPattern = /^[\s]*[-*•]\s+(.+)$/gm;
  const matches = text.matchAll(bulletPattern);
  return Array.from(matches).map(m => m[1]);
}

/**
 * Valida estrutura de experiência profissional
 * @param {Object} experience - Objeto com {bullets: Array<string>, ...}
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
function validateExperience(experience) {
  const errors = [];

  if (!experience.bullets || !Array.isArray(experience.bullets)) {
    errors.push('bullets must be an array');
    return { valid: false, errors };
  }

  if (experience.bullets.length < 1 || experience.bullets.length > 6) {
    errors.push(`bullets must be between 1 and 6, got ${experience.bullets.length}`);
  }

  experience.bullets.forEach((bullet, index) => {
    if (typeof bullet !== 'string') {
      errors.push(`bullet ${index} must be a string`);
    } else if (bullet.length < 100 || bullet.length > 200) {
      errors.push(`bullet ${index} must be between 100 and 200 characters, got ${bullet.length}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Remove tags HTML e conta caracteres reais
 * @param {string} html - HTML com tags
 * @returns {number}
 */
function getTextLength(html) {
  if (!html || typeof html !== 'string') return 0;
  const text = html.replace(/<[^>]*>/g, '');
  return text.length;
}

/**
 * Verifica se um texto contém uma palavra ou frase (case-insensitive)
 * @param {string} text - Texto a pesquisar
 * @param {string} searchTerm - Termo a buscar
 * @returns {boolean}
 */
function containsText(text, searchTerm) {
  if (!text || typeof text !== 'string' || !searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Conta palavras em negrito (strong tags)
 * @param {string} html - HTML a analisar
 * @returns {Array<string>} Array com palavras em negrito
 */
function extractBoldWords(html) {
  if (!html || typeof html !== 'string') return [];
  const matches = html.match(/<strong>(.*?)<\/strong>/g) || [];
  return matches.map(m => m.replace(/<\/?strong>/g, ''));
}

module.exports = {
  selectJobs,
  eachOrSkip,
  calculateGapScore,
  validateLength,
  countBoldItems,
  validateDateFormat,
  validateATSCharacters,
  extractBullets,
  validateExperience,
  getTextLength,
  containsText,
  extractBoldWords,
};
