'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Brain, Loader, Printer, Download } from 'lucide-react'

export default function Fase06() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase06
  const [loading, setLoading] = useState(false)

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE06', payload })

  const generateOrder = async () => {
    const laId = state.fase05.laEscolhida
    const la = state.fase03.linhasAcao.find(l => l.id === laId)
    if (!la && !state.fase05.intencaoAtualizada) { alert('Complete a Fase 05 (Decisão) antes de gerar a ordem.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'orop',
          content: {
            mission: state.fase01.newMissionStatement,
            laAprovada: la ? `${la.oQue} / ${la.como} / ${la.faseamento}` : state.fase05.laEscolhida,
            intencao: state.fase05.intencaoAtualizada,
            meios: state.fase02.meiosDisponiveis,
          }
        }),
      })
      const json = await res.json()
      if (json.success) upd({ ...json.data, status: 'in_progress' })
    } catch { }
    setLoading(false)
  }

  const autoFill = () => {
    const la = state.fase03.linhasAcao.find(l => l.id === state.fase05.laEscolhida)
    upd({
      missao: state.fase01.newMissionStatement || state.fase01.what,
      intencaoCmt: state.fase05.intencaoAtualizada || state.fase01.initialIntent,
      inimigo: `Dispositivo: ${state.fase02.dicovap.dispositivo}\nComposição: ${state.fase02.dicovap.composicao}\nValor: ${state.fase02.dicovap.valor}`,
      forcasAmigas: state.fase02.meiosDisponiveis,
      conceitoOperacao: la ? `Fase 1: ${la.faseamento?.split('/')[0] || la.oQue}\n\nEsquema de Manobra: ${la.como}` : '',
      status: 'in_progress'
    })
  }

  const handlePrint = () => window.print()

  const sections = [
    { key: 'classificacao', label: '🔒 Classificação', ph: 'RESERVADO / CONFIDENCIAL / SECRETO' },
    { key: 'numero', label: 'Número da Ordem', ph: 'OOp Nº 001-CmdoOp' },
    { key: 'referencias', label: 'Referências', ph: 'Cartas, documentos e planos de referência...' },
    { key: 'inimigo', label: '1a. Inimigo', ph: 'Situação do inimigo...' },
    { key: 'forcasAmigas', label: '1b. Forças Amigas', ph: 'Situação das forças amigas e de apoio...' },
    { key: 'missao', label: '2. Missão', ph: 'Missão completa...' },
    { key: 'intencaoCmt', label: '3a. Intenção do Comandante', ph: 'Finalidade / Método / Estado Final Desejado...' },
    { key: 'conceitoOperacao', label: '3b. Conceito da Operação', ph: 'Visão geral das ações por fase...' },
    { key: 'tarefasSubordinados', label: '3c. Tarefas aos Subordinados', ph: 'Unidade X — Tarefa / Propósito...' },
    { key: 'instrucoesCoordenacao', label: '3d. Instruções de Coordenação', ph: 'Medidas de controle, horários críticos, ROE...' },
    { key: 'apoioLogistico', label: '4. Apoio de Serviço ao Combate', ph: 'Logística, reabastecimento, evacuação...' },
    { key: 'comando', label: '5a. Comando', ph: 'PC, subcomandante, linha de sucessão...' },
    { key: 'comunicacoes', label: '5b. Comunicações', ph: 'Redes, frequências, plano de comunicações...' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 06 — Emissão de Planos e Ordens</h2>
          <p className="text-green-500 text-xs mt-1">Ordem de Operações · §4.3.9 PPCOT</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={autoFill} className="btn-secondary text-xs flex items-center gap-1">
            ✨ Preencher dos dados
          </button>
          <button onClick={generateOrder} disabled={loading} className="btn-secondary text-xs flex items-center gap-1">
            {loading ? <Loader size={12} className="animate-spin"/> : <Brain size={12}/>}
            {loading ? 'Gerando...' : 'Gerar com IA'}
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs flex items-center gap-1">
            <Printer size={12}/> Imprimir
          </button>
        </div>
      </div>

      {/* Ordem de Operações */}
      <div className="bg-card-bg rounded-lg border border-military-green overflow-hidden print-section">
        {/* Header da OOp */}
        <div className="bg-military-green p-4 text-center border-b border-military-gold print-section">
          <p className="text-military-gold font-bold text-xs tracking-widest uppercase">
            {f.classificacao || 'RESERVADO'}
          </p>
          <p className="text-white font-bold text-sm mt-1">EXÉRCITO BRASILEIRO</p>
          <p className="text-green-300 text-xs">{state.operationName.toUpperCase()} — {f.numero || 'OOp Nº ___'}</p>
        </div>

        <div className="p-4 space-y-4">
          {sections.map(({ key, label, ph }) => (
            <div key={key} className="border-b border-green-900/50 pb-3">
              <label className="text-military-gold text-xs font-bold uppercase tracking-wider block mb-1">{label}</label>
              <textarea
                className="textarea-field text-xs h-16"
                value={(f as any)[key]}
                onChange={e => upd({ [key]: e.target.value } as any)}
                placeholder={ph}
              />
            </div>
          ))}
        </div>

        <div className="p-4 bg-military-green/20 border-t border-military-gold text-center">
          <p className="text-military-gold text-xs font-bold tracking-widest">
            {f.classificacao || 'RESERVADO'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => upd({ status: 'completed' })} className="btn-primary flex items-center gap-2">
          <CheckCircle size={16} /> Finalizar Planejamento
        </button>
      </div>
    </div>
  )
}
