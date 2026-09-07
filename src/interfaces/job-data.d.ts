export interface Experience {
  cargo: string;
  empresa: string;
  url?: string;
  inicio: string;
  fim: string;
  stack: string;
  bullets: string[];
  /**
   * Marca a experiência mais relevante para a vaga (a de maior destaque).
   * Exatamente uma experiência do CV deve ter `true`; as demais omitem o campo.
   */
  maisRelevante?: boolean;
  /**
   * Marca uma experiência condensada: entrada enxuta (1 bullet de 70 a 150
   * caracteres) usada para preservar a linha do tempo sem gastar espaço.
   * Fica fora dos limites de bullet/caracteres das experiências detalhadas e
   * nunca pode ser a `maisRelevante`. As demais omitem o campo.
   */
  condensada?: boolean;
}

export interface Education {
  curso: string;
  inst: string;
  url?: string;
  periodo: string;
  stack: string;
}

export interface Project {
  nome: string;
  periodo: string;
  descricao: string;
  stack: string;
  url?: string;
}

export interface Certificate {
  nome: string;
  url?: string;
  periodo: string;
}

export interface Language {
  idioma: string;
  url?: string;
}

export interface CV {
  authorized?: boolean;
  /** Localização específica do CV; quando ausente, usa a do candidato. */
  local?: string;
  titulo: string;
  subtitulo: string; // Listagem das stacks mais importantes - Ex: "React | Node.js | AWS"
  resumo: string;
  experiencias: Experience[];
  projetos?: Project[];
  skills: string[];
  educacao: Education[];
  certificados?: Certificate[];
  idiomas: Language[];
}

export interface CL {
  authorized: boolean;
  paragrafos?: string[];
}

export type GapTipo =
  | 'Requisito Core'
  | 'Requisito Importante'
  | 'Requisito Secundário'
  | 'Requisito Fraco'
  | 'Fortemente desejável'
  | 'Noção, conhecimento'
  | 'Desejável/Diferencial'
  | 'Personalizado';

export interface Gap {
  descricao: string;
  tipo: GapTipo;
}

export interface Fit {
  score: number;
  positivos: string[];
  negativos: Gap[];
  summary: string;
}

export interface Candidatura {
  aviso: string;
  url?: string;
}

export type DuplicataTipo =
  /** Mesmo texto de vaga de uma candidatura anterior. */
  | 'repostagem'
  /** Mesmo texto de uma vaga que o usuário já removeu do dashboard. */
  | 'descartada'
  /** Mesma empresa e título, texto parecido — heurística, pode ser falso positivo. */
  | 'possivel-repostagem';

export interface Duplicata {
  tipo: DuplicataTipo;
  /** Texto pronto para exibição, escrito pelo agente a partir da resposta do /check. */
  aviso: string;
}

export interface Job {
  /** Índice sequencial (começa em 1) para referenciar vagas por número. */
  id: string;
  vaga: string;
  /** Idioma do CV: "pt" ou "en". */
  lang: string;
  /** Campos abaixo só existem em vagas reais; CVs genéricos omitem. */
  index: number;
  empresa?: string;
  link?: string;
  modalidade?: string;
  contratacao?: string;
  cidadeVaga?: string;
  vagaTexto: string;
  candidatura?: Candidatura;
  duplicata?: Duplicata;
  fit: Fit;
  cl: CL;
  cv: CV;
}

/** Dados pessoais do candidato (src/json/candidate-data.js). */
export interface CandidateData {
  name: string;
  phoneCountryCode?: string;
  phone?: string;
  email: string;
  linkedin?: string;
  /** URL do portfólio — pode ser um site pessoal ou link de repositórios (GitHub, GitLab, etc). */
  portfolio?: string;
  location: { pt: string; en: string };
}
