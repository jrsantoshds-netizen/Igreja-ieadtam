'use client';

import { useState, useEffect } from 'react';
import { Layers, List, Edit2, Trash2, Users, Save, Eraser } from 'lucide-react';
import { dbGet, dbSet, generateId, Turma, Licao, Aluno } from '@/lib/db';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  
  const [form, setForm] = useState<Partial<Turma>>({ alunos: [] });
  const [editId, setEditId] = useState('');
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState('');

  const loadData = () => {
    setTurmas(dbGet<Turma>('turmas'));
    setLicoes(dbGet<Licao>('licoes'));
    setAlunos(dbGet<Aluno>('alunos'));
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditId('');
    setForm({ nome: '', prof: '', turno: '', licaoId: '', alunos: [] });
  };

  const handleSave = () => {
    if (!form.nome?.trim()) { toast('Preencha o nome da turma.', 'err'); return; }
    if (!form.prof?.trim()) { toast('Preencha o professor.', 'err'); return; }
    if (!form.turno) { toast('Selecione o turno.', 'err'); return; }
    if (!form.licaoId) { toast('Selecione uma lição.', 'err'); return; }
    if (!form.alunos || form.alunos.length === 0) { toast('Selecione pelo menos um aluno.', 'err'); return; }

    let newTurmas = [...turmas];

    if (editId) {
      newTurmas = newTurmas.map(t => 
        t.id === editId ? { ...t, ...form } as Turma : t
      );
      toast('Turma atualizada com sucesso!');
    } else {
      newTurmas.push({
        id: generateId(),
        nome: form.nome.trim(),
        prof: form.prof.trim(),
        turno: form.turno,
        licaoId: form.licaoId,
        alunos: form.alunos,
      });
      toast('Turma cadastrada com sucesso!');
    }

    dbSet('turmas', newTurmas);
    setTurmas(newTurmas);
    resetForm();
  };

  const handleEdit = (turma: Turma) => {
    setEditId(turma.id);
    setForm({ ...turma });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    const newTurmas = turmas.filter(t => t.id !== turmaToDelete);
    dbSet('turmas', newTurmas);
    setTurmas(newTurmas);
    setIsModalOpen(false);
    toast('Turma excluída!', 'info');
  };

  const toggleAluno = (id: string) => {
    const isSelected = form.alunos?.includes(id);
    if (isSelected) {
      setForm({ ...form, alunos: form.alunos?.filter(aid => aid !== id) });
    } else {
      setForm({ ...form, alunos: [...(form.alunos || []), id] });
    }
  };

  const getAlunosNames = (turmaAlunos: string[]) => {
    const names = turmaAlunos.map(id => {
      const a = alunos.find(al => al.id === id);
      return a ? a.nome : '(removido)';
    });
    
    if (names.length > 2) {
      return `${names.slice(0, 2).join(', ')} (+${names.length - 2})`;
    }
    return names.join(', ') || '—';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Cadastro de Turmas</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Organize turmas, vincule alunos e lições</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <Layers size={18} className="text-[var(--color-accent)]" /> Nova Turma
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Nome da Turma</label>
              <input type="text" value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Classe de Jovens" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Professor</label>
              <input type="text" value={form.prof || ''} onChange={e => setForm({...form, prof: e.target.value})} placeholder="Nome do professor" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turno</label>
              <select value={form.turno || ''} onChange={e => setForm({...form, turno: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Lição</label>
              <select value={form.licaoId || ''} onChange={e => setForm({...form, licaoId: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione uma lição...</option>
                {licoes.map(l => (
                   <option key={l.id} value={l.id}>{l.cod} - {l.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-[5px] sm:col-span-2 lg:col-span-4">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Alunos da Turma</label>
              <div className="max-h-[180px] overflow-y-auto border-2 border-[var(--color-border)] rounded-lg p-1.5 bg-[var(--color-card)]">
                {alunos.length === 0 ? (
                  <p className="p-2.5 text-[var(--color-muted)] text-[13px]">Nenhum aluno disponível. Cadastre alunos primeiro.</p>
                ) : (
                  alunos.map(a => (
                     <label key={a.id} className="flex items-center px-2.5 py-1.5 rounded-md cursor-pointer text-[13px] hover:bg-black/[0.025] transition-colors">
                       <input 
                         type="checkbox" 
                         className="mr-2 accent-[var(--color-accent)]" 
                         checked={form.alunos?.includes(a.id) || false}
                         onChange={() => toggleAluno(a.id)}
                       />
                       {a.nome} <span className="text-[var(--color-muted)] text-[11px] ml-1">({a.mat})</span>
                     </label>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2.5">
            <button type="submit" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:bg-[var(--color-primary-light)] transition-transform active:scale-[0.97]">
              <Save size={16} /> Salvar
            </button>
            <button type="button" onClick={() => resetForm()} className="px-5 py-2.5 bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all active:scale-[0.97]">
              <Eraser size={16} /> Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <List size={18} className="text-[var(--color-accent)]" /> Turmas Cadastradas
        </div>
        
        <div className="overflow-x-auto">
          {turmas.length === 0 ? (
            <div className="text-center py-10 px-5 text-[var(--color-muted)]">
              <Users size={40} className="mx-auto mb-3 opacity-20 block" />
              <p className="text-[13.5px]">Nenhuma turma cadastrada ainda</p>
            </div>
          ) : (
             <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Nome</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Professor</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Turno</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Lição</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Alunos</th>
                   <th className="text-right py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {turmas.map(t => {
                    const licao = licoes.find(l => l.id === t.licaoId);
                    return (
                     <tr key={t.id} className="hover:bg-black/[0.012] group">
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle font-bold">{t.nome}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{t.prof}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-primary-pale)] text-[var(--color-primary)]">
                            {t.turno}
                          </span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          {licao ? `${licao.cod} - ${licao.nome}` : '—'}
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle max-w-[200px] truncate">
                          {getAlunosNames(t.alunos)}
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle text-right">
                         <button onClick={() => handleEdit(t)} className="px-3 py-1.5 rounded-md text-[12px] bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all mr-1.5"><Edit2 size={14} /></button>
                         <button onClick={() => {setTurmaToDelete(t.id); setIsModalOpen(true);}} className="px-3 py-1.5 rounded-md text-[12px] bg-[var(--color-danger)] text-white hover:bg-[#9c2f24] transition-all"><Trash2 size={14} /></button>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        title="Excluir Turma"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
