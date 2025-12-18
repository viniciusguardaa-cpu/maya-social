import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getUserOrganizations(userId: string) {
    return this.prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            brands: true,
          },
        },
      },
    });
  }
}
