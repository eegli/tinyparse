import { Options } from './options';
import { SimpleRecord } from './types';

interface HelpOptions {
  defaultValues: SimpleRecord;
  options: Options;
  title?: string;
  baseCommand?: string;
}

export const displayHelp = ({
  defaultValues,
  options,
  title,
  baseCommand,
}: HelpOptions): string => {
  // Required properties first
  const sortedOptions = [...options.entries()].sort(([, optA], [, optB]) =>
    optA.required === optB.required ? 0 : optA.required ? -1 : 1
  );

  let str = title || 'Usage';

  if (baseCommand) {
    str += `\n\n${baseCommand}`;
  }

  if (sortedOptions.length > 0) {
    str += '\n\n';
  }

  // Maybe no option is required
  const hasRequiredFlag = sortedOptions[0]?.[1].required;
  if (hasRequiredFlag) {
    str += 'Required flags\n';
  }

  let optionalFlag = true;
  const tab = '   ';

  sortedOptions.forEach(([name, { description, required, shortFlag }], idx) => {
    const isLast = idx === sortedOptions.length - 1;

    if (optionalFlag && !required) {
      str += 'Optional flags\n';
      optionalFlag = false;
    }

    str += `${tab}${shortFlag ? `${shortFlag}, ` : ''}`;
    str += `--${name}`;
    str += ` [${typeof defaultValues[name]}]`;
    str += description ? `\n${tab}` + description : '';
    str += isLast ? '' : '\n\n';
  });

  if (options.filePathFlag) {
    const { longFlag, description } = options.filePathFlag;
    str += `\n\n${tab}${longFlag} [string]\n`;
    str += description ? `${tab}${description}\n` : '';
  }
  return str;
};
