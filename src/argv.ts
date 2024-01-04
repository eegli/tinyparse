import { ValidationError } from './error';
import {
  CountExpression,
  UniversalCountSymbol,
  EqCountSymbol,
  PositionalArgs,
} from './types';
import Utils from './utils';

export class ArgvTransformer {
  // Double-digit symbols must come before single-digit symbols!
  private static allowedSymbols: (UniversalCountSymbol | EqCountSymbol)[] = [
    '<=',
    '>=',
    '=',
    '*',
  ] as const;

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

    if (symbol === '*') return { count: -1, symbol };

    // No count specified
    if (expr.length === symbol.length) throw new Error(errorMessage);

    const expectedNumPosArgs = Number(expr.slice(symbol.length));

    // Count is specified but not a positive integer
    if (isNaN(expectedNumPosArgs) || expectedNumPosArgs < 0) {
      throw new Error(errorMessage);
    }

    return { expectedNumPosArgs, symbol };
  }

  public static validatePositionals(
    positionals: PositionalArgs,
    countExpr: ReturnType<typeof ArgvTransformer.parsePositionalCountExpr>,
  ): void {
    if (countExpr.symbol === '*') return;

    const receivedNumPosArgs = positionals.length;
    const { expectedNumPosArgs, symbol } = countExpr;

    const throwIfNot = (
      isValid: boolean,
      quantity?: 'at least' | 'at most',
    ) => {
      if (isValid) return;
      let errorMessage = 'Invalid number of positional arguments: Expected ';
      if (quantity) errorMessage += `${quantity} `;
      errorMessage += `${expectedNumPosArgs}, got ${receivedNumPosArgs}`;
      throw new ValidationError(errorMessage);
    };

    switch (symbol) {
      case '=':
        return throwIfNot(receivedNumPosArgs === expectedNumPosArgs);
      case '>=':
        return throwIfNot(receivedNumPosArgs >= expectedNumPosArgs, 'at least');
      case '<=':
        return throwIfNot(receivedNumPosArgs <= expectedNumPosArgs, 'at most');
    }
  }
}
