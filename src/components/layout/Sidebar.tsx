'use client'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Circle, Clock, ChevronRight, Shield, LayoutDashboard } from 'lucide-react'

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
    <aside className="w-64 min-h-screen bg-card-bg border-r border-military-green flex flex-col no-print">
      {/* Logo */}
      <div className="p-4 border-b border-military-green">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="text-military-gold animate-pulse-gold" size={20} />
          <span className="text-military-gold font-bold text-sm tracking-widest font-title">PPCOT</span>
        </div>
        <p className="text-green-600 text-xs">Plataforma de Planejamento</p>
        <p className="text-green-400 text-xs font-medium mt-1 truncate">{state.operationName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {/* Painel Principal Link */}
        <button
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 0 })}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
            state.currentPhase === 0
              ? 'bg-military-green border border-military-gold text-white font-bold'
              : 'hover:bg-military-green/50 text-green-300 hover:text-white'
          }`}
        >
          <span className="flex-shrink-0">
            <LayoutDashboard size={16} className={state.currentPhase === 0 ? 'text-military-gold' : 'text-green-700'} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-medium">Painel Principal</span>
          </span>
          {state.currentPhase === 0 && <ChevronRight size={14} className="text-military-gold flex-shrink-0" />}
        </button>

        <div className="h-px bg-military-green my-2"></div>

        {/* Phase Links */}
        {phases.map((phase) => {
          const key = phaseKeys[phase.num - 1]
          const status = state[key].status
          const isActive = state.currentPhase === phase.num

          return (
            <button
              key={phase.num}
              onClick={() => dispatch({ type: 'SET_PHASE', payload: phase.num })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-military-green border border-military-gold text-white font-bold'
                  : 'hover:bg-military-green/50 text-green-300 hover:text-white'
              }`}
            >
              {/* Status icon */}
              <span className="flex-shrink-0">
                {status === 'completed' ? (
                  <CheckCircle size={15} className="text-green-400" />
                ) : status === 'in_progress' ? (
                  <Clock size={15} className="text-military-gold animate-pulse-gold" />
                ) : (
                  <Circle size={15} className="text-green-800" />
                )}
              </span>

              {/* Labels */}
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] text-green-500">{phase.sub}</span>
                <span className="block text-xs font-medium truncate">{phase.label}</span>
              </span>

              {isActive && <ChevronRight size={14} className="text-military-gold flex-shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-military-green">
        <p className="text-green-700 text-[10px] text-center">EB70-MC-10.211 · 2ª Ed · 2020</p>
        <button
          type="button"
          onClick={() => { if (confirm('Resetar todo o planejamento? Todo o progresso será perdido.')) dispatch({ type: 'RESET' }) }}
          className="w-full mt-2 text-red-700 hover:text-red-500 text-xs py-1 rounded hover:bg-red-950/20 border border-transparent hover:border-red-950 transition-colors cursor-pointer"
        >
          Resetar Planejamento
        </button>
      </div>
    </aside>
  )
}
