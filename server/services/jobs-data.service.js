const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const JOBS_PATH = path.join(__dirname, '../../src/json/jobs-data.js');
const JOBS_URL = pathToFileURL(JOBS_PATH).href;

/**
 * Lê src/json/jobs-data.js na hora, sem cache stale. O arquivo é reescrito
 * externamente (pelo agente) a qualquer momento do processo, e não passa pelo
 * nodemon (que ignora src/json/** de propósito) — então o cache do import()
 * ESM precisa ser "invalidado" via query string toda vez que mtime/tamanho mudam.
 * (require.cache NÃO funciona aqui: Node trata este arquivo via o loader ESM
 * internamente, não pelo cache CJS normal — só import() é confiável.)
 */
async function readJobs() {
  if (!fs.existsSync(JOBS_PATH)) {
    return { jobs: [], mtimeMs: null };
  }

  const stat = fs.statSync(JOBS_PATH);
  const cacheBust = `${stat.mtimeMs}-${stat.size}`;
  const { JOBS } = await import(`${JOBS_URL}?v=${cacheBust}`);
  return { jobs: Array.isArray(JOBS) ? JOBS : Object.values(JOBS || {}), mtimeMs: stat.mtimeMs };
}

async function findJob(jobId) {
  const { jobs } = await readJobs();
  return jobs.find(j => j.id === jobId) || null;
}

function serialize(jobs) {
  const header = "/** @type {import('../interfaces/job-data').Job} */\nexport const JOBS = ";
  return header + JSON.stringify(jobs, null, 2) + ';\n';
}

/** Escrita atômica (grava em arquivo temporário e renomeia) para não deixar o arquivo pela metade. */
function writeJobs(jobs) {
  const tmpPath = JOBS_PATH + '.tmp';
  fs.writeFileSync(tmpPath, serialize(jobs));
  fs.renameSync(tmpPath, JOBS_PATH);
}

/**
 * Remove uma vaga do jobs-data.js e reatribui os `index` (regra do AGENTS.md).
 * Confere se o arquivo não mudou entre a leitura e a escrita (o agente pode
 * estar editando ao mesmo tempo); se mudou, lança para o chamador decidir.
 */
async function removeJob(jobId) {
  const { jobs, mtimeMs } = await readJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;

  const remaining = jobs.filter(j => j.id !== jobId).map((j, i) => ({ ...j, index: i + 1 }));

  const currentMtimeMs = fs.existsSync(JOBS_PATH) ? fs.statSync(JOBS_PATH).mtimeMs : null;
  if (currentMtimeMs !== mtimeMs) {
    const err = new Error('src/json/jobs-data.js foi modificado por outro processo — tente novamente.');
    err.code = 'CONCURRENT_MODIFICATION';
    throw err;
  }

  writeJobs(remaining);
  return job;
}

module.exports = { JOBS_PATH, readJobs, findJob, removeJob };
