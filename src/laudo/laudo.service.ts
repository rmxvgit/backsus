import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DirsHandler, LAUDOS_DIR } from 'src/project_structure/dirs';
import { exec, ExecException, execSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { getFinalDocument } from './tabelas/documentoFinal';
import { ProjUtils } from 'src/project_utils/utils';

interface LaudoInfo {
  estado: string;
  id: number;
  hospitalCnes: number;
  start: string;
  end: string;
  fileName: string;
  ready: boolean;
  dataDistribuicao: Date | null;
  createdAt: Date;
  updatedAt: Date;
  numeroProcesso: string | null;
  valorFinal: string | null;
}

interface HospitalInfo {
  cnes: number;
  estado: string;
  name: string;
}

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  download(id: string) {
    console.log(id);
  }

  async handleMakeRequest(dto: CreateLaudoDto) {
    console.log('Requisição de criação de laudo:');

    const cnes = parseInt(dto.cnes);
    const laudoName = `laudo${dto.cnes}${dto.data_inicio}${dto.data_fim}`;
    const hospital: HospitalInfo = ProjUtils.Unwrap(
      await this.prisma.hospital.findUnique({ where: { cnes: cnes } }),
    );

    DirsHandler.CreateLaudosDirIfNecessary();
    DirsHandler.VerifyLaudosDirPermissions();

    // Primeiro cria o registro que será armazenado no banco de dados
    const laudo_to_create: Prisma.LaudoCreateInput = {
      estado: hospital.estado,
      start: dto.data_inicio,
      end: dto.data_fim,
      fileName: laudoName,
      ready: false,
      Hospital: { connect: { cnes: cnes } },
      numeroProcesso: dto.numero_processo,
      dataDistribuicao: dto.data_distribuicao
        ? new Date(dto.data_distribuicao)
        : undefined,
    };

    // registra o dado na database
    const laudo = await this.tryToRegisterOrUpdateLaudo(laudo_to_create);

    this.makeLaudo(laudo, hospital);
  }

  makeLaudo(laudo: LaudoInfo, hospital: HospitalInfo) {
    // Executa o script Python para processar os dados
    exec(
      `python3 scripts/susprocessing/scripts/pull.py BOTH ${hospital.estado} ${laudo.start} ${laudo.end} ${hospital.cnes}`,
      (error, stdout, stderr) => {
        this.handleScriptConclusion(error, stdout, stderr, laudo, hospital);
      },
    );
  }

  handleScriptConclusion(
    error: ExecException | null,
    stdout: string,
    stderr: string,
    laudo: LaudoInfo,
    hospital: HospitalInfo,
  ) {
    // Se der erro, erre
    if (error) {
      console.error('O SCRIPT DE PROCESSAMENTO FALHOU!!!');
      console.error('LOG DO SCRIPT: --------------------');
      console.log(stdout, stderr);

      console.log('Removendo laudo do banco de dados:');

      this.prisma.laudo
        .delete({
          where: { id: laudo.id },
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
      pdf_generation_result = this.generatePdf(laudo, hospital);
    } catch (pdfError) {
      // se não conseguir gerar o pdf, relata o problema,
      // apaga o laudo do banco de dados e retorna
      console.error('Erro durante geração do PDF:', pdfError);
      const pdfPath = join(LAUDOS_DIR, `${laudo.fileName}.pdf`);
      const errorMessage = existsSync(pdfPath)
        ? 'PDF foi gerado mas ocorreram warnings'
        : 'Falha na geração do PDF';
      console.log(errorMessage);

      this.prisma.laudo
        .delete({
          where: { id: laudo.id },
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
        where: { id: laudo.id },
        data: {
          ready: true,
          valorFinal: pdf_generation_result,
        },
      })
      .catch(() => {
        throw new Error('Erro ao atualizar o laudo na db.');
      });
  }

  async tryToRegisterOrUpdateLaudo(laudo: Prisma.LaudoCreateInput) {
    let output: LaudoInfo;
    try {
      output = await this.prisma.laudo.create({
        data: laudo,
      });
    } catch {
      try {
        // Se já existir, atualiza para ready: false
        output = await this.prisma.laudo.update({
          where: { fileName: laudo.fileName },
          data: { ready: false },
        });
      } catch {
        throw new Error('Erro ao criar/atualizar laudo na db');
      }
    }
    return output;
  }

  private generatePdf(laudo: LaudoInfo, hospital: HospitalInfo): string {
    const [texContent, valorFinal] = getFinalDocument({
      razaoSocial: hospital.name,
      nomeFantasia: hospital.name,
      cnpj: '0000000',
      cnes: hospital.cnes.toString(),
      cidade: 'cidade',
      estado: hospital.estado,
      numeroProcesso: ProjUtils.Unwrap(laudo.numeroProcesso),
      dataDistribuicao: ProjUtils.Unwrap(laudo.dataDistribuicao).toString(),
    });

    // Salva o arquivo .tex
    const texPath = join(LAUDOS_DIR, `${laudo.fileName}.tex`);
    writeFileSync(texPath, texContent);
    console.log(`Arquivo .tex gerado em: ${texPath}`);

    // Compila o .tex para .pdf
    try {
      execSync(
        `pdflatex -interaction=nonstopmode -output-directory=${LAUDOS_DIR} ${texPath}`,
        { cwd: LAUDOS_DIR, stdio: 'inherit' },
      );
    } catch {
      console.warn(
        'pdflatex pode ter retornado um warning, verificando se PDF foi gerado...',
      );
    }

    // Verifica se o PDF foi gerado
    const pdfPath = join(LAUDOS_DIR, `${laudo.fileName}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error('O arquivo PDF não foi gerado');
    }

    // Limpa arquivos auxiliares do LaTeX
    ['.aux', '.log', '.out'].forEach((ext) => {
      const auxFile = join(LAUDOS_DIR, `${laudo.fileName}${ext}`);
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

  testGeneratePdf() {
    DirsHandler.CreateLaudosDirIfNecessary();
    DirsHandler.VerifyLaudosDirPermissions();

    // Dados fictícios só para gerar o PDF
    const laudo: LaudoInfo = {
      estado: 'RS',
      id: 10,
      hospitalCnes: 2222222,
      start: '12-23',
      end: '12-23',
      fileName: 'batata.pdf',
      ready: false,
      dataDistribuicao: new Date('00/12/23'),
      createdAt: new Date('00/12/23'),
      updatedAt: new Date('00/12/23'),
      numeroProcesso: '1111111111',
      valorFinal: '10',
    };

    const hospital: HospitalInfo = {
      cnes: 2233333,
      name: 'hospital',
      estado: 'RS',
    };

    // Gere apenas o PDF
    this.generatePdf(laudo, hospital);
  }
}
