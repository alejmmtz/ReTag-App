import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsService } from './events.service';
import { EventsController } from './events.controller';

import { EventEntity } from './entities/event.entity';
import { EventImageEntity } from './entities/event-image.entity';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { StoreEntity } from '../stores/entities/store.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      EventEntity,
      EventImageEntity,
      EventParticipantEntity,
      StoreEntity,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
