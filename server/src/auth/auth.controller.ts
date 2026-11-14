import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post('register/user')
  registerUser(@Body(requestValidationPipe) dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
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
