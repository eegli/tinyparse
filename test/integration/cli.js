/* eslint-disable @typescript-eslint/no-unused-vars */
// filename: cli.ts
import { Parser, ValidationError, } from '@eegli/tinyparse';
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
const copy = ({ args }) => {
    const [from, to] = args;
    console.log(`Copying files from ${from} to ${to}`);
};
const remove = ({ args: files, globals }) => {
    const { extensions } = globals;
    console.log(`Removing files ${files} if they have extension ${extensions}`);
};
const status = ({ globals }) => {
    const { userName } = globals;
    console.log(`Showing status for user: ${userName}`);
};
// Define handlers and setters
const handleError = (error, usage) => {
    console.error(`Error parsing arguments. ${error.message}`);
    console.log(usage);
};
const handleDefault = ({ args, globals, options }) => {
    throw new ValidationError('No command specified'); // Redirect to error handler
};
const setGlobals = (options) => {
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
    args: ['from', 'to'],
    description: 'Copy files from one folder to another',
})
    .subcommand('rm', {
    handler: remove,
    args: 'files',
})
    .subcommand('status', {
    handler: status,
    args: [],
    description: 'Show the status of the repository',
})
    .defaultHandler(handleDefault);
export const run = (args) => {
    parser.parse(args, handleError).call();
};
run(process.argv.slice(2));
