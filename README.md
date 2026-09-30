# PPCOT — Plataforma de Planejamento Automatizado

> Automação do Exame de Situação do Comandante  
> Base doutrinária: **EB70-MC-10.211** — Processo de Planejamento e Condução das Operações Terrestres (PPCOT), 2ª Edição, 2020

## Sobre

Plataforma web militar que automatiza as **6 fases do Exame de Situação** do Componente Detalhado do Planejamento (§4.3 PPCOT). O sistema adota uma arquitetura de IA especializada de duplo motor:
- **Motor de Tomada de Decisão: JEV (TypeSafe System One)** — Julgamentos tipados, composite scoring calibrado, prova de APA (Adequabilidade, Praticabilidade, Aceitabilidade) com probabilidades probabilísticas e intervalos de confiança para apoio à decisão do Comandante.
- **Motor de Redação de Ordens: Gemini API** — Extração e redação estruturada de documentos operacionais (DIPLAN, OA-1, OA-4, OROP e Estimativas S2-S5).

## Fases Implementadas

| Fase | Processo | Automação e IA |
|------|----------|----------------|
| 01 | Análise da Missão | IA extrai 5W, tarefas impostas/deduzidas, restrições, EEI e novo enunciado |
| 02 | Situação e Compreensão | DICOVAP, OCOAV, FFF automático e estimativas de Estado-Maior |
| 03 | Linhas de Ação | Formulação de manobras táticas por escalão e sincronização |
| 04 | Comparação das LA | **Motor JEV (System One)**: Matriz de Decisão ponderada (Score), Prova de APA (Noul), Distribuição de Probabilidades e Recomendação (Choice) |
| 05 | Decisão | Decisão do Comandante fundamentada no JEV, DIPLAN atualizada e emissão de OA-4 |
| 06 | Ordem de Operações | Redação completa da OROP com tarefas aos escalões subordinados |

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/lccav98/PPCOT.git
cd PPCOT

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e adicione TYPESAFE_API_KEY e GEMINI_API_KEY

# 4. Iniciar o servidor
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Configuração dos Motores de IA

### 1. Motor de Tomada de Decisão (JEV / TypeSafe AI)
Utilizado na **Fase 04 (Matriz de Decisão, Prova de APA e Recomendação de L Aç)**:
1. Obtenha sua chave em [console.typesafe.ai](https://console.typesafe.ai/)
2. No arquivo `.env.local`, defina:
   ```env
   TYPESAFE_API_KEY=ts_sua_chave_aqui
   TYPESAFE_MODEL=jev-latest
   ```
> Modelos generativos tradicionais (LLMs) são inadequados para matrizes de decisão quantitativas devido a alucinações e ausência de calibração estatística. O JEV atua como modelo *System One*, gerando julgamentos tipados e probabilidades calibradas consumidas diretamente pelo código.

### 2. Motor de Redação Operacional (Gemini API)
Utilizado para redação de ordens de operações, ordens de alerta e estimativas de EM:
1. Obtenha sua chave no [Google AI Studio](https://aistudio.google.com/)
2. No arquivo `.env.local`, defina:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.0-flash
   ```

> As funcionalidades de formulário e persistência local operam normalmente mesmo sem API Keys configuradas.

## Stack Tecnológica

- **Next.js 16** (App Router & Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (tema militar tático verde/dourado)
- **@typesafe-ai/sdk** (Motor de Decisão JEV — System One)
- **Google Generative AI / Gemini** (Redação e extração textual)
- **React Context + localStorage** (persistência e isolamento por escalão)

## Referência Doutrinária

- EB70-MC-10.211 — PPCOT, 2ª Ed, 2020
- Capítulo IV, §4.3 — Componente Detalhado do Planejamento
- Capítulo III, §3.3 — Fatores Operacionais e da Decisão (MITeMeTeC)
- Anexo A — Exame de Situação do Comandante

---

*Desenvolvido para apoio à decisão e suporte ao planejamento operacional da Força Terrestre.*
