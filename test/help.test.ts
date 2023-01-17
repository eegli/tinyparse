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
      filePathArg: {
        longFlag: '--config',
        description: 'The config file to use',
      },
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
          shortFlag: 'p',
          required: true,
        },
      },
    });

    expect(help('CLI usage', 'copy <file1> <file2> [flags]'))
      .toMatchInlineSnapshot(`
      "CLI usage

      copy <file1> <file2> [flags]

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
  it('matches readme example', () => {
    const { help } = createParser(
      {
        username: '',
        age: 0,
        hasGithubProfile: false,
      },
      {
        options: {
          username: {
            // Fail if there is no value for "username"
            required: true,
            description: 'Your custom username',
          },
          age: {
            // A custom validator that will receive the value for
            // "age". It must return a boolean
            customValidator: {
              isValid: (value) => typeof value === 'number' && value > 0,
              // The error message for when validation fails
              errorMessage: (v) => `${v} is not a positive number`,
            },
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
            // Short flag alias. Only takes effect when parsing an
            // array of strings
            shortFlag: '-ghp',
          },
        },
      }
    );
    expect(help('CLI usage', 'my-cli <message> [flags]'))
      .toMatchInlineSnapshot(`
      "CLI usage

      my-cli <message> [flags]

      Required flags
         --username [string]
         Your custom username

      Optional flags
         --age [number]

         -ghp, --hasGithubProfile [boolean]
         Indicate whether you have a Github profile"
    `);
  });
});
