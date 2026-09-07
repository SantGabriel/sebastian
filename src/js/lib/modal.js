import { escapeHtml } from './dom.js';

/**
 * Modal único do projeto. Toda caixa de diálogo (confirmação, aviso, erro,
 * sucesso) sai daqui — não crie outro arquivo de modal e não use
 * `alert`/`confirm`, que travam a página e não são estilizáveis.
 *
 * Três entradas, da mais baixa para a mais alta:
 * - `openModal`   — controle total; o `onConfirm` decide quando fechar.
 * - `showMessage` — substitui `alert`; Promise que resolve ao fechar.
 * - `askConfirm`  — substitui `confirm`; Promise<boolean>.
 */

const VARIANTS = {
  info: 'fa-circle-info',
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  danger: 'fa-triangle-exclamation'
};

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.bodyHtml] HTML já montado; tem precedência sobre `message`.
 * @param {string} [options.message] Texto puro — escapado, preservando quebras de linha.
 * @param {'info'|'success'|'error'|'danger'} [options.variant] Ícone ao lado do título.
 * @param {string} [options.confirmLabel]
 * @param {string} [options.cancelLabel]
 * @param {string} [options.confirmClass]
 * @param {boolean} [options.showCancel] `false` deixa só o botão de confirmar (modo aviso).
 * @param {(overlay: HTMLElement, close: () => void) => void} [options.onConfirm]
 *        Se omitido, confirmar apenas fecha. Recebe `close` porque a ação pode
 *        ser assíncrona e falhar — quem decide fechar é o chamador.
 * @param {(overlay: HTMLElement) => void} [options.onRender]
 * @param {() => void} [options.onClose] Chamado uma única vez, feche como for.
 * @param {boolean} [options.dismissible] `false` exige usar os botões (sem ESC/clique fora).
 */
export function openModal({
  title,
  bodyHtml,
  message,
  variant,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmClass = 'btn-primary',
  showCancel = true,
  onConfirm,
  onRender,
  onClose,
  dismissible = true
}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const iconClass = VARIANTS[variant];
  const iconHtml = iconClass
    ? `<i class="fa-solid ${iconClass} modal-icon modal-icon--${variant}"></i> `
    : '';
  const body = bodyHtml !== undefined
    ? bodyHtml
    : `<p class="modal-message">${escapeHtml(message ?? '')}</p>`;

  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <h3>${iconHtml}${escapeHtml(title)}</h3>
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        ${showCancel ? `<button type="button" class="btn btn-secondary" data-action="cancel">${escapeHtml(cancelLabel)}</button>` : ''}
        <button type="button" class="btn ${confirmClass}" data-action="confirm">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
    if (onClose) onClose();
  };

  function onKeydown(e) {
    if (e.key === 'Escape' && dismissible) close();
  }
  document.addEventListener('keydown', onKeydown);

  const cancelBtn = overlay.querySelector('[data-action="cancel"]');
  if (cancelBtn) cancelBtn.addEventListener('click', close);

  if (dismissible) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  const confirmBtn = overlay.querySelector('[data-action="confirm"]');
  confirmBtn.addEventListener('click', () => {
    if (onConfirm) onConfirm(overlay, close);
    else close();
  });

  if (onRender) onRender(overlay);
  confirmBtn.focus();

  return { overlay, close };
}

/**
 * Substitui `alert`. Resolve quando o usuário fecha — dá para `await` se o
 * fluxo seguinte depender da leitura, ou ignorar o retorno se não depender.
 * @returns {Promise<void>}
 */
export function showMessage({ title, message, bodyHtml, variant = 'info', confirmLabel = 'OK' }) {
  return new Promise(resolve => {
    openModal({
      title,
      message,
      bodyHtml,
      variant,
      confirmLabel,
      showCancel: false,
      onClose: resolve
    });
  });
}

/**
 * Substitui `confirm`. Resolve `true` só no botão de confirmar; cancelar, ESC,
 * clique fora e qualquer outro fechamento resolvem `false`.
 * @returns {Promise<boolean>}
 */
export function askConfirm({
  title,
  message,
  bodyHtml,
  variant = 'danger',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmClass = 'btn-danger'
}) {
  return new Promise(resolve => {
    let confirmed = false;
    openModal({
      title,
      message,
      bodyHtml,
      variant,
      confirmLabel,
      cancelLabel,
      confirmClass,
      onConfirm: (_overlay, close) => {
        confirmed = true;
        close();
      },
      onClose: () => resolve(confirmed)
    });
  });
}
