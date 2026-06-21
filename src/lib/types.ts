export type PhaseStatus = 'pending' | 'in_progress' | 'completed'

export interface MissionAnalysis {
  rawOrder: string; who: string; what: string; when: string; where: string; why: string
  assignedTasks: string[]; impliedTasks: string[]; restrictions: string[]
  newMissionStatement: string; initialIntent: string; eeiList: string[]
  timePlan: string; status: PhaseStatus
}

export interface DICOVAPFactor {
  dispositivo: string; composicao: string; valor: string; atividades: string; peculiaridades: string
}

export interface OCOAVFactor {
  observacao: string; cobertas: string; obstaculos: string; acidentesCapitais: string; viasDeAcesso: string
}

export interface SituacaoAnalysis {
  dicovap: DICOVAPFactor; ocoav: OCOAVFactor
  visibilidade: string; vento: string; precipitacao: string; temperatura: string
  meiosDisponiveis: string; prc: string; tempoPlj: string; tempoExec: string
  areas: string; estruturas: string; capacidades: string; organizacoes: string; pessoas: string; eventos: string
  fff: { forcas: string[]; fraquezas: string[] }
  influenciaOponente: 'verde' | 'amarelo' | 'vermelho' | ''; status: PhaseStatus
}

export interface LinhaDeAcao {
  id: string; numero: number; oQue: string; como: string; onde: string; paraQue: string; quando: string
  faseamento: string; sumario: string
  apaAdequabilidade: boolean | null; apaPraticabilidade: boolean | null; apaAceitabilidade: boolean | null
  esquemaManobra: string
}

export interface PsbIni {
  id: string; descricao: string; probabilidade: 'alta' | 'media' | 'baixa'; impacto: string
}

export interface LinhasAcaoData {
  psbIni: PsbIni[]; linhasAcao: LinhaDeAcao[]; matrizSincronizacao: string; status: PhaseStatus
}

export interface CriterioAvaliacao { id: string; nome: string; peso: number }

export interface ComparacaoData {
  criterios: CriterioAvaliacao[]
  pontuacoes: { laId: string; criterioId: string; pontos: number }[]
  apaFinalLA: Record<string, { adequabilidade: boolean; praticabilidade: boolean; aceitabilidade: boolean }>
  laRecomendada: string; justificativa: string; status: PhaseStatus
}

export interface DecisaoData {
  laEscolhida: string; modificacoes: string; intencaoAtualizada: string
  diplanAtualizada: string; eeiAtualizados: string[]; status: PhaseStatus
}

export interface OrdemOperacoes {
  classificacao: string; numero: string; referencias: string
  inimigo: string; forcasAmigas: string; missao: string; intencaoCmt: string
  conceitoOperacao: string; tarefasSubordinados: string; instrucoesCoordenacao: string
  apoioLogistico: string; comando: string; comunicacoes: string; status: PhaseStatus
}

export interface PPCOTState {
  operationName: string; fase01: MissionAnalysis; fase02: SituacaoAnalysis
  fase03: LinhasAcaoData; fase04: ComparacaoData; fase05: DecisaoData
  fase06: OrdemOperacoes; currentPhase: number
}
