const express = require('express');
const stageService = require('../services/stage.service');
const { withErrorHandling } = require('./route-helpers');

const router = express.Router();

router.post('/applications/:id/stages', withErrorHandling('ADD_STAGE_FAILED', async (req, res) => {
  const { stage, occurredAt, note } = req.body || {};
  if (!stage || !occurredAt) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'stage e occurredAt são obrigatórios' } });
  }
  const application = await stageService.addStage({
    applicationId: req.params.id, stage, occurredAt: new Date(occurredAt), note
  });
  if (!application) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidatura não encontrada' } });
  res.status(201).json({ application });
}));

router.patch('/applications/:id/stages/:eventId', withErrorHandling('UPDATE_STAGE_FAILED', async (req, res) => {
  const { occurredAt, note } = req.body || {};
  const application = await stageService.updateStage({
    eventId: req.params.eventId,
    occurredAt: occurredAt !== undefined ? new Date(occurredAt) : undefined,
    note
  });
  if (!application) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Evento não encontrado' } });
  res.json({ application });
}));

router.delete('/applications/:id/stages/:eventId', withErrorHandling('REMOVE_STAGE_FAILED', async (req, res) => {
  const application = await stageService.removeStage({ eventId: req.params.eventId });
  if (!application) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Evento não encontrado' } });
  res.json({ application });
}, { LAST_STAGE_EVENT: 409 }));

module.exports = router;
