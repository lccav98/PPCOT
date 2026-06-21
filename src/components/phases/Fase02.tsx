'use client'
import { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { CheckCircle, Plus, Trash2, MapPin, Brain, Loader, Printer, Upload } from 'lucide-react'
import TacticalMap from '@/components/shared/TacticalMap'

type Tab = 'inimigo' | 'terreno' | 'meteo' | 'meios' | 'tempo' | 'civis' | 'fff' | 'estimativas'

export default function Fase02() {
  const { state, dispatch } = usePPCOT()
  const f = state.fase02
  const [tab, setTab] = useState<Tab>('inimigo')
  const [loadingEstimativas, setLoadingEstimativas] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upd = (payload: Partial<typeof f>) => dispatch({ type: 'UPDATE_FASE02', payload })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success) {
        upd({ rawIntelligence: json.text })
      } else {
        setError(json.error || 'Erro ao importar documento.')
      }
    } catch {
      setError('Falha de conexão ao enviar o documento.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const analyzeIntelligence = async () => {
    if (!f.rawIntelligence?.trim()) { setError('Cole o texto do anexo de inteligência antes de analisar.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'situation', content: f.rawIntelligence }),
      })
      const json = await res.json()
      if (json.success) {
        upd({
          dicovap: {
            dispositivo: json.data.dicovap?.dispositivo || '',
            composicao: json.data.dicovap?.composicao || '',
            valor: json.data.dicovap?.valor || '',
            atividades: json.data.dicovap?.atividades || '',
            peculiaridades: json.data.dicovap?.peculiaridades || '',
          },
          ocoav: {
            observacao: json.data.ocoav?.observacao || '',
            cobertas: json.data.ocoav?.cobertas || '',
            obstaculos: json.data.ocoav?.obstaculos || '',
            acidentesCapitais: json.data.ocoav?.acidentesCapitais || '',
            viasDeAcesso: json.data.ocoav?.viasDeAcesso || '',
          },
          visibilidade: json.data.visibilidade || '',
          vento: json.data.vento || '',
          precipitacao: json.data.precipitacao || '',
          temperatura: json.data.temperatura || '',
          areas: json.data.areas || '',
          estruturas: json.data.estruturas || '',
          capacidades: json.data.capacidades || '',
          organizacoes: json.data.organizacoes || '',
          pessoas: json.data.pessoas || '',
          eventos: json.data.eventos || '',
          status: 'in_progress'
        })
      } else { setError(json.error || 'Erro na análise. Verifique a chave de API.') }
    } catch { setError('Falha na conexão com a IA.') }
    setLoading(false)
  }
  const updDicovap = (field: keyof typeof f.dicovap, val: string) =>
    upd({ dicovap: { ...f.dicovap, [field]: val } })
  const updOcoav = (field: keyof typeof f.ocoav, val: string) =>
    upd({ ocoav: { ...f.ocoav, [field]: val } })

  const generateFFF = () => {
    const forcas = [
      f.meiosDisponiveis ? `Meios disponíveis: ${f.meiosDisponiveis.substring(0, 60)}...` : '',
      f.ocoav.viasDeAcesso ? `Vias de acesso favoráveis identificadas` : '',
    ].filter(Boolean)
    const fraquezas = [
      f.prc && f.prc.toLowerCase().includes('inferior') ? 'PRC desfavorável' : '',
      f.dicovap.valor ? `Inimigo com valor significativo` : '',
    ].filter(Boolean)
    upd({ fff: { forcas: forcas.length ? forcas : ['Completar análise de meios'], fraquezas: fraquezas.length ? fraquezas : ['Completar análise do inimigo'] } })
  }

  const generateEstimativas = async () => {
    setLoadingEstimativas(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'estimativas',
          content: {
            mission: state.fase01.newMissionStatement || state.fase01.what,
            dicovap: f.dicovap,
            ocoav: f.ocoav,
            visibilidade: f.visibilidade,
            vento: f.vento,
            precipitacao: f.precipitacao,
            temperatura: f.temperatura,
            means: f.meiosDisponiveis,
            subordinateEchelons: state.fase01.subordinateEchelons || [],
            areas: f.areas,
            estruturas: f.estruturas,
            capacidades: f.capacidades,
            organizacoes: f.organizacoes,
            pessoas: f.pessoas,
            eventos: f.eventos
          }
        }),
      })
      const json = await res.json()
      if (json.success) {
        upd({
          estimativas: {
            s2: json.data.s2,
            s3: json.data.s3,
            s4: json.data.s4,
            s5: json.data.s5
          }
        })
      } else {
        setError(json.error || 'Erro ao gerar estimativas. Verifique a chave de API.')
      }
    } catch {
      setError('Falha de conexão com a IA para estimativas.')
    }
    setLoadingEstimativas(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inimigo', label: 'Inimigo (DICOVAP)' },
    { key: 'terreno', label: 'Terreno (OCOAV)' },
    { key: 'meteo', label: 'Condições Meteo' },
    { key: 'meios', label: 'Meios' },
    { key: 'tempo', label: 'Tempo' },
    { key: 'civis', label: 'Cnsd Civis (AECOPE)' },
    { key: 'fff', label: 'FFF / Ameaças' },
    { key: 'estimativas', label: 'Estimativas Correntes (S2-S5)' },
  ]

  const TextArea = ({ label, val, onChg, ph }: { label: string; val: string; onChg: (v: string) => void; ph: string }) => (
    <div>
      <label className="text-green-500 text-xs mb-1 block">{label}</label>
      <textarea className="textarea-field h-16" value={val} onChange={e => onChg(e.target.value)} placeholder={ph} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-military-gold font-bold text-lg">Fase 02 — A Situação e sua Compreensão</h2>
          <p className="text-green-500 text-xs mt-1">MITeMeTeC · PITCIC · §4.3.5 PPCOT</p>
        </div>
      </div>

      {/* Mapa Tático Interativo PITCIC */}
      <TacticalMap
        influenciaOponente={f.influenciaOponente}
        onUpdateInfluencia={val => upd({ influenciaOponente: val })}
        ocoav={f.ocoav}
      />

      {/* Documento do Anexo A - Inteligência */}
      <div className="bg-card-bg rounded-lg p-4 border border-military-green">
        <label className="section-title">Anexo A — Inteligência (Documento Recebido)</label>
        <textarea
          className="textarea-field h-32"
          placeholder="Cole aqui o texto completo do Anexo A (Inteligência), relatório de situação (SITREP) ou ordem de inteligência..."
          value={f.rawIntelligence || ''}
          onChange={e => upd({ rawIntelligence: e.target.value })}
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button onClick={analyzeIntelligence} disabled={loading} className="btn-primary flex items-center gap-2 cursor-pointer">
            {loading ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
            {loading ? 'Analisando...' : 'Analisar Anexo com IA'}
          </button>

          <label className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
            {uploading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Processando Documento...' : 'Importar PDF / DOCX'}
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading || loading}
            />
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </div>

      {/* Tabs MITeMeTeC */}
      <div className="bg-card-bg rounded-lg border border-military-green overflow-hidden">
        <div className="flex overflow-x-auto border-b border-military-green">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                tab === t.key ? 'bg-military-green text-military-gold border-b-2 border-military-gold' : 'text-green-400 hover:text-white hover:bg-military-green/50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'inimigo' && (
            <div className="space-y-3">
              <p className="text-green-600 text-xs italic">DICOVAP: Dispositivo, Composição, Valor, Atividades, Peculiaridades</p>
              {[
                { k: 'dispositivo' as const, l: 'Dispositivo', ph: 'Organização, localizações e mobilidade tática...' },
                { k: 'composicao' as const, l: 'Composição', ph: 'Unidades, efetivos e armamentos...' },
                { k: 'valor' as const, l: 'Valor', ph: 'Capacidade de combate, moral, adestramento...' },
                { k: 'atividades' as const, l: 'Atividades Recentes', ph: 'O que o inimigo tem feito ultimamente...' },
                { k: 'peculiaridades' as const, l: 'Peculiaridades', ph: 'Características específicas do oponente...' },
              ].map(({ k, l, ph }) => (
                <TextArea key={k} label={l} val={f.dicovap[k]} onChg={v => updDicovap(k, v)} ph={ph} />
              ))}
            </div>
          )}

          {tab === 'terreno' && (
            <div className="space-y-3">
              <p className="text-green-600 text-xs italic">OCOAV: Observação, Cobertas/Abrigos, Obstáculos, Acidentes Capitais, Vias de Acesso</p>
              {[
                { k: 'observacao' as const, l: 'Observação e Campos de Tiro', ph: 'Pontos de observação, campos de tiro livres e restritos...' },
                { k: 'cobertas' as const, l: 'Cobertas e Abrigos', ph: 'Matas, edificações, vales, posições defiladadas...' },
                { k: 'obstaculos' as const, l: 'Obstáculos', ph: 'Rios, pântanos, terrain acidentado, construções...' },
                { k: 'acidentesCapitais' as const, l: 'Acidentes Capitais', ph: 'Pontes, cruzamentos, altitudes dominantes, áreas urbanas...' },
                { k: 'viasDeAcesso' as const, l: 'Vias de Acesso', ph: 'Principais eixos rodoviários, trilhas, helipontos...' },
              ].map(({ k, l, ph }) => (
                <TextArea key={k} label={l} val={f.ocoav[k]} onChg={v => updOcoav(k, v)} ph={ph} />
              ))}
            </div>
          )}

          {tab === 'meteo' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'visibilidade' as const, l: 'Visibilidade', ph: 'ex: 5 km, névoa matinal' },
                { k: 'vento' as const, l: 'Vento', ph: 'ex: NE 15 km/h' },
                { k: 'precipitacao' as const, l: 'Precipitação', ph: 'ex: chuva moderada às 14h' },
                { k: 'temperatura' as const, l: 'Temperatura', ph: 'ex: 18-32°C' },
              ].map(({ k, l, ph }) => (
                <div key={k}>
                  <label className="text-green-500 text-xs mb-1 block">{l}</label>
                  <input className="input-field" value={f[k]} onChange={e => upd({ [k]: e.target.value } as any)} placeholder={ph} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-green-500 text-xs mb-1 block">Impacto na Operação</label>
                <textarea className="textarea-field h-16" placeholder="Como as condições meteorológicas afetam as operações..." />
              </div>
            </div>
          )}

          {tab === 'meios' && (
            <div className="space-y-4">
              {state.fase01.subordinateEchelons && state.fase01.subordinateEchelons.length > 0 && (
                <div className="border border-military-green/50 bg-black/20 rounded p-3 space-y-2">
                  <label className="text-military-gold text-xs font-bold block uppercase tracking-wider">
                    Escalões Subordinados (Importados da Análise da Missão)
                  </label>
                  <ul className="list-disc list-inside text-xs text-green-400 space-y-1">
                    {state.fase01.subordinateEchelons.map((sub, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-white">{sub}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      const listStr = state.fase01.subordinateEchelons.map(s => `- ${s}: [Efetivo/Equipamento/Apoio]`).join('\n')
                      const currentVal = f.meiosDisponiveis ? `${f.meiosDisponiveis}\n\n` : ''
                      upd({ meiosDisponiveis: `${currentVal}Composição Detalhada dos Meios por Subordinado:\n${listStr}` })
                    }}
                    className="mt-2 text-[10px] text-military-gold border border-military-gold/30 hover:border-military-gold hover:bg-military-green/20 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Importar Estrutura de Meios Detalhada
                  </button>
                </div>
              )}

              <TextArea label="Meios Disponíveis" val={f.meiosDisponiveis} onChg={v => upd({ meiosDisponiveis: v })} ph="Unidades, efetivos, armamentos, viaturas, aeronaves, apoio logístico disponíveis..." />
              <div>
                <label className="text-green-500 text-xs mb-1 block">Poder Relativo de Combate (PRC)</label>
                <div className="flex gap-2">
                  {['Superior', 'Equivalente', 'Inferior'].map(p => (
                    <button key={p} type="button" onClick={() => upd({ prc: p })}
                      className={`flex-1 py-2 text-xs rounded border cursor-pointer ${f.prc === p ? 'bg-military-green border-military-gold text-military-gold' : 'border-green-800 text-green-600 hover:border-green-600'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'tempo' && (
            <div className="space-y-3">
              <TextArea label="Tempo Disponível para Planejamento" val={f.tempoPlj} onChg={v => upd({ tempoPlj: v })} ph="ex: 12 horas a partir de H-12..." />
              <TextArea label="Tempo de Execução Estimado" val={f.tempoExec} onChg={v => upd({ tempoExec: v })} ph="ex: 72 horas / 3 fases de 24h cada..." />
            </div>
          )}

          {tab === 'civis' && (
            <div className="space-y-3">
              <p className="text-green-600 text-xs italic">AECOPE: Áreas, Estruturas, Capacidades, Organizações, Pessoas, Eventos</p>
              {[
                { k: 'areas' as const, l: 'Áreas', ph: 'Divisão político-administrativa, zonas de valor econômico e cultural...' },
                { k: 'estruturas' as const, l: 'Estruturas', ph: 'Hospitais, escolas, pontes, estações de energia, postos de comando civis...' },
                { k: 'capacidades' as const, l: 'Capacidades', ph: 'Serviços de saúde, segurança pública, abastecimento de água e energia...' },
                { k: 'organizacoes' as const, l: 'Organizações', ph: 'ONGs, órgãos governamentais, grupos religiosos, organizações criminosas...' },
                { k: 'pessoas' as const, l: 'Pessoas', ph: 'Líderes locais, grupos de influência, refugiados, população deslocada...' },
                { k: 'eventos' as const, l: 'Eventos', ph: 'Eleições, celebrações, colheitas, eventos de segurança relevantes...' },
              ].map(({ k, l, ph }) => (
                <TextArea key={k} label={l} val={f[k]} onChg={v => upd({ [k]: v } as any)} ph={ph} />
              ))}
            </div>
          )}

          {tab === 'fff' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={generateFFF} className="btn-secondary text-xs flex items-center gap-1 cursor-pointer">
                  ✨ Gerar FFF automaticamente
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-green-400 text-xs font-bold uppercase tracking-wider">Fatores de Força ✓</label>
                    <button onClick={() => upd({ fff: { ...f.fff, forcas: [...f.fff.forcas, ''] } })} className="text-military-gold cursor-pointer"><Plus size={14}/></button>
                  </div>
                  {f.fff.forcas.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input className="input-field text-xs" value={item}
                        onChange={e => { const arr = [...f.fff.forcas]; arr[i] = e.target.value; upd({ fff: { ...f.fff, forcas: arr } }) }} placeholder={`Força ${i + 1}`} />
                      <button onClick={() => upd({ fff: { ...f.fff, forcas: f.fff.forcas.filter((_, j) => j !== i) } })} className="text-red-600 cursor-pointer"><Trash2 size={13}/></button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-red-400 text-xs font-bold uppercase tracking-wider">Fatores de Fraqueza ✗</label>
                    <button onClick={() => upd({ fff: { ...f.fff, fraquezas: [...f.fff.fraquezas, ''] } })} className="text-military-gold cursor-pointer"><Plus size={14}/></button>
                  </div>
                  {f.fff.fraquezas.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input className="input-field text-xs" value={item}
                        onChange={e => { const arr = [...f.fff.fraquezas]; arr[i] = e.target.value; upd({ fff: { ...f.fff, fraquezas: arr } }) }} placeholder={`Fraqueza ${i + 1}`} />
                      <button onClick={() => upd({ fff: { ...f.fff, fraquezas: f.fff.fraquezas.filter((_, j) => j !== i) } })} className="text-red-600 cursor-pointer"><Trash2 size={13}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'estimativas' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <p className="text-green-600 text-xs italic">Compilação das estimativas funcionais correntes das Seções do Estado-Maior (Anexo C)</p>
                <button
                  onClick={generateEstimativas}
                  disabled={loadingEstimativas}
                  className="btn-secondary text-xs flex items-center gap-1 cursor-pointer"
                >
                  {loadingEstimativas ? <Loader size={12} className="animate-spin" /> : <Brain size={12} />}
                  {loadingEstimativas ? 'Gerando...' : 'Gerar Estimativas com IA'}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 's2' as const, label: 'Estimativa de Inteligência (S2)', ph: 'Análise de terreno, clima e inimigo...' },
                  { key: 's3' as const, label: 'Estimativa de Operações (S3)', ph: 'Poder relativo de combate e manobra tática...' },
                  { key: 's4' as const, label: 'Estimativa de Logística (S4)', ph: 'Suprimentos, manutenção e transportes...' },
                  { key: 's5' as const, label: 'Estimativa de Assuntos Civis (S5)', ph: 'População civil, infraestrutura e cooperação...' },
                ].map(({ key, label, ph }) => (
                  <div key={key} className="bg-card-bg border border-green-950 p-3 rounded space-y-1">
                    <label className="text-military-gold font-bold block text-[10px] uppercase tracking-wider">{label}</label>
                    <textarea
                      className="textarea-field h-24 font-mono text-xs bg-black/20"
                      value={f.estimativas?.[key] || ''}
                      onChange={e => upd({ estimativas: { ...f.estimativas, [key]: e.target.value } })}
                      placeholder={ph}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { upd({ status: 'completed' }); dispatch({ type: 'SET_PHASE', payload: 3 }); if (state.fase03.status === 'pending') dispatch({ type: 'UPDATE_FASE03', payload: { status: 'in_progress' } }) }}
          className="btn-primary flex items-center gap-2 cursor-pointer">
          <CheckCircle size={16} /> Concluir Fase 02 → Fase 03
        </button>
      </div>
    </div>
  )
}
