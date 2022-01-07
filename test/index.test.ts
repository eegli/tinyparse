import { parserFactory, ValidationError } from '../src/index';

describe('Lib', () => {
  it('exports are defined', () => {
    expect(parserFactory).toBeTruthy();
    expect(ValidationError).toBeTruthy();
  });
});
