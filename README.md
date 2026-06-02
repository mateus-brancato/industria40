# Avaliação Indústria 4.0

Ferramenta de avaliação de maturidade digital baseada no **Toolbox VDMA** e **acatech Maturity Index**.  
Sem login · Salvo automaticamente · Compartilhável por link.

---

## 🚀 Deploy em 10 minutos (Vercel + Supabase — gratuito)

### 1. Criar o banco de dados (Supabase)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um **novo projeto** (escolha o servidor mais próximo, ex: South America)
3. Vá em **SQL Editor** e cole o conteúdo de `supabase-schema.sql`, depois clique em **Run**
4. Vá em **Project Settings → API** e copie:
   - `Project URL` → será seu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Fazer deploy no Vercel

**Opção A — Pela interface (mais fácil):**

1. Acesse [vercel.com](https://vercel.com) e crie uma conta (pode entrar com GitHub/Google)
2. Clique em **Add New → Project**
3. Faça upload desta pasta como repositório GitHub, ou use **Vercel CLI** (veja abaixo)
4. Na tela de configuração, adicione as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
   ```
5. Clique em **Deploy** — em ~2 minutos sua URL estará no ar

**Opção B — Via terminal (Vercel CLI):**

```bash
# Instale o Vercel CLI
npm i -g vercel

# Na pasta do projeto
cd industria40
npm install
vercel

# Siga as instruções, depois adicione as env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Faça o deploy final
vercel --prod
```

---

## 🛠 Rodar localmente (para testes)

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# 3. Rodar
npm run dev
# Acesse http://localhost:3000
```

---

## 📁 Estrutura do projeto

```
industria40/
├── app/
│   ├── page.tsx              # Página inicial (criar/abrir avaliação)
│   ├── a/[shareId]/page.tsx  # Avaliação por link compartilhável
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── RadarChart.tsx        # Radar de maturidade
│   ├── BarChart.tsx          # Barras atual vs. meta
│   ├── GapMatrix.tsx         # Análise de gaps por quadrante
│   ├── ActionPlan.tsx        # Roadmap e iniciativas
│   └── ExportPanel.tsx       # Export Excel e PDF
├── lib/
│   ├── supabase.ts           # Cliente Supabase
│   └── dims.ts               # Dimensões e tipos
├── supabase-schema.sql       # Schema do banco de dados
└── .env.example              # Variáveis de ambiente
```

---

## ✨ Funcionalidades

- ✅ Avaliação nas 12 dimensões do Toolbox VDMA (Produtos + Produção)
- ✅ Escala 1–5 com descrição de cada estágio
- ✅ Meta por dimensão (para comparativo de gap)
- ✅ Campo de observações por dimensão
- ✅ Radar chart Produtos vs. Produção vs. Meta
- ✅ Análise de gaps por quadrante (crítico / oportunidade / forte / menor)
- ✅ Roadmap em 3 horizontes + iniciativas recomendadas
- ✅ Exportação Excel (.xlsx) e PDF completos
- ✅ Salvamento automático no banco de dados
- ✅ Link compartilhável — sem login

---

## 🔒 Segurança

Os dados são públicos por design (acesso via link). Não armazene dados confidenciais sensíveis. Para uso corporativo, habilite Row Level Security com autenticação no Supabase.
