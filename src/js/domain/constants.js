// Vocabulário de etapas/desfechos do processo seletivo — ESM puro, compartilhado
// entre o server (via require(esm)) e o browser (candidaturas.js, insights.js).
// Espelha os enums Stage/Outcome do prisma/schema.prisma; qualquer mudança
// precisa ser feita nos dois.

export const STAGES = Object.freeze({
  CURRICULO: 'CURRICULO',
  ENTREVISTA_RH: 'ENTREVISTA_RH',
  TESTE_PRATICO: 'TESTE_PRATICO',
  ENTREVISTA_TECNICA: 'ENTREVISTA_TECNICA',
  ETAPA_FINAL: 'ETAPA_FINAL',
  PROPOSTA_RECEBIDA: 'PROPOSTA_RECEBIDA',
  EMPREGADO: 'EMPREGADO',
  PROPOSTA_RECUSADA: 'PROPOSTA_RECUSADA',
  REPROVADO: 'REPROVADO'
});

/** Ordem de progresso; 0 = etapa terminal (não sequencial, usada só para desempate). */
export const STAGE_ORDER = Object.freeze({
  CURRICULO: 1,
  ENTREVISTA_RH: 2,
  TESTE_PRATICO: 3,
  ENTREVISTA_TECNICA: 4,
  ETAPA_FINAL: 5,
  PROPOSTA_RECEBIDA: 6,
  EMPREGADO: 7,
  PROPOSTA_RECUSADA: 0,
  REPROVADO: 0
});

export const STAGE_LABELS = Object.freeze({
  CURRICULO: 'Currículo',
  ENTREVISTA_RH: 'Entrevista RH',
  TESTE_PRATICO: 'Teste Prático',
  ENTREVISTA_TECNICA: 'Entrevista Técnica',
  ETAPA_FINAL: 'Etapa Final',
  PROPOSTA_RECEBIDA: 'Proposta Recebida',
  EMPREGADO: 'Empregado',
  PROPOSTA_RECUSADA: 'Proposta Recusada',
  REPROVADO: 'Reprovado'
});

export const STAGE_LIST = Object.freeze(Object.keys(STAGES));

export const TERMINAL_STAGES = Object.freeze([STAGES.EMPREGADO, STAGES.PROPOSTA_RECUSADA, STAGES.REPROVADO]);

export function isTerminalStage(stage) {
  return TERMINAL_STAGES.includes(stage);
}

export const OUTCOMES = Object.freeze({
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONTRATADO: 'CONTRATADO',
  REPROVADO: 'REPROVADO',
  PROPOSTA_RECUSADA: 'PROPOSTA_RECUSADA'
});

export function stageToOutcome(stage) {
  if (stage === STAGES.EMPREGADO) return OUTCOMES.CONTRATADO;
  if (stage === STAGES.PROPOSTA_RECUSADA) return OUTCOMES.PROPOSTA_RECUSADA;
  if (stage === STAGES.REPROVADO) return OUTCOMES.REPROVADO;
  return OUTCOMES.EM_ANDAMENTO;
}

export const OUTCOME_LABELS = Object.freeze({
  [OUTCOMES.EM_ANDAMENTO]: 'Em andamento',
  [OUTCOMES.CONTRATADO]: 'Contratado',
  [OUTCOMES.REPROVADO]: 'Reprovado',
  [OUTCOMES.PROPOSTA_RECUSADA]: 'Proposta recusada'
});
