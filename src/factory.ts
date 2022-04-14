import { ValidationError } from './error';
import { displayHelp } from './help';
import { ObjectValues, Options, PartialNullable } from './types';
import { argvTransformer, getOptionByKey } from './utils';

const requiredSym = Symbol('isRequired');

export function createParser<C extends Record<string, ObjectValues>>(
  baseConfig: C,
  options?: Options<keyof C>
) {
  return {
    parse: function (args: PartialNullable<C> | string[] = []): Promise<C> {
      return new Promise((resolve) => {
        const requiredArgs = options?.filter((opt) => opt.required) || [];

        const config = new Map<string, ObjectValues | symbol>(
          Object.entries(baseConfig)
        );

        // Set required arguments to null - they will need to be
        // defined from the input
        requiredArgs.forEach((r) => {
          config.set(r.name, requiredSym);
        });

        if (Array.isArray(args)) {
          const shortFlags = options?.reduce((acc, curr) => {
            if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
            return acc;
          }, {} as Record<string, ObjectValues>);

          args = argvTransformer(args, shortFlags) as PartialNullable<C>;
        }

        Object.entries(args).forEach(([arg, argVal]) => {
          if (config.has(arg)) {
            // Get the type of the argument from the default config -
            // not via the config map, since they are set to null
            // if they are required
            const isValidNull =
              getOptionByKey(arg, options)?.allowNull && argVal === null;
            const isSameType = typeof baseConfig[arg] === typeof argVal;

            if (isValidNull || isSameType) {
              config.set(arg, argVal);
            } else {
              throw new ValidationError(
                `Invalid type for "${arg}". Expected ${typeof baseConfig[
                  arg
                ]}, got ${typeof argVal}`
              );
            }
          }
          console.warn(`Ignoring unknown argument "${arg}"`);
        });

        // Check if all required arguments have been defined by the
        // input

        requiredArgs.forEach((arg) => {
          if (config.get(arg.name) === requiredSym) {
            throw new ValidationError(`"${arg.name}" is required`);
          }
        }, <string[]>[]);

        return resolve(Object.fromEntries(config) as C);
      });
    },
    help: function (title?: string) {
      return displayHelp(baseConfig, options || [], title);
    },
  };
}
