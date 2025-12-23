# Exemplos de Uso - Geração em Lote

## Exemplo 1: Criação Completa do Zero

### Passo 1: Criar Templates (uma vez por marca)
```bash
POST /organizations/org123/brands/brand456/templates/defaults
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 6,
  "templates": [
    { "name": "Feed Produto", "type": "FEED", "dayOfWeek": 1, "time": "12:00" },
    { "name": "Reels Terça", "type": "REELS", "dayOfWeek": 2, "time": "12:00" },
    ...
  ]
}
```

### Passo 2: Gerar Plano Mensal com Briefs Automáticos
```bash
POST /organizations/org123/brands/brand456/calendar/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2025,
  "month": 1,
  "autoGenerate": {
    "generateBriefs": true,
    "generateArts": false,
    "autoApprove": false
  }
}
```

**Response:**
```json
{
  "id": "clx_calendar_month_123",
  "brandId": "brand456",
  "year": 2025,
  "month": 1,
  "status": "DRAFT",
  "contentItems": [
    {
      "id": "clx_content_001",
      "code": "MAYA_2025-01_FE_01_PRODUTO_v1",
      "type": "FEED",
      "status": "BRIEFED",
      "scheduledAt": "2025-01-06T12:00:00Z",
      "brief": {
        "title": "Lançamento Coleção Verão 2025",
        "objective": "Apresentar nova coleção e gerar desejo",
        "targetAudience": "Mulheres 25-40 anos, classe A/B",
        "promise": "Peças exclusivas com até 30% de desconto",
        "cta": "Ver Coleção Completa",
        "caption": "A coleção que você esperava chegou! ☀️\n\nPeças leves, cores vibrantes e muito estilo...",
        "hashtags": ["verao2025", "moda", "lancamento"]
      }
    },
    // ... mais 19 itens
  ],
  "batchGeneration": {
    "totalItems": 20,
    "briefsGenerated": 20,
    "artsGenerated": 0,
    "errors": [],
    "duration": 42000
  }
}
```

### Passo 3: Gerar Artes Posteriormente
```bash
POST /organizations/org123/brands/brand456/calendar/clx_calendar_month_123/batch-generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "generateBriefs": false,
  "generateArts": true,
  "autoApprove": false
}
```

**Response:**
```json
{
  "totalItems": 20,
  "briefsGenerated": 0,
  "artsGenerated": 20,
  "errors": [],
  "duration": 156000
}
```

## Exemplo 2: Geração Completa em Uma Chamada

```bash
POST /organizations/org123/brands/brand456/calendar/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2025,
  "month": 2,
  "autoGenerate": {
    "generateBriefs": true,
    "generateArts": true,
    "autoApprove": false
  }
}
```

**Resultado:**
- ✅ 20 ContentItems criados
- ✅ 20 Briefs gerados com IA
- ✅ 20 Artes geradas com prompts DALL-E
- ✅ Metadata anexada a cada item
- ⏱️ Tempo total: ~3 minutos

## Exemplo 3: Regenerar Itens Específicos

Cenário: 3 itens precisam de novos briefs/artes

```bash
POST /organizations/org123/brands/brand456/calendar/batch-generate-selected
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentItemIds": [
    "clx_content_005",
    "clx_content_012",
    "clx_content_018"
  ],
  "options": {
    "generateBriefs": true,
    "generateArts": true,
    "autoApprove": false
  }
}
```

**Response:**
```json
{
  "totalItems": 3,
  "briefsGenerated": 3,
  "artsGenerated": 3,
  "errors": [],
  "duration": 24000
}
```

## Exemplo 4: Preview Antes de Gerar

```bash
# 1. Preview do plano
POST /organizations/org123/brands/brand456/calendar/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2025,
  "month": 3
}
```

**Response:**
```json
[
  {
    "code": "MAYA_2025-03_FE_01_PRODUTO_v1",
    "type": "FEED",
    "scheduledAt": "2025-03-03T12:00:00Z",
    "category": "PRODUTO",
    "templateName": "Feed Produto"
  },
  // ... preview de todos os itens
]
```

```bash
# 2. Confirmar e gerar com auto-geração
POST /organizations/org123/brands/brand456/calendar/generate
{
  "year": 2025,
  "month": 3,
  "autoGenerate": {
    "generateBriefs": true,
    "generateArts": true
  }
}
```

## Exemplo 5: Workflow com Aprovação Automática

⚠️ **Cuidado:** Use apenas em ambientes de teste ou com alta confiança na IA

```bash
POST /organizations/org123/brands/brand456/calendar/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2025,
  "month": 4,
  "autoGenerate": {
    "generateBriefs": true,
    "generateArts": true,
    "autoApprove": true  // ⚠️ Pula workflow de aprovação
  }
}
```

**Resultado:**
- ContentItems vão direto para status `APPROVED`
- Prontos para agendamento/publicação
- Sem necessidade de revisão manual

## Exemplo 6: Tratamento de Erros

```bash
POST /organizations/org123/brands/brand456/calendar/clx_month_123/batch-generate
{
  "generateBriefs": true,
  "generateArts": true
}
```

**Response com Erros:**
```json
{
  "totalItems": 20,
  "briefsGenerated": 18,
  "artsGenerated": 15,
  "errors": [
    {
      "contentItemId": "clx_content_007",
      "error": "OpenAI API rate limit exceeded. Retry after 60s"
    },
    {
      "contentItemId": "clx_content_014",
      "error": "Brief generation failed: Invalid brand description"
    }
  ],
  "duration": 145000
}
```

**Reprocessar Apenas os Erros:**
```bash
POST /organizations/org123/brands/brand456/calendar/batch-generate-selected
{
  "contentItemIds": ["clx_content_007", "clx_content_014"],
  "options": {
    "generateBriefs": true,
    "generateArts": true
  }
}
```

## Exemplo 7: Integração com Frontend

```typescript
// React/Next.js Example
async function generateMonthPlan(brandId: string, year: number, month: number) {
  const response = await fetch(
    `/api/organizations/${orgId}/brands/${brandId}/calendar/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        year,
        month,
        autoGenerate: {
          generateBriefs: true,
          generateArts: false, // Artes geradas depois
          autoApprove: false
        }
      })
    }
  );

  const result = await response.json();
  
  // Mostrar progresso
  console.log(`✅ ${result.batchGeneration.briefsGenerated} briefs gerados`);
  console.log(`⏱️ Tempo: ${result.batchGeneration.duration}ms`);
  
  if (result.batchGeneration.errors.length > 0) {
    console.warn(`⚠️ ${result.batchGeneration.errors.length} erros`);
  }
  
  return result;
}

// Gerar artes posteriormente com feedback de progresso
async function generateArtsWithProgress(calendarMonthId: string) {
  const response = await fetch(
    `/api/organizations/${orgId}/brands/${brandId}/calendar/${calendarMonthId}/batch-generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        generateBriefs: false,
        generateArts: true,
        autoApprove: false
      })
    }
  );

  const result = await response.json();
  
  // Atualizar UI
  toast.success(`${result.artsGenerated} artes geradas com sucesso!`);
  
  if (result.errors.length > 0) {
    toast.warning(`${result.errors.length} itens falharam. Tente novamente.`);
  }
  
  return result;
}
```

## Exemplo 8: Consultar Resultados

```bash
# Buscar calendário mensal com todos os dados
GET /organizations/org123/brands/brand456/calendar/month?year=2025&month=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "clx_calendar_month_123",
  "year": 2025,
  "month": 1,
  "status": "DRAFT",
  "contentItems": [
    {
      "id": "clx_content_001",
      "code": "MAYA_2025-01_FE_01_PRODUTO_v1",
      "type": "FEED",
      "status": "IN_PRODUCTION",
      "scheduledAt": "2025-01-06T12:00:00Z",
      "metadata": {
        "socialRequestId": "clx_social_req_001",
        "artGenerated": true,
        "imagePrompt": "Product photography, premium minimalist aesthetic..."
      },
      "brief": {
        "title": "Lançamento Coleção Verão 2025",
        "caption": "A coleção que você esperava chegou! ☀️...",
        // ... resto do brief
      },
      "assets": []
    }
    // ... mais itens
  ]
}
```

## Dicas de Uso

### ✅ Boas Práticas

1. **Preview primeiro**: Use `/preview` antes de gerar
2. **Gerar briefs sempre**: Briefs são rápidos e melhoram qualidade
3. **Artes sob demanda**: Gere artes apenas quando necessário
4. **Revisar erros**: Sempre verificar array de `errors`
5. **Logs de auditoria**: Consultar `/audit-logs` para rastreabilidade

### ⚠️ Evitar

1. **Auto-approve em produção**: Sempre revisar antes de aprovar
2. **Gerar artes sem briefs**: Artes precisam de briefs para contexto
3. **Ignorar rate limits**: OpenAI tem limites de chamadas/minuto
4. **Planos muito grandes**: Para 50+ itens, considerar processamento em background

### 🚀 Performance

- **Briefs**: ~2-3s por item
- **Artes**: ~5-8s por item
- **20 itens (briefs only)**: ~1 minuto
- **20 itens (briefs + artes)**: ~2-3 minutos

### 📊 Monitoramento

```bash
# Verificar logs de auditoria
GET /audit-logs?action=BATCH_GENERATION_COMPLETED&limit=10

# Verificar erros recentes
GET /audit-logs?entity=ContentItem&action=ART_GENERATED_BATCH&limit=50
```
