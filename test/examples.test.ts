import { createParser } from '../src/factory';

jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

describe('Readme examples', () => {
  test('general usage', async () => {
    const { help, parse } = createParser(
      // Default values
      {
        clientId: '', // Expect a string
        outputDirectory: '', // Expect a string
      },
      // Options per key
      [
        {
          name: 'clientId', // Name of the property
          required: true, // Fail if not present
          description: 'The client id', // For the help printer
        },
        {
          name: 'outputDirectory', // Name of the property
          shortFlag: '-o', // Short flag alias
          allowNull: true, // Allow this value to be null
        },
      ]
    );

    expect(await parse({ clientId: '123', outputDirectory: null })).toEqual({
      clientId: '123',
      outputDirectory: null,
    });

    expect(help('CLI Usage Example')).toMatchInlineSnapshot(`
      "CLI Usage Example

      Required
         --clientId <clientId> [string]
         The client id

      Optional
         -o, --outputDirectory <outputDirectory> [string]"
    `);
  });
  test('default example', async () => {
    const defaultConfig = {
      name: 'defaultName', // string
      age: 0, // number
      hasDog: true, // boolean
    };

    const { parse } = createParser(defaultConfig);

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
  test('example, explicit null value', async () => {
    const defaultConfig = {
      outputDirectory: '',
    };

    const { parse } = createParser(defaultConfig, [
      {
        name: 'outputDirectory',
        allowNull: true,
      },
    ]);

    const parsed = await parse({ outputDirectory: null });
    expect(parsed).toStrictEqual({
      outputDirectory: null,
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
      expect(e).toHaveProperty('message', '"accessToken" is required');
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

  test('example, process argv', async () => {
    const defaultConfig = {
      numberOfPets: 0,
      hasDog: true,
      hasCat: false,
    };

    const { parse } = createParser(defaultConfig, [
      {
        name: 'numberOfPets',
        shortFlag: '-n',
      },
    ]);

    const parsedInput = await parse(['-n', '6', '--hasDog', '--hasCat']);

    expect(parsedInput).toStrictEqual({
      numberOfPets: 6,
      hasDog: true,
      hasCat: true,
    });
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
      expect(e).toHaveProperty('message', '"name" is required');
    }
  });
});
