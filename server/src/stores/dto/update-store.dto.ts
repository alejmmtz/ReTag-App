import { PartialType, PickType } from '@nestjs/mapped-types';
import { RegisterStoreDto } from './register-store.dto';

export class UpdateStoreDto extends PartialType(
  PickType(RegisterStoreDto, [
    'socialmedia',
    'storeName',
    'location',
    'description',
    'images',
  ] as const),
) {}
