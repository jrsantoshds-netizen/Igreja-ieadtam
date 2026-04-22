'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, PersonStanding, Info, BarChart3 } from 'lucide-react';
import { Aluno, Turma, Licao, Dizimo, Chamada } from '@/lib/db';
import { useCollection } from '@/lib/useCollection';
import { useAuth } from '@/components/AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { profile } = useAuth();
  
  const { data: alunos, loading: aLoad } = useCollection<Aluno>('alunos', profile?.congregacao);
  const { data: turmas, loading: tLoad } = useCollection<Turma>('turmas', profile?.congregacao);
  const { data: licoes, loading: lLoad } = useCollection<Licao>('licoes', profile?.congregacao);
  const { data: dizimos, loading: dLoad } = useCollection<Dizimo>('dizimos', profile?.congregacao);
  const { data: chamadas, loading: cLoad } = useCollection<Chamada>('chamadas', profile?.congregacao);

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
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (aLoad || tLoad || lLoad || dLoad || cLoad) return;

    let presentes = 0;
    let ausentes = 0;
    let visitantes = 0;

    if (chamadas.length > 0) {
      const sortedChamadas = [...chamadas].sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      const ult = sortedChamadas[sortedChamadas.length - 1];
      for (const reg of ult.registros) {
        if (reg.status === 'presente') presentes++;
        else if (reg.status === 'ausente') ausentes++;
        else if (reg.status === 'visitante') visitantes++;
      }
      if (ult.qtdVisitante) visitantes += ult.qtdVisitante;
    }

    const recentDict: Record<string, {name: string, Presentes: number, Ausentes: number, Visitantes: number}> = {};
    chamadas.forEach(c => {
      let p=0, a=0, v=0;
      c.registros.forEach(r => {
        if (r.status === 'presente') p++;
        else if (r.status === 'ausente') a++;
        else if (r.status === 'visitante') v++;
      });
      if (c.qtdVisitante) v += c.qtdVisitante;
      
      const dateKey = c.data;
      if (!recentDict[dateKey]) {
        recentDict[dateKey] = {
           name: dateKey.split('-').reverse().slice(0, 2).join('/'),
           Presentes: 0, Ausentes: 0, Visitantes: 0
        };
      }
      recentDict[dateKey].Presentes += p;
      recentDict[dateKey].Ausentes += a;
      recentDict[dateKey].Visitantes += v;
    });
    
    // Sort and get last 10 dates
    const sortedKeys = Object.keys(recentDict).sort();
    const finalChartData = sortedKeys.slice(-10).map(k => recentDict[k]);
    setChartData(finalChartData);

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
  }, [alunos, turmas, licoes, dizimos, chamadas, aLoad, tLoad, lLoad, dLoad, cLoad]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
          <h3 className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--color-accent)]" /> Desempenho de Frequência (Anterior)
          </h3>
          <div className="w-full h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip wrapperStyle={{ borderRadius: '8px', overflow: 'hidden' }} cursor={{ fill: '#f5f5f5' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="Presentes" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Visitantes" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Ausentes" fill="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-[14px]">
                Nenhuma chamada registrada ainda.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
          <h3 className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
            <Info size={18} className="text-[var(--color-accent)]" /> Resumo Geral
          </h3>
          <div className="grid grid-cols-1 gap-[13px]">
            <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-primary-pale)] flex justify-between items-center">
              <div className="text-[12.5px] text-[var(--color-muted)]">Turmas Cadastradas</div>
              <div className="text-[21px] font-bold text-[var(--color-primary)]">{stats.totalTurmas}</div>
            </div>
            <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-accent-light)] flex justify-between items-center">
              <div className="text-[12.5px] text-[var(--color-muted)]">Lições Ativas</div>
              <div className="text-[21px] font-bold text-[var(--color-accent)]">{stats.licoesAtivas}</div>
            </div>
            <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-success-light)] flex justify-between items-center">
              <div className="text-[12.5px] text-[var(--color-muted)]">Total em Ofertas</div>
              <div className="text-[21px] font-bold text-[var(--color-success)]">
                R$ {stats.totalOfertas.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div className="p-[15px] rounded-lg transition-transform hover:-translate-y-[2px] bg-[var(--color-info-light)] flex justify-between items-center">
              <div className="text-[12.5px] text-[var(--color-muted)]">Chamadas Realizadas</div>
              <div className="text-[21px] font-bold text-[var(--color-info)]">{stats.totalChamadas}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
