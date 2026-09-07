const express = require('express');
const { renderPdfBuffer } = require('../services/pdf.service');
const { sanitizeFilenamePart } = require('../text/normalize.js');

const router = express.Router();

router.get('/pdf', async (req, res) => {
  const jobId = req.query.job;
  const applicationId = req.query.application || '';
  const doc = (req.query.doc || 'cv').toString().toLowerCase();
  const isGeneric = req.query.isGeneric || '';
  const candidate = req.query.candidate || '';
  const vaga = req.query.vaga || '';
  const empresa = req.query.empresa || '';
  const candidateName = req.query.candidateName || '';
  if (!jobId && !applicationId) return res.status(400).send('Parâmetro ?job= ou ?application= obrigatório');

  const pagePath = doc === 'cl' ? 'src/pages/cl.html' : 'src/pages/cv.html';

  const pageQuery = applicationId ? { application: applicationId } : { job: jobId };
  if (isGeneric) pageQuery.isGeneric = isGeneric;
  if (candidate) pageQuery.candidate = candidate;

  try {
    const pdf = await renderPdfBuffer({ pagePath, query: pageQuery, port: req.app.get('port') });

    const cleanVaga = sanitizeFilenamePart(vaga);
    const cleanEmpresa = sanitizeFilenamePart(empresa);
    const cleanCandidateName = sanitizeFilenamePart(candidateName);

    const parts = [cleanVaga, cleanEmpresa, cleanCandidateName].filter(Boolean);
    const filename = parts.join(' - ') + '.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length
    });
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF: ' + err.message);
  }
});

module.exports = router;
