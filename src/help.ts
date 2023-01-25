import { Options } from './options';
import { HelpOptions } from './types';
import Utils from './utils';

interface InternalHelpOptions extends HelpOptions {
  options: Options;
}

export const displayHelp = ({
  options,
  title,
  base,
}: InternalHelpOptions): string => {
  // Required properties first
  const sortedOptions = [...options.entries()].sort(([, optA], [, optB]) =>
    optA.required === optB.required ? 0 : optA.required ? -1 : 1
  );

  let str = title || 'Usage';

  if (base) str += `\n\n${base}`;

  if (sortedOptions.length > 0) str += '\n\n';

  // Maybe no option is required
  const hasRequiredFlag = sortedOptions[0]?.[1].required;
  if (hasRequiredFlag) str += 'Required flags\n';

  let optionalFlag = true;
  const tab = '   ';

  sortedOptions.forEach(
    ([name, { description, required, shortFlag, _type }], idx) => {
      const isLast = idx === sortedOptions.length - 1;
      name = options.shouldDecamelize ? Utils.decamelize(name) : name;

      if (optionalFlag && !required) {
        str += 'Optional flags\n';
        optionalFlag = false;
      }

      str += tab;
      if (shortFlag) str += `${shortFlag}, `;
      str += `--${name}`;
      str += ` [${_type}]`;
      if (description) str += `\n${tab}${description}`;
      if (!isLast) str += '\n\n';
    }
  );

  if (options.filePathArg) {
    const { longFlag, shortFlag, description } = options.filePathArg;
    str += `\n\n${tab}`;
    if (shortFlag) str += `-${shortFlag}, `;
    str += `--${longFlag} [string]\n`;
    if (description) str += `${tab}${description}\n`;
  }
  return str;
};
