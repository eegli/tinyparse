# CLI Arguments

### Glossary and support

Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained#short-flag).

Tinyparse allows both **positional arguments** and **long or short flags**, which start with a hyphen (`-`). A valid flag-value pair consists of a flag followed by the flag value, separated by a whitespace. The order of flag + arg pairs does not matter.

All arguments until the first flag are considered positional arguments. Later "positional" arguments that follow a flag value are ignored (see example below).

**Positional arguments are _not_ validated, they are purely collected.**

| Example                       | Abstract format                     | Support |
| ----------------------------- | ----------------------------------- | ------- |
| `run-cli src/app`             | `[command] [arg]`                   | ✅      |
| `run-cli --directory src/app` | `[command] [long flag] [flag arg]`  | ✅      |
| `run-cli -d src/app`          | `[command] [short flag] [flag arg]` | ✅      |
| `run-cli --verbose`           | `[command] [boolean long flag]`     | ✅      |
| `run-cli -v `                 | `[command] [boolean short flag]`    | ✅      |

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
