import { parseProcessArgv } from '../src/parse-argv';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Argv to object transformer', () => {
  it('parses empty', async () => {
    const c = parseProcessArgv([]);
    expect(c).toStrictEqual({});
  });
  it('bool props 1', async () => {
    const c = parseProcessArgv(['--boolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
    });
  });
  it('bool props 2', async () => {
    const c = parseProcessArgv(['--boolProp', '--secondBoolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
      secondBoolProp: true,
    });
  });
  it('string props', async () => {
    const c = parseProcessArgv(['--stringProp', 'str']);
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = parseProcessArgv(['--numProp', '123']);
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = parseProcessArgv([
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
  it('ignores short flags that are not present', async () => {
    const c = parseProcessArgv(
      ['-s', '123', '--input', '123s', '-p', 'mypw', '-x', 'donotparse'],
      [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ]
    );
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: '123s',
    });
  });
  it('can have both long and short flags', async () => {
    const c = parseProcessArgv(
      ['-s', '123', '--input', 'this is a string', '-p', 'mypw'],
      [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ]
    );
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: 'this is a string',
    });
  });
  it('transforms boolean short flags', async () => {
    const c = parseProcessArgv(
      ['-v', '--normal', 'value'],
      [{ name: 'verbose', shortFlag: '-v' }]
    );
    expect(c).toStrictEqual({
      verbose: true,
      normal: 'value',
    });
  });
  it('transforms empty', async () => {
    const c = parseProcessArgv(['-s', '123']);
    expect(c).toStrictEqual({});
  });
});
