'use client'
import { ALL_DIMS, DIMS, avg, type Assessment } from '@/lib/dims'

export default function ExportPanel({ assessment }: { assessment: Assessment }) {
  const pAvg = avg(DIMS.products.map(d => d.id), assessment.scores)
  const prAvg = avg(DIMS.production.map(d => d.id), assessment.scores)
  const totAvg = avg(ALL_DIMS.map(d => d.id), assessment.scores)
  const filled = ALL_DIMS.filter(d => (assessment.scores[d.id] || 0) > 0).length
  const date = assessment.eval_date ? new Date(assessment.eval_date + 'T12:00').toLocaleDateString('pt-BR') : '—'

  async function exportExcel() {
    const XLSX = (await import('xlsx')).default
    const wb = XLSX.utils.book_new()
    const rows = [
      ['Avaliação Indústria 4.0'],
      ['Empresa:', assessment.company || '—', 'Setor:', assessment.sector || '—', 'Data:', date],
      [],
      ['Dimensão', 'Frente', 'Estágio Atual', 'Meta', 'Gap', 'Descrição', 'Observações'],
      ...ALL_DIMS.map(d => [
        d.label,
        d.type === 'products' ? 'Produtos' : 'Produção',
        assessment.scores[d.id] || '—',
        assessment.goals[d.id] || '—',
        (assessment.scores[d.id] && assessment.goals[d.id]) ? assessment.goals[d.id] - assessment.scores[d.id] : '—',
        assessment.scores[d.id] ? d.descs[(assessment.scores[d.id] || 1) - 1] : 'Não avaliado',
        assessment.notes[d.id] || '',
      ]),
      [],
      ['RESUMO'],
      ['Frente', 'Score Atual', 'Score Meta'],
      ['Produtos', pAvg ? pAvg + '/5' : '—', avg(DIMS.products.map(d => d.id), assessment.goals) ? avg(DIMS.products.map(d => d.id), assessment.goals) + '/5' : '—'],
      ['Produção', prAvg ? prAvg + '/5' : '—', avg(DIMS.production.map(d => d.id), assessment.goals) ? avg(DIMS.production.map(d => d.id), assessment.goals) + '/5' : '—'],
      ['Geral', totAvg ? totAvg + '/5' : '—', '—'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 55 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Avaliação 4.0')
    XLSX.writeFile(wb, `avaliacao_i40_${(assessment.company || 'empresa').replace(/\s/g, '_')}.xlsx`)
  }

  async function exportPDF() {
    const { jsPDF } = (await import('jspdf')).default ? (await import('jspdf')) : { jsPDF: (await import('jspdf')).jsPDF }
    await import('jspdf-autotable')
    const doc = new jsPDF('p', 'mm', 'a4')
    const company = assessment.company || 'Empresa'

    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text('Avaliação de Maturidade — Indústria 4.0', 14, 18)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100)
    doc.text(`${company} · ${assessment.sector || '—'} · ${date}`, 14, 25)
    doc.setTextColor(0)

    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('Resumo executivo', 14, 34)
    ;(doc as any).autoTable({
      startY: 38,
      head: [['Frente', 'Score Atual', 'Score Meta']],
      body: [
        ['Produtos', pAvg ? pAvg + '/5' : '—', avg(DIMS.products.map(d => d.id), assessment.goals) ? avg(DIMS.products.map(d => d.id), assessment.goals) + '/5' : '—'],
        ['Produção', prAvg ? prAvg + '/5' : '—', avg(DIMS.production.map(d => d.id), assessment.goals) ? avg(DIMS.production.map(d => d.id), assessment.goals) + '/5' : '—'],
        ['Score Geral', totAvg ? totAvg + '/5' : '—', '—'],
      ],
      styles: { fontSize: 9 }, headStyles: { fillColor: [37, 99, 235] }, margin: { left: 14, right: 14 }, tableWidth: 90,
    })

    let y = (doc as any).lastAutoTable.finalY + 8
    ;(['products', 'production'] as const).forEach(type => {
      doc.setFontSize(11); doc.setFont('helvetica', 'bold')
      doc.text(type === 'products' ? 'Produtos' : 'Produção', 14, y)
      ;(doc as any).autoTable({
        startY: y + 4,
        head: [['Dimensão', 'Atual', 'Meta', 'Gap', 'Descrição']],
        body: DIMS[type].map(d => [
          d.label,
          assessment.scores[d.id] || '—',
          assessment.goals[d.id] || '—',
          (assessment.scores[d.id] && assessment.goals[d.id]) ? assessment.goals[d.id] - assessment.scores[d.id] : '—',
          assessment.scores[d.id] ? d.descs[(assessment.scores[d.id] || 1) - 1] : 'Não avaliado',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: type === 'products' ? [37, 99, 235] : [22, 163, 74] },
        columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 12 }, 2: { cellWidth: 12 }, 3: { cellWidth: 12 }, 4: { cellWidth: 'auto' } },
        margin: { left: 14, right: 14 },
      })
      y = (doc as any).lastAutoTable.finalY + 8
      if (y > 250) { doc.addPage(); y = 20 }
    })

    doc.save(`avaliacao_i40_${company.replace(/\s/g, '_')}.pdf`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Summary */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumo da avaliação</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
          {[['Empresa', assessment.company || '—'], ['Setor', assessment.sector || '—'], ['Data', date], ['Dimensões avaliadas', `${filled}/12`], ['Score Produtos', pAvg ? pAvg + '/5' : '—'], ['Score Produção', prAvg ? prAvg + '/5' : '—']].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)', marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Relatório Excel</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Planilha completa com todas as dimensões, scores, gaps e observações. Pronto para editar e apresentar.
          </div>
          <button onClick={exportExcel} style={{ width: '100%', padding: '0.65rem', background: '#dcfce7', color: '#14532d', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ↓ Baixar .xlsx
          </button>
        </div>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Relatório PDF</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            PDF executivo para apresentações com resumo de scores, tabelas por frente e iniciativas recomendadas.
          </div>
          <button onClick={exportPDF} style={{ width: '100%', padding: '0.65rem', background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ↓ Baixar .pdf
          </button>
        </div>
      </div>

      {/* Share link */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link de compartilhamento</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={typeof window !== 'undefined' ? window.location.href : ''} style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: '#374151', background: 'var(--gray-50)' }} />
          <button onClick={() => { navigator.clipboard.writeText(window.location.href) }} style={{ padding: '0.6rem 1rem', background: '#111827', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
            Copiar
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Qualquer pessoa com este link pode visualizar e editar a avaliação.</p>
      </div>
    </div>
  )
}
