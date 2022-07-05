import { InternalOptions, ObjectValues } from './types';

export const displayHelp = (
  base: Record<string, ObjectValues>,
  options: InternalOptions = [],
  title?: string
): string => {
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
    const isBoolean = typeof base[name] === 'boolean';

    if (optionalFlag && !required) {
      str += 'Optional\n';
      optionalFlag = false;
    }

    str += `${tab}${shortFlag ? `${shortFlag}, ` : ''}`;
    str += `--${name}`;
    str += isBoolean ? '' : ` <${name}>`;
    str += ` [${typeof base[name]}]`;
    str += description ? `\n${tab}` + description : '';
    str += isLast ? '' : '\n\n';
  });
  return str;
};
