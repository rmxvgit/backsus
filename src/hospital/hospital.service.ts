import { Injectable } from '@nestjs/common';
import { CreateHospitalDto } from './dto/create-hospital.dto';
//import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { PrismaService } from 'src/prisma.service';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path/posix';
import { LAUDOS_DIR } from 'src/project_structure/dirs';

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
    const laudos = await this.prisma.laudo.findMany({ where: { cnes: cnes } });

    for (const laudo of laudos) {
      await this.prisma.laudo.delete({ where: { id: laudo.id } });
      unlinkSync(join(LAUDOS_DIR, `${laudo.file_name}.pdf`));
      unlinkSync(join(LAUDOS_DIR, `${laudo.file_name}.tex`));
      unlinkSync(join(LAUDOS_DIR, `PA${laudo.file_name}.csv`));
      unlinkSync(join(LAUDOS_DIR, `SP${laudo.file_name}.csv`));
    }

    return await this.prisma.hospital.delete({
      where: { cnes: cnes },
    });
  }
}
