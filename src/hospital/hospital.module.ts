import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [HospitalController],
  providers: [HospitalService, PrismaService, JwtService, PrismaClient],
})
export class HospitalModule {}
