import { decode } from 'html-entities';

/**
 * Sitemap Handling
 */
const SITEMAP_URL = 'https://developer.mozilla.org/sitemaps/en-us/sitemap.xml.gz';
const WEB_PATH = 'https://developer.mozilla.org/en-US/docs/Web';

/**
 * Utilities
 */
const onlyAllowWebUrls = (url) => url.startsWith(WEB_PATH);

/**
 * Get a random MDN web documentation article (url with metadata)
 * @returns {Promise} A random article from the MDN sitemap
 */
export const getRandomArticle = async () => {
  try {
    let url;
    let metadata;

    const webDocUrls = await getWebDocUrls();

    // loop over it because many pages don't include a description
    while (!metadata?.title || !metadata?.description) {
      // grab a random URL
      url = webDocUrls[Math.floor(webDocUrls.length * Math.random())];
      metadata = await getArticleMetadata(url);
    }
    return { url, ...metadata };
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get all MDN Web Documentation URLs
 * - fetch MDN sitemap
 * - filter out non-web-documentation URLs
 *
 * @returns {Promise} Array of all web documentation URLs from the MDN sitemap
 */
export const getWebDocUrls = async () => {
  const SITEMAP_URL_REGEX = /<loc>(.*?)<\/loc>/g;
  const response = await fetch(SITEMAP_URL, { headers: { 'accept-encoding': 'gzip' } });
  const sitemap = await response.text();
  return Array.from(sitemap.matchAll(SITEMAP_URL_REGEX))
    .map(([_, url]) => url)
    .filter(onlyAllowWebUrls);
};

/**
 * Read out <h1> and meta description for URL and check if the url holds a deprecated entry
 * We use the <h1> rather than the <title> as the title is a little more verbose
 *
 * @param {String} url
 * @returns {Promise} Object of metadata for the documented URL
 */
export const getArticleMetadata = async (url) => {
  const DESCRIPTION_REGEX = /<meta name="description" content="([^"]+?)"[^>]*>/is;
  const TITLE_REGEX = /<h1>(.*?)<\/h1>/i;
  const IMAGE_REGEX = /<meta name="og:image" content="(.*?)"[^>]*>/i;
  // to not rely on exact words this matches the deprecation container
  const DEPRECATION_REGEX = /class="notecard deprecated"/;

  const response = await fetch(url);
  const doc = await response.text();

  if (DEPRECATION_REGEX.test(doc)) return;

  const metadata = {
    description: doc.match(DESCRIPTION_REGEX)?.[1],
    // Strip html comments (<!--lit-part-->...<!--/lit-part-->)
    title: doc.match(TITLE_REGEX)?.[1]?.replace(/<!--[\s\S]*?-->/g, ''),
    hashtags: getHashtags(url),
    image: doc.match(IMAGE_REGEX)?.[1],
  };

  // Limit `title` to 40 characters
  if (metadata.title.length > 40) {
    metadata.title = `${metadata.title.slice(0, 40)}…`;
  }

  metadata.title = decode(metadata.title);
  metadata.description = decode(metadata.description);

  return metadata;
};

/**
 * Get appropriate hashtags for the URL
 * (probably can be way smarter and better)
 *
 * @param {String} url
 * @returns {Array} fitting hashtags for the URL
 */
export const getHashtags = (url) => {
  const hashtags = ['#webdev'];
  const SECTION_REGEX = /Web\/(.*?)\//;
  const [, section] = url.match(SECTION_REGEX);
  const hashtagWorthySections = ['CSS', 'Accessibility', 'JavaScript', 'HTTP', 'HTML', 'SVG'];

  if (hashtagWorthySections.includes(section)) {
    hashtags.push(`#${section}`);
  }

  return hashtags;
};
