function resumoTotalHeader(): string {
  let latexTable = '';
  latexTable +=
    '\\begin{longtable}{|>{\\raggedright\\arraybackslash}p{5cm}|>{\\raggedright\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{5cm}|}';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{IVR/Tunep (R\\$)} & \\textbf{ Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} \\\\\n';
  latexTable += '\\hline\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  latexTable += '\\endfoot\n';
  return latexTable;
}

function resumoTotalBody(data: string): string[] {
  const lines: string[] = data.split('\n');
  let body: string = '';

  const columns = lines[1].split(';');
  if (columns.length < 4) return [];

  const ivrTunep = parseFloat(columns[1].trim()).toFixed(2);
  const correcao = parseFloat(columns[2].trim()).toFixed(2);
  const total = parseFloat(columns[3].trim()).toFixed(2);

  body += `${ivrTunep} & ${correcao} & ${total}\\\\\n`;
  body += '\\hline\n';
  body += 'batata';
  body += '\\end{longtable}\n';

  return [body, total];
}

export function getResumoTotal(data: string): string[] {
  const header = resumoTotalHeader();
  const [body, total] = resumoTotalBody(data);
  return [header + body, total];
}
