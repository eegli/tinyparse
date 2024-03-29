import { FlagValue } from './types/internals';

export enum Type {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Unknown = 'unknown',
}

export default class Utils {
  public static typeof(value: FlagValue): Type {
    if (typeof value === 'string') return Type.String;
    if (typeof value === 'number') return Type.Number;
    if (typeof value === 'boolean') return Type.Boolean;
    if (value instanceof Date) return Type.Date;
    return Type.Unknown;
  }

  public static tryToNumber(value: string): number | undefined {
    const num = +value;
    return !Number.isNaN(num) ? num : undefined;
  }

  public static tryToDate(value: string): Date | undefined {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  public static splitAtFirst(
    str: string,
    sep: string,
  ): [string, string | undefined] {
    const i = str.indexOf(sep);
    if (i === -1) return [str, undefined];

    return [str.substring(0, i), str.substring(i + 1)];
  }

  public static isShortFlag(value: string) {
    return value[0] === '-';
  }
}
