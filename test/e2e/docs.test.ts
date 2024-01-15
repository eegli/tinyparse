import { Parser } from '../../src';
import { SubcommandArgs } from '../../src/types';

test('todo, docs', () => {
  const handleBar = (params: SubcommandArgs<typeof commands>) => {
    expect(params.args).toEqual(['barArg']);
    expect(params.options.foo).toBe('fooValue');
    expect(params.globals.database).toBe('db');
  };

  const commands = new Parser()
    .option('foo', {
      longFlag: '--foo',
      defaultValue: 'fooDefault',
    })
    .globals({
      database: 'db',
    });

  commands
    .subcommand('bar', {
      args: 'any',
      handler: handleBar,
    })
    .defaultHandler()
    .parse(['bar', 'barArg', '--foo', 'fooValue']);
});
