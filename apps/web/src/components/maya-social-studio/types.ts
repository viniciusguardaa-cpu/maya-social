export type PostType = 'story' | 'feed' | 'carousel' | 'reel_cover';
export type PostObjective = 'sell' | 'event' | 'engagement' | 'authority';
export type VisualStyle = 'premium' | 'clean' | 'food' | 'luxury' | 'young' | 'auto';
export type ToneStyle = 'aggressive' | 'elegant' | 'informative' | 'playful' | 'auto';
export type FontStyle = 'auto' | 'modern' | 'serif' | 'bold' | 'handwritten';

export interface SocialStudioFormData {
  step1: {
    postType: PostType;
    objective: PostObjective;
    mainIdea: string;
  };
  step2: {
    headline: string;
    headlineAuto: boolean;
    subheadline: string;
    cta: string;
    link: string;
    whatsapp: string;
  };
  step3: {
    style: VisualStyle;
    tone: ToneStyle;
    colors: string[];
    colorMode: 'auto' | 'manual';
    fontStyle: FontStyle;
  };
  step4: {
    logo: File | null;
    images: File[];
    restrictions: string;
  };
}

export interface GeneratedOutput {
  id: string;
  copy: {
    headline: string;
    subheadline: string;
    cta: string;
    variations: Array<{
      headline: string;
      subheadline: string;
      cta: string;
    }>;
  };
  design: {
    style: string;
    colorPalette: string[];
    fontStyle: string;
    composition: string;
  };
  imagePrompt: string;
  imageUrl?: string;
  export: {
    format: string;
    variants: string[];
  };
  createdAt: string;
}
