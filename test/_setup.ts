import fs from 'fs';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;
mockFs.readFileSync.mockImplementation((path) => {
  if (path === 'test/long.json') {
    return JSON.stringify({
      from: 'long-flag',
    });
  }
  if (path === 'test/short.json') {
    return JSON.stringify({
      from: 'short-flag',
    });
  }
  if (path === 'github.json') {
    return JSON.stringify({
      username: 'eegli',
      hasGitHubPlus: false,
    });
  }
  if (path === 'nested.json') {
    return JSON.stringify({
      stringProp: {
        invalid: 'I am nested',
      },
    });
  }
  throw new Error();
});
