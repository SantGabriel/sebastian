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


function wrongAnsiiConvertionDetection(text) {
  if (!text || typeof text !== 'string') return { valid: true, message: "Sem texto para verificar." };

  const regexAccents = /[áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/;
  const hasAccents = text.match(regexAccents);

  if (!hasAccents) return {
    valid: false,
    message: "Algumas palvras parecem estar sem acentuação",
  };

  const listWordsWithoutAccents = [
      'senior',
      'junior',
      'acao',
      'programacao',
      'nao',
      'condicao',
      'preparacao',
      'organizacao',
      'comunicacao',
      'lideranca',
      'gestao',
      'experiencia',
      'formacao',
      'educacao',
      'certificacao',
      'portugues',
      'ingles',
      'frances',
      'alemao',
  ];
  const found = listWordsWithoutAccents.filter(word =>
      new RegExp(`\\b${word}\\b`, 'iu').test(text)
  );
  return {
    valid: found.length === 0,
    message: "Palavras sem acentuação encontradas: " + (found.length === 0 ? "nenhuma!" : found.join(", ")),
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


module.exports = {
  selectJobs,
  eachOrSkip,
  countBoldItems,
  validateDateFormat,
  validateATSCharacters,
  getTextLength,
  wrongAnsiiConvertionDetection,
};
