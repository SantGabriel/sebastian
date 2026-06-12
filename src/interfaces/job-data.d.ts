export interface Experience {
  cargo: string;
  empresa: string;
  url: string;
  inicio: string;
  fim: string;
  stack: string;
  bullets: string[];
}

export interface Education {
  curso: string;
  inst: string;
  periodo: string;
}

export interface CV {
  authorized: boolean;
  local: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  experiencias: Experience[];
  skills: string[];
  educacao: Education[];
  idiomas: string[];
}

export interface CL {
  authorized: boolean;
  paragrafos?: string[];
}

export interface Fit {
  score: number;
  positivos: string[];
  negativos: string[];
  summary: string;
}

export interface Candidatura {
  aviso: string;
  email?: string;
}

export interface Job {
  id: string;
  empresa: string;
  vaga: string;
  link: string;
  modalidade: string;
  contratacao?: string;
  cidadeVaga?: string;
  lang: string;
  tipos: string[];
  vagaTexto: string;
  candidatura?: Candidatura;
  fit: Fit;
  cv: CV;
  cl: CL;
}

export type JobsData = Job[];
