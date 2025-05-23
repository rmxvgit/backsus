function resumoAnualHeader(): string {
  let latexTable = '';
  latexTable += '\\newpage';
  latexTable += '\\Huge\\textbf{Resumo Anual}';
  latexTable += '\\begin{longtable}{|C{3cm}|C{8cm}|C{12cm}|C{10cm}|}\n';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Ano} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{ Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} \n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  return latexTable;
}

function resumoAnualBody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(';');
    if (columns.length < 4) continue;

    // Formatar os valores
    const ano = columns[0].trim();
    const ivrTunep = columns[1].trim();
    const correcao = columns[2].trim();
    const total = columns[3].trim();

    // Adicionar linha à tabela
    body += `${ano} & ${ivrTunep} & ${correcao} & ${total}\\\\\n`;
    body += '\\hline\n';
  }

  body += '\\end{longtable}\n';

  return body;
}

export function getresumoAnual(data: string): string {
  const header = resumoAnualHeader();
  const body = resumoAnualBody(data);
  return header + body;
}
