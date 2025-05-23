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
