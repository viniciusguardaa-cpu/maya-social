import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AiService } from '../ai/ai.service';
import { OpenAIService } from '../maya-social/openai.service';
import { ContentStatus, ContentType } from '@prisma/client';

export interface BatchGenerationOptions {
  generateBriefs?: boolean;
  generateArts?: boolean;
  autoApprove?: boolean;
}

export interface BatchGenerationResult {
  totalItems: number;
  briefsGenerated: number;
  artsGenerated: number;
  errors: Array<{ contentItemId: string; error: string }>;
  duration: number;
}

@Injectable()
export class BatchGenerationService {
  private readonly logger = new Logger(BatchGenerationService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private aiService: AiService,
    private openaiService: OpenAIService,
  ) {}

  async generateForMonth(
    calendarMonthId: string,
    userId: string,
    options: BatchGenerationOptions = {
      generateBriefs: true,
      generateArts: false,
      autoApprove: false,
    },
  ): Promise<BatchGenerationResult> {
    const startTime = Date.now();
    
    this.logger.log(`Starting batch generation for calendar month: ${calendarMonthId}`);

    const calendarMonth = await this.prisma.calendarMonth.findUnique({
      where: { id: calendarMonthId },
      include: {
        brand: true,
        contentItems: {
          where: { status: ContentStatus.PLANNED },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!calendarMonth) {
      throw new Error('Calendar month not found');
    }

    const result: BatchGenerationResult = {
      totalItems: calendarMonth.contentItems.length,
      briefsGenerated: 0,
      artsGenerated: 0,
      errors: [],
      duration: 0,
    };

    for (const contentItem of calendarMonth.contentItems) {
      try {
        if (options.generateBriefs) {
          await this.generateBriefForItem(contentItem, calendarMonth.brand, userId);
          result.briefsGenerated++;
        }

        if (options.generateArts) {
          await this.generateArtForItem(contentItem, calendarMonth.brand, userId);
          result.artsGenerated++;
        }

        if (options.autoApprove) {
          await this.prisma.contentItem.update({
            where: { id: contentItem.id },
            data: { status: ContentStatus.APPROVED },
          });
        }
      } catch (error) {
        this.logger.error(`Error processing item ${contentItem.code}:`, error);
        result.errors.push({
          contentItemId: contentItem.id,
          error: error.message,
        });
      }
    }

    result.duration = Date.now() - startTime;

    await this.auditService.log({
      userId,
      action: 'BATCH_GENERATION_COMPLETED',
      entity: 'CalendarMonth',
      entityId: calendarMonthId,
      newData: {
        totalItems: result.totalItems,
        briefsGenerated: result.briefsGenerated,
        artsGenerated: result.artsGenerated,
        errorsCount: result.errors.length,
        duration: result.duration,
      },
    });

    this.logger.log(`Batch generation completed in ${result.duration}ms`);

    return result;
  }

  private async generateBriefForItem(contentItem: any, brand: any, userId: string) {
    const existingBrief = await this.prisma.brief.findFirst({
      where: { contentItemId: contentItem.id },
    });

    if (existingBrief) {
      this.logger.debug(`Brief already exists for ${contentItem.code}, skipping`);
      return existingBrief;
    }

    const previousBriefs = await this.prisma.brief.findMany({
      where: {
        contentItem: { brandId: brand.id },
      },
      select: { title: true, caption: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const codeMatch = contentItem.code.match(/_([A-Z]+)_v\d+$/);
    const category = codeMatch ? codeMatch[1].toLowerCase() : contentItem.category;

    const generated = await this.aiService.generateBrief({
      brandName: brand.name,
      brandDescription: brand.description,
      contentType: contentItem.type,
      category,
      scheduledAt: contentItem.scheduledAt || undefined,
      previousBriefs: previousBriefs.map(b => ({
        title: b.title,
        caption: b.caption || undefined,
      })),
    });

    const brief = await this.prisma.brief.create({
      data: {
        contentItemId: contentItem.id,
        title: generated.title,
        objective: generated.objective,
        targetAudience: generated.targetAudience,
        promise: generated.promise,
        cta: generated.cta,
        caption: generated.caption,
        hashtags: generated.hashtags,
        script: generated.script || undefined,
        props: generated.props,
      },
    });

    await this.prisma.contentItem.update({
      where: { id: contentItem.id },
      data: { status: ContentStatus.BRIEFED },
    });

    await this.auditService.log({
      userId,
      action: 'BRIEF_GENERATED_BATCH',
      entity: 'Brief',
      entityId: brief.id,
      newData: { title: generated.title, contentItemId: contentItem.id },
    });

    this.logger.debug(`Brief generated for ${contentItem.code}`);

    return brief;
  }

  private async generateArtForItem(contentItem: any, brand: any, userId: string) {
    const brief = await this.prisma.brief.findFirst({
      where: { contentItemId: contentItem.id },
    });

    if (!brief) {
      throw new Error(`Brief not found for content item ${contentItem.code}`);
    }

    const briefing = this.buildBriefingFromContent(contentItem, brief, brand);
    
    const aiResponse = await this.openaiService.generateCreativeContent(briefing);

    await this.prisma.contentItem.update({
      where: { id: contentItem.id },
      data: { 
        status: ContentStatus.IN_PRODUCTION,
      },
    });

    await this.auditService.log({
      userId,
      action: 'ART_GENERATED_BATCH',
      entity: 'ContentItem',
      entityId: contentItem.id,
      newData: { 
        contentItemCode: contentItem.code,
      },
    });

    this.logger.debug(`Art generated for ${contentItem.code}`);

    return { id: contentItem.id, aiResponse };
  }

  private buildBriefingFromContent(contentItem: any, brief: any, brand: any): any {
    return {
      postType: this.mapContentTypeToPostType(contentItem.type),
      objective: brief.objective || 'engagement',
      mainIdea: brief.title,
      copy: {
        headline: brief.title,
        headlineAuto: false,
        subheadline: brief.promise || brief.caption?.substring(0, 150) || brief.title,
        cta: brief.cta || null,
        link: null,
        whatsapp: null,
      },
      visual: {
        style: 'auto',
        tone: 'auto',
        colors: brand.primaryColor ? [brand.primaryColor] : null,
        fontStyle: 'auto',
      },
      assets: {
        hasLogo: !!brand.logoUrl,
        logoName: brand.logoUrl ? 'brand-logo' : null,
        imagesCount: 0,
        imageNames: [],
      },
      restrictions: null,
    };
  }

  private mapContentTypeToPostType(contentType: ContentType): string {
    const mapping: Record<ContentType, string> = {
      [ContentType.FEED]: 'feed',
      [ContentType.REELS]: 'reel_cover',
      [ContentType.STORIES]: 'story',
      [ContentType.CAROUSEL]: 'carousel',
      [ContentType.AD]: 'feed',
    };
    return mapping[contentType] || 'feed';
  }

  async generateForSelectedItems(
    contentItemIds: string[],
    userId: string,
    options: BatchGenerationOptions = {
      generateBriefs: true,
      generateArts: false,
      autoApprove: false,
    },
  ): Promise<BatchGenerationResult> {
    const startTime = Date.now();

    this.logger.log(`Starting batch generation for ${contentItemIds.length} items`);

    const contentItems = await this.prisma.contentItem.findMany({
      where: {
        id: { in: contentItemIds },
        status: ContentStatus.PLANNED,
      },
      include: { brand: true },
    });

    const result: BatchGenerationResult = {
      totalItems: contentItems.length,
      briefsGenerated: 0,
      artsGenerated: 0,
      errors: [],
      duration: 0,
    };

    for (const contentItem of contentItems) {
      try {
        if (options.generateBriefs) {
          await this.generateBriefForItem(contentItem, contentItem.brand, userId);
          result.briefsGenerated++;
        }

        if (options.generateArts) {
          await this.generateArtForItem(contentItem, contentItem.brand, userId);
          result.artsGenerated++;
        }

        if (options.autoApprove) {
          await this.prisma.contentItem.update({
            where: { id: contentItem.id },
            data: { status: ContentStatus.APPROVED },
          });
        }
      } catch (error) {
        this.logger.error(`Error processing item ${contentItem.code}:`, error);
        result.errors.push({
          contentItemId: contentItem.id,
          error: error.message,
        });
      }
    }

    result.duration = Date.now() - startTime;

    await this.auditService.log({
      userId,
      action: 'BATCH_GENERATION_SELECTED_COMPLETED',
      entity: 'ContentItem',
      entityId: contentItemIds[0],
      newData: {
        totalItems: result.totalItems,
        briefsGenerated: result.briefsGenerated,
        artsGenerated: result.artsGenerated,
        errorsCount: result.errors.length,
        duration: result.duration,
      },
    });

    this.logger.log(`Batch generation completed in ${result.duration}ms`);

    return result;
  }
}
