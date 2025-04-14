import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { exec, ExecException, execSync } from 'child_process';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync
} from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { getFinalDocument } from './tabelas/documentoFinal';

interface LaudoEntityCreationOutput {
  id: number;
  estado: string;
  start: string;
  hospitalCnes: number;
  end: string;
}

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaudoDto) {
    console.log('Requisição de criação de laudo:');

    const cnes_number = parseInt(dto.cnes);
    const laudoName = `laudo${dto.cnes}${dto.estado}${dto.data_inicio}${dto.data_fim}`;
    const laudosDir = join(process.cwd(), 'laudos');

    // Cria diretório se não existir
    if (!existsSync(laudosDir)) {
      console.log('Criando diretório de laudos:');
      mkdirSync(laudosDir, { recursive: true });
    }

    // Verifica permissões de escrita
    try {
      accessSync(laudosDir, constants.W_OK);
    } catch {
      throw new Error(`Sem permissão para escrever no diretório ${laudosDir}`);
    }

    // Primeiro cria o registro no banco de dados
    const laudo_input: Prisma.LaudoCreateInput = {
      start: dto.data_inicio,
      end: dto.data_fim,
      fileName: laudoName,
      ready: false,
      estado: dto.estado,
      Hospital: { connect: { cnes: cnes_number } },
      numeroProcesso: dto.numeroProcesso || undefined,
      dataDistribuicao: dto.dataDistribuicao
        ? new Date(dto.dataDistribuicao)
        : undefined,
    };

    let laudo_output: LaudoEntityCreationOutput;
    try {
      laudo_output = await this.prisma.laudo.create({
        data: laudo_input,
      });
    } catch {
      try {
        // Se já existir, atualiza para ready: false
        laudo_output = await this.prisma.laudo.update({
          where: { fileName: laudoName },
          data: { ready: false },
        });
      } catch {
        throw new Error('Erro ao criar/atualizar laudo na db');
      }
    }

    const python_process_result = async (
      error: ExecException | null,
      stdout: string,
      stderr: string,
    ) => {
      // Se der erro, erre
      if (error) {
        console.error('O SCRIPT DE PROCESSAMENTO FALHOU!!!');
        console.error('LOG DO SCRIPT: --------------------');
        console.log(stdout, stderr);

        console.log('Removendo laudo do banco de dados:');

        this.prisma.laudo
          .delete({
            where: { id: laudo_output.id },
          })
          .then(() => {
            console.log('Laudo removido do banco de dados.');
          })
          .catch(() => {
            console.error('Erro ao remover laudo do banco de dados.');
          });
        return;
      }

      let pdf_generation_result: string;

      // tenta gerar o pdf
      try {
        pdf_generation_result = await this.generatePdf(
          dto,
          laudoName,
          laudosDir,
        );
      } catch (pdfError) {
        // se não conseguir gerar o pdf, relata o problema,
        // apaga o laudo do banco de dados e retorna
        console.error('Erro durante geração do PDF:', pdfError);
        const pdfPath = join(laudosDir, `${laudoName}.pdf`);
        const errorMessage = existsSync(pdfPath)
          ? 'PDF foi gerado mas ocorreram warnings'
          : 'Falha na geração do PDF';
        console.log(errorMessage);

        this.prisma.laudo
          .delete({
            where: { id: laudo_output.id },
          })
          .then(() => {
            console.log('Laudo removido do banco de dados.');
          })
          .catch(() => {
            console.error('Erro ao remover laudo do banco de dados.');
          });
        return;
      }

      // Se nada tiver dado errado, Atualiza o laudo com ready: true e o valorFinal
      this.prisma.laudo
        .update({
          where: { id: laudo_output.id },
          data: {
            ready: true,
            valorFinal: pdf_generation_result,
          },
        })
        .catch(() => {
          throw new Error('Erro ao atualizar o laudo na db.');
        });
    };

    // Executa o script Python para processar os dados
    exec(
      `python3 scripts/susprocessing/scripts/pull.py SIA ${dto.estado} ${dto.data_inicio} ${dto.data_fim} ${dto.cnes}`,
      (error, stdout, stderr) => {
        python_process_result(error, stdout, stderr).then(
          () => {
            console.log('cabou');
          },
          () => {},
        );
      },
    );
  }

  private async generatePdf(
    dto: CreateLaudoDto,
    laudoName: string,
    laudosDir: string,
  ): Promise<string> {
    // Obter informações básicas do hospital
    const hospital = await this.prisma.hospital.findUnique({
      where: { cnes: parseInt(dto.cnes) },
      select: {
        cnes: true,
        name: true,
        estado: true,
      },
    });

    if (!hospital) {
      throw new Error('Hospital não encontrado');
    }

    const [texContent, valorFinal] = getFinalDocument({
      razaoSocial: hospital.name,
      nomeFantasia: hospital.name,
      cnpj: '0000000',
      cnes: hospital.cnes.toString(),
      cidade: 'cidade',
      estado: 'RS',
      numeroProcesso: 'sla',
      dataDistribuicao: 'sla',
    });

    // Salva o arquivo .tex
    const texPath = join(laudosDir, `${laudoName}.tex`);
    writeFileSync(texPath, texContent);
    console.log(`Arquivo .tex gerado em: ${texPath}`);

    // Compila o .tex para .pdf
    try {
      execSync(
        `pdflatex -interaction=nonstopmode -output-directory=${laudosDir} ${texPath}`,
        { cwd: laudosDir, stdio: 'inherit' },
      );
    } catch (e) {
      console.warn(
        'pdflatex pode ter retornado um warning, verificando se PDF foi gerado...',
      );
    }

    // Verifica se o PDF foi gerado
    const pdfPath = join(laudosDir, `${laudoName}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error('O arquivo PDF não foi gerado');
    }

    // Limpa arquivos auxiliares do LaTeX
    ['.aux', '.log', '.out'].forEach((ext) => {
      const auxFile = join(laudosDir, `${laudoName}${ext}`);
      if (existsSync(auxFile)) {
        unlinkSync(auxFile);
      }
    });

    console.log(`PDF gerado com sucesso em: ${pdfPath}`);
    return valorFinal;
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

  async testGeneratePdf() {
    const laudosDir = join(process.cwd(), 'laudos');
    const laudoName = 'laudoTESTE';

    // Cria o diretório se não existir
    if (!existsSync(laudosDir)) {
      mkdirSync(laudosDir, { recursive: true });
    }

    // Dados fictícios só para gerar o PDF
    const dto: CreateLaudoDto = {
      cnes: '2248328',
      estado: 'RS',
      data_inicio: '01-24',
      data_fim: '01-24',
      numeroProcesso: '1234567890/2024',
      dataDistribuicao: '2024-04-01',
    };

    // Gere apenas o PDF
    await this.generatePdf(dto, laudoName, laudosDir);
  }
}
