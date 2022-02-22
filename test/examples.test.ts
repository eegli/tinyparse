import { parserFactory } from '../src/factory';

jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());

describe('Readme examples', () => {
  test('default example', async () => {
    const defaultConfig = {
      name: 'defaultName',
      age: 0,
      hasDog: true,
    };
    const parse = parserFactory(defaultConfig);
    const p1 = await parse({
      name: 'eric',
      hasDog: false,
      age: 12,
    });
    expect(p1).toStrictEqual({
      name: 'eric',
      age: 12,
      hasDog: false,
    });
    const p2 = await parse({
      name: 'again, eric',
      // @ts-expect-error test input
      unknownProperty: 'blablabla',
    });
    expect(p2).toStrictEqual({
      name: 'again, eric',
      age: 0,
      hasDog: true,
    });
  });
  test('example, required args', async () => {
    const defaultConfig = {
      accessToken: '',
    };
    const parse = parserFactory(defaultConfig, {
      required: [
        {
          argName: 'accessToken',
          errorMessage: 'Please specify an access token to be used',
        },
      ],
    });
    try {
      await parse();
    } catch (e) {
      expect(e).toHaveProperty(
        'message',
        'Please specify an access token to be used'
      );
    }
  });
  test('example, invalid type', async () => {
    const defaultConfig = {
      accessToken: '',
    };
    const parse = parserFactory(defaultConfig);
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
    const parse = parserFactory({
      age: 0,
      hasDog: true,
      hasCat: false,
    });
    const parsedInput = await parse(['--hasCat', '--hasDog', '--age', '12']);
    expect(parsedInput).toStrictEqual({
      age: 12,
      hasDog: true,
      hasCat: true,
    });
  });
  test('example, process argv 2', async () => {
    const defaultConfig = {
      firstName: '',
      age: 0,
    };
    const parse = parserFactory(defaultConfig, {
      shortFlags: { '-fn': 'firstName' },
    });
    const parsedInput = await parse(['-fn', 'eric', '--age', '12']);
    expect(parsedInput).toStrictEqual({
      firstName: 'eric',
      age: 12,
    });
  });
  test('example, typescript', async () => {
    type Config = {
      age?: number; // Optional - should be preserved
    };

    const defaultConfig: Config = {};

    const parse = parserFactory<Config>(defaultConfig);

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

    const parse = parserFactory(defaultConfig, {
      required: [{ argName: 'name', errorMessage: 'Please specify a "name"' }],
    });
    try {
      await parse();
    } catch (e) {
      expect(e).toHaveProperty('message', 'Please specify a "name"');
    }
  });
});
