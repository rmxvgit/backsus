import os

import pandas as pd

'IVR/Tunep (R$)'

def formatar_valores(df, colunas):
    for coluna in colunas:
        df[coluna] = df[coluna].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    return df

def formatar_datas(df, coluna_data):
    df[coluna_data] = pd.to_datetime(df[coluna_data], errors='coerce').dt.strftime('%m/%Y')
    return df

def combinar_csvs(diretorio: str, saida: str):
    arquivos = [f for f in os.listdir(diretorio) if f.endswith('.csv')]
    dfs = []

    for arquivo in arquivos:
        caminho_arquivo = os.path.join(diretorio, arquivo)
        try:
            df = pd.read_csv(caminho_arquivo, skiprows=1, sep=";", header=None)
        except Exception as e:
            print("WARNING: Erro ao unir um dos arquivos, (não esquenta com essa poha):", str(e))
            continue

        if df.shape[1] != 10:
            print(f"Erro: {arquivo} tem {df.shape[1]} colunas em vez de 9! Pulando esse arquivo.")
            continue

        dfs.append(df)


    if dfs:
        df_final = pd.concat(dfs, ignore_index=True)
        df_final.to_csv(saida, index=False, header=False, sep=";")
        print(f"Arquivo combinado salvo em: {saida}")
    else:
        print("Nenhum arquivo válido foi encontrado para combinar.")

def calculo_IVR_TUNEP(arquivo: str, arquivo_saida: str, arquivo_saida_tunep_ivr: str):
    df = pd.read_csv(arquivo, sep=';', header=None, encoding='utf-8-sig')
    df.columns = ['Cód. procedimento', 'Desc. Procedimento', 'Mês/Ano', 'Valor Base (R$)', 'Qtd. Base', 'IVR (R$)','TUNEP (R$)', 'Correção', 'Total', 'Base SUS']

    df_filtrado = df[df['Cód. procedimento'] != "00.00.00.0na-n"].reset_index(drop=True)
    df_filtrado['Mês/Ano'] = pd.to_datetime(df_filtrado['Mês/Ano'], format='%m/%Y').dt.strftime('%Y-%m')
    df_sorted = df_filtrado.sort_values(by=['Cód. procedimento', 'Mês/Ano']).reset_index(drop=True)

    df_sorted.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')
    
    df_sorted['IVR/Tunep (R$)'] = df_sorted['IVR (R$)'] + df_sorted['TUNEP (R$)']
    df_tunep_ivr = df_sorted[['Cód. procedimento', 'Desc. Procedimento', 'Mês/Ano', 'Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção', 'Total', 'Base SUS']]
    df_tunep_ivr.to_csv(arquivo_saida_tunep_ivr, index=False, sep=";", encoding='utf-8-sig')

def calculo_IVR_TUNEP_individualizado(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig')
    df = formatar_datas(df, 'Mês/Ano')
    colunas_formatar = ['Valor Base (R$)', 'IVR (R$)','TUNEP (R$)', 'Correção', 'Total']
    df = formatar_valores(df, colunas_formatar)
    df.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def calculo_IVR_TUNEP_mensal(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig')
    df = df.drop(columns=['Base SUS'])
    df = df[df['IVR/Tunep (R$)'] > 0]
    df = formatar_datas(df, 'Mês/Ano')

    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']

    df_agrupado = df.groupby(['Cód. procedimento', 'Desc. Procedimento', 'Mês/Ano'], as_index=False).sum()
    df_agrupado = formatar_valores(df_agrupado, ['Valor Base (R$)', 'IVR/Tunep (R$)', 'Correção', 'Total'])

    df_agrupado.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def total_por_procedimento_acumulado(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig')
    df = df.drop(columns=['Mês/Ano', 'Base SUS'])
    df = df[df['IVR/Tunep (R$)'] > 0]

    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']

    df_agrupado = df.groupby(['Cód. procedimento', 'Desc. Procedimento'], as_index=False).sum()
    df_agrupado = formatar_valores(df_agrupado, ['Valor Base (R$)', 'IVR/Tunep (R$)', 'Correção', 'Total'])

    df_agrupado.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def resumo_mes(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, delimiter=';')
    df = formatar_datas(df, 'Mês/Ano')
    df['Total IVR/Tunep (R$)'] = df['IVR/Tunep (R$)'] + df['Correção']

    df_agrupado = df.groupby('Mês/Ano').agg({
        'IVR/Tunep (R$)': 'sum',
        'Correção': 'sum',
        'Total IVR/Tunep (R$)': 'sum'
    }).reset_index()

    df_agrupado = formatar_valores(df_agrupado, ['IVR/Tunep (R$)', 'Correção', 'Total IVR/Tunep (R$)'])
    df_agrupado.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def resumo_ano(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, delimiter=';')
    df['Mês/Ano'] = pd.to_datetime(df['Mês/Ano'], format='%Y-%m')
    df['Total IVR/Tunep (R$)'] = df['IVR/Tunep (R$)'] + df['Correção']
    df['Ano'] = df['Mês/Ano'].dt.year

    df_agrupado = df.groupby('Ano').agg({
        'IVR/Tunep (R$)': 'sum',
        'Correção': 'sum',
        'Total IVR/Tunep (R$)': 'sum'
    }).reset_index()


    df_agrupado = formatar_valores(df_agrupado, ['IVR/Tunep (R$)', 'Correção', 'Total IVR/Tunep (R$)'])
    df_agrupado.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def resumo_total(arquivo: str, arquivo_saida: str):
    df = pd.read_csv(arquivo, delimiter=';')
    df['Total'] = df['IVR/Tunep (R$)'] + df['Correção']

    resumo_total = df[['IVR/Tunep (R$)', 'Correção', 'Total']].sum()
    df_resumo_total = pd.DataFrame(resumo_total).transpose()
    df_resumo_total = formatar_valores(df_resumo_total, ['IVR/Tunep (R$)', 'Correção', 'Total'])

    df_resumo_total.to_csv(arquivo_saida, index=False, sep=";", encoding='utf-8-sig')

def main(csv_file_path: str, path_laudos: str):
    print(csv_file_path)
    combinar_csvs(f"{csv_file_path}/", f"{path_laudos}/resultado_final.csv")
    calculo_IVR_TUNEP(f"{path_laudos}/resultado_final.csv", f"{path_laudos}/resultado_final_filt.csv", f"{path_laudos}/resultado_final_filt_ivr_tunep.csv")
    calculo_IVR_TUNEP_individualizado(f"{path_laudos}/resultado_final_filt.csv", f"{path_laudos}/calculo_IVR_TUNEP_individualizado.csv")
    calculo_IVR_TUNEP_mensal(f"{path_laudos}/resultado_final_filt_ivr_tunep.csv", f"{path_laudos}/calculo_IVR_TUNEP_mensal.csv")
    total_por_procedimento_acumulado(f"{path_laudos}/resultado_final_filt_ivr_tunep.csv", f"{path_laudos}/total_por_procedimento_acumulado.csv")
    resumo_mes(f"{path_laudos}/resultado_final_filt_ivr_tunep.csv", f"{path_laudos}/resumo_mes.csv")
    resumo_ano(f"{path_laudos}/resultado_final_filt_ivr_tunep.csv", f"{path_laudos}/resumo_ano.csv")
    resumo_total(f"{path_laudos}/resultado_final_filt_ivr_tunep.csv", f"{path_laudos}/resumo_total.csv")
