'use client';

import { useState, useEffect } from 'react';
import { UserPlus, List, Edit2, Trash2, GraduationCap, Save, Eraser } from 'lucide-react';
import { dbGet, dbSet, generateId, generateMatricula, Aluno, Turma } from '@/lib/db';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [form, setForm] = useState<Partial<Aluno>>({});
  const [editId, setEditId] = useState('');
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState('');

  const resetForm = (len?: number) => {
    setEditId('');
    setForm({
      mat: generateMatricula(len !== undefined ? len : alunos.length),
      nome: '',
      end: '',
      cont: '',
      sexo: '',
    });
  };

  const loadAlunos = () => {
    const data = dbGet<Aluno>('alunos');
    setAlunos(data);
    resetForm(data.length);
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadAlunos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!form.nome?.trim()) { toast('Preencha o nome do aluno.', 'err'); return; }
    if (!form.end?.trim()) { toast('Preencha o endereço.', 'err'); return; }
    if (!form.cont?.trim()) { toast('Preencha o contato.', 'err'); return; }
    if (!form.sexo) { toast('Selecione o sexo.', 'err'); return; }

    let newAlunos = [...alunos];

    if (editId) {
      newAlunos = newAlunos.map(a => 
        a.id === editId ? { ...a, ...form } as Aluno : a
      );
      toast('Aluno atualizado com sucesso!');
    } else {
      newAlunos.push({
        id: generateId(),
        mat: form.mat!,
        nome: form.nome.trim(),
        end: form.end.trim(),
        cont: form.cont.trim(),
        sexo: form.sexo,
      });
      toast('Aluno cadastrado com sucesso!');
    }

    dbSet('alunos', newAlunos);
    setAlunos(newAlunos);
    resetForm(newAlunos.length);
  };

  const handleEdit = (aluno: Aluno) => {
    setEditId(aluno.id);
    setForm({ ...aluno });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    let newAlunos = alunos.filter(a => a.id !== alunoToDelete);
    dbSet('alunos', newAlunos);
    
    // Also remove from turmas
    const turmas = dbGet<Turma>('turmas');
    const newTurmas = turmas.map(t => ({
      ...t,
      alunos: t.alunos.filter((aid: string) => aid !== alunoToDelete)
    }));
    dbSet('turmas', newTurmas);
    
    setAlunos(newAlunos);
    setIsModalOpen(false);
    toast('Aluno excluído!', 'info');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Cadastro de Alunos</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Gerencie os alunos matriculados na EBD</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <UserPlus size={18} className="text-[var(--color-accent)]" /> Novo Aluno
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Matrícula (auto)</label>
              <input type="text" value={form.mat || ''} readOnly className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-bg)] text-[var(--color-muted)] outline-none cursor-default" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Nome do Aluno</label>
              <input type="text" value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome completo" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px] sm:col-span-2 lg:col-span-3">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Endereço</label>
              <input type="text" value={form.end || ''} onChange={e => setForm({...form, end: e.target.value})} placeholder="Rua, número, bairro - Cidade/UF" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Contato</label>
              <input type="text" value={form.cont || ''} onChange={e => setForm({...form, cont: e.target.value})} placeholder="(00) 00000-0000" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Sexo</label>
              <select value={form.sexo || ''} onChange={e => setForm({...form, sexo: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
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
          <List size={18} className="text-[var(--color-accent)]" /> Alunos Cadastrados
        </div>
        
        <div className="overflow-x-auto">
          {alunos.length === 0 ? (
            <div className="text-center py-10 px-5 text-[var(--color-muted)]">
              <GraduationCap size={40} className="mx-auto mb-3 opacity-20 block" />
              <p className="text-[13.5px]">Nenhum aluno cadastrado ainda</p>
            </div>
          ) : (
             <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Matrícula</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Nome</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Contato</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Sexo</th>
                   <th className="text-right py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {alunos.map(a => (
                   <tr key={a.id} className="hover:bg-black/[0.012] group">
                     <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle font-bold">{a.mat}</td>
                     <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{a.nome}</td>
                     <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{a.cont}</td>
                     <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                        <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${a.sexo === 'Masculino' ? 'bg-[var(--color-info-light)] text-[var(--color-info)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'}`}>
                          {a.sexo}
                        </span>
                     </td>
                     <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle text-right">
                       <button onClick={() => handleEdit(a)} className="px-3 py-1.5 rounded-md text-[12px] bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all mr-1.5"><Edit2 size={14} /></button>
                       <button onClick={() => {setAlunoToDelete(a.id); setIsModalOpen(true);}} className="px-3 py-1.5 rounded-md text-[12px] bg-[var(--color-danger)] text-white hover:bg-[#9c2f24] transition-all"><Trash2 size={14} /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen}
        title="Excluir Aluno"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
