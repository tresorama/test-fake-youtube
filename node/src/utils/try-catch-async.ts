import { parseError, printError } from "@/utils//error";
import type { Logger } from "@/utils/logger";

type TryCatchAsyncFunction = <SuccessValue>(fn: () => Promise<SuccessValue>) => Promise<
  | {
    ok: true,
    data: SuccessValue;
  }
  | {
    ok: false,
    error: {
      original: unknown,
      parse: () => ReturnType<typeof parseError>,
      print: (logger: Logger) => ReturnType<typeof printError>,
    };
  }
>;

/** Function that try catch an async function And returns always an object.
 * If success the object will have `data` property.
 * If error the object will have `error` and `errorParsed` properties.
 */
export const tryCatchAsync: TryCatchAsyncFunction = async (fn) => {
  try {
    const data = await fn();
    return {
      ok: true,
      data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        original: error,
        parse: () => parseError(error),
        print: (logger: Logger) => printError(error, logger)
      }
    };
  }
};