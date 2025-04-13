function resumoMesHeader(): string {
    let latexTable = "";
    latexTable +='\\begin{longtable}{|>{\\raggedright\\arraybackslash}p{5cm}|>{\\raggedright\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{5cm}|}';
    latexTable += '\\hline\n';
    latexTable += '\\textbf{Mês/Ano} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{ Correção Monetária (R\\$)} & \\textbf{Total IVR/Tunep (R\\$)} \\\\\n';
    latexTable += '\\hline\n';
    latexTable += '\\endhead\n';
    latexTable += '\\hline\n';
    latexTable += '\\endfoot\n';
    return latexTable;
}

function resumoMesBody(data: string): string {
    let lines: string[] = data.split('\n');
    let body: string  = '';
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const columns = lines[i].split(';');
      if (columns.length < 4) continue;

      // Formatar os valores
      const mesAno = columns[0].trim();
      const ivrTunep = parseFloat(columns[1].trim()).toFixed(2);
      const correcao = parseFloat(columns[2].trim()).toFixed(2);
      const total = columns[3].trim();
    
      // Adicionar linha à tabela
      body += `${mesAno} & ${ivrTunep} & ${correcao} & ${total}\\\\\n`;
      body += '\\hline\n';
    }

    body += '\\end{longtable}\n'; 

    return body
}

export function getresumoMes(data: string): string {      
    let header = resumoMesHeader();
    let body = resumoMesBody(data);
    return header + body 
}
