import { describe, expect, test } from 'tstyche';
import { DowncastArgs, DowncastFlag } from '../../src/types/internals';

describe('type utils', () => {
  test('downcast args', () => {
    expect<DowncastArgs<string[]>>().type.toEqual<string[]>();
    expect<DowncastArgs<['a', 'b']>>().type.toEqual<[string, string]>();
  });
  test('downcast flag', () => {
    expect<DowncastFlag<1>>().type.toEqual<number>();
    expect<DowncastFlag<'as'>>().type.toEqual<string>();
    expect<DowncastFlag<true>>().type.toEqual<boolean>();
    expect<DowncastFlag<Date>>().type.toEqual<Date>();
  });
});
