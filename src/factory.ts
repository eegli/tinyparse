import { throwErr, ValidationError } from './error';
import { argvTransformer } from './transform';
import { ObjectValues, Options, StringOrNever } from './types';

export function parserFactory<
  T extends Record<string, ObjectValues>,
  K extends keyof T = keyof T
>(baseConfig: T, opts?: Options<StringOrNever<K>>) {
  return function (args?: Partial<T> | string[]): Promise<T> {
    return new Promise((resolve) => {
      const requiredArgs = opts?.required;
      const shortFlags = opts?.shortFlags;

      if (!args) {
        if (!requiredArgs?.length) {
          // No required arguments, return base config
          return resolve(baseConfig);
        } else {
          throwErr(requiredArgs[0].errorMessage);
        }
      }
      const config = new Map<string, ObjectValues | null>(
        Object.entries(baseConfig)
      );

      // Set required arguments to null - they will need to be
      // defined from the input
      if (requiredArgs?.length) {
        requiredArgs.forEach((r) => {
          config.set(r.argName, null);
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

      // Check if all required arguments have been defined by the
      // input
      if (requiredArgs?.length) {
        requiredArgs.forEach((arg) => {
          if (config.get(arg.argName) === null) {
            throwErr(arg.errorMessage);
          }
        }, <string[]>[]);
      }

      return resolve(Object.fromEntries(config) as T);
    });
  };
}
