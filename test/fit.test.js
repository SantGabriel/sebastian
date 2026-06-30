const { scoreClass, gapWeight } = require('../src/js/index');
const { getJobsData, eachOrSkip } = require('./utils/utils');
const {GAP_TIPO} = require("../src/js/enum");


const jobList = getJobsData();
const jobsWithFit = jobList.filter(job => job.fit);
describe('Fit', () => {
  describe('Score', () => {

    eachOrSkip(jobsWithFit)('Sem gaps = score 10 ($id)', ({id, fit}) => {
      const hasNoGaps = !fit.negativos || fit.negativos.length === 0;
      if (hasNoGaps) {
        expect(fit.score).toBe(10);
      }
    });

    eachOrSkip(jobsWithFit)('Score entre 0 e 10 ($id)', ({id, fit}) => {
      expect(fit.score).toBeGreaterThanOrEqual(0);
      expect(fit.score).toBeLessThanOrEqual(10);
    });

    eachOrSkip(jobsWithFit)('Score coerente com os tipos de gap ($id)',({id, fit}) => {
      if (fit.negativos && fit.negativos.length === 0) return;
      const negativos = fit.negativos || [];

      const temGapCustom = negativos.filter(gap => gap.tipo === GAP_TIPO.PERSONALIZADO).length > 0;
      if (temGapCustom) return;


      negativos.forEach(gap => {
        expect(Object.values(GAP_TIPO)).toContain(gap.tipo);
      });

      const deduction    = negativos.reduce((acc, gap) => acc + (gapWeight(gap.tipo) || 0), 0);
      const expectedScore = Math.max(0, Math.round((10 - deduction) * 100) / 100);
      expect(fit.score).toBe(expectedScore);
    });

    eachOrSkip(jobsWithFit)('Apenas um Requisito core por vaga ($id)',({id, fit}) => {
      if (fit.negativos && fit.negativos.length === 0) return;
      const negativos = fit.negativos || [];

      const requisitosCore = negativos.filter(gap => gap.tipo === GAP_TIPO.REQUISITO_CORE);
      expect(requisitosCore.length).toBeLessThanOrEqual(1);
    });
  });
});
