import { InternalOptions, SimpleRecord } from './types';

type DisplayHelp = {
  defaultValues: SimpleRecord;
  options: InternalOptions;
  title?: string;
};

export const displayHelp = ({
  defaultValues,
  options,
  title,
}: DisplayHelp): string => {
  // Required properties first
  options.sort((a, b) => (a.required === b.required ? 0 : a.required ? -1 : 1));

  let str = `${title ? title : 'Usage'}\n\n`;

  // Maybe no option is required
  if (options[0]?.required) {
    str += 'Required\n';
  }

  let optionalFlag = true;
  const tab = '   ';

  options.forEach(({ name, description, required, shortFlag }, idx) => {
    const isLast = idx === options.length - 1;
    const isBoolean = typeof defaultValues[name] === 'boolean';

    if (optionalFlag && !required) {
      str += 'Optional\n';
      optionalFlag = false;
    }

    str += `${tab}${shortFlag ? `${shortFlag}, ` : ''}`;
    str += `--${name}`;
    str += isBoolean ? '' : ` <${name}>`;
    str += ` [${typeof defaultValues[name]}]`;
    str += description ? `\n${tab}` + description : '';
    str += isLast ? '' : '\n\n';
  });
  return str;
};
