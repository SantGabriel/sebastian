const puppeteer = require('puppeteer');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}

/**
 * Renderiza uma página do dashboard (cv.html/cl.html) em PDF via Puppeteer.
 * Reusa um browser singleton; abre/fecha uma page por chamada.
 */
async function renderPdfBuffer({ pagePath, query, port }) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const pageParams = new URLSearchParams(query);
    await page.goto(`http://localhost:${port}/${pagePath}?${pageParams}`, { waitUntil: 'networkidle0' });

    const contentHeightMm = await page.evaluate(() => {
      const mmToPx = 96 / 25.4;
      const totalMm = document.body.scrollHeight / mmToPx + 12 * 2;
      return Math.max(297, Math.ceil(totalMm));
    });

    await page.addStyleTag({ content: `@page { size: 217mm ${contentHeightMm}mm !important; }` });

    return await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });
  } finally {
    await page.close();
  }
}

module.exports = { getBrowser, renderPdfBuffer, closeBrowser };
