import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApprovalStatus, ContentStatus } from '@prisma/client';

export interface CreateApprovalDto {
  contentItemId: string;
  type: string;
  status: ApprovalStatus;
  reason?: string;
  diff?: Record<string, any>;
}

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(data: CreateApprovalDto, userId: string) {
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: data.contentItemId },
    });

    if (!contentItem) {
      throw new NotFoundException('Content item not found');
    }

    if (contentItem.status !== ContentStatus.AWAITING_APPROVAL) {
      throw new BadRequestException('Content item is not awaiting approval');
    }

    const approval = await this.prisma.approval.create({
      data: {
        contentItemId: data.contentItemId,
        userId,
        type: data.type,
        status: data.status,
        reason: data.reason,
        diff: data.diff,
      },
    });

    let newStatus: ContentStatus;
    switch (data.status) {
      case ApprovalStatus.APPROVED:
        newStatus = ContentStatus.APPROVED;
        break;
      case ApprovalStatus.REJECTED:
        newStatus = ContentStatus.BRIEFED;
        break;
      case ApprovalStatus.REVISION_REQUESTED:
        newStatus = ContentStatus.IN_PRODUCTION;
        break;
      default:
        newStatus = contentItem.status;
    }

    await this.prisma.contentItem.update({
      where: { id: data.contentItemId },
      data: { status: newStatus },
    });

    await this.auditService.log({
      userId,
      action: 'APPROVAL_CREATED',
      entity: 'Approval',
      entityId: approval.id,
      newData: {
        contentItemId: data.contentItemId,
        status: data.status,
        reason: data.reason,
      },
    });

    return approval;
  }

  async findByContentItem(contentItemId: string) {
    return this.prisma.approval.findMany({
      where: { contentItemId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingByBrand(brandId: string) {
    return this.prisma.contentItem.findMany({
      where: {
        brandId,
        status: ContentStatus.AWAITING_APPROVAL,
      },
      include: {
        brief: true,
        assets: true,
        approvals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async approve(contentItemId: string, reason: string | undefined, userId: string) {
    return this.create(
      {
        contentItemId,
        type: 'PUBLICATION',
        status: ApprovalStatus.APPROVED,
        reason,
      },
      userId,
    );
  }

  async reject(contentItemId: string, reason: string, userId: string) {
    if (!reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    return this.create(
      {
        contentItemId,
        type: 'PUBLICATION',
        status: ApprovalStatus.REJECTED,
        reason,
      },
      userId,
    );
  }

  async requestRevision(contentItemId: string, reason: string, diff: Record<string, any> | undefined, userId: string) {
    if (!reason) {
      throw new BadRequestException('Reason is required for revision request');
    }

    return this.create(
      {
        contentItemId,
        type: 'PUBLICATION',
        status: ApprovalStatus.REVISION_REQUESTED,
        reason,
        diff,
      },
      userId,
    );
  }
}
