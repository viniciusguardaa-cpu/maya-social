import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BriefGenerationInput {
  brandName: string;
  brandDescription?: string;
  contentType: string;
  category?: string;
  scheduledAt?: Date;
  previousBriefs?: Array<{
    title: string;
    caption?: string;
  }>;
  tone?: string;
  guidelines?: string;
}

export interface GeneratedBrief {
  title: string;
  objective: string;
  targetAudience: string;
  promise: string;
  cta: string;
  caption: string;
  hashtags: string[];
  script?: {
    hook: string;
    development: string;
    cta: string;
  };
  props: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string | undefined;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('OPENAI_API_KEY');
    this.isEnabled = !!this.apiKey;
    
    if (!this.isEnabled) {
      this.logger.warn('⚠️  OpenAI API key not configured - using mock generation');
    }
  }

  async generateBrief(input: BriefGenerationInput): Promise<GeneratedBrief> {
    if (!this.isEnabled) {
      return this.generateMockBrief(input);
    }

    return this.generateWithOpenAI(input);
  }

  private async generateWithOpenAI(input: BriefGenerationInput): Promise<GeneratedBrief> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em social media marketing brasileiro. 
Gere briefs de conteúdo criativos, engajantes e alinhados com as melhores práticas do Instagram.
Responda SEMPRE em JSON válido, sem markdown.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return JSON.parse(content) as GeneratedBrief;
    } catch (error) {
      this.logger.error('OpenAI generation failed, falling back to mock', error);
      return this.generateMockBrief(input);
    }
  }

  private buildPrompt(input: BriefGenerationInput): string {
    const dayOfWeek = input.scheduledAt 
      ? new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(input.scheduledAt)
      : 'não definido';

    return `
Gere um brief de conteúdo para Instagram com os seguintes parâmetros:

**Marca:** ${input.brandName}
${input.brandDescription ? `**Descrição:** ${input.brandDescription}` : ''}
**Tipo de Conteúdo:** ${input.contentType}
${input.category ? `**Categoria:** ${input.category}` : ''}
**Dia da Semana:** ${dayOfWeek}
${input.tone ? `**Tom de Voz:** ${input.tone}` : '**Tom de Voz:** Profissional mas acessível'}
${input.guidelines ? `**Diretrizes:** ${input.guidelines}` : ''}

${input.previousBriefs?.length ? `
**Briefs anteriores (evite repetir):**
${input.previousBriefs.map(b => `- ${b.title}`).join('\n')}
` : ''}

Responda em JSON com esta estrutura exata:
{
  "title": "Título criativo e chamativo",
  "objective": "Objetivo do conteúdo (engajamento, conversão, awareness, etc)",
  "targetAudience": "Público-alvo específico",
  "promise": "O que o conteúdo promete entregar ao espectador",
  "cta": "Call-to-action claro e direto",
  "caption": "Legenda completa com emojis e formatação",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "script": {
    "hook": "Gancho inicial (primeiros 3 segundos)",
    "development": "Desenvolvimento do conteúdo",
    "cta": "Chamada para ação final"
  },
  "props": ["item necessário 1", "item necessário 2"]
}`;
  }

  private generateMockBrief(input: BriefGenerationInput): GeneratedBrief {
    const typeLabels: Record<string, string> = {
      FEED: 'Post no Feed',
      REELS: 'Reels',
      STORIES: 'Stories',
      CAROUSEL: 'Carrossel',
      AD: 'Anúncio',
    };

    const categoryTitles: Record<string, string[]> = {
      produto: ['Descubra nosso produto', 'Conheça o que temos de melhor', 'Novidade que você precisa'],
      lifestyle: ['Um dia na vida', 'Momentos especiais', 'Inspiração do dia'],
      promocao: ['Oferta imperdível', 'Promoção especial', 'Aproveite agora'],
      bastidores: ['Por trás das câmeras', 'Como fazemos', 'Bastidores exclusivos'],
      tendencia: ['Trend do momento', 'Você já viu isso?', 'O que está bombando'],
      engajamento: ['Conta pra gente', 'Queremos saber', 'Sua opinião importa'],
    };

    const category = input.category?.toLowerCase() || 'produto';
    const titles = categoryTitles[category] || categoryTitles.produto;
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    return {
      title: `${randomTitle} - ${input.brandName}`,
      objective: 'Aumentar engajamento e fortalecer conexão com a audiência',
      targetAudience: 'Seguidores ativos interessados em conteúdo de qualidade',
      promise: 'Conteúdo relevante e valioso para o dia a dia',
      cta: 'Salve esse post e compartilhe com quem precisa ver!',
      caption: `✨ ${randomTitle}!\n\n` +
        `Preparamos esse conteúdo especial pensando em você.\n\n` +
        `💡 O que achou? Conta nos comentários!\n\n` +
        `#${input.brandName.toLowerCase().replace(/\s/g, '')} #conteudo #social`,
      hashtags: [
        input.brandName.toLowerCase().replace(/\s/g, ''),
        category,
        'socialmedia',
        'marketing',
        'conteudo',
      ],
      script: input.contentType === 'REELS' || input.contentType === 'STORIES' ? {
        hook: 'Você precisa ver isso! 👀',
        development: `Vamos falar sobre ${category} de um jeito diferente...`,
        cta: 'Segue a gente pra mais conteúdo assim!',
      } : undefined,
      props: input.contentType === 'REELS' 
        ? ['Boa iluminação', 'Fundo limpo', 'Microfone (se houver fala)']
        : ['Imagem de alta qualidade', 'Identidade visual da marca'],
    };
  }

  async suggestHashtags(topic: string, count = 10): Promise<string[]> {
    if (!this.isEnabled) {
      return this.getMockHashtags(topic, count);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Sugira ${count} hashtags relevantes em português para Instagram sobre: "${topic}". 
Retorne apenas um JSON array de strings, sem o símbolo #. Exemplo: ["hashtag1", "hashtag2"]`,
            },
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = JSON.parse(data.choices[0]?.message?.content || '{"hashtags":[]}');
      return content.hashtags || content;
    } catch {
      return this.getMockHashtags(topic, count);
    }
  }

  private getMockHashtags(topic: string, count: number): string[] {
    const base = [
      'marketing',
      'socialmedia',
      'digitalmarketing',
      'instagram',
      'conteudo',
      'empreendedorismo',
      'negocios',
      'dicas',
      'brasil',
      'trabalho',
    ];
    return base.slice(0, count);
  }

  async improveCaption(caption: string): Promise<string> {
    if (!this.isEnabled) {
      return caption;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Melhore esta legenda de Instagram mantendo a essência mas tornando-a mais engajante:

"${caption}"

Retorne apenas a legenda melhorada, com emojis apropriados e boa formatação.`,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || caption;
    } catch {
      return caption;
    }
  }
}
