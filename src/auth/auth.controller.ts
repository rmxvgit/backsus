import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() login_data: LoginDTO) {
    console.log(login_data);
    const user = await this.authService.validate(login_data);
    if (!user) throw new HttpException('invalid credentials', 401);
    return user;
  }

  @Get('usuarios')
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  @Delete('usuarios/email/:email')
  async deleteUserByEmail(@Param('email') email: string) {
    return this.authService.deleteUserByEmail(email);
  }
}
