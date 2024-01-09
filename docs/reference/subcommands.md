# Subcommands and Positional Arguments

Tinyparse simply collects all positional arguments in an array on the `_` property. You can put additional constraints on positional arguments, which essentially turns them into **subcommands**. For each subcommand, you can specify how many arguments it takes via a pattern.

There are **three types of argument length patterns** you can specify for a subcommand:

- `[arg1, arg2, ...argn]`: A fixed number of arguments (array of strings)
- `[]`: No arguments (empty array)
- `args`: Any number of arguments (a string)

If the number of provided arguments does not match the pattern, an error will be thrown.

> One of the biggest advantages of using Tinyparse (together with TypeScript) is that it will **infer the number of subcommand arguments** for you based on the subcommand's pattern

**Good to know**

- The types of all subcommand _arguments_ (`arg1`, etc.) are not validated. They will all be of type `string` because that is exactly what `stdin` gives us
- If there is _no positional argument_ that matches a subcommand, nothing happens because subcommands are considered optional
- Using subcommands is completely optional. If you want to, simply use the collected positionals and do all the validation yourself
- Using subcommands can be helpful if you want validated and type-safe subcommands as well as a neatly-formatted help text

## Examples

In the following example, we are building a CLI that allows the user to perform various file system operations. Each key in the `subcommands` object is a subcommand. The `args` property specifies the pattern of the subcommand's arguments, and the string literals are used in the help text to describe the arguments. The `description` property is optional and will be used to describe the subcommand in the help text.

<!-- doctest: cli arguments, command arguments advanced -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {},
  {
    subcommands: {
      status: {
        args: [],
        description: 'Show status',
      },
      copy: {
        args: ['src', 'dest'],
        description: 'Copy files from source to destination',
      },
      remove: {
        args: 'files',
        description: 'Remove multiple files',
      },
    } as const,
  },
);
```

### Pattern Matching

- `status` expects no arguments
- `copy` expects two arguments, `src` and `dest`
- `remove` expects any number of arguments from 0 to n

It is important to note that **unknown subcommands fall through**. This means that if a subcommand is not specified in the `subcommands` object, it (and its subsequent arguments) will be collected in the `positionals` array. If you require that at least one subcommand is called, you need to handle unknown arguments yourself (e.g., via a `default` case in a `switch` statement). See the [advanced example](/advanced-example.md).

```ts
let positionals = parseSync([])._; // No subcommand, no problemo
expect(positionals).toStrictEqual([]);

positionals = parseSync(['unknown'])._; // Unknown subcommands fall through
expect(positionals).toStrictEqual(['unknown']);

positionals = parseSync(['status'])._;
expect(positionals).toStrictEqual(['status']);

positionals = parseSync(['copy', 'src', 'dest'])._;
expect(positionals).toStrictEqual(['copy', 'src', 'dest']);

positionals = parseSync(['remove', 'file1', 'file2', 'file3'])._;
expect(positionals).toStrictEqual(['remove', 'file1', 'file2', 'file3']);
```

If the argument pattern is not matched, an error will be thrown.

```ts
expect(() => {
  parseSync(['copy', 'src']);
}).toThrow("Invalid usage of command 'copy'. Too few arguments");

expect(() => {
  parseSync(['status', 'noooop']);
}).toThrow("Invalid usage of command 'status'. Too many arguments");
```

### Type-safety

Notice the `as const` in the above code? It is only relevant for TypeScript users. It is used to make sure that the `commands` object is not widened. It allows us to correctly infer the number of arguments for each subcommand. You could use it in a switch statement and get complete type-safety 🥰. See the [advanced example](/advanced-example.md). Since

```ts
const subcommand = createParser(
  {},
  {
    commands: {
      cmd: {
        args: ['arg1', 'arg2'], // 2 arguments
      },
    } as const,
  },
).parseSync()._;
expectType<['cmd', string, string]>(subcommand);
```

Likewise, if we'd specify:

- `args: []`: `['cmd']`
- `args: ''`: `['cmd', ...string[]]`
