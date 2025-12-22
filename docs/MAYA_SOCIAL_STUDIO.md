# MAYA Social Studio - Complete Implementation Guide

## Overview

MAYA Social Studio is an AI-powered Instagram content generation module that transforms simple briefings into professional, conversion-optimized social media posts.

**Tech Stack:**
- Frontend: React + Next.js + TailwindCSS
- Backend: NestJS + PostgreSQL + Prisma
- AI: GPT-4 Turbo (text generation & orchestration)
- Image: External API (DALL-E, Midjourney, or Stable Diffusion)

---

## 1. User Journey Flow

### Step-by-Step Experience

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Post Basics (30 seconds)                                │
├─────────────────────────────────────────────────────────────────┤
│ User selects:                                                    │
│ • Post Type: Story / Feed / Carousel / Reel Cover              │
│ • Objective: Sell / Event / Engagement / Authority             │
│ • Main Idea: Free text (10-300 chars)                          │
│                                                                  │
│ Validation: Main idea must be ≥10 characters                    │
│ Next: Enabled when valid                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Copy Configuration (60 seconds)                         │
├─────────────────────────────────────────────────────────────────┤
│ User configures:                                                 │
│ • Headline: Manual input OR Auto (AI generates)                │
│ • Subheadline: Required (5-150 chars)                          │
│ • CTA: Optional (AI suggests if empty)                         │
│ • Link: Optional URL                                            │
│ • WhatsApp: Optional phone number                              │
│                                                                  │
│ Features:                                                        │
│ • Character counters on all fields                             │
│ • Toggle switch for AI-generated headline                      │
│ • Copy tips sidebar                                             │
│                                                                  │
│ Validation: Subheadline required                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Visual Identity (45 seconds)                            │
├─────────────────────────────────────────────────────────────────┤
│ User selects:                                                    │
│ • Style: Auto / Premium / Clean / Food / Luxury / Young        │
│ • Tone: Auto / Aggressive / Elegant / Informative / Playful    │
│ • Colors: Auto OR Manual (HEX input, up to 5 colors)           │
│ • Font: Auto / Modern / Serif / Bold / Handwritten             │
│                                                                  │
│ Features:                                                        │
│ • Visual style cards with descriptions                          │
│ • Color picker with live preview                               │
│ • Auto mode highlighted with sparkle icon                      │
│                                                                  │
│ Validation: None (all optional with Auto fallback)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Assets & Restrictions (30 seconds)                      │
├─────────────────────────────────────────────────────────────────┤
│ User uploads:                                                    │
│ • Logo: Single file (PNG/JPG/SVG, max 5MB)                     │
│ • Reference Images: Up to 5 files                              │
│ • Restrictions: Free text (0-500 chars)                        │
│                                                                  │
│ Features:                                                        │
│ • Drag-and-drop upload zones                                   │
│ • File preview with remove option                              │
│ • Tips on effective restrictions                               │
│                                                                  │
│ Validation: None (all optional)                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ GENERATION (15-30 seconds)                                       │
├─────────────────────────────────────────────────────────────────┤
│ System:                                                          │
│ 1. Validates all inputs                                         │
│ 2. Normalizes text (trim, clean spaces)                        │
│ 3. Builds structured briefing JSON                             │
│ 4. Uploads files to storage (if any)                           │
│ 5. Calls GPT-4 with system + user prompts                      │
│ 6. Validates AI response structure                             │
│ 7. Saves to database                                            │
│ 8. Returns generated content                                    │
│                                                                  │
│ UI State:                                                        │
│ • Loading spinner on button                                     │
│ • "Gerando..." text                                             │
│ • Form disabled during generation                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PREVIEW PANEL (Review & Export)                                 │
├─────────────────────────────────────────────────────────────────┤
│ Left Column:                                                     │
│ • Visual Preview (1:1 aspect ratio)                            │
│ • Image prompt display with copy button                        │
│ • Design system details (style, colors, fonts, composition)    │
│                                                                  │
│ Right Column:                                                    │
│ • Copy display (headline, subheadline, CTA)                    │
│ • Variation selector (Principal, V1, V2)                       │
│ • Individual copy buttons per field                            │
│ • "Copy All" button                                             │
│ • Export format options                                         │
│                                                                  │
│ Actions:                                                         │
│ • Edit Briefing → Returns to Step 2                            │
│ • Novo Conteúdo → Resets form to Step 1                        │
│ • Download → Exports final files                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. API Specification

### POST `/api/maya/social/generate`

**Authentication:** Required (JWT Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**

```typescript
{
  data: string; // JSON stringified GenerateSocialDto
  logo?: File;
  image_0?: File;
  image_1?: File;
  image_2?: File;
  image_3?: File;
  image_4?: File;
}
```

**GenerateSocialDto Structure:**

```json
{
  "postType": "feed",
  "objective": "sell",
  "mainIdea": "Lançamento da nova coleção de verão com 30% de desconto",
  "headline": null,
  "subheadline": "Peças exclusivas com até 30% OFF. Aproveite!",
  "cta": "COMPRE AGORA",
  "link": "https://loja.com/verao",
  "whatsapp": "(11) 99999-9999",
  "style": "premium",
  "tone": "elegant",
  "colors": ["#FF6B6B", "#4ECDC4"],
  "fontStyle": "modern",
  "restrictions": "Não usar emojis. Evitar vermelho forte."
}
```

**Response (200 OK):**

```json
{
  "id": "clx123abc",
  "copy": {
    "headline": "VERÃO 2024 CHEGOU",
    "subheadline": "100 peças exclusivas com 30% OFF. Entrega grátis acima de R$200.",
    "cta": "Ver Coleção Completa",
    "variations": [
      {
        "headline": "NOVA COLEÇÃO VERÃO",
        "subheadline": "Estilo premium com desconto especial de lançamento.",
        "cta": "Garantir Desconto"
      },
      {
        "headline": "30% OFF VERÃO",
        "subheadline": "Últimas 100 peças. Acabe enquanto há estoque.",
        "cta": "Comprar Agora"
      }
    ]
  },
  "design": {
    "style": "Premium minimalist with soft gradients and clean typography",
    "colorPalette": ["#FF6B6B", "#4ECDC4", "#F7F7F7", "#2C3E50"],
    "fontStyle": "Modern sans-serif, medium weight for headline, light for body",
    "composition": "Hero product centered with 40% negative space on right for text overlay. Soft shadow for depth. Clean white background with subtle gradient."
  },
  "imagePrompt": "Product photography of summer fashion collection, premium minimalist aesthetic, soft diffused lighting from top-left at 45 degrees, clean white background with subtle warm gradient, hero product centered with 40% negative space on right side for text overlay, shot with 85mm lens f/2.8, shallow depth of field, commercial quality, professional color grading, no text, no words, no letters, clean visual only",
  "export": {
    "format": "Instagram Feed Post",
    "variants": ["1080x1080 Square", "1080x1350 Portrait", "1080x1920 Story"]
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "statusCode": 400,
  "message": "A ideia principal deve ter pelo menos 10 caracteres",
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "OpenAI API error: Rate limit exceeded"
}
```

---

## 3. Database Schema Details

### Table: `social_requests`

Stores every generation request with complete briefing.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | Foreign key to users table |
| postType | String | story, feed, carousel, reel_cover |
| objective | String | sell, event, engagement, authority |
| mainIdea | Text | User's core message |
| briefing | JSON | Complete structured briefing |
| generatedOutput | JSON | AI response (copy + design + prompt) |
| createdAt | DateTime | Request timestamp |
| updatedAt | DateTime | Last modification |

**Indexes:**
- `(userId, createdAt)` - Fast user history queries

---

### Table: `generated_outputs`

Stores individual outputs with tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| requestId | String | Foreign key to social_requests |
| headline | String(60) | Final headline |
| subheadline | String(150) | Final subheadline |
| cta | String(30) | Call to action |
| copyVariations | JSON | Alternative copy versions |
| visualStyle | String | Style description |
| colorPalette | JSON | Array of HEX colors |
| fontStyle | String | Typography recommendation |
| composition | Text | Layout strategy |
| imagePrompt | Text | Full image generation prompt |
| imageUrl | String? | Generated image URL |
| imageStatus | String | pending, generating, completed, failed |
| exportFormat | String | Target format |
| exportVariants | JSON | Available export sizes |
| downloaded | Boolean | Download tracking |
| downloadedAt | DateTime? | Download timestamp |
| published | Boolean | Publication tracking |
| publishedAt | DateTime? | Publication timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last modification |

**Indexes:**
- `(requestId)` - Fast request lookups
- `(imageStatus)` - Queue processing

---

### Table: `brand_preferences`

Saves user preferences for faster future generations.

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| userId | String | Foreign key to users (unique) |
| requestId | String | Source request for preferences |
| brandName | String? | Brand name |
| logoUrl | String? | Stored logo URL |
| defaultStyle | String? | Preferred visual style |
| defaultTone | String? | Preferred tone |
| colorPalette | JSON? | Brand colors |
| fontStyle | String? | Preferred typography |
| voiceTone | Text? | Brand voice description |
| restrictions | Text? | Common restrictions |
| totalRequests | Int | Usage counter |
| lastUsedAt | DateTime | Last usage timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last modification |

---

### Table: `social_analytics`

Tracks performance metrics (optional, for future).

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| outputId | String | Foreign key to generated_outputs |
| impressions | Int? | View count |
| reach | Int? | Unique viewers |
| engagement | Int? | Interactions |
| clicks | Int? | Link clicks |
| saves | Int? | Save count |
| shares | Int? | Share count |
| variant | String? | Which variation was used |
| recordedAt | DateTime | Metrics timestamp |

---

## 4. Error Handling & Edge Cases

### Frontend Validation

**Step 1:**
- Main idea < 10 chars → Show error, disable Next
- Main idea > 300 chars → Truncate input

**Step 2:**
- Subheadline < 5 chars → Show error, disable Next
- Invalid URL format → Show error on blur
- Invalid phone format → Show error on blur

**Step 3:**
- Invalid HEX color → Reject input, show format example
- More than 5 colors → Disable add button

**Step 4:**
- File > 5MB → Show error, reject upload
- Invalid file type → Show error, reject upload
- More than 5 images → Disable upload

### Backend Validation

**Input Sanitization:**
```typescript
// Remove excessive whitespace
text.trim().replace(/\s+/g, ' ')

// Validate enums
if (!Object.values(PostType).includes(dto.postType)) {
  throw new BadRequestException('Invalid post type');
}

// Validate URLs
if (dto.link && !isURL(dto.link)) {
  throw new BadRequestException('Invalid URL format');
}
```

**AI Response Validation:**
```typescript
// Ensure required fields exist
if (!response.copy || !response.design || !response.image_prompt) {
  throw new Error('Incomplete AI response');
}

// Validate color format
response.design.color_palette.forEach(color => {
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    throw new Error('Invalid color in AI response');
  }
});
```

### Error States in UI

**Generation Failed:**
```tsx
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <p className="text-red-800">
    Erro ao gerar conteúdo. Tente novamente ou ajuste o briefing.
  </p>
  <Button onClick={retry}>Tentar Novamente</Button>
</div>
```

**Network Error:**
```tsx
<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <p className="text-yellow-800">
    Conexão perdida. Verifique sua internet e tente novamente.
  </p>
</div>
```

---

## 5. Integration Checklist

### Frontend Setup

- [ ] Install dependencies: `@radix-ui/react-*`, `lucide-react`
- [ ] Add components to `/components/maya-social-studio/`
- [ ] Create route: `/app/dashboard/maya-social/page.tsx`
- [ ] Add navigation link in dashboard sidebar
- [ ] Configure API endpoint in environment variables

### Backend Setup

- [ ] Create module: `nest g module maya-social`
- [ ] Add Prisma schema models to main `schema.prisma`
- [ ] Run migration: `npx prisma migrate dev --name add-maya-social`
- [ ] Add OpenAI API key to `.env`: `OPENAI_API_KEY=sk-...`
- [ ] Register module in `app.module.ts`
- [ ] Configure file upload limits in `main.ts`

### Database Migration

```bash
# Add models to schema.prisma
npx prisma format
npx prisma migrate dev --name add_maya_social_studio
npx prisma generate
```

### Environment Variables

```env
# .env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/svg+xml
```

---

## 6. Performance Optimization

### Caching Strategy

**Brand Preferences:**
```typescript
// Cache user preferences in Redis
const cacheKey = `brand_prefs:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const prefs = await prisma.brandPreference.findUnique({ where: { userId } });
await redis.set(cacheKey, JSON.stringify(prefs), 'EX', 3600);
```

**Rate Limiting:**
```typescript
// Limit to 10 generations per hour per user
@UseGuards(ThrottlerGuard)
@Throttle(10, 3600)
async generateContent() { ... }
```

### Image Generation Queue

```typescript
// Don't block response on image generation
async generateContent() {
  const result = await this.openai.generateCreativeContent(briefing);
  
  // Queue image generation asynchronously
  await this.queue.add('generate-image', {
    outputId: savedRequest.id,
    prompt: result.imagePrompt,
  });
  
  // Return immediately with pending status
  return { ...result, imageStatus: 'pending' };
}
```

---

## 7. Testing Strategy

### Unit Tests

```typescript
describe('MayaSocialService', () => {
  it('should normalize text correctly', () => {
    const input = '  Multiple   spaces  ';
    const output = service['normalizeText'](input);
    expect(output).toBe('Multiple spaces');
  });

  it('should validate required fields', () => {
    const dto = { mainIdea: 'short' };
    expect(() => validate(dto)).toThrow('Main idea too short');
  });
});
```

### Integration Tests

```typescript
describe('POST /maya/social/generate', () => {
  it('should generate content successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/maya/social/generate')
      .set('Authorization', `Bearer ${token}`)
      .field('data', JSON.stringify(validDto))
      .expect(200);

    expect(response.body).toHaveProperty('copy');
    expect(response.body).toHaveProperty('design');
    expect(response.body).toHaveProperty('imagePrompt');
  });
});
```

### E2E Tests

```typescript
describe('MAYA Social Studio Flow', () => {
  it('should complete full generation flow', async () => {
    // Step 1: Fill basics
    await page.fill('[name="mainIdea"]', 'Test idea');
    await page.click('button:has-text("Próximo")');

    // Step 2: Fill copy
    await page.fill('[name="subheadline"]', 'Test subheadline');
    await page.click('button:has-text("Próximo")');

    // Step 3: Select style
    await page.click('[value="premium"]');
    await page.click('button:has-text("Próximo")');

    // Step 4: Generate
    await page.click('button:has-text("Gerar Conteúdo")');

    // Verify preview
    await page.waitForSelector('.preview-panel');
    expect(await page.textContent('h2')).toContain('Conteúdo Gerado');
  });
});
```

---

## 8. Deployment Considerations

### Scalability

- **Horizontal Scaling:** Stateless API allows multiple instances
- **Database:** Connection pooling for PostgreSQL
- **File Storage:** Use S3/CloudFlare R2 for uploaded assets
- **CDN:** Serve generated images via CDN

### Monitoring

```typescript
// Add logging
this.logger.log(`Generation started for user ${userId}`);
this.logger.error(`OpenAI API failed: ${error.message}`);

// Track metrics
await this.metrics.increment('maya_social.generations.total');
await this.metrics.timing('maya_social.generation.duration', duration);
```

### Cost Management

- **OpenAI:** ~$0.02 per generation (GPT-4 Turbo)
- **Storage:** ~$0.023/GB/month (S3)
- **Bandwidth:** Monitor CDN costs

**Budget Controls:**
```typescript
// Limit generations per organization tier
const limits = {
  free: 10,
  pro: 100,
  enterprise: 1000,
};

if (userGenerations >= limits[userTier]) {
  throw new ForbiddenException('Generation limit reached');
}
```

---

## Summary

MAYA Social Studio is a production-ready, scalable module that transforms social media content creation from hours to minutes. The implementation follows best practices for:

- **UX:** Progressive disclosure, clear validation, instant feedback
- **Architecture:** Separation of concerns, type safety, error handling
- **AI:** Structured prompts, quality validation, fallback strategies
- **Data:** Normalized storage, efficient queries, analytics-ready
- **Scale:** Async processing, caching, rate limiting, monitoring

**Next Steps:**
1. Integrate image generation API (DALL-E 3 or Midjourney)
2. Add webhook for async image completion
3. Build export functionality (download as PNG/JPG)
4. Create analytics dashboard for performance tracking
5. Implement A/B testing for copy variations
