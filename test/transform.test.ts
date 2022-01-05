import { argvTransformer } from '../src/transformer';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Argv to object transformer', () => {
  it('parses empty', async () => {
    const c = argvTransformer([]);
    expect(c).toStrictEqual({});
  });
  it('bool props', async () => {
    const c = argvTransformer(['--boolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
    });
  });
  it('string props', async () => {
    const c = argvTransformer(['--stringProp', 'str']);
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = argvTransformer(['--numProp', '123']);
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = argvTransformer([
      '--boolProp1',
      '--stringProp',
      'str',
      '--numProp',
      '123',
      '--boolProp2',
    ]);
    expect(c).toStrictEqual({
      boolProp1: true,
      stringProp: 'str',
      numProp: 123,
      boolProp2: true,
    });
  });
});

describe('Argv to object, short flags', () => {
  it('bool props', async () => {
    const c = argvTransformer(
      ['-s', '123', '--input', 'this is a string', '-p', 'mypw'],
      { s: 'secret', p: 'password' }
    );
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: 'this is a string',
    });
  });
});
