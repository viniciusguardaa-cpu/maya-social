import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ContentType, ContentStatus } from '@prisma/client';
import { BatchGenerationService, BatchGenerationOptions } from './batch-generation.service';

export interface GenerateMonthPlanDto {
  brandId: string;
  year: number;
  month: number;
  preview?: boolean;
  autoGenerate?: BatchGenerationOptions;
}

export interface PlanPreviewItem {
  code: string;
  type: ContentType;
  scheduledAt: Date;
  category?: string;
  templateName: string;
}

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private batchGenerationService: BatchGenerationService,
  ) {}

  generateContentCode(brandSlug: string, year: number, month: number, type: ContentType, sequence: number, category?: string): string {
    const typeCode = type.substring(0, 2).toUpperCase();
    const categoryCode = category ? `_${category.toUpperCase().substring(0, 6)}` : '';
    const seq = String(sequence).padStart(2, '0');
    return `${brandSlug.toUpperCase()}_${year}-${String(month).padStart(2, '0')}_${typeCode}_${seq}${categoryCode}_v1`;
  }

  private async getActiveTemplates(brandId: string) {
    const templates = await this.prisma.contentTemplate.findMany({
      where: { brandId, isActive: true },
      orderBy: [{ priority: 'asc' }, { dayOfWeek: 'asc' }],
    });

    if (templates.length === 0) {
      throw new BadRequestException(
        'No templates configured for this brand. Create templates first or use POST /templates/defaults',
      );
    }

    return templates;
  }

  private shouldIncludeInWeek(recurrence: string, weekOfMonth: number): boolean {
    switch (recurrence) {
      case 'WEEKLY':
        return true;
      case 'BIWEEKLY':
        return weekOfMonth % 2 === 1;
      case 'MONTHLY':
        return weekOfMonth === 1;
      default:
        return true;
    }
  }

  private buildContentItems(
    brand: { id: string; slug: string },
    templates: any[],
    year: number,
    month: number,
    calendarMonthId?: string,
  ) {
    const contentItems: any[] = [];
    const counters: Record<string, number> = {};

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const weekOfMonth = Math.ceil(d.getDate() / 7);

      for (const template of templates) {
        if (template.dayOfWeek === dayOfWeek && this.shouldIncludeInWeek(template.recurrence, weekOfMonth)) {
          const key = `${template.type}_${template.category || 'default'}`;
          counters[key] = (counters[key] || 0) + 1;

          const [hours, minutes] = template.time.split(':').map(Number);
          const scheduledAt = new Date(d);
          scheduledAt.setHours(hours, minutes, 0, 0);

          const code = this.generateContentCode(
            brand.slug,
            year,
            month,
            template.type,
            counters[key],
            template.category,
          );

          contentItems.push({
            brandId: brand.id,
            calendarMonthId,
            code,
            type: template.type,
            status: ContentStatus.PLANNED,
            scheduledAt,
            templateName: template.name,
            category: template.category,
          });
        }
      }
    }

    return contentItems;
  }

  async previewMonthPlan(data: GenerateMonthPlanDto): Promise<PlanPreviewItem[]> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const templates = await this.getActiveTemplates(data.brandId);
    const items = this.buildContentItems(brand, templates, data.year, data.month);

    return items.map((item) => ({
      code: item.code,
      type: item.type,
      scheduledAt: item.scheduledAt,
      category: item.category,
      templateName: item.templateName,
    }));
  }

  async generateMonthPlan(data: GenerateMonthPlanDto, userId: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const existingMonth = await this.prisma.calendarMonth.findUnique({
      where: {
        brandId_year_month: {
          brandId: data.brandId,
          year: data.year,
          month: data.month,
        },
      },
    });

    if (existingMonth) {
      throw new BadRequestException('Calendar month already exists. Delete or update existing plan.');
    }

    const templates = await this.getActiveTemplates(data.brandId);

    const calendarMonth = await this.prisma.calendarMonth.create({
      data: {
        brandId: data.brandId,
        year: data.year,
        month: data.month,
        status: 'DRAFT',
      },
    });

    const contentItems = this.buildContentItems(brand, templates, data.year, data.month, calendarMonth.id);

    const itemsToCreate = contentItems.map(({ templateName, category, ...item }) => item);

    await this.prisma.contentItem.createMany({
      data: itemsToCreate,
    });

    await this.auditService.log({
      userId,
      action: 'CALENDAR_MONTH_GENERATED',
      entity: 'CalendarMonth',
      entityId: calendarMonth.id,
      newData: {
        year: data.year,
        month: data.month,
        itemsCount: contentItems.length,
      },
    });

    const result = await this.getMonthWithItems(calendarMonth.id);

    if (data.autoGenerate) {
      const batchResult = await this.batchGenerationService.generateForMonth(
        calendarMonth.id,
        userId,
        data.autoGenerate,
      );

      return {
        ...result,
        batchGeneration: batchResult,
      };
    }

    return result;
  }

  async listMonths(brandId: string) {
    return this.prisma.calendarMonth.findMany({
      where: { brandId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        _count: {
          select: { contentItems: true },
        },
      },
    });
  }

  async getMonthWithItems(calendarMonthId: string) {
    return this.prisma.calendarMonth.findUnique({
      where: { id: calendarMonthId },
      include: {
        contentItems: {
          orderBy: { scheduledAt: 'asc' },
          include: {
            brief: true,
            assets: true,
            approvals: true,
          },
        },
      },
    });
  }

  async getByBrandAndMonth(brandId: string, year: number, month: number) {
    const calendarMonth = await this.prisma.calendarMonth.findUnique({
      where: {
        brandId_year_month: { brandId, year, month },
      },
      include: {
        contentItems: {
          orderBy: { scheduledAt: 'asc' },
          include: {
            brief: true,
            assets: true,
            approvals: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!calendarMonth) {
      throw new NotFoundException('Calendar month not found');
    }

    return calendarMonth;
  }

  async updateMonthStatus(id: string, status: string, userId: string) {
    const oldMonth = await this.prisma.calendarMonth.findUnique({
      where: { id },
    });

    if (!oldMonth) {
      throw new NotFoundException('Calendar month not found');
    }

    const updated = await this.prisma.calendarMonth.update({
      where: { id },
      data: { status },
    });

    await this.auditService.log({
      userId,
      action: 'CALENDAR_MONTH_STATUS_UPDATED',
      entity: 'CalendarMonth',
      entityId: id,
      oldData: { status: oldMonth.status },
      newData: { status },
    });

    return updated;
  }

  async deleteMonth(id: string, userId: string) {
    const month = await this.prisma.calendarMonth.findUnique({
      where: { id },
      include: { contentItems: true },
    });

    if (!month) {
      throw new NotFoundException('Calendar month not found');
    }

    await this.prisma.contentItem.deleteMany({
      where: { calendarMonthId: id },
    });

    await this.prisma.calendarMonth.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'CALENDAR_MONTH_DELETED',
      entity: 'CalendarMonth',
      entityId: id,
      oldData: { year: month.year, month: month.month, itemsCount: month.contentItems.length },
    });

    return { success: true };
  }
}
