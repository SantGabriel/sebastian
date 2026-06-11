/**
 * AUDITORIA OBRIGATÓRIA de caracteres/datas ATS.
 *
 * PAPEL: diferente do cv.test.js (consultivo), uma falha AQUI é obrigatória de
 * corrigir. Trocar um símbolo proibido (— – → · emoji) ou ajustar o formato de
 * data NÃO custa qualidade nenhuma ao CV, então é seguro tratar como portão.
 */
const { validateATSCharacters, validateDateFormat, selectJobs } = require('./utils/helpers');
const { getByTestId, createTestContainer, cleanupTestContainer } = require('./utils/dom-helpers');
require('../src/json/jobs-data.js');

/**
 * @type {import('../src/interfaces/jobs-data').JobsData}
 */
const jobList = selectJobs(window.JOBS_DATA);

describe('ATS', () => {
  test('Caracteres proibidos', () => {
    jobList.forEach((job) => {
      // Testa CV
      if (job.cv) {
        const resumo = job.cv.resumo || '';
        const resumoValidation = validateATSCharacters(resumo);
        expect(resumoValidation.valid).toBe(true);

        if (job.cv.experiencias) {
          job.cv.experiencias.forEach(exp => {
            const cargo = exp.cargo || '';
            const stack = exp.stack || '';

            expect(validateATSCharacters(cargo).valid).toBe(true);
            expect(validateATSCharacters(stack).valid).toBe(true);

            if (exp.bullets) {
              exp.bullets.forEach(bullet => {
                expect(validateATSCharacters(bullet).valid).toBe(true);
              });
            }
          });
        }
      }

      // Testa CL
      if (job.cl) {
        for (let i = 1; i <= 5; i++) {
          const paragrafo = job.cl[`paragrafo${i}`];
          if (paragrafo) {
            expect(validateATSCharacters(paragrafo).valid).toBe(true);
          }
        }
      }
    });
  });
});
