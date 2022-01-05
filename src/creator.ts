export type ConfigLike = Record<string, string | number | boolean>;

export function argvToObj(args: string[]): ConfigLike {
  return args.reduce((acc, curr, idx, orig) => {
    if (curr.startsWith('--')) {
      const arg = curr.slice(2);
      let argVal: string | number | boolean = orig[idx + 1];
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
  }, {} as ConfigLike);
}

export function configFactory<T extends ConfigLike, R extends keyof T = string>(
  base: T,
  ...required: Array<R extends string ? R : never>
) {
  return function (args?: Partial<T> | Array<string>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!args) {
        return resolve(base);
      }
      const cfmap = new Map(Object.entries(base));

      // [--id, 123, --secret, xyz] --> arg, argVal, arg, argVal

      if (!Array.isArray(args)) {
        Object.entries(args).forEach(([arg, argVal]) => {
          if (cfmap.has(arg)) {
            const configVal = cfmap.get(arg);
            // Convert string to number if valid
            if (typeof configVal === 'number' && /^\d+$/.test(argVal)) {
              cfmap.set(arg, +argVal);
            } else if (typeof configVal === typeof argVal) {
              cfmap.set(arg, argVal);
            } else {
              reject(
                `Invalid type for option "${arg}". Expected ${typeof configVal}, got ${typeof argVal}`
              );
            }
          } else {
            console.warn(`Ignoring unknown option "${arg}"`);
          }
        });
      } else {
        args.forEach((val, idx, orig) => {
          if (val.startsWith('--')) {
            const arg = val.slice(2);
            const key = cfmap.get(arg);
            if (cfmap.has(arg)) {
              let argVal: string | number | boolean = orig[idx + 1];
              // Boolean flag that default to false
              if (typeof key === 'boolean') {
                cfmap.set(arg, true);
              }
              // Convert string input to number
              else if (typeof key === 'number' && /^\d+$/.test(argVal)) {
                cfmap.set(arg, +argVal);
              } else if (typeof key === typeof argVal) {
                cfmap.set(arg, argVal);
              } else {
                reject(
                  `Invalid type for option "--${arg}". Expected ${typeof key}, got ${typeof argVal}`
                );
              }
            } else {
              console.warn(`Ignoring unknown option "--${arg}"`);
            }
          }
        });
      }

      // Check for required properties
      required.forEach((prop) => {
        if (!cfmap.get(prop)) {
          reject(`Missing required config property "${prop}"`);
        }
      });

      return resolve(Object.fromEntries(cfmap) as T);
    });
  };
}
