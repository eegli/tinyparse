import { WithPositionalArgs } from './types';

export class Collector<T> {
  constructor(private readonly defaults: T) {}
  public collectWithPositionals(positionals: string[]): WithPositionalArgs<T> {
    return {
      ...this.collect(),
      _: positionals,
    };
  }

  public collect(): T {
    return this.defaults;
  }
}
