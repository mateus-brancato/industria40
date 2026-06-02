import { ALL_DIMS, type Assessment } from '@/lib/dims'

type Quad = 'critical' | 'opportunity' | 'strength' | 'minor'

const QUADS: Record<Quad, { label: string; color: string; bg: string; desc: string }> = {
  critical:    { label: 'Gaps críticos',   color: '#991b1b', bg: '#fef2f2', desc: 'Baixo desempenho + grande gap para a meta — ação urgente' },
  opportunity: { label: 'Oportunidades',   color: '#1e3a8a', bg: '#eff6ff', desc: 'Bom desempenho com potencial de avanço — investir aqui' },
  strength:    { label: 'Pontos fortes',   color: '#14532d', bg: '#f0fdf4', desc: 'Acima da meta — manter e usar como referência interna' },
  minor:       { label: 'Gaps menores',    color: '#78350f', bg: '#fffbeb', desc: 'Baixo desempenho mas gap pequeno — monitorar' },
}

function classify(score: number, goal: number): Quad {
  const gap = goal - score
  if (score <= 2 && gap >= 2) return 'critical'
  if (score >= 3 && gap >= 1) return 'opportunity'
  if (score >= goal && score >= 3) return 'strength'
  return 'minor'
}

export default function GapMatrix({ assessment }: { assessment: Assessment }) {
  const filled = ALL_DIMS.filter(d => (assessment.scores[d.id] || 0) > 0)

  if (filled.length < 4) return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '3rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
      Preencha ao menos 4 dimensões na aba Avaliação para ver a análise de gaps.
    </div>
  )

  const withMeta = filled.map(d => {
    const score = assessment.scores[d.id] || 0
    const goal = assessment.goals[d.id] || 5
    const gap = goal - score
    const quad = classify(score, goal)
    return { ...d, score, goal, gap, quad }
  })

  const grouped = Object.fromEntries(
    (['critical', 'opportunity', 'strength', 'minor'] as Quad[]).map(q => [q, withMeta.filter(d => d.quad === q)])
  ) as Record<Quad, typeof withMeta>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Matrix grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {(['critical', 'opportunity', 'strength', 'minor'] as Quad[]).map(q => {
          const qd = QUADS[q]
          return (
            <div key={q} style={{ background: qd.bg, borderRadius: 12, border: `1px solid ${qd.color}22`, padding: '1.25rem' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: qd.color, marginBottom: 4 }}>{qd.label}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.4 }}>{qd.desc}</div>
              {grouped[q].length === 0 ? (
                <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>Nenhuma dimensão</p>
              ) : grouped[q].map(d => (
                <div key={d.id} style={{ padding: '0.5rem 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.3 }}>
                      <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af', display: 'block' }}>{d.type === 'products' ? 'Produtos' : 'Produção'}</span>
                      {d.label}
                    </span>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: qd.color }}>{d.score}/5</span>
                      <span style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>meta {d.goal}/5</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: 4, width: `${(d.score / 5) * 100}%`, background: qd.color, borderRadius: 99, opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Sorted list */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>
          Todas as dimensões — ordenadas por gap
        </div>
        {withMeta.sort((a, b) => b.gap - a.gap).map(d => {
          const qd = QUADS[d.quad]
          return (
            <div key={d.id} style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: qd.bg, color: qd.color, fontWeight: 500, flexShrink: 0 }}>{qd.label}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{d.type === 'products' ? 'Produtos' : 'Produção'} — {d.label}</span>
                <div style={{ marginTop: 4, height: 3, background: 'var(--gray-100)', borderRadius: 99, position: 'relative' }}>
                  <div style={{ height: 3, width: `${(d.score / 5) * 100}%`, background: d.type === 'products' ? '#2563eb' : '#16a34a', borderRadius: 99 }} />
                  {d.goal > 0 && <div style={{ position: 'absolute', top: -1, left: `${(d.goal / 5) * 100}%`, width: 1, height: 5, background: '#d97706' }} />}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: d.gap > 2 ? '#dc2626' : d.gap > 0 ? '#d97706' : '#16a34a', minWidth: 60, textAlign: 'right' }}>
                {d.score}/5 <span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af' }}>gap {d.gap > 0 ? '+' : ''}{d.gap}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
