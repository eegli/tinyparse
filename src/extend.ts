import { readFileSync } from 'fs';
import { ValidationError } from './error';
import { ObjectValues } from './types';

export async function extendObjectFromFiles<
  T extends Record<string, ObjectValues>
>(values: T, paths: string[]): Promise<T> {
  return paths.reduce(async (acc, path) => {
    const partial = await acc;
    if (
      !(
        Object.hasOwnProperty.call(partial, path) &&
        typeof partial[path] === 'string'
      )
    ) {
      return acc;
    }
    const filePath = partial[path] as string;
    try {
      const file = readFileSync(filePath, { encoding: 'utf8' });
      const parsed = JSON.parse(file);
      delete partial[path];
      return { ...partial, ...parsed };
    } catch (error) {
      throw new ValidationError(`${filePath} is not a valid JSON file`);
    }
  }, Promise.resolve(values));
}
