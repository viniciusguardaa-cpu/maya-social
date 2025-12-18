import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role, PublicationStatus } from '@prisma/client';
import { PublicationsService, PublishContentDto, ScheduleContentDto } from './publications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Publications')
@Controller('organizations/:organizationId/brands/:brandId/publications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List publications by status' })
  async getByBrand(
    @Param('brandId') brandId: string,
    @Query('status') status?: PublicationStatus,
  ) {
    return this.publicationsService.getByBrand(brandId, status);
  }

  @Get('pending')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get pending publications' })
  async getPending(@Param('brandId') brandId: string) {
    return this.publicationsService.getPending(brandId);
  }

  @Get('scheduled')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get scheduled publications' })
  async getScheduled(@Param('brandId') brandId: string) {
    return this.publicationsService.getScheduled(brandId);
  }

  @Get('content/:contentItemId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get publication by content item' })
  async getByContentItem(@Param('contentItemId') contentItemId: string) {
    return this.publicationsService.getByContentItem(contentItemId);
  }

  @Post('content/:contentItemId/publish')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Publish content to Instagram immediately' })
  async publish(
    @Param('contentItemId') contentItemId: string,
    @Body() data: PublishContentDto,
    @CurrentUser() user: any,
  ) {
    return this.publicationsService.publish(contentItemId, data, user.id);
  }

  @Post('content/:contentItemId/schedule')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Schedule content for future publication' })
  async schedule(
    @Param('contentItemId') contentItemId: string,
    @Body() data: ScheduleContentDto,
    @CurrentUser() user: any,
  ) {
    return this.publicationsService.schedule(contentItemId, data, user.id);
  }

  @Post('content/:contentItemId/confirm-manual')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Confirm content was published manually' })
  async confirmManual(
    @Param('contentItemId') contentItemId: string,
    @Body() data: { platformUrl?: string; platformPostId?: string },
    @CurrentUser() user: any,
  ) {
    return this.publicationsService.confirmManual(contentItemId, data, user.id);
  }

  @Post(':publicationId/retry')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Retry failed publication' })
  async retry(
    @Param('publicationId') publicationId: string,
    @Body() data: PublishContentDto,
    @CurrentUser() user: any,
  ) {
    return this.publicationsService.retry(publicationId, data, user.id);
  }

  @Post(':publicationId/fetch-insights')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Fetch insights from Instagram for publication' })
  async fetchInsights(
    @Param('publicationId') publicationId: string,
    @CurrentUser() user: any,
  ) {
    return this.publicationsService.fetchInsights(publicationId, user.id);
  }

  @Get('meta-status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Check if Meta API is configured' })
  async getMetaStatus() {
    return { configured: this.publicationsService.isMetaConfigured() };
  }
}
