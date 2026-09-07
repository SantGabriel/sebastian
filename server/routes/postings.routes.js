const express = require('express');
const postingsService = require('../services/postings.service');
const { withErrorHandling } = require('./route-helpers');

const router = express.Router();

router.post('/postings/discard', withErrorHandling('DISCARD_FAILED', async (req, res) => {
  const { jobId } = req.body || {};
  if (!jobId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'jobId obrigatório' } });

  const result = await postingsService.discardPosting({ jobId });
  if (!result) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vaga já foi removida' } });
  res.json({ discarded: true, jobId });
}, { CONCURRENT_MODIFICATION: 409 }));

router.get('/postings/check', withErrorHandling('CHECK_FAILED', async (req, res) => {
  const jobId = req.query.jobId;
  if (!jobId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'jobId obrigatório' } });

  const result = await postingsService.checkPosting(jobId);
  if (!result) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Vaga já foi removida' } });
  res.json(result);
}));

module.exports = router;
