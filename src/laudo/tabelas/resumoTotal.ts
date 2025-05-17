function resumoTotalHeader(): string {
  let latexTable = '';
  latexTable += '\\Huge';
  latexTable += '\\begin{longtable}{|C{12cm}|C{12cm}|C{12cm}|}\n';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{IVR/Tunep (R\\$)} & \\textbf{ Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} \n';
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

  const ivrTunep = columns[0].trim();
  const correcao = columns[1].trim();
  const total = columns[2].trim();

  body += `${ivrTunep} & ${correcao} & ${total}\\\\\n`;
  body += '\\hline\n';
  body += '\\end{longtable}\n';

  return [body, total];
}

export function getResumoTotal(data: string): string[] {
  const header = resumoTotalHeader();
  const [body, total] = resumoTotalBody(data);
  return [header + body, total];
}
