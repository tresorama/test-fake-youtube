import winston, { http } from 'winston';
import { createFinalKey } from './utils.create-final-key';
import { createSharedTransports } from './utils.shared-transports';


// logger cretator 

export type Logger = ReturnType<typeof createLogger>;

export const createLogger = (key: string | string[]) => {

  const finalKey = createFinalKey(key);
  const transports = createSharedTransports({ finalKey });

  /// init winston logger
  const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: transports,
  });

  return {
    error: (message: string) => logger.error(message),
    warn: (message: string) => logger.warn(message),
    info: (message: string) => logger.info(message),
    http: (message: string) => logger.http(message),
    verbose: (message: string) => logger.verbose(message),
    debug: (message: string) => logger.debug(message),
    silly: (message: string) => logger.silly(message),
  };
};

export const wrapLogger = (logger: Logger, logPrefix: string): Logger => {
  return {
    error: (message: string) => logger.error(`${logPrefix} ${message}`),
    warn: (message: string) => logger.warn(`${logPrefix} ${message}`),
    info: (message: string) => logger.info(`${logPrefix} ${message}`),
    http: (message: string) => logger.http(`${logPrefix} ${message}`),
    verbose: (message: string) => logger.verbose(`${logPrefix} ${message}`),
    debug: (message: string) => logger.debug(`${logPrefix} ${message}`),
    silly: (message: string) => logger.silly(`${logPrefix} ${message}`),
  };
};


// other log utilities
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue; };
export const loggerJson = (json: JsonValue) => console.dir(json, { depth: null });
