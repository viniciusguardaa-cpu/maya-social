import { Module } from '@nestjs/common';
import { MayaSocialController } from './maya-social.controller';
import { MayaSocialService } from './maya-social.service';
import { OpenAIService } from './openai.service';

@Module({
  controllers: [MayaSocialController],
  providers: [MayaSocialService, OpenAIService],
  exports: [MayaSocialService, OpenAIService],
})
export class MayaSocialModule {}
