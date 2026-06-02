'use client'
import { useState } from 'react'
import { ALL_DIMS, DIMS, avg, type Assessment } from '@/lib/dims'
import { generatePlan } from '@/lib/plan'

function maturityLabel(score: number | null): string {
  if (!score) return '—'
  if (score < 1.5) return 'Inicial (Computerização)'
  if (score < 2.5) return 'Conectado'
  if (score < 3.5) return 'Visível'
  if (score < 4.5) return 'Transparente'
  return 'Adaptável'
}

export default function ExportPanel({ assessment }: { assessment: Assessment }) {
  const [copied, setCopied] = useState(false)
  const pAvg = avg(DIMS.products.map(d => d.id), assessment.scores)
  const prAvg = avg(DIMS.production.map(d => d.id), assessment.scores)
  const totAvg = avg(ALL_DIMS.map(d => d.id), assessment.scores)
  const filled = ALL_DIMS.filter(d => (assessment.scores[d.id] || 0) > 0).length
  const date = assessment.eval_date ? new Date(assessment.eval_date + 'T12:00').toLocaleDateString('pt-BR') : '—'

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const incomplete = filled > 0 && filled < 12
  const empty = filled === 0

  async function exportExcel() {
    if (empty) return
    if (incomplete && !window.confirm(`Apenas ${filled}/12 dimensões foram avaliadas. Exportar mesmo assim?`)) return
    const XLSX = (await import('xlsx')).default
    const wb = XLSX.utils.book_new()

    // Sheet 1 — Avaliação
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

    // Sheet 2 — Plano de Ação
    const plan = generatePlan(assessment)
    const planRows: (string | number)[][] = [
      ['Plano de Ação Personalizado'],
      ['Empresa:', assessment.company || '—', 'Maturidade:', maturityLabel(totAvg)],
      [],
      ['#', 'Iniciativa', 'Prioridade', 'Relevância', 'Horizonte', 'Dimensão', 'Atual', 'Meta', 'Gap', 'Descrição Atual', 'Próximo Passo'],
      ...plan.flatMap((ini, idx) =>
        ini.dims.map(dim => [
          idx + 1,
          ini.title,
          ini.priority,
          ini.relevanceScore,
          ini.horizon,
          dim.label,
          dim.score,
          dim.goal > 0 ? dim.goal : '(proxy)',
          dim.gap,
          dim.currentDesc,
          dim.nextStep ?? 'Nível máximo atingido',
        ])
      ),
    ]
    const wsPlan = XLSX.utils.aoa_to_sheet(planRows)
    wsPlan['!cols'] = [
      { wch: 4 }, { wch: 36 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 50 }, { wch: 70 },
    ]
    XLSX.utils.book_append_sheet(wb, wsPlan, 'Plano de Ação')

    XLSX.writeFile(wb, `avaliacao_i40_${(assessment.company || 'empresa').replace(/\s/g, '_')}.xlsx`)
  }

  async function exportPDF() {
    if (empty) return
    if (incomplete && !window.confirm(`Apenas ${filled}/12 dimensões foram avaliadas. Exportar mesmo assim?`)) return
    const { jsPDF } = await import('jspdf')
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

    // ── Plano de Ação ──────────────────────────────────────────────────────
    if (y > 220) { doc.addPage(); y = 20 }
    doc.setFontSize(13); doc.setFont('helvetica', 'bold')
    doc.text('Plano de Ação', 14, y)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100)
    doc.text(`Nível de maturidade: ${maturityLabel(totAvg)}  ·  Baseado no acatech Maturity Index`, 14, y + 5)
    doc.setTextColor(0)
    y += 12

    const plan = generatePlan(assessment)

    if (plan.length === 0) {
      doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(150)
      doc.text('Todas as dimensões avaliadas já atingiram a meta.', 14, y)
      doc.setTextColor(0)
    } else {
      plan.forEach((ini, idx) => {
        if (y > 220) { doc.addPage(); y = 20 }

        // Initiative header
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
        doc.text(`${idx + 1}. ${ini.title}`, 14, y)
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100)
        doc.text(`${ini.priority} prioridade · ${ini.horizon} · relevância: ${ini.relevanceScore.toFixed(1)}`, 14, y + 4)
        doc.setTextColor(0); doc.setFont('helvetica', 'italic')
        const bodyLines = doc.splitTextToSize(ini.body, 182) as string[]
        doc.text(bodyLines, 14, y + 9)
        y += 9 + bodyLines.length * 4 + 2

        // Dim details table
        ;(doc as any).autoTable({
          startY: y,
          head: [['Dimensão', 'Atual', 'Meta', 'Gap', 'Próximo Passo']],
          body: ini.dims.map(dim => [
            dim.label,
            `${dim.score}/5`,
            dim.goal > 0 ? `${dim.goal}/5` : '—',
            `+${dim.gap}`,
            dim.nextStep ?? 'Nível máximo atingido',
          ]),
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [245, 158, 11] },
          bodyStyles: { valign: 'top' },
          columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 12 }, 2: { cellWidth: 12 }, 3: { cellWidth: 12 }, 4: { cellWidth: 'auto' } },
          margin: { left: 14, right: 14 },
        })
        y = (doc as any).lastAutoTable.finalY + 10
      })
    }
    // ───────────────────────────────────────────────────────────────────────

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
            Planilha completa com avaliação, gaps, observações e aba separada com o plano de ação personalizado.
          </div>
          <button onClick={exportExcel} disabled={empty} style={{ width: '100%', padding: '0.65rem', background: empty ? 'var(--gray-100)' : '#dcfce7', color: empty ? 'var(--gray-300)' : '#14532d', border: `1px solid ${empty ? 'var(--gray-200)' : '#86efac'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: empty ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
            ↓ Baixar .xlsx
          </button>
        </div>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Relatório PDF</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            PDF executivo com resumo de scores, tabelas por frente e plano de ação personalizado com próximos passos.
          </div>
          <button onClick={exportPDF} disabled={empty} style={{ width: '100%', padding: '0.65rem', background: empty ? 'var(--gray-100)' : '#dbeafe', color: empty ? 'var(--gray-300)' : '#1e40af', border: `1px solid ${empty ? 'var(--gray-200)' : '#93c5fd'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: empty ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
            ↓ Baixar .pdf
          </button>
        </div>
      </div>

      {/* Share link */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link de compartilhamento</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={typeof window !== 'undefined' ? window.location.href : ''} style={{ flex: 1, padding: '0.6rem 0.85rem', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: '#374151', background: 'var(--gray-50)' }} />
          <button onClick={copyLink} style={{ padding: '0.6rem 1rem', background: copied ? 'var(--green-light, #dcfce7)' : '#111827', color: copied ? 'var(--green-dark, #14532d)' : 'white', border: copied ? '1px solid #86efac' : 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Qualquer pessoa com este link pode visualizar e editar a avaliação.</p>
      </div>
    </div>
  )
}
