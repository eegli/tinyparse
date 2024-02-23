/* eslint-disable @typescript-eslint/no-unused-vars */

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
