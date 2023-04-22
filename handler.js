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
const { getTitleAndDescription } = require('./helpers');

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
  'https://developer.mozilla.org/sitemaps/en-us/sitemap.xml.gz';
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
    headers: {
      'accept-encoding': 'gzip',
    },
  });

  const sitemap = body.toString();
  const allDocUrls = [];

  let match;
  while ((match = SITEMAP_URL_REGEX.exec(sitemap))) {
    allDocUrls.push(match[1]);
  }

  const webDocUrls = allDocUrls.filter(onlyAllowWebUrls);

  return webDocUrls;
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
 * @param {Object} url
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
