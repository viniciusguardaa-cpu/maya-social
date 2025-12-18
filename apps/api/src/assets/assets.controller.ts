import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AssetsService, CreateAssetDto, UploadAssetDto } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Assets')
@Controller('organizations/:organizationId/brands/:brandId/assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Create asset' })
  async create(
    @Param('brandId') brandId: string,
    @Body() data: CreateAssetDto,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.create(brandId, data, user.id);
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'List brand assets' })
  async findByBrand(@Param('brandId') brandId: string) {
    return this.assetsService.findByBrand(brandId);
  }

  @Get(':assetId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get asset by ID' })
  async findById(@Param('assetId') assetId: string) {
    return this.assetsService.findById(assetId);
  }

  @Get('code/:code')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get assets by code' })
  async findByCode(@Param('code') code: string) {
    return this.assetsService.findByCode(code);
  }

  @Post(':assetId/validate')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Validate asset' })
  async validate(
    @Param('assetId') assetId: string,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.validate(assetId, user.id);
  }

  @Patch(':assetId/link')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Link asset to content item' })
  async linkToContentItem(
    @Param('assetId') assetId: string,
    @Body() data: { contentItemId: string },
    @CurrentUser() user: any,
  ) {
    return this.assetsService.linkToContentItem(assetId, data.contentItemId, user.id);
  }

  @Patch(':assetId/ready')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Mark asset as ready' })
  async markAsReady(
    @Param('assetId') assetId: string,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.markAsReady(assetId, user.id);
  }

  @Delete(':assetId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete asset' })
  async delete(
    @Param('assetId') assetId: string,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.delete(assetId, user.id);
  }

  @Post('upload')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to Google Drive and create asset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        code: { type: 'string' },
        contentItemId: { type: 'string' },
      },
    },
  })
  async upload(
    @Param('brandId') brandId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body() data: UploadAssetDto,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.uploadToDrive(
      brandId,
      file.buffer,
      file.originalname,
      file.mimetype,
      data,
      user.id,
    );
  }

  @Post('sync-from-drive')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Sync existing Google Drive file as asset' })
  async syncFromDrive(
    @Param('brandId') brandId: string,
    @Body() data: { driveFileId: string; code: string },
    @CurrentUser() user: any,
  ) {
    return this.assetsService.syncFromDrive(brandId, data.driveFileId, data.code, user.id);
  }

  @Post(':assetId/new-version')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new version of asset' })
  async createNewVersion(
    @Param('assetId') assetId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.createNewVersion(
      assetId,
      file.buffer,
      file.originalname,
      file.mimetype,
      user.id,
    );
  }

  @Get('content/:contentItemId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.PRODUCER)
  @ApiOperation({ summary: 'Get assets by content item' })
  async getByContentItem(@Param('contentItemId') contentItemId: string) {
    return this.assetsService.getByContentItem(contentItemId);
  }

  @Get('drive-status')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Check if Google Drive is configured' })
  async getDriveStatus() {
    return { configured: this.assetsService.isDriveConfigured() };
  }
}
