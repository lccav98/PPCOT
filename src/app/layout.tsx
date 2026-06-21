import type { Metadata } from 'next'
import './globals.css'
import { PPCOTProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'PPCOT — Plataforma de Planejamento Automatizado',
  description: 'Sistema de automação do Exame de Situação do Comandante — EB70-MC-10.211',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PPCOTProvider>{children}</PPCOTProvider>
      </body>
    </html>
  )
}
