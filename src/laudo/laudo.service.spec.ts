import { Test, TestingModule } from '@nestjs/testing';
import { LaudoService } from './laudo.service';

describe('LaudoService', () => {
  let service: LaudoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaudoService],
    }).compile();

    service = module.get<LaudoService>(LaudoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
