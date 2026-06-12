const { validateATSCharacters, wrongAnsiiConvertionDetection, selectJobs } = require('./utils/utils');
require('../src/json/jobs-data.js');

/**
 * @type {import('../src/interfaces/jobs-data').JobsData}
 */
const jobList = selectJobs(window.JOBS_DATA);

describe('ATS', () => {
  test.each(jobList)('Caracteres proibidos ($id)', ({id, cv, cl}) => {
    if (cv) {
      let allTextCV = cv.resumo || '';
      (cv.experiencias || []).forEach(exp => {
        allTextCV += ' ' + (exp.cargo || '');
        allTextCV += ' ' + (exp.stack || '');
        (exp.bullets || []).forEach(bullet => { allTextCV += ' ' + bullet; });
      });

      const validationCV = validateATSCharacters(allTextCV);
      expect(validationCV.valid).toBe(true);
    }

    if (cl) {
      const allTextCL = (cl.paragrafos || []).join(' ');
      const validationCL = validateATSCharacters(allTextCL);
      expect(validationCL.valid).toBe(true);
    }
  });

  test.each(jobList)('Termos em Português sem acentuação ($id)', ({id, lang, cv, cl}) => {
    if (lang !== 'pt') return;

    if (cv) {
      let allTextCV = cv.resumo || '';
      (cv.experiencias || []).forEach(exp => {
        allTextCV += ' ' + (exp.cargo || '');
        allTextCV += ' ' + (exp.stack || '');
        (exp.bullets || []).forEach(bullet => { allTextCV += ' ' + bullet; });
      });

      const validationCV = wrongAnsiiConvertionDetection(allTextCV);
      if (!validationCV.valid) throw new Error(validationCV.message);
    }

    if (cl) {
      const allTextCL = (cl.paragrafos || []).join(' ');
      const validationCL = wrongAnsiiConvertionDetection(allTextCL);
      if (!validationCL.valid) throw new Error(validationCL.message);
    }
  });
});
