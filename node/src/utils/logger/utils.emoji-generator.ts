import getRandomEmoji from '@sefinek/random-emoji';

export const randomEmojiCreator = {
  emojiCreatedNames: [] as ReturnType<typeof getRandomEmoji.emojis>['name'][],
  /** Generate a random emoji, that is not already used */
  generateOne: () => {
    while (true) {
      const outputEmoji = getRandomEmoji.emojis();
      const isAlreadyUsed = randomEmojiCreator.emojiCreatedNames.includes(outputEmoji.name);
      if (!isAlreadyUsed) {
        randomEmojiCreator.emojiCreatedNames.push(outputEmoji.name);
        return outputEmoji;
      }
    }
  }
};