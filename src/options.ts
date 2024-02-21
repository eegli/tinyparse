import { HelpPrinter } from './help';
import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  FlagOptionsMap,
  FlagValueRecord,
} from './types';

export interface CommandConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  helpIdentifiers: Set<string>;
  globalSetter: (options: O) => G;
  defaultHandler: DefaultHandler<O, G>;
}

export interface ParserConfig<O extends FlagValueRecord, G extends AnyGlobal>
  extends CommandConfig<O, G> {
  helpPrinter: HelpPrinter<O, G>;
}
