import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getresumoAnual } from './anual';
import { getfilesPA } from './arquivosPA';
import { getfilesSP } from './arquivosSP';
import { getDocumentHeaderString } from './folhaInicial';
import { getIndividualizada } from './individualizada';
import { getMensal } from './mensal';
import { getProcedimentoAcumulado } from './procedimentoAcumulado';
import { getresumoMes } from './resumoMes';
import { getResumoTotal } from './resumoTotal';

export interface finalDocParams {
  razaoSocial: string;
  nomeFantasia: string;
  cnes: string;
  cnpj: string;
  cidade: string;
  estado: string;
  numeroProcesso: string;
  dataDistribuicao: string;
}

export function getFinalDocument(params: finalDocParams): string[] {
  function pathToData(finalPath: string): string {
    const csvPath = join(
      process.cwd(),
      'scripts',
      'susprocessing',
      `H${params.cnes}${params.estado}`,
      'laudos',
      finalPath,
    );
    if (!existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado em: ${csvPath}`);
    }

    return csvPath;
  }

  function getCSVFilenames(): {
    spFiles: string[];
    paFiles: string[];
    csvDir: string;
  } {
    const csvDir = join(
      process.cwd(),
      'scripts',
      'susprocessing',
      `H${params.cnes}${params.estado}`,
      'csvs',
    );

    if (!existsSync(csvDir)) {
      console.warn(`Aviso: Pasta CSV não encontrada em ${csvDir}`);
      return { spFiles: [], paFiles: [], csvDir };
    }

    const allFiles = readdirSync(csvDir);
    const result = { spFiles: [] as string[], paFiles: [] as string[] };

    allFiles.forEach((filename) => {
      if (!filename.toLowerCase().endsWith('.csv')) return;

      const prefix = filename.substring(0, 2).toUpperCase();

      if (prefix === 'SP') {
        result.spFiles.push(filename);
      } else if (prefix === 'PA') {
        result.paFiles.push(filename);
      }
    });

    return {
      spFiles: result.spFiles.sort(),
      paFiles: result.paFiles.sort(),
      csvDir,
    };
  }

  const { spFiles, paFiles, csvDir } = getCSVFilenames();

  let arquivossp = '';
  spFiles.forEach((file) => {
    const csv_arquivo = readFileSync(join(csvDir, file), 'utf8');
    arquivossp += getfilesSP(csv_arquivo);
  });

  let arquivospa = '';
  paFiles.forEach((file) => {
    const csv_arquivo = readFileSync(join(csvDir, file), 'utf8');
    arquivospa += getfilesPA(csv_arquivo);
    // TODO: chamar função e adicionar a variavel
  });

  // Ler o arquivo CSV
  const csv_individualizada = readFileSync(
    pathToData('calculo_IVR_TUNEP_individualizado.csv'),
    'utf-8',
  );
  const csv_mensal = readFileSync(
    pathToData('calculo_IVR_TUNEP_mensal.csv'),
    'utf-8',
  );
  const csv_anual = readFileSync(pathToData('resumo_ano.csv'), 'utf-8');
  const csv_total = readFileSync(pathToData('resumo_total.csv'), 'utf-8');
  const csv_total_mensal = readFileSync(pathToData('resumo_mes.csv'), 'utf-8');
  const procedimento_acumulado = readFileSync(
    pathToData('total_por_procedimento_acumulado.csv'),
    'utf-8',
  );

  const endDocument: string = getEndDocument();
  const resumoMes: string = getresumoMes(csv_total_mensal);
  const [resumoTotal, total] = getResumoTotal(csv_total);
  const mensal: string = getMensal(csv_mensal);
  const resumo_anual: string = getresumoAnual(csv_anual);
  const procedimentoAcumulado: string = getProcedimentoAcumulado(
    procedimento_acumulado,
  );
  const individualizada: string = getIndividualizada(csv_individualizada);
  const header: string = getDocumentHeaderString({
    razaoSocial: params.razaoSocial,
    nomeFantasia: params.nomeFantasia,
    cnes: params.cnes,
    cnpj: params.cnpj,
    cidade: params.cidade,
    estado: params.estado,
    numeroProcesso: params.numeroProcesso,
    dataDistribuicao: params.dataDistribuicao,
    valorTotal: stileValorTotal(+total),
  });

  return [
    header +
      resumoTotal +
      resumo_anual +
      resumoMes +
      procedimentoAcumulado +
      mensal +
      individualizada +
      // arquivossp +
      arquivospa +
      endDocument,
    total,
  ];
}

function getEndDocument(): string {
  return `\\end{landscape}
    \\end{document}`;
}

export function stileValorTotal(valorTotal: number): string {
  const valorFinal = valorTotal
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace('R$', 'R\\$');
  return valorFinal;
}
