import ftplib as ftp
import os
import sys
from multiprocessing.dummy import Pool

import laudo_final
import pandas as pd
import processar_dados_sia
import processar_dados_sih
import sigtap_procedimento
from tempo import Tdata

# python3 pull.py SIA RS 01-24 01-24 2248328
# TODO: criar forma de conferir se os arquivos foram baixados na íntegra
# TODO: criar separação de pastas por hospital
# TODO: descobir como exportar pdf para o front end
# TODO: reorganizar o codigo para carregar os arquivos sigtap uma vez ao mês, fazer o mesmo para o arquivo da selic

searchDirs = {
    'SIA': ["/dissemin/publicos/SIASUS/199407_200712/Dados", "/dissemin/publicos/SIASUS/200801_/Dados"],
    'SIH': ["/dissemin/publicos/SIHSUS/199201_200712/Dados", "/dissemin/publicos/SIHSUS/200801_/Dados"]
}

search_prefix = {
    'SIA': 'PA',
    'SIH': 'SP'
}

# padrão de chamada do programa:
# python pull.py <SIA/SIH> <estado>TabelaUnificada_202503_v2503101901.zip <data-inicio> <data-fim> <CNES>

def main():
    python_file = sys.argv[0]
    python_file_dir = os.path.dirname(python_file)
    # os.chdir(python_file_dir)

    args = sys.argv[1:]
    if not validate_args(args): return
    print(args)

    sistema = args[0]
    estado = args[1]
    data_inicio = Tdata.str_to_data(args[2])
    data_fim = Tdata.str_to_data(args[3])
    cnes = args[4]

    subdirectory_name = create_subdirectory(cnes, estado)
    verify_existence_of_dbc2dbf_converter()
    verify_existence_of_dbf2csv_converter()
    verify_existence_of_unzip_program()
    sigtap(Tdata.data_atual_aaaamm())
    get_and_process_data(estado, data_inicio, data_fim, sistema, cnes, subdirectory_name)
    unite_files(subdirectory_name)


def create_subdirectory(cnes: str, estado: str):
    subdirectory_name = f'H{cnes}{estado}'
    try:
        os.mkdir(f'../{subdirectory_name}')
    except FileExistsError:
        pass
    return subdirectory_name

# verifica a existência do conversor e, caso ele não exista, compila o conversor
def verify_existence_of_dbf2csv_converter():
    if os.path.exists("../exes/DBF2CSV"):
        return
    else:
        # TODO:
        pass

# verifica a existência do conversor e, caso ele não exista, compila o conversor
def verify_existence_of_dbc2dbf_converter():
    if os.path.exists("../exes/DBF2CSV"):
        return
    else:
        # TODO:
        pass

def verify_existence_of_unzip_program():
    if os.path.exists("../exes/unzip"):
        return
    else:
        # TODO:
        pass

def validate_args(args: list[str]) -> bool:
    if len(args) != 5:
        print("Número de argumentos fornecidos é inválido")
        return False
    if args[0] not in ['SIA', 'SIH', 'BOTH']:
        print("sistema inválido:", args[0])
        return False

    #essa condição não impede a execução
    if len(args[4]) != 7:
        print(f"WARNING: É possível que o cnes {args[4]} seja inválido")

    try:
        data_inicio = Tdata.str_to_data(args[2])
    except:
        print(f"data de início em um formato inválido: {args[2]}")

    try:
        data_fim = Tdata.str_to_data(args[3])
    except:
        print(f"data de início em um formato inválido: {args[2]}")

    if data_fim < data_inicio:
        print("Data de início maior que data de fim")
        return False

    return True

def find_files_of_interest(estado: str, data_inicio: Tdata, data_fim: Tdata, sih_sia: str) -> list[str]:
    files = []
    search_dirs = searchDirs[sih_sia]
    ftp_client = ftp.FTP("ftp.datasus.gov.br")

    try: ftp_client.login()
    except:
        print("não foi possível fazer login no ftp do sus")

    for dir in search_dirs:
        print(f"{dir} <---- vasculhando diretório")
        def append_to_file(file: str):
            file = file.split(' ')[-1]
            dateString =  file[6:8] + "-" + file[4:6]
            try: date = Tdata.str_to_data(dateString)
            except: return

            if file[0:2] != search_prefix[sih_sia] or estado != file[2:4] or date < data_inicio or data_fim < date:
                return
            files.append(dir + "/" + file)

        ftp_client.cwd(dir)
        ftp_client.retrlines("LIST", append_to_file)
    ftp_client.quit()
    return files

def get_and_process_data(estado: str, data_inicio: Tdata, data_fim: Tdata, sia_sih: str, cnes: str, subdirectory_name: str):
    if (sia_sih == 'BOTH'):  # caso especial no qual os dois sistemas são selecionados
        get_and_process_data(estado, data_inicio, data_fim, 'SIA', cnes)
        get_and_process_data(estado, data_inicio, data_fim, 'SIH', cnes)
        return

    print(f"processando {sia_sih}:")

    files_of_interest = find_files_of_interest(estado, data_inicio, data_fim, sia_sih)
    print(f"Arquivos a serem baixados:\n{files_of_interest}")

    create_storage_folders(subdirectory_name)



    with Pool(10) as p:
        print([[file, cnes, sia_sih, subdirectory_name] for file in files_of_interest])
        p.map(dowload_e_processamento, [[file, cnes, sia_sih, subdirectory_name] for file in files_of_interest])




def create_storage_folders(subdirectory_name: str) -> None:
    print(f'{subdirectory_name}\n\n\n')
    try:
        os.makedirs(f'../{subdirectory_name}/downloads')
    except:
        pass
    try:
        os.makedirs(f'../{subdirectory_name}/dbfs')
    except:
        pass
    try:
        os.makedirs(f'../{subdirectory_name}/csvs')
    except:
        pass
    try:
        os.makedirs(f'../{subdirectory_name}/finalcsvs')
    except:
        pass
    try:
        os.makedirs(f'../{subdirectory_name}/laudos')
    except:
        pass


def unite_files(subdirectory_name: str):
    print("vai funcionar ⛪️")
    laudo_final.main(subdirectory_name)



def file_was_already_dowloaded(file_name: str, subdirectory_name: str) -> bool:
    return os.path.exists(f"../{subdirectory_name}/downloads/{file_name}")


def dowload_from_ftp(ftp_server: str, remote_path: str, local_dir: str):
    try:
        print("Iniciando o download de", remote_path)
        remote_dir, remote_file = os.path.split(remote_path)
        local_file = os.path.join(local_dir, remote_file)
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)
        ftp_client = ftp.FTP(ftp_server)
        ftp_client.login()
        ftp_client.cwd(remote_dir)
        with open(local_file, 'wb') as file:
            ftp_client.retrbinary('RETR ' + remote_file, file.write)
        ftp_client.quit()
        print(f"Download de {remote_file} concluído com sucesso.")
        return
    except:
        print("Erro ao fazer download", remote_path)
        print("É provável que o servidor do sus não esteja funcionando como esperado")
        return


def sigtap(data: str):
    print("Carregando arquivos sigtap")
    arquivo_mais_recente = sigtap_procedimento.arquivos_procedimentos_ftp(f'{data}') #------------

    if not arquivo_mais_recente:
        print("Nenhum arquivo correspondente foi encontrado.")
        return

    print("Arquivos de descrição e origem")
    err = os.system(f"../exes/unzip ../dados/{arquivo_mais_recente} ../dados")
    if (err != 0):
        print(f'erro ao descompactar {arquivo_mais_recente}')
        exit(0)
    
    sigtap_procedimento.descricao_procedimento('../dados/tb_procedimento.txt', '../dados/desc_procedimento.csv')
    sigtap_procedimento.origem_sia_sih('../dados/rl_procedimento_sia_sih.txt', '../dados/origem_sia_sih.csv')

    print("Conversão concluída com sucesso!")


def dowload_e_processamento(file_and_cnes: list[str]):
    file = file_and_cnes[0]
    cnes = file_and_cnes[1]
    sih_sia = file_and_cnes[2]
    subdirectory_name = file_and_cnes[3]
    fileName = os.path.split(file)[1]

    try:
        start_time = Tdata.str_to_data(f"{fileName[6:8]}-{fileName[4:6]}")
    except:
        print(f"a data do arquivo {file} parece não estar em conformidade com o padrão esperado")
        return

    if not file_was_already_dowloaded(fileName, subdirectory_name):
        print(f"Dowload de {file}...")
        dowload_from_ftp("ftp.datasus.gov.br", file, f"../{subdirectory_name}/downloads/")

    print("Conversão para dbf...")
    os.system(f"../exes/blast-dbf ../{subdirectory_name}/downloads/{fileName} ../{subdirectory_name}/dbfs/{fileName[:-4]}.dbf")

    print("Conversão para csv...")
    os.system(f"../exes/DBF2CSV ../{subdirectory_name}/dbfs/{fileName[:-4]}.dbf ../{subdirectory_name}/csvs/{fileName[:-4]}.csv {cnes} {sys.argv[1]}")

    print("Processando dados do csv por cnes...")

    if (sih_sia == 'SIA'):
        processar_dados_sia.processar_dados_csv(f"../{subdirectory_name}/csvs/{fileName[:-4]}.csv", f"../{subdirectory_name}/finalcsvs/{fileName[:-4]}.csv", start_time, Tdata.current_data())
    else:
        processar_dados_sih.processar_dados_csv(f"../{subdirectory_name}/csvs/{fileName[:-4]}.csv", f"../{subdirectory_name}/finalcsvs/{fileName[:-4]}.csv", start_time, Tdata.current_data())


main()
