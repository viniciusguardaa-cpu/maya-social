import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MetaService } from '../meta/meta.service';
import { PublicationStatus, ContentStatus } from '@prisma/client';

export interface PublishContentDto {
  igUserId: string;
  imageUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
}

export interface ScheduleContentDto extends PublishContentDto {
  scheduledAt: Date;
}

@Injectable()
export class PublicationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private metaService: MetaService,
  ) {}

  async getByContentItem(contentItemId: string) {
    return this.prisma.publication.findUnique({
      where: { contentItemId },
    });
  }

  async getByBrand(brandId: string, status?: PublicationStatus) {
    const where: any = {
      contentItem: { brandId },
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.publication.findMany({
      where,
      include: {
        contentItem: {
          include: {
            brief: { select: { title: true, caption: true } },
            assets: { select: { id: true, driveUrl: true, type: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getPending(brandId: string) {
    return this.getByBrand(brandId, PublicationStatus.PENDING);
  }

  async getScheduled(brandId: string) {
    return this.getByBrand(brandId, PublicationStatus.SCHEDULED);
  }

  async publish(contentItemId: string, data: PublishContentDto, userId: string) {
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        brief: true,
        assets: true,
        publication: true,
      },
    });

    if (!contentItem) {
      throw new NotFoundException('Content item not found');
    }

    if (contentItem.status !== ContentStatus.APPROVED && contentItem.status !== ContentStatus.SCHEDULED) {
      throw new BadRequestException('Content must be approved before publishing');
    }

    if (contentItem.publication?.status === PublicationStatus.PUBLISHED) {
      throw new BadRequestException('Content already published');
    }

    const caption = contentItem.brief?.caption || '';
    const hashtags = contentItem.brief?.hashtags || [];
    const fullCaption = `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;

    let mediaType: 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL_ALBUM' = 'IMAGE';
    if (contentItem.type === 'REELS') {
      mediaType = 'REELS';
    } else if (contentItem.type === 'CAROUSEL') {
      mediaType = 'CAROUSEL_ALBUM';
    } else if (data.videoUrl) {
      mediaType = 'VIDEO';
    }

    let publication = contentItem.publication;
    if (!publication) {
      publication = await this.prisma.publication.create({
        data: {
          contentItemId,
          status: PublicationStatus.PUBLISHING,
        },
      });
    } else {
      publication = await this.prisma.publication.update({
        where: { id: publication.id },
        data: { status: PublicationStatus.PUBLISHING },
      });
    }

    try {
      const container = await this.metaService.createMediaContainer(data.igUserId, {
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        caption: fullCaption,
        mediaType,
        coverUrl: data.coverUrl,
      });

      let attempts = 0;
      const maxAttempts = 30;
      let containerStatus = container;

      while (containerStatus.status === 'IN_PROGRESS' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        containerStatus = await this.metaService.checkContainerStatus(container.id);
        attempts++;
      }

      if (containerStatus.status === 'ERROR') {
        throw new Error(`Media container error: ${containerStatus.statusCode}`);
      }

      const result = await this.metaService.publishMedia(data.igUserId, container.id);

      publication = await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          status: PublicationStatus.PUBLISHED,
          platformPostId: result.id,
          platformUrl: result.permalink,
          publishedAt: new Date(),
        },
      });

      await this.prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          status: ContentStatus.PUBLISHED,
          platformPostId: result.id,
          publishedAt: new Date(),
        },
      });

      await this.auditService.log({
        userId,
        action: 'CONTENT_PUBLISHED',
        entity: 'Publication',
        entityId: publication.id,
        newData: { platformPostId: result.id, platformUrl: result.permalink },
      });

      return publication;
    } catch (error) {
      await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          status: PublicationStatus.FAILED,
          errorMessage: error.message,
        },
      });

      await this.auditService.log({
        userId,
        action: 'CONTENT_PUBLISH_FAILED',
        entity: 'Publication',
        entityId: publication.id,
        newData: { error: error.message },
      });

      throw new BadRequestException(`Publication failed: ${error.message}`);
    }
  }

  async schedule(contentItemId: string, data: ScheduleContentDto, userId: string) {
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        brief: true,
        assets: true,
        publication: true,
      },
    });

    if (!contentItem) {
      throw new NotFoundException('Content item not found');
    }

    if (contentItem.status !== ContentStatus.APPROVED) {
      throw new BadRequestException('Content must be approved before scheduling');
    }

    const caption = contentItem.brief?.caption || '';
    const hashtags = contentItem.brief?.hashtags || [];
    const fullCaption = `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;

    let mediaType: 'IMAGE' | 'VIDEO' | 'REELS' = 'IMAGE';
    if (contentItem.type === 'REELS') {
      mediaType = 'REELS';
    } else if (data.videoUrl) {
      mediaType = 'VIDEO';
    }

    const container = await this.metaService.scheduleMedia(data.igUserId, {
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      caption: fullCaption,
      mediaType,
      coverUrl: data.coverUrl,
      publishTime: new Date(data.scheduledAt),
    });

    let publication = contentItem.publication;
    if (!publication) {
      publication = await this.prisma.publication.create({
        data: {
          contentItemId,
          status: PublicationStatus.SCHEDULED,
          platformPostId: container.id,
          scheduledAt: new Date(data.scheduledAt),
        },
      });
    } else {
      publication = await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          status: PublicationStatus.SCHEDULED,
          platformPostId: container.id,
          scheduledAt: new Date(data.scheduledAt),
        },
      });
    }

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: ContentStatus.SCHEDULED,
        scheduledAt: new Date(data.scheduledAt),
      },
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_SCHEDULED',
      entity: 'Publication',
      entityId: publication.id,
      newData: { scheduledAt: data.scheduledAt, containerId: container.id },
    });

    return publication;
  }

  async confirmManual(contentItemId: string, data: { platformUrl?: string; platformPostId?: string }, userId: string) {
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: { publication: true },
    });

    if (!contentItem) {
      throw new NotFoundException('Content item not found');
    }

    let publication = contentItem.publication;
    if (!publication) {
      publication = await this.prisma.publication.create({
        data: {
          contentItemId,
          status: PublicationStatus.CONFIRMED_MANUAL,
          confirmedManual: true,
          confirmedBy: userId,
          confirmedAt: new Date(),
          publishedAt: new Date(),
          platformUrl: data.platformUrl,
          platformPostId: data.platformPostId,
        },
      });
    } else {
      publication = await this.prisma.publication.update({
        where: { id: publication.id },
        data: {
          status: PublicationStatus.CONFIRMED_MANUAL,
          confirmedManual: true,
          confirmedBy: userId,
          confirmedAt: new Date(),
          publishedAt: new Date(),
          platformUrl: data.platformUrl,
          platformPostId: data.platformPostId,
        },
      });
    }

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        platformPostId: data.platformPostId,
      },
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_CONFIRMED_MANUAL',
      entity: 'Publication',
      entityId: publication.id,
      newData: { platformUrl: data.platformUrl },
    });

    return publication;
  }

  async retry(publicationId: string, data: PublishContentDto, userId: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id: publicationId },
      include: { contentItem: true },
    });

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    if (publication.status !== PublicationStatus.FAILED) {
      throw new BadRequestException('Can only retry failed publications');
    }

    return this.publish(publication.contentItemId, data, userId);
  }

  async fetchInsights(publicationId: string, userId: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id: publicationId },
      include: { contentItem: true },
    });

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    if (!publication.platformPostId) {
      throw new BadRequestException('No platform post ID found');
    }

    const insights = await this.metaService.getMediaInsights(publication.platformPostId);

    await this.prisma.insight.create({
      data: {
        contentItemId: publication.contentItemId,
        brandId: publication.contentItem.brandId,
        date: new Date(),
        reach: insights.reach,
        impressions: insights.impressions,
        engagement: insights.engagement,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        saves: insights.saved,
        metadata: insights,
      },
    });

    if (publication.contentItem.status === ContentStatus.PUBLISHED) {
      await this.prisma.contentItem.update({
        where: { id: publication.contentItemId },
        data: { status: ContentStatus.MEASURED },
      });
    }

    await this.auditService.log({
      userId,
      action: 'INSIGHTS_FETCHED',
      entity: 'Publication',
      entityId: publicationId,
      newData: insights,
    });

    return insights;
  }

  isMetaConfigured(): boolean {
    return this.metaService.isConfigured();
  }
}
