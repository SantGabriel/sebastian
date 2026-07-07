import { gerarPDF } from './pdf.js';
import { CANDIDATE_DATA } from '../json/candidate-data.js';
import { JOBS } from '../json/jobs-data.js';

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


const job = JOBS.find(job => job.id === jobId);

let pdfMeta = {};

if (!jobId || !job) {
  notAuthorized(jobId ? `Job "${jobId}" not found in src/json/jobs-data.js.` : 'No job parameter provided in the URL.');
} else {
  const cl = job.cl;
  const isEN = job.lang === 'en';

  const c = CANDIDATE_DATA || {};
  const name = c.name;
  const email = c.email;
  const linkedin = c.linkedin;
  const location = isEN
    ? c.location.en
    : c.location.pt;

  if (!cl || !cl.authorized) {
    notAuthorized(`Cover Letter for "${job.vaga} - ${job.empresa || 'Não informado'}" not authorized yet.`);
  } else {
    document.documentElement.lang = isEN ? 'en' : 'pt-BR';
    const jobTarget = [job.vaga, job.empresa].filter(Boolean).join(' - ');
    document.getElementById('page-title').textContent = `${jobTarget} | ${name} | Cover Letter`;

    const vagaLabel = job.vaga;
    pdfMeta = { vaga: vagaLabel, empresa: job.empresa || 'Não informado', candidateName: name };

    const paragrafosHtml = (cl.paragrafos).map(p => `<p>${p}</p>`).join('');
    const applicationLabel = isEN ? 'Application' : 'Candidatura';
    const closingLabel = isEN ? 'Best regards,' : 'Atenciosamente,';

    const locationHtml = location
      ? `<span><i class="fa-solid fa-location-dot"></i> ${location}</span>` : '';
    const emailHtml = email
      ? `<a href="mailto:${email}"><i class="fa-solid fa-envelope"></i> ${email}</a>` : '';
    const linkedinHtml = linkedin
      ? `<a href="${linkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> ${linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';

    root.innerHTML = `
      <div class="header">
        <h1>${name}</h1>
        <div class="meta">
          ${locationHtml}
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

    document.getElementById('btn-pdf').style.display = 'flex'; // torna botão de download visível no navegador. No download ele permanece hidden
  }
}

document.getElementById('btn-pdf').addEventListener('click', () => {
  gerarPDF({ job: jobId, doc: 'cl', ...pdfMeta });
});
