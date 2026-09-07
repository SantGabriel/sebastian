import * as api from './lib/api.js';
import { escapeHtml, fadeOutElement } from './lib/dom.js';
import { showMessage, askConfirm } from './lib/modal.js';
import { renderNav } from './lib/nav.js';
import { paginationBarHtml } from './lib/pagination.js';
import { STAGE_LIST, STAGE_LABELS, OUTCOME_LABELS, OUTCOMES } from './domain/constants.js';
import { gapWeight } from './utils.js';

const PAGE_SIZE = 10;

let currentQuery = { q: '', stage: '', outcome: '', sort: 'appliedAt:desc', page: 1, pageSize: PAGE_SIZE };
let lastResult = { items: [], total: 0, page: 1, pageSize: PAGE_SIZE };

/** @type {Map<string, object>} detalhe completo já buscado, por application.id */
const detailCache = new Map();
/** @type {Set<string>} ids com o painel de detalhe aberto */
const openDetailIds = new Set();
/** @type {Set<string>} ids com o collapse "detalhes do fit" aberto */
const openFitIds = new Set();
/** @type {Set<string>} ids com o collapse "vaga" aberto */
const openVagaIds = new Set();
/** @type {string|null} eventId do StageEvent em edição inline (só um por vez) */
let editingEventId = null;

/**
 * Todas as datas do pipeline (appliedAt, currentStageAt, occurredAt) são datas
 * "puras": meia-noite UTC, sem hora-do-dia real. Formatar no fuso local faria
 * "05/08" virar "04/08" para qualquer usuário no Brasil (UTC-3).
 */
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatDateInput(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function stageBadgeClass(outcome) {
  if (outcome === OUTCOMES.CONTRATADO) return 'badge--success';
  if (outcome === OUTCOMES.REPROVADO || outcome === OUTCOMES.PROPOSTA_RECUSADA) return 'badge--danger';
  return 'badge--brand';
}

/** Mesma faixa de cores do score no dashboard. */
function scoreClass(score) {
  if (score >= 8) return 'score-green';
  if (score >= 5) return 'score-yellow';
  return 'score-red';
}

function populateFilterOptions() {
  const stageSelect = document.getElementById('filter-stage');
  STAGE_LIST.forEach(stage => {
    const opt = document.createElement('option');
    opt.value = stage;
    opt.textContent = STAGE_LABELS[stage];
    stageSelect.appendChild(opt);
  });

  const outcomeSelect = document.getElementById('filter-outcome');
  Object.entries(OUTCOME_LABELS).forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    outcomeSelect.appendChild(opt);
  });
}

async function fetchAndRender() {
  try {
    lastResult = await api.listApplications(currentQuery);
  } catch (err) {
    document.getElementById('applications-container').innerHTML =
      `<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i> Erro ao carregar candidaturas: ${escapeHtml(err.message)}</div>`;
    return;
  }
  renderSummary();
  renderList();
  renderPagination();
}

function renderSummary() {
  const el = document.getElementById('summary-bar');
  el.textContent = lastResult.total
    ? `${lastResult.total} candidaturas encontradas`
    : 'Nenhuma candidatura encontrada com os filtros atuais.';
}

function renderList() {
  const container = document.getElementById('applications-container');

  if (!lastResult.items.length) {
    container.innerHTML = `
      <div class="empty">
        <i class="fa-solid fa-inbox"></i>
        Nenhuma candidatura arquivada ainda.<br>
        Marque vagas como "já me candidatei" no dashboard e clique em "Salvar candidaturas".
      </div>`;
    return;
  }

  container.innerHTML = lastResult.items.map(renderCard).join('');
}

function renderCard(item) {
  const outcomeLabel = OUTCOME_LABELS[item.outcome] || item.outcome;
  const stageLabel = STAGE_LABELS[item.currentStage] || item.currentStage;
  const isOpen = openDetailIds.has(item.id);

  return `
    <div class="panel app-card" id="app-card-${item.id}">
      <div class="app-card-header">
        <div>
          <h2>${escapeHtml(item.titulo)}</h2>
          <div class="app-card-company"><i class="fa-solid fa-building"></i> ${escapeHtml(item.company?.name || 'Não informado')}</div>
          <div class="app-card-meta">
            Candidatura em ${formatDate(item.appliedAt)} · Etapa atual: ${escapeHtml(stageLabel)} (${formatDate(item.currentStageAt)})
            ${item.fitScore != null ? ` · Fit ${item.fitScore}/10` : ''}
          </div>
        </div>
        <div class="app-card-badges">
          ${item.silent ? '<span class="badge badge--warning"><i class="fa-solid fa-clock"></i> Sem resposta</span>' : ''}
          <span class="badge ${stageBadgeClass(item.outcome)}">${escapeHtml(outcomeLabel)}</span>
        </div>
      </div>

      <button type="button" class="link-button app-detail-toggle" onclick="toggleDetail('${item.id}')">
        ${isOpen ? 'Ocultar detalhes' : 'Ver detalhes'} <i class="fa-solid fa-caret-${isOpen ? 'down' : 'right'}"></i>
      </button>

      <div class="app-detail${isOpen ? ' open' : ''}" id="detail-${item.id}">
        ${isOpen && detailCache.has(item.id) ? renderDetailBody(detailCache.get(item.id)) : ''}
      </div>
    </div>`;
}

async function toggleDetail(id) {
  const el = document.getElementById('detail-' + id);
  const isOpen = openDetailIds.has(id);

  if (isOpen) {
    openDetailIds.delete(id);
    el.classList.remove('open');
    updateToggleLabel(id, false);
    return;
  }

  openDetailIds.add(id);
  el.classList.add('open');
  updateToggleLabel(id, true);

  if (!detailCache.has(id)) {
    el.innerHTML = '<p class="app-card-meta">Carregando...</p>';
    try {
      const { application } = await api.getApplication(id);
      detailCache.set(id, application);
    } catch (err) {
      el.innerHTML = `<p class="app-card-meta">Erro ao carregar: ${escapeHtml(err.message)}</p>`;
      return;
    }
  }

  refreshDetailDOM(id);
}

function updateToggleLabel(id, isOpen) {
  const card = document.getElementById('detail-' + id)?.closest('.app-card');
  const btn = card?.querySelector('.app-detail-toggle');
  if (!btn) return;
  btn.innerHTML = `${isOpen ? 'Ocultar detalhes' : 'Ver detalhes'} <i class="fa-solid fa-caret-${isOpen ? 'down' : 'right'}"></i>`;
}

/** Re-renderiza só o miolo do detalhe a partir do cache local, sem nova requisição — usado por edição inline de etapa. */
function refreshDetailDOM(id) {
  const el = document.getElementById('detail-' + id);
  if (!el) return;
  el.innerHTML = renderDetailBody(detailCache.get(id));
}

/**
 * Fit e descrição da vaga como foram no dia da candidatura — o fit vem do
 * snapshot Json da Application, a descrição do JobPosting associado. Usa os
 * mesmos collapses do dashboard (.fit-toggle/.fit-details, .vaga-toggle/.vaga-texto).
 */
function renderFitSection(app) {
  const fit = app.fit || {};
  const descricao = app.posting?.descriptionText || '';
  const fitOpen = openFitIds.has(app.id);
  const vagaOpen = openVagaIds.has(app.id);

  const positivos = (fit.positivos || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');
  const negativos = (fit.negativos || []).map(n => {
    const peso = gapWeight(n.tipo);
    const badge = n.tipo ? `<span class="gap-badge">${escapeHtml(n.tipo)} (-${peso})</span>` : '';
    return `<li>${escapeHtml(n.descricao)} ${badge}</li>`;
  }).join('');

  const temFit = fit.score != null || fit.summary || positivos || negativos;
  if (!temFit && !descricao) return '';

  return `
    <div class="detail-section">
      <h4 class="section-label">
        Fit da vaga
        ${fit.score != null ? `<span class="score-badge ${scoreClass(fit.score)}">${fit.score}/10</span>` : ''}
        ${app.link ? `<a class="vaga-link" href="${escapeHtml(app.link)}" target="_blank" rel="noreferrer">
          <i class="fa-solid fa-arrow-up-right-from-square icon-sm"></i> Abrir vaga
        </a>` : ''}
      </h4>

      ${fit.summary ? `<div class="callout callout--info">${escapeHtml(fit.summary)}</div>` : ''}

      ${positivos || negativos
        ? `<button type="button" class="link-button fit-toggle" id="app-fit-toggle-${app.id}" onclick="toggleAppFit('${app.id}')">
             ${fitOpen ? 'Ocultar detalhes' : 'Ver detalhes do fit'} <i class="fa-solid fa-caret-${fitOpen ? 'down' : 'right'}"></i>
           </button>`
        : ''}
      ${descricao
        ? `<button type="button" class="link-button link-button--muted vaga-toggle" id="app-vaga-toggle-${app.id}" onclick="toggleAppVaga('${app.id}')">
             ${vagaOpen ? 'Ocultar vaga' : 'Ver vaga'} <i class="fa-solid fa-caret-${vagaOpen ? 'down' : 'right'}"></i>
           </button>`
        : ''}

      <div class="fit-details${fitOpen ? ' open' : ''}" id="app-fit-${app.id}">
        ${positivos
          ? `<div class="fit-section">
               <strong><i class="fa-solid fa-circle-check icon-success"></i> Pontos positivos</strong>
               <ul>${positivos}</ul>
             </div>`
          : ''}
        ${negativos
          ? `<div class="fit-section">
               <strong><i class="fa-solid fa-circle-xmark icon-danger"></i> Gaps / Pontos negativos</strong>
               <ul>${negativos}</ul>
             </div>`
          : ''}
      </div>

      ${descricao
        ? `<div class="vaga-texto" id="app-vaga-${app.id}" style="display:${vagaOpen ? 'block' : 'none'}">${escapeHtml(descricao)}</div>`
        : ''}
    </div>`;
}

/**
 * CV e CL saem das mesmas páginas do dashboard, só que lendo o snapshot do
 * banco (?application=) em vez do jobs-data.js. Ambos os botões aparecem
 * sempre; o que não foi autorizado no dia fica no estado "cadeado", igual à
 * área de vagas.
 */
function renderDocsSection(app) {
  const cvBtn = app.cv
    ? `<a class="btn btn-cv" href="cv.html?application=${app.id}" target="_blank">
         <i class="fa-solid fa-file-pdf"></i> CV
       </a>`
    : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> CV</span>`;

  const clBtn = app.cl
    ? `<a class="btn btn-cl" href="cl.html?application=${app.id}" target="_blank">
         <i class="fa-solid fa-envelope"></i> Cover Letter
       </a>`
    : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> Cover Letter</span>`;

  return `
    <div class="detail-section">
      <h4 class="section-label">Documentos</h4>
      <div class="doc-list">
        ${cvBtn}
        ${clBtn}
        ${!app.cv || !app.cl
          ? '<span class="pending-label"><i class="fa-solid fa-lock"></i> Não gerado nesta candidatura</span>'
          : ''}
      </div>
    </div>`;
}

function renderDetailBody(app) {
  return `
    ${renderFitSection(app)}
    ${renderDocsSection(app)}

    <div class="detail-section">
      <h4 class="section-label">Linha do tempo</h4>
      <ul class="timeline">
        ${app.stageEvents.map(ev => renderTimelineEvent(app.id, ev)).join('')}
      </ul>
      ${renderStageForm(app.id)}
    </div>

    <div class="detail-section">
      <h4 class="section-label">Notas</h4>
      <textarea id="notes-${app.id}" class="input" rows="2" style="width:100%; resize:vertical;">${escapeHtml(app.notes || '')}</textarea>
      <div class="detail-actions">
        <button type="button" class="btn-outline-primary" onclick="saveNotes('${app.id}')">Salvar notas</button>
        <button type="button" class="btn-outline-danger btn-push-right" onclick="removeApplication('${app.id}', '${escapeHtml(app.titulo).replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-trash-can"></i> Excluir candidatura
        </button>
      </div>
    </div>
  `;
}

function toggleAppFit(id) {
  const el = document.getElementById('app-fit-' + id);
  const btn = document.getElementById('app-fit-toggle-' + id);
  const isOpen = openFitIds.has(id);

  if (isOpen) openFitIds.delete(id); else openFitIds.add(id);
  el.classList.toggle('open', !isOpen);
  btn.innerHTML = `${isOpen ? 'Ver detalhes do fit' : 'Ocultar detalhes'} <i class="fa-solid fa-caret-${isOpen ? 'right' : 'down'}"></i>`;
}

function toggleAppVaga(id) {
  const el = document.getElementById('app-vaga-' + id);
  const btn = document.getElementById('app-vaga-toggle-' + id);
  const isOpen = openVagaIds.has(id);

  if (isOpen) openVagaIds.delete(id); else openVagaIds.add(id);
  el.style.display = isOpen ? 'none' : 'block';
  btn.innerHTML = `${isOpen ? 'Ver vaga' : 'Ocultar vaga'} <i class="fa-solid fa-caret-${isOpen ? 'right' : 'down'}"></i>`;
}

function renderTimelineEvent(appId, ev) {
  if (ev.id === editingEventId) {
    return `
      <li class="timeline-event">
        <form class="stage-form" onsubmit="return saveStageEdit(event, '${appId}', '${ev.id}')" style="width:100%; border-top:none; margin-top:0; padding-top:0;">
          <span class="timeline-event-stage">${escapeHtml(STAGE_LABELS[ev.stage] || ev.stage)}</span>
          <input type="date" class="input input--sm" name="occurredAt" value="${formatDateInput(ev.occurredAt)}" required />
          <input type="text" class="input input--sm" name="note" value="${escapeHtml(ev.note || '')}" placeholder="Nota / motivo (opcional)" />
          <button type="submit" class="btn-outline-primary">Salvar</button>
          <button type="button" class="btn-outline-danger" onclick="cancelStageEdit('${appId}')">Cancelar</button>
        </form>
      </li>`;
  }

  return `
    <li class="timeline-event">
      <div class="timeline-event-main">
        <span class="timeline-event-stage">${escapeHtml(STAGE_LABELS[ev.stage] || ev.stage)}</span>
        <span class="timeline-event-date">${formatDate(ev.occurredAt)}</span>
        ${ev.note ? `<span class="timeline-event-note">${escapeHtml(ev.note)}</span>` : ''}
      </div>
      <div class="timeline-event-actions">
        <button type="button" title="Editar" onclick="startStageEdit('${appId}', '${ev.id}')"><i class="fa-solid fa-pen"></i></button>
        <button type="button" title="Remover" onclick="removeStageEvent('${appId}', '${ev.id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </li>`;
}

function renderStageForm(appId) {
  // Data local, não UTC: às 21h no Brasil `toISOString()` já devolveria amanhã.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `
    <form class="stage-form" onsubmit="return submitAddStage(event, '${appId}')">
      <select class="select select--sm" name="stage" required>
        ${STAGE_LIST.map(s => `<option value="${s}">${escapeHtml(STAGE_LABELS[s])}</option>`).join('')}
      </select>
      <input type="date" class="input input--sm" name="occurredAt" value="${today}" required />
      <input type="text" class="input input--sm" name="note" placeholder="Nota / motivo (opcional)" />
      <button type="submit" class="btn-outline-primary"><i class="fa-solid fa-plus"></i> Adicionar etapa</button>
    </form>`;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(lastResult.total / lastResult.pageSize));
  document.getElementById('pagination-bar').innerHTML =
    paginationBarHtml({ page: lastResult.page, totalPages, handler: 'goToPage' });
}

function goToPage(page) {
  currentQuery.page = page;
  fetchAndRender();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- ações de etapa ----------

async function submitAddStage(evt, appId) {
  evt.preventDefault();
  const form = evt.target;
  const stage = form.stage.value;
  const occurredAt = form.occurredAt.value;
  const note = form.note.value.trim();

  try {
    await api.addStage(appId, { stage, occurredAt, note: note || undefined });
    await refetchStageEvents(appId);
    refreshDetailDOM(appId);
    fetchAndRender(); // badges/etapa do card na lista também mudam
  } catch (err) {
    showMessage({ title: 'Erro ao adicionar etapa', message: err.message, variant: 'error' });
  }
  return false;
}

async function refetchStageEvents(appId) {
  const { application } = await api.getApplication(appId);
  detailCache.set(appId, application);
  return application.stageEvents;
}

function startStageEdit(appId, eventId) {
  editingEventId = eventId;
  refreshDetailDOM(appId);
}

function cancelStageEdit(appId) {
  editingEventId = null;
  refreshDetailDOM(appId);
}

async function saveStageEdit(evt, appId, eventId) {
  evt.preventDefault();
  const form = evt.target;
  const occurredAt = form.occurredAt.value;
  const note = form.note.value.trim();

  try {
    await api.updateStage(appId, eventId, { occurredAt, note });
    editingEventId = null;
    await refetchStageEvents(appId);
    refreshDetailDOM(appId);
    fetchAndRender();
  } catch (err) {
    showMessage({ title: 'Erro ao editar etapa', message: err.message, variant: 'error' });
  }
  return false;
}

async function removeStageEvent(appId, eventId) {
  const confirmado = await askConfirm({
    title: 'Remover etapa?',
    message: 'Remover este evento da linha do tempo?',
    confirmLabel: 'Remover'
  });
  if (!confirmado) return;
  try {
    await api.removeStage(appId, eventId);
    await refetchStageEvents(appId);
    refreshDetailDOM(appId);
    fetchAndRender();
  } catch (err) {
    showMessage({ title: 'Erro ao remover etapa', message: err.message, variant: 'error' });
  }
}

// ---------- notas ----------

async function saveNotes(appId) {
  const textarea = document.getElementById('notes-' + appId);
  try {
    await api.patchApplication(appId, { notes: textarea.value });
    showMessage({ title: 'Notas salvas', message: 'As notas desta candidatura foram atualizadas.', variant: 'success' });
  } catch (err) {
    showMessage({ title: 'Erro ao salvar notas', message: err.message, variant: 'error' });
  }
}

// ---------- excluir candidatura ----------

async function removeApplication(appId, titulo) {
  const confirmado = await askConfirm({
    title: 'Excluir candidatura?',
    message: `Excluir a candidatura "${titulo}"?\n\nIsso remove o registro do banco, o histórico de etapas e os snapshots de fit/CV/CL. NÃO PODE SER DESFEITO.`,
    confirmLabel: 'Excluir'
  });
  if (!confirmado) return;

  try {
    await api.deleteApplication(appId);
    detailCache.delete(appId);
    openDetailIds.delete(appId);
    openFitIds.delete(appId);
    openVagaIds.delete(appId);
    await fadeOutElement(document.getElementById('app-card-' + appId));
    // Excluir o único item da última página deixaria o usuário numa página vazia.
    if (lastResult.items.length === 1 && currentQuery.page > 1) currentQuery.page -= 1;
    await fetchAndRender();
  } catch (err) {
    showMessage({ title: 'Erro ao excluir candidatura', message: err.message, variant: 'error' });
  }
}

// ---------- filtros ----------

function wireFilters() {
  const qInput = document.getElementById('filter-q');
  let debounceTimer = null;
  qInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentQuery.q = qInput.value.trim();
      currentQuery.page = 1;
      fetchAndRender();
    }, 300);
  });

  document.getElementById('filter-stage').addEventListener('change', (e) => {
    currentQuery.stage = e.target.value;
    currentQuery.page = 1;
    fetchAndRender();
  });

  document.getElementById('filter-outcome').addEventListener('change', (e) => {
    currentQuery.outcome = e.target.value;
    currentQuery.page = 1;
    fetchAndRender();
  });

  document.getElementById('filter-sort').addEventListener('change', (e) => {
    currentQuery.sort = e.target.value;
    currentQuery.page = 1;
    fetchAndRender();
  });
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    toggleDetail, toggleAppFit, toggleAppVaga, submitAddStage, startStageEdit,
    cancelStageEdit, saveStageEdit, removeStageEvent, saveNotes, removeApplication, goToPage
  });
}

if (typeof document !== 'undefined') {
  renderNav('candidaturas');
  populateFilterOptions();
  wireFilters();
  fetchAndRender();
}
