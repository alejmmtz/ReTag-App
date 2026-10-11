import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventEntity } from './entities/event.entity';
import { EventImageEntity } from './entities/event-image.entity';
import { EventParticipantEntity } from './entities/event-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventImageEntity,
      EventParticipantEntity,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
