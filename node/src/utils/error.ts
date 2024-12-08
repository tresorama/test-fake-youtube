import { IS_DEVELOPMENT } from "@/constants";
import { type Logger } from "@/utils//logger";


export const parseError = <E = unknown>(error: E) => {

  if (error instanceof Error) {
    const name = error.name;
    const message = error.message;
    const stack = error.stack;
    const errorInstance = error;
    return { name, message, stack, errorInstance };
  }

  return {
    name: 'UnknownError',
    message: 'Error is throwed but is not instanceof Error',
    stack: 'Unknown error',
    errorInstance: error
  };
};

export const printError = <E = unknown>(error: E, logger: Logger) => {
  const parsedError = parseError(error);
  logger.error(`Name: ${parsedError.name}`);
  logger.error(`Message: ${parsedError.message}`);
  if (IS_DEVELOPMENT) {
    logger.error(`Stack: ${parsedError.stack}`);
  }
}; 