import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { BatchGenerationService } from './batch-generation.service';
import { AiService } from '../ai/ai.service';
import { OpenAIService } from '../maya-social/openai.service';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, BatchGenerationService, AiService, OpenAIService],
  exports: [CalendarService, BatchGenerationService],
})
export class CalendarModule {}
