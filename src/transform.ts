import {
  InternalOptions,
  ParsingOptions,
  PositionalArgs,
  SimpleRecord,
} from './types';
import { parseJSONFile } from './utils';

export function transformOptions(
  parsingOptions?: ParsingOptions
): InternalOptions {
  return Object.entries(parsingOptions?.options || {}).reduce(
    (acc, [name, opts]) => {
      if (!opts) return acc;
      acc.set(name, { ...opts, name });
      return acc;
    },
    new Map()
  );
}

const hasOwnProp = Object.prototype.hasOwnProperty;

export function transformArgv<T extends SimpleRecord>({
  argv,
  options = new Map(),
  filePathFlag,
}: {
  argv: string[];
  options?: InternalOptions;
  filePathFlag?: `--${string}`;
}): [Partial<T>, PositionalArgs] {
  const shortFlags = [...options.entries()].reduce((acc, [name, opts]) => {
    if (opts.shortFlag) acc[opts.shortFlag] = name;
    return acc;
  }, {} as SimpleRecord);

  const map = new Map<string, unknown>();
  const positionals: string[] = [];
  let isPositional = true;

  for (let i = 0; i < argv.length; i++) {
    let curr = argv[i];

    if (!curr.startsWith('-') && isPositional) {
      positionals.push(curr);
      continue;
    }

    isPositional = false;

    // Convert short flag to long flag
    if (hasOwnProp.call(shortFlags, curr)) {
      curr = '--' + shortFlags[curr];
    }

    // Ignore non-flags
    if (!curr.startsWith('--')) {
      continue;
    }
    const arg = curr.slice(2);
    const argVal = argv[i + 1];

    // Parse a file
    if (filePathFlag?.slice(2) === arg) {
      parseJSONFile(argVal).forEach(([key, content]) => map.set(key, content));
    }
    // Assume boolean flag
    else if (!argVal || argVal.startsWith('-')) {
      map.set(arg, true);
      // Assume number
      // Assume string
    } else {
      map.set(arg, argVal);
    }
  }

  return [Object.fromEntries(map) as Partial<T>, positionals];
}
