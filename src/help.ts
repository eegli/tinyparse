import { FlagOption, FlagOptions } from './types';
import Utils from './utils';

export class HelpPrinter {
  private _options: FlagOption[];
  private _filePathFlags: string[] = [];
  private _filePathFlagDescription?: string;

  constructor(options: FlagOptions) {
    // Required properties first, then alphabetical
    this._options = Utils.sort([...options.values()], 'isRequired', 'longFlag');
  }

  public withFilePathFlags(...filePathFlags: string[]) {
    this._filePathFlags = [...filePathFlags];
    return this;
  }

  public withFilePathDescription(filePathDescription?: string) {
    this._filePathFlagDescription = filePathDescription;
    return this;
  }

  public print(title?: string, base?: string) {
    let str = title || 'Usage';

    if (base) str += `\n\n${base}`;

    if (this._options.length > 0) str += '\n\n';

    // Maybe no option is required
    const hasRequiredFlag = this._options[0]?.isRequired;
    if (hasRequiredFlag) str += 'Required flags\n';

    let optionalFlag = true;
    const indent = '   ';

    for (let idx = 0; idx < this._options.length; idx++) {
      const { description, isRequired, shortFlag, longFlag, type } =
        this._options[idx];
      const isLast = idx === this._options.length - 1;

      if (optionalFlag && !isRequired) {
        str += 'Optional flags\n';
        optionalFlag = false;
      }

      str += indent;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag}`;
      str += ` [${type}]`;
      if (description) str += `\n${indent}${description}`;
      if (!isLast) str += '\n\n';
    }

    if (this._filePathFlags.length > 0) {
      const longFlag = this._filePathFlags[0];
      const shortFlag = this._filePathFlags[1];
      const description = this._filePathFlagDescription;

      str += `\n\n${indent}`;
      if (shortFlag) str += `${shortFlag}, `;
      str += `${longFlag} [string]\n`;
      if (description) str += `${indent}${description}\n`;
    }
    return str;
  }
}
