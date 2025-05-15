import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateAuthUserDto, LoginUserDto } from './dto';
import { Auth, GetUser } from './decorators';

import { usuarios as User } from '@prisma/client';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateAuthUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  loginUser(@Body() createUserDto: LoginUserDto) {
    return this.authService.login(createUserDto);
  }

  @ApiBearerAuth('access-token')
  @Get('ckeck-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @ApiBearerAuth('access-token')
  @Post('change-password')
  @Auth()
  changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.email, changePasswordDto);
  }
}
