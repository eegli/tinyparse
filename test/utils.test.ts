import Utils from '../src/utils';

describe('Utils', () => {
  test('string splitting', () => {
    expect(Utils.splitAtFirst('a.b.c', '.')).toEqual(['a', 'b.c']);
    expect(Utils.splitAtFirst('a.b.c', 'x')).toEqual(['a.b.c', undefined]);
  });
});
