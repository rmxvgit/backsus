import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoginDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';

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
}
