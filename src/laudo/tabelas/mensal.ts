export interface HeaderParams {}

function getMensalHeader(): string {
  let latexTable = '';
  latexTable +=
    '\\begin{longtable}{|>{\\raggedright\\arraybackslash}p{2cm}|>{\\raggedright\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{2cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.5cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.8cm}|>{\\centering\\arraybackslash}p{1.8cm}|}>{\\centering\\arraybackslash}p{1.8cm}|}';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Código} & \\textbf{Descrição do Procedimento} & \\textbf{Mês/Ano} & \\textbf{Valor Base (R\\$)} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{Correção} & \\textbf{Total} & \\textbf{Base SUS} \\\\\n';
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
    if (columns.length < 9) continue;

    // Formatar os valores
    const codigo = columns[0].trim();
    const descricao = columns[1].trim();
    const mesAno = columns[2].trim();
    const qtdBase = columns[4].trim();
    const ivrTunep = columns[5].trim();
    const correcao = columns[6].trim();
    const total = columns[7].trim();
    const baseSUS = columns[8].trim();

    // Adicionar linha à tabela
    body += `${codigo} & ${descricao} & ${mesAno} & ${qtdBase} & ${ivrTunep} & ${correcao} & ${total} & ${baseSUS}\\\\\n`;
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
