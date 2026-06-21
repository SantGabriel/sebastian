const {
  getDataCVList,
  hasAuthorizedCV,
  eachOrSkip,
  countBoldItems,
  getTextLength,
} = require('./utils/utils');

/** @type {DataCV[]|Job[]} */
const allCVList = getDataCVList().filter(hasAuthorizedCV);
describe('CV - Campos obrigatórios', () => {
  eachOrSkip(allCVList)('Todos os campos obrigatórios definidos ($id)', ({id, cv}) => {
    expect(cv.local).toBeDefined();
    expect(cv.titulo).toBeDefined();
    expect(cv.subtitulo).toBeDefined();
    expect(cv.resumo).toBeDefined();
    expect(cv.idiomas).toBeDefined();

    expect(Array.isArray(cv.experiencias)).toBe(true);
    expect(cv.experiencias.length).toBeGreaterThan(0);
    expect(Array.isArray(cv.skills)).toBe(true);
    expect(Array.isArray(cv.educacao)).toBe(true);

    cv.experiencias.forEach(exp => {
      expect(exp.cargo).toBeDefined();
      expect(exp.empresa).toBeDefined();
      expect(exp.inicio).toBeDefined();
      expect(exp.fim).toBeDefined();
      expect(exp.stack).toBeDefined();
      expect(Array.isArray(exp.bullets)).toBe(true);
    });

    cv.educacao.forEach(edu => {
      expect(edu.curso).toBeDefined();
      expect(edu.inst).toBeDefined();
      expect(edu.periodo).toBeDefined();
      expect(edu.stack).toBeDefined();
    });
  });
});

describe('CV - Experiência Profissional', () => {
  eachOrSkip(allCVList)('Validar tamanho resumo de 400 a 500 caracteres ($id)', ({id, cv}) => {
    // Remove tags HTML para contar apenas texto
    const textOnly = cv.resumo.replace(/<[^>]*>/g, '');
    const textLength = getTextLength(textOnly);
    expect(textLength).toBeGreaterThanOrEqual(400);
    expect(textLength).toBeLessThanOrEqual(500);
  });
});

describe('CV - negrito', () => {
  eachOrSkip(allCVList)('Contar 3 a 5 negrito no sumário ($id)', ({id, cv}) => {
    const boldCount = countBoldItems(cv.resumo);
    expect(boldCount).toBeGreaterThanOrEqual(3);
    expect(boldCount).toBeLessThanOrEqual(5);
  });

  eachOrSkip(allCVList)('Contar 5 a 10 negrito na experiencia profissional ($id)', ({id, cv}) => {
    let totalBolds = 0;
    cv.experiencias.forEach(exp => {
      totalBolds += countBoldItems(exp.cargo || '');
      totalBolds += countBoldItems(exp.stack || '');
      exp.bullets.forEach(bullet => {
        totalBolds += countBoldItems(bullet);
      });
    });

    expect(totalBolds).toBeGreaterThanOrEqual(5);
    expect(totalBolds).toBeLessThanOrEqual(10);
  });
});

describe('CV - Professional Experience', () => {
  eachOrSkip(allCVList)('Validar tamanho de 1500 a 2000 caracteres para todas as experiencias ($id)', ({id, cv}) => {
    let totalText = '';
    cv.experiencias.forEach(exp => {
      totalText += exp.bullets.join(' ');
    });

    const textLength = getTextLength(totalText);
    expect(textLength).toBeGreaterThanOrEqual(1500);
    expect(textLength).toBeLessThanOrEqual(2000);
  });

  eachOrSkip(allCVList)('Validar experiencia mais relevante com no minimo 600 caracteres ($id)', ({id, cv}) => {
    const firstExp = cv.experiencias[0];
    let text = (firstExp.cargo || '') + ' ' + (firstExp.stack || '') + ' ';
    firstExp.bullets.forEach(bullet => { text += bullet + ' '; });

    const textLength = getTextLength(text);
    expect(textLength).toBeGreaterThanOrEqual(600);
  });

  eachOrSkip(allCVList)('Validar experiencia mais relevante tem que ter mais caracteres que todas as outras ($id)', ({id, cv}) => {
    const firstExpLength = getTextLength(cv.experiencias[0].bullets.join(' '));

    for (let i = 1; i < cv.experiencias.length; i++) {
      const otherExpLength = getTextLength(cv.experiencias[i].bullets.join(' '));
      expect(firstExpLength).toBeGreaterThanOrEqual(otherExpLength);
    }
  });

  eachOrSkip(allCVList)('Validar bullet com tamanho entre 100 a 300 caracteres ($id)', ({id, cv}) => {
    cv.experiencias.forEach(exp => {
      exp.bullets.forEach(bullet => {
        const textLength = getTextLength(bullet);
        expect(textLength).toBeGreaterThanOrEqual(100);
        expect(textLength).toBeLessThanOrEqual(300);
      });
    });
  });

  eachOrSkip(allCVList)('Contar bullets entre 1 e 6 em cada experiencia ($id)', ({id, cv}) => {
    cv.experiencias.forEach(exp => {
      expect(exp.bullets.length).toBeGreaterThanOrEqual(1);
      expect(exp.bullets.length).toBeLessThanOrEqual(6);
    });
  });
});

describe('CV - Competências Técnicas', () => {
  eachOrSkip(allCVList)('Validar de 1 a 15 skills ($id)', ({id, cv}) => {
    expect(cv.skills.length).toBeGreaterThanOrEqual(1);
    expect(cv.skills.length).toBeLessThanOrEqual(15);
  });
});

describe('CV - Educação', () => {
  eachOrSkip(allCVList)('Validar Máximo 4 formações ($id)', ({id, cv}) => {
    expect(cv.educacao.length).toBeLessThanOrEqual(4);
  });
});
