import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/auth.dto';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
  ) {}

  async validate(login_data: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: login_data.email, senha: login_data.senha },
    });

    if (user != null) {
      return this.jwtService.sign({ email: user.email });
    }
    return null;
  }
}
