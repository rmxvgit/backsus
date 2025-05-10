import { createWriteStream, WriteStream } from 'node:fs';
import { LaudoInfo, HospitalInfo } from '../laudo.service';
import { join } from 'node:path';
import { getDocumentHeaderString } from './folhaInicial';

export class TexWriter {
  private write_stream: WriteStream;
  private laudo: LaudoInfo;
  private hospital: HospitalInfo;
  private tex_path: string;
  private csvs_dir: string;

  constructor(tex_path: string, laudo: LaudoInfo, hospital: HospitalInfo) {
    this.write_stream = createWriteStream(tex_path, { flags: 'a' });
    this.laudo = laudo;
    this.hospital = hospital;
    this.csvs_dir = join(
      process.cwd(),
      'scripts',
      'susprocessing',
      `H${hospital.cnes}${hospital.estado}`,
      'laudos',
    );
  }

  WriteTex() {}

  WriteHeader() {
    this.write_stream.write(
      getDocumentHeaderString({
        razaoSocial: this.laudo.razao_social,
        nomeFantasia: this.laudo.nome_fantasia,
        cnes: this.hospital.cnes.toString(),
        cnpj: this.laudo.cnpj,
        cidade: this.laudo.cidade,
        estado: this.laudo.estado,
        numeroProcesso: this.laudo.numero_processo,
        dataDistribuicao: this.laudo.data_distribuicao.toString(),
        valorTotal: '10',
      }),
    );
  }

  Write;
}
