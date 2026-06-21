'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { Plus, Trash2, CheckCircle, Brain, Loader } from 'lucide-react'
import { LinhaDeAcao, PsbIni } from '@/lib/types'

export default function Fase03() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase03
  const [loading, setLoading] = useState(false)
  const [activeLA, setActiveLA] = useState(0)

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE03', payload })

  const addLA = () => {
    const newLA: LinhaDeAcao = {
      id: Date.now().toString(), numero: f.linhasAcao.length + 1,
      oQue: '', como: '', onde: '', paraQue: '', quando: '', faseamento: '', sumario: '',
      apaAdequabilidade: null, apaPraticabilidade: null, apaAceitabilidade: null, esquemaManobra: ''
    }
    upd({ linhasAcao: [...f.linhasAcao, newLA] })
    setActiveLA(f.linhasAcao.length)
  }

  const updLA = (id: string, field: keyof LinhaDeAcao, val: any) =>
    upd({ linhasAcao: f.linhasAcao.map(la => la.id === id ? { ...la, [field]: val } : la) })

  const addPsb = () => {
    const newPsb: PsbIni = { id: Date.now().toString(), descricao: '', probabilidade: 'media', impacto: '' }
    upd({ psbIni: [...f.psbIni, newPsb] })
  }

  const suggestLA = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'la',
          content: {
            mission: state.fase01.newMissionStatement || state.fase01.what,
            situation: `Inimigo: ${state.fase02.dicovap.dispositivo}. Terreno: ${state.fase02.ocoav.viasDeAcesso}`,
            means: state.fase02.meiosDisponiveis
          }
        }),
      })
      const json = await res.json()
      if (json.success && json.data.linhasAcao) {
        const newLAs: LinhaDeAcao[] = json.data.linhasAcao.map((la: any, i: number) => ({
          id: Date.now().toString() + i, numero: f.linhasAcao.length + i + 1,
          oQue: la.oQue || '', como: la.como || '', onde: la.onde || '',
          paraQue: la.paraQue || '', quando: la.quando || '',
          faseamento: la.faseamento || '', sumario: la.sumario || '',
          apaAdequabilidade: null, apaPraticabilidade: null, apaAceitabilidade: null, esquemaManobra: ''
        }))
        upd({ linhasAcao: [...f.linhasAcao, ...newLAs] })
        setActiveLA(f.linhasAcao.length)
      }
    } catch { }
    setLoading(false)
  }

  const APAButton = ({ val, onChange, label }: { val: boolean | null; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-green-500 text-xs w-20">{label}</span>
      <button onClick={() => onChange(true)} className={`text-xs px-2 py-1 rounded ${val === true ? 'bg-green-700 text-white' : 'border border-green-800 text-green-600'}`}>✓ Sim</button>
      <button onClick={() => onChange(false)} className={`text-xs px-2 py-1 rounded ${val === false ? 'bg-red-800 text-white' : 'border border-red-900 text-red-700'}`}>✗ Não</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 03 — Possibilidades do Inimigo, Linhas de Ação e Confronto</h2>
          <p className="text-green-500 text-xs mt-1">Psb Ini · L Aç · APA Preliminar · §4.3.6 PPCOT</p>
        </div>
      </div>

      {/* Possibilidades do Inimigo */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <div className="flex justify-between items-center mb-3">
          <label className="section-title">Possibilidades do Inimigo (Psb Ini)</label>
          <button onClick={addPsb} className="btn-secondary text-xs flex items-center gap-1"><Plus size={12}/> Adicionar</button>
        </div>
        {f.psbIni.length === 0 && <p className="text-green-700 text-xs italic">Nenhuma possibilidade cadastrada.</p>}
        <div className="space-y-3">
          {f.psbIni.map((psb, i) => (
            <div key={psb.id} className="border border-green-900 rounded p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-military-gold text-xs font-bold w-6">#{i+1}</span>
                <input className="input-field text-xs flex-1" value={psb.descricao}
                  onChange={e => upd({ psbIni: f.psbIni.map(p => p.id === psb.id ? { ...p, descricao: e.target.value } : p) })}
                  placeholder="Descrição da possibilidade do inimigo..." />
                <select className="input-field w-28 text-xs"
                  value={psb.probabilidade}
                  onChange={e => upd({ psbIni: f.psbIni.map(p => p.id === psb.id ? { ...p, probabilidade: e.target.value as any } : p) })}>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
                <button onClick={() => upd({ psbIni: f.psbIni.filter(p => p.id !== psb.id) })} className="text-red-600"><Trash2 size={14}/></button>
              </div>
              <input className="input-field text-xs" value={psb.impacto}
                onChange={e => upd({ psbIni: f.psbIni.map(p => p.id === psb.id ? { ...p, impacto: e.target.value } : p) })}
                placeholder="Impacto na missão..." />
            </div>
          ))}
        </div>
      </div>

      {/* Linhas de Ação */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <div className="flex justify-between items-center mb-3">
          <label className="section-title">Linhas de Ação (L Aç)</label>
          <div className="flex gap-2">
            <button onClick={suggestLA} disabled={loading} className="btn-secondary text-xs flex items-center gap-1">
              {loading ? <Loader size={12} className="animate-spin"/> : <Brain size={12}/>}
              {loading ? 'Gerando...' : 'Sugerir com IA'}
            </button>
            <button onClick={addLA} className="btn-secondary text-xs flex items-center gap-1"><Plus size={12}/> Nova L Aç</button>
          </div>
        </div>

        {f.linhasAcao.length === 0 && <p className="text-green-700 text-xs italic text-center py-4">Nenhuma L Aç formulada. Use "Sugerir com IA" ou "Nova L Aç".</p>}

        {/* LA Tabs */}
        {f.linhasAcao.length > 0 && (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {f.linhasAcao.map((la, i) => (
                <button key={la.id} onClick={() => setActiveLA(i)}
                  className={`px-3 py-1 text-xs rounded-full border ${activeLA === i ? 'bg-military-gold text-military-green font-bold border-military-gold' : 'border-green-700 text-green-400 hover:border-military-gold'}`}>
                  L Aç {la.numero}
                </button>
              ))}
            </div>

            {f.linhasAcao[activeLA] && (() => {
              const la = f.linhasAcao[activeLA]
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: 'oQue', l: 'O QUÊ — Ação Principal' },
                      { k: 'como', l: 'COMO — Método de Execução' },
                      { k: 'onde', l: 'ONDE — Área de Operação' },
                      { k: 'paraQue', l: 'PARA QUÊ — Finalidade' },
                      { k: 'quando', l: 'QUANDO — Momento' },
                      { k: 'faseamento', l: 'Faseamento' },
                    ].map(({ k, l }) => (
                      <div key={k}>
                        <label className="text-green-500 text-xs mb-1 block">{l}</label>
                        <textarea className="textarea-field h-14" value={(la as any)[k]}
                          onChange={e => updLA(la.id, k as keyof LinhaDeAcao, e.target.value)} placeholder={l} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-green-500 text-xs mb-1 block">Sumário da L Aç</label>
                    <textarea className="textarea-field h-16" value={la.sumario}
                      onChange={e => updLA(la.id, 'sumario', e.target.value)} placeholder="Resumo completo da linha de ação..." />
                  </div>
                  {/* APA Preliminar */}
                  <div className="border border-green-800 rounded p-3">
                    <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Prova Inicial de APA</label>
                    <div className="space-y-2">
                      <APAButton val={la.apaAdequabilidade} onChange={v => updLA(la.id, 'apaAdequabilidade', v)} label="Adequabilidade" />
                      <APAButton val={la.apaPraticabilidade} onChange={v => updLA(la.id, 'apaPraticabilidade', v)} label="Praticabilidade" />
                      <APAButton val={la.apaAceitabilidade} onChange={v => updLA(la.id, 'apaAceitabilidade', v)} label="Aceitabilidade" />
                    </div>
                    {la.apaAdequabilidade === false || la.apaPraticabilidade === false || la.apaAceitabilidade === false ? (
                      <p className="text-red-400 text-xs mt-2">⚠ L Aç não passou na APA inicial — revisar ou descartar.</p>
                    ) : la.apaAdequabilidade && la.apaPraticabilidade && la.apaAceitabilidade ? (
                      <p className="text-green-400 text-xs mt-2">✓ L Aç aprovada na APA inicial — prosseguir ao confronto.</p>
                    ) : null}
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => upd({ linhasAcao: f.linhasAcao.filter(l => l.id !== la.id) })} className="text-red-600 hover:text-red-400 text-xs flex items-center gap-1">
                      <Trash2 size={12}/> Remover esta L Aç
                    </button>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>

      {/* Matriz de Sincronização */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Matriz de Sincronização (rascunho)</label>
        <textarea className="textarea-field h-28"
          value={f.matrizSincronizacao}
          onChange={e => upd({ matrizSincronizacao: e.target.value })}
          placeholder="Fase | Inimigo | Movimento | Fogos | Logística | C2&#10;Fase 1 | ... | ... | ... | ... | ...&#10;Fase 2 | ... | ... | ... | ... | ..." />
      </div>

      <div className="flex justify-end">
        <button onClick={() => { upd({ status: 'completed' }); dispatch({ type: 'SET_PHASE', payload: 4 }); if (state.fase04.status === 'pending') dispatch({ type: 'UPDATE_FASE04', payload: { status: 'in_progress' } }) }}
          className="btn-primary flex items-center gap-2">
          <CheckCircle size={16} /> Concluir Fase 03 → Fase 04
        </button>
      </div>
    </div>
  )
}
