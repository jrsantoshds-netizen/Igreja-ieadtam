'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, PersonStanding, Info } from 'lucide-react';
import { dbGet, Aluno, Turma, Licao, Dizimo, Chamada } from '@/lib/db';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    presentes: 0,
    ausentes: 0,
    visitantes: 0,
    totalTurmas: 0,
    licoesAtivas: 0,
    totalOfertas: 0,
    totalChamadas: 0,
  });

  useEffect(() => {
    const alunos = dbGet<Aluno>('alunos');
    const turmas = dbGet<Turma>('turmas');
    const licoes = dbGet<Licao>('licoes');
    const dizimos = dbGet<Dizimo>('dizimos');
    const chamadas = dbGet<Chamada>('chamadas');

    let presentes = 0;
    let ausentes = 0;
    let visitantes = 0;

    if (chamadas.length > 0) {
      const ult = chamadas[chamadas.length - 1];
      for (const reg of ult.registros) {
        if (reg.status === 'presente') presentes++;
        else if (reg.status === 'ausente') ausentes++;
        else if (reg.status === 'visitante') visitantes++;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let licoesAtivas = 0;
    for (const l of licoes) {
      if (new Date(l.ini + 'T00:00:00') <= today && new Date(l.fim + 'T23:59:59') >= today) {
        licoesAtivas++;
      }
    }

    let totalOfertas = 0;
    for (const d of dizimos) {
      totalOfertas += d.valor;
    }

    // eslint-disable-next-line
    setStats({
      totalAlunos: alunos.length,
      presentes,
      ausentes,
      visitantes,
      totalTurmas: turmas.length,
      licoesAtivas,
      totalOfertas,
      totalChamadas: chamadas.length,
    });
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Painel de Controle</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Visão geral da Escola Bíblica Dominical</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-card)] rounded-[10px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[var(--color-accent)]">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] mb-3 bg-[var(--color-accent-light)] text-[var(--color-accent)] animate-[float_3.2s_ease-in-out_infinite]">
            <Users size={20} />
          </div>
          <div className="font-serif text-[32px] font-black leading-none text-[var(--color-fg)]">{stats.totalAlunos}</div>
          <div className="text-[12.5px] text-[var(--color-muted)] mt-1">Total de Alunos</div>
        </div>
        
        <div className="bg-[var(--color-card)] rounded-[10px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[var(--color-success)]">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] mb-3 bg-[var(--color-success-light)] text-[var(--color-success)] animate-[float_3.2s_ease-in-out_infinite] [animation-delay:0.4s]">
            <CheckCircle size={20} />
          </div>
          <div className="font-serif text-[32px] font-black leading-none text-[var(--color-fg)]">{stats.presentes}</div>
          <div className="text-[12.5px] text-[var(--color-muted)] mt-1">Alunos Presentes</div>
        </div>

        <div className="bg-[var(--color-card)] rounded-[10px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[var(--color-danger)]">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] mb-3 bg-[var(--color-danger-light)] text-[var(--color-danger)] animate-[float_3.2s_ease-in-out_infinite] [animation-delay:0.8s]">
            <XCircle size={20} />
          </div>
          <div className="font-serif text-[32px] font-black leading-none text-[var(--color-fg)]">{stats.ausentes}</div>
          <div className="text-[12.5px] text-[var(--color-muted)] mt-1">Alunos Ausentes</div>
        </div>

        <div className="bg-[var(--color-card)] rounded-[10px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[var(--color-info)]">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] mb-3 bg-[var(--color-info-light)] text-[var(--color-info)] animate-[float_3.2s_ease-in-out_infinite] [animation-delay:1.2s]">
            <PersonStanding size={20} />
          </div>
          <div className="font-serif text-[32px] font-black leading-none text-[var(--color-fg)]">{stats.visitantes}</div>
          <div className="text-[12.5px] text-[var(--color-muted)] mt-1">Visitantes</div>
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <h3 className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
          <Info size={18} className="text-[var(--color-accent)]" /> Resumo Geral
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[13px]">
          <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-primary-pale)]">
            <div className="text-[11.5px] text-[var(--color-muted)] mb-1">Turmas Cadastradas</div>
            <div className="text-[21px] font-bold text-[var(--color-primary)]">{stats.totalTurmas}</div>
          </div>
          <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-accent-light)]">
            <div className="text-[11.5px] text-[var(--color-muted)] mb-1">Lições Ativas</div>
            <div className="text-[21px] font-bold text-[var(--color-accent)]">{stats.licoesAtivas}</div>
          </div>
          <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-success-light)]">
            <div className="text-[11.5px] text-[var(--color-muted)] mb-1">Total em Ofertas</div>
            <div className="text-[21px] font-bold text-[var(--color-success)]">
              R$ {stats.totalOfertas.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-info-light)]">
            <div className="text-[11.5px] text-[var(--color-muted)] mb-1">Chamadas Realizadas</div>
            <div className="text-[21px] font-bold text-[var(--color-info)]">{stats.totalChamadas}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
