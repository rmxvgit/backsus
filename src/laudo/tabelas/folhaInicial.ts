export interface HeaderStrParams {
  razaoSocial: string;
  nomeFantasia: string;
  cnes: string;
  cnpj: string;
  cidade: string;
  estado: string;
  numeroProcesso: string;
  dataDistribuicao: string;
  valorTotal: string;
}

export function getDocumentHeaderString(params: HeaderStrParams): string {
  const header = `
  \\documentclass{article}
  \\usepackage[utf8]{inputenc}
  \\usepackage[T1]{fontenc}
  \\usepackage{lmodern}
  \\usepackage{textcomp}
  \\usepackage[brazil]{babel}
  \\usepackage{geometry}
  \\usepackage{pdflscape}
  \\usepackage{longtable}
  \\usepackage{array}
  \\usepackage{helvet}
  \\usepackage{graphicx}
  \\usepackage{multirow}
  \\usepackage{cellspace}
  \\renewcommand{\\familydefault}{\\sfdefault}

  \\setlength{\\cellspacetoplimit}{6pt}
  \\setlength{\\cellspacebottomlimit}{6pt}

  \\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}

  \\geometry{
      paperwidth=50cm,
      paperheight=140cm,
      landscape,
      left=10mm,
      right=10mm,
      top=10mm,
      bottom=10mm
  }

  \\usepackage{etoolbox}
  \\preto\\longtable{\\setlength{\\tabcolsep}{4pt}}

  \\begin{document}

    \\pagestyle{empty}

    \\section*{Laudo Quantitativo}
    \\subsection*{Cálculo IVR/TUNEP}

    \\LARGE
    \\textbf{1) POLO ATIVO}

    \\begin{tabular}{l l}
    \\hline
    \\textbf{Razão Social:} & ${params.razaoSocial} \\\\
    \\hline
    \\textbf{Nome Fantasia:} & ${params.nomeFantasia} \\\\
    \\hline
    \\textbf{Código CNES:} & ${params.cnes} \\\\
    \\hline
    \\textbf{Documento:} & ${params.cnpj} (CNPJ) \\\\
    \\hline
    \\textbf{Cidade:} & ${params.cidade} \\\\
    \\hline
    \\textbf{UF:} & ${params.estado} \\\\
    \\hline
    \\textbf{Número Processo:} & ${params.numeroProcesso} \\\\
    \\hline
    \\textbf{Data de Distribuição:} & ${params.dataDistribuicao.toString()} \\\\
    \\hline
    \\end{tabular}

    \\vspace{10mm}

    \\textbf{2) POLO PASSIVO}

    \\begin{tabular}{l l}
    \\hline
    \\textbf{UNIÃO FEDERAL:} & \\\\
    \\hline
    \\textbf{CNPJ:} & 00.394.411/0001-09 \\\\
    \\hline
    \\end{tabular}

    \\vspace{10mm}

    \\textbf{3) METODOLOGIA}

    \\begin{itemize}
    \\item Os dados utilizados na Quantificação e Qualificação dos procedimentos hospitalares/ambulatoriais do SUS foram extraídos diretamente das fontes oficiais disponibilizadas pelo próprio SUS, através de conectores de web crawler aos endereços disponibilizados pelo SUS em suas plataformas Tabs, fazendo download e, posteriormente, sendo importados em banco de dados, com toda rastreabilidade e observância aos critérios de segurança da informação;

    \\item Nossa metodologia, no cumprimento de sentença, permite quaisquer validações de origem e rastreabilidade das informações extraídas e utilizadas, concedendo, com isso, segurança e rastreabilidade ao número aqui apresentado.

    \\item No cálculo de Atualização Monetária foram considerados os indicadores, conforme Resolução CJF Nº 784/2022, de 08/08/22, publicada em 11/08/22, onde aprovou a alteração do Manual de Orientação de Procedimentos para os Cálculos na Justiça Federal (anexo à Resolução CJF Nº 784/22), cuja orientação constante no Capítulo 4 (Liquidação de Sentença) é que, sendo devedora a Fazenda Pública em ações não tributárias, quanto às prestações devidas até dez/2021: a) o crédito será consolidado tendo por base o mês de dez./2021 pelos critérios de juros e correção monetária até então aplicáveis (definidos na Sentença); e b) sobre o valor consolidado do crédito em dez/2021 (principal corrigido + juros moratórios) incidirá a taxa Sella e partir de jan/2022) (§ 1° do art. 22 da Resolução CNJ Nº 303/2019, com redação dada pelo art. 6° da Resolução CNJ Nº 448/2022).
    \\end{itemize}

    \\vspace{10mm}

    \\textbf{4) CONCLUSÃO}

    \\begin{itemize}
    \\item Com base nas informações extraídas do DATASUS de procedimentos hospitalares e ambulatoriais (valores e quantidades), onde este perito processou 100\\% (cem por cento) destas informações e, por último, aplicando as correções monetárias e juros de mora, tem-se o total da ação de cumprimento de sentença de \\textbf{${params.valorTotal}}.
    \\end{itemize}

    \\newpage
    \\textbf{Resumo Total}
    \\setlength{\\tabcolsep}{8pt}
    \\renewcommand{\\arraystretch}{1.5}
    `;

  return header;
}
