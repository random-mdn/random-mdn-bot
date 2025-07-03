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
    const bskyBotRes = await BskyBot.run(article, bskyBotOptions);
    console.debug(`[${new Date().toISOString()}]:`, bskyBotRes);
  } catch (error) {
    console.error(error);
  }
}
