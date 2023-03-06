# Reading Files

Tinyparse supports reading and parsing JSON files natively. The path to a JSON file relative to the current directory must be specified with a long flag and, optionally, with a short flag. The description is used for the [help printer](reference/printing-arguments).

**Good to know**

- CLI input - i.e., user input - **always** overrides file input!
- Reading from files is the only way to set booleans to `false` that are `true` by default, see the first example.
- When a command contains a short and long flag that both point to different files, the long flag takes precedence.

## Example

For the following examples, assume there are two JSON files in the current directory:

```js
// github.json
{
  "userName": "eegli",
  "hasGitHubPlus": true
}
```

<!-- doctest: file readin, valid -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {
    userName: '',
    hasGitHubPlus: false,
  },
  {
    filePathArg: {
      longFlag: '--config',
      shortFlag: '-c',
      description: 'Path to your Github config file',
    },
  }
);

const parsed = parseSync(['-c', 'github.json']);

expect(parsed.userName).toBe('eegli');
expect(parsed.hasGitHubPlus).toBe(true);
```

If the file contains non-`Value` values, i.e., arrays or object literals, parsing fails as it would for other invalid values.

```js
// github-bad.json - nested
{
  "userName": {
    "name": "eegli"
  }
}
```

<!-- doctest: file readin, invalid -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {
    userName: '',
  },
  {
    filePathArg: {
      longFlag: '--config',
    },
  }
);

expect(() => {
  parseSync(['--config', 'bad-github.json']);
}).toThrow(`Invalid type for --userName. "[object Object]" is not a string`);
```
