const prisma = require('../db/client');
const settingsService = require('./settings.service');
const indexerService = require('./indexer.service');

const { reachedInterview } = require('../lib/stage-events.js');
// ESM síncrono via require() — ver nota em applications.service.js.
const { STAGE_LIST, STAGE_ORDER, STAGES, OUTCOMES } = require('../../src/js/domain/constants.js');

const MIN_RELIABLE_ELIGIBLE = 30;

function round(n, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Limite inferior de Wilson (95%) — penaliza amostra pequena, evita que 1/1 fique no topo do ranking. */
function wilsonLowerBound(successes, total, z = 1.96) {
  if (total === 0) return 0;
  const phat = successes / total;
  const denom = 1 + (z * z) / total;
  const centre = phat + (z * z) / (2 * total);
  const margin = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);
  return Math.max(0, (centre - margin) / denom);
}

/**
 * Censura: candidatura recente sem resposta não é fracasso, é indefinida —
 * só entra na conta se já chegou em entrevista, já tem outcome definido, ou
 * já passou tempo suficiente (windowDays) desde a candidatura.
 */
async function getEligibleApplications(windowDays) {
  const apps = await prisma.application.findMany({ include: { stageEvents: true } });
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  const withFlag = apps.map(a => ({ ...a, reachedInterviewFlag: reachedInterview(a.stageEvents) }));

  const eligible = withFlag.filter(a =>
    a.reachedInterviewFlag || a.outcome !== OUTCOMES.EM_ANDAMENTO || new Date(a.appliedAt).getTime() <= cutoff
  );

  return { total: apps.length, eligible, censoredExcluded: apps.length - eligible.length };
}

/**
 * Última etapa de andamento que a candidatura alcançou — ignora as terminais
 * (ordem 0). Mesma ordenação da linha do tempo (occurredAt, depois createdAt),
 * então é literalmente o último status antes do desfecho.
 */
function lastProgressStage(stageEvents, STAGE_ORDER) {
  const progress = (stageEvents || [])
    .filter(e => (STAGE_ORDER[e.stage] || 0) > 0)
    .sort((a, b) =>
      new Date(a.occurredAt) - new Date(b.occurredAt) || new Date(a.createdAt) - new Date(b.createdAt)
    );
  return progress.length ? progress[progress.length - 1].stage : null;
}

async function getOverview({ windowDays = 21 } = {}) {
  const all = await prisma.application.findMany({ include: { stageEvents: true } });

  const progressStages = STAGE_LIST.filter(s => (STAGE_ORDER[s] || 0) > 0);
  const funnel = Object.fromEntries(STAGE_LIST.map(s => [s, 0]));
  const rejectionFunnel = Object.fromEntries(progressStages.map(s => [s, 0]));
  let rejectionUnknown = 0;
  let totalRejected = 0;
  const outcomeCounts = {
    [OUTCOMES.EM_ANDAMENTO]: 0,
    [OUTCOMES.CONTRATADO]: 0,
    [OUTCOMES.REPROVADO]: 0,
    [OUTCOMES.PROPOSTA_RECUSADA]: 0
  };
  const monthly = {};
  const daysToInterview = [];

  for (const app of all) {
    if (funnel[app.currentStage] !== undefined) funnel[app.currentStage] += 1;
    outcomeCounts[app.outcome] = (outcomeCounts[app.outcome] || 0) + 1;

    const monthKey = new Date(app.appliedAt).toISOString().slice(0, 7);
    monthly[monthKey] = (monthly[monthKey] || 0) + 1;

    if (app.outcome === OUTCOMES.REPROVADO) {
      totalRejected += 1;
      const last = lastProgressStage(app.stageEvents, STAGE_ORDER);
      if (last && rejectionFunnel[last] !== undefined) rejectionFunnel[last] += 1;
      else rejectionUnknown += 1;
    }

    const curriculo = app.stageEvents.find(e => e.stage === STAGES.CURRICULO);
    const firstInterview = app.stageEvents
      .filter(e => (STAGE_ORDER[e.stage] || 0) >= STAGE_ORDER.ENTREVISTA_RH)
      .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt))[0];
    if (curriculo && firstInterview) {
      const days = (new Date(firstInterview.occurredAt) - new Date(curriculo.occurredAt)) / (1000 * 60 * 60 * 24);
      if (days >= 0) daysToInterview.push(days);
    }
  }

  const { eligible, censoredExcluded } = await getEligibleApplications(windowDays);
  const interviewed = eligible.filter(a => a.reachedInterviewFlag).length;

  return {
    total: all.length,
    funnel,
    rejectionFunnel,
    rejectionUnknown,
    totalRejected,
    outcomeCounts,
    monthlyVolume: Object.entries(monthly).sort().map(([month, count]) => ({ month, count })),
    medianDaysToInterview: median(daysToInterview),
    eligible: eligible.length,
    censoredExcluded,
    interviewed,
    conversionRate: eligible.length ? round(interviewed / eligible.length) : 0
  };
}

async function getTermsInsight({ scope = 'posting', n, minDf = 3, maxDfRatio = 0.6, windowDays = 21, limit = 30 } = {}) {
  const { total, eligible, censoredExcluded } = await getEligibleApplications(windowDays);
  const eligibleIds = eligible.map(a => a.id);
  const interviewByApp = new Map(eligible.map(a => [a.id, a.reachedInterviewFlag]));
  const totalEligible = eligible.length;
  const totalInterviewed = eligible.filter(a => a.reachedInterviewFlag).length;
  const baseRate = totalEligible ? totalInterviewed / totalEligible : 0;

  const appsByTerm = new Map();
  const termMeta = new Map();

  if (scope === 'posting') {
    const postings = await prisma.jobPosting.findMany({
      where: { applications: { some: { id: { in: eligibleIds } } } },
      include: {
        applications: { where: { id: { in: eligibleIds } }, select: { id: true } },
        terms: { include: { term: true } }
      }
    });
    for (const posting of postings) {
      const appIds = posting.applications.map(a => a.id);
      for (const pt of posting.terms) {
        if (n && pt.term.n !== Number(n)) continue;
        termMeta.set(pt.termId, pt.term);
        if (!appsByTerm.has(pt.termId)) appsByTerm.set(pt.termId, new Set());
        const set = appsByTerm.get(pt.termId);
        appIds.forEach(id => set.add(id));
      }
    }
  } else {
    const source = scope.toUpperCase();
    const rows = await prisma.applicationTerm.findMany({
      where: { source, applicationId: { in: eligibleIds }, ...(n ? { term: { n: Number(n) } } : {}) },
      include: { term: true }
    });
    for (const row of rows) {
      termMeta.set(row.termId, row.term);
      if (!appsByTerm.has(row.termId)) appsByTerm.set(row.termId, new Set());
      appsByTerm.get(row.termId).add(row.applicationId);
    }
  }

  const results = [];
  for (const [termId, appSet] of appsByTerm) {
    const df = appSet.size;
    if (df < minDf) continue;
    if (totalEligible && df / totalEligible > maxDfRatio) continue;

    let withInterview = 0;
    for (const appId of appSet) if (interviewByApp.get(appId)) withInterview += 1;

    const withoutCount = totalEligible - df;
    const withoutInterview = totalInterviewed - withInterview;
    const rateWith = df ? withInterview / df : 0;
    const rateWithout = withoutCount ? withoutInterview / withoutCount : 0;
    const lift = baseRate ? rateWith / baseRate : 0;

    const meta = termMeta.get(termId);
    results.push({
      termId,
      term: meta.text,
      n: meta.n,
      df,
      withTerm: { n: df, interviewed: withInterview, rate: round(rateWith) },
      withoutTerm: { n: withoutCount, interviewed: withoutInterview, rate: round(rateWithout) },
      lift: round(lift),
      wilsonLower: round(wilsonLowerBound(withInterview, df), 3),
      direction: rateWith >= baseRate ? 'positive' : 'negative'
    });
  }

  results.sort((a, b) => b.wilsonLower - a.wilsonLower);

  return {
    meta: {
      totalApplications: total,
      eligible: totalEligible,
      censoredExcluded,
      interviewed: totalInterviewed,
      baseRate: round(baseRate),
      minDf, maxDfRatio, windowDays,
      tokenizerVersion: indexerService.CURRENT_VERSION,
      reliable: totalEligible >= MIN_RELIABLE_ELIGIBLE
    },
    terms: results.slice(0, limit)
  };
}

async function getCompanies({ minApplications = 1 } = {}) {
  const companies = await prisma.company.findMany({
    include: { applications: { include: { stageEvents: true } } }
  });

  return companies
    .filter(c => c.applications.length >= minApplications)
    .map(c => {
      const apps = c.applications;
      const interviewed = apps.filter(a => reachedInterview(a.stageEvents)).length;
      return {
        id: c.id,
        name: c.name,
        applied: apps.length,
        interviewed,
        hired: apps.filter(a => a.outcome === OUTCOMES.CONTRATADO).length,
        rejected: apps.filter(a => a.outcome === OUTCOMES.REPROVADO).length,
        interviewRate: apps.length ? round(interviewed / apps.length) : 0
      };
    })
    .sort((a, b) => b.applied - a.applied);
}

module.exports = { getOverview, getTermsInsight, getCompanies, getEligibleApplications, wilsonLowerBound, round };
