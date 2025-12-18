# API Reference

Base URL: `http://localhost:3001/api`

Documentação interativa: `http://localhost:3001/api/docs`

## Autenticação

Todas as rotas (exceto auth) requerem Bearer token no header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints de Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/auth/google` | Iniciar login Google |
| GET | `/auth/google/callback` | Callback OAuth |
| GET | `/auth/me` | Usuário atual |

## Organizations

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| POST | `/organizations` | Criar organização | * |
| GET | `/organizations/:id` | Obter organização | member |
| PATCH | `/organizations/:id` | Atualizar | OWNER, ADMIN |
| POST | `/organizations/:id/members` | Adicionar membro | OWNER, ADMIN |
| PATCH | `/organizations/:id/members/:memberId` | Alterar role | OWNER, ADMIN |
| DELETE | `/organizations/:id/members/:memberId` | Remover membro | OWNER, ADMIN |

## Brands

Base: `/organizations/:orgId/brands`

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/` | Listar marcas | all |
| POST | `/` | Criar marca | OWNER, ADMIN |
| GET | `/:brandId` | Obter marca | all |
| PATCH | `/:brandId` | Atualizar | OWNER, ADMIN |
| DELETE | `/:brandId` | Deletar | OWNER, ADMIN |

## Templates

Base: `/organizations/:orgId/brands/:brandId/templates`

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/` | Listar templates | OWNER, ADMIN, MANAGER, PRODUCER |
| POST | `/` | Criar template | OWNER, ADMIN, MANAGER |
| POST | `/defaults` | Criar templates padrão | OWNER, ADMIN, MANAGER |
| GET | `/:templateId` | Obter template | OWNER, ADMIN, MANAGER, PRODUCER |
| PATCH | `/:templateId` | Atualizar | OWNER, ADMIN, MANAGER |
| DELETE | `/:templateId` | Deletar | OWNER, ADMIN |
| POST | `/reorder` | Reordenar | OWNER, ADMIN, MANAGER |

## Calendar

Base: `/organizations/:orgId/brands/:brandId/calendar`

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/` | Listar meses | all |
| POST | `/preview` | Preview do plano | OWNER, ADMIN, MANAGER |
| POST | `/generate` | Gerar plano mensal | OWNER, ADMIN, MANAGER |
| GET | `/month?year=X&month=Y` | Obter mês específico | all |
| PATCH | `/:calendarMonthId/status` | Atualizar status | OWNER, ADMIN, MANAGER |
| DELETE | `/:calendarMonthId` | Deletar mês | OWNER, ADMIN |

## Content

Base: `/organizations/:orgId/brands/:brandId/content`

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/` | Listar conteúdos | all |
| GET | `/:contentId` | Obter conteúdo | all |
| PATCH | `/:contentId` | Atualizar | OWNER, ADMIN, MANAGER, PRODUCER |
| POST | `/:contentId/brief` | Criar brief | OWNER, ADMIN, MANAGER |
| POST | `/:contentId/submit-for-approval` | Enviar p/ aprovação | OWNER, ADMIN, MANAGER, PRODUCER |

## Approvals

Base: `/organizations/:orgId/brands/:brandId/approvals`

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/pending` | Listar pendentes | OWNER, ADMIN, MANAGER |
| POST | `/content/:contentId/approve` | Aprovar | OWNER, ADMIN, MANAGER |
| POST | `/content/:contentId/reject` | Rejeitar | OWNER, ADMIN, MANAGER |
| POST | `/content/:contentId/request-revision` | Solicitar revisão | OWNER, ADMIN, MANAGER |

## Exemplo de Requisição

```bash
# Listar templates de uma marca
curl -X GET "http://localhost:3001/api/organizations/org123/brands/brand456/templates" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Criar template
curl -X POST "http://localhost:3001/api/organizations/org123/brands/brand456/templates" \
  -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Feed Segunda",
    "type": "FEED",
    "dayOfWeek": 1,
    "time": "12:00",
    "recurrence": "WEEKLY",
    "category": "produto"
  }'

# Preview do calendário
curl -X POST "http://localhost:3001/api/organizations/org123/brands/brand456/calendar/preview" \
  -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  -d '{"year": 2025, "month": 1}'
```
