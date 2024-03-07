import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  ErrorHandler,
  FlagOptionsMap,
  FlagValueRecord,
  MetaOptions,
  SubparserOptionsMap,
} from './types/internals';

interface CoreConfig {
  meta: MetaOptions;
  options: FlagOptionsMap;
  commands: CommandOptionsMap;
  parsers: SubparserOptionsMap;
}

export interface CommonConfig extends CoreConfig {
  defaultHandler: DefaultHandler<FlagValueRecord, AnyGlobal>;
  globalSetter?: (options: FlagValueRecord) => AnyGlobal | Promise<AnyGlobal>;
  errorHandler?: ErrorHandler;
}

export interface HelpPrinterConfig extends Partial<CoreConfig> {}
