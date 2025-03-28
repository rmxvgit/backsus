import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [HospitalController],
  providers: [HospitalService, PrismaService],
})
export class HospitalModule {}
