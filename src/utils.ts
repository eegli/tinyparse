import { ValidationError } from './error';
import _decamelize from './lib/decamelize';
import { Value } from './types';

type ReadFileSync = typeof import('fs').readFileSync;

const allowedTypes = new Set(['string', 'number', 'boolean']);

export default class Utils {
  public static isValueType(value: unknown): value is Value {
    return allowedTypes.has(typeof value);
  }

  public static decamelize(value: string) {
    return _decamelize(value, { separator: '-' });
  }

  // Try converting an unknown value to a number. If the result is
  // NaN, return identity
  public static toNumber(value: unknown): unknown {
    if (typeof value !== 'string') return value;
    const num = +value;
    return !Number.isNaN(num) ? num : value;
  }

  public static parseJSONFile(path: string): [string, unknown][] {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const readFileSync = require('fs').readFileSync as ReadFileSync;
      const file = readFileSync(path, { encoding: 'utf8' });
      return Object.entries(JSON.parse(file));
    } catch (error) {
      throw new ValidationError(`${path} is not a valid JSON file`);
    }
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

  public static trimFlag(flag: string): string {
    return flag.trim().replace(/^-+/, '');
  }

  public static makeLongFlag(flag: string): string {
    return `--${this.trimFlag(flag)}`;
  }

  public static makeShortFlag(flag: string): string {
    return `-${this.trimFlag(flag)}`;
  }
}
