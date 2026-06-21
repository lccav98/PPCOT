'use client'
import { usePPCOT } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import Fase01 from '@/components/phases/Fase01'
import Fase02 from '@/components/phases/Fase02'
import Fase03 from '@/components/phases/Fase03'
import Fase04 from '@/components/phases/Fase04'
import Fase05 from '@/components/phases/Fase05'
import Fase06 from '@/components/phases/Fase06'
import { CheckCircle, Circle, Clock } from 'lucide-react'

const phaseKeys = ['fase01','fase02','fase03','fase04','fase05','fase06'] as const

export default function Home() {
  const { state, dispatch } = usePPCOT()

  const completedCount = phaseKeys.filter(k => state[k].status === 'completed').length
  const progress = Math.round((completedCount / 6) * 100)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-card-bg border-b border-military-green px-6 py-3 flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-4">
            <input
              className="bg-transparent text-white font-bold text-sm border-b border-transparent hover:border-military-gold focus:border-military-gold focus:outline-none transition-colors pb-0.5 w-64"
              value={state.operationName}
              onChange={e => dispatch({ type: 'SET_OPERATION_NAME', payload: e.target.value })}
            />
            <span className="text-green-600 text-xs">|</span>
            <span className="text-green-500 text-xs">Exame de Situação do Comandante</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-24 bg-green-900 rounded-full h-1.5">
                <div className="bg-military-gold h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-military-gold text-xs font-bold">{progress}%</span>
            </div>
            <span className="text-green-600 text-xs">{completedCount}/6 fases</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.currentPhase === 0 && (
            <Dashboard onStart={() => { dispatch({ type: 'SET_PHASE', payload: 1 }); dispatch({ type: 'UPDATE_FASE01', payload: { status: 'in_progress' } }) }} />
          )}
          {state.currentPhase === 1 && <Fase01 />}
          {state.currentPhase === 2 && <Fase02 />}
          {state.currentPhase === 3 && <Fase03 />}
          {state.currentPhase === 4 && <Fase04 />}
          {state.currentPhase === 5 && <Fase05 />}
          {state.currentPhase === 6 && <Fase06 />}
        </div>
      </main>
    </div>
  )
}

function Dashboard({ onStart }: { onStart: () => void }) {
  const { state } = usePPCOT()
  const phaseKeys = ['fase01','fase02','fase03','fase04','fase05','fase06'] as const

  const phases = [
    { num: 1, label: 'Análise da Missão', desc: 'NLP · Extração 5W · EEI · DIPLAN inicial', key: 'fase01' as const },
    { num: 2, label: 'Situação e Compreensão', desc: 'MITeMeTeC · PITCIC · FFF · OCOAV · DICOVAP', key: 'fase02' as const },
    { num: 3, label: 'Linhas de Ação', desc: 'L Aç · Psb Ini · APA Preliminar · IA Generativa', key: 'fase03' as const },
    { num: 4, label: 'Comparação das LA', desc: 'Matriz de Decisão · Ponderação Automática · Ranking', key: 'fase04' as const },
    { num: 5, label: 'Decisão do Comandante', desc: 'DIPLAN Atualizada · Intenção · EEI Revisados', key: 'fase05' as const },
    { num: 6, label: 'Ordem de Operações', desc: 'Geração Automática · Impressão · Export', key: 'fase06' as const },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-military-gold font-bold text-2xl mb-2">PPCOT — Plataforma de Planejamento Automatizado</h1>
        <p className="text-green-400 text-sm">Exame de Situação do Comandante · EB70-MC-10.211 · 2ª Edição 2020</p>
        <p className="text-green-600 text-xs mt-1">Automação das 6 fases do componente detalhado do planejamento operacional</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {phases.map(p => {
          const status = state[p.key].status
          return (
            <div key={p.num} className="bg-card-bg border border-military-green rounded-lg p-4 hover:border-military-gold transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-military-gold font-bold text-lg">0{p.num}</span>
                  {status === 'completed' ? <CheckCircle size={14} className="text-green-400" />
                    : status === 'in_progress' ? <Clock size={14} className="text-military-gold animate-pulse-gold" />
                    : <Circle size={14} className="text-green-800" />}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  status === 'completed' ? 'bg-green-900 text-green-400'
                  : status === 'in_progress' ? 'bg-yellow-900 text-yellow-400'
                  : 'bg-gray-800 text-gray-600'
                }`}>
                  {status === 'completed' ? 'Concluída' : status === 'in_progress' ? 'Em progresso' : 'Pendente'}
                </span>
              </div>
              <h3 className="text-white font-medium text-sm mb-1">{p.label}</h3>
              <p className="text-green-600 text-xs">{p.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <button onClick={onStart} className="btn-primary text-base px-8 py-3">
          Iniciar Exame de Situação →
        </button>
        <p className="text-green-700 text-xs mt-3">
          Os dados são salvos automaticamente no navegador · Compatível com a doutrina PPCOT
        </p>
      </div>
    </div>
  )
}
