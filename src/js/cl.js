import { gerarPDF } from './pdf.js';

const params = new URLSearchParams(window.location.search);
const jobId = params.get('job');
const applicationId = params.get('application');
const root = document.getElementById('cl-root');

let pdfMeta = {};
let job;
let CANDIDATE_DATA;

const importData = (path) => import(path).catch(() => ({}));

let documentDataPromise = null;
function fetchDocumentData() {
  if (!documentDataPromise) {
    documentDataPromise = fetch(`/api/applications/${applicationId}/document-data`)
      .then(res => (res.ok ? res.json() : { job: null, candidate: null }))
      .catch(() => ({ job: null, candidate: null }));
  }
  return documentDataPromise;
}

async function getData() {
  if (applicationId) {
    const data = await fetchDocumentData();
    job = data.job;
    CANDIDATE_DATA = data.candidate;
  } else {
    const [{ JOBS = [] }, { CANDIDATE_DATA: candidateData }] = await Promise.all([
      importData('../json/jobs-data.js'),
      importData('../json/candidate-data.js')
    ]);
    job = JOBS.find(j => j.id === jobId);
    CANDIDATE_DATA = candidateData;
  }
}

await getData();

/**
 * @param {string} phone
 * @param {string} countryCode
 * @returns {string}
 */
function formatPhoneWithCountryCode(phone, countryCode) {
  if (!phone) return '';
  return countryCode ? `${countryCode} ${phone}` : phone;
}

function notAuthorized(msg) {
  root.innerHTML = `
    <div class="not-authorized">
      <i class="fa-solid fa-lock"></i>
      <h2 style="color:#ccc">Cover Letter not authorized</h2>
      <p>${msg || 'This Cover Letter has not been authorized yet.'}</p>
    </div>`;
}

function render() {
  if ((!jobId && !applicationId) || !job) {
    notAuthorized(
      applicationId ? `Application "${applicationId}" not found.`
        : jobId ? `Job "${jobId}" not found in src/json/jobs-data.js.`
          : 'No job parameter provided in the URL.'
    );
    return;
  }
  const cl = job.cl;
  const isEN = job.lang === 'en';

  const c = CANDIDATE_DATA || {};
  const name = c.name;
  const email = c.email;
  const linkedin = c.linkedin;
  const phone = c.phone;
  const phoneCountryCode = c.phoneCountryCode;
  const location = isEN
    ? c.location.en
    : c.location.pt;

  if (!cl.authorized) {
    notAuthorized(`Cover Letter for "${job.vaga} - ${job.empresa || 'Não informado'}" ainda não autorizado.`);
    return;
  }
  document.documentElement.lang = isEN ? 'en' : 'pt-BR';
  const jobTarget = [job.vaga, job.empresa].filter(Boolean).join(' - ');
  document.getElementById('page-title').textContent = `${jobTarget} | ${name} | Cover Letter`;

  const vagaLabel = job.vaga;
  pdfMeta = {vaga: vagaLabel, empresa: job.empresa, candidateName: name};

  const paragrafosHtml = (cl.paragrafos).map(p => `<p>${p}</p>`).join('');
  const applicationLabel = isEN ? 'Application' : 'Candidatura';
  const closingLabel = isEN ? 'Best regards,' : 'Atenciosamente,';

  const locationHtml = location
    ? `<span><i class="fa-solid fa-location-dot"></i> ${location}</span>` : '';
  const phoneHtml = phone
    ? `<a href="tel:${formatPhoneWithCountryCode(phone, phoneCountryCode)}"><i class="fa-solid fa-phone"></i> ${formatPhoneWithCountryCode(phone, phoneCountryCode)}</a>` : '';
  const emailHtml = email
    ? `<a href="mailto:${email}"><i class="fa-solid fa-envelope"></i> ${email}</a>` : '';
  const linkedinHtml = linkedin
    ? `<a href="${linkedin}" target="_blank"><i class="fa-brands fa-linkedin"></i> ${linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';

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

  document.getElementById('btn-pdf').style.display = 'flex'; // torna botão de download visível no navegador. No download ele permanece hidden

}

document.getElementById('btn-pdf').addEventListener('click', () => {
  gerarPDF({
    job: applicationId ? undefined : jobId,
    application: applicationId || undefined,
    doc: 'cl',
    ...pdfMeta
  });
});

render();