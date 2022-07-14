import { createParser, ValidationError } from '../src';

jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

describe('Readme examples/e2e', () => {
  test('general usage', async () => {
    // Default values. These will be used as defaults/fallback
    const defaultValues = {
      username: '',
      hasGithubProfile: false,
    };

    const { help, parse } = createParser(
      defaultValues,
      // More configuration
      {
        // Parse a file (for example, a config file). Only takes
        // effect when parsing an array of strings
        filePathArg: {
          longFlag: '--config',
          description: 'Path to your Github config file',
        },
        // Options per key
        options: {
          username: {
            required: true,
            // For the help() command
            description: 'Your Github username',
          },
          hasGithubProfile: {
            description: 'Indicate whether you have a Github profile',
            // Short flag alias. Only takes effect when parsing an
            // array of strings
            shortFlag: '-gp',
          },
        },
      }
    );
    const r1 = await parse({ username: 'feegli' });

    expect(r1).toStrictEqual({
      username: 'feegli',
      hasGithubProfile: false,
    });

    // Assuming there is a file "config.json" in directory "test"
    const r2 = await parse(['-gp', '--config', 'test/config.json']);

    expect(r2).toStrictEqual({
      hasGithubProfile: true,
      username: 'eegli',
    });

    expect(help()).toMatchInlineSnapshot(`
      "Usage

      Required
         --username <username> [string]
         Your Github username

      Optional
         -gp, --hasGithubProfile [boolean]
         Indicate whether you have a Github profile

         --config [string]
         Path to your Github config file
      "
    `);
  });

  test('example, required args', async () => {
    const { parse } = createParser(
      { username: '' },
      {
        options: {
          username: {
            required: true,
          },
        },
      }
    );
    try {
      await parse();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e).toHaveProperty('message', '"username" is required');
    }
  });
  test('example, invalid type', async () => {
    const { parse } = createParser({ username: '' });

    try {
      // @ts-expect-error test input
      await parse({ username: ['eegli'] });
    } catch (e) {
      expect(e).toHaveProperty(
        'message',
        'Invalid type for "username". Expected string, got object'
      );
    }
  });

  test('example, process argv', async () => {
    const { parse } = createParser(
      {
        hasGithubProfile: false,
        hasGithubPlus: true,
        followerCount: 0,
      },
      { options: { followerCount: { shortFlag: '-fc' } } }
    );

    const res = await parse([
      '--hasGithubProfile',
      '--hasGithubPlus',
      '-fc',
      '10',
    ]);
    expect(res).toStrictEqual({
      hasGithubPlus: true,
      hasGithubProfile: true,
      followerCount: 10,
    });
  });
});
