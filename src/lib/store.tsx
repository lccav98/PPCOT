'use client'
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { PPCOTState, PhaseStatus, RiskMatrixItem, SyncGridCell } from './types'

const initialState: PPCOTState = {
  operationName: 'Nova Operação',
  selectedUnit: 'Principal',
  currentPhase: 1,
  fase01: {
    rawOrder: '', who: '', what: '', when: '', where: '', why: '',
    assignedTasks: [], impliedTasks: [], restrictions: [],
    subordinateEchelons: [],
    selectedUnit: 'Principal',
    unitAnalyses: {},
    newMissionStatement: '', initialIntent: '', eeiList: [], timePlan: '', oa1: '',
    status: 'pending'
  },
  fase02: {
    rawIntelligence: '',
    dicovap: { dispositivo: '', composicao: '', valor: '', atividades: '', peculiaridades: '' },
    ocoav: { observacao: '', cobertas: '', obstaculos: '', acidentesCapitais: '', viasDeAcesso: '' },
    visibilidade: '', vento: '', precipitacao: '', temperatura: '',
    meiosDisponiveis: '', prc: '', tempoPlj: '', tempoExec: '',
    areas: '', estruturas: '', capacidades: '', organizacoes: '', pessoas: '', eventos: '',
    fff: { forcas: [], fraquezas: [] }, influenciaOponente: '',
    estimativas: { s2: '', s3: '', s4: '', s5: '' },
    status: 'pending'
  },
  fase03: { psbIni: [], linhasAcao: [], matrizSincronizacao: '', syncGrid: [], selectedUnit: 'Principal', unitAnalyses: {}, status: 'pending' },
  fase04: { criterios: [], pontuacoes: [], justificativas: {}, apaFinalLA: {}, laRecomendada: '', justificativa: '', unitAnalyses: {}, status: 'pending' },
  fase05: { laEscolhida: '', modificacoes: '', intencaoAtualizada: '', diplanAtualizada: '', eeiAtualizados: [], oa4: '', unitAnalyses: {}, status: 'pending' },
  fase06: {
    classificacao: 'RESERVADO', numero: '', referencias: '',
    inimigo: '', forcasAmigas: '', missao: '', intencaoCmt: '',
    conceitoOperacao: '', tarefasSubordinados: '', instrucoesCoordenacao: '',
    apoioLogistico: '', comando: '', comunicacoes: '',
    unitAnalyses: {},
    status: 'pending'
  },
  riscos: []
}

type Action =
  | { type: 'SET_OPERATION_NAME'; payload: string }
  | { type: 'SET_PHASE'; payload: number }
  | { type: 'SET_SELECTED_UNIT'; payload: string }
  | { type: 'UPDATE_FASE01'; payload: Partial<PPCOTState['fase01']> }
  | { type: 'UPDATE_FASE02'; payload: Partial<PPCOTState['fase02']> }
  | { type: 'UPDATE_FASE03'; payload: Partial<PPCOTState['fase03']> }
  | { type: 'UPDATE_FASE04'; payload: Partial<PPCOTState['fase04']> }
  | { type: 'UPDATE_FASE05'; payload: Partial<PPCOTState['fase05']> }
  | { type: 'UPDATE_FASE06'; payload: Partial<PPCOTState['fase06']> }
  | { type: 'UPDATE_RISKS'; payload: RiskMatrixItem[] }
  | { type: 'RESET' }

function reducer(state: PPCOTState, action: Action): PPCOTState {
  switch (action.type) {
    case 'SET_OPERATION_NAME': return { ...state, operationName: action.payload }
    case 'SET_PHASE': return { ...state, currentPhase: action.payload }
    case 'SET_SELECTED_UNIT': return { ...state, selectedUnit: action.payload }
    case 'UPDATE_FASE01': return { ...state, fase01: { ...state.fase01, ...action.payload } }
    case 'UPDATE_FASE02': return { ...state, fase02: { ...state.fase02, ...action.payload } }
    case 'UPDATE_FASE03': return { ...state, fase03: { ...state.fase03, ...action.payload } }
    case 'UPDATE_FASE04': return { ...state, fase04: { ...state.fase04, ...action.payload } }
    case 'UPDATE_FASE05': return { ...state, fase05: { ...state.fase05, ...action.payload } }
    case 'UPDATE_FASE06': return { ...state, fase06: { ...state.fase06, ...action.payload } }
    case 'UPDATE_RISKS': return { ...state, riscos: action.payload }
    case 'RESET': return initialState
    default: return state
  }
}

interface ContextValue { state: PPCOTState; dispatch: React.Dispatch<Action> }
const PPCOTContext = createContext<ContextValue | null>(null)

export function PPCOTProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ppcot-state')
      if (saved) { try { return JSON.parse(saved) } catch { return init } }
    }
    return init
  })

  useEffect(() => {
    localStorage.setItem('ppcot-state', JSON.stringify(state))
  }, [state])

  return <PPCOTContext.Provider value={{ state, dispatch }}>{children}</PPCOTContext.Provider>
}

export function usePPCOT() {
  const ctx = useContext(PPCOTContext)
  if (!ctx) throw new Error('usePPCOT must be used inside PPCOTProvider')
  return ctx
}

