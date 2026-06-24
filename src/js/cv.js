/** @typedef {import('../interfaces/job-data').Job} Job */

import { gerarPDF } from './pdf.js';

const params = new URLSearchParams(window.location.search);
const jobId = params.get('job');
const fakeCandidateName = params.get('candidate');
const isGeneric = params.get('isGeneric');
const root = document.getElementById('cv-root');

/** @type {Job | undefined} */
let doc;
let CANDIDATE_DATA;

const importData = (path) => import(path).catch(() => ({}));

await getCandidateData();
await getDoc();

async function getCandidateData() {
  if (fakeCandidateName) {
    const moduleCandidateData = await importData(`../../fixtures/fake-candidates/${fakeCandidateName}/candidate.fixture.js`);
    CANDIDATE_DATA = moduleCandidateData.CANDIDATE_FIXTURE;
  } else {
    const moduleCandidateData = await importData('../json/candidate-data.js');
    CANDIDATE_DATA = moduleCandidateData.CANDIDATE_DATA;
  }
}

async function getDoc() {
  if (fakeCandidateName) {
    const { CV_FIXTURE = [] } = await importData(`../../fixtures/fake-candidates/${fakeCandidateName}/cv.fixture.js`);
    doc = CV_FIXTURE.find(c => c.id === jobId);
  } else if (isGeneric) {
    const { GENERIC_CV_DATA = [] } = await importData(`../json/generic-cv-data.js`);
    doc = GENERIC_CV_DATA.find(c => c.id === jobId);
  } else {
    const { JOBS_DATA = [] } = await importData('../json/jobs-data.js');
    doc = JOBS_DATA.find(j => j.id === jobId);
  }
}

/**
 * @param {Job} item
 * @param {string} candidateLocation
 * @returns {string}
 */
function getLocationDisplay(item, candidateLocation) {
  if (item.modalidade === 'Remoto') {
    const remoteText = item.lang === 'en' ? 'Open to remote work' : 'Disponível para trabalho remoto';
    return candidateLocation ? `${candidateLocation}, ${remoteText}` : remoteText;
  }
  return candidateLocation;
}

/**
 * @param {string} phone
 * @param {string} countryCode
 * @returns {string}
 */
function formatPhoneWithCountryCode(phone, countryCode) {
  if (!phone) return '';
  return countryCode ? `${countryCode} ${phone}` : phone;
}

/** @param {string} [msg] */
function notAuthorized(msg) {
  root.innerHTML = `
    <div class="not-authorized">
      <i class="fa-solid fa-lock"></i>
      <h2 style="color:#ccc;border:none;margin:0 0 8px 0">CV não autorizado</h2>
      <p>${msg || 'Este CV ainda não foi autorizado pelo usuário.'}</p>
    </div>`;
}

function render() {
  if (!jobId || !doc) {
    notAuthorized(jobId ? `Vaga "${jobId}" não encontrada.` : 'Nenhum parâmetro de vaga informado na URL.');
    return;
  }

  const cv = doc.cv;
  if (!isGeneric && !cv.authorized) {
    notAuthorized(`CV para "${doc.vaga} - ${doc.empresa || 'Não informado'}" ainda não autorizado.`);
    return;
  }

  const candidateName = CANDIDATE_DATA.name;
  const candidatePhone = CANDIDATE_DATA.phone;
  const candidatePhoneCountryCode = CANDIDATE_DATA.phoneCountryCode;
  const candidateLinkedin = CANDIDATE_DATA.linkedin;

  document.documentElement.lang = doc.lang;

  const isInternational = doc.lang === 'en';
  const secResumo = isInternational ? 'Professional Summary' : 'Resumo Profissional';
  const secExp = isInternational ? 'Professional Experience' : 'Experiência Profissional';
  const secSkills = isInternational ? 'Technical Skills' : 'Competências Técnicas';
  const secEdu = isInternational ? 'Education' : 'Formação Acadêmica';
  const secLang = isInternational ? 'Languages' : 'Idiomas';
  const secProjetos = isInternational ? 'Personal Projects' : 'Projetos Pessoais';
  const secCertificados = isInternational ? 'Certifications' : 'Certificações';

  const candidateLocation = cv.local || (isInternational
    ? CANDIDATE_DATA.location.en
    : CANDIDATE_DATA.location.pt);

  const vagaLocation = getLocationDisplay(doc, candidateLocation);

  document.getElementById('page-title').textContent = [doc.vaga, doc.empresa].filter(Boolean).join(' - ') + ` | ${candidateName}`;

  window._pdfData = { vaga: doc.vaga, empresa: doc.empresa || 'Não informado', candidateName };

  const phoneHtml = candidatePhone
    ? `<a href="tel:${formatPhoneWithCountryCode(candidatePhone, candidatePhoneCountryCode)}"><i class="fa-solid fa-phone"></i> ${formatPhoneWithCountryCode(candidatePhone, candidatePhoneCountryCode)}</a>` : '';
  const emailHtml = CANDIDATE_DATA.email
    ? `<a href="mailto:${CANDIDATE_DATA.email}"><i class="fa-solid fa-envelope"></i> ${CANDIDATE_DATA.email}</a>` : '';
  const linkedinHtml = candidateLinkedin
    ? `<a href="${candidateLinkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> ${candidateLinkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';
  const locationHtml = vagaLocation
    ? `<span><i class="fa-solid fa-location-dot"></i> ${vagaLocation}</span>` : '';

  const expHtml = cv.experiencias.map(exp => `
    <div class="job-header">
      <h3>${exp.cargo}${exp.url ? ` - <a href="${exp.url}" target="_blank">${exp.empresa}</a>` : ` - ${exp.empresa}`}</h3>
      <span class="date">${exp.inicio} - ${exp.fim}</span>
    </div>
    <p class="stack">${exp.stack}</p>
    <ul>${exp.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
  `).join('');

  const skillsHtml = cv.skills.map(s => `<span class="pill">${s}</span>`).join('');

  const eduHtml = cv.educacao.map(e => `
    <div class="edu-item">
      <div class="edu-header">
        <h3>${e.curso} - ${e.inst}</h3>
        <span class="date">${e.periodo}</span>
      </div>
      <p class="stack">${e.stack}</p>
    </div>
  `).join('');

  const idiomasHtml = cv.idiomas.map(i => `<li>${i}</li>`).join('');

  const projHtml = (cv.projetos || []).map(proj => `
    <div class="project-item">
      <div class="job-header">
        <h3>${proj.url ? `<a href="${proj.url}" target="_blank">${proj.nome}</a>` : proj.nome}</h3>
        <span class="date">${proj.periodo}</span>
      </div>
      <p class="stack">${proj.stack}</p>
      <p>${proj.descricao}</p>
    </div>
  `).join('');

  const certHtml = (cv.certificados || []).map(cert => `
    <li class="cert-item">
      <span><strong>${cert.url ? `<a href="${cert.url}" target="_blank">${cert.nome}</a>` : cert.nome}</strong></span>
      <span class="date">${cert.periodo}</span>
    </li>
  `).join('');

  root.innerHTML = `
    <h1>${candidateName}</h1>
    <p class="subtitle">${cv.titulo} | ${cv.subtitulo}</p>
    <div class="contact-line">
      ${locationHtml}
      ${phoneHtml}
      ${emailHtml}
      ${linkedinHtml}
    </div>

    <h2>${secResumo}</h2>
    <p>${cv.resumo}</p>

    <h2>${secExp}</h2>
    ${expHtml}

    ${cv.projetos && cv.projetos.length ? `<h2>${secProjetos}</h2>${projHtml}` : ''}

    <h2>${secSkills}</h2>
    <p class="skills-block">${skillsHtml}</p>

    <h2>${secEdu}</h2>
    <div class="edu-row">${eduHtml}</div>

    ${cv.certificados && cv.certificados.length ? `<h2>${secCertificados}</h2><ul class="cert-list">${certHtml}</ul>` : ''}

    <h2>${secLang}</h2>
    <ul class="lang-list">${idiomasHtml}</ul>
  `;

  document.getElementById('btn-pdf').style.display = 'flex';
}

document.getElementById('btn-pdf').addEventListener('click', () => {
  gerarPDF({ job: jobId, isGeneric: isGeneric || undefined, candidate: fakeCandidateName || undefined });
});

window.addEventListener('beforeprint', () => {
  const mmToPx = 96 / 25.4;
  const totalMm = document.body.scrollHeight / mmToPx + 24;
  const heightMm = Math.max(297, Math.ceil(totalMm));
  let style = document.getElementById('_dynamic-page-size');
  if (!style) {
    style = document.createElement('style');
    style.id = '_dynamic-page-size';
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: 217mm ${heightMm}mm !important; }`;
});

render();
