import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { LaudoService } from './laudo.service';
import { Response } from 'express';

@Controller('laudo')
export class LaudoController {
  constructor(private readonly laudoService: LaudoService) {}

  @Post('make')
  create(@Body() createLaudoDto: CreateLaudoDto) {
    return this.laudoService.handleMakeRequest(createLaudoDto);
  }

  @Get()
  async findAll() {
    return await this.laudoService.findAll();
  }

  @Get('hospital:cnes')
  findByCnes(@Param('cnes') cnes: string) {
    return this.laudoService.findByCnes(+cnes);
  }

  @Get('id:id')
  async findById(@Param('id') id: string) {
    return await this.laudoService.findById(+id);
  }

  @Get('dowload:id')
  async dowload(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.laudoService.download(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment;filename=laudo.pdf',
    });

    stream.pipe(res);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laudoService.remove(+id);
  }

  @Get('test-pdf')
  testPdf() {
    return this.laudoService.testGeneratePdf();
  }
}
