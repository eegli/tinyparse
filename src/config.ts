import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  FlagOptionsMap,
  FlagValueRecord,
  HelpOptions,
} from './types';

export interface CommonConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  help?: HelpOptions;
  globalSetter: (options: O) => G;
  defaultHandler: DefaultHandler<O, G>;
}
