# Advanced Example

Here's a full example on how you could build a minimal command line interface with Tinyparse. We're building a small CLI tool does various file operations. The tool supports various (optional) subcommands. Make sure your `package.json`'s `type` field is set to `module` or convert the `import` to a `require` statement.

Here are some ways in which you could run the CLI

```sh
node cli.js status
node cli.js cp src dest -v
node cli.js rm file1 file2 file3 file4 --ext js,ts
node cli.js unknown
node cli.js help
node cli.js
```

In this example, the default handler throws a `ValidationError` to be caught by the error handler. The error handler can then print the error as well as the usage information. This is the pattern to follow when you require that a subcommand is always specified.

```ts
// filename: cli.ts

import {
  CommandHandler,
  ErrorHandler,
  GlobalSetter,
  Parser,
  ValidationError,
} from '@eegli/tinyparse';

type Options = typeof options;

// Define the flag options
const options = new Parser()
  .option('verbose', {
    longFlag: '--verbose',
    shortFlag: '-v',
    defaultValue: false,
    description: 'Show more information about the operation',
  })
  .option('extensions', {
    longFlag: '--ext',
    defaultValue: '',
    description: 'Comma-separated list of file extensions to include',
  });

// Define all subcommands
const copy: CommandHandler<Options, [string, string]> = ({ args }) => {
  const [from, to] = args;
  console.log(`Copying files from ${from} to ${to}`);
};

const remove: CommandHandler<Options> = ({ args: files, globals }) => {
  const { extensions } = globals;
  console.log(`Removing files ${files} if they have extension ${extensions}`);
};

const status: CommandHandler<Options> = ({ globals }) => {
  const { userName } = globals;
  console.log(`Showing status for user: ${userName}`);
};

// Define handlers and setters
const handleError: ErrorHandler = (error, usage) => {
  console.error(`Error parsing arguments. ${error.message}`);
  console.log(usage);
};

const handleDefault: CommandHandler<Options> = ({ args, globals, options }) => {
  throw new ValidationError('No command specified'); // Redirect to error handler
};

const setGlobals: GlobalSetter<Options> = (options) => {
  return {
    userName: 'me',
    extensions: options.extensions.split(','),
  };
};

// Bring it all together
const parser = options
  .setMeta({
    appName: 'my-cli',
    summary: 'Work with files and folders',
    help: {
      command: 'help',
      longFlag: '--help',
      shortFlag: '-h',
    },
    version: {
      command: 'version',
      version: '1.0.0',
      longFlag: '--version',
      shortFlag: '-V',
    },
  })
  .setGlobals(setGlobals)
  .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'] as const,
    description: 'Copy files from one folder to another',
  })
  .subcommand('rm', {
    handler: remove,
    args: 'files',
  })
  .subcommand('status', {
    handler: status,
    args: [] as const,
    description: 'Show the status of the repository',
  })
  .onError(handleError)
  .defaultHandler(handleDefault);

export const run = (args: string[]) => {
  parser.parse(args).call();
};

run(process.argv.slice(2));
```
