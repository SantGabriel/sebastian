const express = require('express');
const prisma = require('../db/client');
const indexerService = require('../services/indexer.service');
const { withErrorHandling } = require('./route-helpers');

const router = express.Router();

router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: true });
  } catch (err) {
    res.status(500).json({ ok: false, db: false, error: err.message });
  }
});

router.post('/maintenance/reindex', withErrorHandling('REINDEX_FAILED', async (req, res) => {
  const force = req.body?.force === true;
  const result = await indexerService.reindexAll({ force });
  res.json(result);
}));

module.exports = router;
