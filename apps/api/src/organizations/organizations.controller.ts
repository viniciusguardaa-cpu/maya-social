import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new organization' })
  async create(
    @CurrentUser() user: any,
    @Body() data: { name: string; slug: string },
  ) {
    return this.organizationsService.create(data, user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get organization by ID' })
  async findById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Patch(':organizationId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update organization' })
  async update(
    @Param('organizationId') organizationId: string,
    @Body() data: { name?: string },
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.update(organizationId, data, user.id);
  }

  @Get(':organizationId/members')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'List organization members' })
  async listMembers(@Param('organizationId') organizationId: string) {
    return this.organizationsService.listMembers(organizationId);
  }

  @Post(':organizationId/members')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Add member to organization' })
  async addMember(
    @Param('organizationId') organizationId: string,
    @Body() data: { email: string; role: Role },
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.addMember(
      organizationId,
      data.email,
      data.role,
      user.id,
    );
  }

  @Patch(':organizationId/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update member role' })
  async updateMemberRole(
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
    @Body() data: { role: Role },
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.updateMemberRole(
      organizationId,
      memberId,
      data.role,
      user.id,
    );
  }

  @Delete(':organizationId/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Remove member from organization' })
  async removeMember(
    @Param('organizationId') organizationId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.removeMember(
      organizationId,
      memberId,
      user.id,
    );
  }
}
