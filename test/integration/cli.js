// filename: cli.ts
import { Parser } from '@eegli/tinyparse';
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
const handleError = (error, args) => {
    console.error(`Error parsing arguments. ${error.message}`);
};
const handleDefault = ({ args, globals, options }) => {
    console.log('No command specified');
    console.info({ options, args, globals });
};
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
})
    .setGlobals((options) => {
    return {
        userName: 'me',
        extensions: options.extensions.split(','),
    };
});
const parser = options
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
