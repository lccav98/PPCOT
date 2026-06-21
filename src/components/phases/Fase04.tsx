'use client'
import React, { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { Plus, Trash2, CheckCircle, Star, Award, Brain, Loader } from 'lucide-react'
import { CriterioAvaliacao } from '@/lib/types'

const DEFAULT_CRITERIOS: CriterioAvaliacao[] = [
  { id: '1', nome: 'Simplicidade', peso: 2 },
  { id: '2', nome: 'Manobra', peso: 3 },
  { id: '3', nome: 'Fogos', peso: 2 },
  { id: '4', nome: 'Surpresa', peso: 2 },
  { id: '5', nome: 'Suporte Logístico', peso: 3 },
  { id: '6', nome: 'Danos Colaterais Reduzidos', peso: 1 },
]

export default function Fase04() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase04
  const las = state.fase03.linhasAcao

  const [loadingCompare, setLoadingCompare] = useState(false)
  const [error, setError] = useState('')
  const [selectedCell, setSelectedCell] = useState<{ laId: string; criterioId: string } | null>(null)

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE04', payload })

  const initCriterios = () => {
    if (f.criterios.length === 0) upd({ criterios: DEFAULT_CRITERIOS })
  }

  const addCriterio = () => {
    const novo: CriterioAvaliacao = { id: Date.now().toString(), nome: '', peso: 1 }
    upd({ criterios: [...f.criterios, novo] })
  }

  const updCriterio = (id: string, field: keyof CriterioAvaliacao, val: any) =>
    upd({ criterios: f.criterios.map(c => c.id === id ? { ...c, [field]: val } : c) })

  const getPontos = (laId: string, criterioId: string): number => {
    const p = f.pontuacoes.find(p => p.laId === laId && p.criterioId === criterioId)
    return p?.pontos ?? 0
  }

  const setPontos = (laId: string, criterioId: string, pontos: number) => {
    const existing = f.pontuacoes.filter(p => !(p.laId === laId && p.criterioId === criterioId))
    upd({ pontuacoes: [...existing, { laId, criterioId, pontos }] })
  }

  const getTotal = (laId: string): number =>
    f.criterios.reduce((sum, c) => sum + getPontos(laId, c.id) * c.peso, 0)

  const getMaxTotal = (): number =>
    f.criterios.reduce((sum, c) => sum + 5 * c.peso, 0)

  const setAPAFinal = (laId: string, criteria: 'adequabilidade' | 'praticabilidade' | 'aceitabilidade', val: boolean) => {
    const existing = f.apaFinalLA || {}
    const laAPA = existing[laId] || { adequabilidade: false, praticabilidade: false, aceitabilidade: false }
    upd({
      apaFinalLA: {
        ...existing,
        [laId]: {
          ...laAPA,
          [criteria]: val
        }
      }
    })
  }

  const evaluateMatrixWithIA = async () => {
    setLoadingCompare(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'compare',
          content: {
            linhasAcao: las.map(la => ({
              id: la.id,
              numero: la.numero,
              oQue: la.oQue,
              como: la.como,
              onde: la.onde,
              paraQue: la.paraQue,
              quando: la.quando,
              faseamento: la.faseamento,
              sumario: la.sumario
            })),
            criterios: f.criterios.map(c => ({
              id: c.id,
              nome: c.nome,
              peso: c.peso
            }))
          }
        }),
      })
      const json = await res.json()
      if (json.success && json.data.pontuacoes) {
        const newPontuacoes: typeof f.pontuacoes = []
        const newJustificativas: Record<string, string> = {}

        json.data.pontuacoes.forEach((item: any) => {
          newPontuacoes.push({
            laId: item.laId,
            criterioId: item.criterioId,
            pontos: Number(item.pontos)
          })
          const cellKey = `${item.laId}_${item.criterioId}`
          newJustificativas[cellKey] = item.justificativa || ''
        })

        upd({
          pontuacoes: newPontuacoes,
          justificativas: newJustificativas
        })
      } else {
        setError(json.error || 'Erro ao avaliar com a IA. Verifique a chave de API.')
      }
    } catch {
      setError('Falha na conexão com a IA para comparação.')
    }
    setLoadingCompare(false)
  }

  const ranking = [...las].sort((a, b) => getTotal(b.id) - getTotal(a.id))

  const setRecomendada = (laId: string) => upd({ laRecomendada: laId })

  if (f.criterios.length === 0 && las.length > 0) {
    setTimeout(initCriterios, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 04 — Comparação das Linhas de Ação</h2>
          <p className="text-green-500 text-xs mt-1">Matriz de Decisão · APA Final · §4.3.7 PPCOT</p>
        </div>
      </div>

      {las.length === 0 && (
        <div className="bg-card-bg rounded-lg p-8 border border-military-green text-center">
          <p className="text-green-600">Nenhuma L Aç cadastrada. Complete a Fase 03 primeiro.</p>
        </div>
      )}

      {las.length > 0 && (
        <>
          {/* Critérios */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green">
            <div className="flex justify-between items-center mb-3">
              <label className="section-title">Critérios de Avaliação</label>
              <button onClick={addCriterio} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer"><Plus size={12}/> Adicionar</button>
            </div>
            <div className="space-y-2">
              {f.criterios.map(c => (
                <div key={c.id} className="flex gap-2 items-center">
                  <input className="input-field flex-1 text-xs" value={c.nome} onChange={e => updCriterio(c.id, 'nome', e.target.value)} placeholder="Nome do critério..." />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-green-500 text-xs">Peso:</span>
                    <select className="input-field w-16 text-xs" value={c.peso} onChange={e => updCriterio(c.id, 'peso', Number(e.target.value))}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button onClick={() => upd({ criterios: f.criterios.filter(x => x.id !== c.id) })} className="text-red-600 cursor-pointer"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Matriz de Decisão */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green overflow-x-auto space-y-3">
            <div className="flex justify-between items-center">
              <label className="section-title mb-0">Matriz de Decisão (Pontuação 0–5)</label>
              <button
                onClick={evaluateMatrixWithIA}
                disabled={loadingCompare}
                className="btn-secondary text-xs flex items-center gap-1 cursor-pointer"
              >
                {loadingCompare ? <Loader size={12} className="animate-spin" /> : <Brain size={12} />}
                {loadingCompare ? 'Avaliando com IA...' : '✨ Avaliar Matriz com IA'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="text-left text-green-500 py-2 pr-4 font-medium">Critério</th>
                  <th className="text-center text-green-500 py-2 px-2 font-medium">Peso</th>
                  {las.map(la => (
                    <th key={la.id} className="text-center text-military-gold py-2 px-3 font-medium">L Aç {la.numero}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.criterios.map(c => (
                  <tr key={c.id} className="border-b border-green-900/50">
                    <td className="text-green-300 py-2 pr-4">{c.nome || '—'}</td>
                    <td className="text-center text-military-gold py-2 px-2">{c.peso}</td>
                    {las.map(la => {
                      const pts = getPontos(la.id, c.id)
                      const total = pts * c.peso
                      const isSelected = selectedCell?.laId === la.id && selectedCell?.criterioId === c.id
                      return (
                        <td
                          key={la.id}
                          className={`text-center py-2 px-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-military-green/40 border border-military-gold' : 'hover:bg-military-green/10'
                          }`}
                          onClick={() => setSelectedCell({ laId: la.id, criterioId: c.id })}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <select
                              className="bg-dark-bg border border-green-800 rounded px-1 py-0.5 text-green-200 w-14 text-center cursor-pointer"
                              value={pts}
                              onChange={e => {
                                setPontos(la.id, c.id, Number(e.target.value))
                                setSelectedCell({ laId: la.id, criterioId: c.id })
                              }}
                            >
                              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="text-green-600 text-xs">={total}</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-military-green/30">
                  <td colSpan={2} className="text-military-gold font-bold py-2 pr-4">TOTAL (max: {getMaxTotal()})</td>
                  {las.map(la => (
                    <td key={la.id} className="text-center py-2 px-3">
                      <span className="text-military-gold font-bold text-sm">{getTotal(la.id)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Painel de Justificativa da Célula */}
          {selectedCell && (() => {
            const la = las.find(l => l.id === selectedCell.laId)
            const crit = f.criterios.find(c => c.id === selectedCell.criterioId)
            if (!la || !crit) return null

            const cellKey = `${selectedCell.laId}_${selectedCell.criterioId}`
            const justificationText = f.justificativas?.[cellKey] || ''

            const setJustificationText = (txt: string) => {
              const prev = f.justificativas || {}
              upd({ justificativas: { ...prev, [cellKey]: txt } })
            }

            return (
              <div className="bg-card-bg border border-military-gold rounded-lg p-4 animate-fade-in space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-military-gold font-bold text-xs uppercase tracking-wider">
                    Fundamentação da Nota — L Aç {la.numero} vs. {crit.nome}
                  </h4>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="text-green-500 hover:text-green-400 text-xs cursor-pointer"
                  >
                    Fechar Painel
                  </button>
                </div>
                <div className="text-xs text-green-400 space-y-2">
                  <p>
                    <span className="font-semibold text-white">Linha de Ação {la.numero}:</span> {la.sumario || la.oQue}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Critério:</span> {crit.nome} (Peso: {crit.peso})
                  </p>
                </div>
                <div>
                  <label className="text-green-500 text-xs mb-1 block">Justificativa Tática e Objetiva (Para apoiar a tomada de decisão)</label>
                  <textarea
                    className="textarea-field h-20 text-xs font-mono"
                    value={justificationText}
                    onChange={e => setJustificationText(e.target.value)}
                    placeholder="Escreva a justificativa tática para a nota desta célula, justificando por que esta linha de ação obteve a pontuação correspondente..."
                  />
                </div>
              </div>
            )
          })()}

          {/* Prova Final de APA */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green space-y-3">
            <div className="flex items-center gap-1.5 border-b border-green-950 pb-2">
              <Award className="text-military-gold" size={16} />
              <label className="section-title block mb-0">Prova Final de APA (Adequabilidade, Praticabilidade, Aceitabilidade)</label>
            </div>
            <div className="space-y-3 text-xs">
              {las.map(la => {
                const apa = f.apaFinalLA?.[la.id] || { adequabilidade: false, praticabilidade: false, aceitabilidade: false }
                const isPass = apa.adequabilidade && apa.praticabilidade && apa.aceitabilidade
                return (
                  <div key={la.id} className="border border-green-900/60 p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-black/20">
                    <div>
                      <span className="text-white font-bold text-sm">L Aç {la.numero}</span>
                      <p className="text-green-600 text-[10px] truncate max-w-sm mt-0.5">{la.sumario || la.oQue || 'Sem sumário'}</p>
                    </div>
                    <div className="flex gap-4">
                      {[
                        { key: 'adequabilidade' as const, label: 'Adequabilidade' },
                        { key: 'praticabilidade' as const, label: 'Praticabilidade' },
                        { key: 'aceitabilidade' as const, label: 'Aceitabilidade' }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                          <input
                            type="checkbox"
                            checked={apa[item.key]}
                            onChange={e => setAPAFinal(la.id, item.key, e.target.checked)}
                            className="accent-yellow-500 rounded cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isPass ? 'bg-green-950 text-green-400 border-green-700' : 'bg-red-950/20 text-red-500 border-red-950'
                    }`}>
                      {isPass ? 'Aprovada' : 'Reprovada / Incompleta'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green">
            <label className="section-title">Ranking e Recomendação</label>
            <div className="space-y-2">
              {ranking.map((la, i) => {
                const total = getTotal(la.id)
                const pct = getMaxTotal() > 0 ? (total / getMaxTotal()) * 100 : 0
                const isRec = f.laRecomendada === la.id
                return (
                  <div key={la.id} className={`flex items-center gap-3 p-3 rounded border transition-all ${isRec ? 'border-military-gold bg-military-green/30' : 'border-green-900'}`}>
                    <span className={`font-bold text-sm w-6 ${i === 0 ? 'text-military-gold' : 'text-green-600'}`}>{i + 1}º</span>
                    <span className="text-green-200 flex-1 text-sm">L Aç {la.numero} — {la.sumario.substring(0, 70) || la.oQue.substring(0, 70) || 'Sem sumário'}</span>
                    <div className="w-40 bg-green-950 rounded-full h-3.5 relative overflow-hidden border border-green-950 flex-shrink-0 hidden sm:block">
                      <div className="bg-gradient-to-r from-military-green to-military-gold h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{Math.round(pct)}%</span>
                    </div>
                    <span className="text-military-gold text-sm font-bold w-10 text-right">{total} pts</span>
                    <button onClick={() => setRecomendada(la.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${isRec ? 'bg-military-gold text-military-green border-military-gold font-bold' : 'border-green-700 text-green-500 hover:border-military-gold'}`}>
                      <Star size={12}/> {isRec ? 'Recomendada' : 'Recomendar'}
                    </button>
                  </div>
                )
              })}
            </div>
            {f.laRecomendada && (
              <div className="mt-3">
                <label className="text-green-500 text-xs mb-1 block">Justificativa da Recomendação</label>
                <textarea className="textarea-field h-16" value={f.justificativa}
                  onChange={e => upd({ justificativa: e.target.value })}
                  placeholder="Fundamentos para a recomendação da L Aç ao Comandante..." />
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button onClick={() => { upd({ status: 'completed' }); dispatch({ type: 'SET_PHASE', payload: 5 }); if (state.fase05.status === 'pending') dispatch({ type: 'UPDATE_FASE05', payload: { status: 'in_progress' } }) }}
          className="btn-primary flex items-center gap-2 cursor-pointer">
          <CheckCircle size={16} /> Concluir Fase 04 → Fase 05
        </button>
      </div>
    </div>
  )
}
