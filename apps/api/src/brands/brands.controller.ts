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
import { BrandsService, CreateBrandDto } from './brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Brands')
@Controller('organizations/:organizationId/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create new brand' })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() data: CreateBrandDto,
    @CurrentUser() user: any,
  ) {
    return this.brandsService.create(organizationId, data, user.id);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'List brands in organization' })
  async findAll(@Param('organizationId') organizationId: string) {
    return this.brandsService.findByOrganization(organizationId);
  }

  @Get(':brandId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get brand by ID' })
  async findById(@Param('brandId') brandId: string) {
    return this.brandsService.findById(brandId);
  }

  @Patch(':brandId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update brand' })
  async update(
    @Param('brandId') brandId: string,
    @Body() data: Partial<CreateBrandDto>,
    @CurrentUser() user: any,
  ) {
    return this.brandsService.update(brandId, data, user.id);
  }

  @Delete(':brandId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete brand' })
  async delete(@Param('brandId') brandId: string, @CurrentUser() user: any) {
    return this.brandsService.delete(brandId, user.id);
  }
}
