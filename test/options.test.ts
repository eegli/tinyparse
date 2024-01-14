import { CommandBuilder } from '../src/commands';
import { OptionBuilder } from '../src/options';

describe('options builder', () => {
  test('builds command builder', () => {
    const commandBuilder = new OptionBuilder().build();
    expect(commandBuilder).toBeInstanceOf(CommandBuilder);
  });
  test('throws for flags that are declared twice', () => {
    expect(() => {
      new OptionBuilder()
        .flag('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .flag('foo', {
          defaultValue: 'default',
          longFlag: '--foo',
        })
        .build();
    }).toThrow('Flag foo already exists');
  });
});
