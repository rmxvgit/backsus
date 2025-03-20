import { Injectable } from '@nestjs/common';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { UpdateLaudoDto } from './dto/update-laudo.dto';
import { exec } from 'child_process';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { log } from 'console';

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaudoDto) {
    const cnes_number = parseInt(dto.cnes);
    const laudoName = `laudo${dto.cnes}${dto.estado}${dto.data_inicio}${dto.data_fim}`;

    try {
      await this.prisma.laudo.delete({ where: { fileName: laudoName } });
    } catch {
      console.log('uh');
    }

    exec(
      `python3 scripts/susprocessing/scripts/pull.py BOTH ${dto.estado} ${dto.data_inicio} ${dto.data_fim} ${dto.cnes}`,
      (error, stdout, stderr) => {
        if (error) {
          // se der errado a geração do laudo, deletar o registro no banco de dados
          console.error('o script de processamento de dados falhou');
          console.log(stdout, stderr);
          const result = this.prisma.laudo.deleteMany({
            where: {
              hospitalCnes: cnes_number,
              fileName: laudoName,
            },
          });

          result.then(
            () => {},
            () => {
              console.error('não foi possível deletar um laudo');
            },
          );
          return;
        }

        // TODO: transformar o laudo em pdf

        const result = this.prisma.laudo.update({
          where: { fileName: laudoName },
          data: { ready: true },
        });

        result.then(
          () => {},
          () => {},
        );
      },
    );

    const laudo_input: Prisma.LaudoCreateInput = {
      start: dto.data_inicio,
      end: dto.data_fim,
      fileName: `laudo${dto.cnes}${dto.estado}${dto.data_inicio}${dto.data_fim}`,
      ready: false,
      Hospital: { connect: { cnes: parseInt(dto.cnes) } },
    };

    const laudo_output = await this.prisma.laudo.create({ data: laudo_input });

    return laudo_output;
  }

  findAll() {
    return `This action returns all laudo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} laudo`;
  }

  update(id: number, updateLaudoDto: UpdateLaudoDto) {
    return `This action updates a #${id} laudo`;
  }

  remove(id: number) {
    return `This action removes a #${id} laudo`;
  }

  private validateCreateLaudoDto(dto: CreateLaudoDto) {
    //TODO: escrever essa função
  }
}
