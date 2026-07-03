const BASE_URL = 'http://localhost:3001/pdf';

/**
 * Monta a URL do endpoint de PDF e dispara o download.
 * @param {object} opts
 * @param {string} opts.job - ID da vaga
 * @param {string} [opts.doc='cv'] - Tipo de documento ('cv' ou 'cl')
 * @param {string} [opts.isGeneric] - 'true' se for CV genérico
 * @param {string} [opts.candidate] - Nome do diretório de fixture
 * @param {string} [opts.vaga] - Nome da vaga, usado no nome do arquivo
 * @param {string} [opts.empresa] - Nome da empresa, usado no nome do arquivo
 * @param {string} [opts.candidateName] - Nome do candidato, usado no nome do arquivo
 */
export function gerarPDF({ job, doc = 'cv', isGeneric, candidate, vaga, empresa, candidateName } = {}) {
  const params = new URLSearchParams({ job, doc });
  if (isGeneric) params.set('isGeneric', isGeneric);
  if (candidate) params.set('candidate', candidate);
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
      a.download = document.title.replace(' | ', ' - ') + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(err => alert('Erro ao gerar PDF.\nVerifique se o servidor está rodando:\nnpm start\n\n' + err.message))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Baixar PDF';
    });
}
