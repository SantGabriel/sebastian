const prisma = require('../db/client');

const INSIGHTS_DATA_VERSION_KEY = 'insightsDataVersion';

const DEFAULTS = { silenceDays: '30', tokenizerVersion: '0', [INSIGHTS_DATA_VERSION_KEY]: '0' };

async function getSetting(key) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? row.value : (DEFAULTS[key] ?? null);
}

async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) }
  });
}

async function getSilenceDays() {
  const v = await getSetting('silenceDays');
  return Number(v) || 30;
}

/**
 * Sobe toda vez que algo que afeta o cálculo de conversão em entrevista muda:
 * nova candidatura arquivada, ou etapa adicionada/editada/removida. A tabela
 * TermInsight só é recalculada quando essa versão diverge da versão com que
 * foi computada pela última vez — ver insights-cache.service.js.
 */
async function bumpInsightsDataVersion() {
  const current = Number(await getSetting(INSIGHTS_DATA_VERSION_KEY)) || 0;
  const next = current + 1;
  await setSetting(INSIGHTS_DATA_VERSION_KEY, next);
  return next;
}

async function getInsightsDataVersion() {
  return Number(await getSetting(INSIGHTS_DATA_VERSION_KEY)) || 0;
}

module.exports = { getSetting, setSetting, getSilenceDays, bumpInsightsDataVersion, getInsightsDataVersion };
