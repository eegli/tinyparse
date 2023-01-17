# Reading Files

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
