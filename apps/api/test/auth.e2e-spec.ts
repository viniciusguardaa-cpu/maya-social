import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/google (GET)', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302);
    });
  });

  describe('JWT Token Validation', () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      const testUser = await prismaService.user.create({
        data: {
          email: 'e2e-test@example.com',
          name: 'E2E Test User',
        },
      });
      userId = testUser.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/dev-login')
        .send({ email: 'e2e-test@example.com' })
        .expect(201);

      accessToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      await prismaService.user.delete({
        where: { id: userId },
      });
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'e2e-test@example.com');
          expect(res.body).toHaveProperty('name', 'E2E Test User');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('User Profile Update', () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      const testUser = await prismaService.user.create({
        data: {
          email: 'e2e-update-test@example.com',
          name: 'Update Test User',
        },
      });
      userId = testUser.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/dev-login')
        .send({ email: 'e2e-update-test@example.com' })
        .expect(201);

      accessToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      await prismaService.user.delete({
        where: { id: userId },
      });
    });

    it('should update user profile', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          avatar: 'new-avatar.jpg',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Name');
          expect(res.body).toHaveProperty('avatar', 'new-avatar.jpg');
        });
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
        })
        .expect(400);
    });
  });
});
