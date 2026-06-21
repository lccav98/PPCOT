'use client'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Plus, Trash2 } from 'lucide-react'

export default function Fase05() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase05
  const las = state.fase03.linhasAcao
  const laRec = state.fase04.laRecomendada

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE05', payload })

  const selectedLA = las.find(la => la.id === f.laEscolhida)

  const autoFillDiplan = () => {
    if (!selectedLA) return
    const diplan = `DIPLAN Nº ___

1. SITUAÇÃO: ${state.fase01.newMissionStatement || state.fase01.what}

2. INTENÇÃO DO COMANDANTE: ${f.intencaoAtualizada || state.fase01.initialIntent}

3. ABORDAGEM OPERATIVA:
   - O QUÊ: ${selectedLA.oQue}
   - COMO: ${selectedLA.como}
   - ONDE: ${selectedLA.onde}
   - PARA QUÊ: ${selectedLA.paraQue}
   - QUANDO: ${selectedLA.quando}

4. MODIFICAÇÕES DO COMANDANTE: ${f.modificacoes || 'Nenhuma modificação.'}

5. ORIENTAÇÕES PARA O EM: Proceder à elaboração dos planos e ordens conforme a L Aç aprovada.`
    upd({ diplanAtualizada: diplan })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-military-gold font-bold text-lg">Fase 05 — Decisão do Comandante</h2>
        <p className="text-green-500 text-xs mt-1">Escolha da L Aç · DIPLAN Atualizada · §4.3.8 PPCOT</p>
      </div>

      {/* Aviso doutrinário */}
      <div className="border border-yellow-700 bg-yellow-900/20 rounded-lg p-3">
        <p className="text-yellow-400 text-xs">
          ⚔️ <strong>Reserva do Comandante:</strong> A decisão é ato de autoridade exclusiva do Comandante. Esta plataforma apresenta a recomendação do EM, mas a escolha final cabe ao Cmt (§4.3.8.1 PPCOT).
        </p>
      </div>

      {/* Recomendação do EM */}
      {laRec && (
        <div className="bg-military-green/20 border border-military-gold rounded-lg p-4">
          <p className="text-military-gold text-xs font-bold uppercase tracking-wider mb-1">Recomendação do EM</p>
          <p className="text-white text-sm">L Aç {las.find(la => la.id === laRec)?.numero} — {las.find(la => la.id === laRec)?.sumario?.substring(0, 100) || ''}</p>
          <p className="text-green-400 text-xs mt-1">{state.fase04.justificativa?.substring(0, 150)}</p>
        </div>
      )}

      {/* Seleção da LA */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Linha de Ação Escolhida pelo Comandante</label>
        <div className="space-y-2">
          {las.map(la => (
            <label key={la.id} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${f.laEscolhida === la.id ? 'border-military-gold bg-military-green/30' : 'border-green-900 hover:border-green-700'}`}>
              <input type="radio" name="la" value={la.id} checked={f.laEscolhida === la.id} onChange={() => upd({ laEscolhida: la.id })} className="mt-0.5 accent-yellow-500" />
              <div>
                <p className="text-white text-sm font-medium">L Aç {la.numero} {la.id === laRec ? '⭐ (Recomendada)' : ''}</p>
                <p className="text-green-400 text-xs mt-0.5">{la.sumario || la.oQue}</p>
              </div>
            </label>
          ))}
          {las.length === 0 && <p className="text-green-700 text-xs italic">Nenhuma L Aç disponível. Complete a Fase 03.</p>}
        </div>
      </div>

      {/* Modificações e Intenção */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Intenção e Modificações</label>
        <div className="space-y-3">
          <div>
            <label className="text-green-500 text-xs mb-1 block">Intenção Atualizada do Comandante</label>
            <textarea className="textarea-field h-20"
              value={f.intencaoAtualizada}
              onChange={e => upd({ intencaoAtualizada: e.target.value })}
              placeholder="Finalidade: ... / Método: ... / Estado Final Desejado: ..." />
          </div>
          <div>
            <label className="text-green-500 text-xs mb-1 block">Modificações à L Aç Escolhida</label>
            <textarea className="textarea-field h-20"
              value={f.modificacoes}
              onChange={e => upd({ modificacoes: e.target.value })}
              placeholder="Descreva quaisquer modificações do Cmt à L Aç selecionada..." />
          </div>
        </div>
      </div>

      {/* DIPLAN Atualizada */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <div className="flex justify-between items-center mb-3">
          <label className="section-title">DIPLAN Atualizada</label>
          <button onClick={autoFillDiplan} className="btn-secondary text-xs">✨ Preencher automaticamente</button>
        </div>
        <textarea className="textarea-field h-40" value={f.diplanAtualizada}
          onChange={e => upd({ diplanAtualizada: e.target.value })}
          placeholder="Diretriz de Planejamento do Comandante atualizada..." />
      </div>

      {/* EEI Atualizados */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <div className="flex justify-between items-center mb-3">
          <label className="section-title">EEI Atualizados</label>
          <button onClick={() => upd({ eeiAtualizados: [...f.eeiAtualizados, ''] })} className="text-military-gold"><Plus size={14}/></button>
        </div>
        {f.eeiAtualizados.length === 0 && state.fase01.eeiList.length > 0 && (
          <button onClick={() => upd({ eeiAtualizados: [...state.fase01.eeiList] })} className="text-xs text-military-gold hover:underline mb-2 block">
            ↑ Importar EEI da Fase 01
          </button>
        )}
        {f.eeiAtualizados.map((eei, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="input-field text-xs" value={eei}
              onChange={e => { const arr = [...f.eeiAtualizados]; arr[i] = e.target.value; upd({ eeiAtualizados: arr }) }}
              placeholder={`EEI ${i + 1}`} />
            <button onClick={() => upd({ eeiAtualizados: f.eeiAtualizados.filter((_, j) => j !== i) })} className="text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => { upd({ status: 'completed' }); dispatch({ type: 'SET_PHASE', payload: 6 }); if (state.fase06.status === 'pending') dispatch({ type: 'UPDATE_FASE06', payload: { status: 'in_progress' } }) }}
          className="btn-primary flex items-center gap-2">
          <CheckCircle size={16} /> Confirmar Decisão → Fase 06
        </button>
      </div>
    </div>
  )
}
