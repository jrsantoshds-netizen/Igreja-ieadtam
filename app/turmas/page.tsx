'use client';

import { useState, useEffect } from 'react';
import { Layers, List, Edit2, Trash2, Users, Save, Eraser } from 'lucide-react';
import { dbSave, dbDelete, generateId, Turma, Licao, Aluno } from '@/lib/db';
import { useCollection } from '@/lib/useCollection';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Turmas() {
  const { profile, user } = useAuth();
  
  const { data: turmas, loading: tLoading } = useCollection<Turma>('turmas', profile?.congregacao);
  const { data: licoes, loading: lLoading } = useCollection<Licao>('licoes', profile?.congregacao);
  const { data: alunos, loading: aLoading } = useCollection<Aluno>('alunos', profile?.congregacao);
  
  const [form, setForm] = useState<Partial<Turma>>({ alunos: [] });
  const [editId, setEditId] = useState('');
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState('');

  const resetForm = () => {
    setEditId('');
    setForm({ nome: '', prof: '', turno: '', licaoId: '', alunos: [] });
  };

  const handleSave = async () => {
    if (!form.nome?.trim()) { toast('Preencha o nome da turma.', 'err'); return; }
    if (!form.prof?.trim()) { toast('Preencha o professor.', 'err'); return; }
    if (!form.turno) { toast('Selecione o turno.', 'err'); return; }
    if (!form.licaoId) { toast('Selecione uma lição.', 'err'); return; }
    if (!form.alunos || form.alunos.length === 0) { toast('Selecione pelo menos um aluno.', 'err'); return; }
    if (!profile?.congregacao || !user?.uid) return;

    try {
      if (editId) {
        const payload = { ...turmas.find(t => t.id === editId), ...form } as Turma;
        await dbSave('turmas', payload, profile.congregacao, user.uid);
        toast('Turma atualizada com sucesso!');
      } else {
        const payload = {
          id: generateId(),
          nome: form.nome.trim(),
          prof: form.prof.trim(),
          turno: form.turno,
          licaoId: form.licaoId,
          alunos: form.alunos,
        };
        await dbSave('turmas', payload, profile.congregacao, user.uid);
        toast('Turma cadastrada com sucesso!');
      }
      resetForm();
    } catch (e) {
      toast('Erro ao salvar!', 'err');
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditId(turma.id);
    setForm({ ...turma });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await dbDelete('turmas', turmaToDelete);
      setIsModalOpen(false);
      toast('Turma excluída!', 'info');
    } catch (e) {
      toast('Erro ao excluir', 'err');
    }
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
    return names.join(', ');
  };

  if (tLoading || lLoading || aLoading) return <div className="p-10 animate-pulse text-gray-500">Carregando...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Cadastro de Turmas</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Gerencie as turmas e professores</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <Layers size={18} className="text-[var(--color-accent)]" /> Nova Turma
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-[5px] lg:col-span-2">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Nome da Turma</label>
              <input type="text" value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Jovens - Classe Betel" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px] lg:col-span-2">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Professor Principal</label>
              <input type="text" value={form.prof || ''} onChange={e => setForm({...form, prof: e.target.value})} placeholder="Nome do Professor" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            
            <div className="flex flex-col gap-[5px] lg:col-span-1">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turno</label>
              <select value={form.turno || ''} onChange={e => setForm({...form, turno: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-[5px] lg:col-span-3">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Lição Atual Vinculada</label>
              <select value={form.licaoId || ''} onChange={e => setForm({...form, licaoId: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione a lição...</option>
                {licoes.map(l => (
                  <option key={l.id} value={l.id}>{l.cod} - {l.nome}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 border-t border-[var(--color-border)] pt-5">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] flex items-center gap-2 mb-3">
              <Users size={14} /> Selecionar Alunos ({form.alunos?.length || 0})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto p-2 border-2 border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] custom-scrollbar">
              {alunos.length === 0 ? (
                <div className="col-span-full text-[13px] text-[var(--color-muted)] p-2">Nenhum aluno cadastrado.</div>
              ) : alunos.map(aluno => (
                <label key={aluno.id} className="flex items-center gap-2.5 p-[9px] rounded-md hover:bg-white border border-transparent shadow-sm cursor-pointer transition-colors has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-primary-pale)]">
                  <input 
                    type="checkbox" 
                    checked={form.alunos?.includes(aluno.id) || false}
                    onChange={() => toggleAluno(aluno.id)}
                    className="w-[15px] h-[15px] rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[var(--color-fg)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{aluno.nome}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-5 flex gap-2.5">
            <button type="submit" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:bg-[var(--color-primary-light)] transition-transform active:scale-[0.97]">
              <Save size={16} /> Salvar
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all active:scale-[0.97]">
              <Eraser size={16} /> Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px] pb-3 border-b border-[var(--color-border)]">
          <List size={18} className="text-[var(--color-accent)]" /> Turmas Registradas
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Turma</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Prof. Resp.</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Turno</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Alunos</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)] text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {turmas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[13px] text-[var(--color-muted)]">Nenhuma turma encontrada.</td>
                </tr>
              ) : (
                turmas.map(turma => (
                  <tr key={turma.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors">
                    <td className="py-3.5 px-4 text-[13px] font-medium text-[var(--color-primary)]">{turma.nome}</td>
                    <td className="py-3.5 px-4 text-[13.5px] text-[var(--color-fg)]">{turma.prof}</td>
                    <td className="py-3.5 px-4 text-[13px] text-[var(--color-muted)]">{turma.turno}</td>
                    <td className="py-3.5 px-4 text-[13px] text-[var(--color-muted)] max-w-[200px] truncate" title={getAlunosNames(turma.alunos)}>
                      {turma.alunos.length} matriculados
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleEdit(turma)} className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-pale)] rounded-md transition-colors" title="Editar">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => { setTurmaToDelete(turma.id); setIsModalOpen(true); }} className="p-2 text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] rounded-md transition-colors" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Excluir Turma"
        message="Tem certeza que deseja excluir esta turma? Os alunos não serão excluídos do sistema, apenas desvinculados desta classe."
      />
    </div>
  );
}
