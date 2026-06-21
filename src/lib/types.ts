export type PhaseStatus = 'pending' | 'in_progress' | 'completed'

export interface UnitMissionAnalysis {
  who: string
  what: string
  when: string
  where: string
  why: string
  assignedTasks: string[]
  impliedTasks: string[]
  restrictions: string[]
  newMissionStatement: string
  initialIntent: string
}

export interface MissionAnalysis {
  rawOrder: string; who: string; what: string; when: string; where: string; why: string
  assignedTasks: string[]; impliedTasks: string[]; restrictions: string[]
  subordinateEchelons: string[]
  selectedUnit: string
  unitAnalyses: Record<string, UnitMissionAnalysis>
  newMissionStatement: string; initialIntent: string; eeiList: string[]
  timePlan: string; oa1: string; status: PhaseStatus
}

export interface DICOVAPFactor {
  dispositivo: string; composicao: string; valor: string; atividades: string; peculiaridades: string
}

export interface OCOAVFactor {
  observacao: string; cobertas: string; obstaculos: string; acidentesCapitais: string; viasDeAcesso: string
}

export interface EstimativasData {
  s2: string
  s3: string
  s4: string
  s5: string
}

export interface SituacaoAnalysis {
  rawIntelligence: string;
  dicovap: DICOVAPFactor; ocoav: OCOAVFactor
  visibilidade: string; vento: string; precipitacao: string; temperatura: string
  meiosDisponiveis: string; prc: string; tempoPlj: string; tempoExec: string
  areas: string; estruturas: string; capacidades: string; organizacoes: string; pessoas: string; eventos: string
  fff: { forcas: string[]; fraquezas: string[] }
  influenciaOponente: 'verde' | 'amarelo' | 'vermelho' | ''
  estimativas: EstimativasData
  status: PhaseStatus
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

export interface SyncGridCell {
  fase: string
  funcao: string
  texto: string
}

export interface UnitCOAAnalysis {
  psbIni: PsbIni[]
  linhasAcao: LinhaDeAcao[]
  syncGrid: SyncGridCell[]
}

export interface LinhasAcaoData {
  psbIni: PsbIni[]
  linhasAcao: LinhaDeAcao[]
  matrizSincronizacao: string
  syncGrid: SyncGridCell[]
  selectedUnit: string
  unitAnalyses: Record<string, UnitCOAAnalysis>
  status: PhaseStatus
}

export interface CriterioAvaliacao { id: string; nome: string; peso: number }

export interface UnitComparacaoAnalysis {
  criterios: CriterioAvaliacao[]
  pontuacoes: { laId: string; criterioId: string; pontos: number }[]
  justificativas?: Record<string, string>
  apaFinalLA: Record<string, { adequabilidade: boolean; praticabilidade: boolean; aceitabilidade: boolean }>
  laRecomendada: string
  justificativa: string
}

export interface ComparacaoData {
  criterios: CriterioAvaliacao[]
  pontuacoes: { laId: string; criterioId: string; pontos: number }[]
  justificativas?: Record<string, string>
  apaFinalLA: Record<string, { adequabilidade: boolean; praticabilidade: boolean; aceitabilidade: boolean }>
  laRecomendada: string; justificativa: string; status: PhaseStatus
  unitAnalyses?: Record<string, UnitComparacaoAnalysis>
}

export interface UnitDecisaoAnalysis {
  laEscolhida: string
  modificacoes: string
  intencaoAtualizada: string
  diplanAtualizada: string
  eeiAtualizados: string[]
  oa4: string
}

export interface DecisaoData {
  laEscolhida: string; modificacoes: string; intencaoAtualizada: string
  diplanAtualizada: string; eeiAtualizados: string[]; oa4: string; status: PhaseStatus
  unitAnalyses?: Record<string, UnitDecisaoAnalysis>
}

export interface UnitOrdemOperacoesAnalysis {
  classificacao: string; numero: string; referencias: string
  inimigo: string; forcasAmigas: string; missao: string; intencaoCmt: string
  conceitoOperacao: string; tarefasSubordinados: string; instrucoesCoordenacao: string
  apoioLogistico: string; comando: string; comunicacoes: string
}

export interface OrdemOperacoes {
  classificacao: string; numero: string; referencias: string
  inimigo: string; forcasAmigas: string; missao: string; intencaoCmt: string
  conceitoOperacao: string; tarefasSubordinados: string; instrucoesCoordenacao: string
  apoioLogistico: string; comando: string; comunicacoes: string; status: PhaseStatus
  unitAnalyses?: Record<string, UnitOrdemOperacoesAnalysis>
}

export interface RiskMatrixItem {
  id: string
  descricao: string
  probabilidade: 'baixa' | 'media' | 'alta'
  gravidade: 'baixa' | 'media' | 'alta'
  nivel: 'baixo' | 'medio' | 'alto' | 'extremo'
  mitigacao: string
}

export interface PPCOTState {
  operationName: string; selectedUnit: string; fase01: MissionAnalysis; fase02: SituacaoAnalysis
  fase03: LinhasAcaoData; fase04: ComparacaoData; fase05: DecisaoData
  fase06: OrdemOperacoes; riscos: RiskMatrixItem[]; currentPhase: number
}


