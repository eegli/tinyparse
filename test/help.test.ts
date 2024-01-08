import { createParser } from '../src';

describe('Helper text', () => {
  test('creates helper text with descriptions', () => {
    const defaultValues = {
      UserId: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const { help } = createParser(defaultValues, {
      filePathArg: {
        longFlag: '-config',
        shortFlag: '-c',
        description: 'The config file to use',
      },
      options: {
        UserId: {},
        color: {
          required: true,
          description: 'A color',
        },
        withAuth: {
          description: 'Require authentication for this action',
          shortFlag: '-wa',
        },
        port: {
          description: 'The port to listen on',
          shortFlag: 'p',
          required: true,
        },
      },
    });

    expect(
      help({ title: 'CLI usage', base: 'do stuff with this CLI' }),
    ).toMatchSnapshot();
  });
  test('with decamelization and custom long flag', () => {
    const defaultValues = {
      UserId: '',
      someColor: '',
      withAuth: false,
    };
    const { help } = createParser(defaultValues, {
      decamelize: true,
      options: {
        someColor: {
          longFlag: 'color',
        },
      },
    });
    expect(help()).toMatchSnapshot();
  });
  test('file flag helper text only', () => {
    expect(
      createParser({}, { filePathArg: { longFlag: '--config' } }).help(),
    ).toMatchSnapshot();
    expect(
      createParser(
        {},
        { filePathArg: { longFlag: '--config', shortFlag: 'c' } },
      ).help(),
    ).toMatchSnapshot();
  });
  test('creates helper text with no descriptions', () => {
    const defaultValues = {
      id: '',
      withAuth: false,
      port: 999,
    };
    const { help } = createParser(defaultValues);
    expect(help()).toMatchSnapshot();
  });

  test('commands', () => {
    const defaultValues = {
      nonverbose: false,
      verbose: false,
    };
    const { help } = createParser(defaultValues, {
      options: {
        nonverbose: {
          required: true,
        },
      },
      commands: {
        cp: {
          args: ['source', 'destination'],
          description: 'Copy files from source to destination',
        },
        cd: {
          args: ['directory'],
          description: 'Navigate to a directory',
        },
        info: {
          args: [],
        },
        rm: {
          args: '...files',
          description: 'Remove multiple files or directories',
        },
      },
    });
    expect(help()).toMatchSnapshot();
  });
});
