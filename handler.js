'use strict';

/**
 * native deps
 */
const { promisify } = require('util');

/**
 * npm deps
 */
const got = require('got');
const Twit = require('twit');
const Entities = require('html-entities').AllHtmlEntities;
const { ungzip } = require('node-gzip');
const entities = new Entities();

/**
 * Environment handling
 */
const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN: access_token,
  ACCESS_TOKEN_SECRET: access_token_secret,
  NODE_ENV,
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Sitemap Handling
 */
const SITEMAP_URL =
  'https://developer.mozilla.org/sitemaps/en-US/sitemap.xml.gz';
const WEB_PATH = 'https://developer.mozilla.org/en-US/docs/Web';

/**
 * Twitter handling
 */
const twitter = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
});

const tweet = promisify(twitter.post.bind(twitter));

/**
 * Utilities
 */
const onlyAllowWebUrls = (url) => url.startsWith(WEB_PATH);

/**
 * Get all MDN Web Documentation URLs
 *   - fetch MDN sitemap
 *   - unzip response
 *   - filter out non-web-documentation URLs
 *
 * @returns {Promise} A random URL from the MDN sitemap
 */
const getWebDocUrls = async () => {
  const SITEMAP_URL_REGEX = /<loc>(.*?)<\/loc>/g;
  const { body } = await got(SITEMAP_URL, {
    responseType: 'buffer',
  });
  const sitemap = (await ungzip(body)).toString();
  const allDocUrls = [];

  let match;
  while ((match = SITEMAP_URL_REGEX.exec(sitemap))) {
    allDocUrls.push(match[1]);
  }

  const webDocUrls = allDocUrls.filter(onlyAllowWebUrls);

  return webDocUrls;
};

/**
 * Read out <h1> and meta description for URL
 * We use the <h1> rather than the <title> as the title is a little more verbose
 *
 * @param {String} url
 * @returns {Promise} Array of h1 and description for the documented URL
 */
const getTitleAndDescription = async (url) => {
  const DESCRIPTION_REGEX = /<meta name="description" content="(.*?)">/i;
  const TITLE_REGEX = /<h1>(.*?)<\/h1>/i;
  const { body: doc } = await got(url);

  let match = doc.match(TITLE_REGEX);

  if (!match) {
    return [null, null];
  }

  let [, title] = match;

  if (title.length > 40) {
    title = title.slice(0, 40) + '…';
  }

  match = doc.match(DESCRIPTION_REGEX);

  if (!match) {
    return [null, null];
  }

  let [, description] = match;

  return [entities.decode(title), entities.decode(description)];
};

/**
 * Get appropriate hashtags for the URL
 * (probably can be way smarter and better)
 *
 * @param {String} url
 * @returns {Array} fitting hashtags for the URL
 */
const getHashtags = (url) => {
  const hashtags = ['#webdev'];
  const SECTION_REGEX = /Web\/(.*?)\//;
  const [, section] = url.match(SECTION_REGEX);
  const hashtagWorthySections = [
    'CSS',
    'Accessibility',
    'JavaScript',
    'HTTP',
    'HTML',
    'SVG',
  ];

  if (hashtagWorthySections.includes(section)) {
    hashtags.push(`#${section}`);
  }

  return hashtags;
};

/**
 *
 * @param {String} url
 * @returns {Promise}
 */
const sendTweet = async ({ url, title, description }) => {
  const hashtags = getHashtags(url).join(' ');

  // Tweets can be 280 characters.
  // Emojis take 2 characters so "🦖 Random MDN:  🦖" is 18 charcters, and urls take 23 characters
  // So with new lines, we need 47 chars + title + hashtaghs. Let's leave space for 60 to be sure
  let maxDescriptionLength = 280 - title.length - hashtags.length - 60;
  if (description.length > maxDescriptionLength) {
    description = description.slice(0, maxDescriptionLength) + '…';
  }

  const status = `🦖 Random MDN: ${title} 🦖\n\n${url}\n\n${description}\n\n${hashtags}`;

  if (IS_PRODUCTION) {
    await tweet('statuses/update', { status });
  } else {
    console.log('Running in dev mode. Following tweet would be sent');
    // Calculate length after converting the URL to fixed 23 length:
    const length = status.length - url.length + 23;
    console.log(`Tweet length: ${length}`);
    console.log(status);
  }
};

module.exports.tweet = async () => {
  try {
    let urlToTweet;
    let description;
    let title;

    const webDocUrls = await getWebDocUrls();

    // loop over it because many pages don't include a description
    while (!title || !description) {
      // grab a random URL
      urlToTweet = webDocUrls[Math.floor(webDocUrls.length * Math.random())];
      [title, description] = await getTitleAndDescription(urlToTweet);
    }

    await sendTweet({ url: urlToTweet, title, description });
  } catch (e) {
    console.error(e);
  }
};
