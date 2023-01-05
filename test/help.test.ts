import { createParser } from '../src';

describe('Helper text', () => {
  it('creates helper text with descriptions', () => {
    const defaultValues = {
      id: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const { help } = createParser(defaultValues, {
      options: {
        id: {},
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
          shortFlag: '-p',
          required: true,
        },
      },
      filePathArg: {
        longFlag: '--config',
        description: 'The config file to use',
      },
    });

    expect(help('CLI options')).toMatchInlineSnapshot(`
      "CLI options

      Required flags
         --color [string]
         A color

         -p, --port [number]
         The port to listen on

      Optional flags
         --id [string]

         -wa, --withAuth [boolean]
         Require authentication for this action

         --config [string]
         The config file to use
      "
    `);
  });
  it('creates helper text for file flag only', () => {
    const { help } = createParser(
      {},
      {
        filePathArg: { longFlag: '--config' },
      }
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
    expect(help()).toMatchInlineSnapshot(`"Usage"`);
  });
});
