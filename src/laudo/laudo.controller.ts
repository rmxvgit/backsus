import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { LaudoService } from './laudo.service';
import { Response } from 'express';
import { LoggedGuard } from 'src/auth/guard';

@Controller('laudo')
export class LaudoController {
  constructor(private readonly laudoService: LaudoService) {}

  @Post('make')
  @UseGuards(LoggedGuard)
  create(@Body() createLaudoDto: CreateLaudoDto) {
    return this.laudoService.handleMakeRequest(createLaudoDto);
  }

  @Get()
  @UseGuards(LoggedGuard)
  async findAll() {
    return await this.laudoService.findAll();
  }

  @Get('hospital:cnes')
  @UseGuards(LoggedGuard)
  findByCnes(@Param('cnes') cnes: string) {
    return this.laudoService.findByCnes(+cnes);
  }

  @Get('id:id')
  @UseGuards(LoggedGuard)
  async findById(@Param('id') id: string) {
    return await this.laudoService.findById(+id);
  }

  @Get('download-csv-pa:id')
  async dowload_CSV_PA(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.laudoService.download_CSV(+id, 'PA');
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment;filename=amostra_PA.csv',
    });

    stream.pipe(res);
  }

  @Get('download-csv-sp:id')
  async dowload_CSV_SP(@Param('id') id: string, @Res() res: Response) {
    console.log(id);
    try {
      const stream = await this.laudoService.download_CSV(+id, 'SP');
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment;filename=amostra_SP.csv',
      });

      stream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao baixar arquivo CSV');
    }
  }

  @Get('dowload:id')
  async dowload(@Param('id') id: string, @Res() res: Response) {
    try {
      const stream = await this.laudoService.download(+id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=laudo.pdf',
      });

      stream.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao baixar arquivo PDF');
    }
  }

  @Delete(':id')
  @UseGuards(LoggedGuard)
  remove(@Param('id') id: string) {
    return this.laudoService.remove(+id);
  }

  @Get('test-pdf')
  testPdf() {
    return this.laudoService.testGeneratePdf();
  }
}
