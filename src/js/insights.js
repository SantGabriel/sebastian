import * as api from './lib/api.js';
import { escapeHtml } from './lib/dom.js';
import { renderNav } from './lib/nav.js';
import { paginationBarHtml } from './lib/pagination.js';
import { STAGE_LIST, STAGE_LABELS, STAGE_ORDER } from './domain/constants.js';

const COMPANIES_PAGE_SIZE = 5;
const TERMS_PAGE_SIZE = 20;

/**
 * O endpoint de termos devolve os 30 melhores por padrão — com 20 por página e
 * busca, isso daria página e meia. Pedimos uma fatia maior e paginamos/filtramos
 * no cliente; a ordenação por score do servidor é preservada.
 */
const TERMS_LIMIT = 200;

/**
 * A lista de empresas vem inteira numa requisição só — é uma linha por empresa
 * distinta, não por candidatura. Busca e paginação ficam no cliente: filtrar
 * enquanto digita sem ida ao servidor, e sem precisar mexer no endpoint.
 * @type {{ all: Array, q: string, page: number }}
 */
const companiesState = { all: [], q: '', page: 1 };

/** Mesma ideia da lista de empresas, sobre os termos já carregados. */
const termsState = { all: [], q: '', page: 1 };

function svgBarChart(data, { color = '#1a73e8', barHeight = 22, gap = 8, labelWidth = 160 } = {}) {
  if (!data.length) return '<p class="chart-empty">Sem dados ainda.</p>';

  const max = Math.max(1, ...data.map(d => d.value));
  const chartWidth = 420;
  const totalWidth = labelWidth + chartWidth + 50;
  const height = data.length * (barHeight + gap);

  const bars = data.map((d, i) => {
    const y = i * (barHeight + gap);
    const barW = d.value ? Math.max(2, (d.value / max) * chartWidth) : 0;
    return `
      <text x="0" y="${y + barHeight * 0.7}" font-size="12" fill="#555">${escapeHtml(d.label)}</text>
      <rect x="${labelWidth}" y="${y}" width="${barW}" height="${barHeight}" fill="${color}" rx="3"></rect>
      <text x="${labelWidth + barW + 8}" y="${y + barHeight * 0.7}" font-size="12" fill="#333">${d.value}</text>
    `;
  }).join('');

  return `<svg viewBox="0 0 ${totalWidth} ${height}" width="100%" height="${height}" role="img">${bars}</svg>`;
}

/** Funil das reprovações: uma barra por etapa de andamento, contando onde cada "não" aconteceu. */
function renderRejectionFunnel(overview) {
  const el = document.getElementById('rejection-funnel-chart');
  const rejectionFunnel = overview.rejectionFunnel || {};
  const totalRejected = overview.totalRejected || 0;

  if (!totalRejected) {
    el.innerHTML = '<p class="chart-empty">Nenhuma candidatura reprovada ainda.</p>';
    return;
  }

  const data = STAGE_LIST
    .filter(stage => STAGE_ORDER[stage] > 0)
    .map(stage => ({ label: STAGE_LABELS[stage], value: rejectionFunnel[stage] || 0 }));

  if (overview.rejectionUnknown) {
    data.push({ label: 'Sem etapa registrada', value: overview.rejectionUnknown });
  }

  el.innerHTML = `
    <div class="stat-summary">
      <span>Reprovações: <strong>${totalRejected}</strong></span>
    </div>
    ${svgBarChart(data, { color: '#c62828' })}
  `;
}

async function loadOverview() {
  let overview;
  try {
    overview = await api.getInsightsOverview();
  } catch (err) {
    const msg = `<p class="chart-empty">Erro: ${escapeHtml(err.message)}</p>`;
    document.getElementById('funnel-chart').innerHTML = msg;
    document.getElementById('rejection-funnel-chart').innerHTML = msg;
    return;
  }

  const funnelData = STAGE_LIST
    .map(stage => ({ label: STAGE_LABELS[stage], value: overview.funnel[stage] || 0 }))
    .filter(d => d.value > 0);
  document.getElementById('funnel-chart').innerHTML = svgBarChart(funnelData, { color: '#1a73e8' });

  const volumeData = overview.monthlyVolume.map(m => ({ label: m.month, value: m.count }));
  document.getElementById('volume-chart').innerHTML = `
    <div class="stat-summary">
      <span>Total: <strong>${overview.total}</strong></span>
      <span>Elegíveis para análise: <strong>${overview.eligible}</strong> (${overview.censoredExcluded} recentes demais, ainda não contam)</span>
      <span>Taxa de conversão em entrevista: <strong>${Math.round(overview.conversionRate * 100)}%</strong></span>
      ${overview.medianDaysToInterview != null ? `<span>Mediana até a 1ª entrevista: <strong>${Math.round(overview.medianDaysToInterview)} dias</strong></span>` : ''}
    </div>
    ${svgBarChart(volumeData, { color: '#34a853' })}
  `;
}

function renderReliabilityBanner(meta) {
  const el = document.getElementById('reliability-banner');
  if (meta.reliable) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `
    <div class="callout callout--warning reliability-banner">
      <i class="fa-solid fa-triangle-exclamation"></i>
      Dados insuficientes para conclusões confiáveis: apenas <strong>${meta.eligible}</strong> candidaturas
      elegíveis até agora (mínimo recomendado: 30). Os números abaixo são um indício, não uma certeza.
    </div>`;
}

function filteredTerms() {
  const q = foldForSearch(termsState.q);
  if (!q) return termsState.all;
  return termsState.all.filter(t => foldForSearch(t.term).includes(q));
}

function renderTermsTable() {
  const el = document.getElementById('terms-table');
  const paginationEl = document.getElementById('terms-pagination');

  if (!termsState.all.length) {
    el.innerHTML = '<p class="chart-empty">Nenhum termo com frequência suficiente ainda.</p>';
    paginationEl.innerHTML = '';
    return;
  }

  const matches = filteredTerms();
  if (!matches.length) {
    el.innerHTML = `<p class="chart-empty">Nenhum termo encontrado para "${escapeHtml(termsState.q)}".</p>`;
    paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(matches.length / TERMS_PAGE_SIZE));
  // Apagar o filtro ou digitar mais pode encolher o resultado abaixo da página atual.
  const page = Math.min(termsState.page, totalPages);
  termsState.page = page;
  const visible = matches.slice((page - 1) * TERMS_PAGE_SIZE, page * TERMS_PAGE_SIZE);

  el.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Termo</th>
          <th>Visto em</th>
          <th>Conversão com o termo</th>
          <th>Conversão sem o termo</th>
          <th>Lift</th>
          <th>Direção</th>
        </tr>
      </thead>
      <tbody>
        ${visible.map(t => `
          <tr>
            <td class="term-cell">${escapeHtml(t.term)} <span class="badge badge--neutral term-n-badge">${t.n === 2 ? '2 palavras' : '1 palavra'}</span></td>
            <td>${t.df}</td>
            <td>${Math.round(t.withTerm.rate * 100)}% (${t.withTerm.interviewed}/${t.withTerm.n})</td>
            <td>${Math.round(t.withoutTerm.rate * 100)}% (${t.withoutTerm.interviewed}/${t.withoutTerm.n})</td>
            <td>${t.lift}x</td>
            <td class="direction-${t.direction}">${t.direction === 'positive' ? 'Ajuda' : 'Atrapalha'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${termsState.q ? `<p class="section-hint list-count">${matches.length} de ${termsState.all.length} termos.</p>` : ''}`;

  paginationEl.innerHTML = paginationBarHtml({ page, totalPages, handler: 'goToTermPage' });
}

function goToTermPage(page) {
  termsState.page = page;
  renderTermsTable();
}

async function loadTerms() {
  const scope = document.getElementById('term-scope').value;
  const n = document.getElementById('term-n').value;

  let result;
  try {
    result = await api.getInsightsTerms({ scope, n: n || undefined, limit: TERMS_LIMIT });
  } catch (err) {
    document.getElementById('terms-table').innerHTML = `<p class="chart-empty">Erro: ${escapeHtml(err.message)}</p>`;
    document.getElementById('terms-pagination').innerHTML = '';
    return;
  }

  // Trocar de escopo/tamanho de n-grama muda a lista inteira: voltar pra 1ª página.
  termsState.all = result.terms;
  termsState.page = 1;

  renderReliabilityBanner(result.meta);
  renderTermsTable();
}

/**
 * Acento e caixa não podem separar "Soluções" de "solucoes" na busca.
 * Escapes \u em vez dos combinantes literais — eles são invisíveis no editor
 * e qualquer normalização do arquivo os comeria sem deixar rastro.
 * (Não dá para reusar `foldAccents` do server/text/normalize.js: aquele módulo
 * importa `node:crypto` no topo e não carrega no browser.)
 */
function foldForSearch(str) {
  return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filteredCompanies() {
  const q = foldForSearch(companiesState.q);
  if (!q) return companiesState.all;
  return companiesState.all.filter(c => foldForSearch(c.name).includes(q));
}

function renderCompanies() {
  const el = document.getElementById('companies-table');
  const paginationEl = document.getElementById('companies-pagination');

  if (!companiesState.all.length) {
    el.innerHTML = '<p class="chart-empty">Nenhuma candidatura arquivada ainda.</p>';
    paginationEl.innerHTML = '';
    return;
  }

  const matches = filteredCompanies();
  if (!matches.length) {
    el.innerHTML = `<p class="chart-empty">Nenhuma empresa encontrada para "${escapeHtml(companiesState.q)}".</p>`;
    paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(matches.length / COMPANIES_PAGE_SIZE));
  // Apagar o filtro ou digitar mais pode encolher o resultado abaixo da página atual.
  const page = Math.min(companiesState.page, totalPages);
  companiesState.page = page;
  const visible = matches.slice((page - 1) * COMPANIES_PAGE_SIZE, page * COMPANIES_PAGE_SIZE);

  el.innerHTML = `
    <table class="data-table">
      <thead>
        <tr><th>Empresa</th><th>Candidaturas</th><th>Entrevistas</th><th>Contratações</th><th>Reprovações</th><th>Taxa de entrevista</th></tr>
      </thead>
      <tbody>
        ${visible.map(c => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${c.applied}</td>
            <td>${c.interviewed}</td>
            <td>${c.hired}</td>
            <td>${c.rejected}</td>
            <td>${Math.round(c.interviewRate * 100)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${companiesState.q ? `<p class="section-hint list-count">${matches.length} de ${companiesState.all.length} empresas.</p>` : ''}`;

  paginationEl.innerHTML = paginationBarHtml({ page, totalPages, handler: 'goToCompanyPage' });
}

function goToCompanyPage(page) {
  companiesState.page = page;
  renderCompanies();
}

async function loadCompanies() {
  try {
    const { companies } = await api.getInsightsCompanies();
    companiesState.all = companies;
  } catch (err) {
    document.getElementById('companies-table').innerHTML = `<p class="chart-empty">Erro: ${escapeHtml(err.message)}</p>`;
    return;
  }
  renderCompanies();
}

async function runReindex() {
  const status = document.getElementById('toolbar-status');
  status.textContent = 'Reindexando...';
  try {
    const result = await api.reindex(false);
    status.textContent = `${result.postingsIndexed} vagas e ${result.applicationsIndexed} candidaturas reindexadas.`;
    await loadAll();
  } catch (err) {
    status.textContent = 'Erro ao reindexar: ' + err.message;
  }
}

/** Busca client-side com debounce: cada tecla refiltra a lista já carregada, sem ida ao servidor. */
function wireSearch(inputId, state, render) {
  const input = document.getElementById(inputId);
  let debounceTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.q = input.value.trim();
      state.page = 1;
      render();
    }, 200);
  });
}

function wireFilters() {
  document.getElementById('term-scope').addEventListener('change', loadTerms);
  document.getElementById('term-n').addEventListener('change', loadTerms);

  wireSearch('term-q', termsState, renderTermsTable);
  wireSearch('company-q', companiesState, renderCompanies);
}

async function loadAll() {
  await Promise.all([loadOverview(), loadTerms(), loadCompanies()]);
}

if (typeof window !== 'undefined') {
  Object.assign(window, { runReindex, goToCompanyPage, goToTermPage });
}

if (typeof document !== 'undefined') {
  renderNav('insights');
  wireFilters();
  loadAll();
}
