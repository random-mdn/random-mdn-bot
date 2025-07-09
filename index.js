import { parseArgs } from 'node:util';
import BskyBot from './lib/bsky-bot.js';
import { getRandomArticle } from './lib/mdn-article.js';

const { values: parsedArgs } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'dry-run': {
      type: 'boolean',
      default: false,
    },
  },
});

const bskyBotOptions = {
  dryRun: parsedArgs['dry-run'],
  postTemplateFn: (data) =>
    `🦖 Random MDN: ${data.title} 🦖\n\n${data.url}\n\n${data.description}\n\n${data.hashtags?.join(' ')}`,
};

await run();

async function run() {
  try {
    const article = await getRandomArticle();

    // Bluesky posts can be 300 characters.
    // Emojis take 2 characters so "🦖 Random MDN:  🦖" is 18 charcters, and urls take 37 characters
    // So with new lines (6), we need 61 chars + title + hashtags. Let's leave space for 70 to be sure.
    let maxDescriptionLength = 300;
    maxDescriptionLength -= 70;
    maxDescriptionLength -= article.title.length;
    maxDescriptionLength -= article.hashtags.join(' ').length;

    if (article.description.length > maxDescriptionLength) {
      article.description = `${article.description.slice(0, maxDescriptionLength)}…`;
    }

    // Post the article to Bluesky
    const bskyBotRes = await BskyBot.run(article, bskyBotOptions);
    console.debug(`[${new Date().toISOString()}]:`, bskyBotRes);
  } catch (error) {
    console.error(error);
  }
}
