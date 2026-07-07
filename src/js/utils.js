import { GAP_TIPO } from './enum.js';

export function gapWeight(tipo) {
  switch (tipo) {
    case GAP_TIPO.REQUISITO_CORE:        return 4;
    case GAP_TIPO.REQUISITO_IMPORTANTE:  return 3;
    case GAP_TIPO.REQUISITO_SECUNDARIO:  return 2;
    case GAP_TIPO.REQUISITO_FRACO:       return 1;
    case GAP_TIPO.FORTEMENTE_DESEJAVEL:  return 1;
    case GAP_TIPO.NOCAO_CONHECIMENTO:    return 0.5;
    case GAP_TIPO.DESEJAVEL_DIFERENCIAL: return 0.25;
    default:                             return null;
  }
}
