import Utils from '../src/utils';

describe('Utils', () => {
  test('mixed sorting in two dimensions', () => {
    const arr = [
      { key1: false, key2: 'a' },
      { key1: true, key2: 'c' },
      { key1: true, key2: 'c' },
      { key1: false, key2: 'b' },
    ];
    expect(Utils.sort(arr, 'key1', 'key2')).toEqual([
      { key1: true, key2: 'c' },
      { key1: true, key2: 'c' },
      { key1: false, key2: 'a' },
      { key1: false, key2: 'b' },
    ]);
  });
  test('isNumeric', () => {
    [
      Utils.isNumericString(true),
      Utils.isNumericString('12a'),
      Utils.isNumericString('1..1'),
      Utils.isNumericString(1),
    ].forEach((val) => {
      expect(val).toBeFalsy();
    });
    [
      Utils.isNumericString('12.'),
      Utils.isNumericString('.12'),
      Utils.isNumericString('0'),
      Utils.isNumericString('-1'),
    ].forEach((val) => {
      expect(val).toBeTruthy();
    });
  });
});
