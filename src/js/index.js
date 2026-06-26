import { JOBS_DATA } from '../json/jobs-data.js';
import { CANDIDATE_DATA } from '../json/candidate-data.js';

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

export const GAP = Object.freeze({
  REQUISITO_CORE:        'Requisito Core',
  REQUISITO_IMPORTANTE:  'Requisito Importante',
  REQUISITO_SECUNDARIO:  'Requisito Secundário',
  REQUISITO_BAIXO:       'Requisito Baixo',
  FORTEMENTE_DESEJAVEL:  'Fortemente desejável',
  NOCAO_CONHECIMENTO:    'Noção, conhecimento',
  DESEJAVEL_DIFERENCIAL: 'Desejável/Diferencial',
  PERSONALIZADO: 'personalizado',
});

export function gapWeight(tipo) {
  switch (tipo) {
    case GAP.REQUISITO_CORE:        return 4;
    case GAP.REQUISITO_IMPORTANTE:  return 3;
    case GAP.REQUISITO_SECUNDARIO:  return 2;
    case GAP.REQUISITO_BAIXO:       return 1;
    case GAP.FORTEMENTE_DESEJAVEL:  return 1;
    case GAP.NOCAO_CONHECIMENTO:    return 0.5;
    case GAP.DESEJAVEL_DIFERENCIAL: return 0.25;
    default:                        return null;
  }
}

function toggleFit(id) {
  const el  = document.getElementById('fit-' + id);
  const btn = document.getElementById('toggle-' + id);
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    btn.textContent = 'Ver detalhes do fit ▸';
  } else {
    el.classList.add('open');
    btn.textContent = 'Ocultar detalhes ▾';
  }
}

function toggleVaga(id) {
  const el  = document.getElementById('vaga-' + id);
  const btn = document.getElementById('vaga-toggle-' + id);
  if (el.style.display === 'block') {
    el.style.display = 'none';
    btn.textContent = 'Ver vaga ▸';
  } else {
    el.style.display = 'block';
    btn.textContent = 'Ocultar vaga ▾';
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
}

function isCandidatura(jobId) {
  return JSON.parse(localStorage.getItem('candidaturas') || '[]').includes(jobId);
}

function badge(label) {
  return label ? `<span class="job-badge">${label}</span>` : '';
}

function render() {
  const container = document.getElementById('jobs-container');
  const jobsArray = Array.isArray(JOBS_DATA) ? JOBS_DATA : Object.values(JOBS_DATA || {});
  const jobs      = jobsArray.filter(j => j.fit);

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

    const cvAuthorized = job.cv && job.cv.authorized;
    const clAuthorized = job.cl && job.cl.authorized;
    const hasCv = (job.tipos || []).includes('cv');
    const hasCl = (job.tipos || []).includes('cl');

    const candidaturaHtml = job.candidatura ? `
      <div class="candidatura-aviso">
        <i class="fa-solid fa-triangle-exclamation icon-amber"></i>
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
      ? `<div class="city-warning">
           <i class="fa-solid fa-triangle-exclamation"></i>
           Vaga <strong>${modalidade}</strong> em <strong>${job.cidadeVaga}</strong>
           — sua localização cadastrada é <strong>${candidateLocation}</strong>.
         </div>`
      : '';

    const cvBtn = hasCv
      ? cvAuthorized
        ? `<a class="btn btn-cv" href="src/pages/cv.html?job=${job.id}" target="_blank">
             <i class="fa-solid fa-file-pdf"></i> CV
           </a>`
        : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> CV</span>`
      : '';

    const clBtn = hasCl
      ? clAuthorized
        ? `<a class="btn btn-cl" href="src/pages/cl.html?job=${job.id}" target="_blank">
             <i class="fa-solid fa-envelope"></i> Cover Letter
           </a>`
        : `<span class="btn btn-pending"><i class="fa-solid fa-lock"></i> Cover Letter</span>`
      : '';

    const pendingLabel = (!cvAuthorized && hasCv) || (!clAuthorized && hasCl)
      ? `<span class="pending-label"><i class="fa-solid fa-clock"></i> Aguardando autorização</span>`
      : '';

    return `
      <div class="job-card">

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

        ${fit.summary ? `<div class="fit-summary">${fit.summary}</div>` : ''}
        ${cityWarningHtml}
        ${candidaturaHtml}

        <button class="fit-toggle" id="toggle-${job.id}" onclick="toggleFit('${job.id}')">
          Ver detalhes do fit ▸
        </button>
        ${job.vagaTexto
          ? `<button class="vaga-toggle" id="vaga-toggle-${job.id}" onclick="toggleVaga('${job.id}')">
               Ver vaga ▸
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
                 <strong><i class="fa-solid fa-circle-xmark icon-danger"></i> Gaps / Pontos negativos</strong>
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

      </div>`;
  }).join('');
}

// Os cards renderizados usam handlers inline (onclick/onchange) que resolvem
// no escopo global; como este arquivo agora é um módulo, expomos no window.
if (typeof window !== 'undefined') {
  Object.assign(window, { abrirCVDropdown, toggleFit, toggleVaga, toggleCandidatura });
}

// Só renderiza no browser; ao ser importado pelos testes (Node, sem DOM) o
// import fica livre de efeitos colaterais.
if (typeof document !== 'undefined') {
  render();
  loadAvailableExamples().then(renderExampleDropdown);
}