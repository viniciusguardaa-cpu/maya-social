import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role, ContentStatus } from '@prisma/client';
import { ContentService, CreateBriefDto, UpdateContentItemDto } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Content')
@Controller('organizations/:organizationId/brands/:brandId/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('kanban')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get content items grouped by status (Kanban view)' })
  async getKanban(
    @Param('brandId') brandId: string,
    @Query('calendarMonthId') calendarMonthId?: string,
  ) {
    return this.contentService.getKanban(brandId, calendarMonthId);
  }

  @Get('pending-approvals')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get content items pending approval' })
  async getPendingApprovals(@Param('brandId') brandId: string) {
    return this.contentService.getPendingApprovals(brandId);
  }

  @Get('upcoming')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get upcoming scheduled content' })
  async getUpcoming(
    @Param('brandId') brandId: string,
    @Query('days') days?: string,
  ) {
    return this.contentService.getUpcoming(brandId, days ? parseInt(days) : 7);
  }

  @Get('by-status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get content items by status' })
  async getByStatus(
    @Param('brandId') brandId: string,
    @Query('status') status: ContentStatus,
  ) {
    return this.contentService.getByStatus(brandId, status);
  }

  @Get(':contentId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get content item by ID' })
  async findById(@Param('contentId') contentId: string) {
    return this.contentService.findById(contentId);
  }

  @Get('code/:code')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get content item by code' })
  async findByCode(@Param('code') code: string) {
    return this.contentService.findByCode(code);
  }

  @Patch(':contentId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update content item' })
  async update(
    @Param('contentId') contentId: string,
    @Body() data: UpdateContentItemDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.update(contentId, data, user.id);
  }

  @Patch(':contentId/status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update content item status' })
  async updateStatus(
    @Param('contentId') contentId: string,
    @Body() data: { status: ContentStatus },
    @CurrentUser() user: any,
  ) {
    return this.contentService.updateStatus(contentId, data.status, user.id);
  }

  @Post(':contentId/brief')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Create brief for content item' })
  async createBrief(
    @Param('contentId') contentId: string,
    @Body() data: CreateBriefDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.createBrief(contentId, data, user.id);
  }

  @Patch('brief/:briefId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Update brief' })
  async updateBrief(
    @Param('briefId') briefId: string,
    @Body() data: Partial<CreateBriefDto>,
    @CurrentUser() user: any,
  ) {
    return this.contentService.updateBrief(briefId, data, user.id);
  }

  @Post(':contentId/submit-for-approval')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Submit content item for approval' })
  async submitForApproval(
    @Param('contentId') contentId: string,
    @CurrentUser() user: any,
  ) {
    return this.contentService.submitForApproval(contentId, user.id);
  }

  @Post(':contentId/generate-brief')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate brief using AI' })
  async generateBrief(
    @Param('contentId') contentId: string,
    @CurrentUser() user: any,
  ) {
    return this.contentService.generateBrief(contentId, user.id);
  }

  @Post('brief/:briefId/regenerate')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Regenerate brief using AI' })
  async regenerateBrief(
    @Param('briefId') briefId: string,
    @CurrentUser() user: any,
  ) {
    return this.contentService.regenerateBrief(briefId, user.id);
  }

  @Post(':contentId/generate-art')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate art/image using AI (DALL-E)' })
  async generateArt(
    @Param('contentId') contentId: string,
    @CurrentUser() user: any,
  ) {
    return this.contentService.generateArt(contentId, user.id);
  }

  @Post(':contentId/move-to')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Move content to a new status (with validation)' })
  async moveToStatus(
    @Param('contentId') contentId: string,
    @Body() data: { status: ContentStatus },
    @CurrentUser() user: any,
  ) {
    return this.contentService.moveToStatus(contentId, data.status, user.id);
  }

  @Post('bulk-move')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Move multiple content items to a new status' })
  async bulkMoveToStatus(
    @Body() data: { ids: string[]; status: ContentStatus },
    @CurrentUser() user: any,
  ) {
    return this.contentService.bulkMoveToStatus(data.ids, data.status, user.id);
  }
}
