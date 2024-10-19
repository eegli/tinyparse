# Help and Metadata

> This document describes how **help and meta options** can be configured.

All good CLI apps have some way of providing help to the user. Tinyparse is no different. You can register usage information and tokens that, when present in the input, will trigger the help text to be printed to the console .

You can register which a subcommand and flags trigger the help text and other metadata with the `.meta()` method. You need to do this _manually_. If you do not specify a help command or help flags, Tinyparse will not assume them for you.

```ts
import { Parser } from '@eegli/tinyparse';

const parser = new Parser()
  .meta({
    command: 'my-cli',
    summary: 'A brief description of my-cli',
    help: {
      command: 'help',
      longFlag: '--help',
      shortFlag: '-h',
    },
    version: {
      version: '1.0.0',
      longFlag: '--version',
      shortFlag: '-V',
    },
  })
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
    description: 'Enable verbose mode',
  })
  .option('outdir', {
    longFlag: '--out',
    defaultValue: '',
    required: true,
    description: 'Output directory',
  })
  .subcommand('fetch', {
    args: ['url'] as const,
    handler: () => {},
    description: 'Fetch a URL and save the html',
  })
  .subparser('afetch', {
    parser: new Parser().defaultHandler(),
    description: 'Fetch a URL with more options',
  })
  .defaultHandler()
  .parse(['help'])
  .call();
```

This will print the following to the console:

```sh
A brief description of my-cli

Usage: my-cli [command?] <...flags>

Commands
  afetch        Fetch a URL with more options
  fetch <url>   Fetch a URL and save the html
  help          Print this help message

Required flags
  --out [string]            Output directory

Optional flags
  -v, --verbose [boolean]   Enable verbose mode
  -h, --help                Print this help message
  -V, --version             Print the version
```

When you set your help and metadata configuration, Tinyparse will validate the arguments to make sure there are no conflicts with existing flags or subcommands. Note that subsequent calls to `.meta()` will overwrite the previous configuration.
