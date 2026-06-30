/** @typedef {import('../interfaces/job-data').Job} Job */

import { gerarPDF } from './pdf.js';
import { CANDIDATE_DATA } from '../json/candidate-data.js';
import { JOBS_DATA } from '../json/jobs-data.js';

const params = new URLSearchParams(window.location.search);
const jobId = params.get('job');
const root = document.getElementById('cl-root');

function notAuthorized(msg) {
  root.innerHTML = `
    <div class="not-authorized">
      <i class="fa-solid fa-lock"></i>
      <h2 style="color:#ccc">Cover Letter not authorized</h2>
      <p>${msg || 'This Cover Letter has not been authorized yet.'}</p>
    </div>`;
}

// jobId aponta para uma vaga real. JOBS_DATA já é array, mas o formato por
// objeto ainda é suportado para não quebrar dados antigos.
function resolveJob(jobId) {
  if (Array.isArray(JOBS_DATA)) return JOBS_DATA.find(job => job.id === jobId);
  return JOBS_DATA[jobId];
}

const job = resolveJob(jobId);

if (!jobId || !job) {
  notAuthorized(jobId ? `Job "${jobId}" not found in src/json/jobs-data.js.` : 'No job parameter provided in the URL.');
} else {
  const cl = job.cl;
  const isEN = job.lang === 'en';

  const c = CANDIDATE_DATA || {};
  const name = c.name || '';
  const email = c.email || '';
  const linkedin = c.linkedin || '';
  const phone = c.phone || '';
  const phoneCountryCode = c.phoneCountryCode || '';
  const location = isEN
    ? (c.location && c.location.en) || (job.cv && job.cv.local) || ''
    : (c.location && c.location.pt) || (job.cv && job.cv.local) || '';

  if (!cl || !cl.authorized) {
    notAuthorized(`Cover Letter for "${job.vaga} - ${job.empresa || 'Não informado'}" not authorized yet.`);
  } else {
    document.documentElement.lang = isEN ? 'en' : 'pt-BR';
    document.getElementById('page-title').textContent = `Cover Letter${job.empresa ? ' - ' + job.empresa : ''} | ${name}`;

    const vagaLabel = job.vaga || (job.vagaTexto || '').slice(0, 60).split('\n')[0].trim() || 'Cover Letter';
    window._pdfData = { vaga: vagaLabel, empresa: job.empresa || 'Não informado', candidateName: name };

    const paragrafosHtml = (cl.paragrafos || []).map(p => `<p>${p}</p>`).join('');
    const applicationLabel = isEN ? 'Application' : 'Candidatura';
    const closingLabel = isEN ? 'Best regards,' : 'Atenciosamente,';

    const phoneFormatted = phoneCountryCode ? `${phoneCountryCode} ${phone}` : phone;
    const locationHtml = location
      ? `<span><i class="fa-solid fa-location-dot"></i> ${location}</span>` : '';
    const phoneHtml = phone
      ? `<a href="tel:${phoneFormatted}"><i class="fa-solid fa-phone"></i> ${phoneFormatted}</a>` : '';
    const emailHtml = email
      ? `<a href="mailto:${email}"><i class="fa-solid fa-envelope"></i> ${email}</a>` : '';
    const linkedinHtml = linkedin
      ? `<a href="${linkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> ${linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';

    const jobTarget = [job.vaga, job.empresa].filter(Boolean).join(' - ');

    root.innerHTML = `
      <div class="header">
        <h1>${name}</h1>
        <div class="meta">
          ${locationHtml}
          ${phoneHtml}
          ${emailHtml}
          ${linkedinHtml}
        </div>
      </div>
      <p class="job-target">${applicationLabel}: ${jobTarget}</p>
      <div class="cl-body">${paragrafosHtml}</div>
      <div class="signature">
        ${closingLabel}
        <strong>${name}</strong>
      </div>
    `;

    document.getElementById('btn-pdf').style.display = 'flex';
  }
}

document.getElementById('btn-pdf').addEventListener('click', () => {
  gerarPDF({ job: jobId, doc: 'cl' });
});
