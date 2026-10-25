import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserRoleEnum } from '../../common/types/enums';
import { CreateImageDto } from '../../common/dto/create-image.dto';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  username!: string;

  @IsNotEmpty()
  @IsNumber()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
  phone!: number;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  profilePicture?: CreateImageDto;

  @IsNotEmpty()
  @IsEnum(UserRoleEnum)
  role!: UserRoleEnum;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have eight characters, at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password!: string;
}
