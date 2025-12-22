import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { MayaSocialService } from './maya-social.service';
import { GenerateSocialDto } from './dto/generate-social.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('MAYA Social Studio')
@Controller('maya/social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MayaSocialController {
  constructor(private readonly mayaSocialService: MayaSocialService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate Instagram content with AI' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'image_0', maxCount: 1 },
      { name: 'image_1', maxCount: 1 },
      { name: 'image_2', maxCount: 1 },
      { name: 'image_3', maxCount: 1 },
      { name: 'image_4', maxCount: 1 },
    ]),
  )
  async generateContent(
    @CurrentUser() user: any,
    @Body('data') dataJson: string,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      image_0?: Express.Multer.File[];
      image_1?: Express.Multer.File[];
      image_2?: Express.Multer.File[];
      image_3?: Express.Multer.File[];
      image_4?: Express.Multer.File[];
    },
  ) {
    let data: GenerateSocialDto;

    try {
      data = JSON.parse(dataJson);
    } catch (error) {
      throw new BadRequestException('Invalid JSON data');
    }

    const logo = files.logo?.[0];
    const images = [
      files.image_0?.[0],
      files.image_1?.[0],
      files.image_2?.[0],
      files.image_3?.[0],
      files.image_4?.[0],
    ].filter(Boolean) as Express.Multer.File[];

    return this.mayaSocialService.generateContent(user.id, data, logo, images);
  }
}
