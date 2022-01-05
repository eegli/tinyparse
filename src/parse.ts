type ObjectValue = string | number | boolean;

type Options<T extends string> = {
  required?: T[];
  shortFlags?: Record<string, T>;
};

export function argvToObj(
  args: string[],
  shortFlagMap?: Record<string, string>
): Record<string, ObjectValue> {
  return args.reduce((acc, curr, idx, orig) => {
    if (shortFlagMap && curr.startsWith('-')) {
      curr = '--' + shortFlagMap[curr.slice(1)];
    }
    if (curr.startsWith('--')) {
      const arg = curr.slice(2);
      const argVal: string | number | boolean = orig[idx + 1];
      // Assume boolean flag
      if (!argVal || argVal.startsWith('--')) {
        acc[arg] = true;
        // Assume number
      } else if (/^\d+$/.test(argVal)) {
        acc[arg] = +argVal;
        // Assume string
      } else {
        acc[arg] = argVal;
      }
    }
    return acc;
  }, {} as Record<string, ObjectValue>);
}

export function configFactory<
  T extends Record<string, ObjectValue>,
  R extends keyof T = string
>(baseConfig: T, opts?: Options<R extends string ? R : never>) {
  return function (args?: Partial<T> | Array<string>): Promise<T> {
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
      const cfmap = new Map<string, ObjectValue | null>(
        Object.entries(baseConfig)
      );

      // Delete required properties - they will need to be added again later
      if (requiredProps?.length) {
        requiredProps.forEach((r) => {
          cfmap.set(r, null);
        });
      }

      if (Array.isArray(args)) {
        args = argvToObj(args, shortFlags) as Partial<T>;
      }

      Object.entries(args).forEach(([arg, argVal]) => {
        if (cfmap.has(arg)) {
          // Get the type of the argument from the default config - not via the config map, since they are set to undefined if they are required
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
          // Required args are still undefined if they werent included.
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
