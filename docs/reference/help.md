# Help

All good CLI apps have some way of providing help to the user. Tinyparse is no different. You can register tokens that, when present in the input, will trigger the help text to be printed to the console.

You can register which subcommands and flags trigger the help text with the `.setHelp()` method:

```ts
new Parser()
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
  .setHelp('help', '--help', '-h')
  .defaultHandler()
  .parse(['help'])
  .call();
```

This will print the following to the console:

```sh
Usage

Available commands
   baz <arg>
   - Baz command

Required flags
   -f, --foo [string]
   Foo option

Optional flags
   --bar [date]
   Foo option
```
