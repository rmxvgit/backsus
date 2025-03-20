import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LaudoService } from './laudo.service';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { UpdateLaudoDto } from './dto/update-laudo.dto';

@Controller('laudo')
export class LaudoController {
  constructor(private readonly laudoService: LaudoService) {}

  @Post('make')
  create(@Body() createLaudoDto: CreateLaudoDto) {
    return this.laudoService.create(createLaudoDto);
  }

  @Get()
  findAll() {
    return this.laudoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laudoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLaudoDto: UpdateLaudoDto) {
    return this.laudoService.update(+id, updateLaudoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laudoService.remove(+id);
  }
}
