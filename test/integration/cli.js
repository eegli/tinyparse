// filename: cli.js
import { Parser } from '@eegli/tinyparse';
export const copy = ({ args }) => {
    const [from, to] = args;
    console.log(`Copying files from ${from} to ${to}`);
};
export const list = ({ args, globals }) => {
    const [folder] = args;
    const { extensions } = globals;
    console.log(`Listing files in ${folder} with extension ${extensions.join(' or ')}`);
};
export const remove = ({ args }) => {
    console.log(`Removing files ${args}`);
};
export const status = ({ globals }) => {
    const { userName } = globals;
    console.log(`Showing status for user: ${userName}`);
};
export const handleError = (error, args) => {
    console.error(`Error parsing arguments. Received: ${args}. ${error.message}`);
};
export const handleDefault = ({ args, globals, options, }) => {
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
        logger: options.verbose ? console.log : () => { },
        userName: 'me',
        extensions: options.extensions.split(','),
    };
});
const parser = commands
    .subcommand('cp', {
    handler: copy,
    args: ['from', 'to'],
    description: 'Copy files from one folder to another',
})
    .subcommand('ls', {
    handler: list,
    args: ['folder'],
    description: 'List files in a folder',
})
    .subcommand('rm', {
    handler: remove,
    args: '...files',
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
// run(process.argv.slice(2));
