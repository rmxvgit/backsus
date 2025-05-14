function filesSP(): string {
  let latexTable = '';
  latexTable += '\\newpage\n';
  latexTable += '\\textbf{Relatório Completo de Serviços Profissionais - SP}\n';
  latexTable += '\\small\n';
  latexTable += '\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}\n';
  latexTable +=
    '\\begin{longtable}{|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{3cm}|C{4cm}|C{3cm}|C{3cm}|C{3cm}|C{2cm}|C{4cm}|C{3cm}|C{2cm}|C{4cm}|C{3cm}|C{6cm}|C{4cm}|C{2cm}|C{2cm}|C{4cm}|C{4cm}|C{2cm}|C{2cm}|C{4cm}|C{2cm}|C{5cm}|C{5cm}|C{2cm}|C{3cm}|C{6cm}|C{2cm}|C{2cm}|C{2cm}|C{4cm}|C{2cm}|}\n';
  //                      1       2       3     4       5       6     7     8       9     10    11      12      13    14    15      16      17    18     19     20     21     22     23      24     25     26     27     28     29     30     31     32     33     34    35     36    37
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Linha} & \\textbf{SP\\_GESTOR} & \\textbf{SP\\_UF} & \\textbf{SP\\_AA} & \\textbf{SP\\_MM} & \\textbf{SP\\_CNES} & \\textbf{SP\\_NAIH} & \\textbf{SP\\_PROCREA} & \\textbf{SP\\_DTINTER} & \\textbf{SP\\_DTSAIDA} & \\textbf{SP\\_NUM\\_PR} & \\textbf{SP\\_TIPO} & \\textbf{SP\\_CPFCGC} & \\textbf{SP\\_ATOPROF} & \\textbf{SP\\_TP\\_ATO} & \\textbf{SP\\_QTD\\_ATO} & \\textbf{SP\\_PTSP} & \\textbf{SP\\_NF} & \\textbf{SP\\_VALATO} & \\textbf{SP\\_M\\_HOSP} & \\textbf{SP\\_M\\_PAC} & \\textbf{SP\\_DES\\_HOS} & \\textbf{SP\\_DES\\_PAC} & \\textbf{SP\\_COMPLEX} & \\textbf{SP\\_FINANC} & \\textbf{SP\\_CO\\_FAEC} & \\textbf{SP\\_PF\\_CBO} & \\textbf{SP\\_PF\\_DOC} & \\textbf{SP\\_PJ\\_DOC} & \\textbf{IN\\_TP\\_VAL} & \\textbf{SEQUENCIA} & \\textbf{REMESSA} & \\textbf{SERV\\_CLA} & \\textbf{SP\\_CIDPRI} & \\textbf{SP\\_CIDSEC} & \\textbf{SP\\_QT\\_PROC} & \\textbf{SP\\_U\\_AIH}\\\\\n';
  latexTable += '\\hline\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  latexTable += '\\endfoot\n';
  return latexTable;
}

function filesSPBody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(',');
    if (columns.length < 37) continue;

    let row = '';
    for (let j = 0; j < columns.length; j++) {
      const value = columns[j].trim();
      row += `${value} ${j < columns.length - 1 ? '& ' : ''}`;
    }

    body += `${row}\\\\\\hline\n`;
  }

  body += '\\end{longtable}\n';
  return body;
}

export function getfilesSP(data: string): string {
  const header = filesSP();
  const body = filesSPBody(data);
  return header + body;
}
