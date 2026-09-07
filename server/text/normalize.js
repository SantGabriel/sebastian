const { createHash } = require('node:crypto');

const COMBINING_DIACRITICS = new RegExp(String.fromCharCode(91) + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + String.fromCharCode(93), 'g');

/** Remove acentos/diacríticos preservando a letra base. */
function foldAccents(str) {
  return String(str || '').normalize('NFD').replace(COMBINING_DIACRITICS, '');
}

/**
 * Chave de busca/agrupamento: lowercase, sem acento, espaços colapsados.
 * Usada em tituloKey/nameKey — o SQLite dobra caixa em ASCII via LIKE, mas
 * não dobra acento, então "sao paulo" só acha "São Paulo" através desta chave.
 */
function toKey(str) {
  return foldAccents(String(str || '').toLowerCase())
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalização para hash de duplicata (req. 9): lowercase, sem acento,
 * remove tudo que não é alfanumérico (inclusive espaços).
 */
function normalizeForHash(str) {
  return foldAccents(String(str || '').toLowerCase()).replace(/[^a-z0-9]+/g, '');
}

/** sha256 hex de uma string (usa a normalização acima antes de hashear). */
function hashDescription(str) {
  return createHash('sha256').update(normalizeForHash(str)).digest('hex');
}

/** sha256 hex de um Buffer arbitrário (usado para o hash do arquivo PDF salvo). */
function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** Remove caracteres inválidos em nome de arquivo (mesma regra do pdf-server.js original). */
function sanitizeFilenamePart(str) {
  return String(str || '').replace(/[<>:"/\\|?*]/g, '').trim();
}

module.exports = {
  foldAccents,
  toKey,
  normalizeForHash,
  hashDescription,
  sha256Buffer,
  sanitizeFilenamePart
};
