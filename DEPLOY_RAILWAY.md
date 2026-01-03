# Deploy no Railway - Maya Social Media

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. [Railway CLI](https://docs.railway.app/develop/cli) instalado (opcional)

## 🚀 Deploy via Dashboard (Recomendado)

### 1. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Conecte seu repositório GitHub

### 2. Adicionar Banco de Dados PostgreSQL

1. No projeto, clique em **"+ New"** → **"Database"** → **"PostgreSQL"**
2. O Railway criará automaticamente a variável `DATABASE_URL`

### 3. Adicionar Redis (Opcional)

1. Clique em **"+ New"** → **"Database"** → **"Redis"**
2. O Railway criará automaticamente a variável `REDIS_URL`

### 4. Configurar Serviço da API

1. Clique em **"+ New"** → **"GitHub Repo"**
2. Selecione o mesmo repositório
3. Nas configurações do serviço:
   - **Root Directory**: `apps/api`
   - **Build Command**: (deixe vazio, usa Dockerfile)
   - **Start Command**: (deixe vazio, usa Dockerfile)

4. Adicione as variáveis de ambiente:

```env
# Obrigatórias
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_SECRET=sua-chave-secreta-aqui-32-caracteres

# Frontend URL (atualizar após deploy do web)
FRONTEND_URL=https://seu-web.railway.app

# Opcionais
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
OPENAI_API_KEY=sua-openai-key
META_ACCESS_TOKEN=seu-meta-token
```

5. Na aba **Settings**:
   - **Port**: `3001`

### 5. Configurar Serviço Web (Frontend)

1. Clique em **"+ New"** → **"GitHub Repo"**
2. Selecione o mesmo repositório
3. Nas configurações:
   - **Root Directory**: `apps/web`

4. Adicione as variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=https://seu-api.railway.app/api
NEXTAUTH_URL=https://seu-web.railway.app
NEXTAUTH_SECRET=mesma-chave-da-api
```

5. Na aba **Settings**:
   - **Port**: `3000`

### 6. Gerar Domínios

Para cada serviço (API e Web):
1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Anote as URLs geradas

### 7. Atualizar Variáveis Cruzadas

Após gerar os domínios, atualize:

**Na API:**
```env
FRONTEND_URL=https://maya-web-production.up.railway.app
```

**No Web:**
```env
NEXT_PUBLIC_API_URL=https://maya-api-production.up.railway.app/api
```

### 8. Rodar Migrations

No serviço da API:
1. Vá em **Settings** → **Deploy**
2. Em **Custom Start Command**, temporariamente use:
```bash
npx prisma db push && node dist/src/main.js
```
3. Após o primeiro deploy, remova o `npx prisma db push &&`

---

## 🖥️ Deploy via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Na pasta do projeto
cd "MAYA - SOCIAL MIDIA"

# Criar projeto
railway init

# Adicionar PostgreSQL
railway add --plugin postgresql

# Deploy da API
cd apps/api
railway up

# Deploy do Web
cd ../web
railway up
```

---

## 🔧 Variáveis de Ambiente Completas

### API (apps/api)

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL do PostgreSQL | ✅ |
| `NEXTAUTH_SECRET` | Secret para JWT (32+ chars) | ✅ |
| `PORT` | Porta da API (3001) | ✅ |
| `FRONTEND_URL` | URL do frontend | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | ❌ |
| `OPENAI_API_KEY` | API Key da OpenAI | ❌ |
| `META_ACCESS_TOKEN` | Token da Meta/Instagram | ❌ |

### Web (apps/web)

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL da API | ✅ |
| `NEXTAUTH_URL` | URL do próprio frontend | ✅ |
| `NEXTAUTH_SECRET` | Mesmo secret da API | ✅ |

---

## ✅ Verificação

Após o deploy:

1. **API Health Check**: `https://sua-api.railway.app/api/health`
2. **Swagger Docs**: `https://sua-api.railway.app/api/docs`
3. **Frontend**: `https://seu-web.railway.app`

---

## 🐛 Troubleshooting

### Build falha na API
- Verifique se `DATABASE_URL` está configurada
- Verifique os logs de build no Railway

### Frontend não conecta na API
- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique CORS na API

### Erro de Prisma
- Execute `npx prisma db push` no deploy inicial
- Verifique se a DATABASE_URL está acessível

---

## 📊 Custos Estimados

Railway oferece:
- **Hobby Plan**: $5/mês (inclui $5 de uso)
- **Pro Plan**: $20/mês (uso ilimitado)

Estimativa para Maya:
- PostgreSQL: ~$5-10/mês
- API: ~$5-10/mês
- Web: ~$5-10/mês
- **Total**: ~$15-30/mês

---

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Discord](https://discord.gg/railway)
