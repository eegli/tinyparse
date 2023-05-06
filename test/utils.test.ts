import Utils from '../src/utils';

describe('Utils', () => {
  test('string splitting', () => {
    expect(Utils.splitAtFirst('a.b.c', '.')).toEqual(['a', 'b.c']);
    expect(Utils.splitAtFirst('a.b.c', 'x')).toEqual(['a.b.c', undefined]);
  });
  const inputs = [
    ['1', 1],
    [true, true],
    [false, false],
    [{}, {}],
    ['.1', 0.1],
    ['1.1', 1.1],
    [undefined, undefined],
  ];
  inputs.forEach(([input, output], idx) => {
    test('value to number ' + (idx + 1), () => {
      expect(Utils.toNumber(input)).toStrictEqual(output);
    });
  });
});
