import math as m
import os
import sys
import time as t
from pathlib import Path

import numpy as np
import pandas as pd
from tempo import Tdata

# essa tabela vai de maio do ano 2000 até novembro de 2021
tabela_ipcae = [0.09,0.08,0.78,1.99,0.45,0.18,0.17,0.6,0.63,0.5,0.36,0.5,0.49,0.38,0.94,1.18,0.38,0.37,0.99,0.55,0.62,0.44,0.4,0.78,0.42,0.33,0.77,1,0.62,0.9,2.08,3.05,1.98,2.19,1.14,1.14,0.85,0.22,-0.18,0.27,0.57,0.66,0.17,0.46,0.68,0.9,0.4,0.21,0.54,0.56,0.93,0.79,0.49,0.32,0.63,0.84,0.68,0.74,0.35,0.74,0.83,0.12,0.11,0.28,0.16,0.56,0.78,0.38,0.51,0.52,0.37,0.17,0.27,-0.15,-0.02,0.19,0.05,0.29,0.37,0.35,0.52,0.46,0.41,0.22,0.26,0.29,0.24,0.42,0.29,0.24,0.23,0.7,0.7,0.64,0.23,0.59,0.56,0.9,0.63,0.35,0.26,0.3,0.49,0.29,0.4,0.63,0.11,0.36,0.59,0.38,0.22,0.23,0.19,0.18,0.44,0.38,0.52,0.94,0.55,0.48,0.63,0.19,-0.09,-0.05,0.31,0.62,0.86,0.69,0.76,0.97,0.6,0.77,0.7,0.23,0.1,0.27,0.53,0.42,0.46,0.56,0.65,0.53,0.25,0.43,0.51,0.18,0.33,0.39,0.48,0.65,0.54,0.69,0.88,0.68,0.49,0.51,0.46,0.38,0.07,0.16,0.27,0.48,0.57,0.75,0.67,0.7,0.73,0.78,0.58,0.47,0.17,0.14,0.39,0.48,0.38,0.79,0.89,1.33,1.24,1.07,0.6,0.99,0.59,0.43,0.39,0.66,0.85,1.18,0.92,1.42,0.43,0.51,0.86,0.4,0.54,0.45,0.23,0.19,0.26,0.19,0.31,0.54,0.15,0.21,0.24,0.16,-0.18,0.35,0.11,0.34,0.32,0.35,0.39,0.38,0.1,0.21,0.14,1.11,0.64,0.13,0.09,0.58,0.19,-0.16,0.3,0.34,0.54,0.72,0.35,0.06,0.09,0.08,0.09,0.09,0.14,1.05,0.71,0.22,0.02,-0.01,-0.59,0.02,0.3,0.23,0.45,0.94,0.81,1.06,0.78,0.48,0.93,0.6,0.44,0.83,0.72,0.89,1.14,1.2,1.17]


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

DADOS_DIR = get_path('dados')

def getSelic() -> list[float]:
    file_descriptor = open(get_path(DADOS_DIR, 'selic.txt'), "r")
    lista = [float(x) for x in (file_descriptor.readline()[1:-1]).split(',')]
    file_descriptor.close()
    return lista

# essa tabela vai de maio do ano 2000 até novembro de 2021
def correcao_ipcae(data_inicio: Tdata, data_fim: Tdata):  # noqa: E501
    # TODO: validar as datas das entradas
    primeiro_ano_de_ipcae = Tdata(5, 2000)

    posicao_relativa_do_inicio = (data_inicio.ano - primeiro_ano_de_ipcae.ano)*12 + data_inicio.mes - primeiro_ano_de_ipcae.mes
    posicao_relativa_do_fim = (data_fim.ano - primeiro_ano_de_ipcae.ano)*12 + data_fim.mes - primeiro_ano_de_ipcae.mes

    if posicao_relativa_do_inicio >= len(tabela_ipcae):
        return 1.0

    if posicao_relativa_do_fim >= len(tabela_ipcae):
        posicao_relativa_do_fim = len(tabela_ipcae)-1


    indice_a_se_aplicar = m.prod([(x/100)+1 for x in tabela_ipcae[posicao_relativa_do_inicio:(posicao_relativa_do_fim+1)]])

    return indice_a_se_aplicar

def get_day():
    date = t.localtime()
    mes_str = ""
    if (date.tm_mon >= 10):
        mes_str = str(date.tm_mon)
    else:
        mes_str = f"0{date.tm_mon}"

    if (date.tm_mday >= 10):
        day_str = str(date.tm_mday)
    else:
        day_str = f"0{date.tm_mday}"

    return f"{day_str}/{mes_str}/{date.tm_year}"


def CalculaSelic(data_inicio: Tdata, data_fim: Tdata, selic_array: list[float]):
    inicio_da_selic = Tdata(12, 2021)
    posicao_do_inicio_na_array = (data_inicio.ano - inicio_da_selic.ano)*12 + data_inicio.mes - inicio_da_selic.mes
    posicao_do_fim_na_array = (data_fim.ano - inicio_da_selic.ano)*12 + data_fim.mes - inicio_da_selic.mes
    if posicao_do_fim_na_array < 0:
        return 1
    if posicao_do_inicio_na_array < 0:
        posicao_do_inicio_na_array = 0
    if posicao_do_fim_na_array >= len(selic_array):
        posicao_do_fim_na_array = len(selic_array)-1

    return m.prod(selic_array[posicao_do_inicio_na_array:posicao_do_fim_na_array+1])


def correcao_absoluta(data_inicio: Tdata, data_fim: Tdata, selic_arr: list[float]):
    print(CalculaSelic(data_inicio, data_fim, selic_arr))
    print(correcao_ipcae(data_inicio, data_fim))
    return CalculaSelic(data_inicio, data_fim, selic_arr)*correcao_ipcae(data_inicio, data_fim)



def processar_dados_csv(csv_file_path: str, output_file_path: str, data_inicio: Tdata, data_fim: Tdata):
    selic_arr = getSelic()
    taxa_de_correcao_para_esse_mes = correcao_absoluta(data_inicio, data_fim, selic_arr)

    porcentagem_de_correcao = (taxa_de_correcao_para_esse_mes - 1)*100

    df_main = pd.read_csv(csv_file_path, encoding='utf-8-sig', low_memory=False)
    df_proc = pd.read_csv(get_path('dados', 'desc_procedimento.csv'))
    df_tunep = pd.read_csv(get_path('dados', 'tabela_tunep_mais_origem.csv'))

    df_filt = df_main[['SP_AA', 'SP_MM', 'SP_VALATO', 'SP_ATOPROF', 'SP_QTD_ATO']]

    df_filt = df_filt[df_filt['SP_QTD_ATO'] > 0]
    # df_filt = df_filt[df_filt['SP_VALATO'] > 0]

    df_sum = df_filt.groupby(['SP_AA', 'SP_MM', 'SP_ATOPROF'],  as_index=False).agg({'SP_VALATO': 'sum', 'SP_QTD_ATO': 'sum'})
    df_sum = df_sum.sort_values(by='SP_ATOPROF')

    df_sum['SP_ATOPROF'] = df_sum['SP_ATOPROF'].astype(str)
    df_proc['CO_PROCEDIMENTO'] = df_proc['CO_PROCEDIMENTO'].astype(str)

    df_desc = pd.merge(df_sum, df_proc, left_on='SP_ATOPROF', right_on='CO_PROCEDIMENTO', how='left')
    df_desc = df_desc[['CO_PROCEDIMENTO', 'NO_PROCEDIMENTO', 'SP_AA', 'SP_MM', 'SP_VALATO', 'SP_QTD_ATO']]

    df_desc["IVR"] = df_desc["SP_VALATO"] * 0.5

    df_desc['CO_PROCEDIMENTO'] = df_desc['CO_PROCEDIMENTO'].astype(str)
    df_tunep['TP_PROCEDIMENTO'] = df_tunep['TP_PROCEDIMENTO'] == 'H'
    df_tunep['CO_PROCEDIMENTO'] = df_tunep['CO_PROCEDIMENTO'].astype(str)
    df_desc = pd.merge(df_desc, df_tunep, on='CO_PROCEDIMENTO', how='left').fillna(0)

    df_desc['ValorTUNEP'] = pd.to_numeric(df_desc['ValorTUNEP'].astype(str).str.replace(',', '.'), errors='coerce').fillna(0)
    comp_valor = df_desc['SP_QTD_ATO'] * df_desc['ValorTUNEP']
    df_desc['IVR/Tunep'] = np.where(comp_valor > df_desc['IVR'], comp_valor, df_desc['IVR'])
    df_desc['correcao'] = df_desc['IVR/Tunep'] * (taxa_de_correcao_para_esse_mes -1)
    df_desc['Total'] = df_desc['IVR/Tunep'] * taxa_de_correcao_para_esse_mes

    df_desc['CO_PROCEDIMENTO'] = df_desc['CO_PROCEDIMENTO'].astype(str).str.zfill(10)
    df_desc['CO_PROCEDIMENTO'] = df_desc['CO_PROCEDIMENTO'].str[:2] + "." + df_desc['CO_PROCEDIMENTO'].str[2:4] + "." + df_desc['CO_PROCEDIMENTO'].str[4:6] + "." + df_desc['CO_PROCEDIMENTO'].str[6:9] + "-" + df_desc['CO_PROCEDIMENTO'].str[9]
    df_desc["Mês/Ano"] = df_desc["SP_MM"].astype(str).str.zfill(2) + "/" + df_desc["SP_AA"].astype(str)
    df_desc['Base SUS'] = 'SIHSUS'

    df_final = df_desc[['CO_PROCEDIMENTO', 'NO_PROCEDIMENTO', 'Mês/Ano', 'SP_VALATO', 'SP_QTD_ATO', 'IVR/Tunep', 'correcao', 'Total', 'Base SUS']].rename(
        columns = {'CO_PROCEDIMENTO': 'Procedimentos', 'NO_PROCEDIMENTO': 'Desc. Procedimento', 'SP_VALATO': 'Valor Base (R$)', 'SP_QTD_ATO': ' Qtd. Base', 'IVR/Tunep': 'IVR/Tunep (R$)', 'correcao' :'Correção'})
    print(df_final)

    df_final.to_csv(f"{output_file_path}", sep=';', index=False,  encoding='utf-8-sig')
    print(f"Resultado salvo em: {output_file_path}")

def to_time(data: str) -> dict[str, int]:
    month_year = [int(x) for x in data.split('-')]
    if month_year[1] < 1900:
        if month_year[1] > 70:
            month_year[1] += 1900
        else:
            month_year[1] += 2000
    return {'month': month_year[0], 'year': month_year[1]}


def get_current_data() -> dict[str, int]:
    now = t.localtime()
    today = {'year': now.tm_year, 'month': now.tm_mon}
    return today

def main():
    if len(sys.argv) != 4:
        #TODO: escrever o uso correto do programa
        print("Uso: python processar_dados.py <caminho_do_csv>")
        exit(1)

    csv_file_path = sys.argv[1]
    output_file_path = sys.argv[2]

    data_inicio = to_time(sys.argv[3])
    data_fim = get_current_data() #TODO: passar dados por parâmetro assim como para data_início

    processar_dados_csv(csv_file_path, output_file_path, data_inicio, data_fim)
