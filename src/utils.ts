import { ValidationError } from './error';
import _decamelize from './lib/decamelize';
import { KeysMatching, OnlyRequiredKeys } from './types';

type ReadFileSync = typeof import('fs').readFileSync;

const allowedTypes = new Set(['string', 'number', 'boolean']);

export default class Utils {
  public static isSameType(type: string, reference: string): boolean {
    return allowedTypes.has(type) && type === reference;
  }

  public static decamelize(value: string) {
    return _decamelize(value, { separator: '-' });
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

  public static getFlagType(value: string): [boolean, boolean] {
    const isShortFlag = value[0] === '-';
    return [isShortFlag, isShortFlag && value[1] === '-'];
  }

  public static sort<T>(
    array: T[],
    first: KeysMatching<OnlyRequiredKeys<T>, boolean>,
    second: KeysMatching<OnlyRequiredKeys<T>, string>
  ) {
    return array.sort((a, b) => {
      if (a[first] < b[first]) return 1;
      if (a[first] > b[first]) return -1;
      if (a[second] < b[second]) return -1;
      if (a[second] > b[second]) return 1;
      return 0;
    });
  }
}
