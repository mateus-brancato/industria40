'use client'
import { useEffect, useRef } from 'react'
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { ALL_DIMS, type Assessment } from '@/lib/dims'

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip)

export default function BarChart({ assessment }: { assessment: Assessment }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const labels = ALL_DIMS.map(d => d.label.split(' ')[0])
    const actual = ALL_DIMS.map(d => assessment.scores[d.id] || 0)
    const goals = ALL_DIMS.map(d => assessment.goals[d.id] || 0)

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = actual
      chartRef.current.data.datasets[1].data = goals
      chartRef.current.update()
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Atual', data: actual, backgroundColor: ALL_DIMS.map((d, i) => i < 6 ? 'rgba(37,99,235,0.7)' : 'rgba(22,163,74,0.7)'), borderRadius: 4 },
          { label: 'Meta', data: goals, backgroundColor: 'rgba(217,119,6,0.25)', borderColor: '#d97706', borderWidth: 1.5, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/5` } } },
        scales: {
          x: { ticks: { font: { size: 9 }, color: '#9ca3af', maxRotation: 45 }, grid: { display: false } },
          y: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 }, color: '#9ca3af' }, grid: { color: 'rgba(0,0,0,0.04)' } },
        },
      },
    })
  }, [assessment])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {[['rgba(37,99,235,0.7)', 'Produtos — atual'], ['rgba(22,163,74,0.7)', 'Produção — atual'], ['#d97706', 'Meta']].map(([c, l]) => (
          <span key={l} style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: c as string, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', height: 280 }}>
        <canvas ref={canvasRef} role="img" aria-label="Gráfico de barras atual vs meta" />
      </div>
    </div>
  )
}
