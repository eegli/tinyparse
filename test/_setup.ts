import fs from 'fs';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;
mockFs.readFileSync.mockImplementation((path) => {
  if (path === 'test/config.json' || path === 'github.json') {
    return JSON.stringify({
      username: 'eegli',
      hasGitHubPlus: false,
    });
  }
  throw new Error();
});
