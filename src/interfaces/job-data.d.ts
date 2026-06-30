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

export interface CV {
  /** Só vagas reais usam o portão de autorização; CVs genéricos omitem. */
  authorized?: boolean;
  /** Localização específica do CV; quando ausente, usa a do candidato. */
  local?: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  experiencias: Experience[];
  projetos?: Project[];
  skills: string[];
  educacao: Education[];
  certificados?: Certificate[];
  idiomas: string[];
}

export interface CL {
  authorized: boolean;
  paragrafos?: string[];
}

export type GapTipo =
  | 'Requisito Core'
  | 'Requisito Importante'
  | 'Requisito Secundário'
  | 'Requisito Baixo'
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

export interface Job {
  /** Índice sequencial (começa em 1) para referenciar vagas por número. */
  id: string;
  vaga: string;
  /** Idioma do CV: "pt" ou "en". */
  lang: string;
  tipos: ("cv"|"cl")[];
  /** Campos abaixo só existem em vagas reais; CVs genéricos omitem. */
  index?: number;
  empresa?: string;
  link?: string;
  modalidade?: string;
  contratacao?: string;
  cidadeVaga?: string;
  vagaTexto?: string;
  candidatura?: Candidatura;
  fit?: Fit;
  cl?: CL;
  cv: CV;
}

/** Dados pessoais do candidato (src/json/candidate-data.js). */
export interface CandidateData {
  name: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
  linkedin: string;
  location: { pt: string; en: string };
}
