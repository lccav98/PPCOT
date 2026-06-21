'use client'
import React, { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { RiskMatrixItem } from '@/lib/types'
import { Plus, Trash2, AlertTriangle, ShieldAlert, Check } from 'lucide-react'

export default function RiskManager() {
  const { state, dispatch } = usePPCOT()
  const riscos = state.riscos || []

  const [desc, setDesc] = useState('')
  const [prob, setProb] = useState<'baixa' | 'media' | 'alta'>('media')
  const [grav, setGrav] = useState<'baixa' | 'media' | 'alta'>('media')
  const [mitig, setMitig] = useState('')

  const calculateLevel = (p: 'baixa' | 'media' | 'alta', g: 'baixa' | 'media' | 'alta'): RiskMatrixItem['nivel'] => {
    if (p === 'baixa' && g === 'baixa') return 'baixo'
    if ((p === 'baixa' && g === 'media') || (p === 'media' && g === 'baixa')) return 'medio'
    if ((p === 'alta' && g === 'baixa') || (p === 'baixa' && g === 'alta') || (p === 'media' && g === 'media')) return 'alto'
    return 'extremo'
  }

  const addRisk = () => {
    if (!desc.trim()) return
    const nivel = calculateLevel(prob, grav)
    const newItem: RiskMatrixItem = {
      id: Date.now().toString(),
      descricao: desc,
      probabilidade: prob,
      gravidade: grav,
      nivel,
      mitigacao: mitig
    }
    const updated = [...riscos, newItem]
    dispatch({ type: 'UPDATE_RISKS', payload: updated })
    setDesc('')
    setMitig('')
  }

  const removeRisk = (id: string) => {
    const updated = riscos.filter(r => r.id !== id)
    dispatch({ type: 'UPDATE_RISKS', payload: updated })
  }

  const getLevelBadge = (level: RiskMatrixItem['nivel']) => {
    switch (level) {
      case 'baixo': return 'bg-green-900/50 border border-green-700 text-green-400'
      case 'medio': return 'bg-yellow-900/50 border border-yellow-700 text-yellow-400'
      case 'alto': return 'bg-orange-900/50 border border-orange-700 text-orange-400'
      case 'extremo': return 'bg-red-900/50 border border-red-700 text-red-400 animate-pulse'
    }
  }

  return (
    <div className="bg-card-bg border border-military-green rounded-lg p-5 space-y-6">
      <div className="flex items-center gap-2 border-b border-military-green pb-3">
        <ShieldAlert className="text-military-gold" size={20} />
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Matriz de Gestão de Riscos Operacionais</h3>
          <p className="text-green-600 text-xs mt-0.5">Identificação de riscos e medidas mitigadoras (§3.6.2.4 PPCOT)</p>
        </div>
      </div>

      {/* Form de Cadastro */}
      <div className="bg-[#0b1611] p-4 rounded border border-military-green grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
        <div className="md:col-span-2 space-y-1">
          <label className="text-green-500 font-bold block">Descrição do Risco Tático:</label>
          <input
            className="input-field text-xs"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ex: Condições de visibilidade adversas afetando a coordenação..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-green-500 font-bold block">Probabilidade:</label>
          <select
            className="input-field text-xs"
            value={prob}
            onChange={e => setProb(e.target.value as any)}
          >
            <option value="baixa">🟢 Baixa</option>
            <option value="media">🟡 Média</option>
            <option value="alta">🔴 Alta</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-green-500 font-bold block">Gravidade / Impacto:</label>
          <select
            className="input-field text-xs"
            value={grav}
            onChange={e => setGrav(e.target.value as any)}
          >
            <option value="baixa">🟢 Baixa</option>
            <option value="media">🟡 Média</option>
            <option value="alta">🔴 Alta</option>
          </select>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className="text-green-500 font-bold block">Medidas de Controle / Mitigação:</label>
          <input
            className="input-field text-xs"
            value={mitig}
            onChange={e => setMitig(e.target.value)}
            placeholder="Ex: Uso de óculos de visão noturna e balizamento luminoso tático..."
          />
        </div>
        <div>
          <button
            type="button"
            onClick={addRisk}
            className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Adicionar Risco
          </button>
        </div>
      </div>

      {/* Lista/Tabela de Riscos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-military-green text-green-500 font-bold">
              <th className="py-2 pr-3">Descrição do Risco</th>
              <th className="py-2 px-3 text-center">Prob.</th>
              <th className="py-2 px-3 text-center">Grav.</th>
              <th className="py-2 px-3 text-center">Nível de Risco</th>
              <th className="py-2 px-3">Mitigação / Controle</th>
              <th className="py-2 pl-3 text-center w-12">Ação</th>
            </tr>
          </thead>
          <tbody>
            {riscos.map(r => (
              <tr key={r.id} className="border-b border-green-950 hover:bg-military-green/10 text-gray-200">
                <td className="py-2.5 pr-3 font-medium">{r.descricao}</td>
                <td className="py-2.5 px-3 text-center capitalize">{r.probabilidade}</td>
                <td className="py-2.5 px-3 text-center capitalize">{r.gravidade}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${getLevelBadge(r.nivel)}`}>
                    {r.nivel}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-green-300 italic">{r.mitigacao || 'Nenhuma medida cadastrada.'}</td>
                <td className="py-2.5 pl-3 text-center">
                  <button
                    type="button"
                    onClick={() => removeRisk(r.id)}
                    className="text-red-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {riscos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-green-700 italic">
                  Nenhum risco operacional cadastrado. Use o formulário acima para identificar riscos na AO.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
