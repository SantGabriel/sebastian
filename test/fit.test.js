const { scoreClass } = require('../src/js/index');
const { selectJobs, eachOrSkip } = require('./utils/utils');
require('../src/json/jobs-data.js');

/**
 * @type {import('../src/interfaces/jobs-data').JobsData}
 */
const jobList = selectJobs(window.JOBS_DATA);
const jobsWithFit = jobList.filter(job => job.fit);

describe('Fit', () => {
  describe('Score', () => {
    describe('Cores', () => {
      eachOrSkip(jobsWithFit.filter(job => job.fit.score >= 8))(
        'Verde para score >= 8 ($id)',
        ({id, fit}) => {
          expect(scoreClass(fit.score)).toBe('score-green');
        }
      );

      eachOrSkip(jobsWithFit.filter(job => job.fit.score >= 5 && job.fit.score < 8))(
        'Amarelo para score 5–7 ($id)',
        ({id, fit}) => {
          expect(scoreClass(fit.score)).toBe('score-yellow');
        }
      );

      eachOrSkip(jobsWithFit.filter(job => job.fit.score < 5))(
        'Vermelho para score < 5 ($id)',
        ({id, fit}) => {
          expect(scoreClass(fit.score)).toBe('score-red');
        }
      );
    });

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
  });
});
