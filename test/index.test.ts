import { createParser, ValidationError } from '../src/index';

describe('Lib', () => {
  it('exports are defined', () => {
    expect(createParser({})).toMatchInlineSnapshot(`
      {
        "help": [Function],
        "parse": [Function],
        "parseSync": [Function],
      }
    `);
    expect(ValidationError).toBeTruthy();
  });
  it('sync and async parsing are equal', async () => {
    const { parseSync, parse } = createParser({
      x: '',
    });
    const input = ['z', '--x', 'x'];
    await expect(parse()).resolves.toStrictEqual(parseSync());
    await expect(parse(input)).resolves.toStrictEqual(parseSync(input));
  });
});
