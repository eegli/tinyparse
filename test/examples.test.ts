import { createParser } from '../src/factory';

jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

describe('Readme examples', () => {
  test('general usage', async () => {
    const { help, parse } = createParser(
      // Default values
      {
        clientId: '', // Expect a string
        outputDirectory: 'data', // Expect a string
      },
      // Options per key
      {
        options: {
          clientId: { required: true, description: 'The client id' },
          outputDirectory: { shortFlag: '-o' },
        },
      }
    );

    expect(await parse({ clientId: '123' })).toEqual({
      clientId: '123',
      outputDirectory: 'data',
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

  test('example, required args', async () => {
    const defaultConfig = {
      accessToken: '',
    };

    const { parse } = createParser(defaultConfig, {
      options: { accessToken: { required: true } },
    });

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

    const { parse } = createParser(defaultConfig, {
      options: { numberOfPets: { shortFlag: '-n' } },
    });

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

    const { parse } = createParser(defaultConfig, {
      options: { name: { required: true } },
    });
    try {
      await parse();
    } catch (e) {
      expect(e).toHaveProperty('message', '"name" is required');
    }
  });
});
