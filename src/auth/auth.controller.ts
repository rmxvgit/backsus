import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
    const credentials = await this.authService.validate(login_data);
    if (!credentials.user) throw new HttpException('invalid credentials', 401);
    return credentials;
  }

  @Get('usuarios')
  @UseGuards(AdminGuard)
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  @Post('usuarios')
  @UseGuards(AdminGuard)
  async createUser(
    @Body() user_data: { email: string; senha: string; admin: boolean },
  ) {
    if (!user_data.email || !user_data.senha) {
      return HttpStatus.BAD_REQUEST;
    }

    return this.authService.createUser(user_data);
  }

  @Post('giveadmin:email')
  @UseGuards(AdminGuard)
  give_admin(@Body() admin: { admin: boolean }, @Param('email') email: string) {
    return this.authService.giveAdmin(admin, email);
  }

  @Delete('usuarios/email/:email')
  @UseGuards(AdminGuard)
  async deleteUserByEmail(@Param('email') email: string) {
    return this.authService.deleteUserByEmail(email);
  }
}
