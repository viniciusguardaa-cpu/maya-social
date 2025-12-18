# Arquitetura do Sistema

## Visão Geral

MAYA é um sistema multi-tenant de gestão de social media, estruturado como monorepo usando Turborepo.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
│   (Web Browser / Mobile App / API Consumers)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    APPS LAYER                                │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   apps/web      │    │    apps/api     │                 │
│  │   (Next.js)     │───▶│    (NestJS)     │                 │
│  │   Port: 3000    │    │   Port: 3001    │                 │
│  └─────────────────┘    └────────┬────────┘                 │
└──────────────────────────────────┼──────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────┐
│                   DATA LAYER                                 │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   PostgreSQL    │    │     Redis       │                 │
│  │   Port: 5433    │    │   Port: 6379    │                 │
│  └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

```
MAYA - SOCIAL MIDIA/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── prisma/             # Schema e migrações
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── auth/           # Autenticação + OAuth
│   │       ├── users/          # Gestão de usuários
│   │       ├── organizations/  # Multi-tenancy
│   │       ├── brands/         # Marcas/clientes
│   │       ├── templates/      # Templates de conteúdo
│   │       ├── calendar/       # Calendário editorial
│   │       ├── content/        # Peças de conteúdo
│   │       ├── assets/         # Gestão de arquivos
│   │       ├── approvals/      # Workflow de aprovação
│   │       ├── audit/          # Logs de auditoria
│   │       └── prisma/         # Prisma Service
│   │
│   └── web/                    # Frontend Next.js
│       └── src/
│           ├── app/            # App Router (pages)
│           ├── components/     # Componentes React
│           └── lib/            # Utilitários
│
├── packages/
│   └── shared/                 # Código compartilhado
│       └── src/
│           ├── types/          # TypeScript types/interfaces
│           └── constants/      # Constantes e labels
│
├── docs/                       # Documentação
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
│
├── docker-compose.yml          # Serviços Docker
├── turbo.json                  # Configuração Turborepo
└── package.json                # Root package
```

## Multi-Tenancy

O sistema usa **Organization** como tenant principal:

```
Organization (Tenant)
    └── Brand (Cliente/Marca)
        ├── ContentTemplate (Configuração)
        ├── CalendarMonth (Planejamento)
        ├── ContentItem (Peças)
        ├── Asset (Arquivos)
        └── Integration (APIs externas)
```

### Isolamento de Dados

- Todas as queries filtram por `organizationId`
- RBAC (Role-Based Access Control) por organização
- Usuários podem pertencer a múltiplas organizações

## Fluxo de Autenticação

```
1. Usuário acessa /login
2. Redirect para Google OAuth
3. Callback com tokens
4. JWT gerado para sessão
5. Requisições usam Bearer token
```

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, React, TailwindCSS |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Auth | Passport.js, JWT, Google OAuth |
| Docs | Swagger/OpenAPI |
| Monorepo | Turborepo |
| Deploy | Docker, Netlify/Vercel |
