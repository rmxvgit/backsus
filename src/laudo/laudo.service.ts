import { Injectable } from '@nestjs/common';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { exec } from 'child_process';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaudoDto) {
    const cnes_number = parseInt(dto.cnes);
    const laudoName = `laudo${dto.cnes}${dto.estado}${dto.data_inicio}${dto.data_fim}`;

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

    try {
      const laudo_output = await this.prisma.laudo.create({
        data: laudo_input,
      });
      return laudo_output;
    } catch {
      try {
        const result = this.prisma.laudo.update({
          where: { fileName: laudoName },
          data: { ready: false },
        });
        return result;
      } catch {
        return 'erro ao criar laudo';
      }
    }
  }

  async findAll() {
    const laudos = await this.prisma.laudo.findMany();
    return laudos;
  }

  async findByCnes(cnes: number) {
    const laudos = await this.prisma.laudo.findMany({
      where: { hospitalCnes: cnes },
    });
    return laudos;
  }

  async findById(id: number) {
    const laudo = await this.prisma.laudo.findUnique({ where: { id: id } });
    return laudo;
  }

  async remove(id: number) {
    return await this.prisma.laudo.delete({ where: { id: id } });
  }
}
