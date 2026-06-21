'use client'
import React, { useState } from 'react'
import { usePPCOT } from '@/lib/store'
import { ChevronLeft, ChevronRight, X, Play, Shield, Calendar, List, CheckCircle2, Award } from 'lucide-react'

interface BriefingSlidesProps {
  onClose: () => void
}

export default function BriefingSlides({ onClose }: BriefingSlidesProps) {
  const { state } = usePPCOT()
  const [activeBriefing, setActiveBriefing] = useState<number>(1)
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const f1 = state.fase01
  const f2 = state.fase02
  const f3 = state.fase03
  const f4 = state.fase04
  const f5 = state.fase05
  const f6 = state.fase06

  // Estrutura de Briefings e Slides
  const briefings = [
    {
      id: 1,
      title: '1º Briefing — Análise da Missão',
      slides: [
        {
          title: 'PPCOT — Exame de Situação do Comandante',
          subtitle: state.operationName,
          content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Shield size={64} className="text-military-gold animate-bounce-slow" />
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest">{state.operationName}</h1>
              <p className="text-military-gold text-lg font-medium">1º Briefing — Análise da Missão e Considerações Preliminares</p>
              <div className="h-0.5 w-32 bg-military-gold"></div>
              <p className="text-green-500 text-xs mt-3 uppercase tracking-wider">Base Doutrinária: EB70-MC-10.211 · Seção 4.3.4</p>
            </div>
          )
        },
        {
          title: 'Elementos da Missão (5W)',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs h-full justify-center">
              {[
                { label: 'QUEM (Força)', val: f1.who || 'Não informado' },
                { label: 'O QUÊ (Tarefa)', val: f1.what || 'Não informado' },
                { label: 'QUANDO (Tempo)', val: f1.when || 'Não informado' },
                { label: 'ONDE (Espaço)', val: f1.where || 'Não informado' },
                { label: 'PARA QUÊ (Finalidade)', val: f1.why || 'Não informado' }
              ].map((w, idx) => (
                <div key={idx} className="bg-military-green/20 border border-green-950 p-3 rounded">
                  <span className="text-military-gold font-bold block uppercase tracking-wider mb-1 text-[10px]">{w.label}</span>
                  <p className="text-white font-medium text-sm">{w.val}</p>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Tarefas e Restrições',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-blue-400 font-bold block uppercase tracking-wider mb-2 text-[10px]">Tarefas Impostas</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {f1.assignedTasks.map((t, i) => <li key={i}>{t}</li>)}
                  {f1.assignedTasks.length === 0 && <li className="italic text-green-700">Nenhuma tarefa imposta registrada.</li>}
                </ul>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-yellow-400 font-bold block uppercase tracking-wider mb-2 text-[10px]">Tarefas Deduzidas</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {f1.impliedTasks.map((t, i) => <li key={i}>{t}</li>)}
                  {f1.impliedTasks.length === 0 && <li className="italic text-green-700">Nenhuma tarefa deduzida registrada.</li>}
                </ul>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-red-400 font-bold block uppercase tracking-wider mb-2 text-[10px]">Restrições</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {f1.restrictions.map((t, i) => <li key={i}>{t}</li>)}
                  {f1.restrictions.length === 0 && <li className="italic text-green-700">Nenhuma restrição registrada.</li>}
                </ul>
              </div>
            </div>
          )
        },
        {
          title: 'Novo Enunciado da Missão & Intenção Inicial',
          content: (
            <div className="space-y-4 text-xs">
              <div className="bg-military-green/20 border border-military-gold/30 p-4 rounded">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-1 text-[10px]">Novo Enunciado da Missão</span>
                <p className="text-white text-sm font-medium leading-relaxed italic">
                  "{f1.newMissionStatement || 'Enunciado não formulado.'}"
                </p>
              </div>
              <div className="bg-military-green/20 border border-military-gold/30 p-4 rounded">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-1 text-[10px]">Intenção Inicial do Comandante</span>
                <p className="text-white text-sm font-medium leading-relaxed">
                  {f1.initialIntent || 'Intenção não definida.'}
                </p>
              </div>
            </div>
          )
        },
        {
          title: 'Plano de Tempo & EEI',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">Plano de Utilização do Tempo</span>
                <p className="text-white text-sm whitespace-pre-line leading-relaxed">
                  {f1.timePlan || 'Plano de tempo não elaborado.'}
                </p>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">Elementos Essenciais de Inteligência (EEI)</span>
                <ul className="list-decimal pl-4 space-y-1 text-gray-300">
                  {f1.eeiList.map((e, i) => <li key={i}>{e}</li>)}
                  {f1.eeiList.length === 0 && <li className="italic text-green-700">Nenhum EEI inicial registrado.</li>}
                </ul>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 2,
      title: '2º Briefing — Situação e Compreensão',
      slides: [
        {
          title: 'Análise do Inimigo (DICOVAP)',
          content: (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Dispositivo', val: f2.dicovap.dispositivo },
                { label: 'Composição', val: f2.dicovap.composicao },
                { label: 'Valor', val: f2.dicovap.valor },
                { label: 'Atividades Recentes', val: f2.dicovap.atividades },
                { label: 'Peculiaridades', val: f2.dicovap.peculiaridades }
              ].map((d, i) => (
                <div key={i} className="bg-military-green/20 border border-green-950 p-2.5 rounded">
                  <span className="text-red-400 font-bold block uppercase tracking-wider mb-1 text-[9px]">{d.label}</span>
                  <p className="text-white max-h-24 overflow-y-auto pr-1">{d.val || 'Não informado'}</p>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Análise Militar do Terreno (OCOAV)',
          content: (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Observação e Campos de Tiro', val: f2.ocoav.observacao },
                { label: 'Cobertas e Abrigos', val: f2.ocoav.cobertas },
                { label: 'Obstáculos', val: f2.ocoav.obstaculos },
                { label: 'Acidentes Capitais', val: f2.ocoav.acidentesCapitais },
                { label: 'Vias de Acesso', val: f2.ocoav.viasDeAcesso }
              ].map((o, i) => (
                <div key={i} className="bg-military-green/20 border border-green-950 p-2.5 rounded">
                  <span className="text-military-gold font-bold block uppercase tracking-wider mb-1 text-[9px]">{o.label}</span>
                  <p className="text-white max-h-24 overflow-y-auto pr-1">{o.val || 'Não informado'}</p>
                </div>
              ))}
            </div>
          )
        },
        {
          title: 'Fatores Civis (AECOPE) & Meteorologia',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-military-green/20 border border-green-950 p-3 rounded md:col-span-2">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">AECOPE (Fatores Civis)</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-green-400">Áreas/Estruturas:</strong> {f2.areas || '—'} / {f2.estruturas || '—'}</div>
                  <div><strong className="text-green-400">Capacidades:</strong> {f2.capacidades || '—'}</div>
                  <div><strong className="text-green-400">Organizações/Pessoas:</strong> {f2.organizacoes || '—'} / {f2.pessoas || '—'}</div>
                  <div><strong className="text-green-400">Eventos:</strong> {f2.eventos || '—'}</div>
                </div>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">Condições Meteorológicas</span>
                <div className="space-y-1 text-gray-300">
                  <div><strong>Visibilidade:</strong> {f2.visibilidade || '—'}</div>
                  <div><strong>Vento:</strong> {f2.vento || '—'}</div>
                  <div><strong>Precipitação:</strong> {f2.precipitacao || '—'}</div>
                  <div><strong>Temperatura:</strong> {f2.temperatura || '—'}</div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Poder Relativo de Combate (PRC) & FFF',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-military-green/20 border border-green-950 p-3 rounded flex flex-col justify-center items-center text-center">
                <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">Poder Relativo de Combate</span>
                <span className="text-2xl font-black text-white uppercase">{f2.prc || 'Não Analisado'}</span>
                <p className="text-green-600 text-[10px] mt-2">Classificação de meios comparativos amigo vs. inimigo</p>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-green-400 font-bold block uppercase tracking-wider mb-2 text-[10px]">Fatores de Força (Próprios)</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {f2.fff.forcas.map((x, i) => <li key={i}>{x}</li>)}
                  {f2.fff.forcas.length === 0 && <li className="italic text-green-700">Nenhum fator de força listado.</li>}
                </ul>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                <span className="text-red-400 font-bold block uppercase tracking-wider mb-2 text-[10px]">Fatores de Fraqueza</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300">
                  {f2.fff.fraquezas.map((x, i) => <li key={i}>{x}</li>)}
                  {f2.fff.fraquezas.length === 0 && <li className="italic text-green-700">Nenhum fator de fraqueza listado.</li>}
                </ul>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 3,
      title: '3º Briefing — Geração de Linhas de Ação',
      slides: [
        {
          title: 'Possibilidades do Inimigo (Psb Ini)',
          content: (
            <div className="space-y-2 text-xs">
              {f3.psbIni.map((psb, i) => (
                <div key={psb.id} className="bg-military-green/20 border border-red-900/40 p-2.5 rounded flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <span className="text-red-400 font-bold uppercase block text-[9px]">Psb Ini #{i+1}</span>
                    <p className="text-white text-sm">{psb.descricao || '—'}</p>
                    <span className="text-gray-400 text-[10px]">Impacto: {psb.impacto || 'Não detalhado'}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex-shrink-0 ${
                    psb.probabilidade === 'alta' ? 'bg-red-950 text-red-400 border-red-700' : psb.probabilidade === 'media' ? 'bg-yellow-950 text-yellow-400 border-yellow-700' : 'bg-green-950 text-green-400 border-green-700'
                  }`}>
                    Probabilidade {psb.probabilidade}
                  </span>
                </div>
              ))}
              {f3.psbIni.length === 0 && <p className="text-center py-6 text-green-700 italic">Nenhuma possibilidade do inimigo cadastrada.</p>}
            </div>
          )
        },
        {
          title: 'Linhas de Ação Formuladas',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {f3.linhasAcao.map(la => (
                <div key={la.id} className="bg-military-green/20 border border-military-gold/30 p-3 rounded space-y-1.5">
                  <div className="flex justify-between items-center border-b border-green-950 pb-1">
                    <span className="text-military-gold font-bold text-sm">Linha de Ação {la.numero}</span>
                    <span className="text-[10px] bg-green-900 text-green-400 px-1.5 py-0.5 rounded">APA Aprovada</span>
                  </div>
                  <p className="text-white text-sm font-medium leading-relaxed">{la.sumario || la.oQue}</p>
                  <div className="text-[10px] text-gray-400 leading-normal pt-1">
                    <strong>Como:</strong> {la.como.substring(0, 80)}...
                  </div>
                </div>
              ))}
              {f3.linhasAcao.length === 0 && <p className="col-span-2 text-center py-8 text-green-700 italic">Nenhuma linha de ação formulada.</p>}
            </div>
          )
        }
      ]
    },
    {
      id: 4,
      title: '4º Briefing — Comparação de Linhas de Ação',
      slides: [
        {
          title: 'Matriz de Decisão (Critérios Ponderados)',
          content: (
            <div className="space-y-4 text-xs">
              <div className="overflow-x-auto bg-military-green/10 border border-military-green rounded p-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-800 text-green-500 font-bold text-[10px] uppercase">
                      <th className="py-1 pr-3 text-left">Critério</th>
                      <th className="py-1 px-2 text-center">Peso</th>
                      {f3.linhasAcao.map(la => <th key={la.id} className="py-1 px-3 text-center text-military-gold">L Aç {la.numero}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {f4.criterios.map(c => (
                      <tr key={c.id} className="border-b border-green-950/40 text-gray-300">
                        <td className="py-1.5 pr-3">{c.nome}</td>
                        <td className="py-1.5 px-2 text-center text-military-gold">{c.peso}</td>
                        {f3.linhasAcao.map(la => {
                          const pts = f4.pontuacoes.find(p => p.laId === la.id && p.criterioId === c.id)?.pontos ?? 0
                          return <td key={la.id} className="py-1.5 px-3 text-center">{pts} <span className="text-gray-500 text-[10px]">({pts * c.peso})</span></td>
                        })}
                      </tr>
                    ))}
                    <tr className="bg-military-green/20 font-bold text-white">
                      <td className="py-2 pr-3">Pontuação Total Ponderada</td>
                      <td className="py-2 px-2 text-center">—</td>
                      {f3.linhasAcao.map(la => {
                        const total = f4.criterios.reduce((sum, c) => {
                          const pts = f4.pontuacoes.find(p => p.laId === la.id && p.criterioId === c.id)?.pontos ?? 0
                          return sum + pts * c.peso
                        }, 0)
                        return <td key={la.id} className="py-2 px-3 text-center text-military-gold text-sm">{total}</td>
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          title: 'Recomendação do Estado-Maior',
          content: (
            <div className="space-y-4 text-xs">
              <div className="bg-military-green/20 border border-military-gold p-4 rounded flex items-start gap-4">
                <CheckCircle2 size={32} className="text-military-gold flex-shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <span className="text-military-gold font-bold text-sm uppercase tracking-wider block">Linha de Ação Recomendada</span>
                  <h4 className="text-white text-base font-bold">
                    L Aç {f3.linhasAcao.find(l => l.id === f4.laRecomendada)?.numero || 'Não Selecionada'}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {f3.linhasAcao.find(l => l.id === f4.laRecomendada)?.sumario || ''}
                  </p>
                </div>
              </div>
              <div className="bg-military-green/20 border border-green-950 p-4 rounded">
                <span className="text-green-500 font-bold block uppercase tracking-wider mb-1 text-[10px]">Justificativa Técnica do EM</span>
                <p className="text-white leading-relaxed text-sm italic">
                  "{f4.justificativa || 'Nenhuma justificativa cadastrada.'}"
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 5,
      title: '5º Briefing — Decisão do Comandante',
      slides: [
        {
          title: 'Decisão do Comandante & Modificações',
          content: (
            <div className="space-y-4 text-xs">
              <div className="bg-military-green/20 border border-military-gold p-4 rounded flex items-start gap-4">
                <Award size={32} className="text-military-gold flex-shrink-0 mt-1" />
                <div className="space-y-1">
                  <span className="text-military-gold font-bold text-xs uppercase tracking-wider block">Linha de Ação Aprovada</span>
                  <h4 className="text-white text-base font-bold">
                    L Aç {f3.linhasAcao.find(l => l.id === f5.laEscolhida)?.numero || 'Aprovada conforme rascunho/DIPLAN'}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {f3.linhasAcao.find(l => l.id === f5.laEscolhida)?.sumario || ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                  <span className="text-green-400 font-bold block uppercase tracking-wider mb-1 text-[10px]">Intenção do Comandante Aprovada</span>
                  <p className="text-white italic leading-relaxed">
                    "{f5.intencaoAtualizada || f1.initialIntent || 'Nenhuma alteração.'}"
                  </p>
                </div>
                <div className="bg-military-green/20 border border-green-950 p-3 rounded">
                  <span className="text-yellow-400 font-bold block uppercase tracking-wider mb-1 text-[10px]">Modificações e Condicionantes</span>
                  <p className="text-white leading-relaxed">
                    {f5.modificacoes || 'Nenhuma modificação decretada pelo Comandante.'}
                  </p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'DIPLAN — Diretriz de Planejamento do Comandante',
          content: (
            <div className="bg-[#0b1611] border border-military-green rounded p-4 text-xs h-full flex flex-col">
              <span className="text-military-gold font-bold block uppercase tracking-wider mb-2 text-[10px]">DIPLAN Atualizada (Fase 05)</span>
              <div className="text-gray-300 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto pr-1 select-all font-mono text-[11px] bg-black/40 p-3 rounded border border-green-950">
                {f5.diplanAtualizada || 'DIPLAN não preenchida.'}
              </div>
            </div>
          )
        }
      ]
    }
  ]

  // Obter briefing e slide ativo
  const activeB = briefings.find(b => b.id === activeBriefing) || briefings[0]
  const slide = activeB.slides[currentSlide] || activeB.slides[0]

  const nextSlide = () => {
    if (currentSlide < activeB.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else if (activeBriefing < briefings.length) {
      setActiveBriefing(activeBriefing + 1)
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else if (activeBriefing > 1) {
      const prevB = briefings.find(b => b.id === activeBriefing - 1)!
      setActiveBriefing(activeBriefing - 1)
      setCurrentSlide(prevB.slides.length - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#070d0a]/98 backdrop-blur-md z-50 flex flex-col justify-between p-6 overflow-hidden select-none animate-fade-in no-print">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-military-green pb-3">
        <div className="flex items-center gap-3">
          <Shield className="text-military-gold animate-pulse-gold" size={24} />
          <div>
            <h2 className="text-military-gold font-bold text-md uppercase tracking-widest">{state.operationName}</h2>
            <p className="text-green-500 text-xs mt-0.5">Modo Apresentação de Briefings (EB70-MC-10.211)</p>
          </div>
        </div>

        {/* Seletor de Briefing */}
        <div className="flex items-center gap-1.5 bg-black/60 border border-military-green rounded-full p-1 text-xs">
          {briefings.map(b => (
            <button
              key={b.id}
              onClick={() => { setActiveBriefing(b.id); setCurrentSlide(0) }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeBriefing === b.id ? 'bg-military-gold text-military-green font-bold' : 'text-green-400 hover:text-white'
              }`}
            >
              {b.id}º Briefing
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-red-700 hover:text-red-500 bg-red-950/20 border border-red-900/30 hover:border-red-600 rounded p-1.5 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Slide Body */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-5xl w-full mx-auto py-8">
        <div className="w-full bg-[#0d1611]/80 border border-military-gold/30 shadow-2xl rounded-xl p-8 md:p-10 flex flex-col justify-between h-[450px] relative overflow-hidden backdrop-blur-sm">
          {/* Fundo Tático */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

          {/* Slide Title */}
          <div className="border-b border-green-950/80 pb-3 mb-6 flex justify-between items-center flex-shrink-0">
            <h3 className="text-military-gold font-bold text-lg uppercase tracking-wider">{slide.title}</h3>
            <span className="text-[10px] bg-military-green text-green-400 font-bold px-2 py-0.5 rounded-full">
              Slide {currentSlide + 1} de {activeB.slides.length}
            </span>
          </div>

          {/* Slide Content */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-center">
            {slide.content}
          </div>

          {/* Slide Footer */}
          <div className="border-t border-green-950/50 pt-4 mt-6 flex justify-between items-center text-[10px] text-green-700 flex-shrink-0 uppercase tracking-widest font-semibold">
            <span>Estado-Maior · EB70-MC-10.211</span>
            <span className="text-military-gold font-bold">{activeB.title}</span>
            <span>Reservado</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-military-green pt-4">
        <div className="text-xs text-green-600">
          Dica: Use as setas do teclado (Esquerda/Direita) ou os botões para navegar.
        </div>

        {/* Botoes de Controle */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-white text-xs font-bold w-20 text-center">
            Slide {currentSlide + 1} / {activeB.slides.length}
          </span>
          <button
            onClick={nextSlide}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1 cursor-pointer"
          >
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
