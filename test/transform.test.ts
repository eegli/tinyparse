import fs from 'fs';
import { transformArgv, transformOptions } from '../src/transform';

describe('External options transformer', () => {
  test('transforms options to internal structure', () => {
    const res = transformOptions({
      options: {
        test: {
          required: true,
        },
        test2: {
          description: 'another property',
        },
      },
    });
    expect(res).toStrictEqual([
      {
        name: 'test',
        required: true,
      },
      {
        description: 'another property',
        name: 'test2',
      },
    ]);
  });
});

describe('Argv transformer', () => {
  it('parses empty', async () => {
    const c = transformArgv([], []);
    expect(c).toStrictEqual({});
  });
  it('bool props', async () => {
    const c1 = transformArgv(['--boolProp'], []);
    expect(c1).toStrictEqual({
      boolProp: true,
    });
    const c2 = transformArgv(['--boolProp', '--secondBoolProp'], []);
    expect(c2).toStrictEqual({
      boolProp: true,
      secondBoolProp: true,
    });
  });

  it('string props', async () => {
    const c = transformArgv(['--stringProp', 'str'], []);
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = transformArgv(['--numProp', '123'], []);
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = transformArgv(
      ['--boolProp1', '--stringProp', 'str', '--numProp', '123', '--boolProp2'],
      []
    );
    expect(c).toStrictEqual({
      boolProp1: true,
      stringProp: 'str',
      numProp: 123,
      boolProp2: true,
    });
  });
});

describe('Argv transformer with short flags', () => {
  it('ignores short flags that are not present', async () => {
    const c = transformArgv(
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
    const c = transformArgv(
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
    const c = transformArgv(
      ['-v', '--normal', 'value'],
      [{ name: 'verbose', shortFlag: '-v' }]
    );
    expect(c).toStrictEqual({
      verbose: true,
      normal: 'value',
    });
  });
  it('transforms empty', async () => {
    const c = transformArgv(['-s', '123'], []);
    expect(c).toStrictEqual({});
  });
});

describe('Argv file parsing', () => {
  jest.unmock('fs');
  jest.spyOn(fs, 'readFileSync').mockImplementation((path, ..._) => {
    if (path === 'test/config.json') {
      return `{ "blop": "gugus", "blap": 2 }`;
    }
    throw new Error();
  });

  it('parses from simple JSON files', async () => {
    const c = transformArgv(['--config', 'test/config.json'], [], '--config');
    expect(c).toStrictEqual({
      blop: 'gugus',
      blap: 2,
    });
  });
  it('throws for invalid files', async () => {
    expect(() => {
      transformArgv(['--config', 'config.json'], [], '--config');
    }).toThrow('config.json is not a valid JSON file');
  });
});
