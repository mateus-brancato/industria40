'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const [error, setError] = useState('')

  async function createNew() {
    setLoading(true)
    const { data, error } = await supabase
      .from('assessments')
      .insert({ company: '', sector: '', eval_date: new Date().toISOString().split('T')[0], scores: {}, goals: {}, notes: {} })
      .select('share_id')
      .single()
    if (error || !data) { setError('Erro ao criar avaliação. Verifique sua conexão.'); setLoading(false); return }
    router.push(`/a/${data.share_id}`)
  }

  async function openShared() {
    const code = shareCode.trim()
    if (!code) { setError('Digite o código do link.'); return }
    setLoading(true)
    const { data } = await supabase.from('assessments').select('share_id').eq('share_id', code).single()
    if (!data) { setError('Avaliação não encontrada. Verifique o código.'); setLoading(false); return }
    router.push(`/a/${code}`)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--gray-50)' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'var(--blue)', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 6 }}>Avaliação Indústria 4.0</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>
            Ferramenta de maturidade digital baseada no<br />
            <strong style={{ color: 'var(--gray-700)' }}>Toolbox VDMA & acatech Maturity Index</strong>
          </p>
        </div>

        {/* Cards */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

          {/* New assessment */}
          <div style={{ padding: '1.75rem' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nova avaliação</p>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Crie uma avaliação e receba um link único para compartilhar com seu time.
            </p>
            <button
              onClick={createNew}
              disabled={loading}
              style={{ width: '100%', padding: '0.7rem 1rem', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              {loading ? 'Criando...' : '+ Criar nova avaliação'}
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--gray-100)' }} />

          {/* Open existing */}
          <div style={{ padding: '1.75rem' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abrir avaliação existente</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={shareCode}
                onChange={e => { setShareCode(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && openShared()}
                placeholder="Cole o código do link (ex: a3f8k2...)"
                style={{ flex: 1, padding: '0.65rem 0.85rem', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--gray-900)', background: 'var(--gray-50)', outline: 'none' }}
              />
              <button
                onClick={openShared}
                disabled={loading}
                style={{ padding: '0.65rem 1rem', background: 'var(--gray-900)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}
              >
                Abrir
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/guideline-vdma.pdf"
            download="Guideline-Industrie-4.0-VDMA.pdf"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-400)', textDecoration: 'none', padding: '0.4rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: 8, background: 'white' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Baixar Guideline VDMA (PDF)
          </a>
          <p style={{ fontSize: 12, color: 'var(--gray-300)', marginTop: '0.75rem' }}>
            Sem login · Dados salvos automaticamente · Compartilhável por link
          </p>
        </div>
      </div>
    </main>
  )
}
