# Subcommands and Positional Arguments

By default, Tinyparse simply collects all positional arguments in an array on the `_` property. You can put additional constraints on positional arguments, which essentially turns them into **subcommands**.

There are **three types of patterns** you can specify for subcommands, i.e., their arguments.

- `[arg1, arg2, ...argn]`: A fixed number of arguments (array of strings)
- `[]`: No arguments (empty array)
- `args`: Any number of arguments (a string)

One of the biggest advantages of using Tinyparse (together with TypeScript) is that it will **infer the number of subcommand arguments** for you based on the subcommand's pattern. Before we look at an example, it is important to note a few things:

- The types of all subcommand _arguments_ (`arg1`, etc.) are not validated. They will all be of type `string` because that is exactly what `stdin` gives us
- If there is no positional argument at all, nothing happens because subcommands are considered optional
- Only if there is _at least one positional argument_ and _at least one subcommand_ that you specify, subcommands are checked for

## Examples

In the following example, we are building a CLI that allows the user to perform various file system operations. Each key in the `commands` object is a subcommand. The `args` property specifies the pattern of the subcommand's arguments, and the string literals are used in the help text to describe the arguments. The `description` property is optional and will be used to describe the subcommand in the help text.

<!-- doctest: cli arguments, command arguments advanced -->

```ts
import { createParser } from '@eegli/tinyparse';

const { parseSync } = createParser(
  {},
  {
    commands: {
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

**Patterns work as follows**:

- `[]` - No arguments - In this case, the subcommand will not accept any arguments
- `['src', 'dest']` - Fixed number of arguments - In this case, the subcommand will accept exactly two arguments
- `'files'` - Any number of arguments - In this case, the subcommand will accept any number of arguments

Here are some valid examples for the above configuration. If any subcommands are specified and the **first** positional argument matches a subcommand, the pattern will be enforced.

```ts
let positionals = parseSync([])._; // No subcommand, no problemo
expect(positionals).toStrictEqual([]);

positionals = parseSync(['status'])._;
expect(positionals).toStrictEqual(['status']);

positionals = parseSync(['copy', 'src', 'dest'])._;
expect(positionals).toStrictEqual(['copy', 'src', 'dest']);

positionals = parseSync(['remove', 'file1', 'file2', 'file3'])._;
expect(positionals).toStrictEqual(['remove', 'file1', 'file2', 'file3']);
```

If the pattern is not matched, an error will be thrown, either for an invalid subcommand or for an invalid number of arguments.

```ts
expect(() => {
  parseSync(['cd', 'my-app']);
}).toThrow("Unknown command 'cd'");

expect(() => {
  parseSync(['copy', 'src']);
}).toThrow("Invalid usage of command 'copy'. Too few arguments");

expect(() => {
  parseSync(['status', 'noooop']);
}).toThrow("Invalid usage of command 'status'. Too many arguments");
```

Tinyparse is not opinionated about errors, it throws an ugly error by default. However, you can easily catch it, extract the message and show it to the user. See the [advanced example](/examples.md).

**Type-safety**: Notice the `as const` in the above code? It is only relevant for TypeScript users. It is used to make sure that the `commands` object is not widened. It allows us to correctly infer the number of arguments for each subcommand. You could use it in a switch statement and get complete type-safety 🥰. See the [advanced example](/examples.md).

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

const subcommand2 = createParser(
  {},
  {
    commands: {
      cmd: {
        args: [], // 0 arguments
      },
    } as const,
  },
).parseSync()._;
expectType<['cmd']>(subcommand2);

const subcommand3 = createParser(
  {},
  {
    commands: {
      cmd: {
        args: 'args', // any number of arguments
      },
    } as const,
  },
).parseSync()._;
expectType<['cmd', ...string[]]>(subcommand3);
```
