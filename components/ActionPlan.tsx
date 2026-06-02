import { ALL_DIMS, avg, type Assessment } from '@/lib/dims'

const INITIATIVES = [
  { n: 1, title: 'Diagnóstico e quick wins', body: 'Mapear processos críticos, identificar automações de baixo custo e alta visibilidade. Implementar sensoriamento básico nas linhas prioritárias.', priority: 'Alta', horizon: '0–6 meses', types: ['Produção'] },
  { n: 2, title: 'Conectividade e integração de dados', body: 'Estabelecer backbone de comunicação industrial (fieldbus ou Ethernet industrial). Centralizar dados de produção em plataforma única com dashboard operacional.', priority: 'Alta', horizon: '0–12 meses', types: ['Produção', 'Produtos'] },
  { n: 3, title: 'Digitalização de produtos', body: 'Incorporar sensores e interfaces de comunicação nos produtos. Desenvolver portais de serviço, monitoramento remoto e coleta de dados em campo.', priority: 'Média', horizon: '6–18 meses', types: ['Produtos'] },
  { n: 4, title: 'Capacitação e cultura digital', body: 'Treinar equipes em tecnologias 4.0, criar times multidisciplinares de TI + operação, definir KPIs de transformação digital e governança de dados.', priority: 'Média', horizon: '6–18 meses', types: ['Produção', 'Produtos'] },
  { n: 5, title: 'Automação e controle inteligente', body: 'Implementar controles CNC/SCADA/MES. Integrar sistemas ERP à produção. Evoluir para monitoramento preditivo com IA e machine learning.', priority: 'Alta', horizon: '12–24 meses', types: ['Produção'] },
  { n: 6, title: 'Modelos de negócio baseados em dados', body: 'Desenvolver serviços por assinatura e manutenção preditiva. Explorar novas receitas com dados dos produtos em campo. Construir ecossistema de parceiros digitais.', priority: 'Baixa', horizon: '18–36 meses', types: ['Produtos'] },
]

const PCOLOR: Record<string, { bg: string; color: string }> = {
  Alta:  { bg: '#fef2f2', color: '#991b1b' },
  Média: { bg: '#fffbeb', color: '#78350f' },
  Baixa: { bg: '#f0fdf4', color: '#14532d' },
}

export default function ActionPlan({ assessment }: { assessment: Assessment }) {
  const filled = ALL_DIMS.filter(d => (assessment.scores[d.id] || 0) > 0)
  if (filled.length < 4) return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '3rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
      Preencha ao menos 4 dimensões na aba Avaliação para ver o plano.
    </div>
  )

  const sorted = filled.sort((a, b) => (assessment.scores[a.id] || 0) - (assessment.scores[b.id] || 0))
  const critical = sorted.filter(d => (assessment.scores[d.id] || 0) <= 2)
  const mid = sorted.filter(d => (assessment.scores[d.id] || 0) === 3)
  const good = sorted.filter(d => (assessment.scores[d.id] || 0) >= 4)

  const pAvg = avg(filled.filter(d => d.type === 'products').map(d => d.id), assessment.scores)
  const prAvg = avg(filled.filter(d => d.type === 'production').map(d => d.id), assessment.scores)

  const phases = [
    { label: '0–6 meses', title: 'Fundação', color: '#dc2626', bg: '#fef2f2', items: critical.slice(0, 3) },
    { label: '6–18 meses', title: 'Evolução', color: '#d97706', bg: '#fffbeb', items: mid.slice(0, 3) },
    { label: '18–36 meses', title: 'Liderança', color: '#16a34a', bg: '#f0fdf4', items: good.slice(0, 3) },
  ]

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

      {/* Initiatives */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--gray-100)', fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Iniciativas recomendadas
        </div>
        {INITIATIVES.map(ini => {
          const pc = PCOLOR[ini.priority]
          return (
            <div key={ini.n} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{ini.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{ini.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 6 }}>{ini.body}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ini.types.map(t => <span key={t} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: t === 'Produtos' ? '#dbeafe' : '#dcfce7', color: t === 'Produtos' ? '#1e40af' : '#14532d', fontWeight: 500 }}>{t}</span>)}
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: pc.bg, color: pc.color, fontWeight: 500 }}>{ini.priority} prioridade</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>{ini.horizon}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
