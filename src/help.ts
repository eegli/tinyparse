import { InternalHelpOptions } from './types';
import { decamelize } from './utils';

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
      name = options.shouldDecamelize ? decamelize(name) : name;

      if (optionalFlag && !required) {
        str += 'Optional flags\n';
        optionalFlag = false;
      }

      str += `${tab}${shortFlag ? `${shortFlag}, ` : ''}`;
      str += `--${name}`;
      str += ` [${_type}]`;
      str += description ? `\n${tab}` + description : '';
      str += isLast ? '' : '\n\n';
    }
  );

  if (options.filePathFlag) {
    const { longFlag, description } = options.filePathFlag;
    str += `\n\n${tab}${longFlag} [string]\n`;
    str += description ? `${tab}${description}\n` : '';
  }
  return str;
};
