# PPCOT — Plataforma de Planejamento Automatizado

> Automação do Exame de Situação do Comandante  
> Base doutrinária: **EB70-MC-10.211** — Processo de Planejamento e Condução das Operações Terrestres (PPCOT), 2ª Edição, 2020

## Sobre

Plataforma web que automatiza as **6 fases do Exame de Situação** do Componente Detalhado do Planejamento (§4.3 PPCOT), integrando Inteligência Artificial (Claude API) para análise de missão, geração de Linhas de Ação e redação de Ordens de Operações.

## Fases Implementadas

| Fase | Processo | Automação |
|------|----------|-----------|
| 01 | Análise da Missão | IA extrai 5W, tarefas impostas/deduzidas, EEI, enunciado |
| 02 | Situação e Compreensão | MITeMeTeC, DICOVAP, OCOAV, AECOPE, FFF automático |
| 03 | Linhas de Ação | IA gera L Aç, APA preliminar automática, Psb Ini |
| 04 | Comparação das LA | Matriz de Decisão ponderada, ranking automático |
| 05 | Decisão | DIPLAN automática, importação de EEI |
| 06 | Ordem de Operações | Redação automática, impressão direta |

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/lccav98/PPCOT.git
cd PPCOT

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e adicione sua ANTHROPIC_API_KEY

# 4. Iniciar o servidor
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Configuração da IA

A plataforma usa o modelo Claude para análise de ordens e geração de documentos. Para ativar:

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma API Key
3. Adicione ao arquivo `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

> As features de formulário funcionam sem API Key. A IA é opcional.

## Stack Tecnológica

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (tema militar verde/dourado)
- **Anthropic Claude API** (análise e geração de documentos)
- **React Context + localStorage** (persistência local)

## Referência Doutrinária

- EB70-MC-10.211 — PPCOT, 2ª Ed, 2020
- Capítulo IV, §4.3 — Componente Detalhado do Planejamento
- Capítulo III, §3.3 — Fatores Operacionais e da Decisão (MITeMeTeC)
- Anexo A — Exame de Situação do Comandante

---

*Desenvolvido para suporte ao planejamento operacional da Força Terrestre.*
