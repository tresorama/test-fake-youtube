import winston from 'winston';
import { formatDate } from 'date-fns';
import chalk from "chalk";

import { IS_DEVELOPMENT } from '@/constants';
import { createFinalKey } from './utils.create-final-key';
import { getSymbolOfObject } from '../get-symbol-of-object';

/*
log levels

error
warn
info
http
verbose
debug
silly
*/


// define it here so every instance of the logger will use the same path
const LOG_FILE_PATH = `_logs/${formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss')}--${IS_DEVELOPMENT ? 'DEV' : 'PROD'}.log`;

// main function
type CreateSharedTransportsOptions = {
  finalKey: ReturnType<typeof createFinalKey>;
};
export const createSharedTransports = ({ finalKey }: CreateSharedTransportsOptions) => {
  return [
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => {
          const fullMsg = `${info.timestamp} [${info.level}] : ${finalKey.console} ${info.message}`;

          // less important log level will be dimmed
          const dimmedLevels = ["silly", "verbose", "debug"];
          if (dimmedLevels.includes(getSymbolOfObject(info, 'Symbol(level)'))) {
            return chalk.dim(fullMsg);
          }

          return fullMsg;
        })
      )
    }),
    new winston.transports.File({
      filename: LOG_FILE_PATH,
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => {
          const fullMsg = `${info.timestamp} [${info.level}] : ${finalKey.file} ${info.message}`;
          return fullMsg;
        })
      ),
    }),
  ];
};