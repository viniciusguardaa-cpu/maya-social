# Setup do Ambiente

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta Google Cloud (para OAuth)

## 1. Clone e Instale

```bash
git clone <repo>
cd "MAYA - SOCIAL MIDIA"
npm install
```

## 2. Configure Variáveis de Ambiente

### Backend (`apps/api/.env`)

```env
# Database (porta 5433 para evitar conflito com PostgreSQL local)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/midia?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"

# URLs
API_URL="http://localhost:3001"
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mesmo-secret-do-backend"
```

## 3. Inicie os Serviços

```bash
# Subir PostgreSQL e Redis
docker compose up -d postgres redis

# Criar tabelas no banco
npm run db:push

# (Opcional) Popular com dados de teste
npm run db:seed

# Iniciar em desenvolvimento
npm run dev
```

## 4. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |
| Prisma Studio | `npm run db:studio` |

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia todos os apps
npm run build            # Build de produção

# Database
npm run db:generate      # Gerar Prisma Client
npm run db:migrate       # Criar migração
npm run db:push          # Push schema (dev)
npm run db:seed          # Seed inicial
npm run db:studio        # Interface visual do DB

# Testes
npm run test             # Rodar testes
npm run lint             # Verificar código

# Limpeza
npm run clean            # Limpar builds e node_modules
```

## Troubleshooting

### Porta 5432 em uso

Se você tem PostgreSQL local instalado, a porta 5432 pode estar ocupada. O projeto usa a porta **5433** por padrão para evitar conflitos.

```bash
# Verificar portas em uso
lsof -i :5432
lsof -i :5433
```

### Erro de permissão no banco

```bash
# Reiniciar containers
docker compose down
docker compose up -d postgres redis
```

### Prisma Client desatualizado

```bash
npm run db:generate
```
