import { CommandArgPattern, FlagRecord, Subcommand } from './types';

export const validateCommandArgs = <
  F extends FlagRecord,
  P extends CommandArgPattern,
>(
  command: string,
  commandOpts: Subcommand<F, P>,
  args: string[],
) => {
  if (Array.isArray(commandOpts.args)) {
    const expectedNumArgs = commandOpts.args.length;
    const actualNumArgs = args.length;

    if (expectedNumArgs !== actualNumArgs) {
      const wording = expectedNumArgs === 1 ? 'argument' : 'arguments';
      throw new Error(
        `${command} expects ${expectedNumArgs} ${wording}, got ${actualNumArgs}`,
      );
    }
  }
};
