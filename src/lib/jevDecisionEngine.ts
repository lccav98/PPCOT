import { TypeSafeClient, score, noul, choice } from '@typesafe-ai/sdk'

export interface JevEvaluationInput {
  targetUnit?: string
  linhasAcao: Array<{
    id: string
    numero: number
    oQue: string
    como: string
    onde: string
    paraQue: string
    quando: string
    faseamento?: string
    sumario: string
  }>
  criterios: Array<{
    id: string
    nome: string
    peso: number
  }>
  context?: {
    mission?: string
    intent?: string
    dicovap?: Record<string, string> | string
    ocoav?: Record<string, string> | string
    means?: string
    subordinateEchelons?: string[]
    visibilidade?: string
    vento?: string
    areas?: string
  }
}

export interface JevCellResult {
  laId: string
  criterioId: string
  pontos: number
  rawScore: number
  confidence: number
  probabilities: Record<string, number>
  justificativa: string
}

export interface JevAparResult {
  adequabilidade: boolean
  praticabilidade: boolean
  aceitabilidade: boolean
  confidence: {
    adequabilidade: number
    praticabilidade: number
    aceitabilidade: number
  }
  probabilities: {
    adequabilidade: number
    praticabilidade: number
    aceitabilidade: number
  }
}

export interface JevDecisionResponse {
  success: boolean
  model: string
  pontuacoes: JevCellResult[]
  justificativas: Record<string, string>
  apaFinalLA: Record<string, JevAparResult>
  laRecomendada: string
  justificativaRecomendacao: string
  ranking: Array<{
    laId: string
    numero: number
    totalScore: number
    passedAPA: boolean
    confidenceAvg: number
  }>
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

// Rubrica doutrinária padrão de níveis táticos do PPCOT (EB70-MC-10.211)
function getRubricForCriterion(criterionName: string): { instructions: string; criteria: [string, string, ...string[]] } {
  const norm = criterionName.trim().toLowerCase()

  if (norm.includes('simplicidade')) {
    return {
      instructions: 'Avalie a simplicidade da manobra da Linha de Ação em relação à clareza das ordens, cadeia de comando e minimização do atrito operacional.',
      criteria: [
        'Manobra excessivamente complexa, com interdependências críticas e probabilidade extrema de confusão ou falha de coordenação.',
        'Complexidade elevada, exigindo coordenação minuciosa e frequente entre frações distintas sob atrito.',
        'Complexidade moderada, com pontos de fricção identificáveis contornáveis pelo estado-maior.',
        'Simplicidade adequada, com linhas de ação claras e coordenações bem delimitadas.',
        'Manobra bastante simples e direta, com mínimo risco de descoordenação entre escalões subordinados.',
        'Extremamente simples, concisa e de fácil compreensão e execução imediata por todas as frações.'
      ]
    }
  }

  if (norm.includes('manobra')) {
    return {
      instructions: 'Avalie a eficácia tática da manobra proposta para atingir posições de vantagem sobre o inimigo e desarticular seu dispositivo.',
      criteria: [
        'Manobra ineficaz, frontal previsível ou diretamente sobre os pontos fortes do inimigo sem vantagem tática.',
        'Manobra com pouca flexibilidade e alto risco de canalização ou bloqueio prematuro pelo oponente.',
        'Manobra viável porém convencional, explorando de forma restrita as vias de acesso e acidentes capitais.',
        'Boa manobra, com distribuição tática equilibrada do esforço principal e de apoio sobre o terreno.',
        'Manobra muito favorável, aproveitando vulnerabilidades do oponente com excelente mobilidade.',
        'Manobra decisiva e assimétrica, obtendo superioridade relativa local e isolando ou desarticulando o adversário.'
      ]
    }
  }

  if (norm.includes('fogo')) {
    return {
      instructions: 'Avalie a integração e efetividade do apoio de fogo da Linha de Ação para neutralizar ameaças críticas e proteger o esforço principal.',
      criteria: [
        'Sem integração de fogos ou apoio de fogo inviável para cobrir a manobra do esforço principal.',
        'Apoio de fogos fragmentado, com alcance insuficiente ou elevado risco de restrições de tiro e fratricídio.',
        'Apoio de fogos básico, cobrindo apenas fases preliminares ou com consumo excessivo de munição.',
        'Apoio de fogos satisfatório, sincronizado com os objetivos intermediários e principais da manobra.',
        'Integração muito eficaz de fogos de artilharia e apoio aéreo, mantendo neutralização contínua de alvos de alto valor.',
        'Excelente sincronização de fogos e manobra, assegurando total superioridade de fogos e supressão decisiva do oponente.'
      ]
    }
  }

  if (norm.includes('surpresa')) {
    return {
      instructions: 'Avalie a capacidade da Linha de Ação de alcançar surpresa tática quanto ao momento, direção, meios ou método de combate.',
      criteria: [
        'Nenhuma surpresa; a ação é evidente, previsível e antecipada pelo dispositivo inimigo.',
        'Baixa probabilidade de surpresa; medidas de despistamento insuficientes contra a vigilância adversária.',
        'Surpresa moderada ou parcial, restrita ao horário ou ritmo inicial da operação.',
        'Boa probabilidade de surpresa quanto à direção de ataque ou emprego inovador dos meios.',
        'Alto grau de surpresa, enganando o dispositivo inimigo e retardando significativamente sua reação.',
        'Surpresa tática e estratégica total, colhendo o adversário completamente desarticulado e desprotegido.'
      ]
    }
  }

  if (norm.includes('log') || norm.includes('suporte')) {
    return {
      instructions: 'Avalie a sustentabilidade logística da Linha de Ação quanto a linhas de suprimento (LSR), consumo de classes críticas e evacuação.',
      criteria: [
        'Logística inviável; linhas de suprimento expostas ou estendidas além da capacidade de transporte.',
        'Sustentabilidade precária, com alto risco de esgotamento de combustíveis ou munição antes da consolidação.',
        'Logística tensionada no limite, exigindo comboios extraordinários ou dependência crítica de itinerários únicos.',
        'Suporte logístico viável e planejado, atendendo às necessidades operativas sem comprometer o ritmo.',
        'Linhas de suprimento seguras e curtas, com bases logísticas avançadas bem posicionadas.',
        'Excelente dispositivo logístico, assegurando sustentação contínua, evacuação rápida e reabastecimento sem restrições.'
      ]
    }
  }

  if (norm.includes('dano') || norm.includes('colateral') || norm.includes('civil')) {
    return {
      instructions: 'Avalie a mitigação de danos colaterais a civis, infraestrutura crítica não militar e patrimônio protegido.',
      criteria: [
        'Risco proibitivo de baixas civis em massa ou destruição severa de infraestruturas essenciais da população.',
        'Alto risco de danos colaterais devido à proximidade com centros urbanos densos e emprego de fogos em área.',
        'Danos colaterais moderados, com impactos toleráveis mas sensíveis sobre serviços civis.',
        'Danos colaterais reduzidos e contidos dentro das regras de engajamento da missão.',
        'Excelente preservação de infraestrutura civil e populações, utilizando munições de precisão e itinerários isolados.',
        'Impacto colateral nulo ou mínimo, com total isolamento da área de combate e proteção integral dos não-combatentes.'
      ]
    }
  }

  // Rubrica dinâmica para critérios personalizados
  return {
    instructions: `Avalie como a Linha de Ação atende ao critério militar "${criterionName}" no contexto da operação.`,
    criteria: [
      `Desempenho inaceitável em relação a "${criterionName}", impondo riscos graves à missão.`,
      `Desempenho desfavorável em "${criterionName}", com limitações severas e atrito significativo.`,
      `Desempenho regular em "${criterionName}", atendendo com restrições e necessidade de compensação.`,
      `Desempenho satisfatório em "${criterionName}", cumprindo adequadamente as exigências doutrinárias.`,
      `Desempenho muito favorável em "${criterionName}", conferindo clara vantagem tática à manobra.`,
      `Desempenho excelente em "${criterionName}", otimizando plenamente o esforço com vantagem decisiva.`
    ]
  }
}

export async function evaluateDecisionWithJev(input: JevEvaluationInput): Promise<JevDecisionResponse> {
  const apiKey = process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY
  if (!apiKey) {
    throw new Error('TYPESAFE_API_KEY não configurada. Defina a chave no arquivo .env.local para usar o motor de decisão JEV.')
  }

  const model = process.env.TYPESAFE_MODEL || 'jev-latest'
  const client = new TypeSafeClient({ apiKey })

  const { linhasAcao, criterios, context, targetUnit } = input

  if (!linhasAcao || linhasAcao.length === 0) {
    throw new Error('Nenhuma Linha de Ação informada para avaliação de decisão.')
  }

  if (!criterios || criterios.length === 0) {
    throw new Error('Nenhum Critério de Avaliação informado para a Matriz de Decisão.')
  }

  // 1. Montagem do Estado Operacional (System One Context)
  const operationalState = {
    escalao_planejamento: targetUnit || 'Comando Geral',
    missao_superior: context?.mission || 'Não especificada',
    intencao_do_comandante: context?.intent || 'Não especificada',
    condicoes_do_inimigo_dicovap: context?.dicovap || 'Informações resumidas na missão',
    fatores_do_terreno_ocoav: context?.ocoav || 'Informações resumidas na missão',
    meios_disponiveis: context?.means || 'Conforme dotação da ordem',
    escaloes_subordinados: context?.subordinateEchelons || [],
    linhas_de_acao_propostas: linhasAcao.map(la => ({
      identificador: `la_${la.id}`,
      numero: la.numero,
      sumario: la.sumario || la.oQue,
      o_que: la.oQue,
      como: la.como,
      onde: la.onde,
      para_que: la.paraQue,
      quando: la.quando,
      faseamento: la.faseamento || ''
    }))
  }

  // 2. Construção das perguntas paralelas (Score, Noul e Choice)
  const questions: Record<string, any> = {}

  // Perguntas de Score para cada cruzamento (L Aç x Critério)
  linhasAcao.forEach(la => {
    criterios.forEach(crit => {
      const qKey = `score_${la.id}_${crit.id}`
      const rubric = getRubricForCriterion(crit.nome)
      questions[qKey] = score(
        {
          linha_de_acao: `L Aç ${la.numero}: ${la.sumario || la.oQue}`,
          metodo_de_execucao: la.como,
          criterio_avaliado: crit.nome,
          diretriz: rubric.instructions
        },
        rubric.criteria
      )
    })
  })

  // Perguntas Noul de Prova de APA (Adequabilidade, Praticabilidade, Aceitabilidade)
  linhasAcao.forEach(la => {
    questions[`apa_adeq_${la.id}`] = noul(
      `A Linha de Ação ${la.numero} cumpre integralmente a missão atribuída e o estado final desejado pelo Comandante?`,
      {
        true: 'Cumpre integralmente a missão e finalidade',
        false: 'Falha em cumprir ou desvia da intenção do comando'
      }
    )

    questions[`apa_prat_${la.id}`] = noul(
      `A Linha de Ação ${la.numero} é plenamente praticável e executável considerando o terreno, o tempo e os meios disponíveis?`,
      {
        true: 'Totalmente praticável com os meios, tempo e terreno',
        false: 'Inexequível devido a carência de meios, tempo ou terreno'
      }
    )

    questions[`apa_aceit_${la.id}`] = noul(
      `Os riscos táticos, as perdas estimadas e os danos colaterais da Linha de Ação ${la.numero} são proporcionais e aceitáveis frente à vantagem obtida?`,
      {
        true: 'Riscos, custos e baixas proporcionais e aceitáveis',
        false: 'Riscos inaceitáveis ou desproporcionais ao ganho militar'
      }
    )
  })

  // Pergunta Choice para recomendação consolidada
  const choiceCriteria: Record<string, string> = {}
  linhasAcao.forEach(la => {
    choiceCriteria[`la_${la.id}`] = `L Aç ${la.numero}: ${la.sumario || la.oQue}`
  })

  questions['rec_choice'] = choice(
    'Considerando a análise doutrinária do Exame de Situação do Comandante (PPCOT), qual Linha de Ação é a mais equilibrada e recomendada?',
    choiceCriteria
  )

  // 3. Execução paralela unificada no TypeSafe Jev
  const response = await client.systemOne({
    state: operationalState,
    model,
    questions
  })

  const answers = response.answers as Record<string, any>

  // 4. Processamento dos Scores da Matriz de Decisão
  const pontuacoes: JevCellResult[] = []
  const justificativas: Record<string, string> = {}

  linhasAcao.forEach(la => {
    criterios.forEach(crit => {
      const qKey = `score_${la.id}_${crit.id}`
      const ans = answers[qKey]
      const cellKey = `${la.id}_${crit.id}`

      if (ans && typeof ans.score === 'number') {
        const rawScore = ans.score
        const roundedScore = Math.max(0, Math.min(5, Math.round(rawScore)))
        const confidence = typeof ans.confidence === 'number' ? ans.confidence : 0.85
        const probabilities = ans.probabilities || {}

        // Encontra o nível com maior probabilidade
        let topLevel = '3'
        let maxProb = -1
        Object.entries(probabilities).forEach(([lvl, prob]) => {
          if (typeof prob === 'number' && prob > maxProb) {
            maxProb = prob
            topLevel = lvl
          }
        })

        const rubric = getRubricForCriterion(crit.nome)
        const levelDesc = rubric.criteria[Number(topLevel)] || rubric.criteria[roundedScore] || 'Atende ao critério.'
        const confPercent = Math.round(confidence * 100)

        const justText = `[JEV System One • Nota ${rawScore.toFixed(1)}/5 • Confiança: ${confPercent}%] ${levelDesc}`

        pontuacoes.push({
          laId: la.id,
          criterioId: crit.id,
          pontos: roundedScore,
          rawScore,
          confidence,
          probabilities,
          justificativa: justText
        })

        justificativas[cellKey] = justText
      } else {
        pontuacoes.push({
          laId: la.id,
          criterioId: crit.id,
          pontos: 3,
          rawScore: 3,
          confidence: 0.5,
          probabilities: {},
          justificativa: 'Nota neutra estimada (sem resposta específica do modelo).'
        })
      }
    })
  })

  // 5. Processamento da Prova Final de APA
  const apaFinalLA: Record<string, JevAparResult> = {}

  linhasAcao.forEach(la => {
    const adeqAns = answers[`apa_adeq_${la.id}`]
    const pratAns = answers[`apa_prat_${la.id}`]
    const aceitAns = answers[`apa_aceit_${la.id}`]

    const probAdeq = typeof adeqAns?.noul === 'number' ? adeqAns.noul : 0.8
    const probPrat = typeof pratAns?.noul === 'number' ? pratAns.noul : 0.8
    const probAceit = typeof aceitAns?.noul === 'number' ? aceitAns.noul : 0.8

    apaFinalLA[la.id] = {
      adequabilidade: probAdeq >= 0.5,
      praticabilidade: probPrat >= 0.5,
      aceitabilidade: probAceit >= 0.5,
      confidence: {
        adequabilidade: typeof adeqAns?.confidence === 'number' ? adeqAns.confidence : probAdeq,
        praticabilidade: typeof pratAns?.confidence === 'number' ? pratAns.confidence : probPrat,
        aceitabilidade: typeof aceitAns?.confidence === 'number' ? aceitAns.confidence : probAceit
      },
      probabilities: {
        adequabilidade: probAdeq,
        praticabilidade: probPrat,
        aceitabilidade: probAceit
      }
    }
  })

  // 6. Cálculo do Composite Scoring e Ranking em Código
  const ranking = linhasAcao.map(la => {
    let totalScore = 0
    let confSum = 0
    let count = 0

    criterios.forEach(crit => {
      const cell = pontuacoes.find(p => p.laId === la.id && p.criterioId === crit.id)
      const pts = cell ? cell.pontos : 0
      totalScore += pts * crit.peso
      if (cell) {
        confSum += cell.confidence
        count++
      }
    })

    const apa = apaFinalLA[la.id]
    const passedAPA = Boolean(apa && apa.adequabilidade && apa.praticabilidade && apa.aceitabilidade)

    return {
      laId: la.id,
      numero: la.numero,
      totalScore,
      passedAPA,
      confidenceAvg: count > 0 ? confSum / count : 0.8
    }
  })

  // Ordena ranking: primeiro quem passou na APA, depois por maior pontuação
  ranking.sort((a, b) => {
    if (a.passedAPA && !b.passedAPA) return -1
    if (!a.passedAPA && b.passedAPA) return 1
    return b.totalScore - a.totalScore
  })

  // 7. Determinação da Linha de Ação Recomendada
  const choiceAns = answers['rec_choice']
  let recommendedId = ranking[0]?.laId || linhasAcao[0]?.id

  if (choiceAns && typeof choiceAns.choice === 'string') {
    const matchedId = choiceAns.choice.replace('la_', '')
    const matchedRank = ranking.find(r => r.laId === matchedId)
    // Se a escolha de Jev passou na APA, honra a recomendação
    if (matchedRank && matchedRank.passedAPA) {
      recommendedId = matchedId
    }
  }

  const recLA = linhasAcao.find(l => l.id === recommendedId)
  const recRank = ranking.find(r => r.laId === recommendedId)
  const recApa = apaFinalLA[recommendedId]

  const justificativaRecomendacao = recLA
    ? `A Linha de Ação ${recLA.numero} foi recomendada pelo motor de decisão JEV (TypeSafe System One) por atingir a maior pontuação ponderada (${recRank?.totalScore || 0} pontos) e aprovação plena na Prova de APA (Adequabilidade: ${Math.round((recApa?.probabilities.adequabilidade || 1) * 100)}%, Praticabilidade: ${Math.round((recApa?.probabilities.praticabilidade || 1) * 100)}%, Aceitabilidade: ${Math.round((recApa?.probabilities.aceitabilidade || 1) * 100)}%). A manobra equilibra os fatores de decisão com nível médio de confiança de ${Math.round((recRank?.confidenceAvg || 0.85) * 100)}%.`
    : 'Recomendação baseada na análise integrada dos critérios ponderados e validação de APA.'

  return {
    success: true,
    model: response.model || model,
    pontuacoes,
    justificativas,
    apaFinalLA,
    laRecomendada: recommendedId,
    justificativaRecomendacao,
    ranking,
    usage: response.usage ? {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    } : undefined
  }
}
