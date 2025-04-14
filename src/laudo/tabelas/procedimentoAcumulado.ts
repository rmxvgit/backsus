function procedimentoAcumuladoHeader(): string {
  let latexTable = '';
  latexTable += '\\newpage';
  latexTable += '\\large\\textbf{Cálculo IVR/TUNEP - Acumulado}';
  latexTable += '\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}\n';
  latexTable +=
    '\\begin{longtable}{|C{2cm}|C{10cm}|C{1.2cm}|C{1.5cm}|C{1.5cm}|C{2cm}|C{2cm}|}\n';
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Cód. Procedimento} & \\textbf{Desc. Procedimento} & \\textbf{Valor Base} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} &\\textbf{Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)}\n';
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
    const valorBase = columns[2].trim()
    const qtdBase = columns[3].trim();
    const ivrTunep = columns[4].trim();
    const correcao = columns[5].trim();
    const total = columns[6].trim();

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
