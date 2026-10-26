import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
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
  @Matches(/^[a-zA-Z_0-9]+$/, {
    message:
      'Username only can contain letters (a-z, A-Z), numbers(0-9) and underscores.',
  })
  username!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
  phone!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  profilePicture?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have at least 10 characters, one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password!: string;
}
