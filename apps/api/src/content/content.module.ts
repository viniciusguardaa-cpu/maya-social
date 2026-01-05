import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AiModule } from '../ai/ai.module';
import { MayaSocialModule } from '../maya-social/maya-social.module';

@Module({
  imports: [AiModule, MayaSocialModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
