import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { type, content } = await req.json()

    let systemPrompt = ''
    let userMessage = ''

    if (type === 'mission') {
      systemPrompt = `Você é um assessor de estado-maior especializado em planejamento militar conforme o PPCOT (EB70-MC-10.211).
Analise a ordem recebida e extraia os elementos do Exame de Situação do Comandante.
Responda APENAS em JSON válido, sem markdown, sem texto adicional.`
      userMessage = `Analise esta ordem militar e extraia os seguintes elementos:
ORDEM: """${content}"""

Responda em JSON com esta estrutura exata:
{
  "who": "quem deve executar a missão",
  "what": "o que deve ser feito (tarefa principal)",
  "when": "quando deve ser executado",
  "where": "onde ocorre a operação",
  "why": "finalidade/propósito da missão",
  "assignedTasks": ["tarefa imposta 1", "tarefa imposta 2"],
  "impliedTasks": ["tarefa deduzida 1", "tarefa deduzida 2"],
  "restrictions": ["restrição 1", "restrição 2"],
  "newMissionStatement": "Novo enunciado da missão: QUEM, O QUÊ, QUANDO, ONDE e PARA QUÊ",
  "initialIntent": "Intenção inicial do Comandante: finalidade e estado final desejado",
  "eeiList": ["EEI 1", "EEI 2", "EEI 3"],
  "timePlan": "Plano de utilização do tempo: distribuição entre planejamento e execução"
}`
    } else if (type === 'la') {
      systemPrompt = `Você é um planejador militar sênior especializado na elaboração de Linhas de Ação (L Aç) conforme o PPCOT.
Gere linhas de ação táticas para a missão fornecida.
Responda APENAS em JSON válido.`
      userMessage = `Com base nos dados abaixo, gere 2 Linhas de Ação distintas:
MISSÃO: ${content.mission}
SITUAÇÃO: ${content.situation}
MEIOS: ${content.means}

Responda em JSON:
{
  "linhasAcao": [
    {
      "numero": 1,
      "oQue": "ação principal da L Aç 1",
      "como": "método de execução",
      "onde": "área de operações",
      "paraQue": "finalidade",
      "quando": "momento de execução",
      "faseamento": "Fase 1: ... / Fase 2: ...",
      "sumario": "Resumo executivo da L Aç 1"
    },
    {
      "numero": 2,
      "oQue": "ação principal da L Aç 2 (alternativa contrastante)",
      "como": "método diferente",
      "onde": "área de operações",
      "paraQue": "mesma finalidade",
      "quando": "momento de execução",
      "faseamento": "Fase 1: ... / Fase 2: ...",
      "sumario": "Resumo executivo da L Aç 2"
    }
  ]
}`
    } else if (type === 'orop') {
      systemPrompt = `Você é um oficial de estado-maior especializado na redação de Ordens de Operações militares conforme o PPCOT.
Gere a estrutura da Ordem de Operações com base nos dados fornecidos.
Responda APENAS em JSON válido.`
      userMessage = `Gere uma Ordem de Operações para:
MISSÃO: ${content.mission}
LINHA DE AÇÃO APROVADA: ${content.laAprovada}
INTENÇÃO DO COMANDANTE: ${content.intencao}
MEIOS: ${content.meios}

Responda em JSON:
{
  "inimigo": "Situação do inimigo resumida",
  "forcasAmigas": "Situação das forças amigas",
  "missao": "Missão completa conforme enunciado aprovado",
  "intencaoCmt": "Intenção completa do Comandante (finalidade, método, estado final desejado)",
  "conceitoOperacao": "Conceito da operação detalhado por fases",
  "tarefasSubordinados": "Tarefas específicas para elementos subordinados",
  "instrucoesCoordenacao": "Medidas de coordenação e controle",
  "apoioLogistico": "Plano de apoio logístico",
  "comando": "Posto de Comando e linha de sucessão de comando",
  "comunicacoes": "Redes de comunicações e frequências"
}`
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: userMessage }],
      system: systemPrompt,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ success: false, error: 'Erro na análise de IA' }, { status: 500 })
  }
}
