import { throwErr, ValidationError } from './error';
import { displayHelp } from './help';
import { argvTransformer } from './transform';
import { ObjectValues, Options, StringOrNever } from './types';

export function createParser<C extends Record<string, ObjectValues>>(
  baseConfig: C,
  options?: Options<StringOrNever<keyof C>>
) {
  return {
    parse: function (args?: Partial<C> | string[]): Promise<C> {
      return new Promise((resolve) => {
        // Array.filter needs some manual work for the correct type
        const requiredArgs = options?.filter((opt) => opt.required) || [];

        if (!args) {
          if (!requiredArgs?.length) {
            // No required arguments, return base config
            return resolve(baseConfig);
          } else {
            throwErr(`"${requiredArgs[0].name}" is required`);
          }
        }
        const config = new Map<string, ObjectValues | null>(
          Object.entries(baseConfig)
        );

        // Set required arguments to null - they will need to be
        // defined from the input
        if (requiredArgs?.length) {
          requiredArgs.forEach((r) => {
            config.set(r.name, null);
          });
        }

        if (Array.isArray(args)) {
          const shortFlags = options?.reduce((acc, curr) => {
            if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
            return acc;
          }, {} as Record<string, ObjectValues>);

          args = argvTransformer(args, shortFlags) as Partial<C>;
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
            if (config.get(arg.name) === null) {
              throwErr(`"${arg.name}" is required`);
            }
          }, <string[]>[]);
        }

        return resolve(Object.fromEntries(config) as C);
      });
    },
    help: function (title?: string) {
      return displayHelp(baseConfig, options || [], title);
    },
  };
}
