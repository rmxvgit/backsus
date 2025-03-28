import { Injectable } from '@nestjs/common';
import { CreateHospitalDto } from './dto/create-hospital.dto';
//import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  async create(createHosiptalDto: CreateHospitalDto) {
    return await this.prisma.hospital.create({
      data: {
        name: createHosiptalDto.name,
        cnes: +createHosiptalDto.cnes,
        estado: createHosiptalDto.estado,
      },
    });
  }

  async findAll() {
    return await this.prisma.hospital.findMany();
  }

  async findOne(cnes: number) {
    return await this.prisma.hospital.findUnique({
      where: { cnes: cnes },
    });
  }

  /*
  update(id: number, updateHospitalDto: UpdateHosiptalDto) {
    return `This action updates a #${id} hosiptal`;
  }
  */

  async remove(cnes: number) {
    return await this.prisma.hospital.delete({
      where: { cnes: cnes },
    });
  }
}
