/**
 * Barra de paginação compartilhada — candidaturas (server-side, via API) e
 * insights/empresas (client-side, sobre a lista já carregada). O que muda entre
 * as duas é só de onde vêm `page`/`totalPages`; o markup é o mesmo.
 */

/** Janela de no máximo `size` números ao redor da página atual, sem estourar as bordas. */
export function pageWindow(current, totalPages, size = 5) {
  const start = Math.max(1, Math.min(current - Math.floor(size / 2), totalPages - size + 1));
  const end = Math.min(totalPages, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * HTML da barra. `handler` é o nome de uma função exposta no `window` (as
 * páginas usam handlers inline), chamada com o número da página.
 * Devolve string vazia quando há uma página só — nada a paginar.
 */
export function paginationBarHtml({ page, totalPages, handler }) {
  if (totalPages <= 1) return '';

  const numbers = pageWindow(page, totalPages)
    .map(p => `<button type="button" class="btn-secondary page-number${p === page ? ' current' : ''}" onclick="${handler}(${p})">${p}</button>`)
    .join('');

  return `
    <button type="button" class="btn-secondary" ${page <= 1 ? 'disabled' : ''} onclick="${handler}(${page - 1})">Anterior</button>
    ${numbers}
    <button type="button" class="btn-secondary" ${page >= totalPages ? 'disabled' : ''} onclick="${handler}(${page + 1})">Próxima</button>
    <span>Página ${page} de ${totalPages}</span>
  `;
}
