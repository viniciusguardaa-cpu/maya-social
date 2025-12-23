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
import { CalendarService } from './calendar.service';
import { BatchGenerationService } from './batch-generation.service';
import { 
  GenerateMonthPlanDto, 
  BatchGenerationOptionsDto, 
  BatchGenerateSelectedDto 
} from './dto/batch-generation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Calendar')
@Controller('organizations/:organizationId/brands/:brandId/calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(
    private calendarService: CalendarService,
    private batchGenerationService: BatchGenerationService,
  ) {}

  @Post('preview')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Preview monthly plan before generating (diff/confirm)' })
  async previewPlan(
    @Param('brandId') brandId: string,
    @Body() data: { year: number; month: number },
  ) {
    return this.calendarService.previewMonthPlan({ brandId, ...data });
  }

  @Post('generate')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate monthly content plan with optional auto-generation' })
  async generatePlan(
    @Param('brandId') brandId: string,
    @Body() data: GenerateMonthPlanDto,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.generateMonthPlan(
      { brandId, year: data.year, month: data.month, autoGenerate: data.autoGenerate },
      user.id,
    );
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'List all calendar months for brand' })
  async listMonths(@Param('brandId') brandId: string) {
    return this.calendarService.listMonths(brandId);
  }

  @Get('month')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER, Role.SUPPORT)
  @ApiOperation({ summary: 'Get specific calendar month' })
  async getMonth(
    @Param('brandId') brandId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.calendarService.getByBrandAndMonth(
      brandId,
      parseInt(year),
      parseInt(month),
    );
  }

  @Patch(':calendarMonthId/status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update calendar month status' })
  async updateStatus(
    @Param('calendarMonthId') calendarMonthId: string,
    @Body() data: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.calendarService.updateMonthStatus(
      calendarMonthId,
      data.status,
      user.id,
    );
  }

  @Delete(':calendarMonthId')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete calendar month and all content items' })
  async deleteMonth(
    @Param('calendarMonthId') calendarMonthId: string,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.deleteMonth(calendarMonthId, user.id);
  }

  @Post(':calendarMonthId/batch-generate')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate briefs and arts in batch for calendar month' })
  async batchGenerate(
    @Param('calendarMonthId') calendarMonthId: string,
    @Body() options: BatchGenerationOptionsDto,
    @CurrentUser() user: any,
  ) {
    return this.batchGenerationService.generateForMonth(
      calendarMonthId,
      user.id,
      options,
    );
  }

  @Post('batch-generate-selected')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate briefs and arts for selected content items' })
  async batchGenerateSelected(
    @Body() data: BatchGenerateSelectedDto,
    @CurrentUser() user: any,
  ) {
    return this.batchGenerationService.generateForSelectedItems(
      data.contentItemIds,
      user.id,
      data.options,
    );
  }
}
