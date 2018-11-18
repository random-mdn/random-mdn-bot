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

/**
 * Environment handling
 */
const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN: access_token,
  ACCESS_TOKEN_SECRET: access_token_secret,
  NODE_ENV
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Sitemap Handling
 */
const SITEMAP_URL = 'https://developer.mozilla.org/sitemaps/en-US/sitemap.xml';
const WEB_PATH = 'https://developer.mozilla.org/en-US/docs/Web';

/**
 * Twitter handling
 */
const twitter = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret
});

const tweet = promisify(twitter.post.bind(twitter));

/**
 * Utilities
 */
const onlyAllowWebUrls = url => url.startsWith(WEB_PATH);

/**
 * Get URL to tweet
 *   - fetch MDN sitemap
 *   - parse it
 *   - grab a random URL
 *
 * @returns {Promise} A random URL from the MDN sitemap
 */
const getUrlToTweet = async () => {
  const SITEMAP_URL_REGEX = /<loc>(.*?)<\/loc>/g;
  const { body: sitemap } = await got(SITEMAP_URL);
  const allDocUrls = [];

  let match;
  while ((match = SITEMAP_URL_REGEX.exec(sitemap))) {
    allDocUrls.push(match[1]);
  }

  const webDocUrls = allDocUrls.filter(onlyAllowWebUrls);
  const urlToTweet = webDocUrls[Math.floor(webDocUrls.length * Math.random())];

  return urlToTweet;
};

/**
 * Read out meta description for URL
 *
 * @param {String} url
 * @returns {Promise} description for the documented URL
 */
const getDescription = async url => {
  const DESCRIPTION_REGEX = /<meta name="description" content="(.*?)">/;
  const { body: doc } = await got(url);

  let [, description] = doc.match(DESCRIPTION_REGEX);

  if (description.length > 200) {
    description = description.slice(0, 200) + '…';
  }

  return description;
};

/**
 * Get appropriate hashtags for the URL
 * (probably can be way smarter and better)
 *
 * @param {String} url
 * @returns {Array} fitting hashtags for the URL
 */
const getHashtags = url => {
  const hashtags = ['#webdev'];
  const SECTION_REGEX = /Web\/(.*?)\//;
  const [, section] = url.match(SECTION_REGEX);
  const hashtagWorthySections = [
    'CSS',
    'Accessibility',
    'JavaScript',
    'HTTP',
    'HTML'
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
const sendTweet = async url => {
  const description = await getDescription(url);
  const hashtags = getHashtags(url);
  const status = `🦖 Random MDN 🦖\n\n${description} ${hashtags.join(
    ' '
  )}\n${url}`;

  if (IS_PRODUCTION) {
    await tweet('statuses/update', { status });
  } else {
    console.log('Running in dev mode. Following tweet would be sent');
    console.log(`Tweet length: ${status.length}`);
    console.log(status);
  }
};

module.exports.tweet = async () => {
  try {
    const urlToTweet = await getUrlToTweet();
    await sendTweet(urlToTweet);
  } catch (e) {
    console.error(e);
  }
};
