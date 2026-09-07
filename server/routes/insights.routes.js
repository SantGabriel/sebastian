const express = require('express');
const insightsService = require('../services/insights.service');
const insightsCacheService = require('../services/insights-cache.service');
const { withErrorHandling } = require('./route-helpers');

const router = express.Router();

router.get('/insights/vocabulary', withErrorHandling('VOCABULARY_FAILED', async (req, res) => {
  const scope = (req.query.scope || 'posting').toLowerCase();
  const result = await insightsCacheService.getVocabulary(scope);
  res.json(result);
}));

router.get('/insights/overview', withErrorHandling('OVERVIEW_FAILED', async (req, res) => {
  const windowDays = Number(req.query.windowDays) || undefined;
  res.json(await insightsService.getOverview({ windowDays }));
}));

router.get('/insights/terms', withErrorHandling('TERMS_FAILED', async (req, res) => {
  const { scope, n, minDf, maxDfRatio, windowDays, limit } = req.query;
  res.json(await insightsService.getTermsInsight({
    scope: scope || 'posting',
    n: n || undefined,
    minDf: minDf ? Number(minDf) : undefined,
    maxDfRatio: maxDfRatio ? Number(maxDfRatio) : undefined,
    windowDays: windowDays ? Number(windowDays) : undefined,
    limit: limit ? Number(limit) : undefined
  }));
}));

router.get('/insights/companies', withErrorHandling('COMPANIES_FAILED', async (req, res) => {
  const minApplications = Number(req.query.minApplications) || 1;
  res.json({ companies: await insightsService.getCompanies({ minApplications }) });
}));

module.exports = router;
