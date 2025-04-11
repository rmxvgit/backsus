import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { exec, execSync } from 'child_process';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateLaudoDto } from './dto/create-laudo.dto';
import { exit } from 'process';

@Injectable()
export class LaudoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaudoDto) { 

    const cnes_number = parseInt(dto.cnes);
    const laudoName = `laudo${dto.cnes}${dto.estado}${dto.data_inicio}${dto.data_fim}`;
    const laudosDir = join(process.cwd(), 'laudos');

    // Cria diretório se não existir
    if (!existsSync(laudosDir)) {
      mkdirSync(laudosDir, { recursive: true });
    }

    // Verifica permissões de escrita
    try {
      accessSync(laudosDir, constants.W_OK);
    } catch (e) {
      throw new Error(`Sem permissão para escrever no diretório ${laudosDir}`);
    }

    // Primeiro cria o registro no banco de dados
    const laudo_input: Prisma.LaudoCreateInput = {
      start: dto.data_inicio,
      end: dto.data_fim,
      fileName: laudoName,
      ready: false,
      estado: dto.estado,
      Hospital: { connect: { cnes: cnes_number } },
      numeroProcesso: dto.numeroProcesso || undefined,
      dataDistribuicao: dto.dataDistribuicao
        ? new Date(dto.dataDistribuicao)
        : undefined,
    };

    let laudo_output;
    try {
      laudo_output = await this.prisma.laudo.create({
        data: laudo_input,
      });
    } catch (error) {
      try {
        // Se já existir, atualiza para ready: false
        laudo_output = await this.prisma.laudo.update({
          where: { fileName: laudoName },
          data: { ready: false },
        });
      } catch {
        throw new Error(
          'Erro ao criar/atualizar registro do laudo no banco de dados',
        );
      }
    }

    // Executa o script Python para processar os dados
    return new Promise((resolve, reject) => {
      exec(
        `python3 scripts/susprocessing/scripts/pull.py SIA ${dto.estado} ${dto.data_inicio} ${dto.data_fim} ${dto.cnes}`,
        async (error, stdout, stderr) => {
          if (error) {
            console.error('O script de processamento de dados falhou');
            console.log(stdout, stderr);

            try {
              await this.prisma.laudo.delete({
                where: { id: laudo_output.id },
              });
              reject(
                new Error('Falha no processamento dos dados - laudo removido'),
              );
            } catch (deleteError) {
              reject(
                new Error(
                  'Falha no processamento dos dados e não foi possível remover o laudo',
                ),
              );
            }
            return;
          }

          try {
            // Se o script Python rodou com sucesso, gera o PDF
            const valorFinal = await this.generatePdf(
              dto,
              laudoName,
              laudosDir,
            );

            // Atualiza o laudo com ready: true e o valorFinal
            await this.prisma.laudo.update({
              where: { id: laudo_output.id },
              data: {
                ready: true,
                valorFinal: valorFinal,
              },
            });

            resolve({
              success: true,
              laudoId: laudo_output.id,
              fileName: laudoName,
              valorFinal: valorFinal,
            });
          } catch (pdfError) {
            console.error('Erro durante geração do PDF:', pdfError);
            const pdfPath = join(laudosDir, `${laudoName}.pdf`);
            const errorMessage = existsSync(pdfPath)
              ? 'PDF foi gerado mas ocorreram warnings'
              : 'Falha na geração do PDF';

            try {
              await this.prisma.laudo.delete({
                where: { id: laudo_output.id },
              });
              reject(new Error(`${errorMessage} - laudo removido`));
            } catch (deleteError) {
              reject(
                new Error(`${errorMessage} e não foi possível remover o laudo`),
              );
            }
          }
        },
      );
    });
  }

  private async generatePdf(
    dto: CreateLaudoDto,
    laudoName: string,
    laudosDir: string,
  ): Promise<string> {
    // Obter informações básicas do hospital
    const hospital = await this.prisma.hospital.findUnique({
      where: { cnes: parseInt(dto.cnes) },
      select: {
        cnes: true,
        name: true,
        estado: true,
      },
    });

    if (!hospital) {
      throw new Error('Hospital não encontrado');
    }

    // Valores padrão para o template
    const hospitalInfo = {
      razaoSocial: hospital.name || 'Não informado',
      nomeFantasia: hospital.name || 'Não informado',
      cnpj: '00.000.000/0000-00', // CNPJ padrão
      cidade: hospital.estado || 'Não informado', // Usando estado como fallback para cidade
    };

    // Caminho para o arquivo CSV
    const csvPath = join(
      process.cwd(),
      'scripts',
      'susprocessing',
      `H${dto.cnes}${dto.estado}`,
      'laudos',
      'calculo_IVR_TUNEP_individualizado.csv',
    );

    if (!existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado em: ${csvPath}`);
    }

    // Ler o arquivo CSV
    const csvData = readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n');

    // Processar o CSV para gerar a tabela LaTeX
    let latexTable = '';

    // Cabeçalho da tabela
    latexTable +=
      '\\begin{longtable}{|>{\\raggedright\\arraybackslash}p{2cm}|>{\\raggedright\\arraybackslash}p{5cm}|>{\\centering\\arraybackslash}p{2cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.5cm}|>{\\centering\\arraybackslash}p{2.2cm}|>{\\centering\\arraybackslash}p{1.8cm}|>{\\centering\\arraybackslash}p{2.2cm}|}';
    latexTable += '\\hline\n';
    latexTable +=
      '\\textbf{Código} & \\textbf{Descrição do Procedimento} & \\textbf{Mês/Ano} & \\textbf{Valor Base (R\\$)} & \\textbf{Qtd. Base} & \\textbf{IVR/Tunep (R\\$)} & \\textbf{Correção} & \\textbf{Total} \\\\\n';
    latexTable += '\\hline\n';
    latexTable += '\\endhead\n';
    latexTable += '\\hline\n';
    latexTable += '\\endfoot\n';

    // Processar cada linha do CSV (ignorando o cabeçalho)
    let valorTotal = 0;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const columns = lines[i].split(';');
      if (columns.length < 8) continue;

      // Formatar os valores
      const codigo = columns[0].trim();
      const descricao = columns[1].trim();
      const mesAno = columns[2].trim();
      const valorBase = parseFloat(columns[3].trim()).toFixed(2);
      const qtdBase = columns[4].trim();
      const ivrTunep = parseFloat(columns[5].trim()).toFixed(2);
      const correcao = parseFloat(columns[6].trim()).toFixed(2);
      const total = parseFloat(columns[7].trim()).toFixed(2);

      valorTotal += parseFloat(total);

      // Adicionar linha à tabela
      latexTable += `${codigo} & ${descricao} & ${mesAno} & ${valorBase} & ${qtdBase} & ${ivrTunep} & ${correcao} & ${total} \\\\\n`;
      latexTable += '\\hline\n';
    }

    latexTable += '\\end{longtable}\n';

    // Formatar o valor total
    const valorFinal = valorTotal
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace('R$', 'R\\$');

    // Conteúdo LaTeX completo
    const texContent = `\\documentclass{article}
    \\usepackage[utf8]{inputenc}
    \\usepackage[T1]{fontenc}
    \\usepackage{lmodern}
    \\usepackage{textcomp}
    \\usepackage[brazil]{babel}
    \\usepackage{geometry}
    \\usepackage{pdflscape} % Para páginas em modo paisagem
    \\usepackage{longtable}
    \\usepackage{array}
    \\usepackage{helvet}
    \\usepackage{graphicx}
    \\renewcommand{\\familydefault}{\\sfdefault}

    % Configuração de margens
    \\geometry{
      a4paper,
      portrait, % Modo retrato como padrão
      left=20mm,
      right=20mm,
      top=20mm,
      bottom=20mm
    }

    % Ajuste para tabelas longas
    \\usepackage{etoolbox}
    \\preto\\longtable{\\setlength{\\tabcolsep}{4pt}} % Espaçamento entre colunas

    \\begin{document}

    \\section*{Laudo Quantitativo}
    \\subsection*{Cálculo IVR/TUNEP}

    \\textbf{1) POLO ATIVO}

    \\begin{tabular}{|l|l|}
    \\hline
    \\textbf{Razão Social:} & ${hospitalInfo.razaoSocial} \\\\
    \\hline
    \\textbf{Nome Fantasia:} & ${hospitalInfo.nomeFantasia} \\\\
    \\hline
    \\textbf{Código CNES:} & ${dto.cnes} \\\\
    \\hline
    \\textbf{Documento:} & ${hospitalInfo.cnpj} (CNPJ) \\\\
    \\hline
    \\textbf{Cidade:} & ${hospitalInfo.cidade} \\\\
    \\hline
    \\textbf{UF:} & ${dto.estado} \\\\
    \\hline
    \\textbf{Número Processo:} & ${dto.numeroProcesso || '1084504.04.2021.4.01.3400'} \\\\
    \\hline
    \\textbf{Data de Distribuição:} & ${dto.dataDistribuicao || '30/11/2021'} \\\\
    \\hline
    \\end{tabular}

    \\vspace{10mm}

    \\textbf{2) POLO PASSIVO}

    \\begin{tabular}{|l|l|}
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
    \\item Com base nas informações extraídas do DATASUS de procedimentos hospitalares e ambulatoriais (valores e quantidades), onde este perito processou 100\\% (cem por cento) destas informações e, por último, aplicando as correções monetárias e juros de mora, tem-se o total da ação de cumprimento de sentença de \\textbf{${valorFinal}}.
    \\end{itemize}

    \\newpage
    \\begin{landscape}
    \\textbf{PROCEDIMENTOS REALIZADOS}

    % Tabela principal em tamanho pequeno para caber mais conteúdo
    \\scriptsize
    ${latexTable}
    \\end{landscape}

    \\end{document}`.trim();

    // Salva o arquivo .tex
    const texPath = join(laudosDir, `${laudoName}.tex`);
    writeFileSync(texPath, texContent);
    console.log(`Arquivo .tex gerado em: ${texPath}`);

    // Compila o .tex para .pdf
    try {
      execSync(
        `pdflatex -interaction=nonstopmode -output-directory=${laudosDir} ${texPath}`,
        { cwd: laudosDir, stdio: 'inherit' },
      );
    } catch (e) {
      console.warn(
        'pdflatex pode ter retornado um warning, verificando se PDF foi gerado...',
      );
    }

    // Verifica se o PDF foi gerado
    const pdfPath = join(laudosDir, `${laudoName}.pdf`);
    if (!existsSync(pdfPath)) {
      throw new Error('O arquivo PDF não foi gerado');
    }

    // Limpa arquivos auxiliares do LaTeX
    ['.aux', '.log', '.out'].forEach((ext) => {
      const auxFile = join(laudosDir, `${laudoName}${ext}`);
      if (existsSync(auxFile)) {
        unlinkSync(auxFile);
      }
    });

    console.log(`PDF gerado com sucesso em: ${pdfPath}`);
    return valorFinal;
  }

  async findAll() {
    const laudos = await this.prisma.laudo.findMany();
    return laudos;
  }

  async findByCnes(cnes: number) {
    const laudos = await this.prisma.laudo.findMany({
      where: { hospitalCnes: cnes },
    });
    return laudos;
  }

  async findById(id: number) {
    const laudo = await this.prisma.laudo.findUnique({ where: { id: id } });
    return laudo;
  }

  async remove(id: number) {
    return await this.prisma.laudo.delete({ where: { id: id } });
  }
}
