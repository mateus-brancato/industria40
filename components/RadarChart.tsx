'use client'
import { useEffect, useRef } from 'react'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { ALL_DIMS, type Assessment } from '@/lib/dims'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function RadarChart({ assessment }: { assessment: Assessment }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const pVals = ALL_DIMS.slice(0, 6).map(d => assessment.scores[d.id] || 0)
    const prVals = ALL_DIMS.slice(6).map(d => assessment.scores[d.id] || 0)
    const goalVals = ALL_DIMS.map(d => assessment.goals[d.id] || 0)
    const labels = ALL_DIMS.map(d => d.label.split(' ').slice(0, 3).join(' '))

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = [...pVals, ...Array(6).fill(null)]
      chartRef.current.data.datasets[1].data = [...Array(6).fill(null), ...prVals]
      chartRef.current.data.datasets[2].data = goalVals
      chartRef.current.update()
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          { label: 'Produtos', data: [...pVals, ...Array(6).fill(null)], backgroundColor: 'rgba(37,99,235,0.12)', borderColor: '#2563eb', pointBackgroundColor: '#2563eb', pointRadius: 3, borderWidth: 2 },
          { label: 'Produção', data: [...Array(6).fill(null), ...prVals], backgroundColor: 'rgba(22,163,74,0.10)', borderColor: '#16a34a', pointBackgroundColor: '#16a34a', pointRadius: 3, borderWidth: 2 },
          { label: 'Meta', data: goalVals, backgroundColor: 'rgba(217,119,6,0.06)', borderColor: '#d97706', borderDash: [4, 3], pointBackgroundColor: '#d97706', pointRadius: 2, borderWidth: 1.5 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 }, color: '#9ca3af' }, pointLabels: { font: { size: 10 }, color: '#6b7280' }, grid: { color: 'rgba(0,0,0,0.06)' }, angleLines: { color: 'rgba(0,0,0,0.08)' } } },
      },
    })
  }, [assessment])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['#2563eb', 'Produtos'], ['#16a34a', 'Produção'], ['#d97706', 'Meta']].map(([c, l]) => (
          <span key={l} style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: c as string, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', height: 320 }}>
        <canvas ref={canvasRef} role="img" aria-label="Radar de maturidade Indústria 4.0" />
      </div>
    </div>
  )
}
