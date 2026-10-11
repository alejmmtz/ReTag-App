import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { EventEntity } from './event.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { EventParticipantStatusEnum } from '../../common/types/enums';

@Entity('event_participants')
export class EventParticipantEntity {
  @PrimaryColumn({ name: 'event_id' })
  eventId!: string;

  @PrimaryColumn({ name: 'user_id' })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EventParticipantStatusEnum.ACTIVE,
  })
  status!: EventParticipantStatusEnum;

  @ManyToOne(() => EventEntity, (event) => event.participants)
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.eventParticipations)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
