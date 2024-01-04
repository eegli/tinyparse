import { ValidationError } from './error';
import { CountExpression, PositionalArgs } from './types';
import Utils from './utils';

export class ArgvTransformer {
  // Double-digit symbols must come before single-digit symbols!
  private static allowedSymbols = ['<=', '>=', '=', '>', '<', '*'] as const;
  public static transform(
    argv: string[],
  ): [Map<string, string | boolean>, PositionalArgs] {
    const flagMap = new Map<string, string | boolean>();

    const positionals: string[] = [];
    let isPositional = true;

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      // A short flag is also a long flag
      const isShortFlag = Utils.isShortFlag(arg);

      if (!isShortFlag && isPositional) {
        positionals.push(arg);
        // Collect positionals
        continue;
      }

      isPositional = false;

      if (!isShortFlag) continue;

      const splitted = Utils.splitAtFirst(arg, '=');

      const [flag] = splitted;
      let [, flagVal] = splitted;

      if (!flagVal) flagVal = argv[i + 1];

      // Assume boolean flag
      if (!flagVal || Utils.isShortFlag(flagVal)) {
        flagMap.set(flag, true);
        // Assume string or number
      } else {
        flagMap.set(flag, flagVal);
      }
    }

    return [flagMap, positionals];
  }

  static parsePositionalCountExpr(expr: CountExpression) {
    const symbolIdx = ArgvTransformer.allowedSymbols.findIndex((sym) =>
      expr.startsWith(sym),
    );
    const errorMessage = `Invalid count symbol: ${expr}`;

    if (symbolIdx === -1) throw new Error(errorMessage);

    const symbol = ArgvTransformer.allowedSymbols[symbolIdx];

    if (symbol === '*') return { count: Infinity, symbol };

    // No count specified
    if (expr.length === symbol.length) throw new Error(errorMessage);

    const count = Number(expr.slice(symbol.length));

    // Count is specified but not a positive integer
    if (isNaN(count) || count < 0) throw new Error(errorMessage);

    return { count, symbol };
  }

  public static validatePositionals(
    positionals: PositionalArgs,
    countExpr: ReturnType<typeof ArgvTransformer.parsePositionalCountExpr>,
  ): void {
    const assertOrThrow = (isValid: boolean, msg: string) => {
      if (!isValid) throw new ValidationError(msg);
    };

    const length = positionals.length;
    const { count: desiredLength, symbol } = countExpr;
    switch (symbol) {
      case '*':
        return;
      case '=':
        return assertOrThrow(
          length === desiredLength,
          `Expected ${desiredLength} positional arguments, got ${length}`,
        );
      case '>':
        return assertOrThrow(
          length > desiredLength,
          `Expected more than ${desiredLength} positional arguments, got ${length}`,
        );
      case '<':
        return assertOrThrow(
          length < desiredLength,
          `Expected less than ${desiredLength} positional arguments, got ${length}`,
        );
      case '>=':
        return assertOrThrow(
          length >= desiredLength,
          `Expected at least ${desiredLength} positional arguments, got ${length}`,
        );
      case '<=':
        return assertOrThrow(
          length <= desiredLength,
          `Expected at most ${desiredLength} positional arguments, got ${length}`,
        );
    }
  }
}
