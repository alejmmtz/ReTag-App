import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventImageEntity } from './entities/event-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventImageEntity])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
