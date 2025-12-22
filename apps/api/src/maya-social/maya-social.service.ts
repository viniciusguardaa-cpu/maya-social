import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateSocialDto } from './dto/generate-social.dto';
import { OpenAIService } from './openai.service';

@Injectable()
export class MayaSocialService {
  constructor(
    private prisma: PrismaService,
    private openai: OpenAIService,
  ) {}

  async generateContent(
    userId: string,
    dto: GenerateSocialDto,
    logo?: Express.Multer.File,
    images?: Express.Multer.File[],
  ) {
    const briefing = this.buildBriefing(dto, logo, images);
    
    const aiResponse = await this.openai.generateCreativeContent(briefing);

    const savedRequest = await this.prisma.socialRequest.create({
      data: {
        userId,
        postType: dto.postType,
        objective: dto.objective,
        mainIdea: dto.mainIdea,
        briefing: briefing,
        generatedOutput: aiResponse,
      },
    });

    return {
      id: savedRequest.id,
      ...aiResponse,
      createdAt: savedRequest.createdAt.toISOString(),
    };
  }

  private buildBriefing(
    dto: GenerateSocialDto,
    logo?: Express.Multer.File,
    images?: Express.Multer.File[],
  ): any {
    const briefing: any = {
      postType: dto.postType,
      objective: dto.objective,
      mainIdea: this.normalizeText(dto.mainIdea),
      copy: {
        headline: dto.headline ? this.normalizeText(dto.headline) : null,
        headlineAuto: !dto.headline,
        subheadline: this.normalizeText(dto.subheadline),
        cta: dto.cta ? this.normalizeText(dto.cta) : null,
        link: dto.link || null,
        whatsapp: dto.whatsapp || null,
      },
      visual: {
        style: dto.style,
        tone: dto.tone,
        colors: dto.colors || null,
        fontStyle: dto.fontStyle,
      },
      assets: {
        hasLogo: !!logo,
        logoName: logo?.originalname || null,
        imagesCount: images?.length || 0,
        imageNames: images?.map((img) => img.originalname) || [],
      },
      restrictions: dto.restrictions ? this.normalizeText(dto.restrictions) : null,
    };

    return briefing;
  }

  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\S\r\n]+/g, ' ');
  }

  async getUserHistory(userId: string, limit: number = 10) {
    return this.prisma.socialRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        postType: true,
        objective: true,
        mainIdea: true,
        createdAt: true,
      },
    });
  }

  async getRequestById(userId: string, requestId: string) {
    const request = await this.prisma.socialRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
    });

    if (!request) {
      throw new BadRequestException('Request not found');
    }

    return request;
  }
}
