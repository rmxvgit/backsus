import { Test, TestingModule } from '@nestjs/testing';
import { LaudoController } from './laudo.controller';
import { LaudoService } from './laudo.service';

describe('LaudoController', () => {
  let controller: LaudoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaudoController],
      providers: [LaudoService],
    }).compile();

    controller = module.get<LaudoController>(LaudoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
