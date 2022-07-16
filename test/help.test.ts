import { displayHelp } from '../src/help';

describe('Helper text', () => {
  it('creates helper text with descriptions', () => {
    const defaultValues = {
      id: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const helperText = displayHelp({
      defaultValues,
      options: [
        {
          name: 'id',
        },
        {
          name: 'color',
          required: true,
          description: 'A color',
        },
        {
          name: 'withAuth',
          description: 'Require authentication for this action',
          shortFlag: '-wa',
        },
        {
          name: 'port',
          description: 'The port to listen on',
          shortFlag: '-p',
          required: true,
        },
      ],
      filePathArg: {
        longFlag: '--config',
        description: 'The config file to use',
      },
      title: 'CLI options',
    });

    expect(helperText).toMatchInlineSnapshot(`
      "CLI options

      Required
         --color <color> [string]
         A color

         -p, --port <port> [number]
         The port to listen on

      Optional
         --id <id> [string]

         -wa, --withAuth [boolean]
         Require authentication for this action

         --config [string]
         The config file to use
      "
    `);
  });
  it('creates helper text for file flag only', () => {
    const helperText = displayHelp({
      defaultValues: {},
      options: [],
      filePathArg: { longFlag: '--config' },
    });
    expect(helperText).toMatchInlineSnapshot(`
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
    const helperText = displayHelp({ defaultValues, options: [] });

    expect(helperText).toMatchInlineSnapshot(`"Usage"`);
  });
});
