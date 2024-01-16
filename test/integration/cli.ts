// filename: cli.js

import { CommandHandler, ErrorHandler, Parser } from '@eegli/tinyparse';

type Commands = typeof commands;

export const copy: CommandHandler<Commands, [string, string]> = ({ args }) => {
  const [from, to] = args;
  console.log(`Copying files from ${from} to ${to}`);
};

export const list: CommandHandler<Commands, [string]> = ({ args, globals }) => {
  const [folder] = args;
  const { extensions } = globals;
  console.log(
    `Listing files in ${folder} with extension ${extensions.join(' or ')}`,
  );
};

export const remove: CommandHandler<Commands> = ({ args }) => {
  console.log(`Removing files ${args}`);
};

export const status: CommandHandler<Commands> = ({ globals }) => {
  const { userName } = globals;
  console.log(`Showing status for user: ${userName}`);
};

export const handleError: ErrorHandler = (error, args) => {
  console.error(`Error parsing arguments. Received: ${args}. ${error.message}`);
};

export const handleDefault: CommandHandler<Commands> = ({
  args,
  globals,
  options,
}) => {
  console.info({ options, args, globals });
};

const commands = new Parser()
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
  })
  .globals((options) => {
    return {
      logger: options.verbose ? console.log : () => {},
      userName: 'me',
      extensions: options.extensions.split(','),
    };
  });

const parser = commands
  .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'] as const,
    description: 'Copy files from one folder to another',
  })
  .subcommand('ls', {
    handler: list,
    args: ['folder'] as const,
    description: 'List files in a folder',
  })
  .subcommand('rm', {
    handler: remove,
    args: '...files',
  })
  .subcommand('status', {
    handler: status,
    args: [] as const,
    description: 'Show the status of the repository',
  })
  .defaultHandler(handleDefault);

export const run = (args: string[]) => {
  parser.parse(args, handleError).call();
};

// run(process.argv.slice(2));
