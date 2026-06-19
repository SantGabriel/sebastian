const { validateATSCharacters, wrongAnsiiConvertionDetection, getDataCVList, hasAuthorizedCV, hasAuthorizedCL, eachOrSkip } = require('./utils/utils');

/** @type {DataCV[]|Job[]} */
const allList = getDataCVList();

describe('ATS', () => {
  eachOrSkip(allList)('Caracteres proibidos ($id)', (item) => {
    const { cv, cl } = item;

    if (hasAuthorizedCV(item)) {
      let allTextCV = getAllTextCV(cv);

      const validationCV = validateATSCharacters(allTextCV);
      expect(validationCV.valid).toBe(true);
    }

    if (hasAuthorizedCL(item)) {
      const allTextCL = (cl.paragrafos || []).join(' ');
      const validationCL = validateATSCharacters(allTextCL);
      expect(validationCL.valid).toBe(true);
    }
  });

  eachOrSkip(allList)('Termos em Português sem acentuação ($id)', (item) => {
    const { lang, cv, cl } = item;
    if (lang !== 'pt') return;

    if (hasAuthorizedCV(item)) {
      let allTextCV = getAllTextCV(cv);

      const validationCV = wrongAnsiiConvertionDetection(allTextCV);
      if (!validationCV.valid) throw new Error(validationCV.message);
    }

    if (hasAuthorizedCL(item)) {
      const allTextCL = getAllTextCL(cl);
      const validationCL = wrongAnsiiConvertionDetection(allTextCL);
      if (!validationCL.valid) throw new Error(validationCL.message);
    }
  });
});

/**
 * @param {CV} cv
 * @return string
 * */
function getAllTextCV(cv) {
  let allTextCV = cv.resumo || '';
  (cv.experiencias || []).forEach(exp => {
    allTextCV += ' ' + (exp.cargo || '');
    allTextCV += ' ' + (exp.stack || '');
    (exp.bullets || []).forEach(bullet => { allTextCV += ' ' + bullet; });
  });
  return allTextCV;
}

/**
 * @param {CL} cl
 * @return string
 * */
function getAllTextCL(cl) {
  const allTextCL = (cl.paragrafos || []).join(' ');
  return allTextCL;
}