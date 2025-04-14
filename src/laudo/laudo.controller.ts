import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { LaudoService } from './laudo.service';

@Controller('laudo')
export class LaudoController {
  constructor(private readonly laudoService: LaudoService) {}

  @Post('make')
  create(@Body() createLaudoDto: CreateLaudoDto) {
    return this.laudoService.create(createLaudoDto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laudoService.remove(+id);
  }

  @Get('test-pdf')
  async testPdf() {
    return this.laudoService.testGeneratePdf();
  }
}
