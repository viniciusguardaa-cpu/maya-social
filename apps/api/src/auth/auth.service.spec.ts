import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService, GoogleProfile, JwtPayload } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let auditService: AuditService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    account: {
      update: jest.fn(),
    },
    userOrganization: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOrCreateUser', () => {
    const googleProfile: GoogleProfile = {
      id: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'avatar.jpg',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should create a new user when user does not exist', async () => {
      const mockNewUser = {
        id: 'user-123',
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        accounts: [
          {
            id: 'account-123',
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleProfile.id,
            access_token: googleProfile.accessToken,
            refresh_token: googleProfile.refreshToken,
          },
        ],
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockNewUser);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.validateOrCreateUser(googleProfile);

      expect(result).toEqual(mockNewUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          avatar: googleProfile.picture,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: googleProfile.id,
              access_token: googleProfile.accessToken,
              refresh_token: googleProfile.refreshToken,
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
      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId: mockNewUser.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: mockNewUser.id,
        newData: { email: mockNewUser.email, name: mockNewUser.name },
      });
    });

    it('should update existing user tokens when user exists', async () => {
      const mockExistingUser = {
        id: 'user-123',
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        accounts: [
          {
            id: 'account-123',
            provider: 'google',
            access_token: 'old-token',
            refresh_token: 'old-refresh',
          },
        ],
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockPrismaService.account.update.mockResolvedValue({});

      const result = await service.validateOrCreateUser(googleProfile);

      expect(result).toEqual(mockExistingUser);
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'account-123' },
        data: {
          access_token: googleProfile.accessToken,
          refresh_token: googleProfile.refreshToken,
        },
      });
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockToken = 'jwt-token-123';
      mockJwtService.sign.mockReturnValue(mockToken);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        name: user.name,
      });
      expect(mockAuditService.log).toHaveBeenCalledWith({
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
      });
    });

    it('should handle user with null name', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: null,
      };

      const mockToken = 'jwt-token-123';
      mockJwtService.sign.mockReturnValue(mockToken);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.login(user);

      expect(result.user.name).toBeNull();
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        name: undefined,
      });
    });
  });

  describe('validateToken', () => {
    it('should return user when token is valid', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken(payload);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        include: {
          organizations: {
            include: { organization: true },
          },
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-999',
        email: 'notfound@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateToken(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateToken(payload)).rejects.toThrow('User not found');
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions for OWNER role', async () => {
      const mockMembership = {
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'OWNER',
      };

      mockPrismaService.userOrganization.findUnique.mockResolvedValue(mockMembership);

      const result = await service.getUserPermissions('user-123', 'org-123');

      expect(result).toEqual({
        role: 'OWNER',
        canApprove: true,
        canEdit: true,
        canView: true,
        canManageUsers: true,
        canManageIntegrations: true,
      });
    });

    it('should return permissions for PRODUCER role', async () => {
      const mockMembership = {
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'PRODUCER',
      };

      mockPrismaService.userOrganization.findUnique.mockResolvedValue(mockMembership);

      const result = await service.getUserPermissions('user-123', 'org-123');

      expect(result).toEqual({
        role: 'PRODUCER',
        canApprove: false,
        canEdit: true,
        canView: true,
        canManageUsers: false,
        canManageIntegrations: false,
      });
    });

    it('should return null when membership not found', async () => {
      mockPrismaService.userOrganization.findUnique.mockResolvedValue(null);

      const result = await service.getUserPermissions('user-123', 'org-999');

      expect(result).toBeNull();
    });
  });

  describe('loginWithEmail', () => {
    it('should login user with email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt-token-123';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.loginWithEmail('test@example.com');

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginWithEmail('notfound@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.loginWithEmail('notfound@example.com')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
