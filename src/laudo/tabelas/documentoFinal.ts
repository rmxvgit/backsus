import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getresumoAnual } from './anual';
import { getDocumentHeaderString } from './folhaInicial';
// import { getMensal } from './mensal';
// import { getProcedimentoAcumulado } from './procedimentoAcumulado';
// import { getresumoMes } from './resumoMes';
import { getIndividualizada } from './individualizada';
import { getResumoTotal } from './resumoTotal';
// import { getMensal } from './mensal';
import { getProcedimentoAcumulado } from './procedimentoAcumulado';
// import { getresumoMes } from './resumoMes';
// import { getResumoTotal } from './resumoTotal';

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
  // Caminho para o arquivo CSV
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
    pathToData('resumo_mes.csv'),
    'utf-8',
  );

  const endDocument: string = getEndDocument();
  // const resumoMes: string = getresumoMes(csv_total_mensal);
  const [resumoTotal, total] = getResumoTotal(csv_total);
  // const mensal: string = getMensal(csv_mensal);
  const resumo_anual: string = getresumoAnual(csv_anual);
  const procedimentoAcumulado: string = getProcedimentoAcumulado(procedimento_acumulado);
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
    header /*+ resumoTotal*/ +
      resumo_anual +
      // resumoMes +
      // procedimentoAcumulado +
      // mensal +
      individualizada +
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
