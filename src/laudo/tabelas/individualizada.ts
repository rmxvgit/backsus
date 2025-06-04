function individualizadaHeader(): string {
  let latexTable = '';
  latexTable += '\\newpage';
  latexTable += '\\Large\\textbf{Cálculo IVR/TUNEP - Individualizado}';
  latexTable +=
    '\\begin{longtable}{|C{6.0cm}|C{26.4cm}|C{3.6cm}|C{4.8cm}|C{4.8cm}|C{6.0cm}|C{6.0cm}|C{6.0cm}|C{6.0cm}|C{4.8cm}|}\n';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Cód. Procedimento} & \\textbf{Desc. Procedimento} &\\textbf{Mês/Ano} & \\textbf{Valor Base} & \\textbf{Qtd. Base} & \\textbf{IVR (R\\$)} & \\textbf{TUNEP (R\\$)} &\\textbf{Correção Monetária e Juros (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} & \\textbf{Base SUS}\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  return latexTable;
}

function individualizadaBody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(';');
    if (columns.length < 10) continue;

    // Formatar os valores
    const codigo = columns[0].trim();
    const descricao = columns[1].trim();
    const mesAno = columns[2].trim();
    const valorBase = columns[3].trim();
    const qtdBase = columns[4].trim();
    const ivr = columns[5].trim();
    const tunep = columns[6].trim();
    const correcao = columns[7].trim();
    const total = columns[8].trim();
    const baseSUS = columns[9].trim();

    // Adicionar linha à tabela
    body += `${codigo} & ${descricao} & ${mesAno} & ${valorBase} & ${qtdBase} & ${ivr} & ${tunep} & ${correcao} & ${total} & ${baseSUS}\\\\\n`;
    body += '\\hline\n';
  }

  body += '\\end{longtable}\n';

  return body;
}

export function getIndividualizada(data: string): string {
  const header = individualizadaHeader();
  const body = individualizadaBody(data);
  return header + body;
}
