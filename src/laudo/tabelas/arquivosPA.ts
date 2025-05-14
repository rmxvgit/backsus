function filesPA(): string {
  let latexTable = '';
  latexTable += '\\newpage\n';
  latexTable += '\\large\\textbf{Tabela SUS, arquivo 1}\n';
  latexTable += '\\small\n';
  latexTable += '\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}\n';
  latexTable +=
    '\\begin{longtable}{|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{4cm}|C{4cm}|C{4cm}|C{2cm}|C{2cm}|C{3cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{4cm}|C{5cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{4cm}|C{5cm}|C{5cm}|C{2cm}|C{2cm}|C{5cm}|C{5cm}|C{5cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|C{5cm}|C{5cm}|C{5cm}|C{2cm}|C{3cm}|C{2cm}|}\n';
  //                      1       2       3     4       5       6     7     8       9     10    11      12      13    14    15      16      17    18     19     20     21     22     23      24     25     26     27     28     29     30     31     32     33     34    35     36    37      38      39    40      41    42    43      44      45    46    47      48    49      50    51      52    53      54    55      56    57      58      59     60   61
  latexTable += '\\hline\n';
  latexTable +=
    '\\textbf{Linha} & \\textbf{PA\\_CODUNI} & \\textbf{PA\\_GESTAO} & \\textbf{PA\\_CONDIC} & \\textbf{PA\\_UFMUN} & \\textbf{PA\\_REGCT} & \\textbf{PA\\_INCOUT} & \\textbf{PA\\_INCURG} & \\textbf{PA\\_TPUPS} & \\textbf{PA\\_TIPPRE} & \\textbf{PA\\_MN\\_IND} & \\textbf{PA\\_CNPJCPF} & \\textbf{PA\\_CNPJMNT} & \\textbf{PA\\_CNPJ\\_CC} & \\textbf{PA\\_MVM} & \\textbf{PA\\_CMP} & \\textbf{PA\\_PROC\\_ID} & \\textbf{PA\\_TPFIN} & \\textbf{PA\\_SUBFIN} & \\textbf{PA\\_NIVCPL} & \\textbf{PA\\_DOCORIG} & \\textbf{PA\\_AUTORIZ} & \\textbf{PA\\_CNSMED} & \\textbf{PA\\_CBOCOD} & \\textbf{PA\\_MOTSAI} & \\textbf{PA\\_OBITO} & \\textbf{PA\\_ENCERR} & \\textbf{PA\\_PERMAN} & \\textbf{PA\\_ALTA} & \\textbf{PA\\_TRANSF} & \\textbf{PA\\_CIDPRI} & \\textbf{PA\\_CIDSEC} & \\textbf{PA\\_CIDCAS} & \\textbf{PA\\_CATEND} & \\textbf{PA\\_IDADE} & \\textbf{IDADEMIN} & \\textbf{IDADEMAX} & \\textbf{PA\\_FLIDADE} & \\textbf{PA\\_SEXO} & \\textbf{PA\\_RACACOR} & \\textbf{PA\\_MUNPCN} & \\textbf{PA\\_QTDPRO} & \\textbf{PA\\_QTDAPR} & \\textbf{PA\\_VALPRO} & \\textbf{PA\\_VALAPR} & \\textbf{PA\\_UFDIF} & \\textbf{PA\\_MNDIF} & \\textbf{PA\\_DIF\\_VAL} & \\textbf{NU\\_VPA\\_TOT} & \\textbf{NU\\_PA\\_TOT} & \\textbf{PA\\_INDICA} & \\textbf{PA\\_CODOCO} & \\textbf{PA\\_FLQT} & \\textbf{PA\\_FLER} & \\textbf{PA\\_ETNIA} & \\textbf{PA\\_VL\\_CF} & \\textbf{PA\\_VL\\_CL} & \\textbf{PA\\_VL\\_INC} & \\textbf{PA\\_SRV\\_C} & \\textbf{PA\\_INE} & \\textbf{PA\\_NAT\\_JUR}\\\\\n';
  latexTable += '\\hline\n';
  latexTable += '\\endhead\n';
  latexTable += '\\hline\n';
  latexTable += '\\endfoot\n';
  return latexTable;
}

function filesPABody(data: string): string {
  const lines: string[] = data.split('\n');
  let body: string = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const columns = lines[i].split(',');
    if (columns.length < 61) continue;
    let row = '';
    for (let j = 0; j < columns.length; j++) {
      const value = columns[j].trim() === '' ? ' ' : columns[j].trim();
      row += `${value} ${j < columns.length - 1 ? '& ' : ''}`;
    }

    body += `${row}\\\\\\hline\n`;
  }

  body += '\\end{longtable}\n';
  return body;
}
export function getfilesPA(data: string): string {
  const header = filesPA();
  const body = filesPABody(data);
  return header + body;
}
