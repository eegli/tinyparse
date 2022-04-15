import { ValidationError } from './error';
import { displayHelp } from './help';
import { ObjectValues, Options } from './types';
import { allowedTypes, argvTransformer } from './utils';

const requiredSym = Symbol('isRequired');

export function createParser<C extends Record<string, ObjectValues>>(
  defaultValues: C,
  options?: Options<keyof C>
) {
  return {
    parse: function (args: Partial<C> | string[] = []): Promise<C> {
      return new Promise((resolve) => {
        const requiredArgs = options?.filter((opt) => opt.required) || [];

        const config = new Map<string, ObjectValues | symbol>(
          Object.entries(defaultValues)
        );

        // For each required argument, replace its value temporarily
        // with a symbol
        requiredArgs.forEach((r) => {
          config.set(r.name, requiredSym);
        });

        if (Array.isArray(args)) {
          const shortFlags = options?.reduce((acc, curr) => {
            if (curr.shortFlag) acc[curr.shortFlag] = curr.name;
            return acc;
          }, {} as Record<string, ObjectValues>);

          args = argvTransformer(args, shortFlags) as Partial<C>;
        }

        Object.entries(args).forEach(([arg, argVal]) => {
          if (!config.has(arg)) {
            return;
          }
          // Either the received type corresponds to the original
          // type or the received type is explicitly allowed to be
          // null
          const argType = typeof defaultValues[arg];
          if (allowedTypes.has(argType) && argType === typeof argVal) {
            config.set(arg, argVal);
          } else {
            throw new ValidationError(
              `Invalid type for "${arg}". Expected ${typeof defaultValues[
                arg
              ]}, got ${typeof argVal}`
            );
          }
        });

        // Check if all required arguments have been defined or if the
        // temporary value is still there
        requiredArgs.forEach((arg) => {
          if (config.get(arg.name) === requiredSym) {
            throw new ValidationError(`"${arg.name}" is required`);
          }
        }, <string[]>[]);

        return resolve(Object.fromEntries(config) as C);
      });
    },
    help: function (title?: string) {
      return displayHelp(defaultValues, options || [], title);
    },
  };
}
