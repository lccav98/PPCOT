#!/bin/bash
# ================================================================
# PPCOT — Script de Push para GitHub
# Execute este script no Terminal do seu Mac
# ================================================================

echo "🪖 PPCOT — Push para GitHub"
echo "================================"

# Solicita o PAT
echo ""
echo "Cole seu GitHub Personal Access Token (PAT):"
echo "(Crie em: https://github.com/settings/tokens/new)"
echo "  → Scope necessário: [x] repo"
echo ""
read -s -p "PAT: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Token não informado. Encerrando."
  exit 1
fi

GITHUB_USER="lccav98"
REPO_NAME="PPCOT"

echo ""
echo "📡 Criando repositório privado '$REPO_NAME' em github.com/$GITHUB_USER..."

# Cria o repositório via API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"Plataforma de Planejamento Automatizado — Exame de Situação PPCOT (EB70-MC-10.211)\",
    \"private\": true,
    \"auto_init\": false
  }")

# Verifica se criou com sucesso
if echo "$RESPONSE" | grep -q '"full_name"'; then
  echo "✅ Repositório criado com sucesso!"
elif echo "$RESPONSE" | grep -q '"already exists"'; then
  echo "ℹ️  Repositório já existe. Continuando com push..."
else
  echo "⚠️  Resposta da API:"
  echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Erro:', d.get('message','Desconhecido'))" 2>/dev/null || echo "$RESPONSE"
fi

echo ""
echo "📦 Fazendo push do código..."

# Configura o remote e faz push
cd "$(dirname "$0")"
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git push -u origin main

echo ""
echo "✅ Concluído! Acesse: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "  1. cd $(pwd)"
echo "  2. cp .env.example .env.local"
echo "  3. Adicione sua ANTHROPIC_API_KEY no .env.local"
echo "  4. npm install && npm run dev"
echo "  5. Abra http://localhost:3000"
