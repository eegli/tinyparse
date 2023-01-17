# Reading Files

Aenean non gravida urna. Aliquam quis tortor vulputate, malesuada dui at, posuere nunc. Duis molestie nunc at tellus lobortis volutpat. In non convallis sapien, id semper felis. In commodo condimentum cursus. Mauris luctus tincidunt justo, vitae consequat mi gravida a. In venenatis leo eget sem semper, eu tristique justo hendrerit.

## Examples

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const defaultUser = {
  username: '',
  hasGitHubPlus: false,
};

const { help, parse } = createParser(defaultUser, {
  filePathArg: {
    longFlag: '--config',
    description: 'Path to your Github config file',
  },
});

// Read from file "github.json" with content {"username": "eegli"}
process.argv = ['--hasGitHubPlus', '--config', 'github.json'];

const parsedArgv = await parse(process.argv);

assert.deepStrictEqual(parsedArgv, {
  _: [],
  username: 'eegli',
  hasGitHubPlus: true,
});
```
