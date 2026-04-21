'use client';

// Generic localStorage wrapper for the application
const DB_PREFIX = 'igreja_db_';

export function dbGet<T>(table: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DB_PREFIX + table);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function dbSet<T>(table: string, data: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_PREFIX + table, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function generateMatricula(currentAlunosLength: number) {
  const ano = new Date().getFullYear();
  return ano + String(currentAlunosLength + 1).padStart(3, '0');
}

export function generateCodLicao(currentLicoesLength: number) {
  return 'LIC' + String(currentLicoesLength + 1).padStart(3, '0');
}

// Global Types
export interface Aluno {
  id: string;
  mat: string;
  nome: string;
  end: string;
  cont: string;
  sexo: string;
}

export interface Turma {
  id: string;
  nome: string;
  prof: string;
  turno: string;
  licaoId: string;
  alunos: string[];
}

export interface Licao {
  id: string;
  cod: string;
  nome: string;
  ini: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
}

export interface Dizimo {
  id: string;
  turmaId: string;
  turmaNome: string;
  turno: string;
  valor: number;
  data: string; // YYYY-MM-DD
}

export interface ChamadaRegistro {
  alunoId: string;
  alunoNome: string;
  status: 'presente' | 'ausente' | 'visitante' | '';
}

export interface Chamada {
  id: string;
  turmaId: string;
  turmaNome: string;
  data: string; // YYYY-MM-DD
  registros: ChamadaRegistro[];
  qtdBiblia: number;
  qtdRevista: number;
  qtdVisitante?: number;
}
