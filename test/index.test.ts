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
});
