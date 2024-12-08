import express from "express";
import { addRoutes } from './add-routes';
import { createLogger } from "@/utils/logger";
import { createExpressMiddlewareRequestLogger } from "@/utils/logger/middleware.logger";

// server initializer
export type CreateApiServerOptions = {
  /** Port used by the server */
  port: number,
};

export const createApiServer = (options: CreateApiServerOptions) => {

  // init logger
  const logger = createLogger('main');

  // ini server
  const app = express();

  // init middlewares
  app.use(createExpressMiddlewareRequestLogger('main - req'));

  // init routes
  addRoutes({ app, options, logger });

  // Avvia il server
  app.listen(options.port, () => {
    logger.info(`API server running on http://localhost:${options.port}`);
  });

};



