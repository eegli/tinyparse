import { describe, expect, test } from 'tstyche';
import { CommandBuilder } from '../../src';

describe('builder', () => {
  const subcommand = new CommandBuilder()
    .flag('foo', {
      defaultValue: 'default',
      longFlag: '--foo',
    })
    .flag('bar', {
      defaultValue: 'default',
      longFlag: '--bar',
    }).subcommand;
  subcommand;

  type HandlerParams = Parameters<typeof subcommand>[1]['handler'];
  type HandlerFlagParams = Parameters<HandlerParams>[0];

  test('subcommand flags', () => {
    expect<HandlerFlagParams>().type.toMatch<{
      foo: string;
      bar: string;
    }>();
  });
});
