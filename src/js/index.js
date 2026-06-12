function scoreClass(s) {
  if (s >= 8) return 'score-green';
  if (s >= 5) return 'score-yellow';
  return 'score-red';
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
  const jobsArray = Array.isArray(window.JOBS_DATA) ? window.JOBS_DATA : Object.values(window.JOBS_DATA || {});
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
    const negativos = (fit.negativos || []).map(n => `<li>${n}</li>`).join('');

    const cvAuthorized = job.cv && job.cv.authorized;
    const clAuthorized = job.cl && job.cl.authorized;
    const hasCv = (job.tipos || []).includes('cv');
    const hasCl = (job.tipos || []).includes('cl');

    const candidaturaHtml = job.candidatura ? `
      <div class="candidatura-aviso">
        <i class="fa-solid fa-triangle-exclamation icon-amber"></i>
        <span>${job.candidatura.aviso}</span>
        ${job.candidatura.email
          ? `<a href="${job.candidatura.email}" target="_blank">
               <i class="fa-solid fa-arrow-up-right-from-square icon-sm"></i> Abrir link
             </a>`
          : ''}
      </div>` : '';

    const modalidade        = job.modalidade || '';
    const candidateLocation = (window.CANDIDATE_DATA && window.CANDIDATE_DATA.location && window.CANDIDATE_DATA.location.pt) || '';
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
                ? `<a href="${job.link}" target="_blank" class="vaga-link">
                     <i class="fa-solid fa-arrow-up-right-from-square icon-sm"></i> Abrir
                   </a>`
                : ''}
            </h2>
            <div class="company">
              <i class="fa-solid fa-building"></i> ${job.empresa}
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

if (typeof module === 'undefined') {
  render();
} else {
  module.exports = { scoreClass };
}