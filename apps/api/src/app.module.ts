import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { BrandsModule } from './brands/brands.module';
import { CalendarModule } from './calendar/calendar.module';
import { ContentModule } from './content/content.module';
import { AssetsModule } from './assets/assets.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { AuditModule } from './audit/audit.module';
import { TemplatesModule } from './templates/templates.module';
import { PublicationsModule } from './publications/publications.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    BrandsModule,
    CalendarModule,
    ContentModule,
    AssetsModule,
    ApprovalsModule,
    AuditModule,
    TemplatesModule,
    PublicationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
