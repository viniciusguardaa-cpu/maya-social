import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateOrCreateUser(profile: GoogleProfile) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
      include: {
        accounts: true,
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: profile.id,
              access_token: profile.accessToken,
              refresh_token: profile.refreshToken,
            },
          },
        },
        include: {
          accounts: true,
          organizations: {
            include: { organization: true },
          },
        },
      });

      await this.auditService.log({
        userId: user.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        newData: { email: user.email, name: user.name },
      });
    } else {
      const googleAccount = user.accounts.find(a => a.provider === 'google');
      if (googleAccount) {
        await this.prisma.account.update({
          where: { id: googleAccount.id },
          data: {
            access_token: profile.accessToken,
            refresh_token: profile.refreshToken || googleAccount.refresh_token,
          },
        });
      }
    }

    return user;
  }

  async login(user: { id: string; email: string; name?: string | null }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name || undefined,
    };

    await this.auditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateToken(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getUserPermissions(userId: string, organizationId: string) {
    const membership = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      role: membership.role,
      canApprove: ['OWNER', 'ADMIN', 'MANAGER'].includes(membership.role),
      canEdit: ['OWNER', 'ADMIN', 'MANAGER', 'PRODUCER'].includes(membership.role),
      canView: true,
      canManageUsers: ['OWNER', 'ADMIN'].includes(membership.role),
      canManageIntegrations: ['OWNER', 'ADMIN'].includes(membership.role),
    };
  }

  async loginWithEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.login(user);
  }

  async register(data: { name: string; email: string; company?: string }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Create organization from company name or user name
    const orgName = data.company || `${data.name}'s Workspace`;
    const orgSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36);

    // Create user with organization
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        organizations: {
          create: {
            role: 'OWNER',
            organization: {
              create: {
                name: orgName,
                slug: orgSlug,
              },
            },
          },
        },
      },
      include: {
        organizations: {
          include: { organization: true },
        },
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      newData: { email: user.email, name: user.name },
    });

    return this.login(user);
  }
}
