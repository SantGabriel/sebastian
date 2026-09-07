const prisma = require('../db/client');
const jobsDataService = require('./jobs-data.service');
const normalize = require('../text/normalize.js');

const NEAR_DUPLICATE_WINDOW_DAYS = 30;
const NEAR_DUPLICATE_LENGTH_TOLERANCE = 0.1;

/**
 * Duas perguntas diferentes:
 * 1) "É literalmente o mesmo texto?" — hash exato, zero falso positivo.
 * 2) "É a mesma vaga com uma frase mexida?" — heurística sem matemática:
 *    mesma empresa + mesmo título normalizado + tamanho parecido + janela de tempo.
 * Chamado ao renderizar o dashboard, ANTES do usuário se candidatar.
 */
async function checkPosting(jobId) {
  const { jobs } = await jobsDataService.readJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;

  const descriptionHash = normalize.hashDescription(job.vagaTexto || '');
  const tituloKey = normalize.toKey(job.vaga);
  const normalizedLength = normalize.normalizeForHash(job.vagaTexto || '').length;

  const exactPosting = await prisma.jobPosting.findUnique({
    where: { descriptionHash },
    include: {
      applications: {
        select: { id: true, sourceJobId: true, titulo: true, appliedAt: true, outcome: true, company: { select: { name: true } } }
      }
    }
  });

  let nearDuplicates = [];
  if (job.empresa) {
    const company = await prisma.company.findUnique({ where: { nameKey: normalize.toKey(job.empresa) } });
    if (company) {
      const minLen = Math.floor(normalizedLength * (1 - NEAR_DUPLICATE_LENGTH_TOLERANCE));
      const maxLen = Math.ceil(normalizedLength * (1 + NEAR_DUPLICATE_LENGTH_TOLERANCE));
      const since = new Date(Date.now() - NEAR_DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

      nearDuplicates = await prisma.jobPosting.findMany({
        where: {
          id: exactPosting ? { not: exactPosting.id } : undefined,
          companyId: company.id,
          tituloKey,
          lastSeenAt: { gte: since },
          normalizedLength: { gte: minLen, lte: maxLen }
        },
        select: { id: true, titulo: true, firstSeenAt: true, lastSeenAt: true, seenCount: true, discardedAt: true },
        take: 5
      });
    }
  }

  if (!exactPosting) {
    return {
      exactMatch: false,
      seenCount: 0,
      firstSeenAt: null,
      discarded: null,
      previousApplications: [],
      nearDuplicates
    };
  }

  return {
    exactMatch: true,
    hash: descriptionHash,
    seenCount: exactPosting.seenCount,
    firstSeenAt: exactPosting.firstSeenAt,
    discarded: exactPosting.discardedAt
      ? { discardedAt: exactPosting.discardedAt }
      : null,
    // Exclui a Application que a PRÓPRIA vaga sendo checada já gerou — isso é
    // "salvo", não "repostagem" (o badge "Salvo ✓" do dashboard já cobre esse caso).
    previousApplications: exactPosting.applications.filter(a => a.sourceJobId !== jobId).map(a => ({
      id: a.id,
      titulo: a.titulo,
      empresa: a.company ? a.company.name : null,
      appliedAt: a.appliedAt,
      outcome: a.outcome
    })),
    nearDuplicates
  };
}

async function discardPosting({ jobId }) {
  const removedJob = await jobsDataService.removeJob(jobId);
  if (!removedJob) return null;

  const descriptionHash = normalize.hashDescription(removedJob.vagaTexto || '');
  const tituloKey = normalize.toKey(removedJob.vaga);
  const normalizedLength = normalize.normalizeForHash(removedJob.vagaTexto || '').length;

  let companyId = null;
  if (removedJob.empresa) {
    const nameKey = normalize.toKey(removedJob.empresa);
    const company = await prisma.company.upsert({
      where: { nameKey },
      update: { name: removedJob.empresa },
      create: { name: removedJob.empresa, nameKey }
    });
    companyId = company.id;
  }

  const existing = await prisma.jobPosting.findUnique({ where: { descriptionHash } });
  const posting = existing
    ? await prisma.jobPosting.update({
      where: { id: existing.id },
      data: { discardedAt: new Date(), lastSeenAt: new Date() }
    })
    : await prisma.jobPosting.create({
      data: {
        descriptionHash,
        descriptionText: removedJob.vagaTexto || '',
        normalizedLength,
        titulo: removedJob.vaga,
        tituloKey,
        companyId,
        lang: removedJob.lang || null,
        discardedAt: new Date()
      }
    });

  return { removedJob, posting };
}

module.exports = { checkPosting, discardPosting };
