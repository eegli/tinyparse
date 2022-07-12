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
    const c = transformArgv({ argv: [], options: [] });
    expect(c).toStrictEqual({});
  });
  it('bool props', async () => {
    const c1 = transformArgv({ argv: ['--boolProp'], options: [] });
    expect(c1).toStrictEqual({
      boolProp: true,
    });
    const c2 = transformArgv({
      argv: ['--boolProp', '--secondBoolProp'],
      options: [],
    });
    expect(c2).toStrictEqual({
      boolProp: true,
      secondBoolProp: true,
    });
  });

  it('string props', async () => {
    const c = transformArgv({ argv: ['--stringProp', 'str'], options: [] });
    expect(c).toStrictEqual({
      stringProp: 'str',
    });
  });
  it('number props (converts to number)', async () => {
    const c = transformArgv({ argv: ['--numProp', '123'], options: [] });
    expect(c).toStrictEqual({
      numProp: 123,
    });
  });
  it('all props', async () => {
    const c = transformArgv({
      argv: [
        '--boolProp1',
        '--stringProp',
        'str',
        '--numProp',
        '123',
        '--boolProp2',
      ],
      options: [],
    });
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
    const c = transformArgv({
      argv: ['-s', '123', '--input', '123s', '-p', 'mypw', '-x', 'donotparse'],
      options: [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ],
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: '123s',
    });
  });
  it('can have both long and short flags', async () => {
    const c = transformArgv({
      argv: ['-s', '123', '--input', 'this is a string', '-p', 'mypw'],
      options: [
        { name: 'secret', shortFlag: '-s' },
        { name: 'password', shortFlag: '-p' },
      ],
    });
    expect(c).toStrictEqual({
      secret: 123,
      password: 'mypw',
      input: 'this is a string',
    });
  });
  it('transforms boolean short flags', async () => {
    const c = transformArgv({
      argv: ['-v', '--normal', 'value'],
      options: [{ name: 'verbose', shortFlag: '-v' }],
    });
    expect(c).toStrictEqual({
      verbose: true,
      normal: 'value',
    });
  });
  it('transforms empty', async () => {
    const c = transformArgv({ argv: ['-s', '123'], options: [] });
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
    transformArgv({ argv: [], options: [] });
    const c = transformArgv({
      argv: ['--config', 'test/config.json'],
      options: [],
      filePathFlag: '--config',
    });
    expect(c).toStrictEqual({
      blop: 'gugus',
      blap: 2,
    });
  });
  it('throws for invalid files', async () => {
    transformArgv({ argv: [], options: [] });
    expect(() => {
      transformArgv({
        argv: ['--config', 'config.json'],
        options: [],
        filePathFlag: '--config',
      });
    }).toThrow('config.json is not a valid JSON file');
  });
});
