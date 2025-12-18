import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { MetaModule } from '../meta/meta.module';

@Module({
  imports: [MetaModule],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
