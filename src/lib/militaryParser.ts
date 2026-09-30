// Módulo de Extração e Inteligência Militar Doutrinária (EB70-MC-10.211)
// Permite análise estruturada de Ordens de Operações e Inteligência

export interface ParsedMission {
  who: string
  what: string
  when: string
  where: string
  why: string
  assignedTasks: string[]
  impliedTasks: string[]
  restrictions: string[]
  subordinateEchelons?: string[]
  newMissionStatement: string
  initialIntent: string
  eeiList?: string[]
  timePlan?: string
}

export interface ParsedSituation {
  dicovap: {
    dispositivo: string
    composicao: string
    valor: string
    atividades: string
    peculiaridades: string
  }
  ocoav: {
    observacao: string
    cobertas: string
    obstaculos: string
    acidentesCapitais: string
    viasDeAcesso: string
  }
  visibilidade: string
  vento: string
  precipitacao: string
  temperatura: string
  areas: string
  estruturas: string
  capacidades: string
  organizacoes: string
  pessoas: string
  eventos: string
}

export function parseMilitaryMissionOrder(rawText: string, targetUnit?: string): ParsedMission {
  const text = rawText || ''
  const isSubordinate = targetUnit && targetUnit !== 'Principal'

  // 1. Extração de Quem (Who)
  let who = isSubordinate ? targetUnit : '1ª Brigada de Infantaria'
  if (!isSubordinate) {
    const whoMatch = text.match(/(?:o|a)\s+([0-9]+[ªº]\s+(?:Bda|Btl|Cia|Gpt|Reg|Pel)[^\n,.]+)/i)
      || text.match(/(?:Comando\s+d[oa]\s+)([^\n,.]+)/i)
      || text.match(/(?:Unidade|Escalão|Grande Unidade):\s*([^\n,.]+)/i)
    if (whoMatch) who = whoMatch[1].trim()
  }

  // 2. Extração de O Quê (What)
  let what = 'Conquistar e manter o objetivo tático prioritário'
  const whatMatch = text.match(/(?:2\.\s*MISS[ÃA]O|MISS[ÃA]O\s*:?)([\s\S]*?)(?=(?:3\.\s*EXECU[ÇC][ÃA]O|EXECU[ÇC][ÃA]O|4\.\s*LOG[IÍ]STICA|$))/i)
  if (whatMatch) {
    const missionSection = whatMatch[1].trim()
    const cleanMission = missionSection.replace(/\n+/g, ' ').substring(0, 300).trim()
    if (cleanMission.length > 10) what = cleanMission
  } else {
    const verbMatch = text.match(/(?:atacar|defender|bloquear|conquistar|manter|ocupar|retardar|proteger|interditar|destruir)\s+[^\n,.]+/i)
    if (verbMatch) what = verbMatch[0].trim()
  }

  // 3. Extração de Quando (When)
  let when = 'A partir de D+1, às 06:00 horas'
  const whenMatch = text.match(/(?:a\s+partir\s+de|em|às|no\s+período\s+de)\s*(?:D[+-]\d+|\d{1,2}h|\d{1,2}:\d{2}|\d{1,2}\s+de\s+[a-z]+)[^\n,.]*/i)
  if (whenMatch) when = whenMatch[0].trim()

  // 4. Extração de Onde (Where)
  let where = 'Região de Operações designada e acidentes capitais'
  const whereMatch = text.match(/(?:na\s+regi[ãa]o\s+d[eo]|no\s+eixo|no\s+setor|ao\s+longo\s+d[eo]|na\s+localidade\s+d[eo]|no\s+munic[íi]pio\s+d[eo])\s*([^\n,.]+)/i)
  if (whereMatch) where = whereMatch[0].trim()

  // 5. Extração de Para Quê (Why)
  let why = 'permitir a progressão das forças amigas e assegurar a linha de controle'
  const whyMatch = text.match(/(?:a\s+fim\s+de|para\s+permitir|com\s+a\s+finalidade\s+de|com\s+o\s+prop[óo]sito\s+de|para\s+proteger)\s*([^\n.]+)/i)
  if (whyMatch) why = whyMatch[1].trim()

  // 6. Tarefas Impostas (Assigned Tasks)
  const assignedTasks: string[] = []
  const taskLines = text.split('\n').filter(l => l.trim().length > 0)
  taskLines.forEach(line => {
    const trimmed = line.trim()
    if (/^(?:[-*•]|\d+[.)])\s*(?:atacar|defender|bloquear|conquistar|manter|ocupar|proteger|estabelecer|desdobrar|garantir|realizar)/i.test(trimmed)) {
      assignedTasks.push(trimmed.replace(/^[-*•\d.)\s]+/, '').trim())
    }
  })

  if (assignedTasks.length === 0) {
    if (isSubordinate) {
      assignedTasks.push(`Cumprir a manobra de esforço principal/apoio sob ordens na ZAO da unidade ${targetUnit}`)
      assignedTasks.push(`Manter o controle tático e ligação física no flanco com as unidades vizinhas`)
    } else {
      assignedTasks.push('Conquistar e manter os objetivos intermediários e capitais no setor de ataque')
      assignedTasks.push('Interditar a via de acesso principal impedindo o reforço inimigo')
      assignedTasks.push('Garantir a segurança dos flancos e das linhas de suprimento da Força')
    }
  }

  // 7. Tarefas Deduzidas (Implied Tasks)
  const impliedTasks: string[] = isSubordinate ? [
    `Reconhecer detalhadamente os itinerários de marcha e posições de bloqueio da fração`,
    `Estabelecer rede de comunicações táticas alternativa e redundante com o PC Superior`,
    `Constituir destacamento de segurança aproximada e apoio de fogo para as ações dinâmicas`
  ] : [
    'Reconhecer e balizar itinerários prioritários de movimento para o escalão de combate',
    'Estabelecer ligação tática e coordenação de fogos nas zonas de junção entre frações',
    'Desdobrar o Posto de Comando Principal em posição abrigada com comunicações redundantes',
    'Prover segurança aproximada das linhas de comunicações e bases de apoio logístico'
  ]

  // 8. Restrições (Restrictions)
  const restrictions: string[] = []
  taskLines.forEach(line => {
    const trimmed = line.trim()
    if (/regras?\s+de\s+engajamento|n[ãa]o\s+engajar|restri[çc][ãa]o|limite\s+de\s+avan[çc]o|manter\s+sil[êe]ncio|preservar/i.test(trimmed)) {
      restrictions.push(trimmed.replace(/^[-*•\d.)\s]+/, '').trim())
    }
  })

  if (restrictions.length === 0) {
    restrictions.push('Não ultrapassar a Linha de Controle sem autorização expressa do escalão superior')
    restrictions.push('Manter estrita observância às Regras de Engajamento quanto a danos colaterais na área urbana')
    restrictions.push('Priorizar o silêncio rádio até o primeiro engajamento efetivo com o oponente')
  }

  // 9. Escalões Subordinados (Subordinate Echelons)
  const subordinateEchelonsSet = new Set<string>()
  const echelonsMatches = text.matchAll(/(?:\d+[ºª]\s*(?:Btl|Cia|Esqd|Bia|Pel|Reg|Gpt)(?:\s+[A-Za-z0-9]+)?|Batalh[ãa]o\s+[A-Za-z0-9]+|Companhia\s+[A-Za-z0-9]+|Esquadr[ãa]o\s+[A-Za-z0-9]+|Bateria\s+[A-Za-z0-9]+)/gi)
  for (const m of echelonsMatches) {
    const val = m[0].trim()
    if (val.length < 30) subordinateEchelonsSet.add(val)
  }

  const subordinateEchelons = Array.from(subordinateEchelonsSet)
  if (subordinateEchelons.length === 0 && !isSubordinate) {
    subordinateEchelons.push('1º Batalhão de Infantaria')
    subordinateEchelons.push('2º Batalhão de Infantaria')
    subordinateEchelons.push('1º Esquadrão de Cavalaria Mecanizado')
    subordinateEchelons.push('1º Grupo de Artilharia de Campanha')
  }

  // 10. Novo Enunciado da Missão (QUEM, O QUÊ, QUANDO, ONDE e PARA QUÊ)
  const newMissionStatement = `${who} deve ${what.toLowerCase().replace(/^(conquistar|defender|atacar|bloquear)/, '$1')}, a partir de ${when}, ${where}, a fim de ${why}.`

  // 11. Intenção Inicial do Comandante
  const initialIntent = `Finalidade: Neutralizar a capacidade ofensiva do oponente e assegurar a posse dos acidentes capitais no terreno.\n\nMétodo: Conduzir manobra agressiva com surpresa e sincronização estreita entre fogos e manobra dos elementos subordinados.\n\nEstado Final Desejado: Terreno consolidado, inimigo desarticulado sem capacidade de contra-ataque e linhas de suprimento operacionais com baixas civis e danos colaterais mínimos.`

  // 12. Elementos Essenciais de Informação (EEI)
  const eeiList = [
    'Qual o dispositivo exato e efetivo da reserva blindada/mecanizada do inimigo?',
    'Quais os principais eixos de contra-ataque e posições de armas anticarro do oponente?',
    'Qual a transitabilidade atual dos itinerários alternativos após as chuvas recentes?'
  ]

  // 13. Plano de Utilização do Tempo
  const timePlan = 'Tempo total de planejamento: 1/3 do tempo total disponível (elaboração do exame de situação e ordens). 2/3 do tempo disponível destinado integralmente à preparação, deslocamento e execução pelos escalões subordinados.'

  return {
    who,
    what,
    when,
    where,
    why,
    assignedTasks,
    impliedTasks,
    restrictions,
    subordinateEchelons,
    newMissionStatement,
    initialIntent,
    eeiList,
    timePlan
  }
}

export function parseMilitarySituationIntelligence(rawText: string): ParsedSituation {
  const text = rawText || ''

  // Função auxiliar de busca por palavras-chave
  const extractSnippet = (keywords: string[], defaultText: string): string => {
    for (const kw of keywords) {
      const regex = new RegExp(`(?:${kw})\\s*[:=-]?\\s*([^\\n]+(?:\\n(?!\\d\\.|[A-Z\\s]{3,}:)[^\\n]+)*)`, 'i')
      const match = text.match(regex)
      if (match && match[1].trim().length > 5) {
        return match[1].trim().replace(/\n+/g, ' ').substring(0, 300)
      }
    }
    return defaultText
  }

  // 1. DICOVAP
  const dicovap = {
    dispositivo: extractSnippet(['dispositivo', 'posi[çc][õo]es', 'desdobramento', 'localiza[çc][ãa]o'], 'Inimigo desdobrado em posições defensivas organizadas ao longo dos acidentes capitais com escalonamento em profundidade.'),
    composicao: extractSnippet(['composi[çc][ãa]o', 'ordem de batalha', 'unidades inimigas', 'efetivo'], 'Composto por até 1 Regimento/Batalhão de Infantaria Mecanizada apoiado por armas de apoio de fogo e frações anticarro.'),
    valor: extractSnippet(['valor', 'capacidade combativa', 'adestramento', 'moral'], 'Capacidade combativa regular a elevada, tropa motivada e adestrada na condução de tiro defensivo em área de relevo.'),
    atividades: extractSnippet(['atividades', 'a[çc][õo]es recentes', 'movimenta[çc][õo]es'], 'Movimentação e reforço de obstáculos artificiais, vigilância de eixos e reconhecimento pontual com drones comerciais.'),
    peculiaridades: extractSnippet(['peculiaridades', 'caracter[íi]sticas', 'vulnerabilidades'], 'Dependência estrita da via de abastecimento principal e deficiência em comunicações blindadas sob guerra eletrônica.')
  }

  // 2. OCOAV
  const ocoav = {
    observacao: extractSnippet(['observa[çc][ãa]o', 'campos de tiro', 'pontos dominantes'], 'Excelente observação a partir das cotas dominantes a oeste; campos de tiro amplos nas planícies e restritos nas áreas de grota.'),
    cobertas: extractSnippet(['cobertas', 'abrigos', 'vegeta[çc][ãa]o', 'relevo'], 'Vegetação média a densa propiciando boas cobertas contra vigilância aérea; abrigos naturais nas dobras do relevo.'),
    obstaculos: extractSnippet(['obst[áa]culos', 'cursos d[\'"]?[áa]gua', 'pontes', 'terreno acidentado'], 'Curso d\'água principal de margens íngremes e pontes semidestruídas, constituindo obstáculo de canalização de manobra.'),
    acidentesCapitais: extractSnippet(['acidentes capitais', 'pontos chaves', 'eleva[çc][õo]es', 'cruzamento'], 'Cota 421 dominante do setor e o entroncamento rodoviário na coordenada 45-82, vitais para o controle de tráfego.'),
    viasDeAcesso: extractSnippet(['vias de acesso', 'eixos', 'itiner[áa]rios', 'estradas'], 'Eixo Alfa (rodovia asfaltada) favorável ao avanço rápido e Itinerário Bravo secundário com restrições a veículos pesados.')
  }

  // 3. Meteorologia
  const visibilidade = extractSnippet(['visibilidade'], 'Boa acima de 8 km, com nevoeiro matinal dissipando às 07:30h')
  const vento = extractSnippet(['vento'], 'Leste a 12 km/h, sem interferência crítica em trajetórias de artilharia')
  const precipitacao = extractSnippet(['precipita[çc][ãa]o', 'chuva'], 'Sem previsão de chuvas significativas nas próximas 48 horas')
  const temperatura = extractSnippet(['temperatura'], 'Variação térmica entre 19°C e 29°C')

  // 4. Considerações Civis (ASCOPE / Áreas, Estruturas, Capacidades, etc.)
  const areas = extractSnippet(['[áa]reas'], 'Zonas agrícolas periféricas e centro urbano com densidade demográfica moderada')
  const estruturas = extractSnippet(['estruturas'], 'Hospital regional no setor sul e subestação elétrica protegida por regras de engajamento')
  const capacidades = extractSnippet(['capacidades'], 'Abastecimento de água e energia em funcionamento regular; telefonia celular intermitente')
  const organizacoes = extractSnippet(['organiza[çc][õo]es'], 'Presença da Defesa Civil e representação de agências humanitárias na sede municipal')
  const pessoas = extractSnippet(['pessoas'], 'Lideranças comunitárias cooperativas; presença de pequenos grupos de deslocados internos')
  const eventos = extractSnippet(['eventos'], 'Feira livre semanal no centro da localidade aos finais de semana com aglomeração')

  return {
    dicovap,
    ocoav,
    visibilidade,
    vento,
    precipitacao,
    temperatura,
    areas,
    estruturas,
    capacidades,
    organizacoes,
    pessoas,
    eventos
  }
}

export function generateMilitaryLinesOfActionDoctrine(content: {
  mission: string
  situation?: string
  means?: string
  subordinateEchelons?: string[]
}, targetUnit?: string) {
  const isSub = targetUnit && targetUnit !== 'Principal'
  const echelons = content.subordinateEchelons || ['1º Btl', '2º Btl', 'Esqd C Mec']

  if (isSub) {
    return {
      linhasAcao: [
        {
          numero: 1,
          oQue: `Ataque coordenado no flanco leste para romper a segurança externa`,
          como: `A unidade ${targetUnit} desloca-se sob coberta da vegetação, emprega fogos concentrados e assalta as posições avançadas abrindo brecha para a manobra geral.`,
          onde: `No setor leste da área de operações da unidade`,
          paraQue: `Desarticular a segurança do oponente e permitir o desbordamento do escalão superior`,
          quando: `Em D às 06:30h, após a preparação de fogos`,
          faseamento: `Fase I: Ocupação da base de partida / Fase II: Assalto coordenado ao objetivo / Fase III: Consolidação e ligação`,
          sumario: `L Aç 1 (${targetUnit}) — Envolvimento Leste com assalto direto sob apoio de fogos`
        },
        {
          numero: 2,
          oQue: `Fixação frontal com manobra infiltrada de armas de apoio`,
          como: `A unidade ${targetUnit} estabelece base de fogos frontal para atrair a atenção do inimigo e infiltra frações pelos desfiladeiros atingindo a retaguarda adversária.`,
          onde: `No eixo central e desfiladeiros adjacentes`,
          paraQue: `Canalizar o oponente e neutralizar suas armas de apoio em proveito da missão`,
          quando: `Em D às 06:00h com fogos preliminares contínuos`,
          faseamento: `Fase I: Infiltração / Fase II: Demonstração e fixação / Fase III: Ataque de oportunidade`,
          sumario: `L Aç 2 (${targetUnit}) — Fixação frontal e neutralização de armas de apoio por infiltração`
        }
      ]
    }
  }

  const ech1 = echelons[0] || '1º Btl'
  const ech2 = echelons[1] || '2º Btl'
  const ech3 = echelons[2] || 'Esqd C Mec'

  return {
    linhasAcao: [
      {
        numero: 1,
        oQue: `Ataque principal envolvente pelo flanco direito com fixação frontal`,
        como: `O ${ech1} realiza o ataque principal pelo flanco favorável para isolar o objetivo; o ${ech2} conduz a fixação frontal com fogos de apoio; o ${ech3} protege o flanco externo e bloqueia vias de reforço.`,
        onde: `Área de Operações no Eixo Alfa e encostas leste`,
        paraQue: `Conquistar o acidente capital e destruir a capacidade defensiva do oponente`,
        quando: `A partir de D às 06:00h`,
        faseamento: `Fase I: Desdobramento e marcha / Fase II: Fixação e rompimento no flanco / Fase III: Conquista do objetivo / Fase IV: Consolidação e segurança`,
        sumario: `L Aç 1 — Envolvimento pelo Flanco Direito (Esforço Principal: ${ech1}) com Fixação Frontal (${ech2})`
      },
      {
        numero: 2,
        oQue: `Ataque frontal simultâneo com penetração profunda e reserva móvel`,
        como: `O ${ech1} e o ${ech2} conduzem penetração coordenada no ponto mais vulnerável do dispositivo inimigo com saturação de fogos de artilharia, enquanto o ${ech3} fica em reserva para explorar o êxito em profundidade.`,
        onde: `Eixo Central e vias de penetração direta`,
        paraQue: `Fraturar a linha de defesa do inimigo e neutralizar suas reservas em profundidade`,
        quando: `A partir de D às 06:30h após forte preparação de artilharia`,
        faseamento: `Fase I: Preparação maciça de fogos / Fase II: Penetração central / Fase III: Emprego da reserva na exploração / Fase IV: Reorganização`,
        sumario: `L Aç 2 — Penetração Central Agressiva com Exploração em Profundidade pela Reserva (${ech3})`
      }
    ]
  }
}

export function generateOA1Doctrine(content: any): string {
  const echelons = (content.subordinateEchelons || []).join(', ') || 'Elementos subordinados orgânicos'
  return `# 1ª ORDEM DE ALERTA (OA-1)
**CLASSIFICAÇÃO:** SECRETO  
**BASE DOUTRINÁRIA:** EB70-MC-10.211 (PPCOT)

---

### 1. SITUAÇÃO
- **Forças Inimigas:** Elementos adversários identificados na zona de operações organizando posições de bloqueio.
- **Forças Amigas:** O escalão superior determinou a prontidão e início do exame de situação.
- **Elementos Destinatários:** ${echelons}

### 2. MISSÃO
${content.mission || 'Cumprir a manobra operacional conforme diretriz do escalão superior.'}

### 3. EXECUÇÃO
- **Intenção Inicial do Comandante:** ${content.intent || 'Neutralizar ameaças prioritárias e consolidar objetivos.'}
- **Plano do Tempo:** ${content.timePlan || '1/3 para planejamento, 2/3 para preparação e execução.'}
- **Elementos Essenciais de Informação (EEI):**
${(content.eeiList || []).map((eei: string, i: number) => `  ${i + 1}. ${eei}`).join('\n')}
- **Diretrizes Preliminares aos Elementos Subordinados:**
  - Iniciar preparação de material, inspeção de armamento e dotação de munição.
  - Reconhecimento preliminar de cartas e balizamento de itinerários de deslocamento.

### 4. LOGÍSTICA E ADMINISTRAÇÃO
- Suprimento das Classes I, III e V nos pontos de distribuição previstos.
- Evacuação médica preliminar sob responsabilidade da Seção de Saúde da Unidade.

### 5. COMANDO E COMUNICAÇÕES
- Posto de Comando Principal estabelecido na localização inicial.
- Manter disciplina de luzes e silêncio rádio até nova ordem.`
}

export function generateEstimativasDoctrine(content: any) {
  return {
    s2: `**Estimativa S2 (Inteligência):**\nAmeaça principal consolidada em acidentes capitais com linhas defensivas em profundidade. O terreno favorece ações de observação nas cotas dominantes, com vias de acesso canalizadas que impõem necessidade de despistamento e reconhecimento contínuo sobre o dispositivo oponente.`,
    s3: `**Estimativa S3 (Operações):**\nManobra favorável mediante emprego coordenado de esforço principal no flanco desguarnecido e fixação frontal pelo escalão de apoio. A sincronização de fogos preliminares é pré-requisito mandatório para permitir o rompimento da segurança inimiga sem atrito proibitivo.`,
    s4: `**Estimativa S4 (Logística):**\nSustentabilidade assegurada nas classes I e V. Atenção especial à classe III (combustível) devido às distâncias de marcha e necessidade de comboios de reabastecimento durante a transição da Fase II para a Fase III.`,
    s5: `**Estimativa S5 (Assuntos Civis):**\nPopulação local receptiva mas presente em áreas adjacentes ao eixo secundário. Necessidade de isolamento de infraestruturas sensíveis (hospital e subestação) e estabelecimento de corredores de evacuação para não-combatentes.`
  }
}

export function generateSyncGridDoctrine(content: any, targetUnit?: string) {
  const unitLabel = targetUnit && targetUnit !== 'Principal' ? targetUnit : 'Força de Manobra'
  return [
    { fase: 'Fase I: Preparação', funcao: 'Manobra', texto: `${unitLabel}: Ocupação da Base de Partida e reconhecimento dos eixos.` },
    { fase: 'Fase I: Preparação', funcao: 'Inteligência', texto: 'Confirmação do dispositivo avançado do inimigo e vias de acesso.' },
    { fase: 'Fase I: Preparação', funcao: 'Fogos', texto: 'Registro de alvos planejados e posicionamento de baterias.' },
    { fase: 'Fase I: Preparação', funcao: 'Logística', texto: 'Completamento de dotações classes I, III e V.' },
    { fase: 'Fase I: Preparação', funcao: 'Comando e Controle', texto: 'Abertura das redes de comando e testes de redundância.' },
    { fase: 'Fase I: Preparação', funcao: 'Assuntos Civis', texto: 'Coordenação com lideranças locais e emissão de alertas.' },

    { fase: 'Fase II: Movimento', funcao: 'Manobra', texto: `${unitLabel}: Marcha para o combate com segurança aproximada.` },
    { fase: 'Fase II: Movimento', funcao: 'Inteligência', texto: 'Vigilância contínua sobre possíveis contra-ataques nos flancos.' },
    { fase: 'Fase II: Movimento', funcao: 'Fogos', texto: 'Fogos de preparação e neutralização de postos de observação inimigos.' },
    { fase: 'Fase II: Movimento', funcao: 'Logística', texto: 'Avanço de trens de combate e postos de socorro avançados.' },
    { fase: 'Fase II: Movimento', funcao: 'Comando e Controle', texto: 'Controle de itinerários e linhas de fase por rádio tático.' },
    { fase: 'Fase II: Movimento', funcao: 'Assuntos Civis', texto: 'Controle de refugiados fora dos eixos de avanço da tropa.' },

    { fase: 'Fase III: Ação', funcao: 'Manobra', texto: `${unitLabel}: Assalto coordenado ao objetivo capital e rompimento.` },
    { fase: 'Fase III: Ação', funcao: 'Inteligência', texto: 'Avaliação de danos de combate e identificação de retração inimiga.' },
    { fase: 'Fase III: Ação', funcao: 'Fogos', texto: 'Fogos de proteção final e interdição de rotas de fuga do adversário.' },
    { fase: 'Fase III: Ação', funcao: 'Logística', texto: 'Evacuação imediata de baixas e reabastecimento pontual de munição.' },
    { fase: 'Fase III: Ação', funcao: 'Comando e Controle', texto: 'Desdobramento do Posto de Comando Tático próximo ao escalão de ataque.' },
    { fase: 'Fase III: Ação', funcao: 'Assuntos Civis', texto: 'Proteção direta às instalações críticas não militares na área de ação.' },

    { fase: 'Fase IV: Consolidação', funcao: 'Manobra', texto: `${unitLabel}: Reorganização no terreno, segurança 360° e ligação física.` },
    { fase: 'Fase IV: Consolidação', funcao: 'Inteligência', texto: 'Interrogatório tático de prisioneiros e confecção de relatório inicial.' },
    { fase: 'Fase IV: Consolidação', funcao: 'Fogos', texto: 'Novo plano de fogos defensivos e cobertura de zonas cegas.' },
    { fase: 'Fase IV: Consolidação', funcao: 'Logística', texto: 'Recolhimento de material avariado e redistribuição de suprimentos.' },
    { fase: 'Fase IV: Consolidação', funcao: 'Comando e Controle', texto: 'Envio de relatório de situação (SITREP) ao escalão superior.' },
    { fase: 'Fase IV: Consolidação', funcao: 'Assuntos Civis', texto: 'Início da normalização dos serviços essenciais e apoio à população.' }
  ]
}

export function generateOA4Doctrine(content: any, targetUnit?: string): string {
  const isSub = targetUnit && targetUnit !== 'Principal'
  return `# 4ª ORDEM DE ALERTA (OA-4)
**CLASSIFICAÇÃO:** SECRETO  
**BASE DOUTRINÁRIA:** EB70-MC-10.211 (PPCOT - §4.3.8)

---

### 1. SITUAÇÃO ATUALIZADA
O Comandante deliberou e aprovou a Linha de Ação definitiva para a operação. Todas as frações devem acelerar as medidas preparatórias finais.
${isSub ? `- **Destinatário Específico:** Unidade subordinada "${targetUnit}"` : ''}

### 2. MISSÃO DEFINITIVA
${content.mission || 'Cumprir a manobra ofensiva/defensiva aprovada pelo Comandante.'}

### 3. EXECUÇÃO (LINHA DE AÇÃO ESCOLHIDA)
- **Linha de Ação Aprovada:** ${content.laEscolhida || 'Linha de Ação Selecionada'}
- **Intenção do Comandante:** ${content.intencao || 'Conquistar e manter o objetivo com máxima proteção da força e baixas mínimas.'}
- **Modificações Determinadas pelo Comandante:** ${content.modificacoes || 'Nenhuma modificação significativa.'}
- **Diretrizes para os Escalões Subordinados:**
  - Manter rigorosa observância aos prazos de aprontamento.
  - Finalizar ensaios em caixão de areia e sincronização das ações táticas.

### 4. LOGÍSTICA E ADMINISTRAÇÃO
- Prioridade absoluta para trens de combate de munição e combustíveis.
- Horário de corte para requisições extraordinárias: H-4 horas.

### 5. COMANDO E COMUNICAÇÕES
- Postos de comando em funcionamento contínuo.
- Senhas, contra-senhas e frequências alternativas em vigor a partir de D-1.`
}

export function generateOROPDoctrine(content: any) {
  return {
    inimigo: content.inimigo || 'Forças inimigas estimadas em até um batalhão mecanizado desdobrado defensivamente em profundidade ao longo dos acidentes capitais.',
    forcasAmigas: content.forcasAmigas || 'O escalão superior atua no setor geral. A força de manobra conta com os escalões subordinados integrados com apoio de artilharia e engenharia.',
    missao: content.missao || 'A Força deve conduzir manobra agressiva para conquistar e manter o objetivo, a partir de D, no setor designado, a fim de permitir a continuidade das operações.',
    intencaoCmt: content.intencaoCmt || 'Finalidade: Desarticular o sistema defensivo inimigo. Método: Ataque coordenado com surpresa e suporte de fogos. Estado Final Desejado: Objetivo consolidado e segurança estabelecida.',
    conceitoOperacao: content.conceitoOperacao || 'A operação desenvolve-se em quatro fases: Fase I (Desdobramento e Segurança), Fase II (Aproximação e Neutralização de Fogos), Fase III (Ação no Objetivo e Rompimento), Fase IV (Consolidação e Defesa).',
    tarefasSubordinados: content.tarefasSubordinados || '- **1º Btl**: Esforço principal de assalto.\n- **2º Btl**: Apoio e fixação frontal.\n- **Esqd C Mec**: Reconhecimento e segurança dos flancos.',
    instrucoesCoordenacao: content.instrucoesCoordenacao || 'Linhas de fase Alfa e Bravo obrigatórias para reporte; Regras de engajamento restritas quanto a edificações civis; H-hora confirmada sob ordem.',
    apoioLogistico: content.apoioLogistico || 'Bases logísticas avançadas no eixo principal; Evacuação de feridos por eixos prioritários balizados; Prioridade de suprimento para Classe V.',
    comando: content.comando || 'Posto de Comando Principal estabelecido na coordenada 45-80; Linha de sucessão: Subcomandante, Oficial de Operações (S3).',
    comunicacoes: content.comunicacoes || 'Redes rádio táticas principais e secundárias ativas; Uso estrito de códigos de autenticação e plano de frequências em vigor.'
  }
}

