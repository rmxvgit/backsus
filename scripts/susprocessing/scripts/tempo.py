import time as t


class Tdata():
    def __init__(self, mes: int, ano: int):
        if not (0 < mes < 13):
            raise ValueError("mes inserido é inválido")

        self.mes = mes
        self.ano = ano


    def __sub__(self, other):
        diff_mes = self.mes - other.mes
        return (self.ano - other.ano)*12 + diff_mes

    def __str__(self):
        return (f"d({self.mes}/{self.ano})")
    
    # converte strings nesses formato para data MM-AA ou MM-AAAA
    def str_to_data(str_data: str):
        mes, ano = [int(x) for x in str_data.split('-')]
        if (ano < 100):
            if (ano < 60): ano += 2000
            else:  ano += 1900

        return(Tdata(mes, ano))

    @staticmethod
    def str_to_data(str_data: str):
        mes, ano = [int(x) for x in str_data.split('-')]
        if (ano < 100):
            if (ano < 60): ano += 2000
            else:  ano += 1900

        return (Tdata(mes, ano))


    def __lt__(self, other):
        return (self.ano, self.mes) < (other.ano, other.mes)

    def __gt__(self, other):
        return (self.ano, self.mes) > (other.ano, other.mes)
    
    @staticmethod
    def current_data():
        now = t.localtime()
        return Tdata(now.tm_mon, now.tm_year)
    
    def data_atual_aaaamm():
        now = t.localtime()
        return f"{now.tm_year}{now.tm_mon:02d}"
