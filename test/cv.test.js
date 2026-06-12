const {
  selectJobs,
  countBoldItems,
  getTextLength,
} = require('./utils/utils');

// Carrega dados reais
require('../src/json/jobs-data');
require('../src/json/generic-cv-data');

/**
 * @type {import('../src/interfaces/jobs-data').JobsData}
 */
const jobList = selectJobs(window.JOBS_DATA || []);

describe('CV - Experiência Profissional', () => {
  test.each(jobList)('Validar tamanho resumo de 500 a 600 caracteres ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized) return;
    // Remove tags HTML para contar apenas texto
    const textOnly = cv.resumo.replace(/<[^>]*>/g, '');
    const textLength = getTextLength(textOnly);
    expect(textLength).toBeGreaterThanOrEqual(500);
    expect(textLength).toBeLessThanOrEqual(600);
  });
});

describe('CV - negrito', () => {
  test.each(jobList)('Contar 3 a 5 negrito no sumário ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.resumo) return;

    const boldCount = countBoldItems(cv.resumo);
    expect(boldCount).toBeGreaterThanOrEqual(3);
    expect(boldCount).toBeLessThanOrEqual(5);
  });

  test.each(jobList)('Contar 5 a 10 negrito na experiencia profissional ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias) return;

    let totalBolds = 0;
    cv.experiencias.forEach(exp => {
      totalBolds += countBoldItems(exp.cargo || '');
      totalBolds += countBoldItems(exp.stack || '');
      if (exp.bullets) {
        exp.bullets.forEach(bullet => {
          totalBolds += countBoldItems(bullet);
        });
      }
    });

    expect(totalBolds).toBeGreaterThanOrEqual(5);
    expect(totalBolds).toBeLessThanOrEqual(10);
  });
});

describe('CV - Professional Experience', () => {
  test.each(jobList)('Validar tamanho de 2000 a 2500 caracteres para todas as experiencias ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias) return;

    let totalText = '';
    cv.experiencias.forEach(exp => {
      totalText += (exp.bullets || []).join(' ');
    });

    const textLength = getTextLength(totalText);
    expect(textLength).toBeGreaterThanOrEqual(2000);
    expect(textLength).toBeLessThanOrEqual(2500);
  });

  test.each(jobList)('Validar experiencia mais relevante com no minimo 800 caracteres ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias || cv.experiencias.length === 0) return;

    const firstExp = cv.experiencias[0];
    let text = (firstExp.cargo || '') + ' ' + (firstExp.stack || '') + ' ';
    if (firstExp.bullets) {
      firstExp.bullets.forEach(bullet => { text += bullet + ' '; });
    }

    const textLength = getTextLength(text);
    expect(textLength).toBeGreaterThanOrEqual(800);
  });

  test.each(jobList)('Validar experiencia mais relevante tem que ter mais caracteres que todas as outras ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias || cv.experiencias.length <= 1) return;

    const firstExpLength = getTextLength((cv.experiencias[0].bullets || []).join(' '));

    for (let i = 1; i < cv.experiencias.length; i++) {
      const otherExpLength = getTextLength(
          (cv.experiencias[i].bullets || []).join(' ')
      );
      expect(firstExpLength).toBeGreaterThanOrEqual(otherExpLength);
    }
  });

  test.each(jobList)('Validar bullet com tamanho entre 100 a 300 caracteres ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias) return;

    cv.experiencias.forEach(exp => {
      if (!exp.bullets) return;
      exp.bullets.forEach(bullet => {
        const textLength = getTextLength(bullet);
        expect(textLength).toBeGreaterThanOrEqual(100);
        expect(textLength).toBeLessThanOrEqual(300);
      });
    });
  });

  test.each(jobList)('Contar bullets entre 1 e 6 em cada experiencia ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.experiencias) return;

    cv.experiencias.forEach(exp => {
      if (!exp.bullets) return;
      expect(exp.bullets.length).toBeGreaterThanOrEqual(1);
      expect(exp.bullets.length).toBeLessThanOrEqual(6);
    });
  });
});

describe('CV - Competências Técnicas', () => {
  test.each(jobList)('Validar de 1 a 15 skills ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.skills) return;
    expect(cv.skills.length).toBeGreaterThanOrEqual(1);
    expect(cv.skills.length).toBeLessThanOrEqual(15);
  });
});

describe('CV - Educação', () => {
  test.each(jobList)('Validar Máximo 4 formações ($id)', ({id, cv}) => {
    if (!cv || !cv.authorized || !cv.educacao) return;
    expect(cv.educacao.length).toBeLessThanOrEqual(4);
  });
});
