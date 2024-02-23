import { Parser } from './parser';
import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  ErrorHandler,
  FlagOptionsMap,
  FlagValueRecord,
  MetaOptions,
} from './types';

export interface CommonConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  meta: MetaOptions;
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  parsers: Map<string, Parser<FlagValueRecord, AnyGlobal>>;
  globalSetter: (options: O) => G;
  defaultHandler: DefaultHandler<O, G>;
  errorHandler?: ErrorHandler;
}
