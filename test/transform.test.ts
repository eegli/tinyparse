import { stringsToObjLiteral } from '../src/transform';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Argv to object transformer', () => {
  it('parses empty', async () => {
    const c = stringsToObjLiteral([]);
    expect(c).toStrictEqual({});
  });
  it('bool props 1', async () => {
    const c = stringsToObjLiteral(['--boolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
    });
  });
  it('bool props 2', async () => {
    const c = stringsToObjLiteral(['--boolProp', '--secondBoolProp']);
    expect(c).toStrictEqual({
      boolProp: true,
      secondBoolProp: true,
    });
  });
  it('string props', async () => {
    const c = stringsToObjLiteral(['--stringProp', 'str']);
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = stringsToObjLiteral(['--numProp', '123']);
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = stringsToObjLiteral([
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
    const c = stringsToObjLiteral(
      ['-s', '123', '--input', '123s', '-p', 'mypw', '-x', 'donotparse'],
      { '-s': 'secret', '-p': 'password' }
    );
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: '123s',
    });
  });
  it('can have both long and short flags', async () => {
    const c = stringsToObjLiteral(
      ['-s', '123', '--input', 'this is a string', '-p', 'mypw'],
      { '-s': 'secret', '-p': 'password' }
    );
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: 'this is a string',
    });
  });
  it('transforms boolean short flags', async () => {
    const c = stringsToObjLiteral(['-v', '--normal', 'value'], {
      '-v': 'verbose',
    });
    expect(c).toStrictEqual({
      verbose: true,
      normal: 'value',
    });
  });
  it('transforms empty', async () => {
    const c = stringsToObjLiteral(['-s', '123'], {});
    expect(c).toStrictEqual({});
  });
});
