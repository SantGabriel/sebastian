const { validateATSCharacters, wrongAnsiiConvertionDetection, selectJobs, selectGenericCVs } = require('./utils/utils');
require('../src/json/jobs-data.js');
require('../src/json/generic-cv-data.js');

const jobList    = selectJobs(window.JOBS_DATA);
const genericList = selectGenericCVs();
const allList    = [...jobList, ...genericList];

describe('ATS', () => {
  test.each(allList)('Caracteres proibidos ($id)', ({id, cv, cl}) => {
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

  test.each(allList)('Termos em Português sem acentuação ($id)', ({id, lang, cv, cl}) => {
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
