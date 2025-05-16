export class ProjUtils {
  static Unwrap<T>(value: T | null): NonNullable<T> {
    if (value != null) {
      return value;
    }
    throw new Error('unexpected null value');
  }
}
