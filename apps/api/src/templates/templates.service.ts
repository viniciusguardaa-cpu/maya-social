import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ContentType, Recurrence } from '@prisma/client';

export interface CreateTemplateDto {
  name: string;
  type: ContentType;
  dayOfWeek: number;
  time: string;
  recurrence?: Recurrence;
  category?: string;
  priority?: number;
}

export interface UpdateTemplateDto {
  name?: string;
  type?: ContentType;
  dayOfWeek?: number;
  time?: string;
  recurrence?: Recurrence;
  category?: string;
  isActive?: boolean;
  priority?: number;
}

const DEFAULT_TEMPLATES: Omit<CreateTemplateDto, 'brandId'>[] = [
  { name: 'Feed Produto', type: 'FEED', dayOfWeek: 1, time: '12:00', recurrence: 'WEEKLY', category: 'produto' },
  { name: 'Feed Lifestyle', type: 'FEED', dayOfWeek: 3, time: '12:00', recurrence: 'WEEKLY', category: 'lifestyle' },
  { name: 'Feed Promoção', type: 'FEED', dayOfWeek: 5, time: '12:00', recurrence: 'WEEKLY', category: 'promocao' },
  { name: 'Reels Bastidores', type: 'REELS', dayOfWeek: 2, time: '18:00', recurrence: 'WEEKLY', category: 'bastidores' },
  { name: 'Reels Tendência', type: 'REELS', dayOfWeek: 4, time: '18:00', recurrence: 'WEEKLY', category: 'tendencia' },
  { name: 'Stories Engajamento', type: 'STORIES', dayOfWeek: 0, time: '10:00', recurrence: 'WEEKLY', category: 'engajamento' },
  { name: 'Stories Bastidores', type: 'STORIES', dayOfWeek: 6, time: '10:00', recurrence: 'WEEKLY', category: 'bastidores' },
];

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(brandId: string, data: CreateTemplateDto, userId: string) {
    const template = await this.prisma.contentTemplate.create({
      data: {
        brandId,
        ...data,
        recurrence: data.recurrence || 'WEEKLY',
      },
    });

    await this.auditService.log({
      userId,
      action: 'TEMPLATE_CREATED',
      entity: 'ContentTemplate',
      entityId: template.id,
      newData: JSON.parse(JSON.stringify(data)),
    });

    return template;
  }

  async createDefaults(brandId: string, userId: string) {
    const existing = await this.prisma.contentTemplate.count({
      where: { brandId },
    });

    if (existing > 0) {
      throw new Error('Brand already has templates configured');
    }

    const templates = await this.prisma.contentTemplate.createMany({
      data: DEFAULT_TEMPLATES.map((t, index) => ({
        brandId,
        ...t,
        priority: index,
      })),
    });

    await this.auditService.log({
      userId,
      action: 'DEFAULT_TEMPLATES_CREATED',
      entity: 'ContentTemplate',
      entityId: brandId,
      newData: { count: templates.count },
    });

    return this.findByBrand(brandId);
  }

  async findByBrand(brandId: string, activeOnly = false) {
    return this.prisma.contentTemplate.findMany({
      where: {
        brandId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ priority: 'asc' }, { dayOfWeek: 'asc' }, { time: 'asc' }],
    });
  }

  async findById(id: string) {
    const template = await this.prisma.contentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: string, data: UpdateTemplateDto, userId: string) {
    const oldData = await this.findById(id);

    const template = await this.prisma.contentTemplate.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      userId,
      action: 'TEMPLATE_UPDATED',
      entity: 'ContentTemplate',
      entityId: id,
      oldData: {
        name: oldData.name,
        type: oldData.type,
        dayOfWeek: oldData.dayOfWeek,
        time: oldData.time,
        isActive: oldData.isActive,
      },
      newData: JSON.parse(JSON.stringify(data)),
    });

    return template;
  }

  async delete(id: string, userId: string) {
    const template = await this.findById(id);

    await this.prisma.contentTemplate.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'TEMPLATE_DELETED',
      entity: 'ContentTemplate',
      entityId: id,
      oldData: { name: template.name, type: template.type },
    });

    return { success: true };
  }

  async reorder(brandId: string, templateIds: string[], userId: string) {
    const updates = templateIds.map((id, index) =>
      this.prisma.contentTemplate.update({
        where: { id },
        data: { priority: index },
      }),
    );

    await this.prisma.$transaction(updates);

    await this.auditService.log({
      userId,
      action: 'TEMPLATES_REORDERED',
      entity: 'ContentTemplate',
      entityId: brandId,
      newData: { order: templateIds },
    });

    return this.findByBrand(brandId);
  }
}
