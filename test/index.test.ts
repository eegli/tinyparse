import { createParser, ValidationError } from '../src/index';

describe('Lib', () => {
  it('exports are defined', () => {
    expect(createParser).toBeTruthy();
    expect(ValidationError).toBeTruthy();
  });
});
