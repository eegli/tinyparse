import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  FlagOptionsMap,
  FlagValueRecord,
  MetaOptions,
} from './types';

export interface CommonConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  meta: MetaOptions;
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  globalSetter: (options: O) => G;
  defaultHandler: DefaultHandler<O, G>;
}
