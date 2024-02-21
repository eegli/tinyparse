# Help

> This document describes how **help options** can be configured.

All good CLI apps have some way of providing help to the user. Tinyparse is no different. You can register usage information and tokens that, when present in the input, will trigger the help text to be printed to the console .

You can register which a subcommand and flags trigger the help text with the `.setHelp()` method:

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser()
  .option('foo', {
    longFlag: '--foo',
    shortFlag: '-f',
    required: true,
    defaultValue: '',
    description: 'Foo option',
  })
  .option('bar', {
    longFlag: '--bar',
    defaultValue: new Date(),
    description: 'Foo option',
  })
  .subcommand('baz', {
    args: ['arg'] as const,
    handler: () => {},
    description: 'Baz command',
  })
  .setHelp({
    appName: 'my-cli',
    summary: 'A brief description of my-cli',
    command: 'help',
    flags: ['--help', '-h'],
  })
  .defaultHandler()
  .parse(['help'])
  .call();
```

This will print the following to the console:

```sh
A brief description of my-cli

Usage: my-cli [command] <...flags>

Commands
   baz <arg>
   - Baz command

Required flags
   -f, --foo [string]
   Foo option

Optional flags
   --bar [date]
   Foo option

To view this help message, run "my-cli help" or add --help or -h to any command
```

When you set your help configuration, Tinyparse will validate the arguments to make sure there are no conflicts with existing flags or subcommands. Note that subsequent calls to `.setHelp()` will overwrite the previous configuration.
