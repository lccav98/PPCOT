import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY não configurada em .env.local' }, { status: 500 })
  }

  try {
    const { type, content, targetUnit } = await req.json()

    let systemPrompt = ''
    let userMessage = ''

    if (type === 'mission') {
      const isSubordinate = targetUnit && targetUnit !== 'Principal'
      
      systemPrompt = `Você é um assessor de estado-maior especializado em planejamento militar conforme o PPCOT (EB70-MC-10.211).
Analise a ordem recebida e extraia os elementos do Exame de Situação do Comandante${isSubordinate ? ` especificamente para a unidade subordinada "${targetUnit}"` : ''}.
Responda APENAS em JSON válido, sem markdown, sem texto adicional.`

      userMessage = isSubordinate 
        ? `Analise esta ordem militar e extraia os elementos sob a ótica e responsabilidade específica da unidade subordinada "${targetUnit}". Identifique o que cabe a esta unidade executar dentro do planejamento geral.
ORDEM: """${content}"""

Responda em JSON com esta estrutura exata:
{
  "who": "nome ou identificação da unidade subordinada (deve ser exatamente '${targetUnit}')",
  "what": "o que a unidade subordinada deve fazer (tarefa principal dela)",
  "when": "quando a unidade subordinada deve executar",
  "where": "onde a unidade subordinada deve operar",
  "why": "finalidade/propósito da missão da unidade subordinada",
  "assignedTasks": ["tarefa imposta 1 à unidade", "tarefa imposta 2 à unidade"],
  "impliedTasks": ["tarefa deduzida 1 para a unidade cumprir a missão dela", "tarefa deduzida 2"],
  "restrictions": ["restrição 1 aplicada a esta unidade", "restrição 2"],
  "newMissionStatement": "Novo enunciado da missão específica desta unidade: QUEM (ex: ${targetUnit}), O QUÊ, QUANDO, ONDE e PARA QUÊ",
  "initialIntent": "Diretriz/intenção específica para esta unidade subordinada (se houver, ou baseada na intenção do escalão superior)"
}`
        : `Analise esta ordem militar e extraia os seguintes elementos:
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
  "subordinateEchelons": ["escalão subordinado 1 (ex: 1º Btl)", "escalão subordinado 2 (ex: 2ª Cia)"],
  "newMissionStatement": "Novo enunciado da missão: QUEM, O QUÊ, QUANDO, ONDE e PARA QUÊ",
  "initialIntent": "Intenção inicial do Comandante: finalidade e estado final desejado",
  "eeiList": ["EEI 1", "EEI 2", "EEI 3"],
  "timePlan": "Plano de utilização do tempo: distribuição entre planejamento e execução"
}`
    } else if (type === 'la') {
      const isSubordinate = targetUnit && targetUnit !== 'Principal'

      systemPrompt = `Você é um planejador militar sênior especializado na elaboração de Linhas de Ação (L Aç) conforme o PPCOT.
Gere linhas de ação táticas para a missão fornecida${isSubordinate ? ` especificamente sob a ótica e responsabilidade da unidade subordinada "${targetUnit}"` : ''}.
Responda APENAS em JSON válido.`

      userMessage = isSubordinate 
        ? `Com base nos dados abaixo, gere 2 Linhas de Ação distintas e específicas para o emprego tático e manobra da unidade subordinada "${targetUnit}" dentro do planejamento geral:
MISSÃO: ${content.mission}
SITUAÇÃO: ${content.situation}
MEIOS DISPONÍVEIS DA UNIDADE: ${content.means}

Responda em JSON com esta estrutura exata:
{
  "linhasAcao": [
    {
      "numero": 1,
      "oQue": "ação principal da L Aç 1 específica para a unidade ${targetUnit}",
      "como": "como a unidade ${targetUnit} executará essa ação (método detalhado de execução)",
      "onde": "área de atuação específica da unidade",
      "paraQue": "finalidade específica da missão da unidade",
      "quando": "momento de execução",
      "faseamento": "Fase I: ... / Fase II: ...",
      "sumario": "Resumo tático da L Aç 1 para a unidade ${targetUnit}"
    },
    {
      "numero": 2,
      "oQue": "ação principal da L Aç 2 (manobra alternativa) específica para a unidade ${targetUnit}",
      "como": "como a unidade ${targetUnit} executará essa manobra alternativa (método detalhado)",
      "onde": "área de atuação",
      "paraQue": "finalidade da missão",
      "quando": "momento de execução",
      "faseamento": "Fase I: ... / Fase II: ...",
      "sumario": "Resumo tático da L Aç 2 para a unidade ${targetUnit}"
    }
  ]
}`
        : `Com base nos dados abaixo, gere 2 Linhas de Ação distintas:
MISSÃO: ${content.mission}
SITUAÇÃO: ${content.situation}
MEIOS DISPONÍVEIS: ${content.means}
ESCALÕES SUBORDINADOS A DISPOR: ${JSON.stringify(content.subordinateEchelons)}

Ao formular a manobra de cada Linha de Ação, você deve necessariamente atribuir tarefas e responsabilidades específicas aos escalões subordinados listados (${JSON.stringify(content.subordinateEchelons)}), dividindo o esforço tático (ex: quem realiza o ataque principal, quem apoia, quem fica em reserva).

Responda em JSON:
{
  "linhasAcao": [
    {
      "numero": 1,
      "oQue": "ação principal da L Aç 1 e papel dos echelons subordinados principais",
      "como": "método detalhado de execução (ex: 1º Btl ataca pela esquerda, 2ª Cia bloqueia à direita)",
      "onde": "área de operações",
      "paraQue": "finalidade",
      "quando": "momento de execução",
      "faseamento": "Fase 1: ... / Fase 2: ...",
      "sumario": "Resumo executivo da L Aç 1"
    },
    {
      "numero": 2,
      "oQue": "ação principal da L Aç 2 (manobra alternativa/contrastante)",
      "como": "outro método de execução distribuindo os escalões subordinados diferentemente",
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
MEIOS DISPONÍVEIS: ${content.meios}
ESCALÕES SUBORDINADOS: ${JSON.stringify(content.subordinateEchelons)}

Ao gerar a Ordem de Operações, na seção "tarefasSubordinados", você DEVE necessariamente listar cada um dos escalões subordinados informados (${JSON.stringify(content.subordinateEchelons)}) e atribuir a cada um deles tarefas táticas claras e específicas com seus respectivos propósitos (Tarefa e Propósito) com base na Linha de Ação aprovada.

Responda em JSON:
{
  "inimigo": "Situação do inimigo resumida",
  "forcasAmigas": "Situação das forças amigas, incluindo a listagem e organização de combate dos meios e escalões subordinados",
  "missao": "Missão completa conforme enunciado aprovado",
  "intencaoCmt": "Intenção completa do Comandante (finalidade, método, estado final desejado)",
  "conceitoOperacao": "Conceito da operação detalhado por fases, descrevendo a manobra e sincronização dos echelons subordinados",
  "tarefasSubordinados": "Tarefas específicas para elementos subordinados (ex: - **Subordinado 1**: realizar tarefa X para permitir Y\\n- **Subordinado 2**: ...)",
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
ESCALÕES SUBORDINADOS (DESTINATÁRIOS): ${JSON.stringify(content.subordinateEchelons)}

A OA-1 deve seguir a estrutura padrão do manual PPCOT e incluir tarefas preliminares/alertas específicos para cada um dos escalões subordinados listados:
1. SITUAÇÃO (dados gerais preliminares)
2. MISSÃO (enunciado preliminar)
3. EXECUÇÃO (plano do tempo, EEI, orientações preliminares do EM e diretrizes preliminares específicas aos elementos subordinados: ${JSON.stringify(content.subordinateEchelons)})
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
MEIOS DISPONÍVEIS: ${content.means}
ESCALÕES SUBORDINADOS (COMPOSIÇÃO): ${JSON.stringify(content.subordinateEchelons)}
CONSIDERAÇÕES CIVIS: Áreas: ${content.areas}, Estruturas: ${content.estruturas}, Capacidades: ${content.capacidades}, Organizações: ${content.organizacoes}, Pessoas: ${content.pessoas}, Eventos: ${content.eventos}

Gere estimativas correntes concisas para cada seção funcional do EM, considerando os escalões subordinados informados:
S2 (Inteligência): Análise de ameaças e terreno sobre as ações e vulnerabilidades.
S3 (Operações): Condições táticas e possibilidades de manobra distribuindo/empregando os escalões subordinados.
S4 (Logística): Apoio de serviço ao combate (suprimento, manutenção, saúde) para manter a capacidade operativa dos echelons subordinados.
S5 (Assuntos Civis): Impacto na população local derivado da presença e manobras das forças.

Responda em JSON:
{
  "s2": "Estimativa resumida S2 em Markdown",
  "s3": "Estimativa resumida S3 em Markdown",
  "s4": "Estimativa resumida S4 em Markdown",
  "s5": "Estimativa resumida S5 em Markdown"
}`
    } else if (type === 'sync') {
      const isSubordinate = targetUnit && targetUnit !== 'Principal'

      systemPrompt = `Você é um oficial de estado-maior especialista em sincronização tática conforme o PPCOT. Gere células de uma grade de sincronização${isSubordinate ? ` focada nas ações da unidade subordinada "${targetUnit}"` : ''}. Responda APENAS em JSON válido.`

      userMessage = isSubordinate 
        ? `Com base na Linha de Ação formulada para a unidade subordinada "${targetUnit}":
O QUÊ: ${content.la.oQue}
COMO: ${content.la.como}
ONDE: ${content.la.onde}
PARA QUÊ: ${content.la.paraQue}
FASEAMENTO: ${content.la.faseamento}

Gere o conteúdo da Matriz de Sincronização em formato JSON contendo uma lista de objetos, detalhando especificamente as ações, coordenações e apoios sob responsabilidade da unidade subordinada "${targetUnit}".
As colunas são as Fases da Operação: "Fase I: Preparação", "Fase II: Movimento", "Fase III: Ação", "Fase IV: Consolidação".
As linhas são as Funções de Combate: "Manobra", "Inteligência", "Fogos", "Logística", "Comando e Controle", "Assuntos Civis".

Gere de 1 a 2 frases táticas e precisas para cada cruzamento aplicável de Fase e Função de Combate.

Responda em JSON com esta estrutura:
{
  "syncGrid": [
    { "fase": "Fase I: Preparação", "funcao": "Manobra", "texto": "Ações de manobra específicas do ${targetUnit} na Fase I..." },
    ...
  ]
}`
        : `Com base na Linha de Ação formulada:
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
      const isSubordinate = targetUnit && targetUnit !== 'Principal'
      systemPrompt = `Você é um oficial de estado-maior especializado no PPCOT. Gere a 4ª Ordem de Alerta (OA-4)${isSubordinate ? ` especificamente focada na unidade subordinada "${targetUnit}"` : ''}. Responda APENAS em JSON válido.`
      userMessage = isSubordinate
        ? `Gere a 4ª Ordem de Alerta (OA-4) específica para a unidade subordinada "${targetUnit}" após a decisão do Comandante para o escalão geral:
MISSÃO DO ESCALÃO: ${content.mission}
LINHA DE AÇÃO ESCOLHIDA PARA A UNIDADE: ${content.laEscolhida}
INTENÇÃO DO COMANDANTE DO ESCALÃO SUPERIOR PARA ESTA UNIDADE: ${content.intencao}
MODIFICAÇÕES DO CMT PARA ESTA UNIDADE: ${content.modificacoes}

A OA-4 deve especificar diretrizes, alertas táticos e responsabilidades sob medida especificamente para a unidade subordinada "${targetUnit}":
1. SITUAÇÃO (dados gerais atualizados e o que se espera do inimigo na área de atuação da unidade)
2. MISSÃO (enunciado definitivo específico para a unidade "${targetUnit}")
3. EXECUÇÃO (L Aç escolhida adaptada à unidade, tarefas específicas dela e diretrizes de coordenação)
4. LOGÍSTICA E ADMINISTRAÇÃO (apoios administrativos específicos à unidade)
5. COMANDO E COMUNICAÇÕES (linhas de comando, PC específico)

Responda em JSON:
{
  "oa4": "Texto completo da OA-4 em Markdown de forma muito profissional e detalhada"
}`
        : `Gere a 4ª Ordem de Alerta (OA-4) geral após a decisão do Comandante:
MISSÃO ENUNCIADA: ${content.mission}
LINHA DE AÇÃO ESCOLHIDA: ${content.laEscolhida}
INTENÇÃO DO COMANDANTE: ${content.intencao}
MODIFICAÇÕES: ${content.modificacoes}
ESCALÕES SUBORDINADOS: ${JSON.stringify(content.subordinateEchelons)}

A OA-4 deve conter e especificar diretrizes e alertas táticos específicos para cada um dos escalões subordinados listados (${JSON.stringify(content.subordinateEchelons)}):
1. SITUAÇÃO (dados gerais atualizados)
2. MISSÃO (enunciado definitivo)
3. EXECUÇÃO (L Aç escolhida, conceito geral, tarefas específicas a cada elemento subordinado e diretrizes)
4. LOGÍSTICA E ADMINISTRAÇÃO (apoios administrativos)
5. COMANDO E COMUNICAÇÕES (linhas de comando, PC)

Responda em JSON:
{
  "oa4": "Texto completo da OA-4 em Markdown de forma muito profissional e detalhada"
}`
    } else if (type === 'situation') {
      systemPrompt = `Você é um assessor de estado-maior especializado em inteligência e planejamento militar conforme o PPCOT (EB70-MC-10.211).
Analise o Anexo A (Inteligência) ou documento correlato fornecido e extraia todos os fatores e condicionantes da situação.
Responda APENAS em JSON válido, sem markdown, sem texto adicional.`
      userMessage = `Analise este documento de inteligência militar (Anexo A) e extraia de forma estruturada as condicionantes da situação:
DOCUMENTO: """${content}"""

Responda em JSON com esta estrutura exata:
{
  "dicovap": {
    "dispositivo": "Dispositivo do inimigo (localizações, deslocamentos, frentes)",
    "composicao": "Composição do inimigo (ordem de batalha, unidades, efetivos, equipamentos)",
    "valor": "Valor estimado do inimigo (capacidade combativa, moral, adestramento)",
    "atividades": "Atividades recentes do inimigo",
    "peculiaridades": "Peculiaridades ou características específicas do inimigo"
  },
  "ocoav": {
    "observacao": "Observação e campos de tiro (pontos dominantes, alcance visual)",
    "cobertas": "Cobertas e abrigos (vegetação, edificações, relevo)",
    "obstaculos": "Obstáculos (naturais ou artificiais, cursos d'água, pontes destruídas)",
    "acidentesCapitais": "Acidentes capitais (cruzamentos, estradas-chave, pontes cruciais, elevações)",
    "viasDeAcesso": "Vias de acesso disponíveis para ambos os lados"
  },
  "visibilidade": "Condições de visibilidade (ex: 8km, neblina matinal)",
  "vento": "Vento e direção (ex: Leste 12 km/h)",
  "precipitacao": "Precipitação (ex: chuva leve, sem previsão de chuva)",
  "temperatura": "Temperatura (ex: 22°C a 30°C)",
  "areas": "Considerações civis: Áreas chaves (zonas de interesse econômico, religioso, cultural)",
  "estruturas": "Considerações civis: Estruturas cruciais (hospitais, escolas, centrais elétricas)",
  "capacidades": "Considerações civis: Capacidades locais (serviço de água, saneamento, telecomunicação)",
  "organizacoes": "Considerações civis: Organizações (ONGs, grupos de influência, igrejas)",
  "pessoas": "Considerações civis: Pessoas de influência ou deslocados/refugiados",
  "eventos": "Considerações civis: Eventos marcantes (eleições, colheitas, mercados semanais)"
}`
    } else if (type === 'compare') {
      systemPrompt = `Você é um planejador militar sênior especializado em avaliação e comparação de Linhas de Ação (L Aç) conforme o PPCOT.
Analise cada Linha de Ação contra a lista de critérios fornecidos de forma crítica e objetiva.
Responda APENAS em JSON válido, sem markdown, sem texto adicional.`
      userMessage = `Compare as seguintes Linhas de Ação (L Aç) em relação a cada um dos critérios de avaliação fornecidos.

LINHAS DE AÇÃO:
${JSON.stringify(content.linhasAcao)}

CRITÉRIOS DE AVALIAÇÃO:
${JSON.stringify(content.criterios)}

Para cada cruzamento de Linha de Ação e Critério de Avaliação:
1. Atribua uma pontuação objetiva de 0 (pior) a 5 (melhor), comparando as L Aç de maneira contrastante e taticamente fundamentada.
2. Escreva uma justificativa tática curta e extremamente objetiva (máximo de 2 frases) explicando a razão da nota com base na manobra, meios, terreno ou doutrina militar.

Responda em JSON com esta estrutura exata:
{
  "pontuacoes": [
    {
      "laId": "id_da_linha_de_acao",
      "criterioId": "id_do_criterio",
      "pontos": 4,
      "justificativa": "Justificativa tática e objetiva da nota..."
    }
  ]
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
