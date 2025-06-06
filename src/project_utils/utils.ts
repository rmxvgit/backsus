import { readdirSync } from 'node:fs';
import path, { join } from 'node:path/posix';
import { cwd } from 'node:process';

export class ProjUtils {
  static Unwrap<T>(value: T | null): NonNullable<T> {
    if (value != null) {
      return value;
    }
    throw new Error('unexpected null value');
  }

  static DateToString(data: Date) {
    console.log(data.toString());

    let day = data.getUTCDay().toString();
    if (+day < 10) {
      day = `0${day}`;
    }

    let month = (data.getUTCMonth() + 1).toString();
    if (+month < 10) {
      month = `0${month}`;
    }

    return `${day}/${month}/${data.getUTCFullYear()}`;
  }
}

export function listScriptsDir() {
  const path = join(cwd(), 'scripts/susprocess/scripts');
  readdirSync(path);
}

export function readCwd() {
  const ls = readdirSync(cwd());
  ls.map((val) => {
    console.log(val);
    return val;
  });
}
