// `Prisma` (helpers de SQL) tem que vir do MESMO client gerado que o db/client.js
// usa — ver `output` no schema.prisma. Importar de '@prisma/client' traz outro
// runtime, e aí Prisma.sql/Prisma.join não são reconhecidos na hora de executar:
// o template não é interpolado e o `?` cru chega no SQLite ("near ?: syntax error").
const { Prisma } = require('../generated/prisma');
const prisma = require('../db/client');
const settingsService = require('./settings.service');

/** Sobe quando tokenizer/stopwords/aliases mudam — invalida o índice existente. */
const CURRENT_VERSION = 1;

/**
 * Termos por statement no INSERT do dicionário. Cada termo gasta 2 variáveis
 * (text, n), então 500 = 1000 variáveis — folgado no limite do SQLite embarcado
 * no Prisma (verificado: aceita 10000). Na prática raramente entra em ação, já
 * que um documento típico rende 230–300 termos e cabe num chunk só.
 */
const TERM_INSERT_CHUNK = 500;

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const { tokenizeWithFrequency } = require('../text/tokenizer.js');

async function getVocabularySet() {
  const rows = await prisma.term.findMany({ select: { text: true } });
  return new Set(rows.map(r => r.text));
}

/**
 * Garante que cada termo existe na tabela Term e devolve o mapa texto -> id.
 *
 * É `INSERT OR IGNORE` escrito à mão, e não `createMany`, porque o mesmo termo
 * aparece em dezenas de documentos e a segunda gravação violaria `text @unique`.
 * O jeito normal de resolver isso seria `createMany({ skipDuplicates: true })`,
 * mas `skipDuplicates` não existe no conector SQLite do Prisma.
 *
 * O statement é montado com várias tuplas (`VALUES (?,?), (?,?), …`) — a mesma
 * forma que o `createMany` gera sozinho para PostingTerm/ApplicationTerm. Um
 * statement por termo custaria uma travessia JS -> engine cada (~0,1 ms), e uma
 * descrição de vaga rende ~300 termos. Medido: 227 ms em 2271 statements contra
 * 59 ms em 10.
 *
 * A transação em volta continua necessária por outro motivo: sem ela cada
 * statement vira uma transação autocommit e o SQLite (journal_mode=delete,
 * synchronous=FULL) paga um fsync por statement.
 *
 * `INSERT OR IGNORE` absorve tanto conflito com linha já gravada quanto termo
 * repetido dentro do próprio lote — o que acontece em `indexApplication`, que
 * concatena os termos do CV com os da CL.
 */
async function ensureTerms(terms) {
  await prisma.$transaction(async (tx) => {
    for (const slice of chunk(terms, TERM_INSERT_CHUNK)) {
      const values = Prisma.join(slice.map(t => Prisma.sql`(${t.text}, ${t.n})`));
      await tx.$executeRaw`INSERT OR IGNORE INTO "Term" ("text", "n") VALUES ${values}`;
    }
  });
  const rows = await prisma.term.findMany({ where: { text: { in: terms.map(t => t.text) } } });
  return new Map(rows.map(r => [r.text, r.id]));
}

/**
 * Quando `vocabulary` é passado, o Set é reaproveitado entre documentos (lote de
 * arquivamento, reindexAll) em vez de reler a tabela Term a cada chamada — e os
 * termos criados aqui são somados a ele. Sem essa soma, o documento seguinte do
 * mesmo lote deixaria de dobrar o plural de um termo recém-criado, divergindo do
 * comportamento de reler o vocabulário toda vez.
 */
async function indexPosting(posting, vocabulary) {
  const vocab = vocabulary || await getVocabularySet();
  const terms = tokenizeWithFrequency(posting.descriptionText, vocab);

  await prisma.postingTerm.deleteMany({ where: { postingId: posting.id } });

  if (terms.length) {
    const termIdByText = await ensureTerms(terms);
    await prisma.postingTerm.createMany({
      data: terms.map(t => ({ postingId: posting.id, termId: termIdByText.get(t.text), tf: t.tf }))
    });
    for (const t of terms) vocab.add(t.text);
  }

  await prisma.jobPosting.update({ where: { id: posting.id }, data: { tokenizerVersion: CURRENT_VERSION } });
  return terms.length;
}

function buildCvText(cv) {
  if (!cv) return '';
  const parts = [
    cv.titulo, cv.subtitulo, cv.resumo,
    ...(cv.skills || []),
    ...(cv.experiencias || []).flatMap(e => [...(e.bullets || []), e.stack]),
    ...(cv.projetos || []).map(p => p.descricao)
  ];
  // Une com ". " (não só espaço) para o tokenizer enxergar fronteira de campo
  // e não formar bigrama espúrio entre o fim de um campo e o início do próximo.
  return parts.filter(Boolean).join('. ');
}

function buildClText(cl) {
  if (!cl || !cl.paragrafos) return '';
  return cl.paragrafos.join('. ');
}

async function indexApplication(application, vocabulary) {
  const vocab = vocabulary || await getVocabularySet();

  const cvTerms = tokenizeWithFrequency(buildCvText(application.cv), vocab);
  const clTerms = tokenizeWithFrequency(buildClText(application.cl), vocab);
  const allTerms = [...cvTerms, ...clTerms];

  await prisma.applicationTerm.deleteMany({ where: { applicationId: application.id } });

  if (allTerms.length) {
    const termIdByText = await ensureTerms(allTerms);
    const rows = [
      ...cvTerms.map(t => ({ applicationId: application.id, termId: termIdByText.get(t.text), source: 'CV', tf: t.tf })),
      ...clTerms.map(t => ({ applicationId: application.id, termId: termIdByText.get(t.text), source: 'CL', tf: t.tf }))
    ];
    await prisma.applicationTerm.createMany({ data: rows });
    for (const t of allTerms) vocab.add(t.text);
  }

  await prisma.application.update({ where: { id: application.id }, data: { tokenizerVersion: CURRENT_VERSION } });
  return allTerms.length;
}

/**
 * Reindexa tudo que está com tokenizerVersion desatualizado (ou tudo, com
 * force). Idempotente — chamado após arquivar (só a linha nova) ou manualmente
 * via /api/maintenance/reindex depois de mudar tokenizer/stopwords.
 */
async function reindexAll({ force = false } = {}) {
  const vocabulary = await getVocabularySet();

  const versionFilter = force ? {} : { tokenizerVersion: { lt: CURRENT_VERSION } };

  const postings = await prisma.jobPosting.findMany({ where: versionFilter });
  for (const posting of postings) {
    await indexPosting(posting, vocabulary);
  }

  const applications = await prisma.application.findMany({ where: versionFilter });
  for (const application of applications) {
    await indexApplication(application, vocabulary);
  }

  await settingsService.setSetting('tokenizerVersion', CURRENT_VERSION);

  // Reindexar pode mudar quais termos existem/em quais postings — invalida
  // o cache de TermInsight mesmo sem nenhuma candidatura nova.
  if (postings.length || applications.length) {
    await settingsService.bumpInsightsDataVersion();
  }

  return { postingsIndexed: postings.length, applicationsIndexed: applications.length, tokenizerVersion: CURRENT_VERSION };
}

module.exports = { getVocabularySet, indexPosting, indexApplication, reindexAll, CURRENT_VERSION };
