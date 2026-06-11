/**
 * Utilitários de DOM para testes.
 * (reconstruído — exporta os helpers usados pelos testes)
 */

/**
 * Cria um container no DOM para isolar um teste.
 * @param {string} id - id do container
 * @returns {HTMLElement}
 */
function createTestContainer(id = 'test-container') {
  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

/**
 * Remove o container de teste criado por createTestContainer.
 * @param {string} id - id do container
 */
function cleanupTestContainer(id = 'test-container') {
  const container = document.getElementById(id);
  if (container) container.remove();
}

/**
 * Busca um elemento por data-testid.
 * @param {string} testId
 * @param {ParentNode} root
 * @returns {Element|null}
 */
function getByTestId(testId, root = document) {
  return root.querySelector(`[data-testid="${testId}"]`);
}

module.exports = {
  getByTestId,
  createTestContainer,
  cleanupTestContainer,
};
