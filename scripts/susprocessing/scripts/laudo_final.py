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
            print(f"Erro: {arquivo} tem {df.shape[1]} colunas em vez de 9! Pulando esse arquivo.")
            continue

        dfs.append(df)

    # Combina todos os DataFrames
    if dfs:
        df_final = pd.concat(dfs, ignore_index=True)

        df_final.to_csv(saida, index=False, header=False, sep=";")
        print(f"Arquivo combinado salvo em: {saida}")
    else:
        print("Nenhum arquivo válido foi encontrado para combinar.")
        

def  calculo_IVR_TUNEP(subdirectory_name: str, arquivo: str):
    df = pd.read_csv(arquivo, sep=';', header=None, encoding='utf-8-sig')
    
    df.columns = ['Cód. procedimento','Desc. Procedimento', 'Mês/Ano', 'Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção', 'Total', 'Base SUS']
    
    df_filtrado = df[df['Cód. procedimento'] != "00.00.00.0na-n"]
    df_filtrado = df_filtrado.reset_index(drop=True)
    
    df_filtrado['Mês/Ano'] = pd.to_datetime(df_filtrado['Mês/Ano'], format='%m/%Y').dt.strftime('%Y-%m')
    
    df_sorted = df_filtrado.sort_values(by=['Cód. procedimento', 'Mês/Ano'], ascending=[True, True])
    df_sorted = df_sorted.reset_index(drop=True)
    
    df_sorted.to_csv(f"../{subdirectory_name}/laudos/resultado_final_filt.csv", index=False, sep=";", encoding='utf-8-sig')

def calculo_IVR_TUNEP_individualizado(subdirectory_name: str, arquivo: str):

    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig')

    df['Valor Base (R$)'] = df['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df['IVR/Tunep (R$)'] = df['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df['Correção'] = df['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df['Total'] = df['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df.to_csv(f"../{subdirectory_name}/laudos/calculo_IVR_TUNEP_individualizado.csv", index=False, sep=";", encoding='utf-8-sig')
    
def calculo_IVR_TUNEP_mensal(subdirectory_name: str, arquivo: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig', header=0)

    df = df.drop(columns=['Base SUS'])

    df = df[df['IVR/Tunep (R$)'] > 0] #retirar dps
    
    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']
    
    df_agrupado = df.groupby(['Cód. procedimento', 'Desc. Procedimento', 'Mês/Ano'], as_index=False).sum()
      
    df_agrupado['Valor Base (R$)'] = df_agrupado['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total'] = df_agrupado['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df_agrupado.to_csv(f"../{subdirectory_name}/laudos/calculo_IVR_TUNEP_mensal.csv", index=False, sep=";", encoding='utf-8-sig')
    
def total_por_procedimento_acumulado(subdirectory_name: str, arquivo: str):
    df = pd.read_csv(arquivo, sep=';', encoding='utf-8-sig', header=0)
    
    df = df.drop(columns=['Mês/Ano'])
    df = df.drop(columns=['Base SUS']) 

    df = df[df['IVR/Tunep (R$)'] > 0] #retirar dps
    
    colunas_numericas = ['Valor Base (R$)', 'Qtd. Base', 'IVR/Tunep (R$)', 'Correção']
    df[colunas_numericas] = df[colunas_numericas].astype(float)
    
    df['Total'] = df['Correção'] + df['IVR/Tunep (R$)']
    
    df_agrupado = df.groupby(['Cód. procedimento', 'Desc. Procedimento'], as_index=False).sum()
      
    df_agrupado['Valor Base (R$)'] = df_agrupado['Valor Base (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['IVR/Tunep (R$)'] = df_agrupado['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Correção'] = df_agrupado['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_agrupado['Total'] = df_agrupado['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    
    df_agrupado.to_csv(f"../{subdirectory_name}/laudos/total_por_procedimento_acumulado.csv", index=False, sep=";", encoding='utf-8-sig')

def resumo_mes(subdirectory_name: str, arquivo: str):
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

    df_agrupado.to_csv(f"../{subdirectory_name}/laudos/resumo_mes.csv", index=False, sep=";", encoding='utf-8-sig')
    
def resumo_ano(subdirectory_name: str, arquivo: str):
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

    df_agrupado.to_csv(f"../{subdirectory_name}/laudos/resumo_ano.csv", index=False, sep=";", encoding='utf-8-sig')
    
def resumo_total(subdirectory_name: str, arquivo: str):
    df = pd.read_csv(arquivo, delimiter=';')

    df['Total'] = df['IVR/Tunep (R$)'] + df['Correção']

    resumo_total = df[['IVR/Tunep (R$)', 'Correção', 'Total']].sum()
    
    df_resumo_total = pd.DataFrame(resumo_total).transpose()
    df_resumo_total['IVR/Tunep (R$)'] = df_resumo_total['IVR/Tunep (R$)'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_resumo_total['Correção'] = df_resumo_total['Correção'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
    df_resumo_total['Total'] = df_resumo_total['Total'].map(lambda x: f"{x:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
       
    df_resumo_total.to_csv(f"../{subdirectory_name}/laudos/resumo_total.csv", index=False, sep=";", encoding='utf-8-sig')

def main(subdirectory_name: str):
    print(f"../{subdirectory_name}/laudos/resultado_final.csv")
    combinar_csvs(f"../{subdirectory_name}/finalcsvs/", f"../{subdirectory_name}/laudos/resultado_final.csv")
    calculo_IVR_TUNEP(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final.csv")
    calculo_IVR_TUNEP_individualizado(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
    calculo_IVR_TUNEP_mensal(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
    total_por_procedimento_acumulado(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
    resumo_mes(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
    resumo_ano(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
    resumo_total(subdirectory_name, f"../{subdirectory_name}/laudos/resultado_final_filt.csv")
