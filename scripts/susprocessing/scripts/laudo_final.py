import os

import pandas as pd

# TODO: Arrumar formatação da data

def combinar_csvs(diretorio: str, saida: str):
    arquivos = [f for f in os.listdir(diretorio) if f.endswith('.csv')]
    dfs = []

    for arquivo in arquivos:
        caminho_arquivo = os.path.join(diretorio, arquivo)
        

        df = pd.read_csv(caminho_arquivo, skiprows=1, sep=";", header=None)
        
        if df.shape[1] != 9:
            print(f"⚠️ Erro: {arquivo} tem {df.shape[1]} colunas em vez de 9! Pulando esse arquivo.")
            continue

        dfs.append(df)

    # Combina todos os DataFrames
    if dfs:
        df_final = pd.concat(dfs, ignore_index=True)

        df_final.to_csv(saida, index=False, header=False, sep=";")
        print(f"Arquivo combinado salvo em: {saida}")
    else:
        print("Nenhum arquivo válido foi encontrado para combinar.")
        

def  calculo_IVR_TUNEP_individualizado(arquivo: str):
    df = pd.read_csv(arquivo, sep=';', header=None, encoding='utf-8-sig')
    
    df.columns = ['Procedimentos','Desc. Procedimento', 'Mês/Ano', 'Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção', 'Total', 'Base SUS']
    
    df_filtrado = df[df['Procedimentos'] != "00.00.00.0na-n"]
    df_filtrado = df_filtrado.reset_index(drop=True)
    
    df_filtrado['Mês/Ano'] = pd.to_datetime(df_filtrado['Mês/Ano'], format='%m/%Y').dt.strftime('%Y-%m')
    
    df_sorted = df_filtrado.sort_values(by=['Procedimentos', 'Mês/Ano'], ascending=[True, True])
    df_sorted = df_sorted.reset_index(drop=True)
    
    df_sorted.to_csv("../laudos/resultado_final.csv", index=False, sep=";", encoding='utf-8-sig')
    
    df_sorted['Valor Base (R$)'] = df_sorted['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_sorted['IVR/Tunep (R$)'] = df_sorted['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_sorted['Correção'] = df_sorted['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_sorted['Total'] = df_sorted['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df_sorted.to_csv("../laudos/calculo_IVR_TUNEP_individualizado.csv", index=False, sep=";", encoding='utf-8-sig')
    
def calculo_IVR_TUNEP_mensal(arquivo: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig', header=0)

    df = df.drop(columns=['Base SUS'])

    df = df[df['IVR/Tunep (R$)'] > 0] #retirar dps
    
    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']
    
    df_agrupado = df.groupby(['Procedimentos', 'Desc. Procedimento', 'Mês/Ano'], as_index=False).sum()
      
    df_agrupado['Valor Base (R$)'] = df_agrupado['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total'] = df_agrupado['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df_agrupado.to_csv("../laudos/calculo_IVR_TUNEP_mensal.csv", index=False, sep=";", encoding='utf-8-sig')
    
def total_por_procedimento_acumulado(arquivo: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig', header=0)
    
    df = df.drop(columns=['Mês/Ano'])
    df = df.drop(columns=['Base SUS']) 

    df = df[df['IVR/Tunep (R$)'] > 0] #retirar dps
    
    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']
    
    df_agrupado = df.groupby(['Procedimentos', 'Desc. Procedimento'], as_index=False).sum()
      
    df_agrupado['Valor Base (R$)'] = df_agrupado['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total'] = df_agrupado['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df_agrupado.to_csv("../laudos/total_por_procedimento_acumulado.csv", index=False, sep=";", encoding='utf-8-sig')

def resumo_mes(arquivo: str):
    # Carregar o CSV
    df = pd.read_csv(arquivo, delimiter=';')

    df['Mês/Ano'] = pd.to_datetime(df['Mês/Ano'], format='%Y-%m').dt.strftime('%Y-%m')

    df['Total IVR/Tunep (R$)'] = df['IVR/Tunep (R$)'] + df['Correção']

    df_agrupado = df.groupby('Mês/Ano').agg({
        'IVR/Tunep (R$)': 'sum',
        'Correção': 'sum',
        'Total IVR/Tunep (R$)': 'sum'
    }).reset_index()

    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total IVR/Tunep (R$)'] = df_agrupado['Total IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))

    df_agrupado.to_csv("../laudos/resumo_mes.csv", index=False, sep=";", encoding='utf-8-sig')
    
def resumo_ano(arquivo: str):
    df = pd.read_csv(arquivo, delimiter=';')

    df['Mês/Ano'] = pd.to_datetime(df['Mês/Ano'], format='%Y-%m')

    df['Total IVR/Tunep (R$)'] = df['IVR/Tunep (R$)'] + df['Correção']

    df['Ano'] = df['Mês/Ano'].dt.year

    df_agrupado = df.groupby('Ano').agg({
        'IVR/Tunep (R$)': 'sum',
        'Correção': 'sum',
        'Total IVR/Tunep (R$)': 'sum'
    }).reset_index()

    
    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total IVR/Tunep (R$)'] = df_agrupado['Total IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))

    df_agrupado.to_csv("../laudos/resumo_ano.csv", index=False, sep=";", encoding='utf-8-sig')
    
def resumo_total(arquivo: str):
    df = pd.read_csv(arquivo, delimiter=';')

    df['Total'] = df['IVR/Tunep (R$)'] + df['Correção']

    resumo_total = df[['IVR/Tunep (R$)', 'Correção', 'Total']].sum()
    
    df_resumo_total = pd.DataFrame(resumo_total).transpose()
    df_resumo_total['IVR/Tunep (R$)'] = df_resumo_total['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_resumo_total['Correção'] = df_resumo_total['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_resumo_total['Total'] = df_resumo_total['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
       
    df_resumo_total.to_csv("../laudos/resumo_total.csv", index=False, sep=";", encoding='utf-8-sig')

def main():
    combinar_csvs("../finalcsvs/", "../laudos/resultado_final.csv")
    calculo_IVR_TUNEP_individualizado("../laudos/resultado_final.csv")
    calculo_IVR_TUNEP_mensal("../laudos/resultado_final.csv")
    total_por_procedimento_acumulado("../laudos/resultado_final.csv")
    resumo_mes("../laudos/resultado_final.csv")
    resumo_ano("../laudos/resultado_final.csv")
    resumo_total("../laudos/resultado_final.csv")
