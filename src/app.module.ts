import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaudoModule } from './laudo/laudo.module';
import { HosiptalModule } from './hosiptal/hosiptal.module';

@Module({
  imports: [LaudoModule, HosiptalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
