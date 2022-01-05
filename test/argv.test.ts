import { argvToObj } from '../src/parse';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Argv to object', () => {
  it('parses empty', async () => {
    const c = argvToObj([]);
    expect(c).toStrictEqual({});
  });
  it('bool props', async () => {
    const c = argvToObj(['--boolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
    });
  });
  it('string props', async () => {
    const c = argvToObj(['--stringProp', 'str']);
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = argvToObj(['--numProp', '123']);
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = argvToObj([
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
    const shortFlagMap = { s: 'secret', p: 'password' };
    const c = argvToObj(['-s', '123', '-p', 'mypw'], shortFlagMap);
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
    });
  });
});
