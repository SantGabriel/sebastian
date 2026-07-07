/**
 * Testes de dom para CLs (Cartas de Apresentação)
 * Carrega dados reais de JOBS
 * Valida estrutura, conteúdo e regras ATS dos CLs
 */

const { getTextLength, hasAuthorizedCL, eachOrSkip, getJob } = require('./utils/utils');

/** @type Job[] */
const jobList = getJob().filter(hasAuthorizedCL);

describe('CL Estrutura', () => {
  eachOrSkip(jobList)('Soma de todos os parágrafos deve ter entre 800 a 1500 caracteres (Job "$id")', ({id, cl}) => {

    let totalText = '';
    cl.paragrafos.forEach((paragrafo) => {
      totalText += paragrafo;
    });

    const textLength = getTextLength(totalText);
    expect(textLength).toBeGreaterThanOrEqual(800);
    expect(textLength).toBeLessThanOrEqual(1500);
  });
  eachOrSkip(jobList)('Entre 2 a 3 parágrafos (Job "$id")', ({id, cl}) => {

    expect(cl.paragrafos.length).toBeGreaterThanOrEqual(2);
    expect(cl.paragrafos.length).toBeLessThanOrEqual(3);
  });
});
