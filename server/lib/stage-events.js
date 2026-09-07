const { STAGE_ORDER } = require('../../src/js/domain/constants.js');

/** Alcançou pelo menos uma entrevista (ordem >= ENTREVISTA_RH), mesmo que tenha sido reprovado depois. */
function reachedInterview(stageEvents) {
  return (stageEvents || []).some(e => (STAGE_ORDER[e.stage] || 0) >= STAGE_ORDER.ENTREVISTA_RH);
}

module.exports = { reachedInterview };
