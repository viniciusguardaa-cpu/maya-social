import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: Prisma.InputJsonValue;
  newData?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldData: data.oldData ?? Prisma.JsonNull,
        newData: data.newData ?? Prisma.JsonNull,
        metadata: data.metadata ?? Prisma.JsonNull,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async getByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecent(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
