import { createParser, ValidationError } from '../src';

describe('Lib', () => {
  test('exports are defined', () => {
    expect(createParser({})).toMatchInlineSnapshot(`
      {
        "help": [Function],
        "parse": [Function],
        "parseSync": [Function],
      }
    `);
    expect(ValidationError).toBeTruthy();
  });
  test('sync and async parsing are equal', async () => {
    const { parseSync, parse } = createParser({
      x: '',
    });
    const input = ['z', '--x', 'x', '--y'];
    await expect(parse()).resolves.toStrictEqual(parseSync());
    await expect(parse(input)).resolves.toStrictEqual(parseSync(input));
  });
});
