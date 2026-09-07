import { showMessage } from './lib/modal.js';

const BASE_URL = `${window.location.origin}/pdf`;

/**
 * Monta a URL do endpoint de PDF e dispara o download.
 * @param {object} opts
 * @param {string} [opts.job] - ID da vaga (ignorado se opts.application for informado)
 * @param {string} [opts.application] - ID da candidatura arquivada, para regerar a partir do banco
 * @param {string} [opts.doc='cv'] - Tipo de documento ('cv' ou 'cl')
 * @param {string} [opts.isGeneric] - 'true' se for CV genérico
 * @param {string} [opts.candidate] - Nome do diretório de fixture
 * @param {string} [opts.vaga] - Nome da vaga, usado no nome do arquivo
 * @param {string} [opts.empresa] - Nome da empresa, usado no nome do arquivo
 * @param {string} [opts.candidateName] - Nome do candidato, usado no nome do arquivo
 */
export function gerarPDF({ job, application, doc = 'cv', isGeneric, candidate, vaga, empresa, candidateName } = {}) {
  const params = new URLSearchParams({ doc });
  /**
   * O CV vem:
   * 1) application - candidatura arquivada (DB) ou
   * 2) job - vaga recém-avaliada (jobs-data.js)
   * */
  if (application) params.set('application', application);
  else params.set('job', job);

  // Se a vaga é genérica
  if (isGeneric) params.set('isGeneric', isGeneric);

  // Se tem um candidato é de fixture, se não, é o próprio candidato
  if (candidate) params.set('candidate', candidate);

  // Dados para o nome do arquivo. Formato: "{candidateName} - {vaga} - {empresa}.pdf"
  if (vaga) params.set('vaga', vaga);
  if (empresa) params.set('empresa', empresa);
  if (candidateName) params.set('candidateName', candidateName);

  const btn = document.getElementById('btn-pdf');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';

  fetch(`${BASE_URL}?${params}`)
    .then(res => {
      if (!res.ok) throw new Error('Servidor retornou erro ' + res.status);
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const coverLetterTxt = doc === 'cl' ? ' - Cover Letter' : '';
      const nameParts = [candidateName, vaga, empresa, coverLetterTxt].filter(Boolean);
      const filename = nameParts.join(' - ');
      a.download = filename + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(err => showMessage({
      title: 'Erro ao gerar PDF',
      message: `Verifique se o servidor está rodando:\nnpm start\n\n${err.message}`,
      variant: 'error'
    }))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Baixar PDF';
    });
}
