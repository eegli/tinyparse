import {
  AnyGlobal,
  CommandOptionsMap,
  DefaultHandler,
  ErrorHandler,
  FlagOptionsMap,
  FlagValueRecord,
  MetaOptions,
  SubparserOptionsMap,
} from './types';

export interface CommonConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  meta: MetaOptions;
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  parsers: SubparserOptionsMap<FlagValueRecord, AnyGlobal>;
  globalSetter: (options: O) => G;
  defaultHandler: DefaultHandler<O, G>;
  errorHandler?: ErrorHandler;
}

export type HelpPrinterConfig = Partial<
  Pick<
    CommonConfig<FlagValueRecord, AnyGlobal>,
    'meta' | 'options' | 'commands' | 'parsers'
  >
>;
