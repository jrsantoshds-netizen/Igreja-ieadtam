'use client';

import { useState, useEffect } from 'react';
import { HandCoins, List, Trash2, Save } from 'lucide-react';
import { dbGet, dbSet, generateId, Turma, Dizimo } from '@/lib/db';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function Dizimos() {
  const [dizimos, setDizimos] = useState<Dizimo[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [form, setForm] = useState<Partial<Dizimo>>({});
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dizimoToDelete, setDizimoToDelete] = useState('');

  const loadData = () => {
    setDizimos(dbGet<Dizimo>('dizimos'));
    setTurmas(dbGet<Turma>('turmas'));
    
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    setForm(prev => ({ ...prev, data: prev.data || today }));
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSave = () => {
    if (!form.turmaId) { toast('Selecione uma turma.', 'err'); return; }
    if (!form.valor || form.valor <= 0) { toast('Informe um valor válido.', 'err'); return; }
    if (!form.data) { toast('Selecione a data.', 'err'); return; }

    const turma = turmas.find(t => t.id === form.turmaId);
    
    const newDizimos = [...dizimos];
    newDizimos.push({
      id: generateId(),
      turmaId: form.turmaId,
      turmaNome: turma ? turma.nome : '?',
      turno: form.turno || '',
      valor: Number(form.valor),
      data: form.data,
    });
    
    dbSet('dizimos', newDizimos);
    setDizimos(newDizimos);
    toast('Contribuição registrada!');
    resetForm();
  };

  const confirmDelete = () => {
    const newDizimos = dizimos.filter(d => d.id !== dizimoToDelete);
    dbSet('dizimos', newDizimos);
    setDizimos(newDizimos);
    setIsModalOpen(false);
    toast('Registro excluído!', 'info');
  };

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
                   <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turno (auto)</label>
              <input type="text" value={form.turno || ''} readOnly className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-bg)] text-[var(--color-muted)] outline-none cursor-default" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Valor da Oferta (R$)</label>
              <input type="number" step="0.01" min="0.01" value={form.valor || ''} onChange={e => setForm({...form, valor: parseFloat(e.target.value) || 0})} placeholder="0.00" required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Data</label>
              <input type="date" value={form.data || ''} onChange={e => setForm({...form, data: e.target.value})} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
          
          <div className="mt-4 flex">
            <button type="submit" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:bg-[var(--color-primary-light)] transition-transform active:scale-[0.97]">
              <Save size={16} /> Salvar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <List size={18} className="text-[var(--color-accent)]" /> Contribuições Registradas
        </div>
        
        <div className="overflow-x-auto">
          {dizimos.length === 0 ? (
            <div className="text-center py-10 px-5 text-[var(--color-muted)]">
              <HandCoins size={40} className="mx-auto mb-3 opacity-20 block" />
              <p className="text-[13.5px]">Nenhuma contribuição registrada</p>
            </div>
          ) : (
             <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Turma</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Turno</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Valor</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Data</th>
                   <th className="text-right py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {dizimos.map(d => (
                     <tr key={d.id} className="hover:bg-black/[0.012] group">
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{d.turmaNome}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-primary-pale)] text-[var(--color-primary)]">
                            {d.turno}
                          </span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                         <strong className="text-[var(--color-success)]">
                            R$ {d.valor.toFixed(2).replace('.', ',')}
                         </strong>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{formatDataInfo(d.data)}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle text-right">
                         <button onClick={() => {setDizimoToDelete(d.id); setIsModalOpen(true);}} className="px-3 py-1.5 rounded-md text-[12px] bg-[var(--color-danger)] text-white hover:bg-[#9c2f24] transition-all"><Trash2 size={14} /></button>
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
        title="Excluir Registro"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
