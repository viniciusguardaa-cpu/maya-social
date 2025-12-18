import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface CreateBrandDto {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
}

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(organizationId: string, data: CreateBrandDto, userId: string) {
    const brand = await this.prisma.brand.create({
      data: {
        organizationId,
        ...data,
      },
    });

    await this.auditService.log({
      userId,
      action: 'BRAND_CREATED',
      entity: 'Brand',
      entityId: brand.id,
      newData: JSON.parse(JSON.stringify(data)),
    });

    return brand;
  }

  async findById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        integrations: true,
        calendarMonths: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 3,
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.brand.findMany({
      where: { organizationId },
      include: {
        integrations: {
          select: { type: true, isActive: true },
        },
      },
    });
  }

  async update(id: string, data: Partial<CreateBrandDto>, userId: string) {
    const oldData = await this.findById(id);

    const brand = await this.prisma.brand.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      userId,
      action: 'BRAND_UPDATED',
      entity: 'Brand',
      entityId: id,
      oldData: {
        name: oldData.name,
        logoUrl: oldData.logoUrl,
        primaryColor: oldData.primaryColor,
      },
      newData: data,
    });

    return brand;
  }

  async delete(id: string, userId: string) {
    const brand = await this.findById(id);

    await this.prisma.brand.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'BRAND_DELETED',
      entity: 'Brand',
      entityId: id,
      oldData: { name: brand.name, slug: brand.slug },
    });

    return { success: true };
  }
}
