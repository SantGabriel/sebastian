const prisma = require('../db/client');
const settingsService = require('./settings.service');
const insightsService = require('./insights.service');

const DEFAULT_PARAMS = { minDf: 3, maxDfRatio: 0.6, windowDays: 21, limit: 200 };

function computedVersionKey(scope) {
  return `insightsComputedVersion:${scope}`;
}

function metaKey(scope) {
  return `insightsMeta:${scope}`;
}

function formatRow(row) {
  return {
    term: row.term.text,
    n: row.term.n,
    df: row.df,
    withTerm: { n: row.withTermTotal, interviewed: row.withTermInterviewed },
    withoutTerm: { n: row.withoutTermTotal, interviewed: row.withoutTermInterviewed },
    lift: row.lift,
    wilsonLower: row.wilsonLower,
    direction: row.direction
  };
}

async function loadFromDb(scope) {
  const metaRaw = await settingsService.getSetting(metaKey(scope));
  const meta = metaRaw ? JSON.parse(metaRaw) : null;

  const rows = await prisma.termInsight.findMany({
    where: { scope: scope.toUpperCase() },
    include: { term: true },
    orderBy: { wilsonLower: 'desc' }
  });

  return { meta, terms: rows.map(formatRow), fromCache: true };
}

async function recomputeAndPersist(scope, dataVersion) {
  const fresh = await insightsService.getTermsInsight({ scope, ...DEFAULT_PARAMS });

  await prisma.$transaction([
    prisma.termInsight.deleteMany({ where: { scope: scope.toUpperCase() } }),
    ...(fresh.terms.length
      ? [prisma.termInsight.createMany({
        data: fresh.terms.map(t => ({
          termId: t.termId,
          scope: scope.toUpperCase(),
          df: t.df,
          withTermTotal: t.withTerm.n,
          withTermInterviewed: t.withTerm.interviewed,
          withoutTermTotal: t.withoutTerm.n,
          withoutTermInterviewed: t.withoutTerm.interviewed,
          lift: t.lift,
          wilsonLower: t.wilsonLower,
          direction: t.direction
        }))
      })]
      : [])
  ]);

  await settingsService.setSetting(metaKey(scope), JSON.stringify(fresh.meta));
  await settingsService.setSetting(computedVersionKey(scope), dataVersion);

  return { meta: fresh.meta, terms: fresh.terms.map(t => ({ ...t, termId: undefined })), fromCache: false };
}

/**
 * Consultado tanto pela página de insights quanto pelo agent-cv.md. Só
 * recalcula quando Setting['insightsDataVersion'] mudou desde a última vez
 * que este escopo foi computado — caso contrário serve direto da tabela
 * TermInsight, sem refazer a agregação.
 */
async function getVocabulary(scope = 'posting') {
  const currentVersion = await settingsService.getInsightsDataVersion();
  const computedVersionRaw = await settingsService.getSetting(computedVersionKey(scope));
  const computedVersion = computedVersionRaw !== null ? Number(computedVersionRaw) : -1;

  if (computedVersion === currentVersion) {
    return loadFromDb(scope);
  }

  return recomputeAndPersist(scope, currentVersion);
}

module.exports = { getVocabulary };
