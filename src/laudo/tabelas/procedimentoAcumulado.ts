function procedimentoAcumuladoHeader(): string {
  let latexTable = '';
  latexTable +=
    '\\begin{longtable}{|>{\\raggedright\\arraybackslash}p{2cm}|>{\\raggedright\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{2cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.5cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.8cm}|}';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Cód. procedimento} & \\textbf{Descrição do Procedimento} & \\textbf{Valor Base (R\\$)} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{Correção} & \\textbf{Total} \\\\\n';
  latexTable += '\\hline\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  latexTable += '\\endfoot\n';
  return latexTable;
}

function procedimentoAcumuladoBody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(';');
    if (columns.length < 7) continue;

    // Formatar os valores
    const codigo = columns[0].trim();
    const descricao = columns[1].trim();
    const valorBase = parseFloat(columns[2].trim()).toFixed(2);
    const qtdBase = columns[3].trim();
    const ivrTunep = parseFloat(columns[4].trim()).toFixed(2);
    const correcao = parseFloat(columns[5].trim()).toFixed(2);
    const total = parseFloat(columns[6].trim()).toFixed(2);

    // Adicionar linha à tabela
    body += `${codigo} & ${descricao} & ${valorBase} & ${qtdBase} & ${ivrTunep} & ${correcao} & ${total}\\\\\n`;
    body += '\\hline\n';
  }

  body += '\\end{longtable}\n';

  return body;
}

export function getProcedimentoAcumulado(data: string): string {
  const header = procedimentoAcumuladoHeader();
  const body = procedimentoAcumuladoBody(data);
  return header + body;
}
