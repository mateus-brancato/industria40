'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DIMS, ALL_DIMS, avg, type Assessment } from '@/lib/dims'
import RadarChart from '@/components/RadarChart'
import BarChart from '@/components/BarChart'
import GapMatrix from '@/components/GapMatrix'
import ActionPlan from '@/components/ActionPlan'
import ExportPanel from '@/components/ExportPanel'

const TABS = ['Avaliação', 'Radar', 'Gaps', 'Plano', 'Exportar']

export default function AssessmentPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('share_id', shareId)
        .single()
      if (data) setAssessment(data as Assessment)
      setLoading(false)
    }
    load()
  }, [shareId])

  const scheduleSave = useCallback((updated: Assessment) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    saveTimer.current = setTimeout(async () => {
      await supabase.from('assessments').update({
        company: updated.company,
        sector: updated.sector,
        eval_date: updated.eval_date,
        scores: updated.scores,
        goals: updated.goals,
        notes: updated.notes,
      }).eq('share_id', shareId)
      setSaving(false)
    }, 900)
  }, [shareId])

  function update(patch: Partial<Assessment>) {
    if (!assessment) return
    const next = { ...assessment, ...patch }
    setAssessment(next)
    scheduleSave(next)
  }

  function setScore(id: string, val: number) {
    if (!assessment) return
    const scores = { ...assessment.scores, [id]: val }
    update({ scores })
  }

  function setGoal(id: string, val: number) {
    if (!assessment) return
    const goals = { ...assessment.goals, [id]: val }
    update({ goals })
  }

  function setNote(id: string, val: string) {
    if (!assessment) return
    const notes = { ...assessment.notes, [id]: val }
    update({ notes })
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray-500)', fontSize: 14 }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--gray-200)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Carregando avaliação...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!assessment) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 16, color: 'var(--gray-500)' }}>Avaliação não encontrada.</p>
      <a href="/" style={{ color: 'var(--blue)', fontSize: 14 }}>← Criar uma nova</a>
    </div>
  )

  const pIds = DIMS.products.map(d => d.id)
  const prIds = DIMS.production.map(d => d.id)
  const allIds = ALL_DIMS.map(d => d.id)
  const pAvg = avg(pIds, assessment.scores)
  const prAvg = avg(prIds, assessment.scores)
  const totAvg = avg(allIds, assessment.scores)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Top bar */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>I4.0 Assessment</span>
          </a>

          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={assessment.company}
              onChange={e => update({ company: e.target.value })}
              placeholder="Nome da empresa"
              style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)', background: 'transparent', outline: 'none', width: 180 }}
            />
            <input
              value={assessment.sector}
              onChange={e => update({ sector: e.target.value })}
              placeholder="Setor"
              style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)', background: 'transparent', outline: 'none', width: 130 }}
            />
            <input
              type="date"
              value={assessment.eval_date}
              onChange={e => update({ eval_date: e.target.value })}
              style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--gray-200)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--gray-900)', background: 'transparent', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: saving ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>
              {saving ? '● Salvando...' : '● Salvo'}
            </span>
            <button
              onClick={copyLink}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.85rem', background: copied ? 'var(--green-light)' : 'var(--gray-100)', color: copied ? 'var(--green-dark)' : 'var(--gray-700)', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', display: 'flex', gap: 0, borderTop: '1px solid var(--gray-100)' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: '0.55rem 1rem', fontSize: 13, fontWeight: tab === i ? 500 : 400, color: tab === i ? 'var(--blue)' : 'var(--gray-500)', background: 'none', border: 'none', borderBottom: tab === i ? '2px solid var(--blue)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: -1 }}>
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Score strip */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', gap: 12 }}>
          {[
            { label: 'Produtos — atual', val: pAvg, color: 'var(--blue)' },
            { label: 'Produção — atual', val: prAvg, color: 'var(--green)' },
            { label: 'Score geral', val: totAvg, color: 'var(--gray-900)' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{s.label}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: s.color }}>{s.val ? `${s.val}/5` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Tab 0: Assessment */}
        {tab === 0 && (
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {(['products', 'production'] as const).map(type => (
              <div key={type} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', background: type === 'products' ? '#dbeafe' : '#dcfce7', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={type === 'products' ? '#1e40af' : '#14532d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {type === 'products' ? <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></> : <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: type === 'products' ? '#1e40af' : '#14532d' }}>
                    {type === 'products' ? 'Produtos' : 'Produção'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: type === 'products' ? '#3730a3' : '#166534', fontWeight: 500 }}>
                    Atual &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Meta
                  </span>
                </div>
                {DIMS[type].map(dim => (
                  <div key={dim.id} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--gray-100)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', lineHeight: 1.4 }}>{dim.label}</span>
                      <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
                        {/* Actual score */}
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setScore(dim.id, n)}
                              style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                background: (assessment.scores[dim.id] || 0) >= n ? (type === 'products' ? 'var(--blue)' : 'var(--green)') : 'var(--gray-50)',
                                borderColor: (assessment.scores[dim.id] || 0) >= n ? (type === 'products' ? 'var(--blue-dark)' : 'var(--green-dark)') : 'var(--gray-200)',
                                color: (assessment.scores[dim.id] || 0) >= n ? 'white' : 'var(--gray-400)',
                              }}>{n}</button>
                          ))}
                        </div>
                        {/* Goal score */}
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setGoal(dim.id, n)}
                              style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                background: (assessment.goals[dim.id] || 0) >= n ? 'var(--amber)' : 'var(--gray-50)',
                                borderColor: (assessment.goals[dim.id] || 0) >= n ? 'var(--amber-dark)' : 'var(--gray-200)',
                                color: (assessment.goals[dim.id] || 0) >= n ? 'white' : 'var(--gray-400)',
                              }}>{n}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {assessment.scores[dim.id] > 0 && (
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 5, lineHeight: 1.4 }}>
                        {dim.descs[(assessment.scores[dim.id] || 1) - 1]}
                      </p>
                    )}
                    <textarea
                      value={assessment.notes[dim.id] || ''}
                      onChange={e => setNote(dim.id, e.target.value)}
                      placeholder="Observações..."
                      rows={1}
                      style={{ width: '100%', padding: '0.3rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: 5, fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--gray-700)', background: 'var(--gray-50)', resize: 'vertical', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: Radar */}
        {tab === 1 && (
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Radar de maturidade</h2>
              <RadarChart assessment={assessment} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atual vs. meta por dimensão</h2>
              <BarChart assessment={assessment} />
            </div>
          </div>
        )}

        {/* Tab 2: Gaps */}
        {tab === 2 && <div className="fade-up"><GapMatrix assessment={assessment} /></div>}

        {/* Tab 3: Plan */}
        {tab === 3 && <div className="fade-up"><ActionPlan assessment={assessment} /></div>}

        {/* Tab 4: Export */}
        {tab === 4 && <div className="fade-up"><ExportPanel assessment={assessment} /></div>}
      </main>
    </div>
  )
}
