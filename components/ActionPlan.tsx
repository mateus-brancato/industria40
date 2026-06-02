import { ALL_DIMS, avg, type Assessment } from '@/lib/dims'
import { generatePlan, type PlannedInitiative } from '@/lib/plan'

const PCOLOR: Record<string, { bg: string; color: string; border: string }> = {
  Alta:  { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  Média: { bg: '#fffbeb', color: '#78350f', border: '#fcd34d' },
  Baixa: { bg: '#f0fdf4', color: '#14532d', border: '#86efac' },
}

function DimCard({ dim }: { dim: PlannedInitiative['dims'][number] }) {
  const typeBg  = dim.type === 'products' ? '#dbeafe' : '#dcfce7'
  const typeClr = dim.type === 'products' ? '#1e40af' : '#14532d'
  const typeLabel = dim.type === 'products' ? 'Produtos' : 'Produção'
  const gapColor = dim.gap >= 2 ? '#dc2626' : dim.gap >= 1 ? '#d97706' : '#6b7280'

  return (
    <div style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-100)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: typeBg, color: typeClr, fontWeight: 500, flexShrink: 0 }}>{typeLabel}</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{dim.label}</span>
        </div>
        <span style={{ fontSize: 11, color: gapColor, fontWeight: 600, flexShrink: 0 }}>
          {dim.score}/5 → {dim.goal > 0 ? `${dim.goal}/5` : 'sem meta'} <span style={{ fontWeight: 400 }}>(+{dim.gap})</span>
        </span>
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', margin: '0 0 6px 0', lineHeight: 1.5 }}>
        Nível atual: {dim.currentDesc}
      </p>
      {dim.nextStep && (
        <div style={{ background: '#fffbeb', borderLeft: '3px solid #d97706', padding: '6px 10px', borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', marginBottom: 2, letterSpacing: '0.04em' }}>PRÓXIMO PASSO</div>
          <p style={{ fontSize: 11, color: '#78350f', lineHeight: 1.6, margin: 0 }}>{dim.nextStep}</p>
        </div>
      )}
    </div>
  )
}

export default function ActionPlan({ assessment }: { assessment: Assessment }) {
  const filled = ALL_DIMS.filter(d => (assessment.scores[d.id] || 0) > 0)
  if (filled.length < 4) return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '3rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
      Preencha ao menos 4 dimensões na aba Avaliação para ver o plano.
    </div>
  )

  const sorted = [...filled].sort((a, b) => (assessment.scores[a.id] || 0) - (assessment.scores[b.id] || 0))
  const critical = sorted.filter(d => (assessment.scores[d.id] || 0) <= 2)
  const mid = sorted.filter(d => (assessment.scores[d.id] || 0) === 3)
  const good = sorted.filter(d => (assessment.scores[d.id] || 0) >= 4)

  const pAvg  = avg(filled.filter(d => d.type === 'products').map(d => d.id), assessment.scores)
  const prAvg = avg(filled.filter(d => d.type === 'production').map(d => d.id), assessment.scores)

  const phases = [
    { label: '0–6 meses',   title: 'Fundação',  color: '#dc2626', bg: '#fef2f2', items: critical.slice(0, 3) },
    { label: '6–18 meses',  title: 'Evolução',  color: '#d97706', bg: '#fffbeb', items: mid.slice(0, 3) },
    { label: '18–36 meses', title: 'Liderança', color: '#16a34a', bg: '#f0fdf4', items: good.slice(0, 3) },
  ]

  const plan = generatePlan(assessment)
  const hasGoals = Object.values(assessment.goals).some(g => g > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Maturity level banner */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Nível de maturidade estimado</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>
            {(() => {
              const tot = avg(ALL_DIMS.map(d => d.id), assessment.scores)
              if (!tot) return '—'
              if (tot < 1.5) return 'Inicial (Computerização)'
              if (tot < 2.5) return 'Conectado'
              if (tot < 3.5) return 'Visível'
              if (tot < 4.5) return 'Transparente'
              return 'Adaptável'
            })()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Baseado no acatech Maturity Index</div>
        </div>
        <div style={{ height: 48, width: 1, background: 'var(--gray-200)' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Produtos', pAvg, '#2563eb'], ['Produção', prAvg, '#16a34a']].map(([l, v, c]) => (
            <div key={l as string} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{l as string}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: c as string }}>{v ? `${v}/5` : '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Roadmap de transformação
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {phases.map((p, i) => (
            <div key={p.label} style={{ padding: '1rem 1.25rem', borderLeft: i > 0 ? '1px solid var(--gray-100)' : 'none' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{p.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>{p.title}</div>
              {p.items.length === 0
                ? <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>Sem gaps neste nível</p>
                : p.items.map(d => (
                  <div key={d.id} style={{ padding: '0.4rem 0.6rem', marginBottom: 4, background: p.bg, borderRadius: 6, fontSize: 11, color: p.color, fontWeight: 500 }}>
                    {d.type === 'products' ? '📦' : '🏭'} {d.label.split(' ').slice(0, 3).join(' ')}
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      </div>

      {/* No-goals warning */}
      {!hasGoals && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
            <strong>Dica:</strong> Defina metas por dimensão na aba Avaliação para obter um plano mais preciso — a prioridade e relevância de cada iniciativa serão calculadas com base no gap real entre onde você está e onde quer chegar.
          </p>
        </div>
      )}

      {/* Initiatives — intelligent */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Iniciativas recomendadas
        </div>

        {plan.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            Todas as dimensões avaliadas já atingiram a meta. Parabéns!
          </div>
        ) : plan.map((ini, idx) => {
          const pc = PCOLOR[ini.priority]
          return (
            <div key={ini.n} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--gray-100)' }}>
              {/* Header */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{ini.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 8 }}>{ini.body}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: pc.bg, color: pc.color, fontWeight: 600, border: `1px solid ${pc.border}` }}>{ini.priority} prioridade</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{ini.horizon}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#3b82f6' }}>relevância {ini.relevanceScore.toFixed(1)}</span>
                  </div>

                  {/* Dim details */}
                  <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Dimensões com gap ({ini.dims.length})
                    </div>
                    {ini.dims.map(dim => <DimCard key={dim.id} dim={dim} />)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
