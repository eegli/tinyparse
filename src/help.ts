import { Options } from './options';
import { HelpOptions } from './types';
import Utils from './utils';

export class HelpPrinter {
  constructor(private readonly _options: Options) {}

  public display({ title, base }: HelpOptions) {
    // Required properties first, then alphabetical
    const sortedOptions = Utils.sort(
      [...this._options.values()],
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
    const indent = '   ';

    for (let idx = 0; idx < sortedOptions.length; idx++) {
      const { description, required, shortFlag, longFlag, _type } =
        sortedOptions[idx];
      const isLast = idx === sortedOptions.length - 1;

      if (optionalFlag && !required) {
        str += 'Optional flags\n';
        optionalFlag = false;
      }

      str += indent;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag}`;
      str += ` [${_type}]`;
      if (description) str += `\n${indent}${description}`;
      if (!isLast) str += '\n\n';
    }

    const filePathArg = [...this._options.filePathFlags];
    if (filePathArg.length > 0) {
      const longFlag = filePathArg[0];
      const shortFlag = filePathArg[1];
      const description = this._options.filePathFlagDesc;
      str += `\n\n${indent}`;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag} [string]\n`;
      if (description) str += `${indent}${description}\n`;
    }
    return str;
  }
}
