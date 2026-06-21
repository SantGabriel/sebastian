const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static(__dirname));

app.get('/pdf', async (req, res) => {
  const jobId = req.query.job;
  const doc = (req.query.doc || 'cv').toString().toLowerCase();
  const isGeneric = req.query.isGeneric || '';
  const candidate = req.query.candidate || '';
  if (!jobId) return res.status(400).send('Parâmetro ?job= obrigatório');

  const pageName = doc === 'cl' ? 'src/pages/cl.html' : 'src/pages/cv.html';

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const pageParams = new URLSearchParams({ job: jobId });
    if (isGeneric) pageParams.set('isGeneric', isGeneric);
    if (candidate) pageParams.set('candidate', candidate);
    await page.goto(`http://localhost:${PORT}/${pageName}?${pageParams}`, { waitUntil: 'networkidle0' });

    const { pdfData, contentHeightMm } = await page.evaluate(() => {
      const mmToPx = 96 / 25.4;
      const totalMm = document.body.scrollHeight / mmToPx + 12 * 2;
      return {
        pdfData: window._pdfData || {},
        contentHeightMm: Math.max(297, Math.ceil(totalMm)),
      };
    });

    await page.addStyleTag({ content: `@page { size: 217mm ${contentHeightMm}mm !important; }` });

    const vaga = (pdfData.vaga || '').replace(/[<>:"/\\|?*]/g, '').trim();
    const empresa = pdfData.empresa ? pdfData.empresa.replace(/[<>:"/\\|?*]/g, '').trim() : '';
    const candidateName = (pdfData.candidateName || '').replace(/[<>:"/\\|?*]/g, '').trim();

    const parts = [vaga, empresa, candidateName].filter(Boolean);
    const filename = parts.join(' - ') + '.pdf';

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdf.length
    });
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF: ' + err.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`PDF server rodando em http://localhost:${PORT}`);
  console.log(`Acesse os CVs em http://localhost:${PORT}/index.html`);
});
