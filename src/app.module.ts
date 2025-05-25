import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaudoModule } from './laudo/laudo.module';
import { HospitalModule } from './hospital/hospital.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [LaudoModule, HospitalModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
