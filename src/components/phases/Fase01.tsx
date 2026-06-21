'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { Brain, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle, Loader } from 'lucide-react'

export default function Fase01() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase01
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEEI, setShowEEI] = useState(true)

  const upd = (payload: Partial<typeof f>) =>
    dispatch({ type: 'UPDATE_FASE01', payload })

  const analyzeMission = async () => {
    if (!f.rawOrder.trim()) { setError('Cole o texto da ordem antes de analisar.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'mission', content: f.rawOrder }),
      })
      const json = await res.json()
      if (json.success) {
        upd({ ...json.data, status: 'in_progress' })
      } else { setError('Erro na análise. Verifique a chave de API.') }
    } catch { setError('Falha na conexão com a IA.') }
    setLoading(false)
  }

  const addTask = (field: 'assignedTasks' | 'impliedTasks' | 'restrictions') =>
    upd({ [field]: [...f[field], ''] })

  const updateTask = (field: 'assignedTasks' | 'impliedTasks' | 'restrictions', i: number, val: string) => {
    const arr = [...f[field]]; arr[i] = val; upd({ [field]: arr })
  }

  const removeTask = (field: 'assignedTasks' | 'impliedTasks' | 'restrictions', i: number) => {
    upd({ [field]: f[field].filter((_, idx) => idx !== i) })
  }

  const completePhase = () => {
    upd({ status: 'completed' })
    dispatch({ type: 'SET_PHASE', payload: 2 })
    if (state.fase02.status === 'pending') dispatch({ type: 'UPDATE_FASE02', payload: { status: 'in_progress' } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 01 — Análise da Missão</h2>
          <p className="text-green-500 text-xs mt-1">Considerações Preliminares · §4.3.4 PPCOT</p>
        </div>
        {f.status === 'completed' && (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircle size={16} /> Concluída
          </span>
        )}
      </div>

      {/* Texto da Ordem */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Texto da Ordem Recebida</label>
        <textarea
          className="textarea-field h-32"
          placeholder="Cole aqui o texto completo da ordem do escalão superior (O Op, DIPLAN, CPO ou ordem verbal)..."
          value={f.rawOrder}
          onChange={e => upd({ rawOrder: e.target.value })}
        />
        <div className="flex items-center gap-3 mt-3">
          <button onClick={analyzeMission} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
            {loading ? 'Analisando...' : 'Analisar com IA'}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </div>

      {/* Extração 5W */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Elementos da Missão (5W)</label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'who', label: 'QUEM — Força que executa' },
            { key: 'what', label: 'O QUÊ — Tarefa principal' },
            { key: 'when', label: 'QUANDO — Momento de execução' },
            { key: 'where', label: 'ONDE — Área de operações' },
            { key: 'why', label: 'PARA QUÊ — Finalidade da operação' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-green-500 text-xs mb-1 block">{label}</label>
              <input className="input-field" value={(f as any)[key]} onChange={e => upd({ [key]: e.target.value } as any)} placeholder={`Informe ${label.split('—')[0].trim()}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { field: 'assignedTasks' as const, label: 'Tarefas Impostas', color: 'text-blue-400' },
          { field: 'impliedTasks' as const, label: 'Tarefas Deduzidas', color: 'text-yellow-400' },
          { field: 'restrictions' as const, label: 'Restrições', color: 'text-red-400' },
        ]).map(({ field, label, color }) => (
          <div key={field} className="bg-card-bg rounded-lg p-4 border border-military-green">
            <div className="flex justify-between items-center mb-3">
              <label className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</label>
              <button onClick={() => addTask(field)} className="text-military-gold hover:text-military-gold-light">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {f[field].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input-field text-xs" value={item} onChange={e => updateTask(field, i, e.target.value)} placeholder={`${label} ${i + 1}`} />
                  <button onClick={() => removeTask(field, i)} className="text-red-600 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {f[field].length === 0 && <p className="text-green-700 text-xs italic">Nenhuma. Use + ou analise com IA.</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Produtos da Fase */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Produtos da Fase 01</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-green-500 text-xs mb-1 block">Novo Enunciado da Missão</label>
            <textarea className="textarea-field h-20" value={f.newMissionStatement} onChange={e => upd({ newMissionStatement: e.target.value })} placeholder="QUEM faz O QUÊ, QUANDO, ONDE e PARA QUÊ..." />
          </div>
          <div>
            <label className="text-green-500 text-xs mb-1 block">Intenção Inicial do Comandante</label>
            <textarea className="textarea-field h-20" value={f.initialIntent} onChange={e => upd({ initialIntent: e.target.value })} placeholder="Finalidade e estado final desejado..." />
          </div>
          <div>
            <label className="text-green-500 text-xs mb-1 block">Plano Inicial de Utilização do Tempo</label>
            <textarea className="textarea-field h-20" value={f.timePlan} onChange={e => upd({ timePlan: e.target.value })} placeholder="H-xx: Início do Plj / H-yy: Emissão das OA / H+0: Execução..." />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-green-500 text-xs">Elementos Essenciais de Inteligência (EEI)</label>
              <button onClick={() => setShowEEI(!showEEI)} className="text-green-600">{showEEI ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
            </div>
            {showEEI && (
              <div className="space-y-1">
                {f.eeiList.map((eei, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input-field text-xs" value={eei}
                      onChange={e => { const arr = [...f.eeiList]; arr[i] = e.target.value; upd({ eeiList: arr }) }}
                      placeholder={`EEI ${i + 1}`} />
                    <button onClick={() => upd({ eeiList: f.eeiList.filter((_, idx) => idx !== i) })} className="text-red-600"><Trash2 size={13}/></button>
                  </div>
                ))}
                <button onClick={() => upd({ eeiList: [...f.eeiList, ''] })} className="text-military-gold text-xs flex items-center gap-1 mt-1"><Plus size={12}/> Adicionar EEI</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={completePhase} className="btn-primary flex items-center gap-2">
          <CheckCircle size={16} /> Concluir Fase 01 → Fase 02
        </button>
      </div>
    </div>
  )
}
