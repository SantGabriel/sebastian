const prisma = require('../db/client');
const settingsService = require('./settings.service');

// ESM síncrono via require() — ver nota em applications.service.js.
const { stageToOutcome, STAGES } = require('../../src/js/domain/constants.js');

/**
 * Recalcula currentStage/currentStageAt/outcome/rejectionReason a partir do
 * histórico completo de StageEvent. "Atual" = evento de maior occurredAt;
 * em empate de data vence SEMPRE o cadastrado por último (createdAt), sem
 * privilegiar etapa terminal — é a mesma ordem em que a linha do tempo é
 * exibida, então o último item da lista é sempre a etapa atual.
 * Sem validação de sequência — a empresa pode pular etapa livremente.
 */
async function recompute(applicationId, tx = prisma) {
  const events = await tx.stageEvent.findMany({
    where: { applicationId },
    orderBy: [{ occurredAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }]
  });
  if (!events.length) return null;

  const current = events[events.length - 1];

  const outcome = stageToOutcome(current.stage);
  const rejectionReason = (current.stage === STAGES.REPROVADO || current.stage === STAGES.PROPOSTA_RECUSADA)
    ? (current.note || null)
    : null;

  return tx.application.update({
    where: { id: applicationId },
    data: { currentStage: current.stage, currentStageAt: current.occurredAt, outcome, rejectionReason }
  });
}

/** Etapa nova pode mudar quem "chegou a entrevista" — invalida o cache de TermInsight. */
async function bumpInsightsVersionSafely() {
  try {
    await settingsService.bumpInsightsDataVersion();
  } catch (err) {
    console.error('Falha ao invalidar cache de insights (não bloqueia a operação):', err);
  }
}

async function addStage({ applicationId, stage, occurredAt, note }) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.stageEvent.create({ data: { applicationId, stage, occurredAt, note: note || null } });
    return recompute(applicationId, tx);
  });
  await bumpInsightsVersionSafely();
  return result;
}

async function updateStage({ eventId, occurredAt, note }) {
  const event = await prisma.stageEvent.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const result = await prisma.$transaction(async (tx) => {
    const data = {};
    if (occurredAt !== undefined) data.occurredAt = occurredAt;
    if (note !== undefined) data.note = note;
    await tx.stageEvent.update({ where: { id: eventId }, data });
    return recompute(event.applicationId, tx);
  });
  await bumpInsightsVersionSafely();
  return result;
}

async function removeStage({ eventId }) {
  const event = await prisma.stageEvent.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const result = await prisma.$transaction(async (tx) => {
    const count = await tx.stageEvent.count({ where: { applicationId: event.applicationId } });
    if (count <= 1) {
      const err = new Error('Não é possível remover o único evento de etapa da candidatura.');
      err.code = 'LAST_STAGE_EVENT';
      throw err;
    }
    await tx.stageEvent.delete({ where: { id: eventId } });
    return recompute(event.applicationId, tx);
  });
  await bumpInsightsVersionSafely();
  return result;
}

module.exports = { addStage, updateStage, removeStage, recompute };
