import { AtpAgent, RichText } from '@atproto/api';
import { bskyAccount, bskyService } from './config.js';

export default class BskyBot {
  #agent;

  static defaultOptions = {
    service: bskyService,
    dryRun: false,
  };

  constructor(service) {
    this.#agent = new AtpAgent({ service });
  }

  login(loginOpts) {
    return this.#agent.login(loginOpts);
  }

  /**
   *
   * @param {Object} data
   * @param {Function} textTemplate
   * @returns
   */
  async post(data, templateFn = (_) => '') {
    let richText = new RichText({
      text: templateFn(data),
    });

    if (richText.graphemeLength > 300) {
      richText = new RichText({
        text: `${richText.unicodeText.slice(0, 300)}…`,
      });
    }

    await richText.detectFacets(this.#agent);

    const embedCard = await getBskyEmbedCard(data, this.#agent);
    const record = {
      $type: 'app.bsky.feed.post',
      text: richText.text,
      facets: richText.facets,
      embed: embedCard,
      createdAt: new Date().toISOString(),
      langs: ['en'],
    };

    console.debug('Posting record:', record);

    return this.#agent.post(record);
  }

  static async run(data, botOptions) {
    const { service, postTemplateFn, dryRun } = botOptions
      ? Object.assign({}, BskyBot.defaultOptions, botOptions)
      : BskyBot.defaultOptions;

    const bot = new BskyBot(service);
    await bot.login(bskyAccount);

    if (!dryRun) {
      // post the new article
      const res = await bot.post(data, postTemplateFn);
      return res;
    }

    return { dryRun: true, data, post: postTemplateFn(data) };
  }
}

/**
 *
 * @param {Object} data
 * @param {String} data.url
 * @param {String} data.title
 * @param {String} data.description
 * @param {String} data.image
 * @param {AtpAgent} agent
 * @returns
 */
async function getBskyEmbedCard(data, agent) {
  if (!data || !agent) return;

  try {
    const blob = await fetch(data?.image).then((r) => r.blob());
    const { data: thumb } = await agent.uploadBlob(blob);

    return {
      $type: 'app.bsky.embed.external',
      external: {
        uri: data.url,
        title: data.title,
        description: data.description,
        thumb: thumb.blob,
      },
    };
  } catch (error) {
    console.error('Error fetching embed card:', error);
    return;
  }
}
