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

interface CoreConfig<O extends FlagValueRecord, G extends AnyGlobal> {
  meta: MetaOptions;
  options: FlagOptionsMap;
  commands: CommandOptionsMap<O, G>;
  parsers: SubparserOptionsMap;
}

export interface CommonConfig<O extends FlagValueRecord, G extends AnyGlobal>
  extends CoreConfig<O, G> {
  defaultHandler: DefaultHandler<O, G>;
  globalSetter?: (options: O) => G | Promise<G>;
  errorHandler?: ErrorHandler;
}

export interface HelpPrinterConfig<
  O extends FlagValueRecord,
  G extends AnyGlobal,
> extends Partial<CoreConfig<O, G>> {}
