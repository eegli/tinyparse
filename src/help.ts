import { FilePathArg, InternalOptions, SimpleRecord } from './types';

type DisplayHelp = {
  defaultValues: SimpleRecord;
  options?: InternalOptions;
  filePathArg?: FilePathArg;
  title?: string;
};

export const displayHelp = ({
  defaultValues,
  options = new Map(),
  title = 'Usage',
  filePathArg,
}: DisplayHelp): string => {
  // Required properties first
  const opts = [...options.values()].sort((a, b) =>
    a.required === b.required ? 0 : a.required ? -1 : 1
  );

  let str = title;

  if (opts.length > 0) {
    str += '\n\n';
  }

  // Maybe no option is required
  if (opts[0]?.required) {
    str += 'Required\n';
  }

  let optionalFlag = true;
  const tab = '   ';

  opts.forEach(({ name, description, required, shortFlag }, idx) => {
    const isLast = idx === opts.length - 1;

    if (optionalFlag && !required) {
      str += 'Optional\n';
      optionalFlag = false;
    }

    str += `${tab}${shortFlag ? `${shortFlag}, ` : ''}`;
    str += `--${name}`;
    str += ` [${typeof defaultValues[name]}]`;
    str += description ? `\n${tab}` + description : '';
    str += isLast ? '' : '\n\n';
  });

  if (filePathArg) {
    const { longFlag, description } = filePathArg;
    str += `\n\n${tab}${longFlag} [string]\n`;
    str += description ? `${tab}${description}\n` : '';
  }
  return str;
};
