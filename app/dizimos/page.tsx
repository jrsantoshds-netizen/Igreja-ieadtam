'use client';

import { useState, useEffect } from 'react';
import { HandCoins, List, Trash2, Save } from 'lucide-react';
import { dbSave, dbDelete, generateId, Turma, Dizimo } from '@/lib/db';
import { useCollection } from '@/lib/useCollection';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Dizimos() {
  const { profile, user } = useAuth();
  
  const { data: dizimos, loading: dLoading } = useCollection<Dizimo>('dizimos', profile?.congregacao);
  const { data: turmas, loading: tLoading } = useCollection<Turma>('turmas', profile?.congregacao);
  const [form, setForm] = useState<Partial<Dizimo>>({});
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dizimoToDelete, setDizimoToDelete] = useState('');

  useEffect(() => {
    // Set default date
    if (!form.data) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, data: today }));
    }
  }, [form.data]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setForm({ turmaId: '', turno: '', valor: undefined, data: today });
  };

  const formatDataInfo = (d: string) => {
    if (!d) return '—';
    const split = d.split('-');
    return `${split[2]}/${split[1]}/${split[0]}`;
  };

  const handleTurmaChange = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    setForm({
      ...form, 
      turmaId, 
      turno: turma ? turma.turno : ''
    });
  };

  const handleSave = async () => {
    if (!form.turmaId) { toast('Selecione uma turma.', 'err'); return; }
    if (!form.valor || form.valor <= 0) { toast('Informe um valor válido.', 'err'); return; }
    if (!form.data) { toast('Selecione a data.', 'err'); return; }
    if (!profile?.congregacao || !user?.uid) return;

    const turma = turmas.find(t => t.id === form.turmaId);
    
    try {
      const payload = {
        id: generateId(),
        turmaId: form.turmaId,
        turmaNome: turma ? turma.nome : '?',
        turno: form.turno || '',
        valor: Number(form.valor),
        data: form.data,
      };
      
      await dbSave('dizimos', payload, profile.congregacao, user.uid);
      toast('Contribuição registrada!');
      resetForm();
    } catch(e) {
      toast('Erro ao registrar', 'err');
    }
  };

  const confirmDelete = async () => {
    try {
      await dbDelete('dizimos', dizimoToDelete);
      setIsModalOpen(false);
      toast('Registro excluído!', 'info');
    } catch(e) {
      toast('Erro ao excluir', 'err');
    }
  };

  if (dLoading || tLoading) return <div className="p-10 animate-pulse text-gray-500">Carregando...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Dízimos e Ofertas</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Registre contribuições por turma e turno</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <HandCoins size={18} className="text-[var(--color-accent)]" /> Nova Contribuição
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turma</label>
              <select value={form.turmaId || ''} onChange={e => handleTurmaChange(e.target.value)} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
                <option value="">Selecione uma turma...</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turno (Auto)</label>
              <input type="text" value={form.turno || ''} readOnly className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-bg)] text-[var(--color-muted)] outline-none cursor-default" />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Data da Contribuição</label>
              <input type="date" value={form.data || ''} onChange={e => setForm({...form, data: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Valor</label>
              <div className="relative">
                <span className="absolute left-[13px] top-[11px] text-[14px] font-medium text-[var(--color-muted)]">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={form.valor || ''} 
                  onChange={e => setForm({...form, valor: parseFloat(e.target.value)})} 
                  placeholder="0,00" 
                  required 
                  className="w-full pl-[36px] pr-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <button type="submit" className="px-5 py-2.5 bg-[var(--color-success)] text-white rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:bg-[#349e59] transition-transform active:scale-[0.97]">
              <Save size={16} /> Registrar Entrada
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px] pb-3 border-b border-[var(--color-border)]">
          <List size={18} className="text-[var(--color-accent)]" /> Histórico de Contribuições
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Data</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Turma</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)]">Turno</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)] text-right">Valor</th>
                <th className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold text-[var(--color-muted)] border-b border-[var(--color-border)] text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {dizimos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[13px] text-[var(--color-muted)]">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                dizimos.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(dizimo => (
                  <tr key={dizimo.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors">
                    <td className="py-3.5 px-4 text-[13px] font-medium text-[var(--color-fg)]">{formatDataInfo(dizimo.data)}</td>
                    <td className="py-3.5 px-4 text-[13.5px] font-medium text-[var(--color-primary)]">{dizimo.turmaNome}</td>
                    <td className="py-3.5 px-4 text-[13px] text-[var(--color-muted)]">{dizimo.turno}</td>
                    <td className="py-3.5 px-4 text-[13px] font-bold text-[var(--color-success)] text-right">
                      R$ {dizimo.valor.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => { setDizimoToDelete(dizimo.id); setIsModalOpen(true); }} className="p-2 inline-flex text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] rounded-md transition-colors" title="Excluir">
                        <Trash2 size={15} />
                      </button>
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
        title="Excluir Registro"
        message="Tem certeza que deseja excluir esta contribuição do sistema financeiro?"
      />
    </div>
  );
}
