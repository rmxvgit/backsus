import { Module } from '@nestjs/common';
import { LaudoService } from './laudo.service';
import { LaudoController } from './laudo.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [],
  controllers: [LaudoController],
  providers: [LaudoService, PrismaService, JwtService, PrismaClient],
})
export class LaudoModule {}
