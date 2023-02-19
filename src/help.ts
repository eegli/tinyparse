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
  const sortedOptions = Utils.sort(
    [...options.values()],
    'required',
    'longFlag'
  );

  let str = title || 'Usage';

  if (base) str += `\n\n${base}`;

  if (sortedOptions.length > 0) str += '\n\n';

  // Maybe no option is required
  const hasRequiredFlag = sortedOptions[0]?.required;
  if (hasRequiredFlag) str += 'Required flags\n';

  let optionalFlag = true;
  const tab = '   ';

  for (let idx = 0; idx < sortedOptions.length; idx++) {
    const { description, required, shortFlag, longFlag, _type } =
      sortedOptions[idx];
    const isLast = idx === sortedOptions.length - 1;

    if (optionalFlag && !required) {
      str += 'Optional flags\n';
      optionalFlag = false;
    }

    str += tab;
    if (shortFlag) str += `-${shortFlag}, `;
    str += `--${longFlag}`;
    str += ` [${_type}]`;
    if (description) str += `\n${tab}${description}`;
    if (!isLast) str += '\n\n';
  }

  if (options.filePathArg) {
    const { longFlag, shortFlag, description } = options.filePathArg;
    str += `\n\n${tab}`;
    if (shortFlag) str += `-${shortFlag}, `;
    str += `--${longFlag} [string]\n`;
    if (description) str += `${tab}${description}\n`;
  }
  return str;
};
