import { ConflictException, Injectable } from '@nestjs/common';
import { GarmentEntity } from './entities/garment.entity';
import { GarmentStatus } from '../common/types/enums';

@Injectable()
export class GarmentRulesService {
  ensureCanBeUpdated(garment: GarmentEntity): void {
    if (
      garment.status === GarmentStatus.TRADED ||
      garment.status === GarmentStatus.PURCHASED
    ) {
      throw new ConflictException('Only active products can be updated');
    }
  }

  ensureCanBeDeleted(garment: GarmentEntity): void {
    if (
      garment.status === GarmentStatus.TRADED ||
      garment.status === GarmentStatus.PURCHASED
    ) {
      throw new ConflictException('Completed garments cannot be deleted');
    }
  }
}
