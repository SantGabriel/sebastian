/**
 * Testes de dom para CLs (Cartas de Apresentação)
 * Carrega dados reais de window.JOBS_DATA
 * Valida estrutura, conteúdo e regras ATS dos CLs
 */

const { getTextLength, selectJobs } = require('./utils/helpers');
require('../src/json/jobs-data.js');

/**
 * @type {import('../src/interfaces/jobs-data').JobsData}
 */
const jobList = selectJobs(window.JOBS_DATA);

describe('CL Estrutura', () => {
  test.each(jobList)('Soma de todos os parágrafos deve ter entre 800 a 1500 caracteres (Job "$id")', ({id, cl}) => {

    if (!cl.authorized) return;

    let totalText = '';
    // Concatena todos os parágrafos
    for (let i = 1; i <= 5; i++) {
      const paragrafo = cl[`paragrafo${i}`];
      if (paragrafo) {
        totalText += paragrafo + ' ';
      }
    }

    const textLength = getTextLength(totalText);
    expect(textLength).toBeGreaterThanOrEqual(800);
    expect(textLength).toBeLessThanOrEqual(1500);
  });
});
