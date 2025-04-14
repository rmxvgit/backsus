function individualizadaHeader(): string {
    let latexTable = '';
    latexTable += '\\newpage';
    latexTable += '\\large\\textbf{Cálculo IVR/TUNEP - Individualizado}';
    latexTable += '\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}\n';
    latexTable +=
      '\\begin{longtable}{|C{2cm}|C{10cm}|C{1.2cm}|C{1.5cm}|C{1.5cm}|C{2cm}|C{2cm}|C{2cm}|C{2cm}|}\n';
    latexTable += '\\hline\n';
    latexTable +=
      '\\textbf{Cód. Procedimento} & \\textbf{Desc. Procedimento} &\\textbf{Mês/Ano}}& \\textbf{Valor Base} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} &\\textbf{Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} & \\textbf{Base SUS}\n';
    latexTable += '\\hline\n';
    latexTable += '\\endhead\n';
    latexTable += '\\hline\n';
    latexTable += '\\endfoot\n';
    return latexTable;
  }
  
  function individualizadaBody(data: string): string {
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
      const valorBase = columns[3].trim();
      const qtdBase = columns[4].trim();
      const ivrTunep = columns[5].trim();
      const correcao = columns[6].trim();
      const total = columns[7].trim();
      const baseSUS = columns[8].trim();
  
      // Adicionar linha à tabela
      body += `${codigo} & ${descricao} & ${mesAno} & ${valorBase} & ${qtdBase} & ${ivrTunep} & ${correcao} & ${total} & ${baseSUS}\\\\\n`;
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
  