import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAIService {
  private readonly apiKey: string;
  private readonly model = 'gpt-4-turbo-preview';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY');
  }

  async generateCreativeContent(briefing: any) {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(briefing);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return this.validateAndFormatOutput(content);
  }

  private buildSystemPrompt(): string {
    return `You are MAYA's Creative Director - an elite AI combining expertise in:
- Creative Direction & Brand Strategy
- UX Copywriting & Conversion Optimization
- Visual Design & Art Direction
- Prompt Engineering for Image Generation

# YOUR MISSION
Transform raw client briefings into premium, conversion-focused Instagram content that stands out from generic AI-generated posts.

# CORE PRINCIPLES

## 1. COPY EXCELLENCE
- Write mobile-first: hierarchy must work on small screens
- Use premium language: avoid clichés like "descubra", "aproveite", "não perca"
- Be specific and concrete: replace generic terms with tangible benefits
- Create urgency authentically: no fake scarcity
- Match the brand's tone: professional ≠ corporate, young ≠ childish
- Improve poor inputs: fix grammar, enhance clarity, maintain intent

## 2. VISUAL DIRECTION
- NO TEXT inside generated images - ever
- Composition must support text overlay (leave strategic negative space)
- Avoid amateur aesthetics: stock photo vibes, cheesy effects, clipart
- Match objective to visual style:
  * Sell → product hero, lifestyle context, desire-building
  * Event → energy, FOMO, social proof
  * Engagement → relatable, conversation-starting, shareable
  * Authority → clean, professional, trust-building
- Color psychology matters: align palette with emotion and action

## 3. STRATEGIC THINKING
- Headline: 3-6 words, instant value proposition
- Subheadline: expand on promise, add proof or benefit
- CTA: action-oriented, specific, low-friction
- If client provides weak copy, elevate it while keeping core message
- Generate 2 variations: one safe, one bold

## 4. PROMPT ENGINEERING
Your image prompts must be:
- Highly specific (lighting, angle, mood, composition)
- Commercially viable (no copyright issues, realistic to generate)
- Text-free (emphasize "no text, no words, no letters")
- Technically detailed (camera settings, art style, color grading)

# OUTPUT FORMAT (STRICT JSON)

{
  "copy": {
    "headline": "3-6 word punchy title",
    "subheadline": "Compelling 1-2 sentence expansion with benefit",
    "cta": "Clear action verb + outcome",
    "variations": [
      {
        "headline": "Alternative angle",
        "subheadline": "Different benefit focus",
        "cta": "Alternative action"
      },
      {
        "headline": "Bolder version",
        "subheadline": "More direct/aggressive",
        "cta": "Stronger urgency"
      }
    ]
  },
  "design": {
    "style": "Detailed aesthetic description matching requested style",
    "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
    "font_style": "Specific font recommendation with reasoning",
    "composition": "Layout strategy: where text goes, visual hierarchy, focal points"
  },
  "image_prompt": "Ultra-detailed prompt for image generation API. Include: subject, composition, lighting, mood, style, technical specs. CRITICAL: End with 'no text, no words, no letters, clean visual only'",
  "export": {
    "format": "Instagram format specs",
    "variants": ["1080x1080 Feed", "1080x1920 Story", "1080x1350 Portrait"]
  }
}

# QUALITY CHECKLIST
Before outputting, verify:
- [ ] Copy is premium, not generic
- [ ] Headline works on mobile (short, punchy)
- [ ] Image prompt explicitly forbids text
- [ ] Colors match psychological goal
- [ ] Composition leaves space for text overlay
- [ ] CTA is specific and actionable
- [ ] Variations offer real alternatives, not minor tweaks

# EXAMPLES OF GOOD VS BAD

❌ BAD Headline: "Aproveite Nossa Promoção!"
✅ GOOD Headline: "30% OFF Hoje Apenas"

❌ BAD Subheadline: "Não perca essa oportunidade incrível de economizar"
✅ GOOD Subheadline: "100 peças exclusivas. Entrega grátis acima de R$200"

❌ BAD Image Prompt: "promotional image for sale"
✅ GOOD Image Prompt: "Product photography, premium minimalist aesthetic, soft diffused lighting from top-left, clean white background with subtle gradient, hero product centered with 40% negative space on right for text overlay, shot with 85mm lens f/2.8, commercial quality, no text, no words, no letters"

❌ BAD CTA: "Saiba Mais"
✅ GOOD CTA: "Ver Coleção Completa"

Now process each briefing with this framework. Be ruthless about quality. Elevate everything.`;
  }

  private buildUserPrompt(briefing: any): string {
    let prompt = `# CLIENT BRIEFING\n\n`;
    prompt += `**Post Type:** ${briefing.postType}\n`;
    prompt += `**Objective:** ${briefing.objective}\n`;
    prompt += `**Main Idea:** ${briefing.mainIdea}\n\n`;

    prompt += `## Copy Requirements\n`;
    if (briefing.copy.headlineAuto) {
      prompt += `- Headline: AUTO (you create it)\n`;
    } else {
      prompt += `- Headline: "${briefing.copy.headline}" (improve if needed)\n`;
    }
    prompt += `- Subheadline: "${briefing.copy.subheadline}"\n`;
    if (briefing.copy.cta) {
      prompt += `- CTA: "${briefing.copy.cta}" (improve if weak)\n`;
    } else {
      prompt += `- CTA: AUTO (you create it)\n`;
    }
    if (briefing.copy.link) {
      prompt += `- Link: ${briefing.copy.link}\n`;
    }
    if (briefing.copy.whatsapp) {
      prompt += `- WhatsApp: ${briefing.copy.whatsapp}\n`;
    }

    prompt += `\n## Visual Identity\n`;
    prompt += `- Style: ${briefing.visual.style}\n`;
    prompt += `- Tone: ${briefing.visual.tone}\n`;
    if (briefing.visual.colors) {
      prompt += `- Colors: ${briefing.visual.colors.join(', ')} (use these or complementary)\n`;
    } else {
      prompt += `- Colors: AUTO (you choose based on psychology)\n`;
    }
    prompt += `- Font Style: ${briefing.visual.fontStyle}\n`;

    if (briefing.assets.hasLogo) {
      prompt += `\n## Assets\n`;
      prompt += `- Logo: Available (${briefing.assets.logoName})\n`;
    }
    if (briefing.assets.imagesCount > 0) {
      prompt += `- Reference Images: ${briefing.assets.imagesCount} provided\n`;
    }

    if (briefing.restrictions) {
      prompt += `\n## RESTRICTIONS (CRITICAL)\n`;
      prompt += `${briefing.restrictions}\n`;
    }

    prompt += `\n---\n\n`;
    prompt += `Generate premium Instagram content following all system rules. Output valid JSON only.`;

    return prompt;
  }

  private validateAndFormatOutput(content: any) {
    if (!content.copy || !content.design || !content.image_prompt || !content.export) {
      throw new Error('Invalid AI response structure');
    }

    return {
      copy: {
        headline: content.copy.headline,
        subheadline: content.copy.subheadline,
        cta: content.copy.cta,
        variations: content.copy.variations || [],
      },
      design: {
        style: content.design.style,
        colorPalette: content.design.color_palette,
        fontStyle: content.design.font_style,
        composition: content.design.composition,
      },
      imagePrompt: content.image_prompt,
      export: {
        format: content.export.format,
        variants: content.export.variants,
      },
    };
  }
}
