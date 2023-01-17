# CLI Arguments

> Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained) with inspiration from [CLI Guidelines](https://clig.dev/).

Tinyparse:

- Collects **command arguments**
- Parses and validates **long and short flag arguments**

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

## Parsing Behavior

- **`-` is a reserved prefix**. Any string that starts with `-` will be treated as a flag and not a flag argument. Flag arguments such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- **Later arguments will overwrite earlier arguments**. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`

Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags).

### Positional (Command) Arguments

When given an array of strings, Tinyparse will collect all positional/command arguments on the `_` property. When given no default values (here, an empty object `{}`), the parser simply acts as a collector (positional arguments are of course also collected when the default values are not empty).

<!-- doctest: positional arguments -->

```ts
const { parse } = createParser({});
const parsed = await parse(['hello-world']);
expect(parsed).toStrictEqual({ _: ['hello-world'] });
```

### Boolean Flags

Standalone flags are considered **booleans flags**. If they are encountered, their value will be set to `true`. This means that it is _not_ possible to set something to `false` via a flag.

Tinyparse is opinionated about default values. It assumes that any option that can be set by a flag is `false` by default but can be set to `true`.

<!-- doctest: boolean flags 1 -->

```ts
const { parse } = createParser({
  verbose: false,
});
const parsed = await parse(['--verbose']);
expect(parsed.verbose).toBe(true);
```

Here, nothing changes:

<!-- doctest: boolean flags 2 -->

```ts
const { parse } = createParser({
  verbose: true,
});
const parsed = await parse(['--verbose']);
expect(parsed.verbose).toBe(true);
```

### Numeric Conversion

If and only if the _expected value_ for a flag is a number, tinyparse will try to convert it accordingly.

<!-- doctest: number conversion -->

```ts
const { parse } = createParser({
  followers: 0, // expect number
  year: '2000', // expect (date) string
});
const parsed = await parse(['--followers', '8', '--year', '2023']);
expect(parsed.followers).toBe(8);
expect(parsed.year).toBe('2023');
```