# Short Flags

Optionally, **short flags** can be specified for each argument. Short flags are expected to start with "`-`".

```ts
import { createParser } from '@eegli/tinyparse';
import assert from 'node:assert/strict';

const { parse } = createParser(
  {
    name: '',
    hasGithubProfile: false,
    hasGithubPlus: true,
    followerCount: 0,
    birthYear: '',
  },
  {
    options: {
      followerCount: {
        shortFlag: '-fc',
      },
    },
  }
);
const parsed = await parse([
  'congratulate', // Positional argument
  '--name',
  '"Eric Egli"', // Value with spaces
  '--hasGithubProfile', // Boolean flag
  '--hasGithubPlus',
  '-fc', // Short flag
  '10', // Will be parsed as number
  'ignoredProperty', // This property is ignored
  '--birthYear',
  '2018', // Will remain a string
]);

assert.deepStrictEqual(parsed, {
  _: ['congratulate'],
  name: '"Eric Egli"',
  hasGithubPlus: true,
  hasGithubProfile: true,
  followerCount: 10,
  birthYear: '2018',
});
```

Notice how:

- Since `hasGithubPlus` was already true, the boolean flag did not change that. Such a default configuration does not make much sense.
- If the _expected value_ for a flag is a number, tinyparse will try to parse it accordingly (see `--followerCount` / `-fc`). This only applies if the object to be parsed is an array of strings.
- Altough we could parse the value for `--birthYear` to a number (`2018`), it is kept as a string since that is what's expected with the given default value (`{ birthYear: '' }`)

### Good to know when parsing strings

- `-` is a reserved prefix. Any string that starts with `-` will be treated as a flag and not a flag value. Flag values such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- Later values will overwrite earlier values. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`
- Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags)
