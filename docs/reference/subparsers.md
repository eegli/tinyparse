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

## Adding a Subparser with Shared Options

By default - as mentioned above - a subparser acts in complete isolation and does not inherit any options from the parent. _Shared_ or _global_ options can still be achieved but they require a few manual type annotations. In the following example, we have a main and a subparser. They share the `--verbose` option.

1. First, let's define a function to create the shared options. Because parsers are generic, we need to explicitly annotate that the returned parser has the `verbose` option:

```ts
type CommonOptions = {
  verbose: boolean;
};

const withCommonOptions = <O, G>(
  parser: Parser<O, G>,
): Parser<O & CommonOptions, G> => {
  return parser.option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
  });
};
```

2. Next, we can create the main and subparser. Both are created with the shared options. Although not shown, each parser can of course have its own options:

```ts
const subparser = withCommonOptions(new Parser()).defaultHandler(
  ({ options }) => {
    console.log(`[subparser] Verbose mode: ${options.verbose}`);
  },
);

const parser = withCommonOptions(new Parser())
  .subparser('v2', {
    parser: subparser,
    description: 'Version 2 of this CLI',
  })
  .defaultHandler(({ options }) => {
    console.log(`[main parser] Verbose mode: ${options.verbose}`);
  });
```

If we append `v2` to the arguments, the subparser will be called. If the first positional argument (here, `v2`) identifies a subparser, then only the subparser will be in charge of validating and parsing all further arguments. The main parser simply delegates the call to the subparser:

```ts
// [main parser] Verbose mode: true
parser.parse(['-v']).call();

// [subparser] Verbose mode: true
parser.parse(['v2', '-v']).call();
```

As you might have guessed by now, this example method of sharing global options is merely a way to **reduce code duplication**. Our goal was to have to define the `--verbose` option only once and use it in both the main and subparser.

## Caveats

Subparsers are a bit more complex to setup and, by default, cannot access their parent parser's options. It is still possible, though, and in some scenarios a small price to pay for the added flexibility and control over your app's structure.
