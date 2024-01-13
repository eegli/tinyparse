import Utils from '../src/utils';

describe('Utils', () => {
  test('string splitting', () => {
    expect(Utils.splitAtFirst('a.b.c', '.')).toEqual(['a', 'b.c']);
    expect(Utils.splitAtFirst('a.b.c', 'x')).toEqual(['a.b.c', undefined]);
  });
  const validInputs = ['1', '1.1', '1.1e1', '0', '09'];
  validInputs.forEach((input, idx) => {
    test('value to number ' + (idx + 1), () => {
      expect(Utils.tryToNumber(input)).toBeDefined();
    });
  });
  const invalidInputs = ['a', '1a', 'a1', '1.1.1', '1.1e1.1', '1e1.1'];
  invalidInputs.forEach((input, idx) => {
    test('value to number ' + (idx + 1), () => {
      expect(Utils.tryToNumber(input)).toBeUndefined();
    });
  });
});
