import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(data: { name: string; slug: string }, userId: string) {
    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        users: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        users: true,
      },
    });

    await this.auditService.log({
      userId,
      action: 'ORGANIZATION_CREATED',
      entity: 'Organization',
      entityId: organization.id,
      newData: { name: organization.name, slug: organization.slug },
    });

    return organization;
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        brands: true,
        users: {
          include: { user: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: { slug },
      include: { brands: true },
    });
  }

  async update(id: string, data: { name?: string }, userId: string) {
    const oldData = await this.findById(id);

    const organization = await this.prisma.organization.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      userId,
      action: 'ORGANIZATION_UPDATED',
      entity: 'Organization',
      entityId: id,
      oldData: { name: oldData.name },
      newData: data,
    });

    return organization;
  }

  async addMember(organizationId: string, email: string, role: Role, inviterId: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('User is already a member');
    }

    const membership = await this.prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId,
        role,
      },
      include: { user: true },
    });

    await this.auditService.log({
      userId: inviterId,
      action: 'MEMBER_ADDED',
      entity: 'UserOrganization',
      entityId: membership.id,
      newData: { email, role },
    });

    return membership;
  }

  async updateMemberRole(organizationId: string, memberId: string, role: Role, updaterId: string) {
    const membership = await this.prisma.userOrganization.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    const updated = await this.prisma.userOrganization.update({
      where: { id: memberId },
      data: { role },
      include: { user: true },
    });

    await this.auditService.log({
      userId: updaterId,
      action: 'MEMBER_ROLE_UPDATED',
      entity: 'UserOrganization',
      entityId: memberId,
      oldData: { role: membership.role },
      newData: { role },
    });

    return updated;
  }

  async removeMember(organizationId: string, memberId: string, removerId: string) {
    const membership = await this.prisma.userOrganization.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
      include: { user: true },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.userOrganization.delete({
      where: { id: memberId },
    });

    await this.auditService.log({
      userId: removerId,
      action: 'MEMBER_REMOVED',
      entity: 'UserOrganization',
      entityId: memberId,
      oldData: { email: membership.user.email, role: membership.role },
    });

    return { success: true };
  }
}
