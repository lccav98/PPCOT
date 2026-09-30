'use client'
import React, { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { Plus, Trash2, CheckCircle, Star, Award, Loader, Shield, Sparkles, HelpCircle } from 'lucide-react'
import { CriterioAvaliacao, PontuacaoItem, APAResultItem } from '@/lib/types'

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
  const selectedUnit = state.selectedUnit || 'Principal'

  const [loadingCompare, setLoadingCompare] = useState(false)
  const [error, setError] = useState('')
  const [selectedCell, setSelectedCell] = useState<{ laId: string; criterioId: string } | null>(null)

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE04', payload })

  const las = selectedUnit === 'Principal'
    ? state.fase03.linhasAcao
    : state.fase03.unitAnalyses?.[selectedUnit]?.linhasAcao || []

  // Getters
  const getCriterios = (): CriterioAvaliacao[] => {
    if (selectedUnit === 'Principal') return f.criterios || []
    return f.unitAnalyses?.[selectedUnit]?.criterios || []
  }

  const getPontuacoes = (): PontuacaoItem[] => {
    if (selectedUnit === 'Principal') return f.pontuacoes || []
    return f.unitAnalyses?.[selectedUnit]?.pontuacoes || []
  }

  const getJustificativas = (): Record<string, string> => {
    if (selectedUnit === 'Principal') return f.justificativas || {}
    return f.unitAnalyses?.[selectedUnit]?.justificativas || {}
  }

  const getAPAFinalLA = (): Record<string, APAResultItem> => {
    if (selectedUnit === 'Principal') return f.apaFinalLA || {}
    return f.unitAnalyses?.[selectedUnit]?.apaFinalLA || {}
  }

  const getLaRecomendada = (): string => {
    if (selectedUnit === 'Principal') return f.laRecomendada || ''
    return f.unitAnalyses?.[selectedUnit]?.laRecomendada || ''
  }

  const getJustificativaText = (): string => {
    if (selectedUnit === 'Principal') return f.justificativa || ''
    return f.unitAnalyses?.[selectedUnit]?.justificativa || ''
  }

  // Setters
  const setCriterios = (criterios: CriterioAvaliacao[]) => {
    if (selectedUnit === 'Principal') {
      upd({ criterios })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, criterios }
      upd({ unitAnalyses: analyses })
    }
  }

  const setPontuacoes = (pontuacoes: PontuacaoItem[]) => {
    if (selectedUnit === 'Principal') {
      upd({ pontuacoes })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, pontuacoes }
      upd({ unitAnalyses: analyses })
    }
  }

  const setJustificativas = (justificativas: Record<string, string>) => {
    if (selectedUnit === 'Principal') {
      upd({ justificativas })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, justificativas }
      upd({ unitAnalyses: analyses })
    }
  }

  const setAPAFinalLA = (apaFinalLA: Record<string, APAResultItem>) => {
    if (selectedUnit === 'Principal') {
      upd({ apaFinalLA })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, apaFinalLA }
      upd({ unitAnalyses: analyses })
    }
  }

  const setLaRecomendada = (laRecomendada: string) => {
    if (selectedUnit === 'Principal') {
      upd({ laRecomendada })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, laRecomendada }
      upd({ unitAnalyses: analyses })
    }
  }

  const setJustificativaText = (justificativa: string) => {
    if (selectedUnit === 'Principal') {
      upd({ justificativa })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '' }
      analyses[selectedUnit] = { ...current, justificativa }
      upd({ unitAnalyses: analyses })
    }
  }

  const criterios = getCriterios()
  const pontuacoes = getPontuacoes()
  const justificativas = getJustificativas()
  const apaFinalLA = getAPAFinalLA()
  const laRecomendada = getLaRecomendada()
  const justificativa = getJustificativaText()

  const initCriterios = () => {
    if (criterios.length === 0) setCriterios(DEFAULT_CRITERIOS)
  }

  const addCriterio = () => {
    const novo: CriterioAvaliacao = { id: Date.now().toString(), nome: '', peso: 1 }
    setCriterios([...criterios, novo])
  }

  const updCriterio = (id: string, field: keyof CriterioAvaliacao, val: any) =>
    setCriterios(criterios.map(c => c.id === id ? { ...c, [field]: val } : c))

  const getCellData = (laId: string, criterioId: string): PontuacaoItem | undefined => {
    return pontuacoes.find(p => p.laId === laId && p.criterioId === criterioId)
  }

  const getPontos = (laId: string, criterioId: string): number => {
    const p = getCellData(laId, criterioId)
    return p?.pontos ?? 0
  }

  const setPontos = (laId: string, criterioId: string, pontos: number) => {
    const existing = pontuacoes.filter(p => !(p.laId === laId && p.criterioId === criterioId))
    const prev = getCellData(laId, criterioId)
    setPontuacoes([...existing, {
      ...prev,
      laId,
      criterioId,
      pontos
    }])
  }

  const getTotal = (laId: string): number =>
    criterios.reduce((sum, c) => sum + getPontos(laId, c.id) * c.peso, 0)

  const getMaxTotal = (): number =>
    criterios.reduce((sum, c) => sum + 5 * c.peso, 0)

  const setAPAFinal = (laId: string, criteria: 'adequabilidade' | 'praticabilidade' | 'aceitabilidade', val: boolean) => {
    const existing = apaFinalLA
    const laAPA = existing[laId] || { adequabilidade: false, praticabilidade: false, aceitabilidade: false }
    setAPAFinalLA({
      ...existing,
      [laId]: {
        ...laAPA,
        [criteria]: val
      }
    })
  }

  const evaluateMatrixWithJev = async () => {
    setLoadingCompare(true)
    setError('')
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUnit: selectedUnit,
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
          criterios: criterios.map(c => ({
            id: c.id,
            nome: c.nome,
            peso: c.peso
          })),
          context: {
            mission: selectedUnit === 'Principal'
              ? (state.fase01.newMissionStatement || state.fase01.what)
              : (state.fase01.unitAnalyses?.[selectedUnit]?.newMissionStatement || state.fase01.unitAnalyses?.[selectedUnit]?.what || state.fase01.newMissionStatement),
            intent: state.fase01.initialIntent,
            dicovap: state.fase02.dicovap,
            ocoav: state.fase02.ocoav,
            means: state.fase02.meiosDisponiveis,
            subordinateEchelons: state.fase01.subordinateEchelons || [],
            visibilidade: state.fase02.visibilidade,
            vento: state.fase02.vento,
            areas: state.fase02.areas
          }
        }),
      })

      const json = await res.json()
      if (json.success && json.pontuacoes) {
        setPontuacoes(json.pontuacoes)
        if (json.justificativas) setJustificativas(json.justificativas)
        if (json.apaFinalLA) setAPAFinalLA(json.apaFinalLA)
        if (json.laRecomendada) setLaRecomendada(json.laRecomendada)
        if (json.justificativaRecomendacao) setJustificativaText(json.justificativaRecomendacao)
      } else {
        setError(json.error || 'Erro ao avaliar com o motor JEV. Verifique a chave TYPESAFE_API_KEY no arquivo .env.local.')
      }
    } catch {
      setError('Falha na conexão com o motor de tomada de decisão JEV.')
    }
    setLoadingCompare(false)
  }

  const ranking = [...las].sort((a, b) => getTotal(b.id) - getTotal(a.id))

  const setRecomendada = (laId: string) => setLaRecomendada(laId)

  if (criterios.length === 0 && las.length > 0) {
    setTimeout(initCriterios, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-military-gold font-bold text-lg">Fase 04 — Comparação das Linhas de Ação</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-military-gold border border-military-gold/50">
              <Shield size={10} /> Motor JEV (System One)
            </span>
          </div>
          <p className="text-green-500 text-xs mt-1">Matriz de Decisão · Julgamentos Calibrados · Prova de APA · §4.3.7 PPCOT</p>
        </div>
      </div>

      {/* Seletor de Unidade / Escalão sob Planejamento */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-gold glow-gold flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="section-title mb-1">Unidade sob Planejamento (Escalão Ativo) — Fase 04</label>
          <p className="text-green-500 text-xs">Selecione para qual escalão/unidade você está comparando as Linhas de Ação.</p>
        </div>
        <div className="w-full md:w-72">
          <select
            value={selectedUnit}
            onChange={e => dispatch({ type: 'SET_SELECTED_UNIT', payload: e.target.value })}
            className="input-field text-military-gold border-military-gold bg-dark-bg font-bold cursor-pointer"
          >
            <option value="Principal">Principal (Comando Geral / Geral da Missão)</option>
            {(state.fase01.subordinateEchelons || []).filter(sub => sub.trim() !== '').map((sub, idx) => (
              <option key={idx} value={sub}>{sub}</option>
            ))}
            {selectedUnit !== 'Principal' && !(state.fase01.subordinateEchelons || []).includes(selectedUnit) && (
              <option value={selectedUnit}>{selectedUnit}</option>
            )}
          </select>
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
              <div>
                <label className="section-title mb-0">Critérios de Avaliação Ponderados</label>
                <p className="text-[11px] text-green-500">Ponderação controlada em código conforme a diretriz do Comandante</p>
              </div>
              <button onClick={addCriterio} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                <Plus size={12}/> Adicionar Critério
              </button>
            </div>
            <div className="space-y-2">
              {criterios.map(c => (
                <div key={c.id} className="flex gap-2 items-center">
                  <input className="input-field flex-1 text-xs" value={c.nome} onChange={e => updCriterio(c.id, 'nome', e.target.value)} placeholder="Nome do critério..." />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-green-500 text-xs">Peso:</span>
                    <select className="input-field w-16 text-xs" value={c.peso} onChange={e => updCriterio(c.id, 'peso', Number(e.target.value))}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setCriterios(criterios.filter(x => x.id !== c.id))} className="text-red-600 cursor-pointer"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Matriz de Decisão com Motor JEV */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green overflow-x-auto space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <label className="section-title mb-0 flex items-center gap-1.5">
                  <span>Matriz de Decisão (Pontuação 0–5)</span>
                </label>
                <p className="text-[11px] text-green-500">Julgamentos tipados pelo modelo System One JEV com distribuição e grau de certeza</p>
              </div>
              <button
                onClick={evaluateMatrixWithJev}
                disabled={loadingCompare}
                className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer bg-military-gold text-dark-bg font-bold hover:bg-yellow-400"
              >
                {loadingCompare ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {loadingCompare ? 'Avaliando com JEV...' : '✨ Avaliar Decisão com JEV'}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="text-left text-green-500 py-2 pr-4 font-medium">Critério</th>
                  <th className="text-center text-green-500 py-2 px-2 font-medium">Peso</th>
                  {las.map(la => (
                    <th key={la.id} className="text-center text-military-gold py-2 px-3 font-medium">
                      L Aç {la.numero}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criterios.map(c => (
                  <tr key={c.id} className="border-b border-green-900/50">
                    <td className="text-green-300 py-2 pr-4">{c.nome || '—'}</td>
                    <td className="text-center text-military-gold py-2 px-2">{c.peso}</td>
                    {las.map(la => {
                      const cell = getCellData(la.id, c.id)
                      const pts = getPontos(la.id, c.id)
                      const total = pts * c.peso
                      const isSelected = selectedCell?.laId === la.id && selectedCell?.criterioId === c.id
                      const hasJevConfidence = cell?.confidence !== undefined

                      return (
                        <td
                          key={la.id}
                          className={`text-center py-2 px-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-military-green/40 border border-military-gold' : 'hover:bg-military-green/10'
                          }`}
                          onClick={() => setSelectedCell({ laId: la.id, criterioId: c.id })}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <select
                                className="bg-dark-bg border border-green-800 rounded px-1 py-0.5 text-green-200 w-14 text-center cursor-pointer font-bold"
                                value={pts}
                                onChange={e => {
                                  setPontos(la.id, c.id, Number(e.target.value))
                                  setSelectedCell({ laId: la.id, criterioId: c.id })
                                }}
                              >
                                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <span className="text-green-600 text-xs font-mono">={total}</span>
                            </div>

                            {hasJevConfidence && (
                              <span
                                className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                                  (cell?.confidence ?? 0) >= 0.8
                                    ? 'bg-green-950/60 text-green-400 border border-green-800'
                                    : 'bg-amber-950/60 text-yellow-400 border border-yellow-800'
                                }`}
                                title={`Confiança JEV: ${Math.round((cell?.confidence ?? 0) * 100)}%`}
                              >
                                {Math.round((cell?.confidence ?? 0) * 100)}% conf
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-military-green/30">
                  <td colSpan={2} className="text-military-gold font-bold py-2 pr-4">TOTAL PONDERADO (max: {getMaxTotal()})</td>
                  {las.map(la => (
                    <td key={la.id} className="text-center py-2 px-3">
                      <span className="text-military-gold font-bold text-sm">{getTotal(la.id)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Painel de Detalhes e Justificativa da Célula JEV */}
          {selectedCell && (() => {
            const la = las.find(l => l.id === selectedCell.laId)
            const crit = criterios.find(c => c.id === selectedCell.criterioId)
            if (!la || !crit) return null

            const cellKey = `${selectedCell.laId}_${selectedCell.criterioId}`
            const cell = getCellData(selectedCell.laId, selectedCell.criterioId)
            const justificationText = justificativas?.[cellKey] || cell?.justificativa || ''

            const setJustificationText = (txt: string) => {
              const prev = justificativas || {}
              setJustificativas({ ...prev, [cellKey]: txt })
            }

            return (
              <div className="bg-card-bg border border-military-gold rounded-lg p-4 animate-fade-in space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-military-gold font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} /> Fundamentação da Decisão — L Aç {la.numero} vs. {crit.nome}
                  </h4>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="text-green-500 hover:text-green-400 text-xs cursor-pointer"
                  >
                    Fechar Painel
                  </button>
                </div>

                <div className="text-xs text-green-400 space-y-1">
                  <p>
                    <span className="font-semibold text-white">Linha de Ação {la.numero}:</span> {la.sumario || la.oQue}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Critério de Decisão:</span> {crit.nome} (Peso: {crit.peso})
                  </p>
                </div>

                {cell?.probabilities && Object.keys(cell.probabilities).length > 0 && (
                  <div className="p-2.5 rounded bg-black/30 border border-green-950 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-military-gold font-bold">Distribuição de Probabilidade JEV (Níveis 0 a 5):</span>
                      <span className="text-green-400 font-mono">Confiança: {Math.round((cell.confidence ?? 0) * 100)}%</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 text-center">
                      {[0, 1, 2, 3, 4, 5].map(lvl => {
                        const prob = cell.probabilities?.[String(lvl)] ?? 0
                        const pct = Math.round(prob * 100)
                        const isTop = cell.pontos === lvl
                        return (
                          <div key={lvl} className={`p-1 rounded border ${isTop ? 'border-military-gold bg-military-gold/20' : 'border-green-950 bg-black/20'}`}>
                            <div className="text-[10px] text-gray-400">Nível {lvl}</div>
                            <div className="text-xs font-bold font-mono text-white">{pct}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-green-500 text-xs mb-1 block">Justificativa Tática do Assessor de Estado-Maior</label>
                  <textarea
                    className="textarea-field h-20 text-xs font-mono"
                    value={justificationText}
                    onChange={e => setJustificationText(e.target.value)}
                    placeholder="Justificativa tática para a nota desta célula gerada pelo JEV ou editada pelo EM..."
                  />
                </div>
              </div>
            )
          })()}

          {/* Prova Final de APA com Motor JEV */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-green-950 pb-2">
              <div className="flex items-center gap-1.5">
                <Award className="text-military-gold" size={16} />
                <label className="section-title block mb-0">Prova Final de APA (Adequabilidade, Praticabilidade, Aceitabilidade)</label>
              </div>
              <span className="text-green-500 text-[11px]">Critério Doutrinário de Eliminação (§4.3.7 PPCOT)</span>
            </div>

            <div className="space-y-3 text-xs">
              {las.map(la => {
                const apa = apaFinalLA?.[la.id] || { adequabilidade: false, praticabilidade: false, aceitabilidade: false }
                const isPass = apa.adequabilidade && apa.praticabilidade && apa.aceitabilidade
                const probs = apa.probabilities

                return (
                  <div key={la.id} className="border border-green-900/60 p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-black/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">L Aç {la.numero}</span>
                        {isPass ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-950 text-green-400 border border-green-700">
                            Aprovada em APA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/40 text-red-400 border border-red-900">
                            Reprovada / Incompleta
                          </span>
                        )}
                      </div>
                      <p className="text-green-600 text-[10px] truncate max-w-sm mt-0.5">{la.sumario || la.oQue || 'Sem sumário'}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      {[
                        { key: 'adequabilidade' as const, label: 'Adequabilidade' },
                        { key: 'praticabilidade' as const, label: 'Praticabilidade' },
                        { key: 'aceitabilidade' as const, label: 'Aceitabilidade' }
                      ].map(item => {
                        const prob = probs?.[item.key]
                        return (
                          <label key={item.key} className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                            <input
                              type="checkbox"
                              checked={apa[item.key]}
                              onChange={e => setAPAFinal(la.id, item.key, e.target.checked)}
                              className="accent-yellow-500 rounded cursor-pointer"
                            />
                            <span>{item.label}</span>
                            {prob !== undefined && (
                              <span className="text-[10px] text-green-400 font-mono">({Math.round(prob * 100)}%)</span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ranking e Recomendação pelo Motor JEV */}
          <div className="bg-card-bg rounded-lg p-4 border border-military-green space-y-3">
            <div className="flex justify-between items-center">
              <label className="section-title mb-0">Ranking da Decisão e Recomendação ao Comandante</label>
              <span className="text-[11px] text-green-500 font-mono">EB70-MC-10.211</span>
            </div>

            <div className="space-y-2">
              {ranking.map((la, i) => {
                const total = getTotal(la.id)
                const pct = getMaxTotal() > 0 ? (total / getMaxTotal()) * 100 : 0
                const isRec = laRecomendada === la.id
                const apa = apaFinalLA?.[la.id]
                const passedAPA = Boolean(apa && apa.adequabilidade && apa.praticabilidade && apa.aceitabilidade)

                return (
                  <div key={la.id} className={`flex items-center gap-3 p-3 rounded border transition-all ${isRec ? 'border-military-gold bg-military-green/30' : 'border-green-900'}`}>
                    <span className={`font-bold text-sm w-6 ${i === 0 ? 'text-military-gold' : 'text-green-600'}`}>{i + 1}º</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-green-200 text-sm font-medium">L Aç {la.numero} — {la.sumario.substring(0, 60) || la.oQue.substring(0, 60)}</span>
                        {passedAPA ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-green-950 text-green-400 border border-green-800">APA OK</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950/40 text-red-400 border border-red-900">APA NÃO</span>
                        )}
                      </div>
                    </div>
                    <div className="w-36 bg-green-950 rounded-full h-3.5 relative overflow-hidden border border-green-950 flex-shrink-0 hidden sm:block">
                      <div className="bg-gradient-to-r from-military-green to-military-gold h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{Math.round(pct)}%</span>
                    </div>
                    <span className="text-military-gold text-sm font-bold w-12 text-right">{total} pts</span>
                    <button onClick={() => setRecomendada(la.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border cursor-pointer transition-colors ${isRec ? 'bg-military-gold text-military-green border-military-gold font-bold' : 'border-green-700 text-green-500 hover:border-military-gold'}`}>
                      <Star size={12}/> {isRec ? 'Recomendada' : 'Recomendar'}
                    </button>
                  </div>
                )
              })}
            </div>

            {laRecomendada && (
              <div className="mt-3">
                <label className="text-green-500 text-xs mb-1 block">Justificativa da Recomendação ao Comandante</label>
                <textarea className="textarea-field h-20 text-xs font-mono" value={justificativa}
                  onChange={e => setJustificativaText(e.target.value)}
                  placeholder="Fundamentos táticos para a recomendação da L Aç ao Comandante..." />
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
