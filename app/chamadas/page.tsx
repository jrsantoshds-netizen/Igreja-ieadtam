'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Check, X, PersonStanding, History, Save, Trash2, FileText, Book, BookOpen, Upload } from 'lucide-react';
import { dbGet, dbSet, generateId, Turma, Chamada, Aluno } from '@/lib/db';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

// Dynamically importing jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Chamadas() {
  const [chamadas, setChamadas] = useState<Chamada[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  
  const [turmaId, setTurmaId] = useState('');
  const [dataChamada, setDataChamada] = useState('');
  
  const [qtdBiblia, setQtdBiblia] = useState(0);
  const [qtdRevista, setQtdRevista] = useState(0);
  const [qtdVisitante, setQtdVisitante] = useState(0);
  
  const [chEstado, setChEstado] = useState<Record<string, 'presente' | 'ausente' | 'visitante' | ''>>({});
  
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chamadaToDelete, setChamadaToDelete] = useState('');

  const loadData = () => {
    setChamadas(dbGet<Chamada>('chamadas'));
    setTurmas(dbGet<Turma>('turmas'));
    setAlunos(dbGet<Aluno>('alunos'));
    setDataChamada(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTurmaChange = (selectedTurmaId: string) => {
    setTurmaId(selectedTurmaId);
    if (!selectedTurmaId) {
      setChEstado({});
      return;
    }

    const turma = turmas.find(t => t.id === selectedTurmaId);
    if (!turma || !turma.alunos.length) {
      setChEstado({});
      toast('Esta turma não tem alunos.', 'info');
      return;
    }

    const newState: Record<string, ''> = {};
    for (const aid of turma.alunos) {
      const aluno = alunos.find(a => a.id === aid);
      if (aluno) {
        newState[aid] = '';
      }
    }
    setChEstado(newState);
  };

  const handleSave = () => {
    if (!turmaId) { toast('Selecione uma turma.', 'err'); return; }
    if (!dataChamada) { toast('Selecione a data.', 'err'); return; }

    const turma = turmas.find(t => t.id === turmaId);
    
    const registros: Chamada['registros'] = [];
    
    for (const aid in chEstado) {
      const status = chEstado[aid];
      if (!status) { toast('Marque todos os alunos antes de salvar.', 'err'); return; }
      const aluno = alunos.find(a => a.id === aid);
      registros.push({
        alunoId: aid,
        alunoNome: aluno ? aluno.nome : '?',
        status
      });
    }

    const newChamadas = [...chamadas];
    newChamadas.push({
      id: generateId(),
      turmaId,
      turmaNome: turma ? turma.nome : '?',
      data: dataChamada,
      registros,
      qtdBiblia,
      qtdRevista,
      qtdVisitante
    });

    dbSet('chamadas', newChamadas);
    setChamadas(newChamadas);
    toast('Chamada salva!');
    
    setTurmaId('');
    setDataChamada(new Date().toISOString().split('T')[0]);
    setQtdBiblia(0);
    setQtdRevista(0);
    setQtdVisitante(0);
    setChEstado({});
  };

  const confirmDelete = () => {
    const newChamadas = chamadas.filter(c => c.id !== chamadaToDelete);
    dbSet('chamadas', newChamadas);
    setChamadas(newChamadas);
    setIsModalOpen(false);
    toast('Chamada excluída!', 'info');
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const gerarPDF = async (chamadaId: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    toast('Gerando e baixando PDF...', 'info');
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const chamada = chamadas.find(c => c.id === chamadaId);
      if (!chamada) { toast('Chamada não encontrada.', 'err'); return; }

      const turma = turmas.find(t => t.id === chamada.turmaId);
      let licao = null;
      if (turma) {
        const licoes = dbGet<any>('licoes');
        licao = licoes.find((l: any) => l.id === turma.licaoId);
      }

      const presentes: any[] = [];
      const visitantes: any[] = [];
      const ausentes: any[] = [];

      chamada.registros.forEach(reg => {
        if (reg.status === 'presente') presentes.push(reg);
        else if (reg.status === 'visitante') visitantes.push(reg);
        else ausentes.push(reg);
      });

      const dizimos = dbGet<any>('dizimos');
      const dizFiltrados = dizimos.filter((d: any) => d.turmaId === chamada.turmaId && d.data === chamada.data);
      const valorDizimo = dizFiltrados.reduce((acc: number, cur: any) => acc + cur.valor, 0);

      const margin = 15;
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      // Fetch logo as base64
      let logoBase64 = null;
      try {
        const savedLogo = localStorage.getItem('app_logo');
        if (savedLogo) {
          logoBase64 = savedLogo;
        } else {
          const logoUrl = 'https://z-cdn-media.chatglm.cn/files/03a5ef41-f7b6-4ed2-a240-4d9c1dc4793b.png?auth_key=1876650640-c3016c3123344dec99c7e0febd679e91-0-d7db01960d2dc11a359a1b2e2f825106';
          const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(logoUrl)}`);
          if (res.ok) {
            const json = await res.json();
            logoBase64 = json.dataUrl;
          }
        }
      } catch (err) {
        console.error('Failed to load logo for PDF', err);
      }

      // CABEÇALHO
      // Cabeçalho verde
      doc.setFillColor(20, 53, 42); // primary green
      doc.rect(0, 0, pw, 70, 'F');
      
      const centerX = pw / 2;

      if (logoBase64) {
        // Encaixa a arte como se fosse um carimbo/emblema sem bordas manuais
        // já que a imagem nova tem as próprias bordas e fundos integrados.
        doc.addImage(logoBase64, 'PNG', centerX - 20, 5, 40, 40);
      } else {
        doc.setFillColor(166, 126, 61);
        doc.circle(centerX, 28, 18, 'F');
        doc.setFontSize(14); 
        doc.setTextColor(255, 255, 255); 
        doc.text('IEADTAM', centerX, 30, { align: 'center' });
      }

      // IEADTAM centralizado abaixo
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(255, 255, 255);
      doc.text('IEADTAM', centerX, 58, { align: 'center' });

      // Dados Extras à Esquerda Escopo
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(200, 180, 140);
      doc.text('Igreja Evang. Assembleia de Deus', margin, 53, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      doc.text('Presença Eterna do Espirito Santo', margin, 58, { align: 'left' });

      // Dados Extras à Direita Escopo (Relatório)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(200, 134, 42);
      doc.text('RELATÓRIO EBD', pw - margin, 53, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 180, 180);
      doc.text('Escola Bíblica Dominical', pw - margin, 58, { align: 'right' });

      // Linha Dourada de Fechamento do Cabeçalho
      doc.setDrawColor(200, 134, 42); // accent gold line
      doc.setLineWidth(0.8);
      doc.line(margin, 65, pw - margin, 65);

      let y = 78;

      // INFO DA CHAMADA
      doc.setFillColor(244, 239, 230); 
      doc.roundedRect(margin, y, pw - margin * 2, 30, 3, 3, 'F');
      doc.setDrawColor(226, 218, 206); 
      doc.setLineWidth(0.3); 
      doc.roundedRect(margin, y, pw - margin * 2, 30, 3, 3, 'S');

      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(140, 130, 120);
      doc.text('DATA:', margin + 6, y + 9);
      doc.text('TURMA:', margin + 6, y + 17);
      doc.text('TURNO:', margin + 6, y + 25);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(42, 37, 32);
      
      const formatData = (d: string) => d.split('-').reverse().join('/');

      doc.text(formatData(chamada.data), margin + 30, y + 9);
      doc.text(chamada.turmaNome, margin + 30, y + 17);
      doc.text(turma ? turma.turno : '—', margin + 30, y + 25);
      
      if (turma) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(140, 130, 120);
        doc.text('PROFESSOR:', pw / 2 + 5, y + 9);
        doc.text('LIÇÃO:', pw / 2 + 5, y + 17);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(42, 37, 32);
        doc.text(turma.prof, pw / 2 + 35, y + 9);
        doc.text(licao ? `${licao.cod} - ${licao.nome}` : '—', pw / 2 + 35, y + 17);
      }

      y += 42; // Move Y below the Call Info box

      // TABELA PRESENTES
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(20, 53, 42);
      doc.text('Alunos Presentes', margin, y);
      doc.setDrawColor(200, 134, 42); doc.setLineWidth(0.6); doc.line(margin, y + 1, margin + 45, y + 1);
      y += 6;

      if (presentes.length === 0) {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(140, 130, 120);
        doc.text('Nenhum aluno presente.', margin + 4, y + 6); 
        y += 14;
      } else {
        const bodyP = presentes.map((p, i) => {
          const al = alunos.find(a => a.id === p.alunoId);
          return [i + 1, p.alunoNome, al ? al.mat : '—'];
        });

        autoTable(doc, {
          startY: y, theme: 'plain', margin: { left: margin, right: margin },
          head: [['#', 'Nome do Aluno', 'Matrícula']],
          body: bodyP,
          headStyles: { fillColor: [20, 53, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
          bodyStyles: { fontSize: 9.5, cellPadding: 3, textColor: [42, 37, 32] },
          alternateRowStyles: { fillColor: [248, 245, 240] },
          columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 2: { halign: 'center', cellWidth: 25 } }
        });
        y = (doc as any).lastAutoTable.finalY + 4;
      }

      // TABELA VISITANTES
      if (visitantes.length > 0) {
        if (y > ph - 60) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(20, 53, 42);
        doc.text('Visitantes', margin, y);
        doc.setDrawColor(200, 134, 42); doc.setLineWidth(0.6); doc.line(margin, y + 1, margin + 30, y + 1); 
        y += 6;

        const bodyV = visitantes.map((v, i) => [i + 1, v.alunoNome]);
        autoTable(doc, {
          startY: y, theme: 'plain', margin: { left: margin, right: margin },
          head: [['#', 'Nome do Visitante']], body: bodyV,
          headStyles: { fillColor: [29, 111, 165], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
          bodyStyles: { fontSize: 9.5, cellPadding: 3, textColor: [42, 37, 32] },
          alternateRowStyles: { fillColor: [248, 245, 240] },
          columnStyles: { 0: { halign: 'center', cellWidth: 12 } }
        });
        y = (doc as any).lastAutoTable.finalY + 4;
      }

      // TABELA AUSENTES
      if (ausentes.length > 0) {
        if (y > ph - 60) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(20, 53, 42);
        doc.text('Alunos Ausentes', margin, y);
        doc.setDrawColor(200, 134, 42); doc.setLineWidth(0.6); doc.line(margin, y + 1, margin + 38, y + 1); 
        y += 6;

        const bodyA = ausentes.map((a, i) => {
          const al = alunos.find(alx => alx.id === a.alunoId);
          return [i + 1, a.alunoNome, al ? al.mat : '—'];
        });

        autoTable(doc, {
          startY: y, theme: 'plain', margin: { left: margin, right: margin },
          head: [['#', 'Nome do Aluno', 'Matrícula']], body: bodyA,
          headStyles: { fillColor: [184, 58, 46], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
          bodyStyles: { fontSize: 9.5, cellPadding: 3, textColor: [42, 37, 32] },
          alternateRowStyles: { fillColor: [248, 245, 240] },
          columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 2: { halign: 'center', cellWidth: 25 } }
        });
        y = (doc as any).lastAutoTable.finalY + 4;
      }

      // PAINEL RESUMO
      if (y > ph - 55) { doc.addPage(); y = 20; }
      doc.setFillColor(20, 53, 42); doc.roundedRect(margin, y, pw - margin * 2, 42, 3, 3, 'F');
      const cols = 4; const colW = (pw - margin * 2) / cols;
      const resumoItens = [
        { label: 'Total Presentes', valor: String(presentes.length), cor: [144, 238, 144] },
        { label: 'Total Visitantes', valor: String(chamada.qtdVisitante || visitantes.length), cor: [135, 206, 250] },
        { label: 'Quant. Bíblias', valor: String(chamada.qtdBiblia || 0), cor: [255, 218, 130] },
        { label: 'Quant. Revistas', valor: String(chamada.qtdRevista || 0), cor: [255, 182, 182] }
      ];

      for (let ri = 0; ri < resumoItens.length; ri++) {
        const cx = margin + colW * ri + colW / 2;
        if (ri > 0) { 
          doc.setDrawColor(255, 255, 255); 
          doc.setLineWidth(0.2); 
          doc.line(margin + colW * ri, y + 6, margin + colW * ri, y + 36); 
        }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 180, 180);
        doc.text(resumoItens[ri].label, cx, y + 14, { align: 'center' });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(20); 
        const rgb = resumoItens[ri].cor;
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
        doc.text(resumoItens[ri].valor, cx, y + 32, { align: 'center' });
      }
      y += 48;

      // CAIXA DIZIMOS
      doc.setFillColor(200, 134, 42); doc.roundedRect(margin, y, pw - margin * 2, 28, 3, 3, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text('VALOR DO DÍZIMO / OFERTA', margin + 8, y + 12);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
      doc.text('R$ ' + valorDizimo.toFixed(2).replace('.', ','), margin + 8, y + 23);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(dizFiltrados.length > 0 ? dizFiltrados.length + ' registro(s) nesta data' : 'Nenhum registro nesta data', pw - margin - 8, y + 18, { align: 'right' });
      y += 38;

      // RODAPÉ
      doc.setDrawColor(200, 134, 42); doc.setLineWidth(0.5); doc.line(margin, y, pw - margin, y); y += 5;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(140, 130, 120);
      doc.text('"Deus é Bom Todos os Tempos, Todo Tempo Deus é Bom"', pw / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.text('IEADTAM - Presença Eterna do Espírito Santo | Sistema EBD v1.0', pw / 2, y, { align: 'center' });

      doc.save(`Relatorio_EBD_${chamada.turmaNome}_${chamada.data}.pdf`);
      toast('Relatório PDF gerado com sucesso!', 'ok');

    } catch (e) {
      console.error(e);
      toast('Erro ao gerar o PDF', 'err');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormatData = (d: string) => {
    if (!d) return '—';
    const split = d.split('-');
    return `${split[2]}/${split[1]}/${split[0]}`;
  };

  const currentTurma = turmas.find(t => t.id === turmaId);
  const showList = currentTurma && currentTurma.alunos.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <h2 className="font-serif text-[28px] font-black text-[var(--color-primary)] mb-1">Chamada</h2>
      <p className="text-[var(--color-muted)] text-[14px] mb-[26px]">Registre presença, ausência e visitantes</p>
      
      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] mb-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center gap-[9px]">
          <ClipboardCheck size={18} className="text-[var(--color-accent)]" /> Nova Chamada
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Turma</label>
            <select value={turmaId} onChange={e => handleTurmaChange(e.target.value)} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors">
              <option value="">Selecione uma turma...</option>
              {turmas.map(t => (
                 <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)]">Data</label>
            <input type="date" value={dataChamada} onChange={e => setDataChamada(e.target.value)} required className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
          </div>
        </div>

        {showList && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-[var(--color-primary-pale)] rounded-lg border border-dashed border-[var(--color-border)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-primary)] flex items-center gap-1"><PersonStanding size={14} /> Quant. de Visitantes</label>
              <input type="number" min="0" value={qtdVisitante} onChange={e => setQtdVisitante(parseInt(e.target.value) || 0)} className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-primary)] flex items-center gap-1"><Book size={14} /> Quant. de Bíblias</label>
              <input type="number" min="0" value={qtdBiblia} onChange={e => setQtdBiblia(parseInt(e.target.value) || 0)} className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-primary)] flex items-center gap-1"><BookOpen size={14} /> Quant. de Revistas</label>
              <input type="number" min="0" value={qtdRevista} onChange={e => setQtdRevista(parseInt(e.target.value) || 0)} className="px-[13px] py-[10px] border-2 border-[var(--color-border)] rounded-lg text-[14px] bg-[var(--color-card)] outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        )}

        {showList && (
          <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="font-semibold text-[13.5px]">Marque a situação de cada aluno:</span>
              <div className="flex gap-1.5">
                <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-success-light)] text-[var(--color-success)]">Presente</span>
                <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-danger-light)] text-[var(--color-danger)]">Ausente</span>
                <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-info-light)] text-[var(--color-info)]">Visitante</span>
              </div>
            </div>
            
            <div className="border-2 border-[var(--color-border)] rounded-lg overflow-hidden">
               {currentTurma.alunos.map(aid => {
                 const aluno = alunos.find(a => a.id === aid);
                 if (!aluno) return null;
                 const status = chEstado[aid];

                 return (
                   <div key={aid} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-black/[0.015] transition-colors gap-3">
                     <div>
                       <strong>{aluno.nome}</strong>
                       <span className="text-[var(--color-muted)] text-[11px] ml-2 block sm:inline">{aluno.mat}</span>
                     </div>
                     <div className="flex gap-1.5 flex-wrap">
                       <button 
                         type="button" 
                         onClick={() => setChEstado({ ...chEstado, [aid]: 'presente' })}
                         className={`px-[11px] py-[5px] border-2 rounded-md text-[11.5px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                           status === 'presente' ? 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)] scale-[1.04]' : 'border-transparent text-[var(--color-success)] bg-[var(--color-success-light)] opacity-40 hover:opacity-70'
                         }`}
                       >
                         <Check size={12} /> Presente
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setChEstado({ ...chEstado, [aid]: 'ausente' })}
                         className={`px-[11px] py-[5px] border-2 rounded-md text-[11.5px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                           status === 'ausente' ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)] scale-[1.04]' : 'border-transparent text-[var(--color-danger)] bg-[var(--color-danger-light)] opacity-40 hover:opacity-70'
                         }`}
                       >
                         <X size={12} /> Ausente
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setChEstado({ ...chEstado, [aid]: 'visitante' })}
                         className={`px-[11px] py-[5px] border-2 rounded-md text-[11.5px] font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                           status === 'visitante' ? 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info)] scale-[1.04]' : 'border-transparent text-[var(--color-info)] bg-[var(--color-info-light)] opacity-40 hover:opacity-70'
                         }`}
                       >
                         <PersonStanding size={12} /> Visitante
                       </button>
                     </div>
                   </div>
                 )
               })}
            </div>
            
            <div className="mt-4">
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-[13.5px] font-semibold flex items-center gap-[7px] hover:bg-[var(--color-primary-light)] transition-transform active:scale-[0.97]"
              >
                <Save size={16} /> Salvar Chamada
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--color-card)] rounded-[10px] p-[22px] shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[var(--color-border)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
        <div className="font-serif text-[17px] font-bold text-[var(--color-primary)] mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-[9px]">
            <History size={18} className="text-[var(--color-accent)]" /> Histórico de Chamadas
          </div>
          <label className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-2" title="Definir a logo que aparecerá nos próximos PDFs">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const img = new window.Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    const MAX = 500;
                    if (width > height) { if (width > MAX) { height *= MAX/width; width = MAX; } }
                    else { if (height > MAX) { width *= MAX/height; height = MAX; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    try {
                      localStorage.setItem('app_logo', canvas.toDataURL('image/png'));
                      toast("Logo do PDF alterada com sucesso!", "ok");
                      setTimeout(() => window.location.reload(), 800);
                    } catch (err) { alert("Imagem muito pesada."); }
                  };
                  img.src = reader.result as string;
                }
                reader.readAsDataURL(file);
              }
            }} />
            <span className="flex items-center gap-2"><Upload size={14}/> Alterar Logo do PDF Localmente</span>
          </label>
        </div>
        
        <div className="overflow-x-auto">
          {chamadas.length === 0 ? (
            <div className="text-center py-10 px-5 text-[var(--color-muted)]">
              <ClipboardCheck size={40} className="mx-auto mb-3 opacity-20 block" />
              <p className="text-[13.5px]">Nenhuma chamada registrada</p>
            </div>
          ) : (
             <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Data</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Turma</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Presentes</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ausentes</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Visitantes</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Bíblias</th>
                   <th className="text-left py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Revistas</th>
                   <th className="text-right py-2.5 px-[13px] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-muted)] border-b-2 border-[var(--color-border)] bg-[var(--color-bg)]">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {chamadas.map(c => {
                    let p=0, a=0, v=0;
                    c.registros.forEach(r => {
                      if (r.status === 'presente') p++;
                      if (r.status === 'ausente') a++;
                      if (r.status === 'visitante') v++;
                    });
                    
                    return (
                     <tr key={c.id} className="hover:bg-black/[0.012] group">
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{getFormatData(c.data)}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle font-bold">{c.turmaNome}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-success-light)] text-[var(--color-success)]">{p}</span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-danger-light)] text-[var(--color-danger)]">{a}</span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">
                          <span className="inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[var(--color-info-light)] text-[var(--color-info)]">{c.qtdVisitante || v}</span>
                       </td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{c.qtdBiblia || 0}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle">{c.qtdRevista || 0}</td>
                       <td className="py-2.5 px-[13px] text-[13.5px] border-b border-[var(--color-border)] align-middle text-right">
                         <button onClick={() => gerarPDF(c.id)} title="Gerar PDF" className="px-3 py-1.5 rounded-md text-[12px] bg-[#8b1a1a] text-white hover:bg-[#a62222] transition-all mr-1.5"><FileText size={14} /></button>
                         <button onClick={() => {setChamadaToDelete(c.id); setIsModalOpen(true);}} className="px-3 py-1.5 rounded-md text-[12px] bg-[var(--color-danger)] text-white hover:bg-[#9c2f24] transition-all"><Trash2 size={14} /></button>
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
        title="Excluir Chamada"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
