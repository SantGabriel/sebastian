const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static(__dirname));

app.get('/pdf', async (req, res) => {
  const jobId = req.query.job;
  const doc = (req.query.doc || 'cv').toString().toLowerCase();
  if (!jobId) return res.status(400).send('Parâmetro ?job= obrigatório');

  const pageName = doc === 'cl' ? 'src/pages/cl.html' : 'src/pages/cv.html';

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto(`http://localhost:${PORT}/${pageName}?job=${jobId}`, { waitUntil: 'networkidle0' });

    const pdfData = await page.evaluate(() => window._pdfData || {});

    const vaga = (pdfData.vaga || '').replace(/[<>:"/\\|?*]/g, '').trim();
    const empresa = (pdfData.empresa || '').replace(/[<>:"/\\|?*]/g, '').trim();
    const candidateName = (pdfData.candidateName || '').replace(/[<>:"/\\|?*]/g, '').trim();

    const parts = [vaga, empresa, candidateName].filter(Boolean);
    const filename = parts.join(' - ') + '.pdf';

    const pdf = await page.pdf({
      width: '217mm',
      height: '400mm',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' }
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
