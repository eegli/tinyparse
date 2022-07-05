import { displayHelp } from '../src/help';

describe('Helper text', () => {
  it('creates helper text with descriptions', () => {
    const defaultConfig = {
      id: '',
      color: '',
      withAuth: false,
      port: 999,
    };

    const helperText = displayHelp(
      defaultConfig,
      [
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
      'CLI options'
    );

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
         Require authentication for this action"
    `);
  });
  it('creates helper text with no descriptions', () => {
    const defaultConfig = {
      id: '',
      withAuth: false,
      port: 999,
    };
    const helperText = displayHelp(defaultConfig);

    expect(helperText).toMatchInlineSnapshot(`
      "Usage

      "
    `);
  });
});
