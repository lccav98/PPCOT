'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import Fase01 from '@/components/phases/Fase01'
import Fase02 from '@/components/phases/Fase02'
import Fase03 from '@/components/phases/Fase03'
import Fase04 from '@/components/phases/Fase04'
import Fase05 from '@/components/phases/Fase05'
import Fase06 from '@/components/phases/Fase06'
import BriefingSlides from '@/components/shared/BriefingSlides'
import RiskManager from '@/components/shared/RiskManager'
import { CheckCircle, Circle, Clock, Play, ShieldAlert, X } from 'lucide-react'

const phaseKeys = ['fase01','fase02','fase03','fase04','fase05','fase06'] as const

export default function Home() {
  const { state, dispatch } = usePPCOT()
  const [showBriefings, setShowBriefings] = useState(false)
  const [showRisks, setShowRisks] = useState(false)

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
            <button
              onClick={() => setShowRisks(true)}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/20 border border-red-900/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldAlert size={14} /> Central de Riscos
            </button>
            
            <button
              onClick={() => setShowBriefings(true)}
              className="text-xs text-military-gold hover:text-white flex items-center gap-1 bg-military-green border border-military-gold/30 hover:border-military-gold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Play size={12} fill="currentColor" /> Apresentar Briefings
            </button>

            <span className="text-green-800">|</span>

            <div className="flex items-center gap-2">
              <div className="w-24 bg-green-950 rounded-full h-1.5">
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

      {/* Modal de Briefings */}
      {showBriefings && <BriefingSlides onClose={() => setShowBriefings(false)} />}

      {/* Modal de Riscos */}
      {showRisks && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 no-print">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto relative animate-fade-in">
            <button
              onClick={() => setShowRisks(false)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-400 bg-red-950/30 border border-red-900/30 p-1.5 rounded cursor-pointer z-10"
            >
              <X size={16} />
            </button>
            <RiskManager />
          </div>
        </div>
      )}
    </div>
  )
}

function Dashboard({ onStart }: { onStart: () => void }) {
  const { state } = usePPCOT()
  const phaseKeys = ['fase01','fase02','fase03','fase04','fase05','fase06'] as const

  const phases = [
    { num: 1, label: 'Análise da Missão', desc: 'Extração 5W · Tarefas Impostas/Deduzidas · OA-1', key: 'fase01' as const },
    { num: 2, label: 'Situação e Compreensão', desc: 'DICOVAP · OCOAV · PITCIC (Mapa Tático) · Estimativas S2-S5', key: 'fase02' as const },
    { num: 3, label: 'Linhas de Ação', desc: 'Formulações L Aç · Prova APA · Matriz Sincronização Dinâmica', key: 'fase03' as const },
    { num: 4, label: 'Comparação das LA', desc: 'Matriz de Decisão · Ponderação Critérios · Prova Final APA', key: 'fase04' as const },
    { num: 5, label: 'Decisão do Comandante', desc: 'DIPLAN Atualizada · Escolha da L Aç · OA-4', key: 'fase05' as const },
    { num: 6, label: 'Ordem de Operações', desc: 'Geração O Op · Emissão Documentos · Dossiê de Impressão', key: 'fase06' as const },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-military-gold font-bold text-3xl mb-2 tracking-widest font-title">PPCOT — PLANEJAMENTO MILITAR AUTOMATIZADO</h1>
        <p className="text-green-400 text-sm font-medium">Exame de Situação do Comandante · EB70-MC-10.211 · 2ª Edição 2020</p>
        <p className="text-green-600 text-xs mt-1">Solução integrada com Inteligência Artificial para assessoramento de Estado-Maior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {phases.map(p => {
          const status = state[p.key].status
          return (
            <div key={p.num} className="bg-card-bg/60 backdrop-blur-md border border-military-green rounded-xl p-5 hover:border-military-gold transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-military-gold font-bold text-xl font-title">0{p.num}</span>
                  {status === 'completed' ? <CheckCircle size={15} className="text-green-400" />
                    : status === 'in_progress' ? <Clock size={15} className="text-military-gold animate-pulse-gold" />
                    : <Circle size={15} className="text-green-800" />}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  status === 'completed' ? 'bg-green-950 text-green-400 border border-green-700'
                  : status === 'in_progress' ? 'bg-yellow-950 text-yellow-400 border border-yellow-700'
                  : 'bg-gray-800/40 text-gray-500 border border-gray-800'
                }`}>
                  {status === 'completed' ? 'Concluída' : status === 'in_progress' ? 'Em progresso' : 'Pendente'}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{p.label}</h3>
              <p className="text-green-600 text-xs leading-normal">{p.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="text-center bg-military-green/10 border border-military-green rounded-xl p-6 mb-4">
        <h4 className="text-military-gold font-bold text-xs uppercase tracking-wider mb-2">Instruções de Inicialização</h4>
        <p className="text-gray-300 text-xs leading-relaxed max-w-2xl mx-auto">
          O planejamento segue o rigor científico do manual doutrinário militar. Todos os dados inseridos são persistidos localmente em seu navegador. Clique no botão abaixo para dar início ao processo de inteligência e manobra.
        </p>
      </div>

      <div className="text-center mt-6">
        <button onClick={onStart} className="btn-primary text-sm px-10 py-3.5 cursor-pointer">
          Iniciar Planejamento Operacional →
        </button>
        <p className="text-green-700 text-[10px] mt-3">
          Desenvolvido em conformidade com as diretrizes do Estado-Maior do Exército.
        </p>
      </div>
    </div>
  )
}
