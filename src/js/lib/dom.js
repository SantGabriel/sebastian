const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ESCAPE_MAP[c]);
}

/**
 * Anima a saída de um elemento antes de a lista ser re-renderizada, para que
 * remover um item não vire um "pulo" na tela. Nunca recarregue a página para
 * refletir uma remoção — remova do estado local e re-renderize.
 *
 * Resolve mesmo sem `transitionend` (elemento fora da tela, `prefers-reduced-motion`
 * ou elemento já inexistente), então dá para `await` sem risco de travar o fluxo.
 *
 * @param {Element|null} el
 * @param {number} [timeout] Teto em ms, caso a transição não dispare.
 * @returns {Promise<void>}
 */
export function fadeOutElement(el, timeout = 300) {
  if (!el) return Promise.resolve();

  el.classList.add('is-removing');

  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, timeout);
  });
}
