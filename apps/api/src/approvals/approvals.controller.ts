import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Approvals')
@Controller('organizations/:organizationId/brands/:brandId/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get('pending')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get pending approvals' })
  async getPending(@Param('brandId') brandId: string) {
    return this.approvalsService.getPendingByBrand(brandId);
  }

  @Get('content/:contentId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get approvals for content item' })
  async getByContentItem(@Param('contentId') contentId: string) {
    return this.approvalsService.findByContentItem(contentId);
  }

  @Post('content/:contentId/approve')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SUPPORT)
  @ApiOperation({ summary: 'Approve content item' })
  async approve(
    @Param('contentId') contentId: string,
    @Body() data: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.approve(contentId, data.reason, user.id);
  }

  @Post('content/:contentId/reject')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SUPPORT)
  @ApiOperation({ summary: 'Reject content item' })
  async reject(
    @Param('contentId') contentId: string,
    @Body() data: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.reject(contentId, data.reason, user.id);
  }

  @Post('content/:contentId/request-revision')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SUPPORT)
  @ApiOperation({ summary: 'Request revision for content item' })
  async requestRevision(
    @Param('contentId') contentId: string,
    @Body() data: { reason: string; diff?: Record<string, any> },
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.requestRevision(
      contentId,
      data.reason,
      data.diff,
      user.id,
    );
  }
}
