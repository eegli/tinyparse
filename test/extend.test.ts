import fs from 'fs';
import { extendObjectFromFiles } from '../src/extend';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;
mockFs.readFileSync.mockImplementation((path, ..._) => {
  if (path === 'test/config.json') {
    return `{ "data1": "foo1" }`;
  }
  if (path === '../config.json') {
    return `{ "data2": "foo2" }`;
  }
  throw new Error();
});

describe('Object extender', () => {
  it('resolves valid paths', async () => {
    const existing = {
      filePath1: 'test/config.json',
      filePath2: '../config.json',
      filePath3: 'test/dir/config.json',
      other: 'bar',
    };
    const paths = ['filePath1', 'filePath2', 'notExisting'];
    const result = await extendObjectFromFiles(existing, paths);
    expect(result).toMatchInlineSnapshot(`
      {
        "data1": "foo1",
        "data2": "foo2",
        "filePath3": "test/dir/config.json",
        "other": "bar",
      }
    `);
  });
  it('throws for invalid files', async () => {
    const existing = {
      filePath: 'doesntExist.json',
      other: 'bar',
    };
    const paths = ['filePath'];
    await expect(extendObjectFromFiles(existing, paths)).rejects.toThrow(
      'doesntExist.json is not a valid JSON file'
    );
  });
});
