import { Module } from '@nestjs/common';
import { LaudoService } from './laudo.service';
import { LaudoController } from './laudo.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [LaudoController],
  providers: [LaudoService, PrismaService],
})
export class LaudoModule {}
