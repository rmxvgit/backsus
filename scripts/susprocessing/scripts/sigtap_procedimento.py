# ftp_utils.py
import csv
import logging
import os
from ftplib import FTP
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

#TODO: arrumar uma maneira de puxar os arquivos somente uma vez ao mes =)

def get_base_dir():
    """Retorna o diretório base absoluto do projeto"""
    try:
        return Path(__file__).parent.parent
    except NameError:
        return Path.cwd() / 'scripts' / 'susprocessing'

BASE_DIR = get_base_dir()

def get_path(*parts):
    """Constrói caminhos absolutos de forma confiável"""
    return str(BASE_DIR.joinpath(*parts))

# Configuração de diretórios
DADOS_DIR = get_path('dados')

def arquivos_procedimentos_ftp(data: str):
    ftp = FTP('ftp2.datasus.gov.br')
    ftp.login()
    ftp.cwd('/public/sistemas/tup/downloads/')

    try:
        arquivos = ftp.nlst()
        arquivos_filtrados = sorted([arq for arq in arquivos if arq.startswith(f'TabelaUnificada_{data}')])

        if not arquivos_filtrados:
            return None

        arquivo_mais_recente = arquivos_filtrados[-1]

        zip_path = get_path('dados', arquivo_mais_recente)

        with open(f'{zip_path}', 'wb') as file:
            ftp.retrbinary(f'RETR {arquivo_mais_recente}', file.write)

        print(f'Download concluído: {arquivo_mais_recente}')
        return arquivo_mais_recente

    except Exception as e:
        logging.error(f"Erro ao baixar arquivos do FTP: {e}")
        return None

    finally:
        ftp.quit()

def descricao_procedimento(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='latin-1') as infile, open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            csv_writer = csv.writer(outfile)
            csv_writer.writerow(["CO_PROCEDIMENTO", "NO_PROCEDIMENTO"])

            for line in infile:
                if len(line) >= 260:
                    procedimento = line[0:10].strip()
                    descricao = line[10:260].strip()
                    csv_writer.writerow([procedimento, descricao])
                else:
                    logging.warning(f"Linha ignorada por estar incompleta: {line.strip()}")

    except FileNotFoundError:
        logging.error(f"Arquivo não encontrado: {input_file}")
    except Exception as e:
        logging.error(f"Erro ao processar {input_file}: {e}")

def origem_sia_sih(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='latin-1') as infile, open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            csv_writer = csv.writer(outfile)
            csv_writer.writerow(["CO_PROCEDIMENTO", "CO_PROCEDIMENTO_SIA_SIH", "TP_PROCEDIMENTO"])

            for line in infile:
                if len(line) >= 21:
                    procedimento = line[0:10].strip()
                    procedimento_sia_sih = line[10:20].strip()
                    tipo_procedimento = line[20:21].strip()
                    csv_writer.writerow([procedimento, procedimento_sia_sih, tipo_procedimento])
                else:
                    logging.warning(f"Linha ignorada por estar incompleta: {line.strip()}")

    except FileNotFoundError:
        logging.error(f"Arquivo não encontrado: {input_file}")
    except Exception as e:
        logging.error(f"Erro ao processar {input_file}: {e}")

    origem_mais_tunep()


def origem_mais_tunep():
    origem = pd.read_csv(get_path('dados', 'origem_sia_sih.csv'))
    tunep = pd.read_csv(get_path('dados', 'TUNEP.csv'), encoding='utf-8-sig')

    origem['CO_PROCEDIMENTO'] = origem['CO_PROCEDIMENTO'].astype(str)
    origem['CO_PROCEDIMENTO_SIA_SIH'] = origem['CO_PROCEDIMENTO_SIA_SIH'].astype(str)
    tunep['Codigo'] = tunep['Codigo'].astype(str)

    tunep_mais_origem = pd.merge(origem, tunep, left_on='CO_PROCEDIMENTO_SIA_SIH', right_on='Codigo', how='outer').fillna(0)

    tunep_mais_origem = tunep_mais_origem[tunep_mais_origem['ValorTUNEP'] != 0]
    tunep_mais_origem = tunep_mais_origem[tunep_mais_origem['TP_PROCEDIMENTO'] != 0]

    tunep_mais_origem['ValorTUNEP'] = tunep_mais_origem['ValorTUNEP'].str.replace('.', '').str.replace(',', '.').astype(float)

    tunep_mais_origem = tunep_mais_origem.loc[
        tunep_mais_origem.groupby(['CO_PROCEDIMENTO', 'TP_PROCEDIMENTO'])['ValorTUNEP'].idxmax()
    ]

    tunep_mais_origem = tunep_mais_origem.sort_values(by='CO_PROCEDIMENTO')

    tunep_mais_origem = tunep_mais_origem[['CO_PROCEDIMENTO', 'Descricao', 'ValorTUNEP', 'TP_PROCEDIMENTO']]

    tunep_mais_origem['ValorTUNEP'] = tunep_mais_origem['ValorTUNEP'].apply(
        lambda x: f"{x:,.2f}".replace('.', '|').replace(',', '.').replace('|', ',')
    )

    tunep_mais_origem.to_csv(get_path('dados', 'tabela_tunep_mais_origem.csv'), index=False)
    
