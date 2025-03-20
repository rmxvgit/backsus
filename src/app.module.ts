import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaudoModule } from './laudo/laudo.module';

@Module({
  imports: [LaudoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
