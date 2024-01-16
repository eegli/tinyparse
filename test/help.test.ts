import { HelpPrinter } from '../src/help';
import { CommandOptionsMap, FlagOptions } from '../src/types';

describe('Helper text', () => {
  test('no configuration', () => {
    const printer = new HelpPrinter();
    expect(printer.print()).toMatchSnapshot();
  });
  test('creates helper text with descriptions', () => {
    const flags: FlagOptions[] = [
      {
        longFlag: '--flag-d',
        shortFlag: '-d',
        defaultValue: 3000,
        description: 'The fourth flag',
      },
      {
        longFlag: '--flag-a',
        defaultValue: '',
        required: true,
        description: 'The first flag',
      },
      {
        longFlag: '--flag-c',
        shortFlag: '-c',
        defaultValue: false,
      },
      {
        longFlag: '--flag-b',
        defaultValue: '',
        required: true,
      },
    ];
    const commands: CommandOptionsMap = new Map([
      [
        'serve',
        {
          args: ['path'],
          description: 'Serve a directory',
          handler: () => {},
        },
      ],
      [
        'info',
        {
          args: [],
          handler: () => {},
        },
      ],
      [
        'rm',
        {
          args: '...files',
          description: 'Remove files',
          handler: () => {},
        },
      ],
    ]);
    const printer = new HelpPrinter(flags, commands);
    expect(printer.print()).toMatchSnapshot('default');
    expect(printer.print('How to use my-cli')).toMatchSnapshot('with title');
  });
});
