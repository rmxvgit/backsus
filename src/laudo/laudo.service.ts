import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { exec, ExecException, execSync } from 'child_process';
import {
  createReadStream,
  existsSync,
  ReadStream,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { DirsHandler, LAUDOS_DIR } from 'src/project_structure/dirs';
import { ProjUtils } from 'src/project_utils/utils';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { getFinalDocument } from './tabelas/documentoFinal';

export interface LaudoInfo {
  id: number;
  ready: boolean;
  file_name: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ivr_tunep: string;
  estado: string;
  cidade: string;
  numero_processo: string;
  data_inicio: string;
  data_fim: string;
  data_distribuicao: Date | string;
  data_fim_correcao: string;
  data_citacao: string;
  data_criacao?: Date | string;
  data_update?: Date | string;
  valor_final?: string | null;
}

export interface HospitalInfo {
  cnes: number;
  estado: string;
  name: string;
}

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  async download(id: number): Promise<ReadStream> {
    const laudo = ProjUtils.Unwrap(
      await this.prisma.laudo.findUnique({ where: { id: id } }),
    );

    if (!laudo.ready) {
      throw Error('laudo não está pronto ainda');
    }

    const pdf_path = join(LAUDOS_DIR, `${laudo.file_name}.pdf`);

    return createReadStream(pdf_path);
  }

  async handleMakeRequest(dto: CreateLaudoDto) {
    console.log('Requisição de criação de laudo:');
    console.log(dto);

    const cnes = parseInt(dto.cnes);
    const laudo_name = `laudo${dto.cnes}${dto.data_inicio}${dto.data_fim}`;
    const hospital: HospitalInfo = ProjUtils.Unwrap(
      await this.prisma.hospital.findUnique({ where: { cnes: cnes } }),
    );

    // GARANTE QUE OS DIRETÓRIOS EXISTAM E SEJAM USÁVEIS
    DirsHandler.CreateLaudosDirIfNecessary();
    DirsHandler.VerifyLaudosDirPermissions();

    // Primeiro cria o registro que será armazenado no banco de dados
    const laudo_to_create: Prisma.LaudoCreateInput = {
      ready: false,
      file_name: laudo_name,
      estado: hospital.estado,
      razao_social: hospital.name,
      nome_fantasia: dto.nome_fantasia,
      data_citacao: dto.data_citacao,
      cidade: dto.cidade,
      cnpj: dto.cnpj,
      ivr_tunep: dto.ivr_tunep,
      data_fim_correcao: dto.data_fim_correcao,
      data_inicio: dto.data_inicio,
      data_fim: dto.data_fim,
      numero_processo: dto.numero_processo,
      data_distribuicao: new Date(dto.data_distribuicao),
      hospital: { connect: { cnes: cnes } },
    };

    // Registra o dado na database. (NÃO AFETA O SCRIPT NEM A GERAÇÃO DE PDF)
    const laudo = await this.tryToRegisterOrUpdateLaudo(laudo_to_create);

    // Execução do script e geração do pdf
    this.makeLaudo(laudo, hospital);

    return laudo;
  }

  makeLaudo(laudo: LaudoInfo, hospital: HospitalInfo) {
    // Executa o script Python para processar os dados
    exec(
      //TODO: conferir se a chamada está correta
      `python3 scripts/susprocessing/scripts/pull.py BOTH ${hospital.estado} ${laudo.data_inicio} ${laudo.data_fim} ${hospital.cnes} ${laudo.ivr_tunep}`,
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
    if (error) {
      this.reportPythonScriptError(error, stdout, stderr);

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

    console.log('O SCRIPT EM PYTHON FUNCIONOU');

    let pdf_generation_result: string;
    // tenta gerar o pdf
    try {
      pdf_generation_result = this.generatePdf(laudo, hospital);
    } catch (pdfError) {
      this.reportPdfScriptError(pdfError, laudo);

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
          valor_final: pdf_generation_result,
        },
      })
      .catch(() => {
        throw new Error('Erro ao atualizar o laudo na db.');
      });
  }

  private reportPythonScriptError(
    error: ExecException,
    stdout: string,
    stderr: string,
  ) {
    console.error('O SCRIPT DE PROCESSAMENTO FALHOU!!!');
    console.error('LOG DO SCRIPT: --------------------');
    console.log(stdout, stderr);

    console.log('Removendo laudo do banco de dados:');
  }

  private reportPdfScriptError(pdfError: any, laudo: LaudoInfo) {
    // se não conseguir gerar o pdf, relata o problema,
    // apaga o laudo do banco de dados e retorna
    console.error('Erro durante geração do PDF:', pdfError);
    const pdfPath = join(LAUDOS_DIR, `${laudo.file_name}.pdf`);
    const errorMessage = existsSync(pdfPath)
      ? 'PDF foi gerado mas ocorreram warnings'
      : 'Falha na geração do PDF';
    console.log(errorMessage);
  }

  async tryToRegisterOrUpdateLaudo(laudo: Prisma.LaudoCreateInput) {
    console.log('Criando/Atualizando laudo na db...');
    let output: LaudoInfo;
    try {
      output = await this.prisma.laudo.create({
        data: laudo,
      });
      console.log('Laudo atualizado na db');
    } catch {
      try {
        // Se já existir, atualiza para ready: false
        output = await this.prisma.laudo.update({
          where: { file_name: laudo.file_name },
          data: { ready: false, data_distribuicao: laudo.data_distribuicao },
        });
        console.log('Laudo atualizado na database.');
      } catch {
        throw new Error('Erro ao criar/atualizar laudo na db');
      }
    }
    return output;
  }

  private generatePdf(laudo: LaudoInfo, hospital: HospitalInfo): string {
    console.log(laudo.data_distribuicao);
    let data = laudo.data_distribuicao;
    if (data instanceof Date) {
      data = ProjUtils.DateToString(data);
    }
    console.log(data);

    const [texContent, valorFinal] = getFinalDocument({
      razaoSocial: hospital.name,
      nomeFantasia: hospital.name,
      cnpj: laudo.cnpj,
      cnes: hospital.cnes.toString(),
      cidade: laudo.cidade,
      estado: hospital.estado,
      numeroProcesso: ProjUtils.Unwrap(laudo.numero_processo),
      dataDistribuicao: data,
    });

    // Salva o arquivo .tex
    const texPath = join(LAUDOS_DIR, `${laudo.file_name}.tex`);
    writeFileSync(texPath, texContent);
    console.log(`Arquivo .tex gerado em: ${texPath}`);

    // Compila o .tex para .pdf
    try {
      execSync(
        `lualatex -interaction=nonstopmode -output-directory=${LAUDOS_DIR} ${texPath}`,
        { cwd: LAUDOS_DIR, stdio: 'inherit' },
      );
    } catch {
      console.warn(
        'pdflatex pode ter retornado um warning, verificando se PDF foi gerado...',
      );
    }

    // Verifica se o PDF foi gerado
    const pdfPath = join(LAUDOS_DIR, `${laudo.file_name}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error('O arquivo PDF não foi gerado');
    }

    // Limpa arquivos auxiliares do LaTeX
    ['.aux', '.log', '.out'].forEach((ext) => {
      const auxFile = join(LAUDOS_DIR, `${laudo.file_name}${ext}`);
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
      where: { cnes: cnes },
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
      data_inicio: '12-16',
      data_fim: '12-16',
      file_name: 'batata',
      nome_fantasia: 'fantasia',
      razao_social: 'razao social',
      data_fim_correcao: '12-23',
      data_citacao: '12-23',
      cidade: 'porto alegre',
      cnpj: '221221',
      ivr_tunep: 'IVR',
      ready: false,
      data_distribuicao: new Date('00/12/23'),
      data_criacao: new Date('00/12/23'),
      data_update: new Date('00/12/23'),
      numero_processo: '1111111111',
      valor_final: '10',
    };

    const hospital: HospitalInfo = {
      cnes: 2248328,
      name: 'hospital',
      estado: 'RS',
    };

    // Gere apenas o PDF
    this.generatePdf(laudo, hospital);
  }
}
