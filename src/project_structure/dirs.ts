import { accessSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { constants } from 'fs';

export const LAUDOS_DIR: string = join(process.cwd(), 'laudos');

export class DirsHandler {
  static CreateLaudosDirIfNecessary() {
    if (!existsSync(LAUDOS_DIR)) {
      console.log('Criando diretório de laudos:');
      mkdirSync(LAUDOS_DIR, { recursive: true });
    }
  }

  static VerifyLaudosDirPermissions() {
    try {
      accessSync(LAUDOS_DIR, constants.W_OK);
    } catch {
      throw new Error(`Sem permissão para escrever no diretório ${LAUDOS_DIR}`);
    }
  }
}
