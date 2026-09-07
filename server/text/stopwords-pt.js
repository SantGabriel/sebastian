// Stopwords em português — gramaticais + domínio de vagas de emprego.
// Já normalizadas (lowercase, sem acento) pois o tokenizer sempre chama
// foldAccents antes de comparar.
const STOPWORDS_PT = new Set([
  // artigos, preposições, conjunções, pronomes comuns
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'pra', 'com', 'sem',
  'sobre', 'entre', 'ate', 'apos', 'ante', 'perante', 'desde', 'durante',
  'e', 'ou', 'mas', 'nem', 'porem', 'contudo', 'todavia', 'entretanto',
  'que', 'se', 'quando', 'como', 'porque', 'pois', 'assim', 'entao',
  'ele', 'ela', 'eles', 'elas', 'eu', 'tu', 'voce', 'voces', 'nos', 'vos',
  'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas',
  'nosso', 'nossa', 'nossos', 'nossas', 'este', 'esta', 'estes', 'estas',
  'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas',
  'isso', 'isto', 'aquilo', 'lo', 'la', 'lhe', 'lhes', 'nele', 'nela',
  'qual', 'quais', 'quem', 'cujo', 'cuja',
  // verbos auxiliares/comuns
  'ser', 'estar', 'ter', 'haver', 'e', 'sao', 'foi', 'foram', 'era', 'eram',
  'esta', 'estao', 'estava', 'estavam', 'tem', 'tinha', 'tinham', 'ha',
  'sera', 'seria', 'pode', 'podem', 'podera', 'deve', 'devem', 'dever',
  'fazer', 'faz', 'fazem', 'ir', 'vai', 'vao',
  // advérbios/quantificadores genéricos
  'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas',
  'mais', 'menos', 'bem', 'mal', 'nao', 'sim', 'ja', 'ainda', 'so', 'tambem',
  'todo', 'toda', 'todos', 'todas', 'algum', 'alguma', 'alguns', 'algumas',
  'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas',
  'onde', 'aqui', 'ali', 'la', 'aonde',
  'numero', 'ano', 'anos', 'dia', 'dias', 'mes', 'meses',
  // domínio de vagas
  'vaga', 'vagas', 'empresa', 'empresas', 'candidato', 'candidata', 'candidatos',
  'requisito', 'requisitos', 'beneficio', 'beneficios', 'diferencial', 'diferenciais',
  'equipe', 'equipes', 'time', 'oportunidade', 'oportunidades', 'atuar', 'atuacao',
  'conhecimento', 'conhecimentos', 'experiencia', 'experiencias', 'perfil',
  'contratacao', 'processo', 'seletivo', 'curriculo', 'envie', 'enviar',
  'buscamos', 'procuramos', 'necessario', 'necessaria', 'desejavel', 'obrigatorio'
]);

module.exports = { STOPWORDS_PT };
