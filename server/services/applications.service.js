const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const prisma = require('../db/client');
const settingsService = require('./settings.service');
const indexerService = require('./indexer.service');
const jobsDataService = require('./jobs-data.service');
const normalize = require('../text/normalize.js');
const { reachedInterview } = require('../lib/stage-events.js');
// ESM síncrono via require() — suportado a partir do Node 20.19/22.12. O
// constants.js segue ESM porque também é consumido pelo browser (candidaturas.js,
// insights.js); código só-do-server mora em server/ e é CJS, como o text/.
const { STAGES, OUTCOMES } = require('../../src/js/domain/constants.js');

const PAGE_SIZE_DEFAULT = 10;
const SORTABLE_FIELDS = ['appliedAt', 'currentStageAt', 'titulo', 'fitScore', 'createdAt'];

const CANDIDATE_PATH = path.join(__dirname, '../../src/json/candidate-data.js');
const CANDIDATE_URL = pathToFileURL(CANDIDATE_PATH).href;

/**
 * "Sem resposta": em andamento e sem movimentação há mais de `silenceDays`.
 * Baseado na ÚLTIMA movimentação (currentStageAt), não na data de candidatura.
 */
function isSilent(application, silenceDays = 30) {
  if (application.outcome !== OUTCOMES.EM_ANDAMENTO) return false;
  const currentStageAt = new Date(application.currentStageAt);
  const diffDays = (Date.now() - currentStageAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= silenceDays;
}

function buildWhere({ stage, outcome, companyId, from, to }, qKey) {
  const where = {};
  if (stage) where.currentStage = stage;
  if (outcome) where.outcome = outcome;
  if (companyId) where.companyId = companyId;
  if (from || to) {
    where.appliedAt = {};
    if (from) where.appliedAt.gte = new Date(from);
    if (to) where.appliedAt.lte = new Date(to);
  }
  if (qKey) {
    where.OR = [
      { tituloKey: { contains: qKey } },
      { company: { nameKey: { contains: qKey } } }
    ];
  }
  return where;
}

async function listApplications(query = {}) {
  const silenceDays = await settingsService.getSilenceDays();

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || PAGE_SIZE_DEFAULT));
  const qKey = query.q ? normalize.toKey(query.q) : null;
  const where = buildWhere(query, qKey);

  const [sortFieldRaw, sortDirRaw] = (query.sort || 'appliedAt:desc').split(':');
  const sortField = SORTABLE_FIELDS.includes(sortFieldRaw) ? sortFieldRaw : 'appliedAt';
  const sortDir = sortDirRaw === 'asc' ? 'asc' : 'desc';

  const [rows, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { company: true }
    }),
    prisma.application.count({ where })
  ]);

  const items = rows.map(app => ({ ...app, silent: isSilent(app, silenceDays) }));
  return { items, total, page, pageSize };
}

async function getApplication(id) {
  const silenceDays = await settingsService.getSilenceDays();

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      company: true,
      // createdAt desempata etapas do mesmo dia: a cadastrada por último fica
      // por último na linha do tempo, igual ao critério de "etapa atual".
      stageEvents: { orderBy: [{ occurredAt: 'asc' }, { createdAt: 'asc' }] },
      posting: { select: { descriptionHash: true, descriptionText: true, seenCount: true, firstSeenAt: true } }
    }
  });
  if (!app) return null;

  return { ...app, silent: isSilent(app, silenceDays), reachedInterview: reachedInterview(app.stageEvents) };
}

async function patchApplication(id, patch) {
  const data = {};
  if (patch.appliedAt !== undefined) data.appliedAt = new Date(patch.appliedAt);
  if (patch.link !== undefined) data.link = patch.link || null;
  if (patch.notes !== undefined) data.notes = patch.notes || null;
  if (patch.titulo !== undefined) {
    data.titulo = patch.titulo;
    data.tituloKey = normalize.toKey(patch.titulo);
  }
  if (patch.companyName !== undefined) {
    const nameKey = normalize.toKey(patch.companyName);
    const company = await prisma.company.upsert({
      where: { nameKey },
      update: { name: patch.companyName },
      create: { name: patch.companyName, nameKey }
    });
    data.companyId = company.id;
  }

  return prisma.application.update({ where: { id }, data, include: { company: true } });
}

/** Hard delete: cascata de StageEvent/ApplicationTerm via Prisma, JobPosting preservado. */
async function deleteApplication(id) {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) return null;

  await prisma.application.delete({ where: { id } });

  try {
    await settingsService.bumpInsightsDataVersion();
  } catch (err) {
    console.error('Falha ao invalidar cache de insights (não bloqueia a exclusão):', err);
  }

  return app;
}

async function getCandidateData() {
  if (!fs.existsSync(CANDIDATE_PATH)) return {};
  const stat = fs.statSync(CANDIDATE_PATH);
  const mod = await import(`${CANDIDATE_URL}?v=${stat.mtimeMs}-${stat.size}`);
  return mod.CANDIDATE_DATA || {};
}

/**
 * Data "pura" de hoje: meia-noite UTC do dia do calendário local.
 *
 * Todo occurredAt que entra pelo formulário vem de um <input type="date">, ou
 * seja, meia-noite UTC. Se appliedAt fosse `new Date()` (instante real), à
 * noite no Brasil (UTC-3) ele cairia no dia UTC seguinte — o card mostraria
 * "10/08" e a etapa "Currículo" 11/08, e pior: o evento CURRICULO teria
 * occurredAt MAIOR que uma etapa cadastrada depois no mesmo dia, virando
 * "etapa atual" para sempre.
 */
function todayAsPureDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Só leitura — não cria nem incrementa nada. Usado para checar duplicata antes de decidir se um novo "sighting" de fato aconteceu. */
async function findExistingPosting({ job }) {
  const { toKey, hashDescription } = normalize;
  const descriptionHash = hashDescription(job.vagaTexto || '');
  const tituloKey = toKey(job.vaga);

  const existingPosting = await prisma.jobPosting.findUnique({ where: { descriptionHash } });

  return { descriptionHash, tituloKey, existingPosting };
}

/**
 * Só é chamado quando já se sabe que uma Application nova será criada —
 * é aqui que seenCount incrementa e discardedAt é limpo. Chamar isso antes
 * de confirmar que não é um re-arquivamento idempotente infla seenCount
 * a cada duplo-clique em "salvar", contaminando o sinal de repostagem (Fase 4).
 */
async function upsertCompanyAndPosting({ job, descriptionHash, tituloKey }) {
  const { normalizeForHash } = normalize;

  let company = null;
  if (job.empresa) {
    const nameKey = normalize.toKey(job.empresa);
    company = await prisma.company.upsert({
      where: { nameKey },
      update: { name: job.empresa },
      create: { name: job.empresa, nameKey }
    });
  }

  const normalizedLength = normalizeForHash(job.vagaTexto || '').length;

  const existingPosting = await prisma.jobPosting.findUnique({ where: { descriptionHash } });
  const posting = existingPosting
    ? await prisma.jobPosting.update({
      where: { id: existingPosting.id },
      data: {
        lastSeenAt: new Date(),
        seenCount: { increment: 1 },
        discardedAt: null,
        companyId: company ? company.id : existingPosting.companyId
      }
    })
    : await prisma.jobPosting.create({
      data: {
        descriptionHash,
        descriptionText: job.vagaTexto || '',
        normalizedLength,
        titulo: job.vaga,
        tituloKey,
        companyId: company ? company.id : null,
        lang: job.lang || null
      }
    });

  return { company, posting };
}

/**
 * A identidade de "já me candidatei a essa vaga" é o JobPosting (hash exato
 * do texto), não a data do clique em "Salvar". Antes isso era restrito ao
 * mesmo dia UTC — bastava clicar "Salvar" de novo em outra sessão/dia para
 * a mesma vaga já arquivada que uma segunda Application idêntica era criada.
 */
async function findExistingApplication({ postingId }) {
  return prisma.application.findFirst({ where: { postingId } });
}

async function archiveOne({ job, candidateData, appliedAt, vocabulary }) {
  const cvAuthorized = !!(job.cv && job.cv.authorized === true);
  const clAuthorized = !!(job.cl && job.cl.authorized === true);
  if (!cvAuthorized && !clAuthorized) {
    return { status: 'skipped', jobId: job.id, reason: 'CV e CL não autorizados' };
  }

  const { descriptionHash, tituloKey, existingPosting } = await findExistingPosting({ job });

  if (existingPosting) {
    const existingApp = await findExistingApplication({ postingId: existingPosting.id });
    if (existingApp) {
      return { status: 'exists', jobId: job.id, application: existingApp };
    }
  }

  const { company, posting } = await upsertCompanyAndPosting({ job, descriptionHash, tituloKey });

  const cvSnapshot = cvAuthorized ? job.cv : null;
  const clSnapshot = clAuthorized ? job.cl : null;

  let application;
  try {
    application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          sourceJobId: job.id,
          postingId: posting.id,
          companyId: company ? company.id : null,
          titulo: job.vaga,
          tituloKey,
          lang: job.lang || 'pt',
          link: job.link || null,
          modalidade: job.modalidade || null,
          contratacao: job.contratacao || null,
          cidadeVaga: job.cidadeVaga || null,
          candidaturaAviso: job.candidatura ? job.candidatura.aviso : null,
          candidaturaUrl: job.candidatura ? job.candidatura.url : null,
          fit: job.fit,
          fitScore: job.fit ? job.fit.score : null,
          cv: cvSnapshot,
          cl: clSnapshot,
          candidate: candidateData,
          appliedAt,
          currentStage: STAGES.CURRICULO,
          currentStageAt: appliedAt,
          outcome: OUTCOMES.EM_ANDAMENTO
        }
      });

      await tx.stageEvent.create({
        data: { applicationId: created.id, stage: STAGES.CURRICULO, occurredAt: appliedAt }
      });

      return created;
    });
  } catch (err) {
    // P2002 na constraint única de postingId: duas requisições de /applications/batch
    // concorrentes (ex.: duplo clique) passaram ambas pelo findExistingApplication
    // antes de qualquer uma ter commitado. A constraint do banco é quem realmente
    // impede a segunda gravação; aqui só traduzimos isso para o mesmo status
    // que o caminho não-concorrente já usa.
    if (err.code === 'P2002') {
      const existingApp = await findExistingApplication({ postingId: posting.id });
      return { status: 'exists', jobId: job.id, application: existingApp };
    }
    throw err;
  }

  // Indexa já na hora de arquivar — sem isso, os termos só apareceriam nos
  // insights depois de um reindex manual, o que não é razoável esperar do usuário.
  try {
    await indexerService.indexPosting(posting, vocabulary);
    const freshApplication = await prisma.application.findUnique({ where: { id: application.id } });
    await indexerService.indexApplication(freshApplication, vocabulary);
  } catch (err) {
    console.error('Falha ao indexar termos (não bloqueia o arquivamento):', err);
  }

  const full = await prisma.application.findUnique({
    where: { id: application.id },
    include: { stageEvents: true, company: true }
  });
  return { status: 'archived', jobId: job.id, application: full };
}

async function archiveApplications({ jobIds }) {
  const [{ jobs }, candidateData] = await Promise.all([
    jobsDataService.readJobs(),
    getCandidateData()
  ]);

  // Vocabulário lido uma vez para o lote inteiro em vez de duas vezes por vaga
  // (indexPosting + indexApplication). Os dois acrescentam nele os termos que
  // criam, então o resultado é idêntico a reler a tabela Term a cada documento.
  const vocabulary = await indexerService.getVocabularySet();

  const appliedAt = todayAsPureDate();
  const results = [];
  for (const jobId of jobIds) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      results.push({ status: 'not_found', jobId });
      continue;
    }
    try {
      results.push(await archiveOne({ job, candidateData, appliedAt, vocabulary }));
    } catch (err) {
      results.push({ status: 'error', jobId, error: err.message });
    }
  }

  // Candidatura nova muda a taxa de conversão e invalida o cache de TermInsight
  // (ver insights-cache.service.js). Uma bump por lote basta: o cache só compara
  // se a versão divergiu da última calculada, não quantas vezes ela subiu.
  if (results.some(r => r.status === 'archived')) {
    await settingsService.bumpInsightsDataVersion();
  }

  return results;
}

async function getDocumentData(applicationId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { company: true }
  });
  if (!application) return null;

  return {
    job: {
      id: application.id,
      vaga: application.titulo,
      lang: application.lang,
      empresa: application.company ? application.company.name : undefined,
      modalidade: application.modalidade,
      cidadeVaga: application.cidadeVaga,
      cv: application.cv,
      cl: application.cl || { authorized: false }
    },
    candidate: application.candidate
  };
}

async function getSyncStatus() {
  const { jobs } = await jobsDataService.readJobs();

  const hashes = jobs.map(job => normalize.hashDescription(job.vagaTexto || ''));
  const existingPostings = hashes.length
    ? await prisma.jobPosting.findMany({
      where: { descriptionHash: { in: hashes } },
      include: { applications: { select: { id: true } } }
    })
    : [];
  const byHash = new Map(existingPostings.map(p => [p.descriptionHash, p]));

  const items = jobs.map(job => {
    const hash = normalize.hashDescription(job.vagaTexto || '');
    const posting = byHash.get(hash);
    const archived = !!(posting && posting.applications.length > 0);
    return { jobId: job.id, vaga: job.vaga, empresa: job.empresa, archived };
  });

  return { items, pendingCount: items.filter(i => !i.archived).length };
}

module.exports = {
  listApplications, getApplication, patchApplication, deleteApplication,
  archiveApplications, getDocumentData, getSyncStatus
};
