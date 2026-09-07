const express = require('express');
const applicationsService = require('../services/applications.service');
const { withErrorHandling } = require('./route-helpers');

const router = express.Router();

router.post('/applications/batch', withErrorHandling('ARCHIVE_FAILED', async (req, res) => {
  const jobIds = Array.isArray(req.body?.jobIds) ? req.body.jobIds : [];
  if (!jobIds.length) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'jobIds obrigatório' } });

  const results = await applicationsService.archiveApplications({ jobIds });
  res.status(201).json({ results });
}));

router.get('/applications/sync-status', withErrorHandling('SYNC_STATUS_FAILED', async (_req, res) => {
  const status = await applicationsService.getSyncStatus();
  res.json(status);
}));

router.get('/applications', withErrorHandling('LIST_FAILED', async (req, res) => {
  const result = await applicationsService.listApplications(req.query);
  res.json(result);
}));

router.get('/applications/:id/document-data', withErrorHandling('DOCUMENT_DATA_FAILED', async (req, res) => {
  const data = await applicationsService.getDocumentData(req.params.id);
  if (!data) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidatura não encontrada' } });
  res.json(data);
}));

router.get('/applications/:id', withErrorHandling('GET_FAILED', async (req, res) => {
  const application = await applicationsService.getApplication(req.params.id);
  if (!application) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidatura não encontrada' } });
  res.json({ application });
}));

router.patch('/applications/:id', withErrorHandling('PATCH_FAILED', async (req, res) => {
  const application = await applicationsService.patchApplication(req.params.id, req.body || {});
  res.json({ application });
}, { P2025: 404 }));

router.delete('/applications/:id', withErrorHandling('DELETE_FAILED', async (req, res) => {
  const removed = await applicationsService.deleteApplication(req.params.id);
  if (!removed) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidatura não encontrada' } });
  res.status(204).end();
}));

module.exports = router;
