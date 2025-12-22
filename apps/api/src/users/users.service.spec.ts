import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userOrganization: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          organizations: {
            include: { organization: true },
          },
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
      await expect(service.findById('999')).rejects.toThrow('User not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const updateData = { name: 'Updated Name', avatar: 'new-avatar.jpg' };
      const mockUpdatedUser = {
        id: '123',
        email: 'test@example.com',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update('123', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateData,
      });
    });

    it('should update only name when avatar is not provided', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Updated Name',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update('123', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateData,
      });
    });
  });

  describe('getUserOrganizations', () => {
    it('should return user organizations with brands', async () => {
      const mockOrganizations = [
        {
          id: 'org1',
          userId: '123',
          organizationId: 'org-id-1',
          role: 'OWNER',
          organization: {
            id: 'org-id-1',
            name: 'Organization 1',
            brands: [
              { id: 'brand1', name: 'Brand 1' },
            ],
          },
        },
      ];

      mockPrismaService.userOrganization.findMany.mockResolvedValue(mockOrganizations);

      const result = await service.getUserOrganizations('123');

      expect(result).toEqual(mockOrganizations);
      expect(mockPrismaService.userOrganization.findMany).toHaveBeenCalledWith({
        where: { userId: '123' },
        include: {
          organization: {
            include: {
              brands: true,
            },
          },
        },
      });
    });

    it('should return empty array when user has no organizations', async () => {
      mockPrismaService.userOrganization.findMany.mockResolvedValue([]);

      const result = await service.getUserOrganizations('123');

      expect(result).toEqual([]);
    });
  });
});
