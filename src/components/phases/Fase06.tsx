'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Brain, Loader, Printer, Eye, EyeOff } from 'lucide-react'

export default function Fase06() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase06
  const [loading, setLoading] = useState(false)
  const [showDossier, setShowDossier] = useState(false)

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
            subordinateEchelons: state.fase01.subordinateEchelons || []
          }
        }),
      })
      const json = await res.json()
      if (json.success) {
        upd({ ...json.data, status: 'in_progress' })
      } else {
        alert(json.error || 'Erro ao gerar a Ordem de Operações. Verifique a chave de API.')
      }
    } catch { 
      alert('Falha na conexão com a IA.')
    }
    setLoading(false)
  }

  const autoFill = () => {
    const la = state.fase03.linhasAcao.find(l => l.id === state.fase05.laEscolhida)
    const subordinateTasks = state.fase01.subordinateEchelons && state.fase01.subordinateEchelons.length > 0
      ? state.fase01.subordinateEchelons.map(se => `- **${se}**: [Atribuir tarefa tática e propósito]`).join('\n\n')
      : '[Definir tarefas dos elementos subordinados]'

    upd({
      missao: state.fase01.newMissionStatement || state.fase01.what,
      intencaoCmt: state.fase05.intencaoAtualizada || state.fase01.initialIntent,
      inimigo: `Dispositivo: ${state.fase02.dicovap.dispositivo}\nComposição: ${state.fase02.dicovap.composicao}\nValor: ${state.fase02.dicovap.valor}`,
      forcasAmigas: state.fase02.meiosDisponiveis,
      conceitoOperacao: la ? `Fase I: Preparação\n- Sincronização: ${state.fase03.syncGrid?.find(c => c.fase === 'Fase I: Preparação' && c.funcao === 'Manobra')?.texto || 'Ações iniciais.'}\n\nFase II: Movimento\n- Sincronização: ${state.fase03.syncGrid?.find(c => c.fase === 'Fase II: Movimento' && c.funcao === 'Manobra')?.texto || 'Deslocamento.'}\n\nFase III: Ação\n- Manobra Principal: ${la.oQue}\n- Detalhe Execução: ${la.como}` : '',
      tarefasSubordinados: subordinateTasks,
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
            CLASSIFICAÇÃO: {f.classificacao || 'RESERVADO'}
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
                {state.fase05.diplanAtualizada || 'Não preenchida.'}
              </pre>
            </div>
            <div>
              <span className="font-bold block uppercase mb-1">4ª Ordem de Alerta (OA-4)</span>
              <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed border border-gray-300 p-3">
                {state.fase05.oa4 || 'Não gerada.'}
              </pre>
            </div>
          </div>
        </div>

        {/* 5. Ordem de Operacoes */}
        <div className="print-section min-h-screen py-6">
          <div className="text-center font-bold border-b-2 border-black pb-2 mb-4">
            {f.classificacao?.toUpperCase() || 'RESERVADO'}<br/>
            ORDEM DE OPERAÇÕES (O Op) — {f.numero || 'OOp Nº ___'}<br/>
            {state.operationName.toUpperCase()}
          </div>
          <div className="space-y-4 text-xs font-mono">
            {sections.filter(s => s.key !== 'classificacao' && s.key !== 'numero').map(sec => (
              <div key={sec.key}>
                <span className="font-bold block uppercase">{sec.label}</span>
                <p className="whitespace-pre-wrap pl-4 border-l border-gray-400 text-gray-800 text-[11px] leading-relaxed">
                  {(f as any)[sec.key] || '—'}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center font-bold border-t-2 border-black pt-2 mt-8">
            {f.classificacao?.toUpperCase() || 'RESERVADO'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 06 — Emissão de Planos e Ordens</h2>
          <p className="text-green-500 text-xs mt-1">Ordem de Operações · §4.3.9 PPCOT</p>
        </div>
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
        <button onClick={() => upd({ status: 'completed' })} className="btn-primary flex items-center gap-2 cursor-pointer">
          <CheckCircle size={16} /> Finalizar Planejamento
        </button>
      </div>
    </div>
  )
}
