import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DriveService } from '../drive/drive.service';
import { AssetType, AssetStatus, ContentStatus } from '@prisma/client';

export interface CreateAssetDto {
  code: string;
  type: AssetType;
  driveFileId?: string;
  driveUrl?: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface UploadAssetDto {
  code: string;
  contentItemId?: string;
}

export interface AssetValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private driveService: DriveService,
  ) {}

  async create(brandId: string, data: CreateAssetDto, userId: string) {
    const contentItem = await this.prisma.contentItem.findUnique({
      where: { code: data.code },
    });

    const asset = await this.prisma.asset.create({
      data: {
        brandId,
        contentItemId: contentItem?.id,
        ...data,
        status: AssetStatus.UPLOADED,
      },
    });

    if (contentItem && contentItem.status === ContentStatus.BRIEFED) {
      await this.prisma.contentItem.update({
        where: { id: contentItem.id },
        data: { status: ContentStatus.IN_PRODUCTION },
      });
    }

    await this.auditService.log({
      userId,
      action: 'ASSET_CREATED',
      entity: 'Asset',
      entityId: asset.id,
      newData: { code: data.code, fileName: data.fileName, type: data.type },
    });

    return asset;
  }

  async findById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { contentItem: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async findByCode(code: string) {
    return this.prisma.asset.findMany({
      where: { code },
      orderBy: { version: 'desc' },
    });
  }

  async findByBrand(brandId: string) {
    return this.prisma.asset.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async linkToContentItem(assetId: string, contentItemId: string, userId: string) {
    const asset = await this.findById(assetId);

    const updated = await this.prisma.asset.update({
      where: { id: assetId },
      data: { contentItemId },
    });

    await this.auditService.log({
      userId,
      action: 'ASSET_LINKED',
      entity: 'Asset',
      entityId: assetId,
      newData: { contentItemId },
    });

    return updated;
  }

  async validate(id: string, userId: string): Promise<AssetValidationResult> {
    const asset = await this.findById(id);
    const errors: string[] = [];

    if (asset.type === AssetType.VIDEO) {
      if (asset.duration && asset.duration > 60) {
        errors.push('Video duration exceeds 60 seconds for Reels');
      }
      if (asset.width && asset.height) {
        const aspectRatio = asset.width / asset.height;
        if (aspectRatio < 0.5 || aspectRatio > 2) {
          errors.push('Video aspect ratio is not suitable for Instagram');
        }
      }
    }

    if (asset.type === AssetType.IMAGE) {
      if (asset.width && asset.width < 320) {
        errors.push('Image width is less than minimum (320px)');
      }
      if (asset.height && asset.height < 320) {
        errors.push('Image height is less than minimum (320px)');
      }
    }

    if (asset.size && asset.size > 100 * 1024 * 1024) {
      errors.push('File size exceeds 100MB limit');
    }

    const isValid = errors.length === 0;
    const status = isValid ? AssetStatus.VALID : AssetStatus.INVALID;

    await this.prisma.asset.update({
      where: { id },
      data: {
        status,
        validationErrors: errors.length > 0 ? errors : undefined,
      },
    });

    if (isValid && asset.contentItemId) {
      const allAssets = await this.prisma.asset.findMany({
        where: { contentItemId: asset.contentItemId },
      });

      const allValid = allAssets.every(a => a.id === id || a.status === AssetStatus.VALID);
      
      if (allValid) {
        await this.prisma.contentItem.update({
          where: { id: asset.contentItemId },
          data: { status: ContentStatus.READY },
        });
      }
    }

    await this.auditService.log({
      userId,
      action: 'ASSET_VALIDATED',
      entity: 'Asset',
      entityId: id,
      newData: { isValid, errors },
    });

    return { isValid, errors };
  }

  async markAsReady(id: string, userId: string) {
    const asset = await this.findById(id);

    const updated = await this.prisma.asset.update({
      where: { id },
      data: { status: AssetStatus.READY },
    });

    await this.auditService.log({
      userId,
      action: 'ASSET_MARKED_READY',
      entity: 'Asset',
      entityId: id,
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const asset = await this.findById(id);

    if (asset.driveFileId) {
      await this.driveService.deleteFile(asset.driveFileId);
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    await this.auditService.log({
      userId,
      action: 'ASSET_DELETED',
      entity: 'Asset',
      entityId: id,
      oldData: { code: asset.code, fileName: asset.fileName },
    });

    return { success: true };
  }

  async uploadToDrive(
    brandId: string,
    file: Buffer,
    fileName: string,
    mimeType: string,
    data: UploadAssetDto,
    userId: string,
  ) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    let contentItem = null;
    let folderId: string | undefined;

    if (data.contentItemId) {
      contentItem = await this.prisma.contentItem.findUnique({
        where: { id: data.contentItemId },
        include: { calendarMonth: true },
      });

      if (contentItem?.calendarMonth) {
        const folderStructure = await this.driveService.setupBrandFolderStructure(
          brandId,
          brand.name,
          contentItem.calendarMonth.year,
          contentItem.calendarMonth.month,
        );
        folderId = folderStructure.contentFolderId;
      }
    }

    const uploadResult = await this.driveService.uploadFile(
      file,
      fileName,
      mimeType,
      folderId,
    );

    const assetType = this.getAssetTypeFromMimeType(mimeType);

    const asset = await this.prisma.asset.create({
      data: {
        brandId,
        contentItemId: data.contentItemId,
        code: data.code,
        type: assetType,
        status: AssetStatus.UPLOADED,
        driveFileId: uploadResult.fileId,
        driveUrl: uploadResult.webViewLink,
        fileName,
        mimeType,
        size: file.length,
      },
    });

    if (contentItem && contentItem.status === ContentStatus.BRIEFED) {
      await this.prisma.contentItem.update({
        where: { id: contentItem.id },
        data: { status: ContentStatus.IN_PRODUCTION },
      });
    }

    await this.auditService.log({
      userId,
      action: 'ASSET_UPLOADED',
      entity: 'Asset',
      entityId: asset.id,
      newData: { 
        code: data.code, 
        fileName, 
        type: assetType,
        driveFileId: uploadResult.fileId,
      },
    });

    return asset;
  }

  private getAssetTypeFromMimeType(mimeType: string): AssetType {
    if (mimeType.startsWith('image/')) return AssetType.IMAGE;
    if (mimeType.startsWith('video/')) return AssetType.VIDEO;
    if (mimeType.startsWith('audio/')) return AssetType.AUDIO;
    return AssetType.DOCUMENT;
  }

  async syncFromDrive(brandId: string, driveFileId: string, code: string, userId: string) {
    const metadata = await this.driveService.getFileMetadata(driveFileId);

    if (!metadata) {
      throw new BadRequestException('Could not fetch file metadata from Drive');
    }

    const assetType = this.getAssetTypeFromMimeType(metadata.mimeType);

    const asset = await this.prisma.asset.create({
      data: {
        brandId,
        code,
        type: assetType,
        status: AssetStatus.UPLOADED,
        driveFileId: metadata.id,
        driveUrl: metadata.webViewLink,
        fileName: metadata.name,
        mimeType: metadata.mimeType,
        size: metadata.size,
      },
    });

    await this.auditService.log({
      userId,
      action: 'ASSET_SYNCED_FROM_DRIVE',
      entity: 'Asset',
      entityId: asset.id,
      newData: { driveFileId, fileName: metadata.name },
    });

    return asset;
  }

  async getByContentItem(contentItemId: string) {
    return this.prisma.asset.findMany({
      where: { contentItemId },
      orderBy: [{ type: 'asc' }, { version: 'desc' }],
    });
  }

  async createNewVersion(assetId: string, file: Buffer, fileName: string, mimeType: string, userId: string) {
    const originalAsset = await this.findById(assetId);

    const brand = await this.prisma.brand.findUnique({
      where: { id: originalAsset.brandId },
    });

    let folderId: string | undefined;
    if (originalAsset.contentItemId) {
      const contentItem = await this.prisma.contentItem.findUnique({
        where: { id: originalAsset.contentItemId },
        include: { calendarMonth: true },
      });

      if (contentItem?.calendarMonth && brand) {
        const folderStructure = await this.driveService.setupBrandFolderStructure(
          originalAsset.brandId,
          brand.name,
          contentItem.calendarMonth.year,
          contentItem.calendarMonth.month,
        );
        folderId = folderStructure.contentFolderId;
      }
    }

    const uploadResult = await this.driveService.uploadFile(
      file,
      fileName,
      mimeType,
      folderId,
    );

    const newVersion = originalAsset.version + 1;

    const asset = await this.prisma.asset.create({
      data: {
        brandId: originalAsset.brandId,
        contentItemId: originalAsset.contentItemId,
        code: originalAsset.code,
        type: originalAsset.type,
        status: AssetStatus.UPLOADED,
        driveFileId: uploadResult.fileId,
        driveUrl: uploadResult.webViewLink,
        fileName,
        mimeType,
        size: file.length,
        version: newVersion,
      },
    });

    await this.auditService.log({
      userId,
      action: 'ASSET_VERSION_CREATED',
      entity: 'Asset',
      entityId: asset.id,
      newData: { 
        originalAssetId: assetId,
        version: newVersion,
        fileName,
      },
    });

    return asset;
  }

  isDriveConfigured(): boolean {
    return this.driveService.isConfigured();
  }
}
