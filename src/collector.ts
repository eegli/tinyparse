import { WithPositionalArgs } from './types';

export class Collector<T> {
  constructor(private readonly defaults: T) {}
  public collectWithPositionals<P extends string[]>(
    positionals: string[],
  ): WithPositionalArgs<T, P> {
    return {
      ...this.collect(),
      _: positionals as P,
    };
  }

  public collect(): T {
    return this.defaults;
  }
}
