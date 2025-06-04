import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { LoginDTO } from './dto/auth.dto';

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
    console.log(user);
    if (user != null) {
      return this.jwtService.sign({ email: user.email });
    }
    return null;
  }
  async findAllUsers() {
    return this.prisma.user.findMany();
  }

  async deleteUserByEmail(email: string) {
    return this.prisma.user.delete({
      where: { email },
    });
  }
}
