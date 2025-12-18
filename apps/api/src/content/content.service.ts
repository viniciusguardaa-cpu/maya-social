import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AiService } from '../ai/ai.service';
import { ContentStatus, ContentType } from '@prisma/client';

export interface CreateBriefDto {
  title: string;
  objective?: string;
  targetAudience?: string;
  promise?: string;
  cta?: string;
  caption?: string;
  hashtags?: string[];
  script?: Record<string, any>;
  props?: string[];
  guidelines?: Record<string, any>;
  checklist?: Record<string, any>;
}

export interface UpdateContentItemDto {
  status?: ContentStatus;
  scheduledAt?: Date;
}

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private aiService: AiService,
  ) {}

  async findById(id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: {
        brief: true,
        assets: true,
        approvals: {
          orderBy: { createdAt: 'desc' },
        },
        publication: true,
        insights: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Content item not found');
    }

    return item;
  }

  async findByCode(code: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { code },
      include: {
        brief: true,
        assets: true,
        approvals: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Content item not found');
    }

    return item;
  }

  async updateStatus(id: string, status: ContentStatus, userId: string) {
    const item = await this.findById(id);

    if (status === ContentStatus.APPROVED && item.status !== ContentStatus.AWAITING_APPROVAL) {
      throw new BadRequestException('Item must be awaiting approval to be approved');
    }

    if (status === ContentStatus.PUBLISHED && item.status !== ContentStatus.APPROVED && item.status !== ContentStatus.SCHEDULED) {
      throw new BadRequestException('Item must be approved or scheduled to be published');
    }

    const updated = await this.prisma.contentItem.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_STATUS_UPDATED',
      entity: 'ContentItem',
      entityId: id,
      oldData: { status: item.status },
      newData: { status },
    });

    return updated;
  }

  async update(id: string, data: UpdateContentItemDto, userId: string) {
    const item = await this.findById(id);

    const updated = await this.prisma.contentItem.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_ITEM_UPDATED',
      entity: 'ContentItem',
      entityId: id,
      oldData: { status: item.status, scheduledAt: item.scheduledAt?.toISOString() },
      newData: JSON.parse(JSON.stringify(data)),
    });

    return updated;
  }

  async createBrief(contentItemId: string, data: CreateBriefDto, userId: string) {
    const item = await this.findById(contentItemId);

    if (item.brief) {
      throw new BadRequestException('Brief already exists for this content item');
    }

    const brief = await this.prisma.brief.create({
      data: {
        contentItemId,
        ...data,
      },
    });

    await this.prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: ContentStatus.BRIEFED },
    });

    await this.auditService.log({
      userId,
      action: 'BRIEF_CREATED',
      entity: 'Brief',
      entityId: brief.id,
      newData: { title: data.title, contentItemId },
    });

    return brief;
  }

  async updateBrief(briefId: string, data: Partial<CreateBriefDto>, userId: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id: briefId },
    });

    if (!brief) {
      throw new NotFoundException('Brief not found');
    }

    const updated = await this.prisma.brief.update({
      where: { id: briefId },
      data,
    });

    await this.auditService.log({
      userId,
      action: 'BRIEF_UPDATED',
      entity: 'Brief',
      entityId: briefId,
      oldData: { title: brief.title },
      newData: data,
    });

    return updated;
  }

  async submitForApproval(id: string, userId: string) {
    const item = await this.findById(id);

    if (!item.brief) {
      throw new BadRequestException('Brief is required before submitting for approval');
    }

    if (item.assets.length === 0) {
      throw new BadRequestException('At least one asset is required before submitting for approval');
    }

    const updated = await this.prisma.contentItem.update({
      where: { id },
      data: { status: ContentStatus.AWAITING_APPROVAL },
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_SUBMITTED_FOR_APPROVAL',
      entity: 'ContentItem',
      entityId: id,
      newData: { status: ContentStatus.AWAITING_APPROVAL },
    });

    return updated;
  }

  async getPendingApprovals(brandId: string) {
    return this.prisma.contentItem.findMany({
      where: {
        brandId,
        status: ContentStatus.AWAITING_APPROVAL,
      },
      include: {
        brief: true,
        assets: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getUpcoming(brandId: string, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.prisma.contentItem.findMany({
      where: {
        brandId,
        scheduledAt: {
          gte: now,
          lte: future,
        },
        status: {
          in: [ContentStatus.APPROVED, ContentStatus.SCHEDULED],
        },
      },
      include: {
        brief: true,
        assets: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getByStatus(brandId: string, status: ContentStatus) {
    return this.prisma.contentItem.findMany({
      where: { brandId, status },
      include: {
        brief: true,
        assets: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getKanban(brandId: string, calendarMonthId?: string) {
    const where: any = { brandId };
    if (calendarMonthId) {
      where.calendarMonthId = calendarMonthId;
    }

    const items = await this.prisma.contentItem.findMany({
      where,
      include: {
        brief: {
          select: { title: true },
        },
        assets: {
          select: { id: true, type: true, status: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const columns: Record<string, typeof items> = {
      PLANNED: [],
      BRIEFED: [],
      IN_PRODUCTION: [],
      READY: [],
      AWAITING_APPROVAL: [],
      APPROVED: [],
      SCHEDULED: [],
      PUBLISHED: [],
    };

    for (const item of items) {
      if (columns[item.status]) {
        columns[item.status].push(item);
      }
    }

    return {
      columns,
      counts: Object.fromEntries(
        Object.entries(columns).map(([status, items]) => [status, items.length])
      ),
      total: items.length,
    };
  }

  async generateBrief(contentItemId: string, userId: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        brand: true,
        brief: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Content item not found');
    }

    if (item.brief) {
      throw new BadRequestException('Brief already exists. Use update instead.');
    }

    const previousBriefs = await this.prisma.brief.findMany({
      where: {
        contentItem: {
          brandId: item.brandId,
        },
      },
      select: { title: true, caption: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const codeMatch = item.code.match(/_([A-Z]+)_v\d+$/);
    const category = codeMatch ? codeMatch[1].toLowerCase() : undefined;

    const generated = await this.aiService.generateBrief({
      brandName: item.brand.name,
      contentType: item.type,
      category,
      scheduledAt: item.scheduledAt || undefined,
      previousBriefs: previousBriefs.map(b => ({ title: b.title, caption: b.caption || undefined })),
    });

    const brief = await this.prisma.brief.create({
      data: {
        contentItemId,
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
      where: { id: contentItemId },
      data: { status: ContentStatus.BRIEFED },
    });

    await this.auditService.log({
      userId,
      action: 'BRIEF_GENERATED_AI',
      entity: 'Brief',
      entityId: brief.id,
      newData: { title: generated.title, contentItemId },
    });

    return brief;
  }

  async regenerateBrief(briefId: string, userId: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id: briefId },
      include: {
        contentItem: {
          include: { brand: true },
        },
      },
    });

    if (!brief) {
      throw new NotFoundException('Brief not found');
    }

    const codeMatch = brief.contentItem.code.match(/_([A-Z]+)_v\d+$/);
    const category = codeMatch ? codeMatch[1].toLowerCase() : undefined;

    const previousBriefs = await this.prisma.brief.findMany({
      where: {
        contentItem: {
          brandId: brief.contentItem.brandId,
        },
        id: { not: briefId },
      },
      select: { title: true, caption: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const generated = await this.aiService.generateBrief({
      brandName: brief.contentItem.brand.name,
      contentType: brief.contentItem.type,
      category,
      scheduledAt: brief.contentItem.scheduledAt || undefined,
      previousBriefs: previousBriefs.map(b => ({ title: b.title, caption: b.caption || undefined })),
    });

    const updated = await this.prisma.brief.update({
      where: { id: briefId },
      data: {
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

    await this.auditService.log({
      userId,
      action: 'BRIEF_REGENERATED_AI',
      entity: 'Brief',
      entityId: briefId,
      oldData: { title: brief.title },
      newData: { title: generated.title },
    });

    return updated;
  }

  async moveToStatus(id: string, newStatus: ContentStatus, userId: string) {
    const item = await this.findById(id);
    const currentStatus = item.status;

    const validTransitions: Record<ContentStatus, ContentStatus[]> = {
      [ContentStatus.PLANNED]: [ContentStatus.BRIEFED, ContentStatus.CANCELLED],
      [ContentStatus.BRIEFED]: [ContentStatus.IN_PRODUCTION, ContentStatus.PLANNED, ContentStatus.CANCELLED],
      [ContentStatus.IN_PRODUCTION]: [ContentStatus.READY, ContentStatus.BRIEFED, ContentStatus.CANCELLED],
      [ContentStatus.READY]: [ContentStatus.AWAITING_APPROVAL, ContentStatus.IN_PRODUCTION],
      [ContentStatus.AWAITING_APPROVAL]: [ContentStatus.APPROVED, ContentStatus.IN_PRODUCTION],
      [ContentStatus.APPROVED]: [ContentStatus.SCHEDULED, ContentStatus.AWAITING_APPROVAL],
      [ContentStatus.SCHEDULED]: [ContentStatus.PUBLISHED, ContentStatus.APPROVED],
      [ContentStatus.PUBLISHED]: [ContentStatus.MEASURED],
      [ContentStatus.MEASURED]: [],
      [ContentStatus.CANCELLED]: [ContentStatus.PLANNED],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    const updated = await this.prisma.contentItem.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
    });

    await this.auditService.log({
      userId,
      action: 'CONTENT_STATUS_TRANSITION',
      entity: 'ContentItem',
      entityId: id,
      oldData: { status: currentStatus },
      newData: { status: newStatus },
    });

    return updated;
  }

  async bulkMoveToStatus(ids: string[], newStatus: ContentStatus, userId: string) {
    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        const result = await this.moveToStatus(id, newStatus, userId);
        results.push(result);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    return { success: results, errors };
  }
}
