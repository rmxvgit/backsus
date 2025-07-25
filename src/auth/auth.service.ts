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

  async giveAdmin(admin: { admin: boolean }, email: string) {
    return this.prisma.user.update({
      where: { email: email },
      data: { admin: admin.admin },
    });
  }

  async validate(
    login_data: LoginDTO,
  ): Promise<{ user: string | null; admin: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: login_data.email, senha: login_data.senha },
    });
    console.log(user);
    if (user != null) {
      return {
        user: this.jwtService.sign({ email: user.email }),
        admin: user.admin,
      };
    }
    return { user: null, admin: false };
  }

  async findAllUsers() {
    return this.prisma.user.findMany();
  }

  async createUser(user_data: { email: string; senha: string }) {
    return this.prisma.user.create({
      data: user_data,
    });
  }

  async deleteUserByEmail(email: string) {
    return this.prisma.user.delete({
      where: { email },
    });
  }
}
