# 🧪 Testes - Geração Automática em Lote

## 🔗 Endpoints para Teste

**Base URL (Local):** `http://localhost:4000/api`
**Base URL (Produção):** `https://api.maya-social.com` (ajustar conforme deploy)

## 📋 Pré-requisitos

1. **Autenticação**: Obter token JWT
2. **IDs necessários**:
   - `organizationId`: ID da organização
   - `brandId`: ID da marca
   - `userId`: ID do usuário autenticado

## 🚀 Testes Rápidos

### Teste 1: Preview do Plano Mensal

```bash
curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "year": 2025,
    "month": 1
  }'
```

**Resultado esperado:** Lista de ContentItems que serão criados (preview)

---

### Teste 2: Gerar Plano Mensal SEM Auto-Geração

```bash
curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "year": 2025,
    "month": 1
  }'
```

**Resultado esperado:** 
- CalendarMonth criado
- ContentItems com status `PLANNED`
- SEM briefs ou artes

---

### Teste 3: Gerar Plano Mensal COM Briefs Automáticos ⭐

```bash
curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "year": 2025,
    "month": 2,
    "autoGenerate": {
      "generateBriefs": true,
      "generateArts": false,
      "autoApprove": false
    }
  }'
```

**Resultado esperado:**
```json
{
  "id": "clx...",
  "year": 2025,
  "month": 2,
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

---

### Teste 4: Gerar Plano Completo (Briefs + Artes) 🎨

```bash
curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "year": 2025,
    "month": 3,
    "autoGenerate": {
      "generateBriefs": true,
      "generateArts": true,
      "autoApprove": false
    }
  }'
```

**Resultado esperado:**
- ContentItems com briefs E artes geradas
- Status: `IN_PRODUCTION`
- Metadata com `socialRequestId` e `imagePrompt`

---

### Teste 5: Gerar Briefs/Artes para Mês Existente

```bash
# Primeiro, obter o calendarMonthId do teste anterior
# Depois executar:

curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/{calendarMonthId}/batch-generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "generateBriefs": false,
    "generateArts": true,
    "autoApprove": false
  }'
```

---

### Teste 6: Gerar para Itens Selecionados

```bash
curl -X POST http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/batch-generate-selected \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "contentItemIds": ["clx_content_001", "clx_content_002"],
    "options": {
      "generateBriefs": true,
      "generateArts": true,
      "autoApprove": false
    }
  }'
```

---

## 📱 Teste com Postman/Insomnia

### Collection JSON (Importar no Postman)

```json
{
  "info": {
    "name": "MAYA - Batch Generation Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Preview Plano Mensal",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"year\": 2025,\n  \"month\": 1\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/organizations/{{orgId}}/brands/{{brandId}}/calendar/preview",
          "host": ["{{baseUrl}}"],
          "path": ["organizations", "{{orgId}}", "brands", "{{brandId}}", "calendar", "preview"]
        }
      }
    },
    {
      "name": "2. Gerar com Briefs Automáticos",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"year\": 2025,\n  \"month\": 2,\n  \"autoGenerate\": {\n    \"generateBriefs\": true,\n    \"generateArts\": false,\n    \"autoApprove\": false\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/organizations/{{orgId}}/brands/{{brandId}}/calendar/generate",
          "host": ["{{baseUrl}}"],
          "path": ["organizations", "{{orgId}}", "brands", "{{brandId}}", "calendar", "generate"]
        }
      }
    },
    {
      "name": "3. Gerar Completo (Briefs + Artes)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"year\": 2025,\n  \"month\": 3,\n  \"autoGenerate\": {\n    \"generateBriefs\": true,\n    \"generateArts\": true,\n    \"autoApprove\": false\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/organizations/{{orgId}}/brands/{{brandId}}/calendar/generate",
          "host": ["{{baseUrl}}"],
          "path": ["organizations", "{{orgId}}", "brands", "{{brandId}}", "calendar", "generate"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000/api"
    },
    {
      "key": "token",
      "value": "seu_token_aqui"
    },
    {
      "key": "orgId",
      "value": "seu_org_id"
    },
    {
      "key": "brandId",
      "value": "seu_brand_id"
    }
  ]
}
```

---

## 🔍 Verificar Resultados

### Consultar Calendário Mensal Gerado

```bash
curl -X GET "http://localhost:4000/api/organizations/{organizationId}/brands/{brandId}/calendar/month?year=2025&month=2" \
  -H "Authorization: Bearer {seu_token}"
```

### Verificar Logs de Auditoria

```bash
curl -X GET "http://localhost:4000/api/audit-logs?action=BATCH_GENERATION_COMPLETED&limit=10" \
  -H "Authorization: Bearer {seu_token}"
```

---

## 🧪 Script de Teste Completo (Node.js)

```javascript
// test-batch-generation.js
const BASE_URL = 'http://localhost:4000/api';
const TOKEN = 'seu_token_aqui';
const ORG_ID = 'seu_org_id';
const BRAND_ID = 'seu_brand_id';

async function testBatchGeneration() {
  console.log('🧪 Iniciando testes de geração em lote...\n');

  // Teste 1: Preview
  console.log('1️⃣ Testando preview...');
  const preview = await fetch(
    `${BASE_URL}/organizations/${ORG_ID}/brands/${BRAND_ID}/calendar/preview`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ year: 2025, month: 1 })
    }
  );
  const previewData = await preview.json();
  console.log(`✅ Preview: ${previewData.length} itens\n`);

  // Teste 2: Gerar com briefs
  console.log('2️⃣ Gerando plano com briefs automáticos...');
  const generate = await fetch(
    `${BASE_URL}/organizations/${ORG_ID}/brands/${BRAND_ID}/calendar/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        year: 2025,
        month: 2,
        autoGenerate: {
          generateBriefs: true,
          generateArts: false,
          autoApprove: false
        }
      })
    }
  );
  const generateData = await generate.json();
  console.log(`✅ Gerado: ${generateData.batchGeneration.briefsGenerated} briefs`);
  console.log(`⏱️ Tempo: ${generateData.batchGeneration.duration}ms\n`);

  // Teste 3: Gerar artes para o mês criado
  console.log('3️⃣ Gerando artes para o mês...');
  const calendarMonthId = generateData.id;
  const arts = await fetch(
    `${BASE_URL}/organizations/${ORG_ID}/brands/${BRAND_ID}/calendar/${calendarMonthId}/batch-generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        generateBriefs: false,
        generateArts: true,
        autoApprove: false
      })
    }
  );
  const artsData = await arts.json();
  console.log(`✅ Artes geradas: ${artsData.artsGenerated}`);
  console.log(`⏱️ Tempo: ${artsData.duration}ms\n`);

  console.log('🎉 Testes concluídos!');
}

testBatchGeneration().catch(console.error);
```

**Executar:**
```bash
node test-batch-generation.js
```

---

## 📊 Checklist de Validação

Após executar os testes, verificar:

- [ ] ContentItems criados com códigos corretos
- [ ] Briefs gerados com títulos, captions e hashtags
- [ ] Status dos itens atualizado corretamente
- [ ] Metadata `socialRequestId` e `imagePrompt` anexados
- [ ] Logs de auditoria registrados
- [ ] Erros tratados sem interromper processamento
- [ ] Performance dentro do esperado (~2-3s por item)

---

## 🐛 Troubleshooting

### Erro: "No templates configured"
```bash
# Criar templates padrão primeiro
POST /organizations/{orgId}/brands/{brandId}/templates/defaults
```

### Erro: "Calendar month already exists"
```bash
# Deletar mês existente ou usar outro mês
DELETE /organizations/{orgId}/brands/{brandId}/calendar/{calendarMonthId}
```

### Erro: "OpenAI API key not configured"
```bash
# Verificar variável de ambiente
echo $OPENAI_API_KEY

# Ou configurar no .env
OPENAI_API_KEY=sk-...
```

---

## 📞 Suporte

Se encontrar problemas, verificar:
1. Logs da aplicação: `apps/api/logs`
2. Audit logs: `GET /audit-logs`
3. Status da API: `GET /health`
