# Options

> This document describes how **options** (in the form of flags) can be used to configure the parser.

When you create a parser, you can add as many options as you like by calling `.option()` over and over again. When you specify an option, you must at least provide a long flag starting with `--` and a default value as a fallback and to infer the type of the option.

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser()
  .option('foo', {
    longFlag: '--foo',
    shortFlag: '-f',
    defaultValue: 0,
    required: true,
    description: 'Foo option',
  })
  .defaultHandler();
```

- `shortFlag` is the short flag _alias_ that will match the option
- `defaultValue` is used to _infer_ the type of the option. To make this possible, it can only be of **four easily checkable types**: `string`, `number`, `boolean` or `Date`
- `required` indicates whether the option is required or not
- `description` is used to generate the help text

If and only if the _expected value_ (i.e., `defaultValue`) for a flag is a number or valid Javascript date string, Tinyparse will try to convert it accordingly.

## Validation

Parsing will fail if either a required option is not present or the expected type does not match the input value (here, a string that can be parsed to a number):

```ts
expect(() => {
  parser.parse([]).call();
}).toThrow('Missing required option --foo');

expect(() => {
  parser.parse(['--foo', 'zero']).call();
}).toThrow("Invalid type for --foo. 'zero' is not a valid number");

expect(() => {
  parser.parse(['--foo', '12']).call();
}).not.toThrow();
```

Furthermore, _building_ a parser will fail if you declare the same option or a flag twice. This also holds for any unique identifier (such as a subcommand or subparser).

See the docs about [error handling](reference/error-handling.md) for more.

## Boolean Options

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
  ['--foo'],
  ['--foo=true'],
  ['--foo', 'true'],
  ['--foo=false'],
  ['--foo', 'false'],
];
for (const input of inputs) {
  expect(() => {
    parser.parse(input).call();
  }).not.toThrow();
}
```

## Good to know

- **`-` is a reserved prefix**. Any string that starts with `-` will be treated as a flag. Flag arguments such as `["--password", "-x8ap!"]` should be wrapped in quotes!
- **Later arguments will overwrite earlier arguments**. `["--password", "abc", "--password", "xyz"]` will parse to `password: "xyz"`

Remember that it's never a good idea to read secrets directly from flags. [Read them from a file instead](https://clig.dev/#arguments-and-flags).
