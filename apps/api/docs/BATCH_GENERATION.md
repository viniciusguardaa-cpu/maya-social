# Geração Automática em Lote - Calendário + IA

## Visão Geral

A funcionalidade de **Geração em Lote** integra automaticamente o agendamento mensal com a criação de briefs e artes usando IA. Isso elimina o trabalho manual de criar conteúdo para cada item do calendário.

## Fluxo Completo

```
1. Criar Templates de Conteúdo (ContentTemplate)
   ↓
2. Gerar Plano Mensal (CalendarMonth + ContentItems)
   ↓
3. [NOVO] Geração Automática em Lote
   ├─ Gerar Briefs com IA (AiService)
   ├─ Gerar Artes com IA (OpenAI + DALL-E prompts)
   └─ Atualizar status dos ContentItems
   ↓
4. Aprovação e Publicação
```

## Endpoints Disponíveis

### 1. Gerar Plano Mensal com Auto-Geração

**POST** `/organizations/:organizationId/brands/:brandId/calendar/generate`

Cria o plano mensal e opcionalmente gera briefs/artes automaticamente.

**Body:**
```json
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

**Opções:**
- `generateBriefs` (default: `true`): Gera briefs com IA para todos os itens PLANNED
- `generateArts` (default: `false`): Gera artes/prompts com IA (requer briefs)
- `autoApprove` (default: `false`): Aprova automaticamente (pula workflow de aprovação)

**Response:**
```json
{
  "id": "clx123...",
  "brandId": "brand123",
  "year": 2025,
  "month": 1,
  "status": "DRAFT",
  "contentItems": [...],
  "batchGeneration": {
    "totalItems": 20,
    "briefsGenerated": 20,
    "artsGenerated": 0,
    "errors": [],
    "duration": 45000
  }
}
```

### 2. Geração em Lote para Mês Existente

**POST** `/organizations/:organizationId/brands/:brandId/calendar/:calendarMonthId/batch-generate`

Gera briefs/artes para um calendário mensal já criado.

**Body:**
```json
{
  "generateBriefs": true,
  "generateArts": true,
  "autoApprove": false
}
```

**Response:**
```json
{
  "totalItems": 20,
  "briefsGenerated": 20,
  "artsGenerated": 18,
  "errors": [
    {
      "contentItemId": "clx456...",
      "error": "Brief not found for content item"
    }
  ],
  "duration": 120000
}
```

### 3. Geração para Itens Selecionados

**POST** `/organizations/:organizationId/brands/:brandId/calendar/batch-generate-selected`

Gera briefs/artes apenas para itens específicos.

**Body:**
```json
{
  "contentItemIds": ["clx123...", "clx456...", "clx789..."],
  "options": {
    "generateBriefs": true,
    "generateArts": true,
    "autoApprove": false
  }
}
```

## Casos de Uso

### Caso 1: Geração Completa Automática
```bash
# Cria plano mensal + gera briefs + gera artes
POST /calendar/generate
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
- 20 ContentItems criados (status: PLANNED)
- 20 Briefs gerados com IA (status: BRIEFED)
- 20 Artes geradas com prompts DALL-E (status: IN_PRODUCTION)
- Metadata com `socialRequestId` e `imagePrompt` anexados

### Caso 2: Apenas Briefs (Artes Manuais)
```bash
# Cria plano + gera apenas briefs
POST /calendar/generate
{
  "year": 2025,
  "month": 3,
  "autoGenerate": {
    "generateBriefs": true,
    "generateArts": false
  }
}
```

**Resultado:**
- ContentItems com briefs prontos
- Designer pode criar artes manualmente
- Workflow de aprovação normal

### Caso 3: Geração Posterior
```bash
# 1. Criar plano sem auto-geração
POST /calendar/generate
{
  "year": 2025,
  "month": 4
}

# 2. Revisar plano

# 3. Gerar briefs/artes depois
POST /calendar/:calendarMonthId/batch-generate
{
  "generateBriefs": true,
  "generateArts": true
}
```

### Caso 4: Regenerar Itens Específicos
```bash
# Selecionar itens que precisam de nova arte
POST /calendar/batch-generate-selected
{
  "contentItemIds": ["clx123", "clx456"],
  "options": {
    "generateBriefs": false,
    "generateArts": true
  }
}
```

## Como Funciona Internamente

### 1. Geração de Briefs
```typescript
// Para cada ContentItem PLANNED:
1. Busca últimos 5 briefs da marca (evitar repetição)
2. Extrai categoria do código (ex: PRODUTO, TREND)
3. Chama AiService.generateBrief() com contexto
4. Cria Brief no banco
5. Atualiza ContentItem para status BRIEFED
```

### 2. Geração de Artes
```typescript
// Para cada ContentItem com Brief:
1. Monta briefing a partir do Brief + Brand
2. Chama OpenAIService.generateCreativeContent()
3. Recebe: copy, design, imagePrompt, export specs
4. Salva SocialRequest com output da IA
5. Anexa metadata ao ContentItem (socialRequestId, imagePrompt)
6. Atualiza status para IN_PRODUCTION
```

### 3. Estrutura do Output de Arte
```json
{
  "copy": {
    "headline": "30% OFF Hoje Apenas",
    "subheadline": "100 peças exclusivas. Entrega grátis acima de R$200",
    "cta": "Ver Coleção Completa",
    "variations": [...]
  },
  "design": {
    "style": "Premium minimalist aesthetic",
    "colorPalette": ["#1A1A1A", "#FFFFFF", "#FF6B6B", "#4ECDC4"],
    "fontStyle": "Modern sans-serif, bold for headline",
    "composition": "Product centered, 40% negative space right for text"
  },
  "imagePrompt": "Product photography, premium minimalist aesthetic, soft diffused lighting from top-left, clean white background with subtle gradient, hero product centered with 40% negative space on right for text overlay, shot with 85mm lens f/2.8, commercial quality, no text, no words, no letters",
  "export": {
    "format": "Instagram format specs",
    "variants": ["1080x1080 Feed", "1080x1920 Story"]
  }
}
```

## Performance e Limites

- **Tempo médio por item:**
  - Brief: ~2-3 segundos
  - Arte: ~5-8 segundos
  
- **Plano mensal típico (20 itens):**
  - Apenas briefs: ~1 minuto
  - Briefs + artes: ~2-3 minutos

- **Rate Limits OpenAI:**
  - Considerar delays entre chamadas
  - Implementar retry logic para falhas

## Tratamento de Erros

O sistema é resiliente a falhas:

```json
{
  "totalItems": 20,
  "briefsGenerated": 18,
  "artsGenerated": 15,
  "errors": [
    {
      "contentItemId": "clx123",
      "error": "OpenAI API rate limit exceeded"
    },
    {
      "contentItemId": "clx456",
      "error": "Brief not found for content item"
    }
  ]
}
```

- Erros não interrompem o processamento
- Itens com erro mantêm status original
- Pode reprocessar apenas os itens com erro

## Próximos Passos

1. **Integração com DALL-E:** Gerar imagens reais (não apenas prompts)
2. **Queue System:** Processar em background para planos grandes
3. **Webhooks:** Notificar quando geração em lote completar
4. **Templates de Arte:** Usar templates visuais da marca
5. **A/B Testing:** Gerar múltiplas variações automaticamente

## Exemplo Completo de Uso

```typescript
// 1. Criar templates (uma vez)
POST /templates/defaults
// Cria templates padrão: Feed, Reels, Stories

// 2. Gerar plano mensal completo
const response = await fetch('/calendar/generate', {
  method: 'POST',
  body: JSON.stringify({
    year: 2025,
    month: 1,
    autoGenerate: {
      generateBriefs: true,
      generateArts: true,
      autoApprove: false
    }
  })
});

const result = await response.json();
// result.contentItems: 20 itens com briefs e artes
// result.batchGeneration: estatísticas da geração

// 3. Revisar e aprovar
// UI mostra todos os itens com preview das artes geradas
// Manager aprova ou solicita revisões

// 4. Publicar
// Itens aprovados vão para agendamento/publicação
```

## Logs e Auditoria

Todas as operações são registradas:

- `BATCH_GENERATION_COMPLETED`: Geração em lote finalizada
- `BRIEF_GENERATED_BATCH`: Brief criado via batch
- `ART_GENERATED_BATCH`: Arte criada via batch

Consultar via `/audit-logs` para rastreabilidade completa.
