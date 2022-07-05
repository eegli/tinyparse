import { stringsToObjLiteral } from '../transform';
import { ObjectValues, Options } from '../types';

export function parseProcessArgv<T extends Record<string, ObjectValues>>(
  options: Options<keyof T>,
  args: string[]
): Partial<T> {
  const shortFlags = options?.reduce((acc, curr) => {
    if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
    return acc;
  }, {} as Record<string, ObjectValues>);

  const transformed = stringsToObjLiteral(args, shortFlags) as Partial<T>;

  const filePathKeys = options.reduce((acc, curr) => {
    if (curr.isFilePath) acc.push(curr.name);
    return acc;
  }, [] as string[]);

  return transformed;
}
