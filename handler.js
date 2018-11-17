'use strict';

/**
 * native deps
 */
const { promisify } = require('util');

/**
 * npm deps
 */
const got = require('got');
const stripTags = require('striptags');
const Twit = require('twit');

/**
 * URL Handling
 */
const SITEMAP_URL = 'https://developer.mozilla.org/sitemaps/en-US/sitemap.xml';
const WEB_PATH = 'https://developer.mozilla.org/en-US/docs/Web';
const SITEMAP_URL_REGEX = /<loc>(.*?)<\/loc>/g;

/**
 * Twitter handling
 */

const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN: access_token,
  ACCESS_TOKEN_SECRET: access_token_secret
} = process.env;

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
 *
 * @param {String} url
 * @returns {Promise}
 */
const sendTweet = async url => {
  const description = await getDescription(url);
  const status = `🦖 Random MDN 🦖\n\n${description}\n${url}`;
  await tweet('statuses/update', { status });
};

module.exports.tweet = async () => {
  try {
    const urlToTweet = await getUrlToTweet();
    await sendTweet(urlToTweet);
  } catch (e) {
    console.error(e);
  }
};
