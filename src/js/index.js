import { JOBS } from '../json/jobs-data.js';
import { CANDIDATE_DATA } from '../json/candidate-data.js';
import { gapWeight } from './utils.js';
import { escapeHtml, fadeOutElement } from './lib/dom.js';
import { openModal, showMessage } from './lib/modal.js';
import { renderNav } from './lib/nav.js';
import * as api from './lib/api.js';

/** @type {Array} vagas atualmente renderizadas (com fit) — usado por onSalvarCandidaturas */
let currentJobs = [];
/** @type {Map<string, {jobId: string, archived: boolean}>} status de arquivamento por job.id */
let syncStatusByJobId = new Map();
/**
 * Vagas removidas nesta sessão. O servidor já reescreveu o `jobs-data.js`, mas
 * o módulo importado continua em memória — este Set é o que mantém o dashboard
 * em dia sem recarregar a página.
 * @type {Set<string>}
 */
const removedJobIds = new Set();

export function abrirCVDropdown(value) {
  if (!value) return;
  const [candidate, jobId] = value.split('|');
  window.open(`src/pages/cv.html?job=${jobId}&isGeneric=true&candidate=${candidate}`, '_blank');
  document.getElementById('cv-select').value = '';
}

const EXAMPLES = [
  { name: 'example-1', label: 'Exemplo 1 - Marina (15 anos)', langs: ['pt', 'en'] },
  { name: 'example-2', label: 'Exemplo 2 - Rafael (1 ano)', langs: ['pt', 'en'] },
  { name: 'example-3', label: 'Exemplo 3 - Felipe (5 anos)', langs: ['pt', 'en'] },
];

export async function loadAvailableExamples() {
  const available = [];

  for (const ex of EXAMPLES) {
    try {
      const mod = await import(`../../fixtures/fake-candidates/${ex.name}/cv.fixture.js`);
      if (mod.CV_FIXTURE && mod.CV_FIXTURE.length) {
        available.push(ex);
      }
    } catch {
      // arquivo não existe ou inválido — ignora
    }
  }

  return available;
}

export function renderExampleDropdown(available) {
  const section = document.getElementById('example-section');
  const select = document.getElementById('cv-select');

  if (!available.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  select.innerHTML = '<option value="">Escolher CV...</option>';

  for (const ex of available) {
    for (const lang of ex.langs) {
      const suffix = lang === 'en' ? ' - EN' : ' - PT';
      const jobId = lang === 'en' ? 'generico-en' : 'generico';
      const option = document.createElement('option');
      option.value = `${ex.name}|${jobId}`;
      option.textContent = `${ex.label}${suffix}`;
      select.appendChild(option);
    }
  }
}

export function scoreClass(s) {
  if (s >= 8) return 'score-green';
  if (s >= 5) return 'score-yellow';
  return 'score-red';
}

function toggleFit(id) {
  const el  = document.getElementById('fit-' + id);
  const btn = document.getElementById('toggle-' + id);
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    btn.innerHTML = 'Ver detalhes do fit <i class="fa-solid fa-caret-right"></i>';
  } else {
    el.classList.add('open');
    btn.innerHTML = 'Ocultar detalhes <i class="fa-solid fa-caret-down"></i>';
  }
}

function toggleVaga(id) {
  const el  = document.getElementById('vaga-' + id);
  const btn = document.getElementById('vaga-toggle-' + id);
  if (el.style.display === 'block') {
    el.style.display = 'none';
    btn.innerHTML = 'Ver vaga <i class="fa-solid fa-caret-right"></i>';
  } else {
    el.style.display = 'block';
    btn.innerHTML = 'Ocultar vaga <i class="fa-solid fa-caret-down"></i>';
  }
}

function toggleCandidatura(jobId) {
  const checkbox        = document.getElementById('candidato-' + jobId);
  const container       = document.getElementById('candidato-container-' + jobId);
  const candidaturasSet = new Set(JSON.parse(localStorage.getItem('candidaturas') || '[]'));

  if (checkbox.checked) {
    candidaturasSet.add(jobId);
    container.classList.add('marcado');
  } else {
    candidaturasSet.delete(jobId);
    container.classList.remove('marcado');
  }

  localStorage.setItem('candidaturas', JSON.stringify(Array.from(candidaturasSet)));
  updateCandidaturasCount();
}

function isCandidatura(jobId) {
  return JSON.parse(localStorage.getItem('candidaturas') || '[]').includes(jobId);
}

function updateCandidaturasCount() {
  const el = document.getElementById('candidaturas-count');
  if (!el) return;
  const candidaturasSet = new Set(JSON.parse(localStorage.getItem('candidaturas') || '[]'));
  const marked = currentJobs.filter(j => candidaturasSet.has(j.id)).length;
  el.textContent = marked
    ? `${marked} de ${currentJobs.length} marcadas como "já me candidatei"`
    : (currentJobs.length ? `Nenhuma vaga marcada ainda` : '');
}

/**
 * Remove a vaga do jobs-data.js (via servidor) sem tocar no vagas.txt.
 * Usado quando o checkbox foi marcado só para indicar "já vi", não "me candidatei".
 */
function removeVaga(jobId, vagaLabel) {
  openModal({
    title: 'Remover vaga?',
    confirmLabel: 'Remover',
    confirmClass: 'btn-danger',
    bodyHtml: `
      <p>Remover <strong>${escapeHtml(vagaLabel)}</strong> da lista?</p>
      <p>Isso NÃO altera o <code>vagas.txt</code> — apenas some do dashboard e não é reprocessada. Use quando a vaga expirou ou você desistiu.</p>
      <p class="modal-error" data-role="error" style="display:none"></p>
    `,
    onConfirm: async (overlay, close) => {
      const confirmBtn = overlay.querySelector('[data-action="confirm"]');
      const errorEl = overlay.querySelector('[data-role="error"]');
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Removendo...';
      try {
        await api.discardPosting(jobId);
        close();
        removedJobIds.add(jobId);
        await fadeOutElement(document.getElementById('job-card-' + jobId));
        render();
      } catch (err) {
        errorEl.textContent = 'Erro ao remover a vaga: ' + err.message;
        errorEl.style.display = 'block';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Remover';
      }
    }
  });
}

async function refreshSyncStatus() {
  try {
    const { items } = await api.getSyncStatus();
    syncStatusByJobId = new Map(items.map(i => [i.jobId, i]));
  } catch {
    syncStatusByJobId = new Map();
  }
}

function summarizeArchiveResults(results) {
  const archived = results.filter(r => r.status === 'archived').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const problems = results.filter(r => r.status === 'skipped' || r.status === 'error' || r.status === 'not_found');

  let msg = archived ? `${archived} candidaturas arquivadas com sucesso.` : 'Nenhuma candidatura nova arquivada.';
  if (exists) msg += ` ${exists} já estavam salvas anteriormente.`;
  if (problems.length) {
    msg += `\n\n${problems.length} não puderam ser salvas:\n` +
      problems.map(p => `- ${p.jobId}: ${p.reason || p.error || 'vaga não encontrada'}`).join('\n');
  }
  return msg;
}

/**
 * Estado de carregamento do botão "Salvar candidaturas". O arquivamento grava a
 * candidatura e indexa os termos do CV/CL de cada vaga, então não é instantâneo —
 * sem isso o clique parece não ter feito nada e o usuário clica de novo.
 */
function setSalvarLoading(loading) {
  const btn = document.getElementById('btn-salvar-candidaturas');
  if (!btn) return;

  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...'
    : '<i class="fa-solid fa-floppy-disk"></i> Salvar candidaturas';
}

async function runArchive(jobIds) {
  if (!jobIds.length) return;
  setSalvarLoading(true);
  try {
    const { results } = await api.archiveApplications(jobIds);

    // Atualiza a tela ANTES de mostrar o resultado: quando o usuário fecha o
    // modal, os selos "Salvo" já estão lá — sem recarregar nada.
    await refreshSyncStatus();
    render();

    const problems = results.filter(r => r.status === 'skipped' || r.status === 'error' || r.status === 'not_found');
    showMessage({
      title: problems.length ? 'Candidaturas salvas com pendências' : 'Candidaturas salvas',
      message: summarizeArchiveResults(results),
      variant: problems.length ? 'danger' : 'success'
    });
  } catch (err) {
    showMessage({
      title: 'Erro ao salvar candidaturas',
      message: err.message,
      variant: 'error'
    });
  } finally {
    setSalvarLoading(false);
  }
}

/**
 * Botão "Salvar candidaturas": arquiva só as marcadas com o checkbox.
 * Se houver vagas não marcadas, avisa num modal antes de prosseguir — o
 * usuário pode marcá-las ali mesmo (ver AGENTS.md / plano da Fase 2).
 */
async function onSalvarCandidaturas() {
  const candidaturasSet = new Set(JSON.parse(localStorage.getItem('candidaturas') || '[]'));
  const marked = currentJobs.filter(j => candidaturasSet.has(j.id));
  const unmarked = currentJobs.filter(j => !candidaturasSet.has(j.id));

  if (!marked.length && !unmarked.length) {
    showMessage({ title: 'Nada para salvar', message: 'Nenhuma vaga carregada para salvar.' });
    return;
  }

  if (!unmarked.length) {
    if (!marked.length) {
      showMessage({ title: 'Nada para salvar', message: 'Nenhuma vaga marcada como "já me candidatei".' });
      return;
    }
    await runArchive(marked.map(j => j.id));
    return;
  }

  const extraIds = new Set();

  openModal({
    title: `${unmarked.length} vagas não serão salvas`,
    confirmLabel: `Salvar as ${marked.length}`,
    bodyHtml: `
      <p>Você marcou ${marked.length} de ${currentJobs.length} como "já me candidatei". Estas ficarão de fora:</p>
      <ul class="modal-job-list">
        ${unmarked.map(j => `
          <li>
            <label>
              <input type="checkbox" data-extra-id="${escapeHtml(j.id)}" />
              ${escapeHtml(j.vaga)} — ${escapeHtml(j.empresa || 'Empresa não informada')}
            </label>
          </li>
        `).join('')}
      </ul>
    `,
    onRender: (overlay) => {
      const confirmBtn = overlay.querySelector('[data-action="confirm"]');
      overlay.querySelectorAll('[data-extra-id]').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) extraIds.add(cb.dataset.extraId);
          else extraIds.delete(cb.dataset.extraId);
          confirmBtn.textContent = `Salvar as ${marked.length + extraIds.size}`;
        });
      });
    },
    onConfirm: async (_overlay, close) => {
      close();
      await runArchive([...marked.map(j => j.id), ...extraIds]);
    }
  });
}

function badge(label) {
  return label ? `<span class="badge badge--brand job-badge">${label}</span>` : '';
}

/** Ícone e intensidade do aviso por tipo de duplicata (ver `Duplicata` no job-data.d.ts). */
const DUPLICATA_ESTILO = {
  'repostagem':          { icone: 'fa-copy',       soft: false },
  'descartada':          { icone: 'fa-trash-can',  soft: false },
  'possivel-repostagem': { icone: 'fa-clone',      soft: true }
};

/**
 * Aviso de repostagem/descarte, exibido ANTES de o usuário se candidatar.
 * Vem pronto do `jobs-data.js`: quem consulta `GET /api/postings/check` é o
 * agente de fit, uma vez só, ao processar a vaga. O dashboard não chama a API.
 */
function buildDuplicateWarningHtml(duplicata) {
  if (!duplicata || !duplicata.aviso) return '';

  const estilo = DUPLICATA_ESTILO[duplicata.tipo] || DUPLICATA_ESTILO['possivel-repostagem'];

  return `
    <div class="callout duplicate-warning${estilo.soft ? ' duplicate-warning--soft' : ''}">
      <i class="fa-solid ${estilo.icone}"></i>
      ${escapeHtml(duplicata.aviso)}
    </div>`;
}

function render() {
  const container = document.getElementById('jobs-container');
  const jobsArray = Array.isArray(JOBS) ? JOBS : Object.values(JOBS || {});
  const jobs      = jobsArray.filter(j => j.fit && !removedJobIds.has(j.id));
  currentJobs = jobs;

  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <i class="fa-solid fa-inbox"></i>
        Nenhuma vaga carregada ainda.<br>
        Adicione vagas ao vagas.txt e peça ao agente para processar.
      </div>`;
    return;
  }

  container.innerHTML = jobs.map((job, idx) => {
    const fit      = job.fit || {};
    const score    = fit.score || 0;
    const positivos = (fit.positivos || []).map(p => `<li>${p}</li>`).join('');
    const negativos = (fit.negativos || []).map(n => {
      const peso  = gapWeight(n.tipo);
      const badge = n.tipo ? `<span class="gap-badge">${n.tipo} (-${peso})</span>` : '';
      return `<li>${n.descricao} ${badge}</li>`;
    }).join('');

    const cvAuthorized = job.cv.authorized;
    const clAuthorized = job.cl.authorized;

    const candidaturaHtml = job.candidatura ? `
      <div class="candidatura-aviso">
        <i class="fa-solid fa-triangle-exclamation icon-warning"></i>
        <span>${job.candidatura.aviso}</span>
        ${job.candidatura.url
      ? `<a href="${job.candidatura.url}" target="_blank">
               <i class="fa-solid fa-arrow-up-right-from-square icon-sm"></i> Abrir link
             </a>`
      : ''}
      </div>` : '';

    const modalidade        = job.modalidade || '';
    const candidateLocation = (CANDIDATE_DATA && CANDIDATE_DATA.location && CANDIDATE_DATA.location.pt) || '';
    const cityFromVaga      = (job.cidadeVaga || '').split(/[,\-]/)[0].trim().toLowerCase();
    const cityFromCandidate = candidateLocation.split(/[,\-]/)[0].trim().toLowerCase();
    const cityWarningHtml   = job.cidadeVaga && modalidade && modalidade !== 'Remoto' && candidateLocation && cityFromVaga !== cityFromCandidate
      ? `<div class="callout callout--warning city-warning">
           <i class="fa-solid fa-triangle-exclamation"></i>
           Vaga <strong>${modalidade}</strong> em <strong>${job.cidadeVaga}</strong>
           — sua localização cadastrada é <strong>${candidateLocation}</strong>.
         </div>`
      : '';

    const duplicateWarningHtml = buildDuplicateWarningHtml(job.duplicata);

    const cvBtn = cvAuthorized
      ? `<a class="btn btn-cv" href="src/pages/cv.html?job=${job.id}" target="_blank">
           <i class="fa-solid fa-file-pdf"></i> CV
         </a>`
      : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> CV</span>`;

    const clBtn = clAuthorized
      ? `<a class="btn btn-cl" href="src/pages/cl.html?job=${job.id}" target="_blank">
           <i class="fa-solid fa-envelope"></i> Cover Letter
         </a>`
      : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> Cover Letter</span>`;

    const pendingLabel = !cvAuthorized || !clAuthorized
      ? `<span class="pending-label"><i class="fa-solid fa-clock"></i> Aguardando autorização</span>`
      : '';

    const savedInfo = syncStatusByJobId.get(job.id);
    const savedBadge = savedInfo?.archived
      ? `<span class="saved-badge"><i class="fa-solid fa-circle-check"></i> Salvo</span>`
      : '';

    return `
      <div class="panel job-card" id="job-card-${job.id}">

        <div class="card-header">
          <div class="card-header-left">
            <h2>
              <span class="job-number">${idx + 1}.</span>
              ${job.vaga}
              ${job.link
      ? `<a href="${job.link}" target="_blank" rel="noreferrer" class="vaga-link">
                     <i class="fa-solid fa-arrow-up-right-from-square icon-sm"></i> Abrir
                   </a>`
      : ''}
            </h2>
            <div class="company">
              <i class="fa-solid fa-building"></i> ${job.empresa || 'Não informado'}
              ${badge(job.modalidade)}
              ${badge(job.contratacao)}
            </div>
          </div>
          <span class="score-badge ${scoreClass(score)}">${score}/10</span>
        </div>

        ${fit.summary ? `<div class="callout callout--info">${fit.summary}</div>` : ''}
        ${cityWarningHtml}
        ${duplicateWarningHtml}
        ${candidaturaHtml}

        <button class="link-button fit-toggle" id="toggle-${job.id}" onclick="toggleFit('${job.id}')">
          Ver detalhes do fit <i class="fa-solid fa-caret-right"></i>
        </button>
        ${job.vagaTexto
      ? `<button class="link-button link-button--muted vaga-toggle" id="vaga-toggle-${job.id}" onclick="toggleVaga('${job.id}')">
               Ver vaga <i class="fa-solid fa-caret-right"></i>
             </button>`
      : ''}

        <div class="fit-details" id="fit-${job.id}">
          ${positivos
      ? `<div class="fit-section">
                 <strong><i class="fa-solid fa-circle-check icon-success"></i> Pontos positivos</strong>
                 <ul>${positivos}</ul>
               </div>`
      : ''}
          ${negativos
      ? `<div class="fit-section">
                 <strong>
                   <i class="fa-solid fa-circle-xmark icon-danger"></i> Gaps / Pontos negativos
                   <a class="gap-help-link" href="src/pages/ajuda.html#gaps" target="_blank" title="Como funciona a classificação dos gaps">
                     <i class="fa-solid fa-circle-question"></i>
                   </a>
                 </strong>
                 <ul>${negativos}</ul>
               </div>`
      : ''}
        </div>

        ${job.vagaTexto
      ? `<div class="vaga-texto" id="vaga-${job.id}">
               ${job.vagaTexto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
             </div>`
      : ''}

        <div class="card-actions">
          ${cvBtn}
          ${clBtn}
          ${pendingLabel}
          <button type="button" class="btn-outline-danger btn-push-right" onclick="removeVaga('${job.id}', '${escapeHtml(job.vaga).replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-trash-can"></i> Remover vaga
          </button>
        </div>

        <label class="candidato-checkbox ${isCandidatura(job.id) ? 'marcado' : ''}" id="candidato-container-${job.id}">
          <input
            type="checkbox"
            id="candidato-${job.id}"
            ${isCandidatura(job.id) ? 'checked' : ''}
            onchange="toggleCandidatura('${job.id}')"
          />
          <span>Já me candidatei</span>
        </label>
        ${savedBadge}

      </div>`;
  }).join('');

  updateCandidaturasCount();
}

// Os cards renderizados usam handlers inline (onclick/onchange) que resolvem
// no escopo global; como este arquivo agora é um módulo, expomos no window.
if (typeof window !== 'undefined') {
  Object.assign(window, { abrirCVDropdown, toggleFit, toggleVaga, toggleCandidatura, removeVaga, onSalvarCandidaturas });
}

// Só renderiza no browser; ao ser importado pelos testes (Node, sem DOM) o
// import fica livre de efeitos colaterais.
if (typeof document !== 'undefined') {
  renderNav('dashboard');
  render();
  loadAvailableExamples().then(renderExampleDropdown);
  refreshSyncStatus().then(render);
}