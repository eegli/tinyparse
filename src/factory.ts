import { argvTransformer } from './transformer';

export type ObjectValues = string | number | boolean;

type Options<T> =
  | {
      required?: T[];
      shortFlags: Record<string, T>;
    }
  | {
      required: T[];
      shortFlags?: Record<string, T>;
    };

export function parserFactory<T extends Record<string, ObjectValues>>(
  baseConfig: T,
  opts?: Options<keyof T extends string ? keyof T : never>
) {
  return function (args?: Partial<T> | string[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const requiredProps = opts?.required;
      const shortFlags = opts?.shortFlags;

      if (!args) {
        if (!requiredProps?.length) {
          // No required arguments, return base config
          return resolve(baseConfig);
        } else {
          return reject(
            `Missing required config ${
              requiredProps.length > 1 ? 'properties' : 'property'
            } "${requiredProps.join(', ')}"`
          );
        }
      }
      const cfmap = new Map<string, ObjectValues | null>(
        Object.entries(baseConfig)
      );

      // Delete required properties - they will need to be added again
      // later
      if (requiredProps?.length) {
        requiredProps.forEach((r) => {
          cfmap.set(r, null);
        });
      }

      if (Array.isArray(args)) {
        args = argvTransformer(args, shortFlags) as Partial<T>;
      }

      Object.entries(args).forEach(([arg, argVal]) => {
        if (cfmap.has(arg)) {
          // Get the type of the argument from the default config -
          // not via the config map, since they are set to null
          // if they are required
          if (typeof baseConfig[arg] === typeof argVal) {
            cfmap.set(arg, argVal);
          } else {
            reject(
              `Invalid type for option "${arg}". Expected ${typeof baseConfig[
                arg
              ]}, got ${typeof argVal}`
            );
          }
        } else {
          console.warn(`Ignoring unknown option "${arg}"`);
        }
      });

      if (requiredProps) {
        // Check for required args after parsing
        requiredProps.forEach((prop) => {
          // Required args are still null if they werent included.
          // Other falsy values are allowed
          if (cfmap.get(prop) === null) {
            reject(`Missing required config property "${prop}"`);
          }
        });
      }

      return resolve(Object.fromEntries(cfmap) as T);
    });
  };
}
