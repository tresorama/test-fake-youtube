import chalk from "chalk";
import { createGetRandomArrayItemAlwaysDifferent } from "@/utils/random";
import { randomEmojiCreator } from "./utils.emoji-generator";

const consoleRandomColor = createGetRandomArrayItemAlwaysDifferent(['green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const);

/** Create a final string for the "key" part of the logger */
export const createFinalKey = (key: string | string[]) => {

  const consoleColor = consoleRandomColor.getItem();

  return {
    console: [
      // as first key add an emoji
      randomEmojiCreator.generateOne().content,
      // then add cnsumers keys
      ...(Array.isArray(key) ? key : [key]).map(k =>
        chalk[consoleColor].bold(`[${k}]`)
      ),
      // // then add timestamp that rapresent loggger creation time (not log line execution)
      // chalk[consoleColor].dim.italic(
      //   `[init@ ${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}]`
      // ),
    ].join(' '),
    file: [
      // as first key add an emoji
      randomEmojiCreator.generateOne().content,
      // then add cnsumers keys
      ...(Array.isArray(key) ? key : [key]).map(k =>
        `[${k}]`
      ),
      // // then add timestamp that rapresent loggger creation time (not log line execution)
      // `[init@ ${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}]`,
    ].join(' '),
  };
};