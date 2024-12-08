import expressWinston from 'express-winston';
import { createFinalKey } from './utils.create-final-key';
import { createSharedTransports } from './utils.shared-transports';

export const createExpressMiddlewareRequestLogger = (key: string) => {

  const finalKey = createFinalKey(key);
  const transports = createSharedTransports({ finalKey });

  const middlewareLogger = expressWinston.logger({
    transports: transports,
    level: 'http',
    // transports: [new winston.transports.Console()],
    // format: winston.format.combine(
    //   winston.format.colorize(),
    //   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    //   winston.format.cli(),
    // ),
    // // meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    // // expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    // ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  });

  return middlewareLogger;
};