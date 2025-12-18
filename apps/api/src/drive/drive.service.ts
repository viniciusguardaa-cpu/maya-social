import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  size?: number;
  thumbnailLink?: string;
}

export interface UploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink?: string;
}

export interface FolderStructure {
  rootFolderId: string;
  brandFolderId: string;
  monthFolderId: string;
  contentFolderId: string;
}

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private drive: drive_v3.Drive | null = null;
  private readonly isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.isEnabled = this.initializeDrive();
  }

  private initializeDrive(): boolean {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret) {
      this.logger.warn('⚠️  Google Drive not configured - file operations will be mocked');
      return false;
    }

    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      
      if (refreshToken) {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
      }

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      this.logger.log('✅ Google Drive initialized');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive', error);
      return false;
    }
  }

  async createFolder(name: string, parentId?: string): Promise<string> {
    if (!this.isEnabled || !this.drive) {
      return `mock-folder-${Date.now()}`;
    }

    const fileMetadata: drive_v3.Schema$File = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return response.data.id!;
  }

  async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.isEnabled || !this.drive) {
      return `mock-folder-${name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
    }

    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    return this.createFolder(name, parentId);
  }

  async setupBrandFolderStructure(
    brandId: string,
    brandName: string,
    year: number,
    month: number,
  ): Promise<FolderStructure> {
    const rootFolderName = this.configService.get('DRIVE_ROOT_FOLDER') || 'Maya - Social Media';
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const rootFolderId = await this.findOrCreateFolder(rootFolderName);
    const brandFolderId = await this.findOrCreateFolder(brandName, rootFolderId);
    const yearFolderId = await this.findOrCreateFolder(String(year), brandFolderId);
    const monthFolderId = await this.findOrCreateFolder(`${monthNames[month - 1]} ${year}`, yearFolderId);

    return {
      rootFolderId,
      brandFolderId,
      monthFolderId,
      contentFolderId: monthFolderId,
    };
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string,
  ): Promise<UploadResult> {
    if (!this.isEnabled || !this.drive) {
      const mockId = `mock-file-${Date.now()}`;
      return {
        fileId: mockId,
        webViewLink: `https://drive.google.com/file/d/${mockId}/view`,
        webContentLink: `https://drive.google.com/uc?id=${mockId}&export=download`,
      };
    }

    const { Readable } = await import('stream');
    const stream = new Readable();
    stream.push(file);
    stream.push(null);

    const fileMetadata: drive_v3.Schema$File = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    await this.drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId: response.data.id!,
      webViewLink: response.data.webViewLink!,
      webContentLink: response.data.webContentLink ?? undefined,
    };
  }

  async getFileMetadata(fileId: string): Promise<DriveFile | null> {
    if (!this.isEnabled || !this.drive) {
      return {
        id: fileId,
        name: 'mock-file.jpg',
        mimeType: 'image/jpeg',
        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
        size: 1024000,
      };
    }

    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, webContentLink, size, thumbnailLink',
      });

      return {
        id: response.data.id!,
        name: response.data.name!,
        mimeType: response.data.mimeType!,
        webViewLink: response.data.webViewLink!,
        webContentLink: response.data.webContentLink ?? undefined,
        size: response.data.size ? parseInt(response.data.size) : undefined,
        thumbnailLink: response.data.thumbnailLink || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${fileId}`, error);
      return null;
    }
  }

  async listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    if (!this.isEnabled || !this.drive) {
      return [];
    }

    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, size, thumbnailLink)',
      orderBy: 'createdTime desc',
    });

    return (response.data.files || []).map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      webViewLink: file.webViewLink!,
      webContentLink: file.webContentLink || undefined,
      size: file.size ? parseInt(file.size) : undefined,
      thumbnailLink: file.thumbnailLink || undefined,
    }));
  }

  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.isEnabled || !this.drive) {
      return true;
    }

    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileId}`, error);
      return false;
    }
  }

  async copyFile(fileId: string, newName: string, folderId?: string): Promise<string | null> {
    if (!this.isEnabled || !this.drive) {
      return `mock-copy-${Date.now()}`;
    }

    try {
      const response = await this.drive.files.copy({
        fileId,
        requestBody: {
          name: newName,
          parents: folderId ? [folderId] : undefined,
        },
      });

      return response.data.id!;
    } catch (error) {
      this.logger.error(`Failed to copy file: ${fileId}`, error);
      return null;
    }
  }

  async moveFile(fileId: string, newFolderId: string): Promise<boolean> {
    if (!this.isEnabled || !this.drive) {
      return true;
    }

    try {
      const file = await this.drive.files.get({
        fileId,
        fields: 'parents',
      });

      const previousParents = (file.data.parents || []).join(',');

      await this.drive.files.update({
        fileId,
        addParents: newFolderId,
        removeParents: previousParents,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to move file: ${fileId}`, error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}
