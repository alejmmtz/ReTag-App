import { IsBoolean, IsOptional } from 'class-validator';
import { CreateImageDto } from '../../common/dto/create-image.dto';

export class CreateStoreImageDto extends CreateImageDto {
  @IsOptional()
  @IsBoolean()
  isProfile?: boolean;
}
