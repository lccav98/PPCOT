'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Brain, Loader, Printer, Eye, EyeOff } from 'lucide-react'

export default function Fase06() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase06
  const selectedUnit = state.selectedUnit || 'Principal'
  const [loading, setLoading] = useState(false)
  const [showDossier, setShowDossier] = useState(false)

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE06', payload })

  // Getters
  const getField = (field: 'classificacao' | 'numero' | 'referencias' | 'inimigo' | 'forcasAmigas' | 'missao' | 'intencaoCmt' | 'conceitoOperacao' | 'tarefasSubordinados' | 'instrucoesCoordenacao' | 'apoioLogistico' | 'comando' | 'comunicacoes') => {
    if (selectedUnit === 'Principal') return f[field] || (field === 'classificacao' ? 'RESERVADO' : '')
    return f.unitAnalyses?.[selectedUnit]?.[field] || (field === 'classificacao' ? 'RESERVADO' : '')
  }

  // Setters
  const setField = (field: 'classificacao' | 'numero' | 'referencias' | 'inimigo' | 'forcasAmigas' | 'missao' | 'intencaoCmt' | 'conceitoOperacao' | 'tarefasSubordinados' | 'instrucoesCoordenacao' | 'apoioLogistico' | 'comando' | 'comunicacoes', value: string) => {
    if (selectedUnit === 'Principal') {
      upd({ [field]: value })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      const current = analyses[selectedUnit] || {
        classificacao: 'RESERVADO', numero: '', referencias: '', inimigo: '', forcasAmigas: '', missao: '', intencaoCmt: '', conceitoOperacao: '', tarefasSubordinados: '', instrucoesCoordenacao: '', apoioLogistico: '', comando: '', comunicacoes: ''
      }
      analyses[selectedUnit] = { ...current, [field]: value }
      upd({ unitAnalyses: analyses })
    }
  }

  const classificacao = getField('classificacao')
  const numero = getField('numero')
  const referencias = getField('referencias')
  const inimigo = getField('inimigo')
  const forcasAmigas = getField('forcasAmigas')
  const missao = getField('missao')
  const intencaoCmt = getField('intencaoCmt')
  const conceitoOperacao = getField('conceitoOperacao')
  const tarefasSubordinados = getField('tarefasSubordinados')
  const instrucoesCoordenacao = getField('instrucoesCoordenacao')
  const apoioLogistico = getField('apoioLogistico')
  const comando = getField('comando')
  const comunicacoes = getField('comunicacoes')

  const generateOrder = async () => {
    const laEscolhida = selectedUnit === 'Principal'
      ? state.fase05.laEscolhida
      : state.fase05.unitAnalyses?.[selectedUnit]?.laEscolhida || ''

    const intencaoEscolhida = selectedUnit === 'Principal'
      ? state.fase05.intencaoAtualizada
      : state.fase05.unitAnalyses?.[selectedUnit]?.intencaoAtualizada || ''

    const las = selectedUnit === 'Principal'
      ? state.fase03.linhasAcao
      : state.fase03.unitAnalyses?.[selectedUnit]?.linhasAcao || []

    const la = las.find(l => l.id === laEscolhida)
    if (!la && !intencaoEscolhida) { alert('Complete a Fase 05 (Decisão) antes de gerar a ordem.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'orop',
          targetUnit: selectedUnit,
          content: {
            mission: selectedUnit === 'Principal'
              ? (state.fase01.newMissionStatement || state.fase01.what)
              : (state.fase01.unitAnalyses?.[selectedUnit]?.newMissionStatement || state.fase01.unitAnalyses?.[selectedUnit]?.what || state.fase01.newMissionStatement || state.fase01.what),
            laAprovada: la ? `${la.oQue} / ${la.como} / ${la.faseamento}` : laEscolhida,
            intencao: intencaoEscolhida,
            meios: state.fase02.meiosDisponiveis,
            subordinateEchelons: state.fase01.subordinateEchelons || []
          }
        }),
      })
      const json = await res.json()
      if (json.success) {
        if (selectedUnit === 'Principal') {
          upd({ ...json.data, status: 'in_progress' })
        } else {
          const analyses = { ...(f.unitAnalyses || {}) }
          analyses[selectedUnit] = {
            classificacao: json.data.classificacao || 'RESERVADO',
            numero: json.data.numero || '',
            referencias: json.data.referencias || '',
            inimigo: json.data.inimigo || '',
            forcasAmigas: json.data.forcasAmigas || '',
            missao: json.data.missao || '',
            intencaoCmt: json.data.intencaoCmt || '',
            conceitoOperacao: json.data.conceitoOperacao || '',
            tarefasSubordinados: json.data.tarefasSubordinados || '',
            instrucoesCoordenacao: json.data.instrucoesCoordenacao || '',
            apoioLogistico: json.data.apoioLogistico || '',
            comando: json.data.comando || '',
            comunicacoes: json.data.comunicacoes || ''
          }
          upd({ unitAnalyses: analyses, status: 'in_progress' })
        }
      } else {
        alert(json.error || 'Erro ao gerar a Ordem de Operações. Verifique a chave de API.')
      }
    } catch { 
      alert('Falha na conexão com a IA.')
    }
    setLoading(false)
  }

  const autoFill = () => {
    const laEscolhida = selectedUnit === 'Principal'
      ? state.fase05.laEscolhida
      : state.fase05.unitAnalyses?.[selectedUnit]?.laEscolhida || ''

    const intencaoEscolhida = selectedUnit === 'Principal'
      ? state.fase05.intencaoAtualizada
      : state.fase05.unitAnalyses?.[selectedUnit]?.intencaoAtualizada || ''

    const las = selectedUnit === 'Principal'
      ? state.fase03.linhasAcao
      : state.fase03.unitAnalyses?.[selectedUnit]?.linhasAcao || []

    const la = las.find(l => l.id === laEscolhida)

    const syncGrid = selectedUnit === 'Principal'
      ? state.fase03.syncGrid
      : state.fase03.unitAnalyses?.[selectedUnit]?.syncGrid || []

    const mission = selectedUnit === 'Principal'
      ? (state.fase01.newMissionStatement || state.fase01.what)
      : (state.fase01.unitAnalyses?.[selectedUnit]?.newMissionStatement || state.fase01.unitAnalyses?.[selectedUnit]?.what || state.fase01.newMissionStatement || state.fase01.what)

    const intent = intencaoEscolhida || (selectedUnit === 'Principal' ? state.fase01.initialIntent : (state.fase01.unitAnalyses?.[selectedUnit]?.initialIntent || state.fase01.initialIntent))

    const subordinateTasks = state.fase01.subordinateEchelons && state.fase01.subordinateEchelons.length > 0
      ? state.fase01.subordinateEchelons.map(se => `- **${se}**: [Atribuir tarefa tática e propósito]`).join('\n\n')
      : '[Definir tarefas dos elementos subordinados]'

    const concept = la ? `Fase I: Preparação\n- Sincronização: ${syncGrid?.find(c => c.fase === 'Fase I: Preparação' && c.funcao === 'Manobra')?.texto || 'Ações iniciais.'}\n\nFase II: Movimento\n- Sincronização: ${syncGrid?.find(c => c.fase === 'Fase II: Movimento' && c.funcao === 'Manobra')?.texto || 'Deslocamento.'}\n\nFase III: Ação\n- Manobra Principal: ${la.oQue}\n- Detalhe Execução: ${la.como}` : ''

    if (selectedUnit === 'Principal') {
      upd({
        missao: mission,
        intencaoCmt: intent,
        inimigo: `Dispositivo: ${state.fase02.dicovap.dispositivo}\nComposição: ${state.fase02.dicovap.composicao}\nValor: ${state.fase02.dicovap.valor}`,
        forcasAmigas: state.fase02.meiosDisponiveis,
        conceitoOperacao: concept,
        tarefasSubordinados: subordinateTasks,
        status: 'in_progress'
      })
    } else {
      const analyses = { ...(f.unitAnalyses || {}) }
      analyses[selectedUnit] = {
        classificacao: 'RESERVADO',
        numero: '',
        referencias: '',
        missao: mission,
        intencaoCmt: intent,
        inimigo: `Dispositivo: ${state.fase02.dicovap.dispositivo}\nComposição: ${state.fase02.dicovap.composicao}\nValor: ${state.fase02.dicovap.valor}`,
        forcasAmigas: state.fase02.meiosDisponiveis,
        conceitoOperacao: concept,
        tarefasSubordinados: subordinateTasks,
        instrucoesCoordenacao: '',
        apoioLogistico: '',
        comando: '',
        comunicacoes: ''
      }
      upd({ unitAnalyses: analyses, status: 'in_progress' })
    }
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

  if (showDossier) {
    return (
      <div className="bg-white text-black p-8 font-mono text-xs max-w-4xl mx-auto space-y-8 select-text">
        <div className="flex justify-between items-center no-print border-b border-gray-300 pb-3 mb-6">
          <span className="font-sans font-bold text-gray-700">Dossiê de Planejamento Tático (Visualização de Impressão)</span>
          <div className="flex gap-2">
            <button onClick={() => setShowDossier(false)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded font-sans cursor-pointer text-gray-800">
              Voltar ao Editor
            </button>
            <button onClick={handlePrint} className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded font-sans cursor-pointer">
              Confirmar Impressão / PDF
            </button>
          </div>
        </div>

        {/* Capa */}
        <div className="text-center py-20 border-b-2 border-double border-black min-h-screen flex flex-col justify-between items-center">
          <div className="uppercase font-bold tracking-widest text-sm">
            EXÉRCITO BRASILEIRO<br/>
            {state.operationName}
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">DOSSIÊ INTEGRADO DE PLANEJAMENTO</h1>
            <p className="text-sm">Fases 01 a 06 do Exame de Situação do Comandante</p>
            <div className="h-0.5 w-32 bg-black mx-auto"></div>
          </div>
          <div className="text-xs">
            Doutrina: EB70-MC-10.211 (PPCOT)<br/>
            Data de Emissão: {new Date().toLocaleDateString('pt-BR')}<br/>
            CLASSIFICAÇÃO: {classificacao || 'RESERVADO'}
          </div>
        </div>

        {/* 1. Ordem de Alerta 1 */}
        <div className="print-section min-h-screen py-6 border-b border-gray-300">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-3">1. 1ª ORDEM DE ALERTA (OA-1)</h2>
          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
            {state.fase01.oa1 || 'Não gerada.'}
          </pre>
        </div>

        {/* 2. Estimativas Correntes */}
        <div className="print-section min-h-screen py-6 border-b border-gray-300">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-3">2. ESTIMATIVAS CORRENTES DE SEÇÕES (S2 a S5)</h2>
          <div className="space-y-4">
            {['s2', 's3', 's4', 's5'].map(sec => (
              <div key={sec} className="border border-gray-300 p-3 rounded">
                <span className="font-bold block uppercase mb-1">Seção {sec.toUpperCase()}</span>
                <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                  {(state.fase02.estimativas as any)?.[sec] || 'Não preenchido.'}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Riscos e Sincronizacao */}
        <div className="print-section min-h-screen py-6 border-b border-gray-300">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-3">3. ANÁLISE DE RISCOS E SINCRONIZAÇÃO</h2>
          <h3 className="font-bold mb-2">Matriz de Riscos:</h3>
          <table className="w-full border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border border-black p-1.5">Descrição do Risco</th>
                <th className="border border-black p-1.5 text-center w-16">Nível</th>
                <th className="border border-black p-1.5">Mitigação</th>
              </tr>
            </thead>
            <tbody>
              {state.riscos?.map(r => (
                <tr key={r.id}>
                  <td className="border border-black p-1.5">{r.descricao}</td>
                  <td className="border border-black p-1.5 text-center uppercase font-bold">{r.nivel}</td>
                  <td className="border border-black p-1.5 italic">{r.mitigacao}</td>
                </tr>
              ))}
              {(!state.riscos || state.riscos.length === 0) && (
                <tr><td colSpan={3} className="border border-black p-4 text-center italic">Nenhum risco registrado.</td></tr>
              )}
            </tbody>
          </table>

          <h3 className="font-bold mb-2">Matriz de Sincronização:</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 font-bold text-[10px]">
                <th className="border border-black p-1.5 text-left w-24">Função / Fase</th>
                {['Fase I', 'Fase II', 'Fase III', 'Fase IV'].map(col => <th key={col} className="border border-black p-1.5 text-center">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {['Manobra', 'Inteligência', 'Fogos', 'Logística', 'Comando e Controle', 'Assuntos Civis'].map(row => (
                <tr key={row}>
                  <td className="border border-black p-1 font-bold bg-gray-50">{row}</td>
                  {['Fase I: Preparação', 'Fase II: Movimento', 'Fase III: Ação', 'Fase IV: Consolidação'].map(col => (
                    <td key={col} className="border border-black p-1 text-[10px]">
                      {state.fase03.syncGrid?.find(c => c.fase === col && c.funcao === row)?.texto || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. DIPLAN e Ordem de Alerta 4 */}
        <div className="print-section min-h-screen py-6 border-b border-gray-300">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-3">4. DIRETRIZ DE PLANEJAMENTO (DIPLAN) E 4ª ORDEM DE ALERTA</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <span className="font-bold block uppercase mb-1">DIPLAN Selecionada</span>
              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed border border-gray-300 p-3">
                {(selectedUnit === 'Principal' ? state.fase05.diplanAtualizada : (state.fase05.unitAnalyses?.[selectedUnit]?.diplanAtualizada)) || 'Não preenchida.'}
              </pre>
            </div>
            <div>
              <span className="font-bold block uppercase mb-1">4ª Ordem de Alerta (OA-4)</span>
              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed border border-gray-300 p-3">
                {(selectedUnit === 'Principal' ? state.fase05.oa4 : (state.fase05.unitAnalyses?.[selectedUnit]?.oa4)) || 'Não gerada.'}
              </pre>
            </div>
          </div>
        </div>

        {/* 5. Ordem de Operacoes */}
        <div className="print-section min-h-screen py-6">
          <div className="text-center font-bold border-b-2 border-black pb-2 mb-4">
            {classificacao?.toUpperCase() || 'RESERVADO'}<br/>
            ORDEM DE OPERAÇÕES (O Op) — {numero || 'OOp Nº ___'}<br/>
            {state.operationName.toUpperCase()}
          </div>
          <div className="space-y-4 text-xs font-mono">
            {sections.filter(s => s.key !== 'classificacao' && s.key !== 'numero').map(sec => {
              const val = sec.key === 'referencias' ? referencias
                : sec.key === 'inimigo' ? inimigo
                : sec.key === 'forcasAmigas' ? forcasAmigas
                : sec.key === 'missao' ? missao
                : sec.key === 'intencaoCmt' ? intencaoCmt
                : sec.key === 'conceitoOperacao' ? conceitoOperacao
                : sec.key === 'tarefasSubordinados' ? tarefasSubordinados
                : sec.key === 'instrucoesCoordenacao' ? instrucoesCoordenacao
                : sec.key === 'apoioLogistico' ? apoioLogistico
                : sec.key === 'comando' ? comando
                : sec.key === 'comunicacoes' ? comunicacoes
                : '';
              return (
                <div key={sec.key}>
                  <span className="font-bold block uppercase">{sec.label}</span>
                  <p className="whitespace-pre-wrap pl-4 border-l border-gray-400 text-gray-800 text-[11px] leading-relaxed">
                    {val || '—'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center font-bold border-t-2 border-black pt-2 mt-8">
            {classificacao?.toUpperCase() || 'RESERVADO'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 06 — Emissão de Planos e Ordens</h2>
          <p className="text-green-500 text-xs mt-1">Ordem de Operações · §4.3.9 PPCOT</p>
        </div>
      </div>

      {/* Seletor de Unidade / Escalão sob Planejamento */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-gold glow-gold flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <label className="section-title mb-1">Unidade sob Planejamento (Escalão Ativo) — Fase 06</label>
          <p className="text-green-500 text-xs">Selecione para qual escalão/unidade você está emitindo a Ordem de Operações.</p>
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

      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2 no-print">
          <button onClick={() => setShowDossier(true)} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
            <Eye size={12}/> Visualizar Dossiê Completo
          </button>
          <button onClick={autoFill} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
            ✨ Preencher dos dados
          </button>
          <button onClick={generateOrder} disabled={loading} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
            {loading ? <Loader size={12} className="animate-spin"/> : <Brain size={12}/>}
            {loading ? 'Gerando...' : 'Gerar com IA'}
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs flex items-center gap-1 cursor-pointer">
            <Printer size={12}/> Imprimir O Op
          </button>
        </div>
      </div>

      {/* Ordem de Operações */}
      <div className="bg-card-bg rounded-lg border border-military-green overflow-hidden print-section">
        {/* Header da OOp */}
        <div className="bg-military-green p-4 text-center border-b border-military-gold print-section">
          <p className="text-military-gold font-bold text-xs tracking-widest uppercase">
            {classificacao || 'RESERVADO'}
          </p>
          <p className="text-white font-bold text-sm mt-1">EXÉRCITO BRASILEIRO</p>
          <p className="text-green-300 text-xs">{state.operationName.toUpperCase()} — {numero || 'OOp Nº ___'}</p>
        </div>

        <div className="p-4 space-y-4">
          {sections.map(({ key, label, ph }) => {
            const val = key === 'classificacao' ? classificacao
              : key === 'numero' ? numero
              : key === 'referencias' ? referencias
              : key === 'inimigo' ? inimigo
              : key === 'forcasAmigas' ? forcasAmigas
              : key === 'missao' ? missao
              : key === 'intencaoCmt' ? intencaoCmt
              : key === 'conceitoOperacao' ? conceitoOperacao
              : key === 'tarefasSubordinados' ? tarefasSubordinados
              : key === 'instrucoesCoordenacao' ? instrucoesCoordenacao
              : key === 'apoioLogistico' ? apoioLogistico
              : key === 'comando' ? comando
              : key === 'comunicacoes' ? comunicacoes
              : '';
            return (
              <div key={key} className="border-b border-green-900/50 pb-3">
                <label className="text-military-gold text-xs font-bold uppercase tracking-wider block mb-1">{label}</label>
                <textarea
                  className="textarea-field text-xs h-16"
                  value={val}
                  onChange={e => setField(key as any, e.target.value)}
                  placeholder={ph}
                />
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-military-green/20 border-t border-military-gold text-center">
          <p className="text-military-gold text-xs font-bold tracking-widest">
            {classificacao || 'RESERVADO'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => upd({ status: 'completed' })} className="btn-primary flex items-center gap-2 cursor-pointer">
          <CheckCircle size={16} /> Finalizar Planejamento
        </button>
      </div>
    </div>
  )
}
