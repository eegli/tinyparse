import { ValidationError } from './error';
import { argvTransformer } from './transformer';

export type ObjectValues = string | number | boolean;

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

type Options<T> = RequireAtLeastOne<{
  required: T[];
  shortFlags: Record<string, T>;
}>;

export function parserFactory<T extends Record<string, ObjectValues>>(
  baseConfig: T,
  opts?: Options<keyof T extends string ? keyof T : never>
) {
  return function (args?: Partial<T> | string[]): Promise<T> {
    return new Promise((resolve) => {
      const requiredProps = opts?.required;
      const shortFlags = opts?.shortFlags;

      if (!args) {
        if (!requiredProps?.length) {
          // No required arguments, return base config
          return resolve(baseConfig);
        } else {
          throw new ValidationError(
            `Missing required propert${
              requiredProps.length > 1 ? 'ies' : 'y'
            } "${requiredProps.join('", "')}"`
          );
        }
      }
      const config = new Map<string, ObjectValues | null>(
        Object.entries(baseConfig)
      );

      // Set required properties to null - they will need to be
      // defined from the input
      if (requiredProps?.length) {
        requiredProps.forEach((r) => {
          config.set(r, null);
        });
      }

      if (Array.isArray(args)) {
        args = argvTransformer(args, shortFlags) as Partial<T>;
      }

      Object.entries(args).forEach(([arg, argVal]) => {
        if (config.has(arg)) {
          // Get the type of the argument from the default config -
          // not via the config map, since they are set to null
          // if they are required
          if (typeof baseConfig[arg] === typeof argVal) {
            config.set(arg, argVal);
          } else {
            throw new ValidationError(
              `Invalid type for "${arg}". Expected ${typeof baseConfig[
                arg
              ]}, got ${typeof argVal}`
            );
          }
        } else {
          console.warn(`Ignoring unknown argument "${arg}"`);
        }
      });

      // Check if all required properties have been defined by the
      // input
      if (requiredProps?.length) {
        const missing = requiredProps.reduce((acc, prop) => {
          if (config.get(prop) === null) {
            acc.push(prop);
          }
          return acc;
        }, <string[]>[]);

        if (missing.length) {
          throw new ValidationError(
            `Missing required propert${
              missing.length > 1 ? 'ies' : 'y'
            } "${missing.join('", "')}"`
          );
        }
      }

      return resolve(Object.fromEntries(config) as T);
    });
  };
}
