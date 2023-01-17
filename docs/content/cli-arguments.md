# CLI Arguments

> Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained) with inspiration from [CLI Guidelines](https://clig.dev/).

Tinyparse:

- collects **command arguments**
- parses and validates **long and short flags**

All arguments until the first flag are considered _command arguments_, that is, they are _positional_ arguments. Long flags start with two hyphens (`--`), short flags with a single hyphen (`-`). A valid _flag-argument_ pair consists of a _flag_ followed by the _flag argument_, separated by a whitespace. The order of flag-argument pairs does not matter.

- Command arguments are _not_ validated, they are only collected
- Unknown input that is neither a command argument, a flag or flag argument is ignored

| Example                   | Abstract format                     | Support |
| ------------------------- | ----------------------------------- | ------- |
| `run-cli src`             | `[command] [command arg]`           | ✅      |
| `run-cli --directory src` | `[command] [long flag] [flag arg]`  | ✅      |
| `run-cli -d src`          | `[command] [short flag] [flag arg]` | ✅      |
| `run-cli --verbose`       | `[command] [boolean long flag]`     | ✅      |
| `run-cli -v `             | `[command] [boolean short flag]`    | ✅      |

**Standalone flags** are considered booleans flags. If they are encountered, their value will be set to `true`. This means that it is not possible to specify a "falsy" flag. Tinyparse assumes that any option that can be enabled by a flag is `false` by default but can be set to `true`.

Invalid types are also rejected.

```ts
const { parse } = createParser({ username: '' });

try {
  await parse({ username: ['eegli'] }); // This will throw!
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.message); // 'Invalid type for "username". Expected string, got object'
  }
}
```

**Unknown arguments are ignored.**
