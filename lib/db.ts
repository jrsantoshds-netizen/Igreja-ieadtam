import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export async function dbGet<T>(table: string, congregacao: string): Promise<T[]> {
  if (!congregacao) return [];
  try {
    let q;
    if (congregacao === '*') {
      // Admin sees all (if you want admin to see all. Since indexes might be required for orderBy, let's keep it simple)
      q = query(collection(db, table));
    } else {
      q = query(collection(db, table), where('congregacao', '==', congregacao));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as T));
  } catch (e) {
    console.error('Error fetching data:', e);
    return [];
  }
}

export async function dbSave<T extends { id: string }>(table: string, data: T, congregacao: string, uid: string) {
  if (!data.id || !congregacao || !uid) return;
  try {
    const docRef = doc(db, table, data.id);
    const existing = await getDocs(query(collection(db, table), where('id', '==', data.id)));
    
    const payload = { ...data, congregacao };
    if (existing.empty && !(payload as any).createdAt) {
      (payload as any).createdAt = serverTimestamp();
      (payload as any).createdBy = uid;
    }
    
    await setDoc(docRef, payload, { merge: true });
  } catch (e) {
    console.error('Error saving document:', e);
    throw e;
  }
}

export async function dbDelete(table: string, id: string) {
  try {
    await deleteDoc(doc(db, table, id));
  } catch (e) {
    console.error('Error deleting document:', e);
    throw e;
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
  congregacao?: string;
}

export interface Turma {
  id: string;
  nome: string;
  prof: string;
  turno: string;
  licaoId: string;
  alunos: string[];
  congregacao?: string;
}

export interface Licao {
  id: string;
  cod: string;
  nome: string;
  ini: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
  congregacao?: string;
}

export interface Dizimo {
  id: string;
  turmaId: string;
  turmaNome: string;
  turno: string;
  valor: number;
  data: string; // YYYY-MM-DD
  congregacao?: string;
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
  congregacao?: string;
}
