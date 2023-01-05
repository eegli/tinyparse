import { createParser, ValidationError } from '../src/index';

describe('Lib', () => {
  it('exports are defined', () => {
    expect(createParser({})).toMatchInlineSnapshot(`
      {
        "help": [Function],
        "parse": [Function],
        "positionalArgs": [Function],
      }
    `);
    expect(ValidationError).toBeTruthy();
  });
});
