import os

import pandas as pd

# localizar arquivos de PA e SP em sua pasta ok 
# ver qual o tipo do arquivo(PA e SP) ok
# juntar arquivos de acordo com o tipo em ordem de data crescente e com index ok
# colocar esses arquivos em um csv la pasta laudos ok
# fazer função para ler esse df e logo apos pegar 5 linhas de cada mes aleatoriamente e colocar em um csv

# em TS: passar tabelas para formato pdf com latex =)

def combinar_csvs(diretorio: str, saidapa: str, saidasp: str):
    arquivos = [f for f in os.listdir(diretorio) if f.endswith('.csv')]
    df_pa = []
    df_sp = []

    for arquivo in arquivos:
        caminho_arquivo = os.path.join(diretorio, arquivo)
        
        df = pd.read_csv(caminho_arquivo, skiprows=1, sep=",", header=None)

        if df.shape[1] == 60:
            df_pa.append(df)
        elif df.shape[1] == 36:
            df_sp.append(df)
        else:
            print(f"Erro: {arquivo} tem {df.shape[1]} colunas em vez de 60(PA) ou 36(SP)! Pulando esse arquivo.")
            continue

    if df_pa:
        df_final = pd.concat(df_pa, ignore_index=True)
        df_final.to_csv(saidapa, index=True, header=False, sep=",")
        print(f"Arquivo combinado salvo em: {saidapa}")
    else:
        print("Nenhum arquivo válido foi encontrado para combinar em arquivos PA.")
        
    if df_sp:
        df_final = pd.concat(df_sp, ignore_index=True)
        df_final.to_csv(saidasp, index=True, header=False, sep=",")
        print(f"Arquivo combinado salvo em: {saidasp}")
    else:
        print("Nenhum arquivo válido foi encontrado para combinar em arquivos SP.")
    
    
def main(csv_file_path: str, path_laudos: str):
    print(csv_file_path)
    combinar_csvs(f"{csv_file_path}/", f"{path_laudos}/arquivos_pa_reunidos.csv", f"{path_laudos}/arquivos_sp_reunidos.csv")
    
