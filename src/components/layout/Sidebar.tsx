'use client'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Circle, Clock, ChevronRight, Shield } from 'lucide-react'

const phases = [
  { num: 1, label: 'Análise da Missão', sub: 'Fase 01' },
  { num: 2, label: 'Situação e Compreensão', sub: 'Fase 02' },
  { num: 3, label: 'Linhas de Ação', sub: 'Fase 03' },
  { num: 4, label: 'Comparação das LA', sub: 'Fase 04' },
  { num: 5, label: 'Decisão', sub: 'Fase 05' },
  { num: 6, label: 'Ordem de Operações', sub: 'Fase 06' },
]

const phaseKeys = ['fase01', 'fase02', 'fase03', 'fase04', 'fase05', 'fase06'] as const

export default function Sidebar() {
  const { state, dispatch } = usePPCOT()

  return (
    <aside className="w-64 min-h-screen bg-card-bg border-r border-military-green flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-military-green">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="text-military-gold" size={20} />
          <span className="text-military-gold font-bold text-sm tracking-widest">PPCOT</span>
        </div>
        <p className="text-green-600 text-xs">Plataforma de Planejamento</p>
        <p className="text-green-400 text-xs font-medium mt-1 truncate">{state.operationName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {phases.map((phase) => {
          const key = phaseKeys[phase.num - 1]
          const status = state[key].status
          const isActive = state.currentPhase === phase.num

          return (
            <button
              key={phase.num}
              onClick={() => dispatch({ type: 'SET_PHASE', payload: phase.num })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-military-green border border-military-gold text-white'
                  : 'hover:bg-military-green text-green-300 hover:text-white'
              }`}
            >
              {/* Status icon */}
              <span className="flex-shrink-0">
                {status === 'completed' ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : status === 'in_progress' ? (
                  <Clock size={16} className="text-military-gold animate-pulse-gold" />
                ) : (
                  <Circle size={16} className="text-green-700" />
                )}
              </span>

              {/* Labels */}
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-green-500">{phase.sub}</span>
                <span className="block text-xs font-medium truncate">{phase.label}</span>
              </span>

              {isActive && <ChevronRight size={14} className="text-military-gold flex-shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-military-green">
        <p className="text-green-700 text-xs text-center">EB70-MC-10.211 · 2ª Ed · 2020</p>
        <button
          onClick={() => { if (confirm('Resetar todo o planejamento?')) dispatch({ type: 'RESET' }) }}
          className="w-full mt-2 text-red-600 hover:text-red-400 text-xs py-1 rounded hover:bg-red-900/20 transition-colors"
        >
          Resetar Planejamento
        </button>
      </div>
    </aside>
  )
}
