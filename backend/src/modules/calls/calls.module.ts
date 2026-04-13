import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { AiService } from './ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [CallsController],
  providers: [CallsService, AiService],
  exports: [CallsService, AiService],
})
export class CallsModule {}
