'use client'
import React, { useState } from 'react'
import { Map, Eye, EyeOff, Plus, Trash2, Shield, AlertTriangle, Crosshair, Award } from 'lucide-react'

interface Marker {
  id: string
  x: number
  y: number
  type: 'friendly' | 'enemy' | 'objective'
  label: string
}

interface TacticalMapProps {
  influenciaOponente: 'verde' | 'amarelo' | 'vermelho' | ''
  onUpdateInfluencia?: (val: 'verde' | 'amarelo' | 'vermelho' | '') => void
  ocoav?: {
    observacao: string
    cobertas: string
    obstaculos: string
    acidentesCapitais: string
    viasDeAcesso: string
  }
}

export default function TacticalMap({
  influenciaOponente,
  onUpdateInfluencia,
  ocoav
}: TacticalMapProps) {
  const [showContours, setShowContours] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showInfluence, setShowInfluence] = useState(true)
  const [activeLayer, setActiveLayer] = useState<'none' | 'norte' | 'centro' | 'sul'>('none')
  const [markerType, setMarkerType] = useState<'friendly' | 'enemy' | 'objective'>('friendly')
  const [markerLabel, setMarkerLabel] = useState('')
  const [markers, setMarkers] = useState<Marker[]>([
    { id: '1', x: 200, y: 350, type: 'friendly', label: '1ª Bda C Bld' },
    { id: '2', x: 280, y: 320, type: 'friendly', label: 'Cia C/5' },
    { id: '3', x: 500, y: 150, type: 'enemy', label: 'Força Oponente A' },
    { id: '4', x: 580, y: 120, type: 'enemy', label: 'Artilharia Oponente' },
    { id: '5', x: 420, y: 220, type: 'objective', label: 'PD ALFA (Ponte)' }
  ])

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 800)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 500)

    if (markerLabel.trim()) {
      const newMarker: Marker = {
        id: Date.now().toString(),
        x,
        y,
        type: markerType,
        label: markerLabel
      }
      setMarkers([...markers, newMarker])
      setMarkerLabel('')
    }
  }

  const removeMarker = (id: string) => {
    setMarkers(markers.filter(m => m.id !== id))
  }

  const getRegionColor = (region: 'norte' | 'centro' | 'sul') => {
    if (!showInfluence || !influenciaOponente) return 'rgba(0,0,0,0)'
    
    if (influenciaOponente === 'vermelho') {
      return region === 'norte' ? 'rgba(239, 68, 68, 0.25)' : region === 'centro' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)'
    }
    if (influenciaOponente === 'amarelo') {
      return region === 'norte' ? 'rgba(245, 158, 11, 0.2)' : region === 'centro' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.1)'
    }
    return 'rgba(34, 197, 94, 0.15)'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-card-bg border border-military-green rounded-lg p-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="text-military-gold animate-pulse-gold" size={18} />
            <span className="text-white font-bold text-sm uppercase tracking-wider">PITCIC — Mapa de Situação Militar</span>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                showContours ? 'bg-military-green border-military-gold text-military-gold' : 'border-green-900 text-green-700'
              }`}
            >
              {showContours ? <Eye size={12} /> : <EyeOff size={12} />} Relevo
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                showGrid ? 'bg-military-green border-military-gold text-military-gold' : 'border-green-900 text-green-700'
              }`}
            >
              {showGrid ? <Eye size={12} /> : <EyeOff size={12} />} Grade UTM
            </button>
            <button
              onClick={() => setShowInfluence(!showInfluence)}
              className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                showInfluence ? 'bg-military-green border-military-gold text-military-gold' : 'border-green-900 text-green-700'
              }`}
            >
              {showInfluence ? <Eye size={12} /> : <EyeOff size={12} />} Influência
            </button>
          </div>
        </div>

        <div className="relative border border-military-green bg-[#0d1611] rounded overflow-hidden cursor-crosshair">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-auto select-none"
            onClick={handleMapClick}
          >
            {showGrid && (
              <g stroke="rgba(34, 197, 94, 0.07)" strokeWidth="1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`y-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <text key={`tx-${i}`} x={i * 100 + 5} y="15" fill="rgba(34,197,94,0.3)" fontSize="8">
                    UTM {22 + i}E
                  </text>
                ))}
              </g>
            )}

            {showContours && (
              <g fill="none" stroke="rgba(200, 169, 74, 0.12)" strokeWidth="1.5">
                <path d="M -50 100 Q 100 150 200 80 T 400 120 T 600 50 T 850 110" />
                <path d="M -50 150 Q 120 200 230 130 T 450 180 T 620 90 T 850 170" />
                <path d="M -50 220 Q 150 280 280 180 T 500 220 T 680 140 T 850 240" />
                <path d="M -50 300 Q 180 340 320 250 T 550 290 T 730 200 T 850 320" />
                <ellipse cx="650" cy="120" rx="60" ry="40" />
                <ellipse cx="650" cy="120" rx="40" ry="25" />
                <ellipse cx="650" cy="120" rx="20" ry="12" fill="rgba(200,169,74,0.02)" />
                <text x="640" y="123" fill="rgba(200, 169, 74, 0.2)" fontSize="8">Cota 420</text>

                <ellipse cx="150" cy="80" rx="80" ry="50" />
                <ellipse cx="150" cy="80" rx="55" ry="32" />
                <ellipse cx="150" cy="80" rx="30" ry="15" fill="rgba(200,169,74,0.02)" />
                <text x="140" y="83" fill="rgba(200, 169, 74, 0.2)" fontSize="8">Cota 310</text>
              </g>
            )}

            <path
              d="M -10 250 Q 180 230 310 290 T 520 280 T 810 330"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="10"
              opacity="0.65"
            />
            <path
              d="M -10 250 Q 180 230 310 290 T 520 280 T 810 330"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              opacity="0.8"
            />
            <text x="240" y="255" fill="#60a5fa" fontSize="9" fontWeight="bold" transform="rotate(7, 240, 255)">
              RIO VERDE (Obstáculo Natural)
            </text>

            <path
              d="M 120 -10 Q 160 200 250 280 T 450 330 T 700 510"
              fill="none"
              stroke="#4b5563"
              strokeWidth="5"
              opacity="0.5"
            />
            <path
              d="M 120 -10 Q 160 200 250 280 T 450 330 T 700 510"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.9"
            />
            <text x="440" y="348" fill="#d1d5db" fontSize="8" transform="rotate(12, 440, 348)">
              ROD. BR-101 (Via de Acesso)
            </text>

            <g fill="#ea580c">
              <circle cx="210" cy="180" r="14" opacity="0.2" />
              <circle cx="210" cy="180" r="4" />
              <text x="228" y="184" fill="#f97316" fontSize="10" fontWeight="bold">SANTA FÉ (Loc Cab)</text>

              <circle cx="680" cy="380" r="18" opacity="0.2" />
              <circle cx="680" cy="380" r="5" />
              <text x="610" y="405" fill="#f97316" fontSize="10" fontWeight="bold">PORTO DO SUL (Estrutura Crítica)</text>
            </g>

            <path
              d="M 0 0 L 800 0 L 800 220 L 0 220 Z"
              fill={getRegionColor('norte')}
              className="transition-all duration-300 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setActiveLayer('norte') }}
            />
            <path
              d="M 0 220 L 800 220 L 800 350 L 0 350 Z"
              fill={getRegionColor('centro')}
              className="transition-all duration-300 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setActiveLayer('centro') }}
            />
            <path
              d="M 0 350 L 800 350 L 800 500 L 0 500 Z"
              fill={getRegionColor('sul')}
              className="transition-all duration-300 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setActiveLayer('sul') }}
            />

            <line x1="0" y1="220" x2="800" y2="220" stroke="rgba(200, 169, 74, 0.3)" strokeDasharray="6 4" strokeWidth="1.5" />
            <line x1="0" y1="350" x2="800" y2="350" stroke="rgba(200, 169, 74, 0.3)" strokeDasharray="6 4" strokeWidth="1.5" />

            <text x="710" y="210" fill="rgba(200, 169, 74, 0.4)" fontSize="10" fontWeight="bold">SETOR NORTE</text>
            <text x="710" y="340" fill="rgba(200, 169, 74, 0.4)" fontSize="10" fontWeight="bold">SETOR CENTRAL</text>
            <text x="715" y="490" fill="rgba(200, 169, 74, 0.4)" fontSize="10" fontWeight="bold">SETOR SUL</text>

            {markers.map(m => {
              return (
                <g key={m.id} className="transition-all duration-300">
                  {m.type === 'friendly' && (
                    <g transform={`translate(${m.x - 14}, ${m.y - 10})`}>
                      <rect width="28" height="20" fill="#1e3a8a" fillOpacity="0.8" stroke="#3b82f6" strokeWidth="2" rx="2" />
                      <line x1="0" y1="0" x2="28" y2="20" stroke="#3b82f6" strokeWidth="1" />
                      <line x1="0" y1="20" x2="28" y2="0" stroke="#3b82f6" strokeWidth="1" />
                    </g>
                  )}
                  {m.type === 'enemy' && (
                    <g transform={`translate(${m.x}, ${m.y})`}>
                      <path d="M 0 -13 L 15 0 L 0 13 L -15 0 Z" fill="#7f1d1d" fillOpacity="0.8" stroke="#ef4444" strokeWidth="2" />
                      <line x1="-8" y1="0" x2="8" y2="0" stroke="#ef4444" strokeWidth="1" />
                      <line x1="0" y1="-8" x2="0" y2="8" stroke="#ef4444" strokeWidth="1" />
                    </g>
                  )}
                  {m.type === 'objective' && (
                    <g transform={`translate(${m.x}, ${m.y})`}>
                      <circle cx="0" cy="0" r="10" fill="#78350f" fillOpacity="0.8" stroke="#fbbf24" strokeWidth="2" />
                      <path d="M 0 -7 L 2 -2 L 7 -2 L 3 1 L 5 6 L 0 3 L -5 6 L -3 1 L -7 -2 L -2 -2 Z" fill="#fbbf24" />
                    </g>
                  )}
                  <text
                    x={m.x}
                    y={m.y + (m.type === 'enemy' ? 24 : 22)}
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {m.label}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-military-green p-2.5 rounded text-[10px] space-y-1.5 no-print">
            <div className="font-bold text-military-gold mb-1">LEGENDA TÁTICA</div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 bg-[#1e3a8a] border border-[#3b82f6] rounded inline-block"></span>
              <span className="text-gray-300">Unidade Amiga (Inf/Cav)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#7f1d1d] border border-[#ef4444] rotate-45 inline-block"></span>
              <span className="text-gray-300">Ameaça Oponente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#78350f] border border-[#fbbf24] rounded-full inline-block flex items-center justify-center text-[7px] text-[#fbbf24]">★</span>
              <span className="text-gray-300">Ponto Decisivo (PD)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
              <span className="text-gray-300">Rio (Obstáculo)</span>
            </div>
          </div>
        </div>
        <p className="text-green-700 text-[10px] italic">
          * Para inserir símbolos táticos: Preencha o "Nome do Símbolo", selecione a "Afiliação" e clique em qualquer local do mapa.
        </p>
      </div>

      <div className="bg-[#0b1611] rounded border border-military-green p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-military-green pb-2">
            <h3 className="text-military-gold font-bold text-xs uppercase tracking-wider">Controle e Informações</h3>
            <p className="text-green-600 text-[10px] mt-0.5">Clique em setores ou marcadores para detalhes</p>
          </div>

          {onUpdateInfluencia && (
            <div className="space-y-1">
              <label className="text-green-500 text-xs block font-bold">Classificação da Área Geral:</label>
              <div className="grid grid-cols-3 gap-1">
                {(['verde', 'amarelo', 'vermelho'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateInfluencia(c)}
                    className={`py-1 text-[10px] rounded uppercase font-bold border transition-all cursor-pointer ${
                      influenciaOponente === c
                        ? c === 'verde' ? 'bg-green-950 border-green-400 text-green-300'
                          : c === 'amarelo' ? 'bg-yellow-950 border-yellow-400 text-yellow-300'
                          : 'bg-red-950 border-red-400 text-red-300'
                        : 'border-green-950 text-green-700 hover:border-green-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card-bg border border-military-green rounded p-3 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-military-gold">
              <Shield size={13} />
              <span>Detalhamento do Terreno (OCOAV)</span>
            </div>
            {activeLayer === 'none' ? (
              <p className="text-green-600 text-[11px] italic">Clique em um dos três setores no mapa para analisar seus fatores detalhadamente.</p>
            ) : (
              <div className="space-y-1 text-[11px]">
                <p className="text-white font-bold uppercase">Setor {activeLayer}</p>
                <div className="space-y-1 mt-1.5 text-gray-300 max-h-40 overflow-y-auto pr-1">
                  {activeLayer === 'norte' && (
                    <>
                      <div><strong className="text-military-gold">Observação:</strong> Excelentes campos de tiro a partir das Cotas 310 e 420.</div>
                      <div className="mt-1"><strong className="text-military-gold">Cobertas:</strong> Matas esparsas. Baixa proteção.</div>
                      <div className="mt-1"><strong className="text-military-gold">Obstáculos:</strong> Relevo montanhoso acidentado no extremo norte.</div>
                      <div className="mt-1"><strong className="text-military-gold">Acidentes:</strong> Colinas dominantes.</div>
                      <div className="mt-1"><strong className="text-military-gold">Vias Acesso:</strong> Acesso à BR-101.</div>
                    </>
                  )}
                  {activeLayer === 'centro' && (
                    <>
                      <div><strong className="text-military-gold">Observação:</strong> Limitada pelas margens florestais do rio.</div>
                      <div className="mt-1"><strong className="text-military-gold">Cobertas:</strong> Alta densidade urbana em Santa Fé.</div>
                      <div className="mt-1"><strong className="text-military-gold">Obstáculos:</strong> O Rio Verde corre de leste a oeste, dividindo a AO.</div>
                      <div className="mt-1"><strong className="text-military-gold">Acidentes:</strong> Ponte da BR-101 em Santa Fé (PD Crítico).</div>
                      <div className="mt-1"><strong className="text-military-gold">Vias Acesso:</strong> Cruzamento rodo-hidroviário.</div>
                    </>
                  )}
                  {activeLayer === 'sul' && (
                    <>
                      <div><strong className="text-military-gold">Observação:</strong> Terreno plano, ampla visibilidade no setor leste.</div>
                      <div className="mt-1"><strong className="text-military-gold">Cobertas:</strong> Infraestrutura urbana do Porto do Sul.</div>
                      <div className="mt-1"><strong className="text-military-gold">Obstáculos:</strong> Áreas alagadas próximas à foz do rio.</div>
                      <div className="mt-1"><strong className="text-military-gold">Acidentes:</strong> Porto de águas profundas no sul.</div>
                      <div className="mt-1"><strong className="text-military-gold">Vias Acesso:</strong> Rede viária bem desenvolvida ligando ao centro.</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card-bg border border-military-green rounded p-3 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-military-gold">
              <Crosshair size={13} />
              <span>Adicionar Símbolo Tático</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-green-500 text-[10px] block mb-0.5">Nome do Símbolo / Unidade:</label>
                <input
                  className="input-field text-xs py-1"
                  value={markerLabel}
                  onChange={e => setMarkerLabel(e.target.value)}
                  placeholder="ex: 13º Reg. Cavalaria"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-green-500 text-[10px] block mb-0.5">Afiliação:</label>
                  <select
                    className="input-field text-xs py-1"
                    value={markerType}
                    onChange={e => setMarkerType(e.target.value as any)}
                  >
                    <option value="friendly">🔵 Força Amiga</option>
                    <option value="enemy">🔴 Oponente</option>
                    <option value="objective">🟡 Ponto Decisivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-military-green space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-military-gold">
            <span>Pontos no Mapa ({markers.length})</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {markers.map(m => (
              <div key={m.id} className="flex justify-between items-center bg-card-bg/60 border border-green-950 p-1.5 rounded text-[10px]">
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${m.type === 'friendly' ? 'bg-blue-500' : m.type === 'enemy' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-white truncate max-w-[120px]">{m.label}</span>
                </div>
                <button type="button" onClick={() => removeMarker(m.id)} className="text-red-700 hover:text-red-500 cursor-pointer">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
