import { Injectable } from '@nestjs/common';
import { CreateHosiptalDto } from './dto/create-hosiptal.dto';
import { UpdateHosiptalDto } from './dto/update-hosiptal.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HosiptalService {
  constructor(private prisma: PrismaService) {}

  async create(createHosiptalDto: CreateHosiptalDto) {
    return await this.prisma.hospital.create({
      data: {
        name: createHosiptalDto.name,
        cnes: +createHosiptalDto.cnes,
      },
    });
  }

  async findAll() {
    return await this.prisma.hospital.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} hosiptal`;
  }

  update(id: number, updateHosiptalDto: UpdateHosiptalDto) {
    return `This action updates a #${id} hosiptal`;
  }

  remove(id: number) {
    return `This action removes a #${id} hosiptal`;
  }
}
