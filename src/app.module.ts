import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaudoModule } from './laudo/laudo.module';
import { HosiptalModule } from './hosiptal/hosiptal.module';
import { HospitalModule } from './hospital/hospital.module';

@Module({
  imports: [LaudoModule, HosiptalModule, HospitalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
