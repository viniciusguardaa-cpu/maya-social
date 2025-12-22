import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    getUserOrganizations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile({ id: '123' });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with name and avatar', async () => {
      const updateData = { name: 'Updated Name', avatar: 'new-avatar.jpg' };
      const mockUpdatedUser = {
        id: '123',
        email: 'test@example.com',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateProfile({ id: '123' }, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith('123', updateData);
    });

    it('should update user profile with only name', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Updated Name',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateProfile({ id: '123' }, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith('123', updateData);
    });
  });

  describe('getOrganizations', () => {
    it('should return user organizations', async () => {
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

      mockUsersService.getUserOrganizations.mockResolvedValue(mockOrganizations);

      const result = await controller.getOrganizations({ id: '123' });

      expect(result).toEqual(mockOrganizations);
      expect(mockUsersService.getUserOrganizations).toHaveBeenCalledWith('123');
    });

    it('should return empty array when user has no organizations', async () => {
      mockUsersService.getUserOrganizations.mockResolvedValue([]);

      const result = await controller.getOrganizations({ id: '123' });

      expect(result).toEqual([]);
    });
  });
});
