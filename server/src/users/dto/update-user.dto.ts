import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateImageDto } from '../../common/dto/create-image.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username?: string;

  @IsNotEmpty()
  @IsNumber()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
  phone!: number;

  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  profilePicture?: CreateImageDto;
}
