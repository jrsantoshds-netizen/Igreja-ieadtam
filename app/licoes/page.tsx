'use client';

import { useState, useEffect } from 'react';
import { Book, List, Edit2, Trash2, BookOpen, Save, Eraser } from 'lucide-react';
import { dbSave, dbDelete, generateId, generateCodLicao, Licao } from '@/lib/db';
import { useCollection } from '@/lib/useCollection';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Licoes() {
  const { profile, user } = useAuth();
  const { data: licoes, loading } = useCollection<Licao>('licoes', profile?.congregacao);
  
  const [form, setForm] = useState<Partial<Licao>>({});
  const [editId, setEditId] = useState('');
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [licaoToDelete, setLicaoToDelete] = useState('');

  const resetForm = (len?: number) => {
    setEditId('');
    setForm({
      cod: generateCodLicao(len !== undefined ? len : licoes.length),
      nome: '',
      ini: '',
      fim: '',
    });
  };

  useEffect(() => {
    if (licoes.length >= 0 && !editId && !form.cod) {
      resetForm(licoes.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licoes.length]);

  const handleSave = async () => {
    if (!form.nome?.trim()) { toast('Preencha o nome da lição.', 'err'); return; }
    if (!form.ini || !form.fim) { toast('Preencha as datas.', 'err'); return; }
    if (new Date(form.fim) < new Date(form.ini)) { toast('Data final deve ser posterior ao início.', 'err'); return; }
    if (!profile?.congregacao || !user?.uid) return;

    try {
      if (editId) {
        const payload = { ...licoes.find(l => l.id === editId), ...form } as Licao;
        await dbSave('licoes', payload, profile.congregacao, user.uid);
        toast('Lição atualizada com sucesso!');
      } else {
        const payload = {
          id: generateId(),
          cod: form.cod!,
          nome: form.nome.trim(),
          ini: form.ini,
          fim: form.fim,
        };
        await dbSave('licoes', payload, profile.congregacao, user.uid);
        toast('Lição cadastrada com sucesso!');
      }
      resetForm();
    } catch (e) {
      toast('Erro ao salvar!', 'err');
    }
  };

  const handleEdit = (licao: Licao) => {
    setEditId(licao.id);
    setForm({ ...licao });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await dbDelete('licoes', licaoToDelete);
      setIsModalOpen(false);
      toast('Lição excluída!', 'info');
    } catch (e) {
      toast('Erro ao excluir', 'err');
    }
  };

  const statusLicao = (l: Licao) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ini = new Date(l.ini + 'T00:00:00');
    const fim = new Date(l.fim + 'T23:59:59');

    if (today < ini) return { text: 'Futura', class: 'bg-[var(--color-info-light)] text-[var(--color-info)]' };
    if (today > fim) return { text: 'Concluída', class: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' };
    return { text: 'Em andamento', class: 'bg-[var(--color-success-light)] text-[var(--color-success)]' };
  };

  const formatDataInfo = (d: string) => {
    if (!d) return '—';
    const split = d.split('-');
    return `${split[2]}/${split[1]}/${split[0]}`;
  };

  if (loading) return <div className="p-10 animate-pulse text-gray-500">Carregando...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Cadastro de Lições</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Gerencie as lições da Escola Bíblica</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <Book size={18} className="text-[var(--color-accent)]" /> Nova Lição
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Código (auto)</label>
              <input type="text" value={form.cod || ''} readOnly className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-bg)] text-[var(--color-muted)] outline-none cursor-default" />
            </div>
            <div className="flex flex-col gap-[5px] sm:col-span-2">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Nome da Lição</label>
              <input type="text" value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Tema da lição" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Data Início</label>
              <input type="date" value={form.ini || ''} onChange={e => setForm({...form, ini: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Data Final</label>
              <input type="date" value={form.fim || ''} onChange={e => setForm({...form, fim: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
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
          <List size={18} className="text-[var(--color-accent)]" /> Lições Cadastradas
        </div>
        
        <div className="overflow-x-auto">
          {licoes.length === 0 ? (
            <div className="text-center py-10 px-5 text-[var(--color-muted)]">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20 block" />
              <p className="text-[13.5px]">Nenhuma lição cadastrada ainda</p>
            </div>
          ) : (
             <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Código</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Nome</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Início</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Fim</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Status</th>
                   <th className="text-right py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {licoes.map(l => {
                    const status = statusLicao(l);
                    return (
                     <tr key={l.id} className="hover:bg-black/[0.012] group">
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle font-bold">{l.cod}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{l.nome}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{formatDataInfo(l.ini)}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{formatDataInfo(l.fim)}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${status.class}`}>
                            {status.text}
                          </span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle text-right">
                         <button onClick={() => handleEdit(l)} className="px-3 py-1.5 rounded-md text-[12px] bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all mr-1.5"><Edit2 size={14} /></button>
                         <button onClick={() => {setLicaoToDelete(l.id); setIsModalOpen(true);}} className="px-3 py-1.5 rounded-md text-[12px] bg-[var(--color-danger)] text-white hover:bg-[#9c2f24] transition-all"><Trash2 size={14} /></button>
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
        title="Excluir Lição"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
