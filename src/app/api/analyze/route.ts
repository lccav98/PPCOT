import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY não configurada em .env.local' }, { status: 500 })
  }

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
    } else if (type === 'oa1') {
      systemPrompt = `Você é um oficial de estado-maior especializado no PPCOT. Gere a 1ª Ordem de Alerta (OA-1) em Markdown. Responda APENAS em JSON válido.`
      userMessage = `Gere a 1ª Ordem de Alerta (OA-1) com base nas informações da missão:
MISSÃO: ${content.mission}
INTENÇÃO INICIAL DO COMANDANTE: ${content.intent}
PLANO DE UTILIZAÇÃO DO TEMPO: ${content.timePlan}
EEIs INICIAIS: ${JSON.stringify(content.eeiList)}

A OA-1 deve seguir a estrutura padrão do manual PPCOT:
1. SITUAÇÃO (dados gerais preliminares)
2. MISSÃO (enunciado preliminar)
3. EXECUÇÃO (plano do tempo, EEI, orientações preliminares do EM)
4. LOGÍSTICA E ADMINISTRAÇÃO (instruções administrativas de movimentação)
5. COMANDO E COMUNICAÇÕES (linhas de comando, PC inicial)

Responda em JSON:
{
  "oa1": "Texto completo da OA-1 em Markdown de forma muito profissional e detalhada"
}`
    } else if (type === 'estimativas') {
      systemPrompt = `Você é um assessor de estado-maior especializado no PPCOT. Gere estimativas correntes para as seções S2, S3, S4 e S5. Responda APENAS em JSON válido.`
      userMessage = `Com base nas seguintes informações de planejamento:
MISSÃO: ${content.mission}
INIMIGO (DICOVAP): ${JSON.stringify(content.dicovap)}
TERRENO (OCOAV): ${JSON.stringify(content.ocoav)}
METEO: Visibilidade: ${content.visibilidade}, Vento: ${content.vento}, Precipitação: ${content.precipitacao}, Temperatura: ${content.temperatura}
MEIOS: ${content.means}
CONSIDERAÇÕES CIVIS: Áreas: ${content.areas}, Estruturas: ${content.estruturas}, Capacidades: ${content.capacidades}, Organizações: ${content.organizacoes}, Pessoas: ${content.pessoas}, Eventos: ${content.eventos}

Gere estimativas correntes concisas para cada seção funcional do EM:
S2 (Inteligência): Análise de ameaças e terreno.
S3 (Operações): Condições táticas e possibilidades de manobra.
S4 (Logística): Apoio de serviço ao combate.
S5 (Assuntos Civis): Impacto na população local.

Responda em JSON:
{
  "s2": "Estimativa resumida S2 em Markdown",
  "s3": "Estimativa resumida S3 em Markdown",
  "s4": "Estimativa resumida S4 em Markdown",
  "s5": "Estimativa resumida S5 em Markdown"
}`
    } else if (type === 'sync') {
      systemPrompt = `Você é um oficial de estado-maior especialista em sincronização tática conforme o PPCOT. Gere células de uma grade de sincronização. Responda APENAS em JSON válido.`
      userMessage = `Com base na Linha de Ação formulada:
O QUÊ: ${content.la.oQue}
COMO: ${content.la.como}
ONDE: ${content.la.onde}
PARA QUÊ: ${content.la.paraQue}
FASEAMENTO: ${content.la.faseamento}

Gere o conteúdo da Matriz de Sincronização em formato JSON contendo uma lista de objetos. As colunas são as Fases da Operação: "Fase I: Preparação", "Fase II: Movimento", "Fase III: Ação", "Fase IV: Consolidação".
As linhas são as Funções de Combate: "Manobra", "Inteligência", "Fogos", "Logística", "Comando e Controle", "Assuntos Civis".

Gere de 1 a 2 frases táticas e precisas para cada cruzamento aplicável de Fase e Função de Combate.

Responda em JSON com esta estrutura:
{
  "syncGrid": [
    { "fase": "Fase I: Preparação", "funcao": "Manobra", "texto": "Ações de manobra na Fase I..." },
    ...
  ]
}`
    } else if (type === 'oa4') {
      systemPrompt = `Você é um oficial de estado-maior especializado no PPCOT. Gere a 4ª Ordem de Alerta (OA-4). Responda APENAS em JSON válido.`
      userMessage = `Gere a 4ª Ordem de Alerta (OA-4) após a decisão do Comandante:
MISSÃO ENUNCIADA: ${content.mission}
LINHA DE AÇÃO ESCOLHIDA: ${content.laEscolhida}
INTENÇÃO DO COMANDANTE: ${content.intencao}
MODIFICAÇÕES: ${content.modificacoes}

A OA-4 deve conter:
1. SITUAÇÃO (dados gerais atualizados)
2. MISSÃO (enunciado definitivo)
3. EXECUÇÃO (L Aç escolhida, conceito geral, tarefas e diretrizes)
4. LOGÍSTICA E ADMINISTRAÇÃO (apoios administrativos)
5. COMANDO E COMUNICAÇÕES (linhas de comando, PC)

Responda em JSON:
{
  "oa4": "Texto completo da OA-4 em Markdown de forma muito profissional e detalhada"
}`
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Erro na API do Gemini: ${response.status} - ${errText}`)
    }

    const json = await response.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(text)
    return NextResponse.json({ success: true, data: parsed })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('AI analysis error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
