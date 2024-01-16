# CLI Arguments

> Definitions from [CLI Flags Explained](https://oclif.io/blog/2019/02/20/cli-flags-explained) with inspiration from [CLI Guidelines](https://clig.dev/).

Tinyparse:

- Matches **subcommands and their positional arguments**
- Parses and validates **long and short flag options**

All arguments until the first flag are considered **subcommands** (and their arguments), that is, they are _positional_ arguments. After positional arguments - if there are any - **options** (also called _flags_) may follow. Flags are always global. Long flags start with two hyphens (`--`), short flags with a single hyphen (`-`). A valid _flag-argument_ pair consists of a _flag_ followed by the _flag argument_, separated by a whitespace or equal sign. Whereas the order _does_ matter for positonal arguments, it does _not_ matter for flags.

| Example            | Abstract format                                        | Support |
| ------------------ | ------------------------------------------------------ | ------- |
| `status`           | `[subcommand]`                                         | ✅      |
| `clone git@github` | `[subcommand] [subcommand arg]`                        | ✅      |
| `commit -m "wip"`  | `[subcommand] [subcommand arg] [long flag] [flag arg]` | ✅      |
| `log -n 5`         | `[subcommand] [short flag] [flag arg]`                 | ✅      |

The table above depicts a few common ways of how arguments can be passed to a CLI using git as an example. Tinyparse supports all of them as well as arbitrary combinations. **Everything from subcommands to flags is completely optional**. You can build a CLI that only takes positional arguments, only flags, or a mix of both.

## Positional Arguments Parsing

- Positional arguments are matched for a _possible_ subcommand that you specify. If a subcommand is found, the parser will assert that the expected _length_ of the expected arguments to the subcommand is met
- Tinyparse supports **first-level subcommands**. That is, subcommands can only be specified at the first level of the argument array. Subcommands cannot be nested

By default, Tinyparse will collect all positional/command arguments on the `_` property.

<!-- doctest: command arguments -->

```ts
const { parseSync } = createParser({});
const positionals = parseSync(['hello-world'])._;
expect(positionals).toStrictEqual(['hello-world']);
```

This is the basic behavior when no subcommands are specified. See [Subcommands](reference/subcommands.md) for more information.

## Flag Parsing

- Flags can only be of three primitive types: `string`, `number` and `boolean`, further referred to as `FlagValue`.
- **`-` is a reserved prefix**. Any string that starts with `-` will be treated as a flag. Flag arguments such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- **Later arguments will overwrite earlier arguments**. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`

Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags).

### Providing Defaults

By default, the parser will try to find a matching key for each flag in the input flags. If it can't find one, it will fall back to the default values it was initially provided with. An error for missing input is only thrown if the property is set as [`required`](reference/required-arguments.md)

<!-- doctest: flag arguments -->

```ts
const { parse } = createParser({ hello: 'world' });
let parsed = await parse();
expect(parsed).toStrictEqual({ _: [], hello: 'world' });

parsed = await parse(['--hello', 'john']);
expect(parsed).toStrictEqual({ _: [], hello: 'john' });
```

### Boolean Flags

Standalone flags are considered **booleans flags**. If they are encountered, their value will be set to `true`. This means that it is _not_ possible to set something to `false` via a flag.

Tinyparse is opinionated about default values. It assumes that any boolean option that can be set by a flag is `false` by default but can be set to `true`.

<!-- doctest: boolean flags 1 -->

```ts
const { parse } = createParser({ verbose: false });
const parsed = await parse(['--verbose']);
expect(parsed.verbose).toBe(true);
```

Here, nothing changes:

<!-- doctest: boolean flags 2 -->

```ts
const { parse } = createParser({ verbose: true });
const parsed = await parse(['--verbose']);
expect(parsed.verbose).toBe(true);
```

### Numeric Conversion

If and only if the _expected value_ for a flag is a number, tinyparse will try to convert it accordingly.

<!-- doctest: number conversion -->

```ts
const { parse } = createParser({
  limit: Infinity, // expect number
  year: '2000', // expect (date) string
});
const parsed = await parse(['--limit', '8', '--year', '2023']);
expect(parsed.limit).toBe(8);
expect(parsed.year).toBe('2023');
```

### Internal Validation

Tinyparse guarantees that it will only work with a valid configration. In very special cases, it may happen that conflicting options are specified. If that is the case, bootstrapping a parser will fail. It is therefore recommended to test the creation of a parser on your end.

This might happen if you declare a short flag twice or if two flags decamelize to the same value. The resulting error message should guide you towards a fix:

<!-- doctest: internal validation -->

```ts
createParser(
  { a: '', b: '' },
  { options: { a: { shortFlag: 'a' }, b: { shortFlag: 'a' } } },
);

// Throws error:
// Parser config validation error, conflicting short flag:
// -a has been declared twice. Check your settings for short flags
```
