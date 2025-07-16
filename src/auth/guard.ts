import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LoggedGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let bearer: { email: string; exp: number; iat: number };
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request = context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      let authorization: string = request.headers.authorization;
      authorization = authorization.substring(7);

      bearer = this.jwtService.decode(authorization);

      const user = await this.prisma.user.findUnique({
        where: { email: bearer.email },
      });

      if (!user) {
        return false;
      }

      if (bearer.exp < Date.now() / 1000) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let bearer: { email: string; exp: number; iat: number };
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request = context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      let authorization: string = request.headers.authorization;
      authorization = authorization.substring(7);

      bearer = this.jwtService.decode(authorization);

      const user = await this.prisma.user.findUnique({
        where: { email: bearer.email },
      });

      if (!user) {
        return false;
      }

      if (!user.admin) {
        return false;
      }

      if (bearer.exp < Date.now() / 1000) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }
}
