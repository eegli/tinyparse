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
  test('string splitting', () => {
    expect(Utils.splitAtFirst('a.b.c', '.')).toEqual(['a', 'b.c']);
    expect(Utils.splitAtFirst('a.b.c', 'x')).toEqual(['a.b.c', undefined]);
  });
});
