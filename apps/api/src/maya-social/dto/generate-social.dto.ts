import { IsString, IsEnum, IsOptional, IsArray, MaxLength, MinLength, IsUrl, Matches } from 'class-validator';

export enum PostType {
  STORY = 'story',
  FEED = 'feed',
  CAROUSEL = 'carousel',
  REEL_COVER = 'reel_cover',
}

export enum PostObjective {
  SELL = 'sell',
  EVENT = 'event',
  ENGAGEMENT = 'engagement',
  AUTHORITY = 'authority',
}

export enum VisualStyle {
  AUTO = 'auto',
  PREMIUM = 'premium',
  CLEAN = 'clean',
  FOOD = 'food',
  LUXURY = 'luxury',
  YOUNG = 'young',
}

export enum ToneStyle {
  AUTO = 'auto',
  AGGRESSIVE = 'aggressive',
  ELEGANT = 'elegant',
  INFORMATIVE = 'informative',
  PLAYFUL = 'playful',
}

export enum FontStyle {
  AUTO = 'auto',
  MODERN = 'modern',
  SERIF = 'serif',
  BOLD = 'bold',
  HANDWRITTEN = 'handwritten',
}

export class GenerateSocialDto {
  @IsEnum(PostType)
  postType: PostType;

  @IsEnum(PostObjective)
  objective: PostObjective;

  @IsString()
  @MinLength(10, { message: 'A ideia principal deve ter pelo menos 10 caracteres' })
  @MaxLength(300, { message: 'A ideia principal não pode exceder 300 caracteres' })
  mainIdea: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  headline?: string;

  @IsString()
  @MinLength(5, { message: 'O subheadline deve ter pelo menos 5 caracteres' })
  @MaxLength(150)
  subheadline: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cta?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link inválido' })
  link?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, { message: 'Formato de WhatsApp inválido' })
  whatsapp?: string;

  @IsEnum(VisualStyle)
  style: VisualStyle;

  @IsEnum(ToneStyle)
  tone: ToneStyle;

  @IsOptional()
  @IsArray()
  @Matches(/^#[0-9A-F]{6}$/i, { each: true, message: 'Cor deve estar em formato HEX (#RRGGBB)' })
  colors?: string[];

  @IsEnum(FontStyle)
  fontStyle: FontStyle;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  restrictions?: string;
}
