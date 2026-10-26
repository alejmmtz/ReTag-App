import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { RegisterStoreDto } from '../stores/dto/register-store.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  registerUser(@Body(requestValidationPipe) dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('register/store')
  registerStore(@Body(requestValidationPipe) dto: RegisterStoreDto) {
    return this.authService.registerStore(dto);
  }

  @Post('login')
  login(@Body(requestValidationPipe) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }
}
