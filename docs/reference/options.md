# Options

> This document describes how **options** (in the form of flags) can be used to configure the parser.

When you create a parser, you can add as many options as you like by calling `.option()` over and over again. When you specify an option, you must at least provide a long flag starting with `--` and a default value. The default value is used _(1)_ to infer the type of the option and _(2)_ as a fallback/default value if the option is not present in the user input.

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser()
  .option('foo', {
    longFlag: '--foo',
    shortFlag: '-f',
    defaultValue: 0,
    required: true,
    oneOf: [0, 1],
    description: 'Foo option',
  })
  .defaultHandler();
```

- `shortFlag` is the short flag _alias_ that will match the option. It must start with `-`
- `defaultValue` is used as a fallback and to infer the _type_ of the option. To make this possible, it can only be of **four easily checkable types**: `string`, `number`, `boolean` or `Date`
- `required` indicates whether the option is required or not. If it is required, `defaultValue` will be overwritten (or an error is thrown if it is not present in the user input, see [validation](#validation))
- `oneOf` allows you to constrain the user input to a set of allowed values - see more below
- `description` is used to generate the usage text

If and only if the _expected value_ (i.e., `defaultValue`) for a flag is a _number_ or valid Javascript _date string_, Tinyparse will try to convert it accordingly.

### Validation

Parsing will fail if either a required option is not present or the expected type does not match the input value (here, a string that can be parsed to a number):

```ts
// Throws: 'Missing required option --foo'
parser.parse([]).call();

// Throws: "Invalid type for --foo. 'zero' is not a valid number"
parser.parse(['--foo', 'zero']).call();

// Ok - "1" can be parsed as a number
parser.parse(['--foo', '1']).call();
```

Furthermore, _building_ a parser will fail if you declare the same option or a flag twice. This also holds for any unique identifier (such as a subcommand or subparser).

See the docs about [error handling](reference/error-handling.md) for more.

### Boolean Options

If the default value of an option is a boolean, two special rules apply:

- No flag argument to a boolean flag indicates `true`
- If the flag argument is either the literal string `true` or `false`, it will be parsed accordingly

The following are all valid ways to set a boolean option:

```ts
const parser = new Parser()
  .option('foo', {
    longFlag: '--foo',
    defaultValue: true,
    required: true,
  })
  .defaultHandler();

const inputs: string[][] = [
  ['--foo'], // true
  ['--foo=true'], // true
  ['--foo', 'true'], // true
  ['--foo=false'], // false
  ['--foo', 'false'], // false
];
```

### Methods

- **Default option values** - i.e., the values you specify when you setup the parser - can be accessed via the `options` getter method:

```ts
new Parser()
  .option('foo', {
    longFlag: '--foo',
    defaultValue: 'abc',
  })
  .defaultHandler().options; // { foo: "abc" }
```

## Constraining Option Values

There are many scenarios in which you'd like the user to provide a value from a set of _allowed values_. Consider the following example with an `--output` option that lets the user choose an output format. By setting the `oneOf` property, you can constrain the user input to a set of allowed values. This only has an effect when the default value is a `string` or `number`. Tinyparse is smart enough to have TypeScript infer that `options.output` is either `'json'` or `'yaml'`:

```ts
const parser = new Parser()
  .option('output', {
    longFlag: '--output',
    defaultValue: 'json',
    oneOf: ['yaml'],
  })
  .defaultHandler(({ options }) => {
    // Type: "json" | "yaml"
    console.log(options.output);
  });
```

With this approach, the parser will throw an error if the user provides an output format that does not equal the string literals `'json'` (the default) or `'yaml'`:

```ts
// Throws: Invalid value "csv" for option --output, expected one of: json, yaml
parser.parse(['--output', 'csv']).call();
```

It's important to know that **parsing works differently if an option is required** and `oneOf` is set!

- If the option is _optional_, the default value is considered one of the allowed values, as shown above. Type inference also accounts for this
- If the option is _required_, the default value is guaranteed to be overwritten. Hence, only the manually provided values via `oneOf` are allowed!

In the below example, `--output` can only equal `'yaml'`. TypeScript will infer the type of `options.output` to be `'yaml'`:

```ts
new Parser()
  .option('output', {
    longFlag: '--output',
    defaultValue: 'json',
    required: true,
    oneOf: ['yaml'],
  })
  .defaultHandler(({ options }) => {
    // Type: "yaml"
    console.log(options.output);
  })
  .parse(['--output', 'json'])
  .call();

// Throws: Invalid value "json" for option --output, expected one of: yaml
```

## Good to know

- **`-` is a reserved prefix**. Any string that starts with `-` will be treated as an option/flag. Flag arguments such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- **Later arguments will overwrite earlier arguments**. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`
- Short flags are expected to be single letters, i.e., `"-f"` but not `"-foo"`. This is not enforced, but it is a good practice to follow

Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags).
