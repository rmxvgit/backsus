import {
  Controller,
  Get,
  Post,
  Body,
  /*Patch,*/
  Param,
  Delete,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
//import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  async create(@Body() createHosiptalDto: CreateHospitalDto) {
    return await this.hospitalService.create(createHosiptalDto);
  }

  @Get()
  async findAll() {
    return await this.hospitalService.findAll();
  }

  @Get(':cnes')
  async findOne(@Param('cnes') id: string) {
    return await this.hospitalService.findOne(+id);
  }

  /*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHosiptalDto: UpdateHosiptalDto) {
    return this.hosiptalService.update(+id, updateHosiptalDto);
  }
  */

  @Delete(':cnes')
  remove(@Param('cnes') id: string) {
    return this.hospitalService.remove(+id);
  }
}
