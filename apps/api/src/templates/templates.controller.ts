import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TemplatesService, CreateTemplateDto, UpdateTemplateDto } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Templates')
@Controller('organizations/:organizationId/brands/:brandId/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create content template' })
  async create(
    @Param('brandId') brandId: string,
    @Body() data: CreateTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.templatesService.create(brandId, data, user.id);
  }

  @Post('defaults')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create default templates for brand' })
  async createDefaults(
    @Param('brandId') brandId: string,
    @CurrentUser() user: any,
  ) {
    return this.templatesService.createDefaults(brandId, user.id);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'List templates for brand' })
  async findAll(
    @Param('brandId') brandId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.templatesService.findByBrand(brandId, activeOnly === 'true');
  }

  @Get(':templateId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get template by ID' })
  async findById(@Param('templateId') templateId: string) {
    return this.templatesService.findById(templateId);
  }

  @Patch(':templateId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('templateId') templateId: string,
    @Body() data: UpdateTemplateDto,
    @CurrentUser() user: any,
  ) {
    return this.templatesService.update(templateId, data, user.id);
  }

  @Delete(':templateId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete template' })
  async delete(
    @Param('templateId') templateId: string,
    @CurrentUser() user: any,
  ) {
    return this.templatesService.delete(templateId, user.id);
  }

  @Post('reorder')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Reorder templates' })
  async reorder(
    @Param('brandId') brandId: string,
    @Body() data: { templateIds: string[] },
    @CurrentUser() user: any,
  ) {
    return this.templatesService.reorder(brandId, data.templateIds, user.id);
  }
}
