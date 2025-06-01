import os

import numpy as np
import pandas as pd


def combinar_csvs(diretorio: str, saidapa: str, saidasp: str):
    arquivos = [f for f in os.listdir(diretorio) if f.endswith('.csv')]
    df_pa = []
    df_sp = []

    for arquivo in arquivos:
        caminho_arquivo = os.path.join(diretorio, arquivo)

        df = pd.read_csv(caminho_arquivo, sep=",", header=None, dtype=str)
        df = df[1:]

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

def amostra_pa(arquivo: str, saida: str):
    df = pd.read_csv(arquivo, sep=',', header=None, dtype=str)

    df[14] = df[14].astype(str)

    grupo_col = 14
    amostra = df.groupby(grupo_col, group_keys=False).apply(lambda x: x.sample(n=min(len(x), 5), random_state=42), include_groups=True).reset_index(drop=True)

    amostra = amostra.reset_index(drop=True)

    amostra.to_csv(saida, index=False, header=False, sep=",")


def amostra_sp(arquivo: str, saida: str):
    df = pd.read_csv(arquivo, sep=',', header=None, dtype=str)

    def amostrar(grupo):
        return grupo.sample(n=min(5, len(grupo)), random_state=42)

    grupos = df.groupby([3, 4])
    amostra = grupos.apply(amostrar)
    amostra = amostra.reset_index(drop=True)

    print(amostra)
    amostra.to_csv(saida, index=False, header=False, sep=",")


def main(csv_file_path: str, path_laudos: str):
    combinar_csvs(f"{csv_file_path}/", f"{path_laudos}/arquivos_pa_reunidos.csv", f"{path_laudos}/arquivos_sp_reunidos.csv")
    amostra_pa(f"{path_laudos}/arquivos_pa_reunidos.csv", f"{path_laudos}/amostra_pa.csv")
    amostra_sp(f"{path_laudos}/arquivos_sp_reunidos.csv", f"{path_laudos}/amostra_sp.csv")
