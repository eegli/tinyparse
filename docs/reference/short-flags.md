# Short Flags

Optionally, **short flags** can be specified for each argument. Short flags are expected to start with "`-`".

## Examples

```ts
import { createParser } from '@eegli/tinyparse';

const { parse } = createParser(
  {
    user: '',
    verbose: false,
  },
  {
    options: {
      user: {
        shortFlag: '-u',
      },
      verbose: {
        shortFlag: 'v',
      },
    },
  }
);
const parsed = await parse(['-v', '-u', 'eegli']);
expect(parsed.verbose).toEqual(true);
expect(parsed.user).toEqual('eegli');
```
