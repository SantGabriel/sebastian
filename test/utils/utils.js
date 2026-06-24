/**
 * @typedef {import('../../src/interfaces/job-data').Job} Job
 * @typedef {import('../../src/interfaces/job-data').CV} CV
 * @typedef {import('../../src/interfaces/job-data').CL} CL
 */

/**
 * @returns {Job[]}
 */
function getGenericCVData() {
  if (process.env.TEST_DATA === 'generic') {
    return require('../../src/json/generic-cv-data.js').GENERIC_CV_DATA;
  }
  if (process.env.TEST_DATA === 'examples') {
    const combined = [];
    for (let i = 1; i <= 3; i++) {
      const exampleList = require(`../../fixtures/fake-candidates/example-${i}/cv.fixture.js`).CV_FIXTURE;
      exampleList.forEach(example => {
        combined.push({...example, id: `example-${i}-${example.id}`});
      });
    }
    return combined;
  }
  return [];
}

/**
 * Retorna todos os jobs (sem filtro de autorização) com suporte a JOB_ID.
 * Usado pelos testes de fit, que devem rodar mesmo em jobs não autorizados.
 * @returns {Job[]}
 */
function getJobsList() {
  let jobsList = [];
  if (process.env.TEST_DATA === 'examples' || process.env.TEST_DATA === 'generic') {
    jobsList = getGenericCVData();
  }else {
    jobsList = getJobsData();
  }
  return jobsList;
}

/**
 * Retorna todos os jobs (sem filtro de autorização) com suporte a JOB_ID.
 * Usado pelos testes de fit, que devem rodar mesmo em jobs não autorizados.
 * @returns {Job[]}
 */
function getJobsData() {
  if (process.env.TEST_DATA === 'examples' || process.env.TEST_DATA === 'generic') return [];
  const jobs = require('../../src/json/jobs-data.js').JOBS_DATA;
  return selectJobs(jobs);
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
 * Resultado da verificação de caracteres proibidos em ATS.
 * @typedef {Object} ATSValidationResult
 * @property {boolean} valid - `true` se nenhum caractere proibido foi encontrado.
 * @property {string[]} forbiddenChars - Nomes dos grupos proibidos detectados (ex: "emoji", "emDash").
 */

/**
 * Verifica caracteres proibidos em ATS.
 * @param {string} text - Texto a verificar.
 * @returns {ATSValidationResult} Resultado da validação.
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
 * Resultado da detecção de acentuação ausente / conversão ANSI incorreta.
 * @typedef {Object} AnsiValidationResult
 * @property {boolean} valid - `true` se nenhum problema de acentuação foi encontrado.
 * @property {string} message - Mensagem descritiva do resultado.
 */

/**
 * Detecta texto em português que perdeu acentuação (conversão ANSI incorreta),
 * seja pela ausência total de acentos ou pela presença de palavras conhecidas
 * sem acento (ex: "experiencia", "gestao").
 * @param {string} text - Texto a verificar.
 * @returns {AnsiValidationResult} Resultado da validação.
 */
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


/**
 * @param {Job[]} data
 * @returns {Job[]}
 */
function selectJobs(data) {
  const ids = (process.env.JOB_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return ids.length ? data.filter(e => ids.includes(e.id)) : data;
}

/**
 * Indica se o CV de um item de teste está autorizado para publicação.
 * Itens sem `cv` ou com `cv.authorized === false` são considerados
 * não autorizados e devem ser filtrados antes do `test.each`.
 * @param {Job} item - Job ou item de CV genérico.
 * @returns {boolean} `true` se o CV existe e não está marcado como não autorizado.
 */
function hasAuthorizedCV(item) {
  return !!(item && item.cv && item.cv.authorized !== false);
}

/**
 * Indica se a CL de um item de teste está autorizada para publicação.
 * Itens sem `cl` ou com `cl.authorized === false` são considerados
 * não autorizados e devem ser filtrados antes do `test.each`.
 * @param {Job} item - Job ou item de CV genérico (cujo `cl` é sempre `null`).
 * @returns {boolean} `true` se a CL existe e não está marcada como não autorizada.
 */
function hasAuthorizedCL(item) {
  return !!(item && item.cl && item.cl.authorized !== false);
}

/**
 * Igual a `test.each`, mas registra um teste pulado quando a tabela está vazia,
 * evitando o erro "`.each` called with an empty Array of table data".
 * @template {object} Job
 * @param {Job[]} jobList
 * @returns {(name: string, fn: (row: Job) => void) => void}
 */
function eachOrSkip(jobList) {
  if (jobList && jobList.length) return test.each(jobList);
  return (name) => test.skip(String(name).replace(/\$\w+/g, '—'), () => {});
}

module.exports = {
  hasAuthorizedCV,
  hasAuthorizedCL,
  eachOrSkip,
  countBoldItems,
  getJobsList,
  getJobsData,
  validateATSCharacters,
  getTextLength,
  wrongAnsiiConvertionDetection,
};
