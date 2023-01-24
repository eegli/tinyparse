import { createParser } from '../src';

describe('Helper text', () => {
  it('creates helper text with descriptions', () => {
    const defaultValues = {
      UserId: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const { help } = createParser(defaultValues, {
      filePathArg: {
        longFlag: '--config',
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

         --config [string]
         The config file to use
      "
    `);
  });
  it('decamelization handling enabled', () => {
    const defaultValues = {
      UserId: '',
      someColor: '',
      withAuth: false,
    };
    const { help } = createParser(defaultValues, {
      decamelize: true,
    });
    expect(help()).toMatchInlineSnapshot(`
      "Usage

      Optional flags
         --user-id [string]

         --some-color [string]

         --with-auth [boolean]"
    `);
  });
  it('creates helper text for file flag only', () => {
    const { help } = createParser(
      {},
      { filePathArg: { longFlag: '--config' } }
    );
    expect(help()).toMatchInlineSnapshot(`
      "Usage

         --config [string]
      "
    `);
  });
  it('creates helper text with no descriptions', () => {
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

         --withAuth [boolean]

         --port [number]"
    `);
  });
});
