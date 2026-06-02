import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avaliação Indústria 4.0',
  description: 'Ferramenta de avaliação de maturidade Indústria 4.0 — Toolbox VDMA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
