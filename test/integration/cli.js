/* eslint-disable @typescript-eslint/no-unused-vars */
// filename: cli.ts
import { Parser, } from '@eegli/tinyparse';
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
const setGlobals = (opts) => {
    return {
        userName: 'me',
        extensions: opts.extensions.split(','),
    };
};
const baseParser = options.setGlobals(setGlobals);
// Define all subcommands
const copy = ({ args }) => {
    const [from, to] = args;
    console.log(`Copying files from ${from} to ${to}`);
};
const remove = ({ args: files, globals, options, }) => {
    const { extensions } = globals;
    console.log(`Removing files ${files} with extension ${extensions}`);
    if (options.verbose)
        console.log('Files to remove: ', files);
};
const status = ({ globals }) => {
    const { userName } = globals;
    console.log(`Showing status for user: ${userName}`);
};
const list = ({ args }) => {
    // We may or may not have a directory
    const directory = args[0];
    if (directory) {
        console.log(`Listing files in ${directory}`);
    }
    else {
        console.log('Listing files in the current directory');
    }
};
// Define handlers and setters
const handleError = ({ error, usage }) => {
    console.error('Error: ' + error.message);
    console.log(usage);
};
const handleDefault = ({ args, globals, options, }) => {
    const cmd = args[0];
    const errorMessage = cmd ? `Unknown command: ${cmd}` : 'No command specified';
    console.error(errorMessage);
};
// Bring it all together
const parser = baseParser
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
    .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'],
    description: 'Copy files from one folder to another',
})
    .subcommand('status', {
    handler: status,
    args: [],
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
export const run = async (args) => {
    await parser.parse(args).call();
};
// run(process.argv.slice(2));
