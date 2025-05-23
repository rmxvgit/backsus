export class ProjUtils {
  static Unwrap<T>(value: T | null): NonNullable<T> {
    if (value != null) {
      return value;
    }
    throw new Error('unexpected null value');
  }

  static DateToString(date: Date): string {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
}
