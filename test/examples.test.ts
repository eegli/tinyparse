import { createParser } from '../src/factory';

jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

describe('Readme examples', () => {
  test('general usage', async () => {
    const { help } = createParser(
      {
        clientId: '',
        outputDirectory: '',
      },
      [
        {
          name: 'clientId',
          required: true,
          description: 'The client id',
          shortFlag: '-cid',
        },
        {
          name: 'outputDirectory',
        },
      ]
    );

    expect(help('CLI Usage Example')).toMatchInlineSnapshot(`
      "CLI Usage Example

      Required
         -cid, --clientId <clientId> [string]
         The client id

      Optional
         --outputDirectory <outputDirectory> [string]"
    `);
  });
  test('default example', async () => {
    const defaultConfig = {
      name: 'defaultName', // string
      age: 0, // number
      hasDog: true, // boolean
    };

    const { parse } = createParser(defaultConfig);

    // Resolves to a full user configuration
    const parsed = await parse({
      name: 'eric',
      hasDog: false,
    });

    expect(parsed).toStrictEqual({
      name: 'eric',
      age: 0,
      hasDog: false,
    });
  });
  test('example, required args', async () => {
    const defaultConfig = {
      accessToken: '',
    };

    const { parse } = createParser(defaultConfig, [
      {
        name: 'accessToken',
        required: true,
      },
    ]);

    try {
      await parse();
    } catch (e) {
      expect(e).toHaveProperty('message', 'accessToken is required');
    }
  });
  test('example, invalid type', async () => {
    const defaultConfig = {
      accessToken: '',
    };

    const { parse } = createParser(defaultConfig);

    try {
      // @ts-expect-error test input
      await parse({ accessToken: 12 });
    } catch (e) {
      expect(e).toHaveProperty(
        'message',
        'Invalid type for "accessToken". Expected string, got number'
      );
    }
  });
  test('example, process argv 1', async () => {
    const { parse } = createParser(
      {
        otherPets: '',
        hasDog: true,
        hasCat: false,
      },
      [
        {
          name: 'otherPets',
          shortFlag: '-op',
        },
      ]
    );

    const parsedInput = await parse([
      '-op',
      'A bird ayy',
      '--hasDog',
      '--hasCat',
    ]);

    expect(parsedInput).toStrictEqual({
      otherPets: 'A bird ayy',
      hasDog: true,
      hasCat: true,
    });
  });
  test('example, typescript', async () => {
    type Config = {
      age?: number; // Optional - should be preserved
    };

    const defaultConfig: Config = {};

    const { parse } = createParser<Config>(defaultConfig);

    const parsedInput = await parse();

    expect(parsedInput).toStrictEqual({});

    /* 
      {
        age: string | undefined
      }
     */
  });
  test('example, error', async () => {
    const defaultConfig = {
      name: '',
    };

    const { parse } = createParser(defaultConfig, [
      {
        name: 'name',
        required: true,
      },
    ]);
    try {
      await parse();
    } catch (e) {
      expect(e).toHaveProperty('message', 'name is required');
    }
  });
});
