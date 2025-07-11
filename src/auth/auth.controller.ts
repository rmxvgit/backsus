import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/auth.dto';
import { AdminGuard } from './guard';

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
  @UseGuards(AdminGuard)
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  @Post('usuarios')
  async createUser(
    @Body() user_data: { email: string; senha: string; admin: boolean },
  ) {
    return this.authService.createUser(user_data);
  }

  @Delete('usuarios/email/:email')
  async deleteUserByEmail(@Param('email') email: string) {
    return this.authService.deleteUserByEmail(email);
  }
}
