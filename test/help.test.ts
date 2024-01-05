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

    expect(help({ title: 'CLI usage', base: 'copy <file1> <file2> [flags]' }))
      .toMatchInlineSnapshot(`
      "CLI usage

      copy <file1> <file2> [flags]

      Required flags
         --color [string]
         A color

         -p, --port [number]
         The port to listen on

      Optional flags
         --UserId [string]

         -wa, --withAuth [boolean]
         Require authentication for this action

         -c, --config [string]
         The config file to use
      "
    `);
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
    expect(help()).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --color [string]

         --user-id [string]

         --with-auth [boolean]"
    `);
  });
  test('file flag helper text only', () => {
    expect(createParser({}, { filePathArg: { longFlag: '--config' } }).help())
      .toMatchInlineSnapshot(`
      "Usage

         --config [string]
      "
    `);
    expect(
      createParser(
        {},
        { filePathArg: { longFlag: '--config', shortFlag: 'c' } },
      ).help(),
    ).toMatchInlineSnapshot(`
      "Usage

         -c, --config [string]
      "
    `);
  });
  test('creates helper text with no descriptions', () => {
    const defaultValues = {
      id: '',
      withAuth: false,
      port: 999,
    };
    const { help } = createParser(defaultValues);
    expect(help()).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --id [string]

         --port [number]

         --withAuth [boolean]"
    `);
  });
});
