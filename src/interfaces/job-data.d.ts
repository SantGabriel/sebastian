export interface Experience {
  cargo: string;
  empresa: string;
  url?: string;
  inicio: string;
  fim: string;
  stack: string;
  bullets: string[];
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
  | 'Fortemente desejável'
  | 'Noção, conhecimento'
  | 'Desejável/Diferencial';

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

/**
 * CV não direcionado a uma vaga específica (genérico). É a base comum: uma
 * vaga real (`Job`) é um `DataCV` com os campos adicionais da vaga.
 */
export interface DataCV {
  id: string;
  vaga: string;
  /** Idioma do CV: "pt" ou "en". */
  lang: string;
  tipos: string[];
  cv: CV;
}

export interface Job extends DataCV {
  /** Índice sequencial (começa em 1) para referenciar vagas por número. */
  index: number;
  empresa: string;
  link: string;
  modalidade: string;
  contratacao?: string;
  cidadeVaga?: string;
  vagaTexto: string;
  candidatura?: Candidatura;
  fit: Fit;
  cl: CL;
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
