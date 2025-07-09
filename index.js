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
    let maxDescriptionLength = 300;

    // Let's subtract the evaluated `postTemplateFn` with an empty
    // description to see how many characters we have left.
    maxDescriptionLength -= bskyBotOptions.postTemplateFn({ ...article, description: '' }).length;

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
