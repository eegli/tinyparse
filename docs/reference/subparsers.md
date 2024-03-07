# Subparsers

> This document specifies how **subparsers** can be added to a parser to create nested commands.

Subparsers can be seen as an _extension_ to subcommands. Although they behave and are used similarly, there are a few key differences:

| Feature              | Subcommands    | Subparsers                         |
| -------------------- | -------------- | ---------------------------------- |
| **Parent options**   | Can access     | Can only access local options      |
| **Parent globals**   | Can access     | Can only access local globals      |
| **Help and version** | Cannot specify | Can specify local help and version |
| **Configuration**    | More simple    | More complex                       |

<sub>\*_Global_ refers to the parent parser, _local_ to the subparser.</sub>

Hence, if your app is rather complex and you want to have per-subcommand options (such as a dedicated help and options local to the subcommand), you should use a **subparser** rather than a subcommand. Note that both subcommands and subparsers are defined via a keyword and can live in the same parent parser. Subparsers can be nested arbitrarily deep.

## Adding a Subparser

In the following example, we have a main and a subparser. The only difference between them is the version:

```ts
const subparser = new Parser()
  .option('greeting', {
    longFlag: '--greeting',
    shortFlag: '-g',
    defaultValue: '',
  })
  .defaultHandler(({ options }) => {
    console.log(options.greeting);
  });

const parser = new Parser()
  .option('greeting', {
    longFlag: '--greeting',
    shortFlag: '-g',
    defaultValue: '',
  })
  .subparser('v2', {
    parser: subparser,
    description: 'Version 2 of this CLI',
  })
  .defaultHandler(({ options }) => {
    console.log(options.greeting);
  });
```

If we append `v2` to the arguments, the subparser will be called. If the first positional argument (here, `v2`) identifies a subparser, then only the subparser will be in charge of validating and parsing all further arguments. The main parser simply delegates the call to the subparser:

```ts
// hello from the main parser
parser.parse(['-g', 'hello from the main parser']).call();
// hello from the subparser
parser.parse(['v2', '-g', 'hello from the subparser']).call();
```

## Caveats

Subparsers are a bit more complex to setup and cannot access their parent parser's options (see table above). Hence, you might need to setup globals repeatedly for each parser and have some duplicated code here and there. However, this is a small price to pay for the added flexibility and control over your app's structure.
