function filesSP(filename: string = ''): string {
  let latexTable = '';
  latexTable += '\\newpage\n';
  latexTable += '\\tiny\n';
  latexTable += '\\textbf{Relatório Completo de Serviços Profissionais - SP}\n';

  latexTable += '\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}\n';

  // Definindo a tabela com 35 colunas (ajuste as larguras conforme necessidade)
  latexTable += '\\begin{longtable}{|';
  for (let i = 0; i < 35; i++) {
    latexTable += 'C{0.7cm}|';
  }
  latexTable += '}\n';

  latexTable += '\\hline\n';
  latexTable +=
    'SP\\_GESTOR & SP\\_UF & SP\\_AA & SP\\_MM & SP\\_CNES & SP\\_NAIH & SP\\_PROCREA & SP\\_DTINTER & SP\\_DTSAIDA & SP\\_NUM\\_PR & SP\\_TIPO & SP\\_CPFCGC & SP\\_ATOPROF & SP\\_TP\\_ATO & SP\\_QTD\\_ATO & SP\\_PTSP & SP\\_NF & SP\\_VALATO & SP\\_M\\_HOSP & SP\\_M\\_PAC & SP\\_DES\\_HOS & SP\\_DES\\_PAC & SP\\_COMPLEX & SP\\_FINANC & SP\\_CO\\_FAEC & SP\\_PF\\_CBO & SP\\_PF\\_DOC & SP\\_PJ\\_DOC & IN\\_TP\\_VAL & SEQUENCIA & REMESSA & SERV\\_CLA & SP\\_CIDPRI & SP\\_CIDSEC & SP\\_QT\\_PROC & SP\\_U\\_AIH\\\\\n';
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
    if (columns.length < 35) continue;

    // Processa todas as 35 colunas exatamente como estão
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

export function getfilesSP(data: string, filename: string = ''): string {
  const header = filesSP(filename);
  const body = filesSPBody(data);
  return header + body;
}
