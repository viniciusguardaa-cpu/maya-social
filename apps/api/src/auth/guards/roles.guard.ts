import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.body?.organizationId;

    if (!user || !organizationId) {
      throw new ForbiddenException('Access denied');
    }

    const membership = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const hasRole = requiredRoles.includes(membership.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.userRole = membership.role;
    return true;
  }
}
