# Maya - Funcionário Digital de Marketing

Sistema multi-tenant de gestão de social media com planejamento, produção, operação e analytics integrados.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- (Opcional) Conta Google Cloud para OAuth

### 1. Clone e instale

```bash
git clone <repo>
cd "MAYA - SOCIAL MIDIA"
npm install
```

### 2. Configure ambiente

```bash
# Copiar exemplo
cp .env.example apps/api/.env

# Editar com suas configurações
# Nota: Porta do PostgreSQL é 5433 (evita conflito com instalação local)
```

### 3. Inicie os serviços

```bash
# Subir PostgreSQL e Redis
docker compose up -d postgres redis

# Criar tabelas
npm run db:push

# Iniciar em desenvolvimento
npm run dev
```

### 4. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |
| Prisma Studio | `npm run db:studio` |

---

## 📁 Estrutura do Projeto

```
MAYA - SOCIAL MIDIA/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── prisma/             # Schema e migrações
│   │   └── src/
│   │       ├── auth/           # Autenticação + OAuth
│   │       ├── users/          # Gestão de usuários
│   │       ├── organizations/  # Multi-tenancy
│   │       ├── brands/         # Marcas/clientes
│   │       ├── templates/      # Templates de conteúdo ✨
│   │       ├── calendar/       # Calendário editorial
│   │       ├── content/        # Peças de conteúdo
│   │       ├── assets/         # Gestão de assets
│   │       ├── approvals/      # Workflow de aprovação
│   │       └── audit/          # Logs de auditoria
│   │
│   └── web/                    # Frontend Next.js
│       └── src/
│           ├── app/            # App Router pages
│           └── lib/            # Utilities
│
├── packages/
│   └── shared/                 # Código compartilhado
│       └── src/
│           ├── types/          # TypeScript interfaces
│           └── constants/      # Labels e constantes
│
├── docs/                       # Documentação
│   ├── ARCHITECTURE.md         # Arquitetura do sistema
│   ├── API.md                  # Referência da API
│   └── SETUP.md                # Guia de setup
│
├── docker-compose.yml          # Serviços Docker
├── turbo.json                  # Config Turborepo
└── package.json                # Root package
```

---

## 🔑 Sistema de Permissões (RBAC)

| Role | Descrição | Permissões |
|------|-----------|------------|
| **OWNER** | Dono da organização | Tudo |
| **ADMIN** | Administrador | Tudo exceto transferir ownership |
| **MANAGER** | Gestor de marketing | Aprovar, editar plano, ver tudo |
| **PRODUCER** | Produtor de conteúdo | Criar briefs, subir assets, ver pendências |
| **SUPPORT** | Atendimento | Ver inbox, responder com sugestões |

---

## 📋 Fluxo de Trabalho

### 1. Planejamento
```
Gerar Plano Mensal → Templates por tipo → ContentItems criados com CÓDIGO
```

### 2. Produção
```
Brief gerado → Produtor sobe asset no Drive → Sistema associa por CÓDIGO → Validação
```

### 3. Aprovação
```
Pronto → Enviar para aprovação → Aprovar/Rejeitar/Revisão → Agendado
```

### 4. Publicação
```
Agendado → Publicar (API) ou Pacote Manual → Confirmar → Medido
```

---

## 🔧 Convenção de CÓDIGO

Formato: `{BRAND}_{ANO-MES}_{TIPO}_{SEQ}_{CATEGORIA}_v{VERSÃO}`

Exemplos:
- `CARACA_2024-01_RL_03_PROMO_v1` → Reels #3 de Janeiro, Promoção
- `DEMO_2024-01_FD_05_PROD_v1` → Feed #5 de Janeiro, Produto

### Tipos
- `FD` = Feed
- `RL` = Reels
- `ST` = Stories
- `CA` = Carousel
- `AD` = Anúncio

---

## 🗄️ Modelo de Dados

### Entidades Principais

- **Organization** → Empresa/Agência
- **Brand** → Marca/Cliente
- **CalendarMonth** → Mês de planejamento
- **ContentItem** → Peça de conteúdo
- **Brief** → Roteiro/diretrizes
- **Asset** → Arquivo (imagem/vídeo)
- **Approval** → Registro de aprovação
- **Publication** → Registro de publicação
- **Insight** → Métricas
- **AuditLog** → Histórico de ações

---

## 🔌 APIs

### Autenticação
```
GET  /api/auth/google           # Login Google
GET  /api/auth/google/callback  # Callback OAuth
GET  /api/auth/me               # Usuário atual
```

### Organizações
```
POST /api/organizations                    # Criar organização
GET  /api/organizations/:id                # Obter organização
POST /api/organizations/:id/members        # Adicionar membro
```

### Marcas
```
GET  /api/organizations/:orgId/brands      # Listar marcas
POST /api/organizations/:orgId/brands      # Criar marca
```

### Calendário
```
POST /api/.../calendar/generate            # Gerar plano mensal
GET  /api/.../calendar?year=2024&month=1   # Obter calendário
```

### Conteúdo
```
GET  /api/.../content/:id                  # Obter peça
POST /api/.../content/:id/brief            # Criar brief
POST /api/.../content/:id/submit-for-approval  # Enviar para aprovação
```

### Aprovações
```
GET  /api/.../approvals/pending            # Pendentes
POST /api/.../approvals/content/:id/approve    # Aprovar
POST /api/.../approvals/content/:id/reject     # Rejeitar
```

---

## 🐳 Deploy com Docker

```bash
# Build e deploy completo
docker compose up -d

# Apenas banco + redis (desenvolvimento)
docker compose up -d postgres redis
```

---

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📊 Roadmap

### ✅ Sprint 0 - Base (Atual)
- [x] Monorepo setup
- [x] Auth + RBAC
- [x] Prisma Schema
- [x] Módulos básicos

### 🔲 Sprint 1 - Planejamento
- [ ] CalendarMonth CRUD completo
- [ ] Templates configuráveis
- [ ] Diff/confirm para alterações

### 🔲 Sprint 2 - Brief + Produção
- [ ] Brief generator com LLM
- [ ] Kanban de status

### 🔲 Sprint 3 - Drive + Assets
- [ ] Google Drive Connector
- [ ] Polling/webhook para novos arquivos
- [ ] Validação automática

### 🔲 Sprint 4 - Publicação
- [ ] Meta API Connector
- [ ] Pacote manual + confirmação

### 🔲 Sprint 5 - Analytics
- [ ] Sync de insights
- [ ] Relatório diário WhatsApp

---

## 📝 Licença

Proprietário - Todos os direitos reservados.
