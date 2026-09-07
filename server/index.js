const express = require('express');
const path = require('path');
const { closeBrowser } = require('./services/pdf.service');
const prisma = require('./db/client');
const pdfRoutes = require('./routes/pdf.routes');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT = path.join(__dirname, '..');

app.set('port', PORT);

// db/ guarda o banco; storage/ é o resíduo dos PDFs que já foram arquivados
// em versões anteriores. Nenhum dos dois deve ser servido como estático,
// mesmo que o express.static(ROOT) abaixo sirva o resto do repo.
app.use('/db', (_req, res) => res.sendStatus(404));
app.use('/storage', (_req, res) => res.sendStatus(404));

app.use(express.json());
app.use(express.static(ROOT));

app.use('/api', apiRoutes);
app.use(pdfRoutes);

const server = app.listen(PORT, () => {
  console.log(`PDF server rodando em http://localhost:${PORT}`);
  console.log(`Acesse os CVs em http://localhost:${PORT}/index.html`);
});

async function shutdown() {
  await closeBrowser();
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
