# Advanced Example

Here's a full example on how you could build a minimal command line interface with Tinyparse. We're building a small CLI tool does various file operations. The tool supports various (optional) subcommands. Make sure your `package.json`'s `type` field is set to `module` or convert the `import` to a `require` statement.

Here are some ways in which you could run the CLI

```sh
node cli.js status
node cli.js cp src dest -v
node cli.js rm file1 file2 file3 file4 --ext js,ts
node cli.js ls
node cli.js ls /my-folder/images
node cli.js cut
node cli.js help
node cli.js
```

```ts
// filename: cli.ts

import {
  CommandHandler,
  ErrorHandler,
  GlobalSetter,
  Parser,
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

const list: CommandHandler<Options> = ({ args }) => {
  // We may or may not have a directory
  const directory = args[0];
  if (directory) {
    console.log(`Listing files in ${directory}`);
  } else {
    console.log('Listing files in the current directory');
  }
};

// Define handlers and setters
const handleError: ErrorHandler = (error, usage) => {
  console.error('Error: ' + error.message);
  console.log(usage);
};

const handleDefault: CommandHandler<Options> = ({
  args,
  globals,
  options,
  usage,
}) => {
  const cmd = args[0];
  const errorMessage = cmd ? `Unknown command: ${cmd}` : 'No command specified';
  console.error(errorMessage);
  console.log(usage);
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
    command: 'my-cli',
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
  .subcommand('status', {
    handler: status,
    args: [] as const,
    description: 'Show the status of the repository',
  })
  .subcommand('rm', {
    handler: remove,
    args: 'files',
  })
  .subcommand('ls', {
    handler: list,
    args: undefined,
    description: 'List files in a directory',
  })
  .onError(handleError)
  .defaultHandler(handleDefault);

export const run = (args: string[]) => {
  parser.parse(args).call();
};

run(process.argv.slice(2));
```
