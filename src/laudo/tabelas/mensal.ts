function getMensalHeader(): string {
  let latexTable = '';
  latexTable += '\\newpage';
  latexTable += '\\LARGE\\textbf{Cálculo IVR/TUNEP - Mensal}';
  latexTable +=
    '\\begin{longtable}{|C{8.0cm}|C{32.0cm}|C{3.8cm}|C{4.8cm}|C{4.8cm}|C{6.4cm}|C{6.4cm}|C{6.4cm}|}\n';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Código} & \\textbf{Descrição do Procedimento} & \\textbf{Mês/Ano} & \\textbf{Valor Base (R\\$)} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{Correção} & \\textbf{Total} \n';
  latexTable += '\\hline\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  latexTable += '\\endfoot\n';
  return latexTable;
}

function getMensalBody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(';');
    if (columns.length < 8) continue;

    // Formatar os valores
    const codigo = columns[0].trim();
    const descricao = columns[1].trim();
    const mesAno = columns[2].trim();
    const valorBase = columns[3].trim();
    const qtdBase = columns[4].trim();
    const ivrTunep = columns[5].trim();
    const correcao = columns[6].trim();
    const total = columns[7].trim();

    // Adicionar linha à tabela
    body += `${codigo} & ${descricao} & ${mesAno} & ${valorBase} & ${qtdBase} & ${ivrTunep} & ${correcao} & ${total}\\\\\n`;
    body += '\\hline\n';
  }

  body += '\\end{longtable}\n';

  return body;
}

export function getMensal(data: string): string {
  const header = getMensalHeader();
  const body = getMensalBody(data);
  return header + body;
}
