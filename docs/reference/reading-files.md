# Reading Files

Tinyparse supports reading and parsing JSON files natively. The path to a JSON file relative to the current directory must be specified with a long flag and, optionally, with a short flag. The description is used for the [help command](reference/printing-arguments).

## Example

Assume that there is a JSON file with the following content in the current directory:

```js
{
  "username": "eegli",
  "hasGitHubPlus": false
}
```

Tinyparse supports reading and parsing JSON files natively.

<!-- doctest: file reading -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  {
    username: '',
    hasGitHubPlus: true,
  },
  {
    filePathArg: {
      longFlag: '--config',
      shortFlag: '-c',
      description: 'Path to your Github config file',
    },
  }
);

const parsed = await parse(['--config', 'github.json']);
expect(parsed.username).toBe('eegli');
expect(parsed.hasGitHubPlus).toBe(false);
```
